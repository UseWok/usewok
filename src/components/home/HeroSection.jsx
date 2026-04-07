import { useState, useRef, useEffect } from 'react';
import { Plus, SlidersHorizontal, Mic, X, FileText, Bot, ChevronDown, Zap, Brain, Star, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AGENTS = [
  { id: 'global', label: 'Agent Global' },
  { id: 'emotions-depenses', label: 'Émotions & Dépenses' },
  { id: 'wealth-strategy', label: 'Wealth Strategy' },
];

const MODES = [
  { id: 'ultimate', label: 'Ultimate', icon: Crown, model: 'claude_opus_4_6', desc: 'Le plus puissant' },
  { id: 'pro', label: 'Pro', icon: Star, model: 'gemini_3_1_pro', desc: 'Gemini 3 Pro' },
  { id: 'thinking', label: 'Thinking', icon: Brain, model: 'gemini_3_1_pro', desc: 'Raisonnement profond' },
  { id: 'fast', label: 'Fast', icon: Zap, model: 'gemini_3_flash', desc: 'Rapide & efficace' },
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
  const [mode, setMode] = useState(MODES[3]);
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileMenuRef = useRef(null);
  const agentMenuRef = useRef(null);
  const modeMenuRef = useRef(null);
  const atMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // Default agent is 'global' if none selected
  const effectiveAgentId = agentId || 'global';

  const lockedAgentLabel = AGENTS.find(a => a.id === effectiveAgentId)?.label;

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
    const lastAt = query.lastIndexOf('@');
    setQuery(query.slice(0, lastAt) + `@${m.label} `);
    setMode(m);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const handleCommencer = () => {
    if (!query.trim()) return;
    const params = new URLSearchParams({ q: query, mode: mode.id, model: mode.model });
    if (agentId) params.set('agent', agentId);
    navigate(`/chat?${params.toString()}`);
  };

  const filteredAgents = AGENTS.filter(a => a.label.toLowerCase().includes(atQuery));
  const filteredModes = MODES.filter(m => m.label.toLowerCase().includes(atQuery));
  const hasText = query.trim().length > 0;

  return (
    <section className="max-w-2xl mx-auto text-center px-4 mt-24 md:mt-32">
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
        {lockedAgentLabel ? lockedAgentLabel : 'Que voulez-vous accomplir ?'}
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-2 text-sm text-muted-foreground">
        {lockedAgentLabel ? 'Agent sélectionné — modifiez via le menu' : 'Posez une question ou décrivez ce que vous souhaitez accomplir'}
      </motion.p>

      {/* Input card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-6 relative">

        {/* @ menu */}
        <AnimatePresence>
          {showAtMenu && (
            <motion.div ref={atMenuRef} {...popAnim}
              className="absolute left-0 right-0 bottom-full mb-2 rounded-xl overflow-hidden shadow-lg z-50 bg-card border border-border text-left">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground">@ Agents & Modes</p>
              </div>
              <div className="max-h-52 overflow-y-auto">
                {filteredAgents.length > 0 && (
                  <div className="px-2 py-1">
                    <p className="text-[10px] px-2 py-1 font-semibold uppercase tracking-wider text-muted-foreground">Agents</p>
                    {filteredAgents.map(agent => (
                      <button key={agent.id} onClick={() => selectAtAgent(agent)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left hover:bg-foreground/5 transition-colors ${agentId === agent.id ? 'text-primary font-semibold' : 'text-foreground/70'}`}>
                        <Bot className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{agent.label}</span>
                        {agentId === agent.id && <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">actif</span>}
                      </button>
                    ))}
                  </div>
                )}
                {filteredModes.length > 0 && (
                  <div className="px-2 pb-2">
                    <p className="text-[10px] px-2 py-1 font-semibold uppercase tracking-wider text-muted-foreground">Modes</p>
                    {filteredModes.map(m => {
                      const Icon = m.icon;
                      return (
                        <button key={m.id} onClick={() => selectAtMode(m)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-foreground/5 transition-colors ${mode.id === m.id ? 'text-primary' : 'text-foreground/70'}`}>
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <div><p className="text-sm font-medium">{m.label}</p><p className="text-[10px] text-muted-foreground">{m.desc}</p></div>
                          {mode.id === m.id && <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">actif</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-2xl shadow-lg overflow-visible"
          style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' }}>
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap p-4 pb-0">
              {files.map((file, idx) => (
                <div key={idx} className="relative w-18 h-18 rounded-lg border border-border bg-muted flex flex-col items-center justify-center overflow-hidden group p-2">
                  <FileText className="w-5 h-5 text-muted-foreground mb-1" />
                  <span className="text-[9px] text-muted-foreground text-center leading-tight line-clamp-2">{file.name}</span>
                  <button onClick={() => removeFile(idx)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 pt-4 pb-1">
            <textarea ref={textareaRef} value={query} onChange={handleQueryChange}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommencer(); } }}
              placeholder="Décrivez ce que vous voulez accomplir... (@ pour agents)"
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-foreground/30 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-1">
              {/* + file button */}
              <div className="relative" ref={fileMenuRef}>
                <button onClick={() => { setShowFileMenu(!showFileMenu); setShowAgentMenu(false); setShowModeMenu(false); }} className="w-8 h-8 rounded-lg hover:bg-foreground/6 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4 text-foreground/35" />
                </button>
                <AnimatePresence>
                  {showFileMenu && (
                    <motion.div {...popAnim} className="absolute top-full mt-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[150px] z-50">
                      <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-foreground/5 transition-colors text-left text-foreground/80">
                        <FileText className="w-3.5 h-3.5" /> Joindre un fichier
                      </button>
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Agent button */}
              <div className="relative" ref={agentMenuRef}>
                <button onClick={() => { setShowAgentMenu(!showAgentMenu); setShowFileMenu(false); setShowModeMenu(false); }} className="h-8 px-2.5 rounded-lg hover:bg-foreground/6 flex items-center gap-1.5 transition-colors">
                  <Bot className="w-3.5 h-3.5 text-foreground/35" />
                  <span className="text-xs text-foreground/45 font-medium">{lockedAgentLabel ? lockedAgentLabel.split(' ')[0] : 'Agent'}</span>
                  <ChevronDown className="w-3 h-3 text-foreground/30" />
                </button>
                <AnimatePresence>
                  {showAgentMenu && (
                    <motion.div {...popAnim} className="absolute top-full mt-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[200px] z-50">
                      <p className="text-[10px] text-muted-foreground px-3 py-1.5 font-semibold uppercase tracking-wider">Agent IA</p>
                      {AGENTS.map((a) => (
                        <button key={a.id} onClick={() => { onAgentChange(a.id); setShowAgentMenu(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${effectiveAgentId === a.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-foreground/5 text-foreground/70'}`}>
                          <Bot className="w-3.5 h-3.5" /> {a.label}
                          </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode button */}
              <div className="relative" ref={modeMenuRef}>
                <button onClick={() => { setShowModeMenu(!showModeMenu); setShowFileMenu(false); setShowAgentMenu(false); }} className="w-8 h-8 rounded-lg hover:bg-foreground/6 flex items-center justify-center transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-foreground/35" />
                </button>
                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div {...popAnim} className="absolute top-full mt-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[190px] z-50">
                      <p className="text-[10px] text-muted-foreground px-3 py-1.5 font-semibold uppercase tracking-wider">Mode</p>
                      {MODES.map((m) => {
                        const Icon = m.icon;
                        return (
                          <button key={m.id} onClick={() => { setMode(m); setShowModeMenu(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left mb-0.5 ${mode.id === m.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-foreground/5 text-foreground/70'}`}>
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                            <div><p className="text-sm font-medium">{m.label}</p><p className="text-[10px] text-muted-foreground">{m.desc}</p></div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground/40 hidden sm:block">{mode.label}</span>
              <button onClick={toggleRecording}
                className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all overflow-hidden"
                style={{ background: isRecording ? 'linear-gradient(135deg, #1E0050, #7c3aed)' : 'rgba(30,0,80,0.05)' }}>
                {isRecording ? (
                  <div className="flex items-end gap-0.5 h-4">
                    {[0, 1, 2, 3].map((i) => (
                      <motion.div key={i} className="w-0.5 rounded-full bg-white"
                        animate={{ height: ['3px', '14px', '6px', '10px', '3px'] }}
                        transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15, ease: 'easeInOut' }} />
                    ))}
                  </div>
                ) : <Mic className="w-3.5 h-3.5" style={{ color: 'rgba(30,0,80,0.4)' }} />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Commencer button */}
      <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        onClick={handleCommencer} disabled={!hasText}
        className="mt-3 w-full rounded-2xl font-bold text-sm transition-all"
        style={{
          padding: '14px 0',
          background: hasText ? 'linear-gradient(135deg, #1E0050, #4c1d95)' : 'rgba(30,0,80,0.06)',
          color: hasText ? 'white' : 'rgba(30,0,80,0.25)',
          boxShadow: hasText ? '0 4px 20px rgba(30,0,80,0.3)' : 'none',
          border: hasText ? 'none' : '1px solid rgba(30,0,80,0.08)',
          cursor: hasText ? 'pointer' : 'not-allowed',
        }}>
        <span>Commencer →</span>
      </motion.button>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-5">
        <p className="text-xs text-muted-foreground mb-3">Que souhaitez-vous créer ?</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['CRM', 'Productivité', 'Divertissement', 'Éducatif', 'Finances personnelles'].map(cat => (
            <button key={cat} onClick={() => setQuery(`Crée une application de type ${cat}`)}
              className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}