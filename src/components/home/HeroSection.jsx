import { useState, useRef, useEffect } from 'react';
import { Plus, SlidersHorizontal, Mic, X, FileText, Bot, ChevronDown, Zap, Brain, Star, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AGENTS = [
  { id: 'global', label: 'Agent Global' },
  { id: 'emotions-depenses', label: 'Stensor | Émotions & Dépenses' },
  { id: 'wealth-strategy', label: 'Stensor | Wealth Strategy' },
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
  const [mode, setMode] = useState(MODES[3]);
  const [isRecording, setIsRecording] = useState(false);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const fileMenuRef = useRef(null);
  const agentMenuRef = useRef(null);
  const modeMenuRef = useRef(null);
  const recognitionRef = useRef(null);

  const lockedAgentLabel = AGENTS.find(a => a.id === agentId)?.label;

  useEffect(() => {
    const handler = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) setShowFileMenu(false);
      if (agentMenuRef.current && !agentMenuRef.current.contains(e.target)) setShowAgentMenu(false);
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) setShowModeMenu(false);
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
    rec.lang = 'fr-FR';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => setQuery(Array.from(e.results).map(r => r[0].transcript).join(''));
    rec.onend = () => setIsRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
  };

  const handleCommencer = () => {
    if (!query.trim()) return;
    const params = new URLSearchParams({ q: query, mode: mode.id, model: mode.model });
    if (agentId) params.set('agent', agentId);
    navigate(`/chat?${params.toString()}`);
  };

  const hasText = query.trim().length > 0;

  return (
    <section className="max-w-2xl mx-auto text-center px-4 mt-32 md:mt-40">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl md:text-4xl font-bold text-foreground tracking-tight"
      >
        {lockedAgentLabel ? lockedAgentLabel : 'Que voulez-vous accomplir ?'}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-2 text-sm text-muted-foreground"
      >
        {lockedAgentLabel
          ? 'Agent sélectionné — modifiez via le menu'
          : 'Posez une question ou décrivez ce que vous souhaitez accomplir'
        }
      </motion.p>

      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-6 bg-card border border-border rounded-xl p-4 shadow-sm"
      >
        {files.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
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

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCommencer(); } }}
          placeholder="Décrivez l'application que vous souhaitez créer..."
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            {/* + file button */}
            <div className="relative" ref={fileMenuRef}>
              <button onClick={() => { setShowFileMenu(!showFileMenu); setShowAgentMenu(false); setShowModeMenu(false); }} className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors">
                <Plus className="w-4 h-4 text-foreground/50" />
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
              <button onClick={() => { setShowAgentMenu(!showAgentMenu); setShowFileMenu(false); setShowModeMenu(false); }} className="h-8 px-2.5 rounded-lg bg-foreground/5 flex items-center gap-1.5 hover:bg-foreground/10 transition-colors">
                <Bot className="w-3.5 h-3.5 text-foreground/50" />
                <span className="text-xs text-foreground/60 font-medium">{lockedAgentLabel ? lockedAgentLabel.split(' ')[0] : 'Agent'}</span>
                <ChevronDown className="w-3 h-3 text-foreground/40" />
              </button>
              <AnimatePresence>
                {showAgentMenu && (
                  <motion.div {...popAnim} className="absolute top-full mt-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[200px] z-50">
                    <p className="text-[10px] text-muted-foreground px-3 py-1.5 font-semibold uppercase tracking-wider">Agent IA</p>
                    {AGENTS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => { onAgentChange(a.id); setShowAgentMenu(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${agentId === a.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-foreground/5 text-foreground/70'}`}
                      >
                        <Bot className="w-3.5 h-3.5" />
                        {a.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mode button */}
            <div className="relative" ref={modeMenuRef}>
              <button onClick={() => { setShowModeMenu(!showModeMenu); setShowFileMenu(false); setShowAgentMenu(false); }} className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5 text-foreground/50" />
              </button>
              <AnimatePresence>
                {showModeMenu && (
                  <motion.div {...popAnim} className="absolute top-full mt-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[190px] z-50">
                    <p className="text-[10px] text-muted-foreground px-3 py-1.5 font-semibold uppercase tracking-wider">Mode</p>
                    {MODES.map((m) => {
                      const Icon = m.icon;
                      return (
                        <button key={m.id} onClick={() => { setMode(m); setShowModeMenu(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left mb-0.5 ${mode.id === m.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-foreground/5 text-foreground/70'}`}>
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{m.label}</p>
                            <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground hidden sm:block">{mode.label}</span>
            <button onClick={toggleRecording} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-foreground text-background shadow-lg' : 'bg-foreground/5 hover:bg-foreground/10'}`}>
              {isRecording ? (
                <motion.div className="flex items-end gap-0.5 h-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-0.5 bg-background rounded-full" animate={{ height: ['4px', '12px', '4px'] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }} />
                  ))}
                </motion.div>
              ) : (
                <Mic className="w-3.5 h-3.5 text-foreground/50" />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Commencer button - premium style */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onClick={handleCommencer}
        disabled={!hasText}
        className="mt-3 w-full relative overflow-hidden rounded-xl font-bold text-base tracking-wide transition-all"
        style={{
          padding: '14px 0',
          background: hasText
            ? 'linear-gradient(135deg, #3A0088 0%, #6B00CC 50%, #3A0088 100%)'
            : 'rgba(0,0,0,0.06)',
          color: hasText ? '#DDFF00' : 'rgba(0,0,0,0.25)',
          boxShadow: hasText ? '0 4px 24px rgba(58,0,136,0.4), 0 1px 3px rgba(0,0,0,0.1)' : 'none',
          border: hasText ? '1px solid rgba(221,255,0,0.3)' : '1px solid rgba(0,0,0,0.08)',
          cursor: hasText ? 'pointer' : 'not-allowed',
          transform: hasText ? undefined : 'none',
        }}
      >
        {hasText && (
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            style={{ background: 'linear-gradient(90deg, transparent, #DDFF00, transparent)' }}
          />
        )}
        <span className="relative z-10">Commencer →</span>
      </motion.button>

      {/* Categories */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-5">
        <p className="text-xs text-muted-foreground mb-3">Que souhaitez-vous créer ?</p>
        <div className="flex flex-wrap justify-center gap-2">
          {['CRM', 'Productivité', 'Divertissement', 'Éducatif', 'Finances personnelles'].map(cat => (
            <button key={cat} onClick={() => setQuery(`Crée une application de type ${cat}`)} className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}