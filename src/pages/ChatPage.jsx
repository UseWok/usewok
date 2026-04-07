import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, SlidersHorizontal, Mic, X, FileText, Bot,
  ChevronDown, Brain, Star, Crown, Send, Copy, Pencil, TrendingUp, Wifi, WifiOff, Lock, Check, Zap
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { AGENTS } from '@/components/Sidebar';
import { getAgentConfig } from '@/lib/agents-config';
import ChatLoadingAnimation from '@/components/chat/ChatLoadingAnimation';
import FilePreviewPanel from '@/components/chat/FilePreviewPanel';
import { getUserPlan } from '@/lib/plans-config';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';

const STORAGE_KEY = 'discussions_v1';
const MESSAGES_KEY = 'discussion_messages_v1';
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';
const CORAL = '#FF4F00';
const MAX_VISIBLE_FILES = 3;

const ALL_MODES = [
  { id: 'ultimate', label: 'Expert', icon: Crown, model: 'claude_opus_4_6', desc: 'Le plus puissant', requiredPlan: 'expert' },
  { id: 'pro', label: 'Avancé', icon: Star, model: 'gemini_3_1_pro', desc: 'Analyse avancée', requiredPlan: 'essential' },
  { id: 'thinking', label: 'Standard', icon: Brain, model: 'gemini_3_1_pro', desc: 'Mode standard', requiredPlan: null },
];

