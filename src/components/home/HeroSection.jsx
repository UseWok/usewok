import { useState, useRef, useEffect } from 'react';
import DragDropOverlay from '@/components/DragDropOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import ContextualUpsell from '@/components/upsell/ContextualUpsell';
import { Plus, Mic, X, FileText, Bot, ChevronDown, Wifi, WifiOff, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { useLanguage } from '@/lib/i18n';
import { ALL_MODES as CHAT_ALL_MODES } from '@/lib/chat-constants';
import { toast } from 'sonner';

const AGENT_IDS = ['global', 'emotions-depenses', 'wealth-strategy'];
const AGENT_META = {
  global: { emoji: '🧭', desc: 'Big picture clarity & direction' },
  'emotions-depenses': { emoji: '💚', desc: 'Mindful spending, guilt-free money' },
  'wealth-strategy': { emoji: '🚀', desc: 'Long-term wealth & freedom' }
};
const AGENT_LABEL_KEYS = { global: 'global_agent', 'emotions-depenses': 'emotions_agent', 'wealth-strategy': 'wealth_agent' };

const ALL_MODES = CHAT_ALL_MODES;


const POWER_TOPICS = [
{ label: 'Build Wealth', prompt: "I want to build serious wealth starting now. Give me a concrete 90-day action plan: exact accounts to open, what percentage to save monthly, and the single most impactful step I can take this week. No generic advice — be specific." },
{ label: 'Crush Debt', prompt: "I want to eliminate all my debt as fast as possible. Compare the avalanche vs snowball method with real numbers for my situation, and give me a realistic monthly plan to become debt-free. Which one should I choose and why?" },
{ label: 'Start Investing', prompt: "I have $500/month to invest and I'm in my 20s-30s. Tell me exactly where to put it — index funds, ETFs, allocation percentages. Explain it clearly, give me a real actionable strategy, not generic advice." },
{ label: 'Side Hustle', prompt: "Give me the 5 best side income strategies that actually work for people aged 18-35 in 2025. For each: realistic monthly earnings, time required, startup cost, and the exact first step I can take today." },
{ label: 'Retire Early', prompt: "I want to retire early using the FIRE method. Calculate how much I need to save monthly starting now, explain the 4% rule with real numbers, and give me the exact accounts and investments to prioritize. What changes move the needle most?" }];


const popAnim = {
  initial: { opacity: 0, y: -4, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.97 },
  transition: { duration: 0.1 }
};

export default function HeroSection({ agentId, onAgentChange }) {
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showExpertMenu, setShowExpertMenu] = useState(false);
  const [mode, setMode] = useState(ALL_MODES[ALL_MODES.length - 1]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const finalTranscriptRef = useRef('');
  const [userPlan, setUserPlan] = useState(null);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsTotal, setCreditsTotal] = useState(10);
  const [dailyBlocked, setDailyBlocked] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [hasInternetState, setHasInternetState] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [upsellFeature, setUpsellFeature] = useState(null);
  const dragCounterRef = useRef(0);
  const inputCardRef = useRef(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileMenuRef = useRef(null);
  const agentMenuRef = useRef(null);
  const atMenuRef = useRef(null);
  const expertMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const { t } = useLanguage();
  const AGENTS = AGENT_IDS.map((id) => ({ id, label: t(AGENT_LABEL_KEYS[id]) }));
  const effectiveAgentId = agentId || 'global';
  const lockedAgentLabel = AGENTS.find((a) => a.id === effectiveAgentId)?.label;
  const canUpload = userPlan?.file_upload || false;

  useEffect(() => {
    const savedAgent = localStorage.getItem('stensor_selected_agent');
    if (savedAgent && AGENT_IDS.includes(savedAgent)) {
      onAgentChange(savedAgent);
    }
    base44.auth.me().then((u) => {
      const plan = getUserPlan(u);
      setUserPlan(plan);
      const used = u?.credits_used || 0;
      const bonus = u?.credits_bonus || 0;
      const total = (plan.credits_limit || 10) + bonus;
      setCreditsUsed(used);
      setCreditsTotal(total);
      if (plan.daily_credits_limit > 0) {
        const todayKey = new Date().toISOString().slice(0, 10);
        const dailyUsed = (() => {try {return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}')[todayKey] || 0;} catch {return 0;}})();
        if (dailyUsed >= plan.daily_credits_limit) setDailyBlocked(true);
      }
      const best = ALL_MODES.find((m) => plan.allowed_modes.includes(m.id));
      if (best) setMode(best);
      if (plan.internet_access) {
        setHasInternetState(true);
        if (!best || best.model !== 'claude_opus_4_6') setUseWebSearch(true);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) setShowFileMenu(false);
      if (agentMenuRef.current && !agentMenuRef.current.contains(e.target)) setShowAgentMenu(false);
      if (expertMenuRef.current && !expertMenuRef.current.contains(e.target)) setShowExpertMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFileSelect = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    setShowFileMenu(false);
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const toggleRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.warn('Speech Recognition not supported');
      toast.error('Voice input not supported on this browser');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setVoiceLoading(false);
      return;
    }
    finalTranscriptRef.current = '';
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const finals = Array.from(e.results).filter((r) => r.isFinal).map((r) => r[0].transcript.trim()).join(' ');
      if (finals) finalTranscriptRef.current = finals;
    };
    rec.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      setIsRecording(false);
      setVoiceLoading(false);
    };
    rec.onend = () => {
      setIsRecording(false);
      setVoiceLoading(false);
      const raw = finalTranscriptRef.current.trim();
      if (raw) {
        const isQuestion = /^(est-ce|qu'est|pourquoi|comment|quand|où|quel|quelle|combien|qui|que )/i.test(raw);
        let text = raw.charAt(0).toUpperCase() + raw.slice(1);
        if (!'.!?'.includes(text[text.length - 1])) text += isQuestion ? ' ?' : '.';
        setQuery(text);
      }
      finalTranscriptRef.current = '';
    };
    try {
      setIsRecording(true);
      rec.start();
      recognitionRef.current = rec;
    } catch (err) {
      console.error('Failed to start recording:', err);
      setIsRecording(false);
    }
  };



  const handleFileAttach = () => {
    if (!canUpload) {setUpsellFeature('files');setShowFileMenu(false);return;}
    fileInputRef.current?.click();
    setShowFileMenu(false);
  };

  const hasInternet = hasInternetState || userPlan?.internet_access || false;

  const handleCommencer = () => {
    if (!query.trim()) return;
    const params = new URLSearchParams({ q: query, mode: mode.id, model: mode.model, webSearch: useWebSearch && hasInternet ? '1' : '0' });
    if (agentId) params.set('agent', agentId);
    navigate(`/chat?${params.toString()}`);
  };

  const hasText = query.trim().length > 0;
  const isBlocked = creditsUsed >= creditsTotal || dailyBlocked;

  return (
    <section className="max-w-2xl mx-auto text-center px-4 mt-24 md:mt-36 relative overflow-hidden">
      {/* Yuzu light glow effect - bottom right to top left */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, -30, 0], 
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: 800,
            height: 800,
            bottom: '-300px',
            right: '-300px',
            background: 'radial-gradient(circle, rgba(221,255,0,0.15) 0%, rgba(221,255,0,0.05) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.02 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-[10px] font-black tracking-[0.2em] uppercase"
        style={{ background: '#DDFF00', color: '#0A0A0A' }}>
        AI Financial Coach
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-fg mb-5 leading-[1.05]">
        Build your financial<br />freedom, today.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="text-base mb-10"
        style={{ color: 'rgba(10,10,10,0.4)' }}>
        Ask anything. Get expert-grade answers, instantly.
      </motion.p>
      





      

      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        ref={inputCardRef}
        onDragEnter={(e) => {e.preventDefault();dragCounterRef.current++;setIsDragging(true);}}
        onDragLeave={(e) => {e.preventDefault();dragCounterRef.current--;if (dragCounterRef.current <= 0) {dragCounterRef.current = 0;setIsDragging(false);}}}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {e.preventDefault();dragCounterRef.current = 0;setIsDragging(false);const dropped = Array.from(e.dataTransfer.files || []);if (dropped.length === 0) return;if (!canUpload) {setUpsellFeature('files');return;}setFiles((prev) => [...prev, ...dropped]);}}
        className="relative">



                    <DragDropOverlay visible={isDragging} canUpload={canUpload} />
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />

                    <div className="bg-white border border-black rounded-lg shadow-md overflow-visible" style={{ borderWidth: '1px' }}>
                    {files.length > 0 &&
          <div className="flex gap-2 flex-wrap p-4 pb-0">
                    {files.map((file, idx) =>
            <div key={idx} className="relative flex items-center gap-2 px-3 py-2 group bg-black/5 border border-black/8 rounded-md">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 text-fg" />
                    <span className="text-[10px] font-medium max-w-[80px] truncate text-zinc-600">{file.name}</span>
                    <button onClick={() => removeFile(idx)}
              className="w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-sm">
                    <X className="w-2 h-2" />
                    </button>
                    </div>
            )}
                    </div>
          }

                    <div className="px-4 pt-4 pb-1">
                    <textarea ref={textareaRef} value={query} onChange={handleQueryChange}
            onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault();if (!isBlocked) handleCommencer();}}}
            placeholder={isBlocked ?
            dailyBlocked ? 'Daily limit reached — come back tomorrow ✨' : 'Monthly limit reached — upgrade to continue' :
            t('hero_placeholder')}
            disabled={isBlocked}
            rows={3}
            aria-label="Your financial question"
            className="w-full resize-none bg-transparent text-sm focus:outline-none leading-relaxed disabled:opacity-40 disabled:cursor-not-allowed text-fg placeholder:text-zinc-400" />
            
                    </div>

                    <div className="flex items-center justify-between px-4 pb-4">
                    <div className="flex items-center gap-1">
                    {/* + file */}
                    <div className="relative" ref={fileMenuRef}>
                    <button onClick={() => {setShowFileMenu(!showFileMenu);setShowAgentMenu(false);}}
                aria-label="Attach file"
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors pointer-events-auto z-20 relative">
                    <Plus className="text-slate-500 lucide lucide-plus w-4 h-4" />
                    </button>
                    <AnimatePresence>
                    {showFileMenu &&
                  <motion.div {...popAnim} className="absolute bottom-full mb-2 left-0 bg-white shadow-xl p-1.5 min-w-[190px] z-50 border border-black/10 rounded-md">
                      <button onClick={handleFileAttach}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-sm transition-colors text-left hover:bg-black/5 ${canUpload ? 'text-zinc-600' : 'text-zinc-300'}`}>
                        <FileText className={`w-3.5 h-3.5 ${canUpload ? 'text-fg' : 'text-zinc-300'}`} />
                        Attach file
                        {!canUpload &&
                      <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-sm">Essential+</span>
                      }
                      </button>
                      <button
                      onClick={() => {
                        if (!hasInternet) {setUpsellFeature('internet');setShowFileMenu(false);return;}
                        setUseWebSearch((w) => !w);setShowFileMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-sm transition-colors text-left hover:bg-black/5 ${hasInternet ? useWebSearch ? 'text-green-600' : 'text-zinc-600' : 'text-zinc-300'}`}>
                        {useWebSearch && hasInternet ? <Wifi className="w-3.5 h-3.5 text-green-600" /> : <WifiOff className={`w-3.5 h-3.5 ${hasInternet ? 'text-zinc-400' : 'text-zinc-300'}`} />}
                        Web Search
                        {!hasInternet && <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 bg-muted text-zinc-400 rounded-sm">Advanced+</span>}
                        {hasInternet &&
                      <span className="ml-auto w-3.5 h-3.5 rounded-sm border flex items-center justify-center"
                      style={{ borderColor: useWebSearch ? '#16a34a' : '#ddd', background: useWebSearch ? '#16a34a' : 'transparent' }}>
                            {useWebSearch && <span className="text-white text-[8px]">✓</span>}
                          </span>
                      }
                      </button>
                    </motion.div>
                  }
                    </AnimatePresence>
                    </div>

                    {/* Agent button */}
                    <div className="relative" ref={agentMenuRef}>
                    <button onClick={() => {setShowAgentMenu(!showAgentMenu);setShowFileMenu(false);}} className="text-[hsl(var(--primary-foreground))] px-2.5 rounded-md h-8 flex items-center gap-1.5 hover:bg-black/5 transition-colors pointer-events-auto z-20 relative">
                  
                    <Bot className="text-slate-500 lucide lucide-bot w-3.5 h-3.5" />
                    <span className="text-slate-500 text-xs font-medium">{lockedAgentLabel ? lockedAgentLabel.split(' ')[0] : t('agent')}</span>
                    <ChevronDown className="w-3 h-3 text-zinc-300" />
                    </button>
                    <AnimatePresence>
                    {showAgentMenu &&
                  <motion.div {...popAnim} className="absolute bottom-full mb-2 left-0 bg-white shadow-xl p-1.5 min-w-[220px] z-50 border border-black/10 rounded-md">
                      {AGENTS.map((a) => {
                      const meta = AGENT_META[a.id] || {};
                      return (
                        <button key={a.id} onClick={() => {
                          localStorage.setItem('stensor_selected_agent', a.id);
                          onAgentChange(a.id);
                          setShowAgentMenu(false);
                        }}
                        aria-pressed={effectiveAgentId === a.id}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm transition-colors text-left ${effectiveAgentId === a.id ? 'bg-yuzu text-fg' : 'text-zinc-600 hover:bg-black/5'}`}>
                            <span className="text-base flex-shrink-0">{meta.emoji || '🤖'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight">{a.label}</p>
                              <p className="text-[10px] text-zinc-400 truncate">{meta.desc}</p>
                            </div>
                          </button>);

                    })}
                    </motion.div>
                  }
                    </AnimatePresence>
                    </div>

                    {/* Expert toggle */}
                    <div className="relative" ref={expertMenuRef}>
                      <button
                        onClick={() => {
                          if (!userPlan?.allowed_modes?.includes('ultimate')) { setUpsellFeature('expert'); return; }
                          if (mode.id === 'ultimate') {
                            setMode(ALL_MODES.find((m) => m.id === 'thinking'));
                            setShowExpertMenu(false);
                          } else {
                            setShowExpertMenu((s) => !s);
                          }
                        }}
                        className="h-7 px-2.5 flex items-center gap-1.5 rounded-sm transition-all pointer-events-auto z-20 relative"
                        style={{
                          background: mode.id === 'ultimate' ? '#0A0A0A' : 'rgba(0,0,0,0.06)',
                          border: '1px solid rgba(0,0,0,0.15)',
                        }}>
                        <span className="text-[11px] font-bold hidden sm:block" style={{ color: mode.id === 'ultimate' ? '#DDFF00' : '#555' }}>Expert</span>
                      </button>
                      <AnimatePresence>
                        {showExpertMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -4, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.97 }}
                            transition={{ duration: 0.1 }}
                            className="absolute bottom-full mb-2 left-0 bg-white shadow-xl border border-black/10 rounded-md overflow-hidden z-50 min-w-[176px]">
                            <button
                              onClick={() => {
                                setMode(ALL_MODES.find((m) => m.id === 'ultimate'));
                                setUseWebSearch(true);
                                setShowExpertMenu(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-black/5 transition-colors">
                              <div>
                                <p className="text-xs font-bold text-fg">Avec internet</p>
                                <p className="text-[10px] text-zinc-400">Recherche web en direct</p>
                              </div>
                            </button>
                            <button
                              onClick={() => {
                                setMode(ALL_MODES.find((m) => m.id === 'ultimate'));
                                setUseWebSearch(false);
                                setShowExpertMenu(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-black/5 transition-colors">
                              <div>
                                <p className="text-xs font-bold text-fg">Sans internet</p>
                                <p className="text-[10px] text-zinc-400">Analyse pure, hors ligne</p>
                              </div>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleRecording}
                      aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                      aria-pressed={isRecording}
                      className="relative w-8 h-8 flex items-center justify-center rounded-sm transition-all cursor-pointer z-20 pointer-events-auto"
                      style={{
                        background: isRecording ? '#0A0A0A' : voiceLoading ? '#0A0A0A' : 'rgba(0,0,0,0.06)',
                        border: '1.5px solid rgba(0,0,0,0.1)',
                      }}>
                      {voiceLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                          className="w-3.5 h-3.5 rounded-full border-2"
                          style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#DDFF00' }} />
                      ) : isRecording ? (
                        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 0.9 }}
                          className="w-2.5 h-2.5 rounded-full" style={{ background: '#DDFF00' }} />
                      ) : (
                        <Mic className="w-3.5 h-3.5" style={{ color: '#888' }} />
                      )}
                    </button>
                    </div>
          </div>
        </div>
      </motion.div>

      {/* Contextual upsell */}
      <AnimatePresence>
        {upsellFeature &&
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mt-3">
            <ContextualUpsell feature={upsellFeature} onDismiss={() => setUpsellFeature(null)} />
          </motion.div>
        }
      </AnimatePresence>

      {/* Blocked banner */}
      {isBlocked &&
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate('/pricing')}
      className="mt-3 w-full py-3 flex items-center justify-between px-4 cursor-pointer hover:opacity-90 transition-opacity bg-fg rounded-md">
          <p className="text-sm font-bold text-white">{dailyBlocked ? 'Daily limit reached 🌙' : 'Monthly limit reached'}</p>
          <span className="text-xs font-black px-3 py-1 bg-yuzu text-fg rounded-sm">Upgrade →</span>
        </motion.div>
      }

      <motion.button
        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.25, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        whileHover={hasText && !isBlocked ? { scale: 1.01, y: -1 } : {}}
        whileTap={hasText && !isBlocked ? { scale: 0.98 } : {}}
        onClick={handleCommencer} 
        disabled={isBlocked}
        aria-label="Start conversation"
        className={`mt-3 w-full py-3.5 font-black text-sm tracking-wide rounded-md transition-all border ${hasText && !isBlocked ? 'bg-fg text-white hover:opacity-90 cursor-pointer' : 'bg-black/8 text-zinc-400 cursor-not-allowed'}`}
        style={{ borderColor: '#0A0A0A', borderWidth: '1px' }}>
        {t('hero_start')}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6">
        <p className="text-xs mb-3 text-zinc-300">{t('hero_topics')}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {POWER_TOPICS.map((topic) =>
          <motion.button key={topic.label} onClick={() => setQuery(topic.prompt)}
          whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}
          aria-label={`Use topic: ${topic.label}`}
          className="px-3.5 py-1.5 text-xs font-medium border border-black/10 rounded-sm text-zinc-600 bg-white hover:bg-fg hover:text-white hover:border-fg transition-all">
              {topic.label}
            </motion.button>
          )}
        </div>
      </motion.div>
    </section>);

}