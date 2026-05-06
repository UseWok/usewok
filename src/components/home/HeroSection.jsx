import { useState, useRef, useEffect } from 'react';
import DragDropOverlay from '@/components/DragDropOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import ContextualUpsell from '@/components/upsell/ContextualUpsell';
import { Plus, Mic, X, FileText, Wifi, Send, Zap, ChevronDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { useLanguage } from '@/lib/i18n';
import { ALL_MODES as CHAT_ALL_MODES } from '@/lib/modes-config';
import { getStoredQuiz } from '@/components/landing/GuestQuiz';
import { toast } from 'sonner';

const ALL_MODES = CHAT_ALL_MODES;

const SKILLS = [
  { id: 'buy', label: 'Can I buy this?', emoji: '🛒' },
  { id: 'track', label: 'Am I on track?', emoji: '📊' },
  { id: 'move', label: "What's my next move?", emoji: '🎯' },
];

const POWER_TOPICS = [
  { label: '💰 Build Wealth', prompt: "I want to build serious wealth starting now. Give me a concrete 90-day action plan: exact accounts to open, what percentage to save monthly, and the single most impactful step I can take this week." },
  { label: '🔥 Crush Debt', prompt: "I want to eliminate all my debt as fast as possible. Compare the avalanche vs snowball method with real numbers and give me a realistic monthly plan to become debt-free." },
  { label: '📈 Start Investing', prompt: "I have $500/month to invest and I'm in my 20s-30s. Tell me exactly where to put it — give me a real actionable strategy, not generic advice." },
  { label: '🌴 Retire Early', prompt: "I want to retire early using the FIRE method. Calculate how much I need to save monthly starting now and give me the exact accounts and investments to prioritize." },
];

const popAnim = {
  initial: { opacity: 0, y: -4, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.97 },
  transition: { duration: 0.1 },
};

export default function HeroSection({ agentId, onAgentChange }) {
  const [query, setQuery] = useState(() => localStorage.getItem('stensor_home_draft') || '');
  const [files, setFiles] = useState([]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
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

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileMenuRef = useRef(null);
  const skillMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const { t } = useLanguage();
  const canUpload = userPlan?.file_upload || false;

  useEffect(() => {
    const stored = getStoredQuiz();
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
        const dailyUsed = (() => { try { return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}')[todayKey] || 0; } catch { return 0; } })();
        if (dailyUsed >= plan.daily_credits_limit) setDailyBlocked(true);
      }
      if (plan.internet_access) setHasInternetState(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) setShowFileMenu(false);
      if (skillMenuRef.current && !skillMenuRef.current.contains(e.target)) setShowSkillMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [query]);

  const handleFileSelect = (e) => { setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]); setShowFileMenu(false); };
  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const toggleRecording = async () => {
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); setVoiceLoading(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice input not supported on this browser.'); return; }
    if (navigator.mediaDevices?.getUserMedia) {
      try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach(t => t.stop()); } catch { toast.error('Microphone access denied.'); return; }
    }
    finalTranscriptRef.current = '';
    const rec = new SR();
    rec.lang = navigator.language || 'fr-FR';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const finals = Array.from(e.results).filter(r => r.isFinal).map(r => r[0].transcript.trim()).join(' ');
      if (finals) finalTranscriptRef.current = finals;
    };
    rec.onerror = (e) => { if (e.error !== 'aborted') toast.error('Voice error: ' + e.error); setIsRecording(false); setVoiceLoading(false); };
    rec.onend = () => {
      setIsRecording(false); setVoiceLoading(false);
      const raw = finalTranscriptRef.current.trim();
      if (raw) { let text = raw.charAt(0).toUpperCase() + raw.slice(1); if (!'.!?'.includes(text[text.length - 1])) text += '.'; setQuery(text); }
      finalTranscriptRef.current = '';
    };
    try { setIsRecording(true); rec.start(); recognitionRef.current = rec; } catch { toast.error('Could not start microphone.'); setIsRecording(false); }
  };

  const handleFileAttach = () => {
    if (!canUpload) { setUpsellFeature('files'); setShowFileMenu(false); return; }
    fileInputRef.current?.click();
    setShowFileMenu(false);
  };

  const hasInternet = hasInternetState || userPlan?.internet_access || false;

  const handleSend = () => {
    if (!query.trim() || isBlocked) return;
    localStorage.removeItem('stensor_home_draft');
    const mode = ALL_MODES.find(m => m.id === 'thinking') || ALL_MODES[ALL_MODES.length - 1];
    const skill = selectedSkill ? SKILLS.find(s => s.id === selectedSkill) : null;
    const skillPrefix = skill ? `[Skill: ${skill.label}] ` : '';
    const params = new URLSearchParams({ q: skillPrefix + query, mode: mode.id, model: mode.model, webSearch: useWebSearch && hasInternet ? '1' : '0' });
    if (agentId) params.set('agent', agentId);
    navigate(`/chat?${params.toString()}`);
  };

  const hasText = query.trim().length > 0;
  const isBlocked = creditsUsed >= creditsTotal || dailyBlocked;

  return (
    <section
      className="relative flex flex-col items-center px-6"
      style={{ paddingTop: '10vh', paddingBottom: '6vh', minHeight: '80vh' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{ position: 'absolute', width: 700, height: 700, top: -150, left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(221,255,0,0.06) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, bottom: 0, right: '10%', background: 'radial-gradient(circle, rgba(0,0,0,0.025) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase"
          style={{ background: '#DDFF00', color: '#0A0A0A' }}>
          ✦ AI Financial Coach
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-center leading-[1.02] mb-5"
        style={{ color: '#0A0A0A', maxWidth: '700px' }}
      >
        Build your<br />
        <span style={{ color: 'rgba(0,0,0,0.18)' }}>financial freedom.</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.14 }}
        className="text-base md:text-lg text-center mb-12 max-w-md"
        style={{ color: 'rgba(10,10,10,0.38)', lineHeight: 1.6 }}
      >
        Ask anything. Get expert-grade answers, instantly.
      </motion.p>

      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full relative"
        style={{ maxWidth: '680px' }}
        onDragEnter={(e) => { e.preventDefault(); dragCounterRef.current++; setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setIsDragging(false); } }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault(); dragCounterRef.current = 0; setIsDragging(false);
          const dropped = Array.from(e.dataTransfer.files || []);
          if (!dropped.length) return;
          if (!canUpload) { setUpsellFeature('files'); return; }
          setFiles((prev) => [...prev, ...dropped]);
        }}
      >
        <DragDropOverlay visible={isDragging} canUpload={canUpload} />
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />

        <div className="bg-white border overflow-visible"
          style={{ borderColor: 'rgba(0,0,0,0.09)', borderRadius: '20px', boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)' }}>

          {/* Files */}
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap px-4 pt-4">
              {files.map((file, idx) => (
                <div key={idx} className="relative flex items-center gap-2 px-2.5 py-1.5 group bg-black/4 border border-black/7 rounded-lg">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0A0A0A' }} />
                  <span className="text-[10px] font-medium max-w-[80px] truncate" style={{ color: '#444' }}>{file.name}</span>
                  <button onClick={() => removeFile(idx)} className="w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <div className="px-5 pt-5 pb-2">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); localStorage.setItem('stensor_home_draft', e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!isBlocked) handleSend(); } }}
              placeholder={isBlocked ? (dailyBlocked ? 'Daily limit reached — come back tomorrow ✨' : 'Monthly limit reached — upgrade to continue') : "Ask me anything about your finances..."}
              disabled={isBlocked}
              rows={3}
              className="w-full resize-none bg-transparent focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontSize: '16px', lineHeight: '1.65', color: '#0A0A0A', minHeight: '72px' }}
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 pb-4 gap-2">
            <div className="flex items-center gap-0.5">
              {/* + file / web search */}
              <div className="relative" ref={fileMenuRef}>
                <button onClick={() => { setShowFileMenu(!showFileMenu); setShowSkillMenu(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/5 transition-colors">
                  <Plus className="w-4 h-4" style={{ color: 'rgba(0,0,0,0.4)' }} />
                </button>
                <AnimatePresence>
                  {showFileMenu && (
                    <motion.div {...popAnim} className="absolute bottom-full mb-2 left-0 bg-white shadow-xl p-1.5 min-w-[190px] z-50 rounded-xl overflow-hidden"
                      style={{ border: '1px solid rgba(0,0,0,0.09)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
                      <button onClick={handleFileAttach}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs rounded-lg transition-colors text-left hover:bg-black/5 ${canUpload ? 'text-zinc-600' : 'text-zinc-300'}`}>
                        <FileText className={`w-3.5 h-3.5 ${canUpload ? 'text-fg' : 'text-zinc-300'}`} />
                        Attach file
                        {!canUpload && <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-sm">Essential+</span>}
                      </button>
                      <button
                        onClick={() => {
                          if (!hasInternet) { setUpsellFeature('internet'); setShowFileMenu(false); return; }
                          setUseWebSearch(w => !w); setShowFileMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs rounded-lg transition-colors text-left hover:bg-black/5 ${hasInternet ? 'text-zinc-600' : 'text-zinc-300'}`}>
                        <Wifi className={`w-3.5 h-3.5 ${hasInternet ? 'text-zinc-500' : 'text-zinc-300'}`} />
                        Web Search
                        {!hasInternet && <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 bg-muted text-zinc-400 rounded-sm">Advanced+</span>}
                        {hasInternet && (
                          <span className="ml-auto px-2 py-0.5 text-[9px] font-black rounded-sm transition-colors"
                            style={{ background: useWebSearch ? '#0A0A0A' : 'rgba(0,0,0,0.07)', color: useWebSearch ? '#DDFF00' : '#999' }}>
                            {useWebSearch ? 'ON' : 'OFF'}
                          </span>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Skills */}
              <div className="relative" ref={skillMenuRef}>
                {selectedSkill ? (
                  <button onClick={() => setSelectedSkill(null)}
                    className="h-8 px-3 rounded-xl flex items-center gap-1.5 transition-colors"
                    style={{ background: 'rgba(221,255,0,0.2)' }}>
                    <Zap className="w-3 h-3" style={{ color: '#0A0A0A' }} />
                    <span className="text-xs font-semibold hidden sm:block" style={{ color: '#0A0A0A' }}>
                      {SKILLS.find(s => s.id === selectedSkill)?.label}
                    </span>
                    <X className="w-3 h-3" style={{ color: '#0A0A0A' }} />
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowSkillMenu(s => !s); setShowFileMenu(false); }}
                    className="h-8 px-3 rounded-xl flex items-center gap-1.5 transition-colors hover:bg-black/5">
                    <Zap className="w-3 h-3" style={{ color: 'rgba(0,0,0,0.4)' }} />
                    <span className="text-xs font-medium hidden sm:block" style={{ color: 'rgba(0,0,0,0.4)' }}>Skills</span>
                    <ChevronDown className="w-3 h-3" style={{ color: 'rgba(0,0,0,0.3)' }} />
                  </button>
                )}
                <AnimatePresence>
                  {showSkillMenu && (
                    <motion.div {...popAnim} className="absolute bottom-full mb-2 left-0 bg-white shadow-xl p-1.5 min-w-[190px] z-50 rounded-xl overflow-hidden"
                      style={{ border: '1px solid rgba(0,0,0,0.09)', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
                      {SKILLS.map(s => (
                        <button key={s.id} onClick={() => { setSelectedSkill(s.id); setShowSkillMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left rounded-lg hover:bg-black/5 text-zinc-600">
                          <span>{s.emoji}</span>
                          <span className="font-medium">{s.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: mic + send */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleRecording}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                style={{ background: isRecording || voiceLoading ? '#0A0A0A' : 'rgba(0,0,0,0.05)' }}>
                {voiceLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                    className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#DDFF00' }} />
                ) : isRecording ? (
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 0.9 }}
                    className="w-2.5 h-2.5 rounded-full" style={{ background: '#DDFF00' }} />
                ) : (
                  <Mic className="w-4 h-4" style={{ color: 'rgba(0,0,0,0.4)' }} />
                )}
              </button>

              <button
                onClick={handleSend}
                disabled={!hasText || isBlocked}
                className="h-9 px-5 flex items-center gap-2 rounded-xl transition-all font-black text-sm"
                style={{
                  background: hasText && !isBlocked ? '#0A0A0A' : 'rgba(0,0,0,0.05)',
                  color: hasText && !isBlocked ? 'white' : 'rgba(0,0,0,0.2)',
                  cursor: !hasText || isBlocked ? 'not-allowed' : 'pointer',
                }}>
                <span className="hidden sm:block">Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contextual upsell */}
      <AnimatePresence>
        {upsellFeature && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mt-4 w-full" style={{ maxWidth: '680px' }}>
            <ContextualUpsell feature={upsellFeature} onDismiss={() => setUpsellFeature(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocked banner */}
      {isBlocked && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/pricing')}
          className="mt-4 w-full py-3.5 flex items-center justify-between px-5 cursor-pointer hover:opacity-90 transition-opacity rounded-2xl"
          style={{ background: '#0A0A0A', maxWidth: '680px' }}>
          <p className="text-sm font-bold text-white">{dailyBlocked ? 'Daily limit reached 🌙' : 'Monthly limit reached'}</p>
          <span className="text-xs font-black px-3 py-1.5 rounded-lg" style={{ background: '#DDFF00', color: '#0A0A0A' }}>Upgrade →</span>
        </motion.div>
      )}

      {/* Topic chips */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full mt-8"
        style={{ maxWidth: '680px' }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-center mb-4" style={{ color: 'rgba(0,0,0,0.2)' }}>Popular topics</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {POWER_TOPICS.map((topic) => (
            <motion.button key={topic.label} onClick={() => setQuery(topic.prompt)}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
              whileTap={{ scale: 0.97 }}
              className="text-left px-4 py-3.5 bg-white rounded-2xl border transition-all"
              style={{ borderColor: 'rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <p className="text-sm font-black" style={{ color: '#0A0A0A' }}>{topic.label}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}