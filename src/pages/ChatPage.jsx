import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, SlidersHorizontal, Mic, X, FileText, Bot,
  ChevronDown, Zap, Brain, Star, Crown, Send, Copy, Pencil, Settings, TrendingUp
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { AGENTS } from '@/components/Sidebar';
import { getAgentConfig } from '@/lib/agents-config';
import ChatLoadingAnimation from '@/components/chat/ChatLoadingAnimation';
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
  initial: { opacity: 0, y: 6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.97 },
  transition: { duration: 0.1 },
};

function getConversationMessages(convId) {
  try { return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '{}')[convId] || []; }
  catch { return []; }
}
function saveConversationMessages(convId, msgs) {
  try {
    const all = JSON.parse(localStorage.getItem(MESSAGES_KEY) || '{}');
    all[convId] = msgs;
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
  } catch {}
}

export default function ChatPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initialQ = urlParams.get('q') || '';
  const modeId = urlParams.get('mode') || 'fast';
  const agentId = urlParams.get('agent') || 'global';
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsLimit, setCreditsLimit] = useState(25);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const modeMenuRef = useRef(null);
  const agentMenuRef = useRef(null);
  const fileMenuRef = useRef(null);
  const atMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const profileBtnRef = useRef(null);
  const profilePopRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const blocked = !isAdmin && creditsUsed >= creditsLimit;
  const agentLabel = AGENTS.find(a => a.id === currentAgent)?.label;
  const filteredAgents = AGENTS.filter(a => a.label.toLowerCase().includes(atQuery));
  const filteredModes = MODES.filter(m => m.label.toLowerCase().includes(atQuery));
  const ModeIcon = mode.icon;
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setCreditsUsed(u?.credits_used ?? 0);
      setCreditsLimit(u?.credits_limit ?? 25);
    }).catch(() => {});
  }, []);

  useEffect(() => { if (initialQ && messages.length === 0) sendMessage(initialQ); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) setShowModeMenu(false);
      if (agentMenuRef.current && !agentMenuRef.current.contains(e.target)) setShowAgentMenu(false);
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) setShowFileMenu(false);
      if (atMenuRef.current && !atMenuRef.current.contains(e.target)) setShowAtMenu(false);
      if (profileOpen && profilePopRef.current && !profilePopRef.current.contains(e.target) &&
          profileBtnRef.current && !profileBtnRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

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
    setFiles([]);
    setIsLoading(true);

    try {
      let content;
      if (isTestMode) {
        const minDur = MIN_DURATIONS[mode.id] || 6000;
        await new Promise(r => setTimeout(r, minDur));
        content = 'bonjour et voilà';
      } else {
        // Upload files if any
        let file_urls = [];
        if (files.length > 0) {
          for (const file of files) {
            try {
              const { file_url } = await base44.integrations.Core.UploadFile({ file });
              file_urls.push(file_url);
            } catch {}
          }
        }

        const agentConfig = currentAgent ? getAgentConfig(currentAgent) : null;
        const systemContext = agentConfig?.instructions
          ? `${agentConfig.instructions}${agentConfig.knowledge ? '\n\nBase de connaissances:\n' + agentConfig.knowledge : ''}\n\n`
          : (agentLabel ? `Tu es l'agent ${agentLabel}. ` : '');

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: systemContext + text,
          model: mode.model,
          ...(file_urls.length > 0 ? { file_urls } : {}),
        });
        content = typeof result === 'string' ? result : JSON.stringify(result);

        const elapsed = Date.now() - startTime;
        const minDur = MIN_DURATIONS[mode.id] || 0;
        if (elapsed < minDur) await new Promise(r => setTimeout(r, minDur - elapsed));
      }

      const assistantMsg = { role: 'assistant', content };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      saveConversationMessages(convId, finalMessages);

      // Update credits on User entity
      if (!isAdmin && user) {
        const newUsed = (user.credits_used || 0) + 1;
        await base44.entities.User.update(user.id, { credits_used: newUsed });
        setCreditsUsed(newUsed);
      }

      // Save to discussion history
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const disc = { id: convId, title: text.slice(0, 50), preview: text, date: new Date().toISOString().slice(0, 10), model: mode.label, agent: currentAgent };
        const existing = stored.findIndex(d => d.id === convId);
        if (existing >= 0) stored[existing] = { ...stored[existing], ...disc };
        else stored.unshift(disc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(0, 50)));
      } catch {}
    } catch {
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
    toast.success('Copié !', { duration: 1000 });
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

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  const userName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Moi';

  return (
    <div className="flex flex-col h-screen font-be" style={{ background: '#f8f7ff' }}>

      {/* Top bar */}
      <div className="flex items-center px-4 h-14 flex-shrink-0 z-20 relative"
        style={{ background: 'rgba(248,247,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(30,0,80,0.08)' }}>
        <button onClick={() => navigate('/')}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors mr-3 flex-shrink-0 hover:bg-black/5">
          <ArrowLeft className="w-4 h-4" style={{ color: 'rgba(30,0,80,0.5)' }} />
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold" style={{ color: '#1E0050' }}>Stensor</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background: 'rgba(30,0,80,0.08)', color: 'rgba(30,0,80,0.6)' }}>
                {mode.label}
              </span>
            </div>
            <p className="text-[10px]" style={{ color: 'rgba(30,0,80,0.4)' }}>{agentLabel || 'Agent Global'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isAdmin && (
            <button onClick={() => setShowUpgradeOverlay(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: 'rgba(30,0,80,0.06)', color: 'rgba(30,0,80,0.7)', border: '1px solid rgba(30,0,80,0.1)' }}>
              <TrendingUp className="w-3 h-3" /> Upgrade
            </button>
          )}
          <button ref={profileBtnRef} onClick={() => setProfileOpen(p => !p)}
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0 transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #1E0050, #5b21b6)' }}>
            {userInitial}
          </button>
        </div>

        {/* Profile popover */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div ref={profilePopRef}
              initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
              className="absolute right-4 top-full mt-2 w-72 rounded-2xl z-50 overflow-hidden"
              style={{ background: 'white', border: '1px solid rgba(30,0,80,0.1)', boxShadow: '0 20px 60px rgba(30,0,80,0.15)' }}>
              <div className="px-4 py-4" style={{ background: 'linear-gradient(135deg, #1E0050 0%, #5b21b6 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base text-white"
                    style={{ background: 'rgba(255,255,255,0.2)' }}>
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user?.full_name || 'Utilisateur'}</p>
                    <p className="text-[11px] text-white/60">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-3">
                {!isAdmin && (
                  <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(30,0,80,0.04)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold" style={{ color: 'rgba(30,0,80,0.6)' }}>Crédits consommés</span>
                      <span className="text-xs font-bold" style={{ color: '#1E0050' }}>{creditsUsed} / {creditsLimit}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,0,80,0.1)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 90 ? '#ef4444' : 'linear-gradient(90deg, #1E0050, #7c3aed)' }} />
                    </div>
                  </div>
                )}
                <button onClick={() => { setShowUpgradeOverlay(true); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
                  style={{ color: '#1E0050' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,0,80,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <TrendingUp className="w-4 h-4" style={{ color: '#7c3aed' }} />
                  <span className="font-medium">Mettre à niveau</span>
                </button>
                <button onClick={() => { navigate('/admin/products'); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
                  style={{ color: '#1E0050' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,0,80,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground/70">Paramètres</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
            <img src={LOGO_URL} alt="Stensor" className="w-12 h-12 object-contain" />
            <p className="text-sm text-muted-foreground">Démarrez la conversation…</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
            className={`flex gap-3 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 mt-1">
                <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain opacity-75" />
              </div>
            )}
            <div className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end max-w-[72%]' : 'items-start max-w-[82%]'}`}>
              <p className="text-[10px] font-semibold px-1" style={{ color: 'rgba(30,0,80,0.35)' }}>
                {msg.role === 'user' ? userName : 'Stensor'}
              </p>
              <div className={`rounded-2xl text-sm leading-7 ${
                msg.role === 'user'
                  ? 'px-4 py-3 text-white rounded-tr-sm'
                  : 'px-4 py-3.5 rounded-tl-sm'
              }`} style={msg.role === 'user'
                ? { background: 'linear-gradient(135deg, #1E0050, #4c1d95)', boxShadow: '0 4px 20px rgba(30,0,80,0.25)' }
                : { background: 'white', border: '1px solid rgba(30,0,80,0.08)', boxShadow: '0 2px 12px rgba(30,0,80,0.06)' }}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:my-2 prose-li:my-0.5">
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyMessage(msg.content)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-black/8">
                    <Copy className="w-3 h-3" style={{ color: 'rgba(30,0,80,0.35)' }} />
                  </button>
                  <button onClick={() => editMessage(idx)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-black/8">
                    <Pencil className="w-3 h-3" style={{ color: 'rgba(30,0,80,0.35)' }} />
                  </button>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-6"
                style={{ background: 'linear-gradient(135deg, #1E0050, #5b21b6)' }}>
                {userInitial}
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
            <div className="flex-shrink-0 mt-1">
              <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain opacity-75" />
            </div>
            <div className="flex flex-col gap-1.5 items-start">
              <p className="text-[10px] font-semibold px-1" style={{ color: 'rgba(30,0,80,0.35)' }}>Stensor</p>
              <div className="rounded-2xl rounded-tl-sm overflow-hidden"
                style={{ background: 'white', border: '1px solid rgba(30,0,80,0.08)', boxShadow: '0 2px 12px rgba(30,0,80,0.06)' }}>
                <ChatLoadingAnimation mode={mode.id} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Blocked banner */}
      {blocked && (
        <div className="px-4 pb-2 max-w-3xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #1E0050, #4c1d95)', border: '1px solid rgba(167,139,250,0.3)' }}
            onClick={() => setShowUpgradeOverlay(true)}>
            <div>
              <p className="text-sm font-bold text-white">Crédits épuisés</p>
              <p className="text-xs mt-0.5 text-white/60">Passez à un forfait supérieur pour continuer</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: 'rgba(255,255,255,0.15)' }}>Upgrade →</span>
          </motion.div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-5 pt-2 flex-shrink-0 relative max-w-3xl mx-auto w-full">
        <AnimatePresence>
          {showAtMenu && (
            <motion.div ref={atMenuRef} {...popUp}
              className="absolute left-4 right-4 bottom-full mb-2 rounded-xl overflow-hidden shadow-xl z-50"
              style={{ background: 'white', border: '1px solid rgba(30,0,80,0.1)' }}>
              <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(30,0,80,0.06)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(30,0,80,0.4)' }}>@ Agents & Modes</p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredAgents.map(agent => (
                  <button key={agent.id} onClick={() => selectAtAgent(agent)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-primary/5">
                    <Bot className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentAgent === agent.id ? '#7c3aed' : 'rgba(30,0,80,0.35)' }} />
                    <span style={{ color: currentAgent === agent.id ? '#7c3aed' : 'rgba(30,0,80,0.7)' }} className="font-medium">{agent.label}</span>
                    {currentAgent === agent.id && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">actif</span>}
                  </button>
                ))}
                {filteredModes.map(m => {
                  const Icon = m.icon;
                  return (
                    <button key={m.id} onClick={() => selectAtMode(m)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-primary/5">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: mode.id === m.id ? '#7c3aed' : 'rgba(30,0,80,0.35)' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'rgba(30,0,80,0.8)' }}>{m.label}</p>
                        <p className="text-[10px]" style={{ color: 'rgba(30,0,80,0.4)' }}>{m.desc}</p>
                      </div>
                      {mode.id === m.id && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">actif</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-2xl overflow-visible"
          style={{ background: 'white', border: '1px solid rgba(30,0,80,0.1)', boxShadow: '0 4px 24px rgba(30,0,80,0.08)' }}>

          {/* File previews */}
          {files.length > 0 && (
            <div className="flex gap-2 flex-wrap px-3 pt-3">
              {files.map((file, idx) => (
                <div key={idx} className="relative flex items-center gap-2 px-3 py-2 rounded-xl group"
                  style={{ background: 'rgba(30,0,80,0.05)', border: '1px solid rgba(30,0,80,0.1)' }}>
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7c3aed' }} />
                  <span className="text-[11px] font-medium max-w-[100px] truncate" style={{ color: 'rgba(30,0,80,0.7)' }}>{file.name}</span>
                  <button onClick={() => setFiles(p => p.filter((_, i) => i !== idx))}
                    className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(30,0,80,0.15)' }}>
                    <X className="w-2.5 h-2.5" style={{ color: '#1E0050' }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 pt-3.5 pb-1">
            <textarea ref={textareaRef} value={input} onChange={handleInputChange}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder={blocked ? 'Crédits épuisés — mettez à niveau pour continuer' : 'Message… (@ pour agents & modes)'}
              disabled={blocked} rows={2}
              className="w-full resize-none bg-transparent text-sm focus:outline-none leading-relaxed break-words"
              style={{ color: '#1E0050', caretColor: '#7c3aed' }}
            />
          </div>

          <div className="flex items-center justify-between px-3 pb-3 gap-2">
            <div className="flex items-center gap-0.5">
              {/* File button */}
              <div className="relative" ref={fileMenuRef}>
                <button onClick={() => setShowFileMenu(!showFileMenu)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5">
                  <Plus className="w-3.5 h-3.5" style={{ color: 'rgba(30,0,80,0.35)' }} />
                </button>
                <AnimatePresence>
                  {showFileMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 rounded-xl shadow-xl p-1.5 min-w-[150px] z-50"
                      style={{ background: 'white', border: '1px solid rgba(30,0,80,0.1)' }}>
                      <button onClick={() => { fileInputRef.current?.click(); setShowFileMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors text-left hover:bg-primary/5"
                        style={{ color: 'rgba(30,0,80,0.7)' }}>
                        <FileText className="w-3.5 h-3.5" style={{ color: '#7c3aed' }} /> Joindre un fichier
                      </button>
                      <input ref={fileInputRef} type="file" multiple className="hidden"
                        onChange={(e) => { setFiles(p => [...p, ...Array.from(e.target.files || [])]); setShowFileMenu(false); }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Agent button */}
              <div className="relative" ref={agentMenuRef}>
                <button onClick={() => setShowAgentMenu(!showAgentMenu)}
                  className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 transition-colors hover:bg-black/5">
                  <Bot className="w-3 h-3" style={{ color: 'rgba(30,0,80,0.35)' }} />
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(30,0,80,0.45)' }}>
                    {agentLabel?.split(' ')[0] || 'Agent'}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5" style={{ color: 'rgba(30,0,80,0.25)' }} />
                </button>
                <AnimatePresence>
                  {showAgentMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 rounded-xl shadow-xl p-1.5 min-w-[190px] z-50"
                      style={{ background: 'white', border: '1px solid rgba(30,0,80,0.1)' }}>
                      {AGENTS.map(a => (
                        <button key={a.id} onClick={() => { setCurrentAgent(a.id); setShowAgentMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors text-left"
                          style={{ color: currentAgent === a.id ? '#7c3aed' : 'rgba(30,0,80,0.7)', background: currentAgent === a.id ? 'rgba(124,58,237,0.06)' : 'transparent' }}
                          onMouseEnter={e => { if (currentAgent !== a.id) e.currentTarget.style.background = 'rgba(30,0,80,0.04)'; }}
                          onMouseLeave={e => { if (currentAgent !== a.id) e.currentTarget.style.background = 'transparent'; }}>
                          <Bot className="w-3 h-3" /> <span className="font-medium">{a.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode button */}
              <div className="relative" ref={modeMenuRef}>
                <button onClick={() => setShowModeMenu(!showModeMenu)}
                  className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 transition-colors hover:bg-black/5">
                  <SlidersHorizontal className="w-3 h-3" style={{ color: 'rgba(30,0,80,0.35)' }} />
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(30,0,80,0.45)' }}>{mode.label}</span>
                </button>
                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 rounded-xl shadow-xl p-1.5 min-w-[180px] z-50"
                      style={{ background: 'white', border: '1px solid rgba(30,0,80,0.1)' }}>
                      {MODES.map(m => {
                        const Icon = m.icon;
                        return (
                          <button key={m.id} onClick={() => { setMode(m); setShowModeMenu(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-colors text-left"
                            style={{ color: mode.id === m.id ? '#7c3aed' : 'rgba(30,0,80,0.7)', background: mode.id === m.id ? 'rgba(124,58,237,0.06)' : 'transparent' }}
                            onMouseEnter={e => { if (mode.id !== m.id) e.currentTarget.style.background = 'rgba(30,0,80,0.04)'; }}
                            onMouseLeave={e => { if (mode.id !== m.id) e.currentTarget.style.background = 'transparent'; }}>
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold">{m.label}</p>
                              <p className="text-[9px] opacity-60">{m.desc}</p>
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
              {/* Mic button */}
              <button onClick={toggleRecording}
                className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all overflow-hidden"
                style={{ background: isRecording ? 'linear-gradient(135deg, #1E0050, #7c3aed)' : 'rgba(30,0,80,0.05)' }}>
                {isRecording ? (
                  <div className="flex items-end gap-0.5 h-4">
                    {[0, 1, 2, 3].map(i => (
                      <motion.div key={i} className="w-0.5 rounded-full bg-white"
                        animate={{ height: ['3px', '14px', '6px', '10px', '3px'] }}
                        transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15, ease: 'easeInOut' }} />
                    ))}
                  </div>
                ) : (
                  <Mic className="w-3.5 h-3.5" style={{ color: 'rgba(30,0,80,0.4)' }} />
                )}
              </button>

              {/* Send button */}
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading || blocked}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: input.trim() && !isLoading && !blocked ? 'linear-gradient(135deg, #1E0050, #5b21b6)' : 'rgba(30,0,80,0.06)',
                  boxShadow: input.trim() && !isLoading && !blocked ? '0 2px 12px rgba(30,0,80,0.3)' : 'none',
                  cursor: !input.trim() || isLoading || blocked ? 'not-allowed' : 'pointer',
                }}>
                <Send className="w-3.5 h-3.5" style={{ color: input.trim() && !isLoading && !blocked ? 'white' : 'rgba(30,0,80,0.2)' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade overlay */}
      <AnimatePresence>
        {showUpgradeOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowUpgradeOverlay(false); }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm rounded-3xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 40px 80px rgba(0,0,0,0.3)' }}>
              <div className="px-6 pt-6 pb-4" style={{ background: 'linear-gradient(135deg, #1E0050, #5b21b6)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-bold text-white">Passer à Pro</p>
                  <button onClick={() => setShowUpgradeOverlay(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="text-sm text-white/70">Débloquez tous les modes et agents IA</p>
              </div>
              <div className="p-6">
                <button onClick={() => { navigate('/pricing'); setShowUpgradeOverlay(false); }}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1E0050, #5b21b6)', boxShadow: '0 4px 20px rgba(30,0,80,0.3)' }}>
                  Voir les forfaits →
                </button>
                <button onClick={() => setShowUpgradeOverlay(false)}
                  className="w-full mt-2 py-2.5 rounded-2xl text-sm font-medium text-muted-foreground hover:bg-foreground/5 transition-colors">
                  Plus tard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}