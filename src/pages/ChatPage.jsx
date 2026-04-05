import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, SlidersHorizontal, Mic, X, FileText, Bot, ChevronDown, Zap, Brain, Star, Crown, Send, Copy, Pencil } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { getCreditsUsed, getCreditsLimit, addCredit } from '@/lib/credits';
import { AGENTS } from '@/components/Sidebar';
import { getAgentConfig } from '@/lib/agents-config';
import ChatLoadingAnimation from '@/components/chat/ChatLoadingAnimation';
import ChatProfilePopover from '@/components/chat/ChatProfilePopover';
import { toast } from 'sonner';

const STORAGE_KEY = 'discussions_v1';
const MESSAGES_KEY = 'discussion_messages_v1';
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const MODES = [
  { id: 'ultimate', label: 'Ultimate', icon: Crown, model: 'claude_opus_4_6', desc: 'Le plus puissant' },
  { id: 'pro', label: 'Pro', icon: Star, model: 'gemini_3_1_pro', desc: 'Analyse avancée' },
  { id: 'thinking', label: 'Thinking', icon: Brain, model: 'gemini_3_1_pro', desc: 'Réflexion profonde' },
  { id: 'fast', label: 'Fast', icon: Zap, model: 'gemini_3_flash', desc: 'Rapide & efficace' },
];

const MIN_DURATIONS = { fast: 8000, thinking: 13000, pro: 0, ultimate: 0 };

