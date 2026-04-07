import { useState, useRef, useEffect } from 'react';
import { Plus, SlidersHorizontal, Mic, X, FileText, Bot, ChevronDown, Zap, Brain, Star, Crown, Lock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';

const AGENTS = [
  { id: 'global', label: 'Agent Global' },
  { id: 'emotions-depenses', label: 'Émotions & Dépenses' },
  { id: 'wealth-strategy', label: 'Wealth Strategy' },
];

const ALL_MODES = [
  { id: 'fast', label: 'Fast', icon: Zap, model: 'gemini_3_flash', desc: 'Rapide & efficace' },
  { id: 'thinking', label: 'Thinking', icon: Brain, model: 'gemini_3_1_pro', desc: 'Réflexion profonde' },
  { id: 'pro', label: 'Pro', icon: Star, model: 'gemini_3_1_pro', desc: 'Analyse avancée' },
  { id: 'ultimate', label: 'Ultimate', icon: Crown, model: 'claude_opus_4_6', desc: 'Le plus puissant' },
];

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

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
  const [mode, setMode] = useState(ALL_MODES[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [userPlan, setUserPlan] = useState(null);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileMenuRef = useRef(null);
  const agentMenuRef = useRef(null);
  const modeMenuRef = useRef(null);
  const atMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  const effectiveAgentId = agentId || 'global';
  const lockedAgentLabel = AGENTS.find(a => a.id === effectiveAgentId)?.label;
  const allowedModes = userPlan ? ALL_MODES.filter(m => userPlan.allowed_modes.includes(m.id)) : [ALL_MODES[0]];
  const canUpload = userPlan?.file_upload || false;

  useEffect(() => {
    base44.auth.me().then(u => setUserPlan(getUserPlan(u))).catch(() => {});
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
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
    const rec = new SR();
    rec.lang = 'fr-FR'; rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e) => setQuery(Array.from(e.results).map(r => r[0].transcript).join(''));
    rec.onend = () => setIsRecording(false);
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

  const handleCommencer = () => {
    if (!query.trim()) return;
    const params = new URLSearchParams({ q: query, mode: mode.id, model: mode.model });
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
        <span className="text-[10px] font-black tracking-widest" style={{ color: FG }}>STENSOR — FINANCE IA</span>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: FG }}>
        {lockedAgentLabel ? lockedAgentLabel : 'Votre coach financier IA'}
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-3 text-sm" style={{ color: '#888' }}>
        Disponible 24h/24 · Confidentiel · Plus rapide qu'un conseiller humain
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
                          <div><p className="text-sm font-medium" style={{ color: FG }}>{m.label}</p><p className="text-[10px]" style={{ color: '#aaa' }}>{m.desc}</p></div>
                          {!isAllowed && <Lock className="w-3 h-3 ml-auto" style={{ color: '#ccc' }} />}
                          {mode.id === m.id && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5" style={{ background: YUZU, color: FG, borderRadius: '2px' }}>actif</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              placeholder="Posez votre question financière… (@ pour agents)"
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
                        {!canUpload && <Lock className="w-3 h-3 ml-auto" style={{ color: '#ddd' }} />}
                      </button>
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
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
                  <span className="text-xs font-medium" style={{ color: '#bbb' }}>{lockedAgentLabel ? lockedAgentLabel.split(' ')[0] : 'Agent'}</span>
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
                            {!isAllowed && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: '#ccc' }} />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold hidden sm:block" style={{ color: '#bbb' }}>{mode.label}</span>
              <button onClick={toggleRecording}
                className="relative w-8 h-8 flex items-center justify-center transition-all overflow-hidden"
                style={{ background: isRecording ? FG : 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                {isRecording ? (
                  <div className="flex items-end gap-0.5 h-4">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div key={i} className="w-0.5 rounded-full"
                        animate={{ height: ['3px', '14px', '6px', '10px', '3px'] }}
                        transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15, ease: 'easeInOut' }}
                        style={{ background: YUZU }} />
                    ))}
                  </div>
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
        Commencer →
      </motion.button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
        <p className="text-xs mb-3" style={{ color: '#bbb' }}>Sujets populaires</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['Budget & dépenses', 'Investissement', 'Épargne', 'Retraite', 'Fiscalité'].map(cat => (
            <button key={cat} onClick={() => setQuery(`Aide-moi sur le sujet : ${cat}`)}
              className="px-3.5 py-1.5 border text-xs font-medium transition-colors"
              style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px', color: '#666', background: 'white' }}
              onMouseEnter={e => { e.currentTarget.style.background = FG; e.currentTarget.style.color = 'white'; e.currentTarget.style.border = `1px solid ${FG}`; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#666'; e.currentTarget.style.border = '1px solid rgba(0,0,0,0.1)'; }}>
              {cat}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}