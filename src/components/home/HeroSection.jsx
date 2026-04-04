import { useState, useRef, useEffect } from 'react';
import { Plus, SlidersHorizontal, Mic, X, FileText, Bot, ChevronDown, Zap, Brain, Star, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const AGENTS = [
  { id: 'universelle', label: 'Universelle' },
  { id: 'coach-finance', label: 'Coach Finance Perso' },
  { id: 'gestion-achat', label: 'Gestion Achats Compulsifs' },
];

const MODES = [
  { id: 'ultimate', label: 'Ultimate', icon: Crown, model: 'claude_opus_4_6', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', desc: 'Le plus puissant' },
  { id: 'pro', label: 'Pro', icon: Star, model: 'gemini_3_1_pro', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', desc: 'Gemini 3 Pro' },
  { id: 'thinking', label: 'Thinking', icon: Brain, model: 'gemini_3_1_pro', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', desc: 'Raisonnement profond' },
  { id: 'fast', label: 'Fast', icon: Zap, model: 'gemini_3_flash', color: 'text-green-600', bg: 'bg-green-50 border-green-200', desc: 'Rapide & efficace' },
];

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [mode, setMode] = useState(MODES[3]); // Fast by default
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const fileInputRef = useRef(null);
  const fileMenuRef = useRef(null);
  const agentMenuRef = useRef(null);
  const modeMenuRef = useRef(null);
  const recognitionRef = useRef(null);

  const urlParams = new URLSearchParams(window.location.search);
  const lockedAgent = urlParams.get('agent');
  const lockedAgentLabel = AGENTS.find(a => a.id === lockedAgent)?.label;
  const isHome = window.location.pathname === '/' && !lockedAgent;

  // Close menus on outside click
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
    setFiles((prev) => [...prev, ...picked]);
    setShowFileMenu(false);
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const toggleRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setQuery(transcript);
    };
    rec.onend = () => setIsRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
  };

  const handleCommencer = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: query,
        model: mode.model,
      });
      setResponse(typeof result === 'string' ? result : JSON.stringify(result));
    } catch (e) {
      setResponse('Une erreur est survenue. Veuillez réessayer.');
    }
    setIsLoading(false);
  };

  return (
    <section className="max-w-3xl mx-auto text-center px-4">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-foreground tracking-tight"
      >
        {lockedAgentLabel ? `Agent : ${lockedAgentLabel}` : 'Que construirez-vous ensuite ?'}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-3 text-sm text-muted-foreground"
      >
        {lockedAgentLabel
          ? <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"><Bot className="w-3 h-3" /> Agent verrouillé : {lockedAgentLabel}</span>
          : <>Décrivez votre idée ou inspirez-vous de nos <span className="underline cursor-pointer text-foreground font-medium">modèles</span></>
        }
      </motion.p>

      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 bg-card border border-border rounded-2xl p-4 shadow-sm"
      >
        {/* File previews */}
        {files.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {files.map((file, idx) => (
              <div key={idx} className="relative w-20 h-20 rounded-xl border border-border bg-muted flex flex-col items-center justify-center overflow-hidden group">
                <FileText className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-[9px] text-muted-foreground text-center px-1 leading-tight line-clamp-2">{file.name}</span>
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 right-1 w-4 h-4 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Décrivez l'application que vous souhaitez créer..."
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            {/* + button */}
            <div className="relative" ref={fileMenuRef}>
              <button
                onClick={() => { setShowFileMenu(!showFileMenu); setShowAgentMenu(false); setShowModeMenu(false); }}
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Plus className="w-4 h-4 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {showFileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-xl p-2 min-w-[160px] z-50"
                  >
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-primary" />
                      Joindre un fichier
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Agent button - only on home */}
            {isHome && (
              <div className="relative" ref={agentMenuRef}>
                <button
                  onClick={() => { setShowAgentMenu(!showAgentMenu); setShowFileMenu(false); setShowModeMenu(false); }}
                  className="h-8 px-2.5 rounded-lg bg-muted flex items-center gap-1.5 hover:bg-muted/80 transition-colors"
                >
                  <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Agent IA</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {showAgentMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-xl p-2 min-w-[200px] z-50"
                    >
                      <p className="text-[10px] text-muted-foreground px-3 py-1 font-medium uppercase tracking-wide">Choisir un agent</p>
                      {AGENTS.map((a) => (
                        <a key={a.id} href={`/?agent=${a.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">
                          <Bot className="w-4 h-4 text-primary" />
                          {a.label}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mode button */}
            <div className="relative" ref={modeMenuRef}>
              <button
                onClick={() => { setShowModeMenu(!showModeMenu); setShowFileMenu(false); setShowAgentMenu(false); }}
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {showModeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-xl p-2 min-w-[200px] z-50"
                  >
                    <p className="text-[10px] text-muted-foreground px-3 py-1 font-medium uppercase tracking-wide">Mode Agent</p>
                    {MODES.map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          onClick={() => { setMode(m); setShowModeMenu(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left border mb-1 last:mb-0 ${
                            mode.id === m.id ? m.bg + ' border-current' : 'border-transparent hover:bg-muted'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${m.color}`} />
                          <div>
                            <p className={`font-medium text-sm ${m.color}`}>{m.label}</p>
                            <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                          </div>
                          {m.id === 'ultimate' && (
                            <span className="ml-auto text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">TOP</span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: mode indicator + mic */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium hidden sm:block ${mode.color}`}>{mode.label}</span>
            {/* Mic */}
            <button
              onClick={toggleRecording}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isRecording ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {isRecording ? (
                <motion.div className="flex items-end gap-0.5 h-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-white rounded-full"
                      animate={{ height: ['4px', '12px', '4px'] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    />
                  ))}
                </motion.div>
              ) : (
                <Mic className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Commencer button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-3"
      >
        <button
          onClick={handleCommencer}
          disabled={isLoading || !query.trim()}
          className={`w-full py-3.5 rounded-xl font-bold text-base tracking-wide transition-all shadow-md ${
            query.trim() && !isLoading
              ? 'bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              En cours...
            </span>
          ) : 'Commencer'}
        </button>
      </motion.div>

      {/* AI Response */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 bg-card border border-border rounded-2xl p-4 text-left shadow-sm"
          >
            <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1">
              <Bot className="w-3 h-3" /> Réponse ({mode.label})
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{response}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories */}
      {!response && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-5">
          <p className="text-xs text-muted-foreground mb-3">Que souhaitez-vous créer ?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['CRM', 'Productivité', 'Divertissement', 'Éducatif', 'Finances personnelles'].map((cat) => (
              <button key={cat} onClick={() => setQuery(`Crée une application de type ${cat}`)} className="px-4 py-1.5 rounded-full border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}