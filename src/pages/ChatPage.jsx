import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, SlidersHorizontal, Mic, X, FileText, Bot, ChevronDown, Zap, Brain, Star, Crown, Send, Settings, TrendingUp, HelpCircle, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const STORAGE_KEY = 'discussions_v1';
const MESSAGES_KEY = 'discussion_messages_v1';
const CREDITS_KEY = 'stensor_credits_used';
const FREE_LIMIT = 25;
const ADMIN_LIMIT = 1000000;

const AGENTS = [
  { id: 'universelle', label: 'Universelle' },
  { id: 'coach-finance', label: 'Coach Finance Perso' },
  { id: 'gestion-achat', label: 'Gestion Achats Compulsifs' },
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

function getCreditsUsed() { return parseInt(localStorage.getItem(CREDITS_KEY) || '0', 10); }
function addCredit() { const c = getCreditsUsed(); localStorage.setItem(CREDITS_KEY, String(c + 1)); return c + 1; }

function getConversationMessages(convId) {
  try { const all = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '{}'); return all[convId] || []; }
  catch { return []; }
}
function saveConversationMessages(convId, msgs) {
  try { const all = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '{}'); all[convId] = msgs; localStorage.setItem(MESSAGES_KEY, JSON.stringify(all)); }
  catch {}
}

