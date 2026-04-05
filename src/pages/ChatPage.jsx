import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, SlidersHorizontal, Mic, X, FileText, Bot, ChevronDown, Zap, Brain, Star, Crown, Send, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { getCreditsUsed, getCreditsLimit, addCredit, isBlocked as checkBlocked } from '@/lib/credits';
import { AGENTS } from '@/components/Sidebar';

const STORAGE_KEY = 'discussions_v1';
const MESSAGES_KEY = 'discussion_messages_v1';

const MODES = [
  { id: 'ultimate', label: 'Ultimate', icon: Crown, model: 'claude_opus_4_6', desc: 'Le plus puissant' },
  { id: 'pro', label: 'Pro', icon: Star, model: 'gemini_3_1_pro', desc: 'Gemini 3 Pro' },
  { id: 'thinking', label: 'Thinking', icon: Brain, model: 'gemini_3_1_pro', desc: 'Raisonnement profond' },
  { id: 'fast', label: 'Fast', icon: Zap, model: 'gemini_3_flash', desc: 'Rapide & efficace' },
];

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
  const [creditsLimit, setCreditsLimit] = useState(getCreditsLimit());

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const modeMenuRef = useRef(null);
  const agentMenuRef = useRef(null);
  const fileMenuRef = useRef(null);
  const atMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const blocked = !isAdmin && creditsUsed >= creditsLimit;
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);
  const remaining = Math.max(creditsLimit - creditsUsed, 0);

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
    if (lastAt !== -1 && lastAt === val.length - 1) {
      setAtQuery('');
      setShowAtMenu(true);
    } else if (lastAt !== -1 && val.slice(lastAt + 1).length > 0 && !val.slice(lastAt + 1).includes(' ')) {
      setAtQuery(val.slice(lastAt + 1).toLowerCase());
      setShowAtMenu(true);
    } else {
      setShowAtMenu(false);
    }
  };

  const selectAtAgent = (agent) => {
    const lastAt = input.lastIndexOf('@');
    const newInput = input.slice(0, lastAt) + `@${agent.label} `;
    setInput(newInput);
    setCurrentAgent(agent.id);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const selectAtMode = (m) => {
    const lastAt = input.lastIndexOf('@');
    const newInput = input.slice(0, lastAt) + `@${m.label} `;
    setInput(newInput);
    setMode(m);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const sendMessage = async (text) => {
    if (!text?.trim() || isLoading || blocked) return;
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

      // Save discussion
      const disc = { id: convId, title: text.slice(0, 50), preview: text, date: new Date().toISOString().slice(0, 10), model: mode.label, agent: currentAgent };
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const existing = stored.findIndex(d => d.id === convId);
        if (existing >= 0) stored[existing] = { ...stored[existing], ...disc };
        else stored.unshift(disc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(0, 20)));
      } catch {}
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Une erreur est survenue. Veuillez réessayer.' }]);
    }
    setIsLoading(false);
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

  const agentLabel = AGENTS.find(a => a.id === currentAgent)?.label;
  const filteredAgents = AGENTS.filter(a => a.label.toLowerCase().includes(atQuery));
  const filteredModes = MODES.filter(m => m.label.toLowerCase().includes(atQuery));

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
            <p className="text-[10px] text-muted-foreground">{mode.label} · {messages.length} message{messages.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Credits indicator */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full overflow-hidden bg-foreground/8">
              <motion.div
                animate={{ width: `${pct}%` }}
                className="h-full rounded-full"
                style={{ background: blocked ? '#ef4444' : 'linear-gradient(90deg, #7c3aed, #6366f1)' }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">{isAdmin ? '∞' : `${remaining} cr.`}</span>
          </div>
          <button onClick={() => navigate('/pricing')} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}>
            <TrendingUp className="w-3.5 h-3.5 inline mr-1" />Upgrade
          </button>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 mt-1 flex-shrink-0" style={{ background: '#1E0050' }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'text-white rounded-br-sm'
                : 'bg-card border border-border text-foreground rounded-bl-sm'
            }`}
              style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #1E0050, #3b0080)' } : {}}
            >
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
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mr-2 flex-shrink-0" style={{ background: '#1E0050' }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 bg-foreground/30 rounded-full"
                    animate={{ y: [0, -5, 0] }}
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
      {blocked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-2 px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #1E0050, #3b0080)', border: '1px solid rgba(167,139,250,0.3)' }}
          onClick={() => navigate('/pricing')}
        >
          <div>
            <p className="text-sm font-bold text-white">Vous avez atteint votre limite</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Passez à un forfait supérieur pour continuer</p>
          </div>
          <div className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: 'rgba(167,139,250,0.3)' }}>
            Mettre à niveau →
          </div>
        </motion.div>
      )}

      {/* Input area */}
      <div className="px-4 pb-4 flex-shrink-0 relative">
        {/* @ menu — shows ABOVE input */}
        <AnimatePresence>
          {showAtMenu && (
            <motion.div
              ref={atMenuRef}
              {...popUp}
              className="absolute left-4 right-4 bottom-full mb-2 rounded-2xl overflow-hidden shadow-2xl z-50"
              style={{ background: '#1E0050', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-bold text-white">@ Sélectionner un agent ou mode</p>
              </div>
              {filteredAgents.length > 0 && (
                <div className="px-2 py-1">
                  <p className="text-[10px] px-2 py-1 font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Agents</p>
                  {filteredAgents.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => selectAtAgent(agent)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-all"
                      style={{ color: currentAgent === agent.id ? 'white' : 'rgba(255,255,255,0.7)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Bot className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
                      <span className="font-medium">{agent.label}</span>
                      {currentAgent === agent.id && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(167,139,250,0.3)', color: '#a78bfa' }}>actif</span>}
                    </button>
                  ))}
                </div>
              )}
              {filteredModes.length > 0 && (
                <div className="px-2 pb-2">
                  <p className="text-[10px] px-2 py-1 font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Modes</p>
                  {filteredModes.map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => selectAtMode(m)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
                        style={{ color: mode.id === m.id ? 'white' : 'rgba(255,255,255,0.7)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#a78bfa' }} />
                        <div>
                          <p className="text-sm font-medium">{m.label}</p>
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{m.desc}</p>
                        </div>
                        {mode.id === m.id && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(167,139,250,0.3)', color: '#a78bfa' }}>actif</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-card border border-border rounded-2xl p-3 shadow-sm">
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {files.map((file, idx) => (
                <div key={idx} className="relative w-14 h-14 rounded-lg border border-border bg-muted flex flex-col items-center justify-center overflow-hidden group p-1">
                  <FileText className="w-4 h-4 text-muted-foreground mb-0.5" />
                  <span className="text-[8px] text-muted-foreground text-center leading-tight line-clamp-2">{file.name}</span>
                  <button onClick={() => setFiles(p => p.filter((_, i) => i !== idx))} className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-background/80 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex">
                    <X className="w-2 h-2" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder={blocked ? 'Passez à un forfait supérieur pour continuer...' : 'Écrivez un message... (@ pour options)'}
            disabled={blocked}
            rows={2}
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              {/* File */}
              <div className="relative" ref={fileMenuRef}>
                <button onClick={() => setShowFileMenu(!showFileMenu)} className="w-7 h-7 rounded-lg bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-foreground/50" />
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

              {/* Agent */}
              <div className="relative" ref={agentMenuRef}>
                <button onClick={() => setShowAgentMenu(!showAgentMenu)} className="h-7 px-2 rounded-lg bg-foreground/5 flex items-center gap-1 hover:bg-foreground/10 transition-colors">
                  <Bot className="w-3 h-3 text-foreground/50" />
                  <span className="text-[11px] text-foreground/60">{agentLabel?.split(' ')[0] || 'Agent'}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-foreground/40" />
                </button>
                <AnimatePresence>
                  {showAgentMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[200px] z-50">
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
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-xl p-1.5 min-w-[180px] z-50">
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
              <span className="text-[11px] text-muted-foreground hidden sm:block">{mode.label}</span>
              <button onClick={toggleRecording} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-foreground text-background' : 'bg-foreground/5 hover:bg-foreground/10'}`}>
                {isRecording ? (
                  <div className="flex items-end gap-0.5 h-3">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-0.5 bg-background rounded-full" animate={{ height: ['3px', '10px', '3px'] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.12 }} />
                    ))}
                  </div>
                ) : (
                  <Mic className="w-3 h-3 text-foreground/50" />
                )}
              </button>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading || blocked}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background: input.trim() && !isLoading && !blocked ? 'linear-gradient(135deg, #1E0050, #3b0080)' : 'rgba(0,0,0,0.06)',
                  color: input.trim() && !isLoading && !blocked ? 'white' : 'rgba(0,0,0,0.3)',
                  cursor: !input.trim() || isLoading || blocked ? 'not-allowed' : 'pointer'
                }}
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