const MIN_DURATIONS = { thinking: 0, pro: 0, ultimate: 0 };

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
  const modeId = urlParams.get('mode') || 'thinking';
  const agentId = urlParams.get('agent') || 'global';
  const conversationId = urlParams.get('conversationId') || null;

  const convIdRef = useRef(conversationId || `conv_${Date.now()}`);
  const convId = convIdRef.current;

  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [messages, setMessages] = useState(() => conversationId ? getConversationMessages(conversationId) : []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(ALL_MODES.find(m => m.id === modeId) || ALL_MODES[ALL_MODES.length - 1]);
  const [currentAgent, setCurrentAgent] = useState(agentId);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showAtMenu, setShowAtMenu] = useState(false);
  const [atQuery, setAtQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [showInternetMenu, setShowInternetMenu] = useState(false);
  const { t } = useLanguage();
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [creditsUsed, setCreditsUsed] = useState(0);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const modeMenuRef = useRef(null);
  const agentMenuRef = useRef(null);
  const fileMenuRef = useRef(null);
  const atMenuRef = useRef(null);
  const internetMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  const creditsLimit = userPlan ? userPlan.credits_limit + (user?.credits_bonus || 0) : 10;
  const dailyLimit = user?.daily_credits_limit || userPlan?.daily_credits_limit || 0;
  // Track daily usage
  const todayKey = new Date().toISOString().slice(0, 10);
  const getDailyUsed = () => { try { return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}')[todayKey] || 0; } catch { return 0; } };
  const incrementDailyUsed = () => { try { const d = JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}'); d[todayKey] = (d[todayKey] || 0) + 1; localStorage.setItem('stensor_daily_usage', JSON.stringify(d)); } catch {} };
  const dailyBlocked = dailyLimit > 0 && getDailyUsed() >= dailyLimit;
  const blocked = creditsUsed >= creditsLimit || dailyBlocked;
  const rawAllowedModes = userPlan ? ALL_MODES.filter(m => userPlan.allowed_modes.includes(m.id) || (m.id === 'thinking' && userPlan.allowed_modes.includes('fast'))) : [];
  const allowedModes = rawAllowedModes.length > 0 ? rawAllowedModes : [ALL_MODES[ALL_MODES.length - 1]];
  const canUploadFiles = userPlan?.file_upload || false;
  const hasInternet = userPlan?.internet_access || false;
  const agentLabel = AGENTS.find(a => a.id === currentAgent)?.label || 'Global Agent';
  const filteredAgents = AGENTS.filter(a => (a.label || a.id).toLowerCase().includes(atQuery));
  const filteredModes = allowedModes.filter(m => m.label.toLowerCase().includes(atQuery));
  const ModeIcon = mode.icon;
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);
  const visibleFiles = files.slice(0, MAX_VISIBLE_FILES);
  const extraFiles = files.length > MAX_VISIBLE_FILES ? files.length - MAX_VISIBLE_FILES : 0;

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setCreditsUsed(u?.credits_used ?? 0);
      const plan = getUserPlan(u);
      setUserPlan(plan);
      // Always set highest allowed mode
      const best = ALL_MODES.find(m => plan.allowed_modes.includes(m.id));
      if (best) setMode(best);
      // Web search on by default if allowed
      if (plan.internet_access) setUseWebSearch(true);
      else setUseWebSearch(false);
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
      if (internetMenuRef.current && !internetMenuRef.current.contains(e.target)) setShowInternetMenu(false);
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
    if (!userPlan?.allowed_modes.includes(m.id)) {
      setUpgradeFeature(`Mode ${m.label}`);
      setShowUpgradeOverlay(true);
      return;
    }
    const lastAt = input.lastIndexOf('@');
    setInput(input.slice(0, lastAt) + `@${m.label} `);
    setMode(m);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const handleFileAttach = () => {
    if (!canUploadFiles) {
      setUpgradeFeature(t('attach_file'));
      setShowUpgradeOverlay(true);
      return;
    }
    fileInputRef.current?.click();
    setShowFileMenu(false);
  };

  const sendMessage = async (text) => {
    if (!text?.trim() || isLoading || blocked) return;

    // Check discussion limit
    if (userPlan?.max_discussions > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const existingIds = new Set(stored.map(d => d.id));
        if (!existingIds.has(convId) && stored.length >= userPlan.max_discussions) {
          setUpgradeFeature(`plus de ${userPlan.max_discussions} discussions simultanées`);
          setShowUpgradeOverlay(true);
          return;
        }
      } catch {}
    }

    const startTime = Date.now();
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setFiles([]);
    setIsLoading(true);

    try {
      let file_urls = [];
      if (files.length > 0 && canUploadFiles) {
        for (const file of files) {
          try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            file_urls.push(file_url);
          } catch {}
        }
      }

      const agentConfig = currentAgent ? getAgentConfig(currentAgent) : null;
      const emojiRule = 'IMPORTANT: Ajoute exactement 2 emojis pertinents dans ta réponse, pas plus.';
      const systemContext = agentConfig?.instructions
        ? `${agentConfig.instructions}${agentConfig.knowledge ? '\n\nBase de connaissances:\n' + agentConfig.knowledge : ''}\n\nSois concis et direct. Quand tu utilises du **gras**, mets-le toujours sur sa propre ligne. Pas de réponses trop longues. ${emojiRule}\n\n`
        : `Tu es Stensor, un assistant coach financier IA. Réponds de façon concise et directe. Évite les listes à rallonge. Quand tu utilises du **texte en gras**, mets-le toujours sur sa propre ligne précédée d'une ligne vide. Ceci n'est pas un conseil financier ou en investissement.${agentLabel ? ` Agent actif: ${agentLabel}.` : ''} ${emojiRule}\n\n`;

      const useInternet = useWebSearch && hasInternet && mode.model !== 'claude_opus_4_6';

      const result = await base44.integrations.Core.InvokeLLM({
      prompt: systemContext + text,
      model: mode.model,
      add_context_from_internet: useInternet,
      ...(file_urls.length > 0 ? { file_urls } : {}),
      });
      // ↑ file_urls is now passed correctly to the LLM
      const content = typeof result === 'string' ? result : JSON.stringify(result);

      const elapsed = Date.now() - startTime;
      const minDur = MIN_DURATIONS[mode.id] || 0;
      if (elapsed < minDur) await new Promise(r => setTimeout(r, minDur - elapsed));

      const assistantMsg = { role: 'assistant', content };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      saveConversationMessages(convId, finalMessages);

      if (user) {
        const newUsed = (user.credits_used || 0) + 1;
        await base44.entities.User.update(user.id, { credits_used: newUsed });
        setCreditsUsed(newUsed);
        incrementDailyUsed();
      }

      try {
        // Generate short title from first user message
        let title = text.slice(0, 50);
        if (newMessages.length === 1) {
          const titleResult = await base44.integrations.Core.InvokeLLM({
            prompt: `Génère un titre ultra court (3-5 mots max) pour cette conversation financière. Message: "${text.slice(0, 200)}". Réponds UNIQUEMENT avec le titre, sans guillemets ni ponctuation.`,
            model: 'gemini_3_flash',
          });
          if (typeof titleResult === 'string' && titleResult.trim()) title = titleResult.trim().slice(0, 60);
        }
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const disc = { id: convId, title, preview: text, date: new Date().toISOString().slice(0, 10), model: mode.label, agent: currentAgent };
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
    <div className="flex flex-col h-screen font-be bg-white">
      {/* Hidden file input - always mounted */}
      <input ref={fileInputRef} type="file" multiple className="hidden"
        onChange={(e) => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />

      {/* Top bar */}
      <div className="flex items-center px-4 h-14 flex-shrink-0 z-20 relative bg-white"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <button onClick={() => navigate('/')}
          className="w-8 h-8 rounded-sm flex items-center justify-center transition-colors mr-3 flex-shrink-0 hover:bg-black/5">
          <ArrowLeft className="w-4 h-4" style={{ color: '#888' }} />
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold" style={{ color: FG }}>Stensor</p>
              <span className="text-[10px] px-1.5 py-0.5 font-bold"
                style={{ background: YUZU, color: FG, borderRadius: '2px' }}>
                {mode.label}
              </span>
              {hasInternet && (
                <span className="text-[10px] px-1.5 py-0.5 font-semibold hidden sm:inline-block"
                  style={{ background: 'rgba(0,0,0,0.06)', color: '#555', borderRadius: '2px' }}>
                  Internet
                </span>
              )}
            </div>
            <p className="text-[10px]" style={{ color: '#999' }}>{agentLabel || 'Agent Global'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => { setUpgradeFeature(''); setShowUpgradeOverlay(true); }}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold transition-all"
            style={{ background: YUZU, color: FG, borderRadius: '3px' }}>
            <TrendingUp className="w-3 h-3" /> Upgrade
          </button>
          <div className="w-8 h-8 rounded-sm flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
            style={{ background: FG }}>
            {userInitial}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
            <img src={LOGO_URL} alt="Stensor" className="w-12 h-12 object-contain" />
            <p className="text-sm" style={{ color: '#888' }}>Démarrez la conversation…</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            className={`flex gap-3 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end max-w-[72%]' : 'items-start max-w-[82%]'}`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-1 opacity-90">
                  <img src={LOGO_URL} alt="Stensor" className="w-5 h-5 object-contain" />
                  <span className="text-[10px] font-black" style={{ color: '#0A0A0A', letterSpacing: '-0.01em' }}>Stensor</span>
                </div>
              )}
              {msg.role === 'user' && (
              <p className="text-[10px] font-semibold px-1" style={{ color: '#bbb' }}>
                {userName}
              </p>
              )}
              <div className={`text-sm leading-7 px-4 py-3 ${msg.role === 'user' ? 'rounded-tl-sm' : 'rounded-tr-sm'}`}
                style={msg.role === 'user'
                  ? { background: FG, color: 'white', borderRadius: '4px', borderTopRightRadius: '2px' }
                  : { background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', borderTopLeftRadius: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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
                    className="w-6 h-6 rounded-sm flex items-center justify-center transition-colors hover:bg-black/6">
                    <Copy className="w-3 h-3" style={{ color: '#bbb' }} />
                  </button>
                  <button onClick={() => editMessage(idx)}
                    className="w-6 h-6 rounded-sm flex items-center justify-center transition-colors hover:bg-black/6">
                    <Pencil className="w-3 h-3" style={{ color: '#bbb' }} />
                  </button>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-5 h-5 rounded-sm flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-5"
                style={{ background: FG }}>
                {userInitial}
              </div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 justify-start">
            <div className="flex-shrink-0 mt-1">
              <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain opacity-60" />
            </div>
            <div className="flex flex-col gap-1.5 items-start">
              <p className="text-[10px] font-semibold px-1" style={{ color: '#bbb' }}>Stensor</p>
              <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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
            className="px-4 py-3 flex items-center justify-between cursor-pointer"
            style={{ background: FG, borderRadius: '4px' }}
            onClick={() => setShowUpgradeOverlay(true)}>
            <div>
              <p className="text-sm font-bold text-white">Crédits épuisés ce mois</p>
              <p className="text-xs mt-0.5 text-white/60">Passez à un forfait supérieur pour continuer</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 text-black" style={{ background: YUZU, borderRadius: '3px' }}>Upgrade →</span>
          </motion.div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-5 pt-2 flex-shrink-0 relative max-w-3xl mx-auto w-full">
        <AnimatePresence>
          {showAtMenu && (
            <motion.div ref={atMenuRef} {...popUp}
              className="absolute left-4 right-4 bottom-full mb-2 overflow-hidden shadow-xl z-50 bg-white"
              style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px' }}>
              <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#aaa' }}>@ Agents & Modes</p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredAgents.map(agent => (
                  <button key={agent.id} onClick={() => selectAtAgent(agent)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Bot className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentAgent === agent.id ? FG : '#bbb' }} />
                    <span style={{ color: FG }} className="font-medium text-xs">{agent.label}</span>
                    {currentAgent === agent.id && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5" style={{ background: YUZU, color: FG, borderRadius: '2px' }}>actif</span>}
                  </button>
                ))}
                {ALL_MODES.map(m => {
                  const Icon = m.icon;
                  const isAllowed = userPlan?.allowed_modes.includes(m.id);
                  return (
                    <button key={m.id} onClick={() => selectAtMode(m)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isAllowed ? FG : '#ddd' }} />
                      <div className="flex-1">
                        <p className="text-xs font-medium" style={{ color: isAllowed ? '#333' : '#ccc' }}>{m.label}</p>
                        <p className="text-[10px]" style={{ color: '#aaa' }}>{m.desc}</p>
                      </div>
                      {!isAllowed && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: '#ddd' }} />}
                      {mode.id === m.id && <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5" style={{ background: YUZU, color: FG, borderRadius: '2px' }}>actif</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white overflow-visible" style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '6px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {files.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap px-3 pt-3">
              {visibleFiles.map((file, idx) => (
                <div key={idx} className="relative flex items-center gap-2 px-2.5 py-1.5 group"
                  style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '4px', maxWidth: '120px' }}>
                  <FileText className="w-3 h-3 flex-shrink-0" style={{ color: FG }} />
                  <span className="text-[10px] font-medium truncate" style={{ color: FG }}>{file.name}</span>
                  <button onClick={() => setFiles(p => p.filter((_, i) => i !== idx))}
                    className="w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '2px' }}>
                    <X className="w-2 h-2" style={{ color: '#666' }} />
                  </button>
                </div>
              ))}
              {extraFiles > 0 && (
                <button
                  onClick={() => setShowFilePanel(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black transition-colors"
                  style={{ background: FG, color: YUZU, borderRadius: '4px' }}>
                  ···  +{extraFiles}
                </button>
              )}
            </div>
          )}

          <div className="px-4 pt-3.5 pb-1">
            <textarea ref={textareaRef} value={input} onChange={handleInputChange}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder={blocked ? 'Crédits épuisés — mettez à niveau pour continuer' : 'Message… (@ pour agents & modes)'}
              disabled={blocked} rows={2}
              className="w-full resize-none bg-transparent text-sm focus:outline-none leading-relaxed break-words"
              style={{ color: FG }} />
          </div>

          <div className="flex items-center justify-between px-3 pb-3 gap-2">
            <div className="flex items-center gap-0.5">
              {/* File */}
              <div className="relative" ref={fileMenuRef}>
                <button onClick={() => setShowFileMenu(!showFileMenu)}
                  className="w-7 h-7 rounded-sm flex items-center justify-center transition-colors hover:bg-black/5">
                  <Plus className="w-3.5 h-3.5" style={{ color: '#aaa' }} />
                </button>
                <AnimatePresence>
                  {showFileMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 shadow-xl p-1.5 min-w-[160px] z-50 bg-white"
                      style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px' }}>
                      <button onClick={handleFileAttach}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left"
                        style={{ color: '#444', borderRadius: '3px' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <FileText className="w-3.5 h-3.5" style={{ color: canUploadFiles ? FG : '#ddd' }} />
                        <span>Joindre un fichier</span>
                        {!canUploadFiles && <Lock className="w-3 h-3 ml-auto" style={{ color: '#ddd' }} />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Agent */}
              <div className="relative" ref={agentMenuRef}>
                <button onClick={() => setShowAgentMenu(!showAgentMenu)}
                  className="h-7 px-2.5 rounded-sm flex items-center gap-1.5 transition-colors hover:bg-black/5">
                  <Bot className="w-3 h-3" style={{ color: '#aaa' }} />
                  <span className="text-[11px] font-medium" style={{ color: '#aaa' }}>
                    {agentLabel?.split(' ')[0] || 'Agent'}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5" style={{ color: '#ccc' }} />
                </button>
                <AnimatePresence>
                  {showAgentMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 shadow-xl p-1.5 min-w-[190px] z-50 bg-white"
                      style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px' }}>
                      {AGENTS.map(a => (
                        <button key={a.id} onClick={() => { setCurrentAgent(a.id); setShowAgentMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left"
                          style={{ color: currentAgent === a.id ? FG : '#666', background: currentAgent === a.id ? YUZU : 'transparent', borderRadius: '3px' }}
                          onMouseEnter={e => { if (currentAgent !== a.id) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                          onMouseLeave={e => { if (currentAgent !== a.id) e.currentTarget.style.background = 'transparent'; }}>
                          <Bot className="w-3 h-3" /> <span className="font-medium">{a.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode */}
              <div className="relative" ref={modeMenuRef}>
                <button onClick={() => setShowModeMenu(!showModeMenu)}
                  className="h-7 px-2.5 rounded-sm flex items-center gap-1.5 transition-colors hover:bg-black/5">
                  <SlidersHorizontal className="w-3 h-3" style={{ color: '#aaa' }} />
                  <span className="text-[11px] font-medium" style={{ color: '#aaa' }}>{mode.label}</span>
                </button>
                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 shadow-xl p-1.5 min-w-[180px] z-50 bg-white"
                      style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px' }}>
                      {ALL_MODES.map(m => {
                        const Icon = m.icon;
                        const isAllowed = userPlan?.allowed_modes.includes(m.id);
                        return (
                          <button key={m.id} onClick={() => {
                            if (!isAllowed) { setUpgradeFeature(`Mode ${m.label}`); setShowUpgradeOverlay(true); setShowModeMenu(false); return; }
                            setMode(m); setShowModeMenu(false);
                          }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors text-left"
                            style={{ color: mode.id === m.id ? FG : isAllowed ? '#444' : '#ccc', background: mode.id === m.id ? YUZU : 'transparent', borderRadius: '3px', opacity: isAllowed ? 1 : 0.5 }}
                            onMouseEnter={e => { if (mode.id !== m.id) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                            onMouseLeave={e => { if (mode.id !== m.id) e.currentTarget.style.background = 'transparent'; }}>
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-semibold">{m.label}</p>
                              <p className="text-[9px] opacity-60">{m.desc}</p>
                            </div>
                            {!isAllowed && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 flex-shrink-0 whitespace-nowrap"
                                style={{ background: 'rgba(0,0,0,0.05)', color: '#888', borderRadius: '2px' }}>
                                {m.requiredPlan === 'expert' ? 'Expert' : 'Essential'}+
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Internet toggle */}
              <div className="relative" ref={internetMenuRef}>
                <button onClick={() => setShowInternetMenu(!showInternetMenu)}
                  className="h-7 px-2.5 rounded-sm flex items-center gap-1.5 transition-colors hover:bg-black/5"
                  style={{ background: useWebSearch ? 'rgba(22,163,74,0.08)' : 'transparent' }}>
                  <Wifi className="w-3 h-3" style={{ color: useWebSearch ? '#16a34a' : '#aaa' }} />
                  <span className="text-[11px] font-medium hidden sm:block" style={{ color: useWebSearch ? '#16a34a' : '#aaa' }}>Web</span>
                </button>
                <AnimatePresence>
                  {showInternetMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 shadow-xl z-50 bg-white overflow-hidden"
                      style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '6px', minWidth: '190px' }}>
                      <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#aaa' }}>Web Search</p>
                      </div>
                      <div className="p-1">
                        <button onClick={() => { setUseWebSearch(false); setShowInternetMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors"
                          style={{ background: !useWebSearch ? 'rgba(0,0,0,0.04)' : 'transparent', borderRadius: '3px', color: FG }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = !useWebSearch ? 'rgba(0,0,0,0.04)' : 'transparent'}>
                          <WifiOff className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#aaa' }} />
                          <span className="font-medium flex-1">Without Web</span>
                          {!useWebSearch && <div className="w-1.5 h-1.5 rounded-full" style={{ background: FG }} />}
                        </button>
                        <button onClick={() => {
                          if (!hasInternet) { setUpgradeFeature('Internet'); setShowUpgradeOverlay(true); setShowInternetMenu(false); return; }
                          setUseWebSearch(true); setShowInternetMenu(false);
                        }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors"
                          style={{ background: useWebSearch ? 'rgba(22,163,74,0.06)' : 'transparent', borderRadius: '3px', color: hasInternet ? FG : '#bbb' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(22,163,74,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = useWebSearch ? 'rgba(22,163,74,0.06)' : 'transparent'}>
                          <Wifi className="w-3.5 h-3.5 flex-shrink-0" style={{ color: hasInternet ? '#16a34a' : '#ddd' }} />
                          <span className="font-medium flex-1">With Web Search</span>
                          {!hasInternet && <span className="text-[9px] font-bold px-1.5 py-0.5" style={{ background: 'rgba(0,0,0,0.05)', color: '#888', borderRadius: '2px' }}>Advanced+</span>}
                          {useWebSearch && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#16a34a' }} />}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleRecording}
                className="relative w-8 h-8 rounded-sm flex items-center justify-center transition-all"
                style={{ background: isRecording ? FG : 'rgba(0,0,0,0.05)' }}>
                {isRecording ? (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: YUZU }} />
                ) : (
                  <Mic className="w-3.5 h-3.5" style={{ color: '#aaa' }} />
                )}
              </button>

              <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading || blocked}
                className="w-8 h-8 flex items-center justify-center transition-all"
                style={{
                  borderRadius: '4px',
                  background: input.trim() && !isLoading && !blocked ? FG : 'rgba(0,0,0,0.05)',
                  cursor: !input.trim() || isLoading || blocked ? 'not-allowed' : 'pointer',
                }}>
                <Send className="w-3.5 h-3.5" style={{ color: input.trim() && !isLoading && !blocked ? 'white' : '#ccc' }} />
              </button>
            </div>
          </div>
        </div>

        {/* File preview panel */}
        <FilePreviewPanel
          files={files}
          open={showFilePanel}
          onClose={() => setShowFilePanel(false)}
          onRemove={(idx) => setFiles(p => p.filter((_, i) => i !== idx))}
        />
        {/* Legal */}
        <p className="text-center mt-2 text-[9px]" style={{ color: '#ccc' }}>
          AI may make mistakes · Not financial advice · Ceci n&apos;est pas un conseil en investissement
        </p>
        </div>

        {/* Upgrade overlay */}
      <AnimatePresence>
        {showUpgradeOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowUpgradeOverlay(false); }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white overflow-hidden"
              style={{ borderRadius: '6px', boxShadow: '0 25px 60px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.08)' }}>
              <div className="px-6 pt-6 pb-5" style={{ background: FG }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 flex items-center justify-center" style={{ background: YUZU, borderRadius: '3px' }}>
                      <TrendingUp className="w-4 h-4" style={{ color: FG }} />
                    </div>
                    <p className="text-base font-bold text-white">Passez à Advanced</p>
                  </div>
                  <button onClick={() => setShowUpgradeOverlay(false)}
                    className="w-7 h-7 flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                {upgradeFeature && (
                  <p className="text-xs text-white/60">
                    {upgradeFeature} n'est pas disponible sur votre plan actuel.
                  </p>
                )}
              </div>
              <div className="p-5 space-y-2">
                {['Internet en temps réel', 'Modes Pro & Thinking', 'Fichiers joints', 'Discussions illimitées'].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '2px' }}>
                      <Check className="w-2.5 h-2.5" style={{ color: FG }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#444' }}>{f}</span>
                  </div>
                ))}
                <button onClick={() => { navigate('/pricing'); setShowUpgradeOverlay(false); }}
                  className="w-full mt-4 py-3 font-bold text-sm transition-all"
                  style={{ background: YUZU, color: FG, borderRadius: '4px' }}>
                  Voir les abonnements →
                </button>
                <button onClick={() => setShowUpgradeOverlay(false)}
                  className="w-full py-2 text-sm font-medium transition-colors hover:bg-black/5"
                  style={{ color: '#999', borderRadius: '4px' }}>
                  Continuer en Free
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}