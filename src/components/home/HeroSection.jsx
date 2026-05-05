import { useState, useRef, useEffect } from 'react';
import DragDropOverlay from '@/components/DragDropOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import ContextualUpsell from '@/components/upsell/ContextualUpsell';
import { Plus, Mic, X, FileText, Wifi, Send, Zap, ChevronDown } from 'lucide-react';
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

const PLEASURE_MAP = {
  travel: { emoji: '✈️', label: 'Travel & experiences' },
  food: { emoji: '🍽️', label: 'Great food & dining' },
  tech: { emoji: '📱', label: 'Tech & gadgets' },
  wellness: { emoji: '🧘', label: 'Health & wellbeing' },
};

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
  const [pleasure, setPleasure] = useState(null);
  const dragCounterRef = useRef(0);
  const inputCardRef = useRef(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileMenuRef = useRef(null);
  const skillMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const { t } = useLanguage();
  const canUpload = userPlan?.file_upload || false;

  useEffect(() => {
    // Load quiz pleasure from localStorage or user profile
    const stored = getStoredQuiz();
    if (stored?.pleasure) {
      setPleasure(stored.pleasure);
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
        const dailyUsed = (() => { try { return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}')[todayKey] || 0; } catch { return 0; } })();
        if (dailyUsed >= plan.daily_credits_limit) setDailyBlocked(true);
      }
      if (plan.internet_access) setHasInternetState(true);

      // Load pleasure from user profile
      if (u?.quiz_answers?.pleasure) setPleasure(u.quiz_answers.pleasure);
      else if (u?.pleasure) setPleasure(u.pleasure);
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

  const handleFileSelect = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    setShowFileMenu(false);
  };

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
  const pleasureInfo = pleasure ? PLEASURE_MAP[pleasure] : null;

  return (
    <section className="max-w-2xl mx-auto text-center px-4 mt-24 md:mt-36 relative overflow-hidden" style={{ background: 'transparent' }}>
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, -40, 0], scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', width: 800, height: 800, bottom: '-200px', right: '-200px', background: 'radial-gradient(circle, rgba(221,255,0,0.15) 0%, rgba(221,255,0,0.06) 40%, transparent 75%)', filter: 'blur(60px)' }}
        />
      </div>

      {/* Personalized pleasure badge OR generic badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.02 }}
        className="inline-flex items-center justify-center mb-6"
      >
        {pleasureInfo ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ background: 'white', border: '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', color: '#0A0A0A' }}>
            <span className="text-base">{pleasureInfo.emoji}</span>
            <span style={{ color: 'rgba(0,0,0,0.4)', fontSize: '11px', fontWeight: 600 }}>Mon Plaisir Intouchable :</span>
            <span style={{ fontSize: '12px', fontWeight: 800 }}>{pleasureInfo.label}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase"
            style={{ background: '#DDFF00', color: '#0A0A0A' }}>
            AI Financial Coach
          </div>
        )}
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
        className="relative"
      >
        <DragDropOverlay visible={isDragging} canUpload={canUpload} />
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />

        <div className="bg-white border border-border rounded-xl shadow-md overflow-visible">
          {/* Attached files */}
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap p-3 pb-0">
              {files.map((file, idx) => (
                <div key={idx} className="relative flex items-center gap-2 px-2.5 py-1.5 group bg-black/5 border border-black/8 rounded-lg">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 text-fg" />
                  <span className="text-[10px] font-medium max-w-[80px] truncate text-zinc-600">{file.name}</span>
                  <button onClick={() => removeFile(idx)} className="w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-sm">
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea */}
          <div className="px-4 pt-4 pb-1">
            <textarea
              ref={textareaRef} value={query} onChange={(e) => { setQuery(e.target.value); localStorage.setItem('stensor_home_draft', e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!isBlocked) handleSend(); } }}
              placeholder={isBlocked ? (dailyBlocked ? 'Daily limit reached — come back tomorrow ✨' : 'Monthly limit reached — upgrade to continue') : t('hero_placeholder')}
              disabled={isBlocked}
              rows={3}
              className="w-full resize-none bg-transparent text-sm focus:outline-none leading-relaxed disabled:opacity-40 disabled:cursor-not-allowed text-fg placeholder:text-zinc-400"
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-3 gap-2">
            <div className="flex items-center gap-0.5">

              {/* + file / web search */}
              <div className="relative" ref={fileMenuRef}>
                <button onClick={() => { setShowFileMenu(!showFileMenu); setShowSkillMenu(false); }}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {showFileMenu && (
                    <motion.div {...popAnim} className="absolute bottom-full mb-2 left-0 bg-white shadow-xl p-1.5 min-w-[190px] z-50 border border-black/10 rounded-lg">
                      <button onClick={handleFileAttach}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs rounded-md transition-colors text-left hover:bg-black/5 ${canUpload ? 'text-zinc-600' : 'text-zinc-300'}`}>
                        <FileText className={`w-3.5 h-3.5 ${canUpload ? 'text-fg' : 'text-zinc-300'}`} />
                        Attach file
                        {!canUpload && <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-sm">Essential+</span>}
                      </button>
                      <button
                        onClick={() => {
                          if (!hasInternet) { setUpsellFeature('internet'); setShowFileMenu(false); return; }
                          setUseWebSearch(w => !w); setShowFileMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs rounded-md transition-colors text-left hover:bg-black/5 ${hasInternet ? 'text-zinc-600' : 'text-zinc-300'}`}>
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
                    className="h-7 px-2 rounded-md flex items-center gap-1 transition-colors"
                    style={{ background: 'rgba(221,255,0,0.25)' }}>
                    <Zap className="w-3 h-3" style={{ color: '#0A0A0A' }} />
                    <span className="text-[11px] font-semibold hidden sm:block" style={{ color: '#0A0A0A' }}>
                      {SKILLS.find(s => s.id === selectedSkill)?.label}
                    </span>
                    <X className="w-2.5 h-2.5" style={{ color: '#0A0A0A' }} />
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowSkillMenu(s => !s); setShowFileMenu(false); }}
                    className="h-7 px-2 rounded-md flex items-center gap-1 transition-colors hover:bg-black/5">
                    <Zap className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium hidden sm:block text-muted-foreground">Skills</span>
                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground/60" />
                  </button>
                )}
                <AnimatePresence>
                  {showSkillMenu && (
                    <motion.div {...popAnim} className="absolute bottom-full mb-2 left-0 bg-white shadow-xl p-1.5 min-w-[190px] z-50 border border-black/10 rounded-lg">
                      {SKILLS.map(s => (
                        <button key={s.id} onClick={() => { setSelectedSkill(s.id); setShowSkillMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left rounded-md hover:bg-black/5 text-zinc-600">
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
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleRecording}
                className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
                style={{ background: isRecording || voiceLoading ? '#0A0A0A' : 'rgba(0,0,0,0.05)' }}>
                {voiceLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                    className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#DDFF00' }} />
                ) : isRecording ? (
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 0.9 }}
                    className="w-2.5 h-2.5 rounded-full" style={{ background: '#DDFF00' }} />
                ) : (
                  <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>

              <button
                onClick={handleSend}
                disabled={!hasText || isBlocked}
                className="w-8 h-8 flex items-center justify-center rounded-md transition-all"
                style={{
                  background: hasText && !isBlocked ? '#0A0A0A' : 'rgba(0,0,0,0.05)',
                  cursor: !hasText || isBlocked ? 'not-allowed' : 'pointer',
                }}>
                <Send className="w-3.5 h-3.5" style={{ color: hasText && !isBlocked ? 'white' : '#ccc' }} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contextual upsell */}
      <AnimatePresence>
        {upsellFeature && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="mt-3">
            <ContextualUpsell feature={upsellFeature} onDismiss={() => setUpsellFeature(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blocked banner */}
      {isBlocked && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/pricing')}
          className="mt-3 w-full py-3 flex items-center justify-between px-4 cursor-pointer hover:opacity-90 transition-opacity bg-fg rounded-xl">
          <p className="text-sm font-bold text-white">{dailyBlocked ? 'Daily limit reached 🌙' : 'Monthly limit reached'}</p>
          <span className="text-xs font-black px-3 py-1 bg-yuzu text-fg rounded-md">Upgrade →</span>
        </motion.div>
      )}

      {/* Topic chips — 4 clean cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6">
        <div className="grid grid-cols-2 gap-2">
          {POWER_TOPICS.map((topic, i) => (
            <motion.button key={topic.label} onClick={() => setQuery(topic.prompt)}
              whileHover={{ scale: 1.025, y: -2 }} whileTap={{ scale: 0.97 }}
              className="text-left px-4 py-3.5 bg-white rounded-2xl border transition-all"
              style={{ borderColor: 'rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'}>
              <p className="text-sm font-black" style={{ color: '#0A0A0A' }}>{topic.label}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}