export default function ChatPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initialQ = urlParams.get('q') || '';
  const modeId = urlParams.get('mode') || 'fast';
  const agentId = urlParams.get('agent') || null;
  const conversationId = urlParams.get('conversationId') || null;

  // Generate or use existing conversation id
  const convIdRef = useRef(conversationId || `conv_${Date.now()}`);
  const convId = convIdRef.current;

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState(() => conversationId ? getConversationMessages(conversationId) : []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(MODES.find(m => m.id === modeId) || MODES[3]);
  const [currentAgent, setCurrentAgent] = useState(agentId);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(getCreditsUsed);
  const [files, setFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const modeMenuRef = useRef(null);
  const agentMenuRef = useRef(null);
  const fileMenuRef = useRef(null);
  const profileRef = useRef(null);
  const recognitionRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const creditLimit = isAdmin ? ADMIN_LIMIT : FREE_LIMIT;
  const isBlocked = !isAdmin && creditsUsed >= creditLimit;
  const pct = Math.min((creditsUsed / (isAdmin ? ADMIN_LIMIT : FREE_LIMIT)) * 100, 100);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  useEffect(() => { if (initialQ && messages.length === 0) sendMessage(initialQ); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    const handler = (e) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) setShowModeMenu(false);
      if (agentMenuRef.current && !agentMenuRef.current.contains(e.target)) setShowAgentMenu(false);
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) setShowFileMenu(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sendMessage = async (text) => {
    if (!text?.trim() || isLoading || isBlocked) return;
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const agentLabel = AGENTS.find(a => a.id === currentAgent)?.label;
      const systemContext = agentLabel ? `Tu es l'agent ${agentLabel}. ` : '';
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: systemContext + text,
        model: mode.model,
      });
      const content = typeof result === 'string' ? result : JSON.stringify(result);
      const assistantMsg = { role: 'assistant', content };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      saveConversationMessages(convId, finalMessages);

      const newCredits = addCredit();
      setCreditsUsed(newCredits);

      // Save to discussions list
      const disc = {
        id: convId,
        title: text.slice(0, 50),
        preview: text,
        date: new Date().toISOString().slice(0, 10),
        model: mode.label,
        agent: currentAgent,
      };
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const existing = stored.findIndex(d => d.id === convId);
        if (existing >= 0) stored[existing] = { ...stored[existing], ...disc };
        else stored.unshift(disc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(0, 20)));
      } catch {}
    } catch {
      const errMsg = { role: 'assistant', content: 'Une erreur est survenue. Veuillez réessayer.' };
      const finalMessages = [...newMessages, errMsg];
      setMessages(finalMessages);
    }
    setIsLoading(false);
  };

  const toggleRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => setInput(Array.from(e.results).map(r => r[0].transcript).join(''));
    rec.onend = () => setIsRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
  };

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : '?';
  const agentLabel = AGENTS.find(a => a.id === currentAgent)?.label;

  return (
    <div className="flex flex-col h-screen bg-background font-be">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-foreground/60" />
          </button>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{agentLabel || 'Conversation'}</p>
            <p className="text-[10px] text-muted-foreground">{mode.label} · {messages.length} message{messages.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-xl bg-foreground/8 hover:bg-foreground/12 flex items-center justify-center transition-all"
          >
            <span className="text-xs font-bold text-foreground/70">{userInitial}</span>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                {...popAnim}
                className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <p className="text-sm font-bold text-foreground">{user?.full_name || user?.email || 'Profil'}</p>
                  <button onClick={() => setShowProfile(false)} className="w-6 h-6 rounded-lg hover:bg-foreground/8 flex items-center justify-center">
                    <X className="w-3.5 h-3.5 text-foreground/50" />
                  </button>
                </div>

                {/* Credits */}
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-foreground">Crédits utilisés</p>
                    <p className="text-xs font-bold text-foreground">{creditsUsed} / {isAdmin ? '∞' : creditLimit}</p>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <motion.div
                      animate={{ width: `${pct}%` }}
                      className="h-full rounded-full"
                      style={{ background: isBlocked ? '#ef4444' : 'white' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">1 crédit = 1 réponse IA</p>
                  {isBlocked && (
                    <p className="text-[10px] text-destructive mt-1 font-medium">Limite atteinte. Mettez à niveau pour continuer.</p>
                  )}
                </div>

                <div className="p-2">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-foreground/5 transition-colors text-foreground/70">
                    <Settings className="w-4 h-4" /> Paramètres
                  </button>
                  <button onClick={() => { navigate('/pricing'); setShowProfile(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-foreground/5 transition-colors text-foreground/70">
                    <TrendingUp className="w-4 h-4" /> Plans tarifaires
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-foreground/5 transition-colors text-foreground/70">
                    <HelpCircle className="w-4 h-4" /> Aide
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button onClick={() => base44.auth.logout()} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-destructive/5 text-destructive transition-colors">
                    <LogOut className="w-4 h-4" /> Se déconnecter
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Démarrez la conversation...</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-foreground text-background' : 'bg-card border border-border text-foreground'
            }`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 bg-foreground/30 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Blocked banner */}
      {isBlocked && (
        <div className="mx-4 mb-2 px-4 py-3 bg-destructive/5 border border-destructive/20 rounded-xl flex items-center justify-between">
          <p className="text-xs text-destructive font-medium">Limite de {FREE_LIMIT} crédits atteinte</p>
          <button onClick={() => navigate('/pricing')} className="text-xs font-bold text-primary underline">Mettre à niveau</button>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="bg-card border border-border rounded-xl p-3">
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {files.map((file, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg border border-border bg-muted flex flex-col items-center justify-center overflow-hidden group p-1.5">
                  <FileText className="w-4 h-4 text-muted-foreground mb-1" />
                  <span className="text-[8px] text-muted-foreground text-center leading-tight line-clamp-2">{file.name}</span>
                  <button onClick={() => setFiles(p => p.filter((_, i) => i !== idx))} className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder={isBlocked ? 'Limite atteinte...' : 'Continuez la conversation...'}
            disabled={isBlocked}
            rows={2}
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              {/* + file */}
              <div className="relative" ref={fileMenuRef}>
                <button onClick={() => setShowFileMenu(!showFileMenu)} className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-foreground/50" />
                </button>
                <AnimatePresence>
                  {showFileMenu && (
                    <motion.div {...popAnim} className="absolute top-full mt-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[140px] z-50">
                      <button onClick={() => { fileInputRef.current?.click(); setShowFileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-foreground/5 text-foreground/70">
                        <FileText className="w-3.5 h-3.5" /> Joindre fichier
                      </button>
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Agent */}
              <div className="relative" ref={agentMenuRef}>
                <button onClick={() => setShowAgentMenu(!showAgentMenu)} className="h-7 px-2 rounded-lg bg-foreground/5 flex items-center gap-1 hover:bg-foreground/10 transition-colors">
                  <Bot className="w-3 h-3 text-foreground/50" />
                  <span className="text-[11px] text-foreground/60">{agentLabel?.split(' ')[0] || 'Agent'}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-foreground/40" />
                </button>
                <AnimatePresence>
                  {showAgentMenu && (
                    <motion.div {...popAnim} className="absolute top-full mt-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[190px] z-50">
                      {AGENTS.map(a => (
                        <button key={a.id} onClick={() => { setCurrentAgent(a.id); setShowAgentMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-left ${currentAgent === a.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-foreground/5 text-foreground/70'}`}>
                          <Bot className="w-3 h-3" /> {a.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode */}
              <div className="relative" ref={modeMenuRef}>
                <button onClick={() => setShowModeMenu(!showModeMenu)} className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors">
                  <SlidersHorizontal className="w-3 h-3 text-foreground/50" />
                </button>
                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div {...popAnim} className="absolute top-full mt-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[180px] z-50">
                      {MODES.map(m => {
                        const Icon = m.icon;
                        return (
                          <button key={m.id} onClick={() => { setMode(m); setShowModeMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-left mb-0.5 ${mode.id === m.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-foreground/5 text-foreground/70'}`}>
                            <Icon className="w-3 h-3" />
                            <div><p className="font-medium">{m.label}</p><p className="text-[9px] text-muted-foreground">{m.desc}</p></div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">{mode.label}</span>
              <button onClick={toggleRecording} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10'}`}>
                {isRecording ? (
                  <div className="flex items-end gap-0.5 h-3">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-0.5 bg-background rounded-full" animate={{ height: ['3px', '9px', '3px'] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }} />
                    ))}
                  </div>
                ) : (
                  <Mic className="w-3 h-3 text-foreground/50" />
                )}
              </button>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading || isBlocked}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${input.trim() && !isLoading ? 'bg-foreground text-background hover:opacity-90' : 'bg-foreground/8 text-foreground/30 cursor-not-allowed'}`}
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}