const popUp = {
  initial: { opacity: 0, y: 8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.97 },
  transition: { duration: 0.12 },
};

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
  const [showAtMenu, setShowAtMenu] = useState(false);
  const [atQuery, setAtQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(getCreditsUsed());
  const [creditsLimit] = useState(getCreditsLimit());
  const [profileOpen, setProfileOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const modeMenuRef = useRef(null);
  const agentMenuRef = useRef(null);
  const fileMenuRef = useRef(null);
  const atMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const profileBtnRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const blocked = !isAdmin && creditsUsed >= creditsLimit;
  const agentLabel = AGENTS.find(a => a.id === currentAgent)?.label;
  const filteredAgents = AGENTS.filter(a => a.label.toLowerCase().includes(atQuery));
  const filteredModes = MODES.filter(m => m.label.toLowerCase().includes(atQuery));
  const ModeIcon = mode.icon;

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  useEffect(() => { if (initialQ && messages.length === 0) sendMessage(initialQ); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    const handler = (e) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) setShowModeMenu(false);
      if (agentMenuRef.current && !agentMenuRef.current.contains(e.target)) setShowAgentMenu(false);
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) setShowFileMenu(false);
      if (atMenuRef.current && !atMenuRef.current.contains(e.target)) setShowAtMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && (lastAt === val.length - 1 || !val.slice(lastAt + 1).includes(' '))) {
      setAtQuery(val.slice(lastAt + 1).toLowerCase());
      setShowAtMenu(true);
    } else {
      setShowAtMenu(false);
    }
  };

  const selectAtAgent = (agent) => {
    const lastAt = input.lastIndexOf('@');
    setInput(input.slice(0, lastAt) + `@${agent.label} `);
    setCurrentAgent(agent.id);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const selectAtMode = (m) => {
    const lastAt = input.lastIndexOf('@');
    setInput(input.slice(0, lastAt) + `@${m.label} `);
    setMode(m);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const sendMessage = async (text) => {
    if (!text?.trim() || isLoading || blocked) return;
    const startTime = Date.now();
    const isTestMode = text.trim().startsWith('..') && text.trim().endsWith('..');
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      let content;
      if (isTestMode) {
        const minDur = MIN_DURATIONS[mode.id] || 6000;
        await new Promise(r => setTimeout(r, minDur));
        content = 'bonjour et voilà';
      } else {
      const agentConfig = currentAgent ? getAgentConfig(currentAgent) : null;
      const systemContext = agentConfig?.instructions
        ? `${agentConfig.instructions}${agentConfig.knowledge ? '\n\nBase de connaissances:\n' + agentConfig.knowledge : ''}\n\n`
        : (agentLabel ? `Tu es l'agent ${agentLabel}. ` : '');

      const result = await base44.integrations.Core.InvokeLLM({ prompt: systemContext + text, model: mode.model });
      content = typeof result === 'string' ? result : JSON.stringify(result);

      const elapsed = Date.now() - startTime;
      const minDur = MIN_DURATIONS[mode.id] || 0;
      if (elapsed < minDur) await new Promise(r => setTimeout(r, minDur - elapsed));
      }

      const assistantMsg = { role: 'assistant', content };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      saveConversationMessages(convId, finalMessages);
      const newCredits = addCredit();
      setCreditsUsed(newCredits);

      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const disc = { id: convId, title: text.slice(0, 50), preview: text, date: new Date().toISOString().slice(0, 10), model: mode.label, agent: currentAgent };
        const existing = stored.findIndex(d => d.id === convId);
        if (existing >= 0) stored[existing] = { ...stored[existing], ...disc };
        else stored.unshift(disc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(0, 20)));
      } catch {}
    } catch {
      const elapsed = Date.now() - startTime;
      const minDur = MIN_DURATIONS[mode.id] || 0;
      if (elapsed < minDur) await new Promise(r => setTimeout(r, minDur - elapsed));
      setMessages(prev => [...prev, { role: 'assistant', content: 'Une erreur est survenue. Veuillez réessayer.' }]);
    }
    setIsLoading(false);
  };

  const editMessage = (idx) => {
    setInput(messages[idx].content);
    setMessages(prev => prev.slice(0, idx));
    textareaRef.current?.focus();
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copié !', { duration: 1200 });
  };

  const toggleRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
    const rec = new SR();
    rec.lang = 'fr-FR'; rec.continuous = true; rec.interimResults = true;
    rec.onresult = (e) => setInput(Array.from(e.results).map(r => r[0].transcript).join(''));
    rec.onend = () => setIsRecording(false);
    rec.start(); recognitionRef.current = rec; setIsRecording(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background font-be">
      {/* Top bar */}
      <div className="flex items-center px-4 py-3 border-b border-border flex-shrink-0 bg-background/95" style={{ backdropFilter: 'blur(12px)' }}>
        <button onClick={() => navigate('/')} className="w-8 h-8 rounded-lg hover:bg-foreground/5 flex items-center justify-center transition-colors mr-3 flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-foreground/60" />
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <img src={LOGO_URL} alt="Stensor" className="w-7 h-7 object-contain flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground leading-tight">Stensor</p>
            <div className="flex items-center gap-1">
              <ModeIcon className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground truncate">{mode.label} · {agentLabel || 'Agent Global'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => navigate('/pricing')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: 'white', boxShadow: '0 2px 14px rgba(124,58,237,0.4)' }}>
            <Zap className="w-3 h-3" /> Upgrade
          </button>
          <button ref={profileBtnRef} onClick={() => setProfileOpen(p => !p)}
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0 hover:opacity-80 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #1E0050, #3b0080)' }}>
            {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
            <img src={LOGO_URL} alt="Stensor" className="w-10 h-10 object-contain" />
            <p className="text-sm text-muted-foreground">Démarrez la conversation...</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className={`flex items-end gap-3 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <img src={LOGO_URL} alt="Stensor" className="w-5 h-5 object-contain flex-shrink-0 mb-1 opacity-80" />
            )}
            <div className={`max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' ? 'text-white rounded-br-sm' : 'bg-card border border-border text-foreground rounded-bl-sm'
              }`} style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #1E0050, #3b0080)' } : {}}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{msg.content}</ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyMessage(msg.content)}
                    className="w-6 h-6 rounded-lg bg-foreground/6 hover:bg-foreground/10 flex items-center justify-center transition-colors">
                    <Copy className="w-3 h-3 text-foreground/50" />
                  </button>
                  <button onClick={() => editMessage(idx)}
                    className="w-6 h-6 rounded-lg bg-foreground/6 hover:bg-foreground/10 flex items-center justify-center transition-colors">
                    <Pencil className="w-3 h-3 text-foreground/50" />
                  </button>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <span className="text-xs font-semibold flex-shrink-0 mb-1" style={{ color: 'rgba(58,0,136,0.5)' }}>
                {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Moi'}
              </span>
            )}
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start items-end gap-3">
            <img src={LOGO_URL} alt="Stensor" className="w-5 h-5 object-contain flex-shrink-0 mb-1 opacity-80" />
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm shadow-sm">
              <ChatLoadingAnimation mode={mode.id} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {blocked && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-2 px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #1E0050, #3b0080)', border: '1px solid rgba(167,139,250,0.3)' }}
          onClick={() => navigate('/pricing')}>
          <div>
            <p className="text-sm font-bold text-white">Limite atteinte</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Passez à un forfait supérieur</p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: 'rgba(167,139,250,0.3)' }}>Upgrade →</span>
        </motion.div>
      )}

      {/* Input */}
      <div className="px-4 pb-5 flex-shrink-0 relative">
        <AnimatePresence>
          {showAtMenu && (
            <motion.div ref={atMenuRef} {...popUp}
              className="absolute left-4 right-4 bottom-full mb-2 rounded-xl overflow-hidden shadow-lg z-50 bg-card border border-border">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground">@ Agents & Modes</p>
              </div>
              <div className="max-h-52 overflow-y-auto">
                {filteredAgents.length > 0 && (
                  <div className="px-2 py-1">
                    <p className="text-[10px] px-2 py-1 font-semibold uppercase tracking-wider text-muted-foreground">Agents</p>
                    {filteredAgents.map(agent => (
                      <button key={agent.id} onClick={() => selectAtAgent(agent)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left hover:bg-foreground/5 transition-colors ${currentAgent === agent.id ? 'text-primary font-semibold' : 'text-foreground/70'}`}>
                        <Bot className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{agent.label}</span>
                        {currentAgent === agent.id && <span className="ml-auto text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">actif</span>}
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

        <div className="rounded-2xl overflow-visible"
          style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 20px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)' }}>
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap p-3 pb-0">
              {files.map((file, idx) => (
                <div key={idx} className="relative w-14 h-14 rounded-xl border border-border bg-muted flex flex-col items-center justify-center overflow-hidden group p-1">
                  <FileText className="w-4 h-4 text-muted-foreground mb-0.5" />
                  <span className="text-[8px] text-muted-foreground text-center leading-tight line-clamp-2">{file.name}</span>
                  <button onClick={() => setFiles(p => p.filter((_, i) => i !== idx))} className="absolute top-0.5 right-0.5 w-4 h-4 bg-background/90 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 flex">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="px-4 pt-3.5 pb-1">
            <textarea ref={textareaRef} value={input} onChange={handleInputChange}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder={blocked ? 'Passez à un forfait supérieur...' : 'Écrivez un message... (@ pour agents & modes)'}
              disabled={blocked} rows={2}
              className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-foreground/30 focus:outline-none leading-relaxed"
            />
          </div>
          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex items-center gap-1">
              <div className="relative" ref={fileMenuRef}>
                <button onClick={() => setShowFileMenu(!showFileMenu)} className="w-7 h-7 rounded-lg hover:bg-foreground/6 flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5 text-foreground/35" />
                </button>
                <AnimatePresence>
                  {showFileMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[140px] z-50">
                      <button onClick={() => { fileInputRef.current?.click(); setShowFileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-foreground/5 text-foreground/70">
                        <FileText className="w-3.5 h-3.5" /> Joindre fichier
                      </button>
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={agentMenuRef}>
                <button onClick={() => setShowAgentMenu(!showAgentMenu)} className="h-7 px-2.5 rounded-lg hover:bg-foreground/6 flex items-center gap-1 transition-colors">
                  <Bot className="w-3 h-3 text-foreground/35" />
                  <span className="text-[11px] text-foreground/45 font-medium">{agentLabel?.split(' ')[0] || 'Agent'}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-foreground/30" />
                </button>
                <AnimatePresence>
                  {showAgentMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[200px] z-50">
                      {AGENTS.map(a => (
                        <button key={a.id} onClick={() => { setCurrentAgent(a.id); setShowAgentMenu(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-left ${currentAgent === a.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-foreground/5 text-foreground/70'}`}>
                          <Bot className="w-3 h-3" /> {a.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative" ref={modeMenuRef}>
                <button onClick={() => setShowModeMenu(!showModeMenu)} className="w-7 h-7 rounded-lg hover:bg-foreground/6 flex items-center justify-center transition-colors">
                  <SlidersHorizontal className="w-3 h-3 text-foreground/35" />
                </button>
                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[180px] z-50">
                      {MODES.map(m => {
                        const Icon = m.icon;
                        return (
                          <button key={m.id} onClick={() => { setMode(m); setShowModeMenu(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-left mb-0.5 ${mode.id === m.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-foreground/5 text-foreground/70'}`}>
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

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-foreground/40 hidden sm:block">{mode.label}</span>
              <button onClick={toggleRecording} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-foreground text-background' : 'hover:bg-foreground/6'}`}>
                {isRecording ? (
                  <div className="flex items-end gap-0.5 h-3">
                    {[0,1,2].map(i => <motion.div key={i} className="w-0.5 bg-background rounded-full" animate={{ height: ['3px','10px','3px'] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }} />)}
                  </div>
                ) : <Mic className="w-3 h-3 text-foreground/35" />}
              </button>
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading || blocked}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: input.trim() && !isLoading && !blocked ? 'linear-gradient(135deg, #1E0050, #3b0080)' : 'rgba(0,0,0,0.05)',
                  color: input.trim() && !isLoading && !blocked ? 'white' : 'rgba(0,0,0,0.2)',
                  cursor: !input.trim() || isLoading || blocked ? 'not-allowed' : 'pointer',
                  boxShadow: input.trim() && !isLoading && !blocked ? '0 2px 10px rgba(30,0,80,0.3)' : 'none',
                }}>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChatProfilePopover open={profileOpen} onClose={() => setProfileOpen(false)} anchorRef={profileBtnRef} user={user} />
    </div>
  );
}