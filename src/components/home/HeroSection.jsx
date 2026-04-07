import { useState, useRef, useEffect } from 'react';
import { Plus, SlidersHorizontal, Mic, X, FileText, Bot, ChevronDown, Zap, Brain, Star, Crown, Lock, Globe, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { getUserColor } from '@/lib/user-color';
import { useLanguage } from '@/lib/i18n';

const AGENT_IDS = ['global', 'emotions-depenses', 'wealth-strategy'];
const AGENT_LABEL_KEYS = { global: 'global_agent', 'emotions-depenses': 'emotions_agent', 'wealth-strategy': 'wealth_agent' };

const ALL_MODES = [
  { id: 'ultimate', label: 'Expert', icon: Crown, model: 'claude_opus_4_6', desc: 'Le plus puissant', requiredPlan: 'expert', credit_cost: 4 },
  { id: 'pro', label: 'Avancé', icon: Star, model: 'gemini_3_1_pro', desc: 'Analyse avancée', requiredPlan: 'essential', credit_cost: 2 },
  { id: 'thinking', label: 'Standard', icon: Brain, model: 'gemini_3_1_pro', desc: 'Mode standard', requiredPlan: null, credit_cost: 1 },
];

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const POWER_TOPICS = [
  { label: 'Build Wealth 📈', prompt: "I want to build serious wealth starting now. Give me a concrete 90-day action plan: exact accounts to open, what percentage to save monthly, and the single most impactful step I can take this week. No generic advice — be specific." },
  { label: 'Crush Debt 💪', prompt: "I want to eliminate all my debt as fast as possible. Compare the avalanche vs snowball method with real numbers for my situation, and give me a realistic monthly plan to become debt-free. Which one should I choose and why?" },
  { label: 'Start Investing 🚀', prompt: "I have $500/month to invest and I'm in my 20s-30s. Tell me exactly where to put it — index funds, ETFs, allocation percentages. Explain it clearly, give me a real actionable strategy, not generic advice." },
  { label: 'Side Hustle 💡', prompt: "Give me the 5 best side income strategies that actually work for people aged 18-35 in 2025. For each: realistic monthly earnings, time required, startup cost, and the exact first step I can take today." },
  { label: 'Retire Early 🏝️', prompt: "I want to retire early using the FIRE method. Calculate how much I need to save monthly starting now, explain the 4% rule with real numbers, and give me the exact accounts and investments to prioritize. What changes move the needle most?" },
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
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [hasInternetState, setHasInternetState] = useState(false);

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
  const allowedModes = userPlan ? ALL_MODES.filter(m => userPlan.allowed_modes.includes(m.id)) : [ALL_MODES[0]];
  const canUpload = userPlan?.file_upload || false;

  useEffect(() => {
    base44.auth.me().then(u => {
      const plan = getUserPlan(u);
      setUserPlan(plan);
      // Set highest allowed mode by default
      const best = ALL_MODES.find(m => plan.allowed_modes.includes(m.id));
      if (best) setMode(best);
      // Web search on by default if allowed
      if (plan.internet_access) { setUseWebSearch(true); setHasInternetState(true); }
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
    const picked = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...picked]);
    setShowFileMenu(false);
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const toggleRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      setVoiceLoading(true);
      return;
    }
    finalTranscriptRef.current = '';
    const rec = new SR();
    rec.lang = 'fr-FR'; rec.continuous = true; rec.interimResults = false;
    rec.onresult = (e) => {
      const finals = Array.from(e.results).filter(r => r.isFinal).map(r => r[0].transcript.trim()).join(' ');
      if (finals) finalTranscriptRef.current = finals;
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
    const lastAt = query.lastIndexOf('@');
    setQuery(query.slice(0, lastAt) + `@${agent.label} `);
    onAgentChange(agent.id);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const selectAtMode = (m) => {
    if (!userPlan?.allowed_modes.includes(m.id)) return;
    const lastAt = query.lastIndexOf('@');
    setQuery(query.slice(0, lastAt) + `@${m.label} `);
    setMode(m);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const handleFileAttach = () => {
    if (!canUpload) { navigate('/pricing'); return; }
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

  return (
    <section className="max-w-2xl mx-auto text-center px-4 mt-20 md:mt-28">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="inline-flex items-center gap-2 px-3 py-1 mb-5"
        style={{ background: YUZU, borderRadius: '2px' }}>
        <Zap className="w-3 h-3" style={{ color: FG }} />
        <span className="text-[10px] font-black tracking-widest" style={{ color: FG }}>{t('hero_badge')}</span>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: FG }}>
        Prenez le contrôle de votre argent
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-3 text-sm" style={{ color: '#888' }}>
        Des milliers d’utilisateurs font confiance à Stensor pour investir intelligemment et atteindre leur liberté financière.
      </motion.p>

      {/* Input card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-7 relative">

        {/* @ menu */}
        <AnimatePresence>
          {showAtMenu && (
            <motion.div ref={atMenuRef} {...popAnim}
              className="absolute left-0 right-0 bottom-full mb-2 overflow-hidden shadow-lg z-50 bg-white text-left"
              style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px' }}>
              <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#aaa' }}>@ Agents & Modes</p>
              </div>
              <div className="max-h-52 overflow-y-auto">
                {filteredAgents.length > 0 && (
                  <div className="px-2 py-1">
                    {filteredAgents.map(agent => (
                      <button key={agent.id} onClick={() => selectAtAgent(agent)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors"
                        style={{ borderRadius: '3px', color: agentId === agent.id ? FG : '#555', background: agentId === agent.id ? YUZU : 'transparent' }}
                        onMouseEnter={e => { if (agentId !== agent.id) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                        onMouseLeave={e => { if (agentId !== agent.id) e.currentTarget.style.background = 'transparent'; }}>
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
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                          style={{ borderRadius: '3px', opacity: isAllowed ? 1 : 0.4 }}
                          onMouseEnter={e => { if (isAllowed) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FG }} />
                           <div className="flex-1"><p className="text-sm font-medium" style={{ color: FG }}>{m.label}</p><p className="text-[10px]" style={{ color: '#aaa' }}>{m.desc}</p></div>
                          <span className="text-[9px] font-black px-1.5 py-0.5 flex-shrink-0" style={{ background: isAllowed ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.04)', color: isAllowed ? '#777' : '#ccc', borderRadius: '2px' }}>{m.credit_cost}T</span>
                          {!isAllowed && <Lock className="w-3 h-3 ml-1 flex-shrink-0" style={{ color: '#ccc' }} />}
                          {mode.id === m.id && isAllowed && <span className="text-[9px] font-bold px-1.5 py-0.5 flex-shrink-0" style={{ background: YUZU, color: FG, borderRadius: '2px' }}>actif</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
        <div className="bg-white overflow-visible"
          style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '6px', boxShadow: '0 4px 20px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)' }}>
          
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap p-4 pb-0">
              {files.map((file, idx) => (
                <div key={idx} className="relative flex items-center gap-2 px-3 py-2 group"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '4px' }}>
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: FG }} />
                  <span className="text-[10px] font-medium max-w-[80px] truncate" style={{ color: '#444' }}>{file.name}</span>
                  <button onClick={() => removeFile(idx)}
                    className="w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '2px' }}>
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 pt-4 pb-1">
            <textarea ref={textareaRef} value={query} onChange={handleQueryChange}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommencer(); } }}
              placeholder={t('hero_placeholder')}
              rows={3}
              className="w-full resize-none bg-transparent text-sm focus:outline-none leading-relaxed"
              style={{ color: FG }}
            />
          </div>

          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-1">
              {/* + file button */}
              <div className="relative" ref={fileMenuRef}>
                <button onClick={() => { setShowFileMenu(!showFileMenu); setShowAgentMenu(false); setShowModeMenu(false); }}
                  className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-black/5"
                  style={{ borderRadius: '4px' }}>
                  <Plus className="w-4 h-4" style={{ color: '#bbb' }} />
                </button>
                <AnimatePresence>
                  {showFileMenu && (
                    <motion.div {...popAnim} className="absolute top-full mt-2 left-0 bg-white shadow-xl p-1.5 min-w-[160px] z-50"
                      style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px' }}>
                      <button onClick={handleFileAttach}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left"
                        style={{ color: canUpload ? '#444' : '#bbb', borderRadius: '3px' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <FileText className="w-3.5 h-3.5" style={{ color: canUpload ? FG : '#ddd' }} />
                        Joindre un fichier
                        {!canUpload && (
                          <span className="ml-auto text-[9px] font-black px-1.5 py-0.5"
                            style={{ background: 'rgba(58,0,136,0.1)', color: '#3A0088', borderRadius: '3px' }}>
                            Essential+
                          </span>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Agent button */}
              <div className="relative" ref={agentMenuRef}>
                <button onClick={() => { setShowAgentMenu(!showAgentMenu); setShowFileMenu(false); setShowModeMenu(false); }}
                  className="h-8 px-2.5 flex items-center gap-1.5 transition-colors hover:bg-black/5"
                  style={{ borderRadius: '4px' }}>
                  <Bot className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
                  <span className="text-xs font-medium" style={{ color: '#bbb' }}>{lockedAgentLabel ? lockedAgentLabel.split(' ')[0] : t('agent')}</span>
                  <ChevronDown className="w-3 h-3" style={{ color: '#ccc' }} />
                </button>
                <AnimatePresence>
                  {showAgentMenu && (
                    <motion.div {...popAnim} className="absolute top-full mt-2 left-0 bg-white shadow-xl p-1.5 min-w-[200px] z-50"
                      style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px' }}>
                      {AGENTS.map((a) => (
                        <button key={a.id} onClick={() => { onAgentChange(a.id); setShowAgentMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left"
                          style={{ color: effectiveAgentId === a.id ? FG : '#666', background: effectiveAgentId === a.id ? YUZU : 'transparent', borderRadius: '3px' }}
                          onMouseEnter={e => { if (effectiveAgentId !== a.id) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                          onMouseLeave={e => { if (effectiveAgentId !== a.id) e.currentTarget.style.background = 'transparent'; }}>
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
                  className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-black/5"
                  style={{ borderRadius: '4px' }}>
                  <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
                </button>
                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div {...popAnim} className="absolute top-full mt-2 left-0 bg-white shadow-xl p-1.5 min-w-[190px] z-50"
                      style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px' }}>
                      {ALL_MODES.map((m) => {
                        const Icon = m.icon;
                        const isAllowed = userPlan?.allowed_modes.includes(m.id);
                        return (
                          <button key={m.id} onClick={() => {
                            if (!isAllowed) return;
                            setMode(m); setShowModeMenu(false);
                          }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors text-left mb-0.5"
                            style={{ color: mode.id === m.id ? FG : isAllowed ? '#555' : '#ccc', background: mode.id === m.id ? YUZU : 'transparent', borderRadius: '3px', opacity: isAllowed ? 1 : 0.5 }}
                            onMouseEnter={e => { if (mode.id !== m.id && isAllowed) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                            onMouseLeave={e => { if (mode.id !== m.id) e.currentTarget.style.background = 'transparent'; }}>
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                            <div className="flex-1"><p className="text-sm font-medium">{m.label}</p><p className="text-[10px]" style={{ color: '#aaa' }}>{m.desc}</p></div>
                            {isAllowed
                              ? <span className="text-[9px] font-black px-1.5 py-0.5 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.07)', color: '#777', borderRadius: '2px' }}>{m.credit_cost}T</span>
                              : <span className="text-[9px] font-black px-1.5 py-0.5 flex-shrink-0 whitespace-nowrap" style={{ background: 'rgba(58,0,136,0.1)', color: '#3A0088', borderRadius: '2px' }}>{m.requiredPlan ? m.requiredPlan.charAt(0).toUpperCase() + m.requiredPlan.slice(1) + '+' : ''}</span>
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
                onClick={() => {
                  if (!hasInternet) { navigate('/pricing'); return; }
                  setUseWebSearch(w => !w);
                }}
                className="h-8 px-2 flex items-center gap-1.5 transition-colors"
                style={{ background: useWebSearch ? 'rgba(22,163,74,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                {useWebSearch
                  ? <Wifi className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
                  : <WifiOff className="w-3.5 h-3.5" style={{ color: '#bbb' }} />}
                <span className="text-[11px] font-semibold hidden sm:block" style={{ color: useWebSearch ? '#16a34a' : '#bbb' }}>Web</span>
                {!hasInternet && <span className="text-[9px] font-bold ml-1" style={{ color: '#ccc' }}>Advanced+</span>}
              </button>
              <span className="text-xs font-semibold hidden sm:block" style={{ color: '#bbb' }}>{mode.label}</span>
              <span className="text-[9px] font-black hidden sm:block px-1 py-0.5" style={{ background: 'rgba(0,0,0,0.06)', color: '#999', borderRadius: '2px' }}>{mode.credit_cost}T</span>
              <button onClick={toggleRecording}
                className="relative w-8 h-8 flex items-center justify-center transition-all"
                style={{ background: isRecording || voiceLoading ? FG : 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                {voiceLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                    className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: YUZU }} />
                ) : isRecording ? (
                  <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                    className="w-2.5 h-2.5 rounded-full" style={{ background: YUZU }} />
                ) : <Mic className="w-3.5 h-3.5" style={{ color: '#aaa' }} />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Commencer button */}
      <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        onClick={handleCommencer} disabled={!hasText}
        className="mt-3 w-full py-3.5 font-black text-sm tracking-wide transition-all"
        style={{ background: hasText ? FG : 'rgba(0,0,0,0.06)', color: hasText ? 'white' : '#bbb', cursor: hasText ? 'pointer' : 'not-allowed', borderRadius: '4px' }}>
        {t('hero_start')}
      </motion.button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
        <p className="text-xs mb-3" style={{ color: '#bbb' }}>{t('hero_topics')}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {POWER_TOPICS.map(topic => (
            <button key={topic.label} onClick={() => setQuery(topic.prompt)}
              className="px-3.5 py-1.5 text-xs font-medium transition-all"
              style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px', color: '#555', background: 'white' }}
              onMouseEnter={e => { e.currentTarget.style.background = FG; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = FG; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}>
              {topic.label}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}