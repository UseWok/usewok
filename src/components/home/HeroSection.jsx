import { useState, useRef, useEffect } from 'react';
import DragDropOverlay from '@/components/DragDropOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import ContextualUpsell from '@/components/upsell/ContextualUpsell';
import { Plus, SlidersHorizontal, Mic, X, FileText, Bot, ChevronDown, Zap, Brain, Star, Crown, Lock, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { useLanguage } from '@/lib/i18n';

const AGENT_IDS = ['global', 'emotions-depenses', 'wealth-strategy'];
const AGENT_LABEL_KEYS = { global: 'global_agent', 'emotions-depenses': 'emotions_agent', 'wealth-strategy': 'wealth_agent' };

const ALL_MODES = [
  { id: 'ultimate', label: 'Expert', icon: Crown, model: 'claude_opus_4_6', desc: 'Le plus puissant', requiredPlan: 'expert', credit_cost: 4, credit_max: 8 },
  { id: 'pro', label: 'Avancé', icon: Star, model: 'gemini_3_1_pro', desc: 'Analyse avancée', requiredPlan: 'essential', credit_cost: 2, credit_max: 5 },
  { id: 'thinking', label: 'Standard', icon: Brain, model: 'gemini_3_1_pro', desc: 'Mode standard', requiredPlan: null, credit_cost: 1, credit_max: 3 },
];

const POWER_TOPICS = [
  { label: 'Build Wealth', prompt: "I want to build serious wealth starting now. Give me a concrete 90-day action plan: exact accounts to open, what percentage to save monthly, and the single most impactful step I can take this week. No generic advice — be specific." },
  { label: 'Crush Debt', prompt: "I want to eliminate all my debt as fast as possible. Compare the avalanche vs snowball method with real numbers for my situation, and give me a realistic monthly plan to become debt-free. Which one should I choose and why?" },
  { label: 'Start Investing', prompt: "I have $500/month to invest and I'm in my 20s-30s. Tell me exactly where to put it — index funds, ETFs, allocation percentages. Explain it clearly, give me a real actionable strategy, not generic advice." },
  { label: 'Side Hustle', prompt: "Give me the 5 best side income strategies that actually work for people aged 18-35 in 2025. For each: realistic monthly earnings, time required, startup cost, and the exact first step I can take today." },
  { label: 'Retire Early', prompt: "I want to retire early using the FIRE method. Calculate how much I need to save monthly starting now, explain the 4% rule with real numbers, and give me the exact accounts and investments to prioritize. What changes move the needle most?" },
];

const popAnim = {
  initial: { opacity: 0, y: -4, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.97 },
  transition: { duration: 0.1 },
};

export default function HeroSection({ agentId, onAgentChange }) {
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showAtMenu, setShowAtMenu] = useState(false);
  const [atQuery, setAtQuery] = useState('');
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
  const modeMenuRef = useRef(null);
  const atMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const { t } = useLanguage();
  const AGENTS = AGENT_IDS.map(id => ({ id, label: t(AGENT_LABEL_KEYS[id]) }));
  const effectiveAgentId = agentId || 'global';
  const lockedAgentLabel = AGENTS.find(a => a.id === effectiveAgentId)?.label;
  const canUpload = userPlan?.file_upload || false;

  useEffect(() => {
    base44.auth.me().then(u => {
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
      const best = ALL_MODES.find(m => plan.allowed_modes.includes(m.id));
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
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) setShowModeMenu(false);
      if (atMenuRef.current && !atMenuRef.current.contains(e.target)) setShowAtMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFileSelect = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    setShowFileMenu(false);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const toggleRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); setVoiceLoading(true); return; }
    finalTranscriptRef.current = '';
    const rec = new SR();
    rec.lang = 'fr-FR'; rec.continuous = true; rec.interimResults = false;
    rec.onresult = (e) => {
      const finals = Array.from(e.results).filter(r => r.isFinal).map(r => r[0].transcript.trim()).join(' ');
      if (finals) finalTranscriptRef.current = finals;
    };
    rec.onend = () => {
      setIsRecording(false); setVoiceLoading(false);
      const raw = finalTranscriptRef.current.trim();
      if (raw) {
        const isQuestion = /^(est-ce|qu'est|pourquoi|comment|quand|où|quel|quelle|combien|qui|que )/i.test(raw);
        let text = raw.charAt(0).toUpperCase() + raw.slice(1);
        if (!'.!?'.includes(text[text.length - 1])) text += isQuestion ? ' ?' : '.';
        setQuery(text);
      }
      finalTranscriptRef.current = '';
    };
    rec.start(); recognitionRef.current = rec; setIsRecording(true);
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && (lastAt === val.length - 1 || !val.slice(lastAt + 1).includes(' '))) {
      setAtQuery(val.slice(lastAt + 1).toLowerCase());
      setShowAtMenu(true);
    } else {
      setShowAtMenu(false);
    }
  };

  const selectAtAgent = (agent) => {
    let cleaned = AGENTS.reduce((q, a) => q.replace(new RegExp(`@${a.label}\\s*`, 'g'), ''), query);
    const lastAt = cleaned.lastIndexOf('@');
    const base = lastAt !== -1 ? cleaned.slice(0, lastAt) : cleaned;
    setQuery(base + `@${agent.label} `);
    onAgentChange(agent.id);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const selectAtMode = (m) => {
    if (!userPlan?.allowed_modes.includes(m.id)) return;
    let cleaned = ALL_MODES.reduce((q, md) => q.replace(new RegExp(`@${md.label}\\s*`, 'g'), ''), query);
    const lastAt = cleaned.lastIndexOf('@');
    const base = lastAt !== -1 ? cleaned.slice(0, lastAt) : cleaned;
    setQuery(base + `@${m.label} `);
    setMode(m);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const handleFileAttach = () => {
    if (!canUpload) { setUpsellFeature('files'); setShowFileMenu(false); return; }
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

  const filteredAgents = AGENTS.filter(a => a.label.toLowerCase().includes(atQuery));
  const filteredModes = ALL_MODES.filter(m => m.label.toLowerCase().includes(atQuery));
  const hasText = query.trim().length > 0;
  const isBlocked = creditsUsed >= creditsTotal || dailyBlocked;

  return (
    <section className="max-w-2xl mx-auto text-center px-4 mt-20 md:mt-28">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="inline-flex items-center gap-2 px-3 py-1 mb-5 bg-yuzu rounded-sm">
        <Zap className="w-3 h-3 text-fg" />
        <span className="text-[10px] font-black tracking-widest text-fg">{t('hero_badge')}</span>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="text-3xl md:text-4xl font-black tracking-tight text-fg">
        Let's build your financial freedom together.
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-3 text-sm text-zinc-400">
        Your personal AI financial coach — clear answers, real strategies, straight to the point.
      </motion.p>

      {/* Input card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-7 relative"
        ref={inputCardRef}
        onDragEnter={e => { e.preventDefault(); dragCounterRef.current++; setIsDragging(true); }}
        onDragLeave={e => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setIsDragging(false); } }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); dragCounterRef.current = 0; setIsDragging(false); const dropped = Array.from(e.dataTransfer.files || []); if (dropped.length === 0) return; if (!canUpload) { setUpsellFeature('files'); return; } setFiles(prev => [...prev, ...dropped]); }}>

        {/* @ menu */}
        <AnimatePresence>
          {showAtMenu && (
            <motion.div ref={atMenuRef} {...popAnim}
              className="absolute left-0 right-0 bottom-full mb-2 overflow-hidden shadow-lg z-50 bg-white border border-black/10 rounded-md text-left">
              <div className="px-3 py-2 border-b border-black/8">
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">@ Agents & Modes</p>
              </div>
              <div className="max-h-52 overflow-y-auto">
                {filteredAgents.length > 0 && (
                  <div className="px-2 py-1">
                    {filteredAgents.map(agent => (
                      <button key={agent.id} onClick={() => selectAtAgent(agent)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left rounded-sm transition-colors ${agentId === agent.id ? 'bg-yuzu text-fg' : 'text-zinc-600 hover:bg-black/5'}`}>
                        <Bot className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="font-medium">{agent.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {filteredModes.length > 0 && (
                  <div className="px-2 pb-2">
                    {filteredModes.map(m => {
                      const Icon = m.icon;
                      const isAllowed = userPlan?.allowed_modes.includes(m.id);
                      return (
                        <button key={m.id} onClick={() => selectAtMode(m)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-sm transition-colors mb-0.5 ${!isAllowed ? 'opacity-40' : 'hover:bg-black/5'}`}>
                          <Icon className="w-3.5 h-3.5 flex-shrink-0 text-fg" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-fg">{m.label}</p>
                            <p className="text-[10px] text-zinc-400">{m.desc}</p>
                          </div>
                          <span className="text-[9px] font-black px-1.5 py-0.5 flex-shrink-0 bg-black/8 text-zinc-500 rounded-sm">{m.credit_cost}-{m.credit_max}T</span>
                          {!isAllowed && <Lock className="w-3 h-3 ml-1 flex-shrink-0 text-zinc-300" />}
                          {mode.id === m.id && isAllowed && <span className="text-[9px] font-bold px-1.5 py-0.5 flex-shrink-0 bg-yuzu text-fg rounded-sm">active</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DragDropOverlay visible={isDragging} canUpload={canUpload} />
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />

        <div className="bg-white border border-black/10 rounded-lg shadow-md overflow-visible">
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap p-4 pb-0">
              {files.map((file, idx) => (
                <div key={idx} className="relative flex items-center gap-2 px-3 py-2 group bg-black/5 border border-black/8 rounded-md">
                  <FileText className="w-3.5 h-3.5 flex-shrink-0 text-fg" />
                  <span className="text-[10px] font-medium max-w-[80px] truncate text-zinc-600">{file.name}</span>
                  <button onClick={() => removeFile(idx)}
                    className="w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-sm">
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 pt-4 pb-1">
            <textarea ref={textareaRef} value={query} onChange={handleQueryChange}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!isBlocked) handleCommencer(); } }}
              placeholder={isBlocked
                ? (dailyBlocked ? 'Daily limit reached — come back tomorrow ✨' : 'Monthly limit reached — upgrade to continue')
                : t('hero_placeholder')}
              disabled={isBlocked}
              rows={3}
              className="w-full resize-none bg-transparent text-sm focus:outline-none leading-relaxed disabled:opacity-40 disabled:cursor-not-allowed text-fg placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-1">
              {/* + file */}
              <div className="relative" ref={fileMenuRef}>
                <button onClick={() => { setShowFileMenu(!showFileMenu); setShowAgentMenu(false); setShowModeMenu(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors">
                  <Plus className="w-4 h-4 text-zinc-300" />
                </button>
                <AnimatePresence>
                  {showFileMenu && (
                    <motion.div {...popAnim} className="absolute bottom-full mb-2 left-0 bg-white shadow-xl p-1.5 min-w-[160px] z-50 border border-black/10 rounded-md">
                      <button onClick={handleFileAttach}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-sm transition-colors text-left hover:bg-black/5 ${canUpload ? 'text-zinc-600' : 'text-zinc-300'}`}>
                        <FileText className={`w-3.5 h-3.5 ${canUpload ? 'text-fg' : 'text-zinc-300'}`} />
                        Joindre un fichier
                        {!canUpload && (
                          <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-sm">Essential+</span>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Agent button */}
              <div className="relative" ref={agentMenuRef}>
                <button onClick={() => { setShowAgentMenu(!showAgentMenu); setShowFileMenu(false); setShowModeMenu(false); }}
                  className="h-8 px-2.5 flex items-center gap-1.5 rounded-md hover:bg-black/5 transition-colors">
                  <Bot className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-xs font-medium text-zinc-300">{lockedAgentLabel ? lockedAgentLabel.split(' ')[0] : t('agent')}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-300" />
                </button>
                <AnimatePresence>
                  {showAgentMenu && (
                    <motion.div {...popAnim} className="absolute bottom-full mb-2 left-0 bg-white shadow-xl p-1.5 min-w-[200px] z-50 border border-black/10 rounded-md">
                      {AGENTS.map((a) => (
                        <button key={a.id} onClick={() => { onAgentChange(a.id); setShowAgentMenu(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-sm transition-colors text-left ${effectiveAgentId === a.id ? 'bg-yuzu text-fg' : 'text-zinc-600 hover:bg-black/5'}`}>
                          <Bot className="w-3.5 h-3.5" /> {a.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode button */}
              <div className="relative" ref={modeMenuRef}>
                <button onClick={() => { setShowModeMenu(!showModeMenu); setShowFileMenu(false); setShowAgentMenu(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-black/5 transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-300" />
                </button>
                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div {...popAnim} className="absolute bottom-full mb-2 left-0 bg-white shadow-xl p-1.5 min-w-[190px] z-50 border border-black/10 rounded-md">
                      {ALL_MODES.map((m) => {
                        const Icon = m.icon;
                        const isAllowed = userPlan?.allowed_modes.includes(m.id);
                        return (
                          <button key={m.id} onClick={() => { if (!isAllowed) return; setMode(m); setShowModeMenu(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm transition-colors text-left mb-0.5 ${mode.id === m.id ? 'bg-yuzu' : isAllowed ? 'hover:bg-black/5' : 'opacity-40'}`}>
                            <Icon className="w-3.5 h-3.5 flex-shrink-0 text-fg" />
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${mode.id === m.id ? 'text-fg' : 'text-zinc-600'}`}>{m.label}</p>
                              <p className="text-[10px] text-zinc-400">{m.desc}</p>
                            </div>
                            {isAllowed
                              ? <span className="text-[9px] font-black px-1.5 py-0.5 flex-shrink-0 bg-black/8 text-zinc-500 rounded-sm">{m.credit_cost}T</span>
                              : <span className="text-[9px] font-black px-1.5 py-0.5 flex-shrink-0 whitespace-nowrap bg-purple-100 text-purple-700 rounded-sm">{m.requiredPlan ? m.requiredPlan.charAt(0).toUpperCase() + m.requiredPlan.slice(1) + '+' : ''}</span>
                            }
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (!hasInternet) { setUpsellFeature('internet'); return; } setUseWebSearch(w => !w); }}
                className={`h-8 px-2 flex items-center gap-1.5 rounded-md transition-colors ${useWebSearch ? 'bg-green-100' : 'bg-black/5'}`}>
                {useWebSearch
                  ? <Wifi className="w-3.5 h-3.5 text-green-600" />
                  : <WifiOff className="w-3.5 h-3.5 text-zinc-300" />}
                <span className={`text-[11px] font-semibold hidden sm:block ${useWebSearch ? 'text-green-600' : 'text-zinc-300'}`}>Web</span>
                {!hasInternet && <span className="text-[9px] font-bold ml-1 text-zinc-300">Advanced+</span>}
              </button>
              <span className="text-xs font-semibold hidden sm:block text-zinc-300">{mode.label}</span>
              <span className="text-[9px] font-black hidden sm:block px-1 py-0.5 bg-black/8 text-zinc-400 rounded-sm">{mode.credit_cost}-{mode.credit_max}T</span>
              <button onClick={toggleRecording}
                className={`relative w-8 h-8 flex items-center justify-center rounded-md transition-all ${isRecording || voiceLoading ? 'bg-fg' : 'bg-black/5'}`}>
                {voiceLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                    className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-yuzu" />
                ) : isRecording ? (
                  <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-2.5 h-2.5 rounded-full bg-yuzu" />
                ) : <Mic className="w-3.5 h-3.5 text-zinc-400" />}
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
          className="mt-3 w-full py-3 flex items-center justify-between px-4 cursor-pointer hover:opacity-90 transition-opacity bg-fg rounded-md">
          <p className="text-sm font-bold text-white">{dailyBlocked ? 'Daily limit reached 🌙' : 'Monthly limit reached'}</p>
          <span className="text-xs font-black px-3 py-1 bg-yuzu text-fg rounded-sm">Upgrade →</span>
        </motion.div>
      )}

      <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        onClick={handleCommencer} disabled={!hasText || isBlocked}
        className={`mt-3 w-full py-3.5 font-black text-sm tracking-wide rounded-md transition-all ${hasText ? 'bg-fg text-white hover:opacity-90 cursor-pointer' : 'bg-black/8 text-zinc-400 cursor-not-allowed'}`}>
        {t('hero_start')}
      </motion.button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
        <p className="text-xs mb-3 text-zinc-300">{t('hero_topics')}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {POWER_TOPICS.map(topic => (
            <button key={topic.label} onClick={() => setQuery(topic.prompt)}
              className="px-3.5 py-1.5 text-xs font-medium border border-black/10 rounded-sm text-zinc-600 bg-white hover:bg-fg hover:text-white hover:border-fg transition-all">
              {topic.label}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}