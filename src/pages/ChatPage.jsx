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
import { getUserColor } from '@/lib/user-color';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';
import { emitCreditsUpdate } from '@/lib/credits-events';

import { getDiscussions, saveDiscussions, getConversationMessages, saveConversationMessages, setCurrentUser } from '@/lib/discussions';
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';
const CORAL = '#FF4F00';
const MAX_VISIBLE_FILES = 3;

const ALL_MODES = [
  { id: 'ultimate', label: 'Expert', icon: Crown, model: 'claude_opus_4_6', desc: 'Le plus puissant', requiredPlan: 'expert', credit_cost: 4, credit_max: 8 },
  { id: 'pro', label: 'Avancé', icon: Star, model: 'gemini_3_1_pro', desc: 'Analyse avancée', requiredPlan: 'essential', credit_cost: 2, credit_max: 5 },
  { id: 'thinking', label: 'Standard', icon: Brain, model: 'gemini_3_1_pro', desc: 'Mode standard', requiredPlan: null, credit_cost: 1, credit_max: 3 },
];




const popUp = {
  initial: { opacity: 0, y: 6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.97 },
  transition: { duration: 0.1 },
};



export default function ChatPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initialQ = urlParams.get('q') || '';
  const modeId = urlParams.get('mode') || null; // null = auto-detect best mode
  const agentId = urlParams.get('agent') || 'global';
  const conversationId = urlParams.get('conversationId') || null;

  const convIdRef = useRef(conversationId || `conv_${Date.now()}`);
  const convId = convIdRef.current;

  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [messages, setMessages] = useState(() => conversationId ? getConversationMessages(conversationId) : []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(modeId ? (ALL_MODES.find(m => m.id === modeId) || ALL_MODES[ALL_MODES.length - 1]) : ALL_MODES[ALL_MODES.length - 1]);
  const [currentAgent, setCurrentAgent] = useState(agentId);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showAtMenu, setShowAtMenu] = useState(false);
  const [atQuery, setAtQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const finalTranscriptRef = useRef('');
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [showInternetMenu, setShowInternetMenu] = useState(false);
  const [freeDelayMsg, setFreeDelayMsg] = useState(false);
  const { t } = useLanguage();
  const [showUpgradeOverlay, setShowUpgradeOverlay] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [milestoneShown, setMilestoneShown] = useState(false);
  const [comparisonMsg, setComparisonMsg] = useState('');

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
      if (u?.id) setCurrentUser(u.id);
      setCreditsUsed(u?.credits_used ?? 0);
      const plan = getUserPlan(u);
      setUserPlan(plan);
      // If URL specified a mode and it's allowed, keep it; otherwise use best available
      if (modeId && plan.allowed_modes.includes(modeId)) {
        // URL mode is valid and allowed, keep current
      } else {
        // Auto-select best available mode
        const best = ALL_MODES.find(m => plan.allowed_modes.includes(m.id));
        if (best) setMode(best);
      }
      // Only set web search default if URL didn't specify
      const urlWebSearch = urlParams.get('webSearch');
      if (urlWebSearch === '1' && plan.internet_access) setUseWebSearch(true);
      else if (urlWebSearch === '0') setUseWebSearch(false);
      else if (plan.internet_access) setUseWebSearch(true);
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

  // File type restrictions based on plan
  const BASIC_FILE_TYPES = '.jpg,.jpeg,.png,.gif,.txt,.csv';
  const ALL_FILE_TYPES = '.jpg,.jpeg,.png,.gif,.txt,.csv,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.mp3,.mp4,.json,.html,.xml,.md';
  const canUploadExtended = userPlan?.file_upload_extended || false;
  const acceptedFileTypes = canUploadExtended ? ALL_FILE_TYPES : BASIC_FILE_TYPES;

  const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

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
      const formatRule = 'FORMAT: Réponses en mini-paragraphes de 2-3 phrases max, bien aérés. Utilise **gras** sur sa propre ligne pour les points clés. Maximum 3 emojis pertinents. Va à l\'essentiel, pas de liste à rallonge.';
      const systemContext = agentConfig?.instructions
        ? `${agentConfig.instructions}${agentConfig.knowledge ? '\n\nBase de connaissances:\n' + agentConfig.knowledge : ''}\n\n${formatRule}\n\n`
        : `Tu es Stensor, un coach financier IA de haut niveau. Réponds de manière directe, structure ta réponse en paragraphes courts et aérés.${agentLabel ? ` Agent actif: ${agentLabel}.` : ''} ${formatRule}\n\n`;

      // Secret: first-ever message uses expert model silently
      const isFirstMessage = !user?.first_message_sent;
      const secretModel = isFirstMessage ? 'claude_opus_4_6' : mode.model;

      const useInternet = useWebSearch && hasInternet && secretModel !== 'claude_opus_4_6';

      const result = await base44.integrations.Core.InvokeLLM({
      prompt: systemContext + text,
      model: secretModel,
      add_context_from_internet: useInternet,
      ...(file_urls.length > 0 ? { file_urls } : {}),
      });
      // ↑ file_urls is now passed correctly to the LLM
      const content = typeof result === 'string' ? result : JSON.stringify(result);


      const isFree = !userPlan || userPlan.price_monthly === 0;

      // Typewriter effect: add message with empty content, then fill char by char
      const assistantMsg = { role: 'assistant', content: '' };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      // Animate typing
      let i = 0;
      const CHAR_SPEED = 8; // ms per character
      const typeNext = () => {
        if (i < content.length) {
          i++;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: content.slice(0, i) };
            return updated;
          });
          setTimeout(typeNext, CHAR_SPEED);
        } else {
          // Typing done — save final
          saveConversationMessages(convId, [...newMessages, { role: 'assistant', content }]);
        }
      };
      typeNext();

      // Comparison message for FREE/ESSENTIAL
      if (isFree || (userPlan && userPlan.price_monthly <= 9)) {
        if (mode.id === 'thinking') {
          setComparisonMsg('✨ Avec le mode Avancé, cette réponse aurait été 3× plus détaillée et précise.');
          setTimeout(() => setComparisonMsg(''), 6000);
        }
      }

      // Milestone : 10ème message
      const totalMsgs = finalMessages.filter(m => m.role === 'user').length;
      if (totalMsgs === 10 && !milestoneShown) {
        setMilestoneShown(true);
        toast(
          <div>
            <p className="font-bold text-sm">🎉 Vous adorez Stensor !</p>
            <p className="text-xs mt-0.5 opacity-70">10 messages envoyés. Avec Advanced, accédez aussi à la recherche Internet et aux leçons exclusives.</p>
          </div>,
          { duration: 7000 }
        );
      }
      if (user) {
        const responseLen = content.length;
        const baseCost = mode.credit_cost || 1;
        let extra = 0;
        // Extra cost based on response length (chars)
        if (mode.id === 'thinking') extra = Math.min(Math.floor(responseLen / 400), 2);
        else if (mode.id === 'pro') extra = Math.min(Math.floor(responseLen / 500), 3);
        else if (mode.id === 'ultimate') extra = Math.min(Math.floor(responseLen / 600), 4);
        const webCost = useInternet && hasInternet ? 1 : 0;
        const costPerMsg = baseCost + extra + webCost;
        const newUsed = (user.credits_used || 0) + costPerMsg;
        await base44.entities.User.update(user.id, { credits_used: newUsed });
        setCreditsUsed(newUsed);
        setUser(prev => ({ ...prev, credits_used: newUsed }));
        emitCreditsUpdate(newUsed);
        incrementDailyUsed();
        // Mark first message as sent (secret expert trick)
        if (isFirstMessage) {
          await base44.auth.updateMe({ first_message_sent: true });
          setUser(prev => prev ? { ...prev, first_message_sent: true } : prev);
        }
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
        const stored = getDiscussions();
        const disc = { id: convId, title, preview: text, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now(), model: mode.label, agent: currentAgent };
        const existing = stored.findIndex(d => d.id === convId);
        if (existing >= 0) stored.splice(existing, 1);
        stored.unshift(disc);
        saveDiscussions(stored);
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
        setInput(text);
      }
      finalTranscriptRef.current = '';
    };
    rec.start(); recognitionRef.current = rec; setIsRecording(true);
  };

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  const userName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Moi';

  return (
    <div className="flex flex-col h-screen font-be bg-white">
      {/* Hidden file input - always mounted */}
      <input ref={fileInputRef} type="file" multiple className="hidden"
        accept={acceptedFileTypes}
        onChange={(e) => {
          const newFiles = Array.from(e.target.files || []);
          const currentSize = files.reduce((acc, f) => acc + f.size, 0);
          const newSize = newFiles.reduce((acc, f) => acc + f.size, 0);
          if (currentSize + newSize > MAX_TOTAL_FILE_SIZE) {
            toast.error(`Taille totale des fichiers dépassée (max 20 Mo). Actuellement : ${Math.round((currentSize + newSize) / 1024 / 1024 * 10) / 10} Mo.`);
            return;
          }
          setFiles(p => [...p, ...newFiles]);
        }} />

      {/* Top bar */}
      <div className="flex items-center px-4 h-14 flex-shrink-0 z-20 relative bg-white"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <button onClick={() => navigate('/app')}
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
            style={{ background: getUserColor(user) }}>
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
                <div className="flex items-center gap-1.5 mb-2">
                  <img src={LOGO_URL} alt="Stensor" className="w-4 h-4 object-contain flex-shrink-0" style={{ opacity: 0.9 }} />
                  <span className="text-[11px] font-black" style={{ color: '#0A0A0A' }}>Stensor</span>
                </div>
              )}
              {msg.role === 'user' && (
                <p className="text-[10px] font-semibold px-1" style={{ color: '#bbb' }}>{userName}</p>
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
                style={{ background: getUserColor(user) }}>
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
              <p className="text-xs mt-0.5 text-white/60">
                {userPlan?.id === 'free' ? 'Passez à Essential → 100 crédits + sans quota journalier' : userPlan?.id === 'essential' ? 'Passez à Advanced → 250 crédits + recherche Internet' : 'Passez à un forfait supérieur pour continuer'}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 text-black" style={{ background: YUZU, borderRadius: '3px' }}>Upgrade →</span>
          </motion.div>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-3 pt-1 flex-shrink-0 relative max-w-3xl mx-auto w-full">
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

          <div className="px-4 pt-2 pb-1">
            <textarea ref={textareaRef} value={input} onChange={handleInputChange}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder={blocked ? 'Crédits épuisés — mettez à niveau pour continuer' : 'Message… (@ pour agents & modes)'}
              disabled={blocked} rows={1}
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
                        {!canUploadFiles ? (
                          <span className="ml-auto text-[9px] font-black px-1.5 py-0.5"
                            style={{ background: 'rgba(58,0,136,0.1)', color: '#3A0088', borderRadius: '3px' }}>
                            Essential+
                          </span>
                        ) : !canUploadExtended && (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5"
                            style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', borderRadius: '3px' }}>
                            Images/Texte
                          </span>
                        )}
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
                  <span className="text-[9px] font-black px-1 py-0.5" style={{ background: 'rgba(0,0,0,0.07)', color: '#888', borderRadius: '2px' }}>{mode.credit_cost}-{mode.credit_max}T</span>
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
                            {isAllowed ? (
                              <span className="text-[9px] font-black px-1.5 py-0.5 flex-shrink-0"
                                style={{ background: 'rgba(0,0,0,0.07)', color: '#777', borderRadius: '2px' }}>
                                {m.credit_cost}-{m.credit_max}T
                              </span>
                            ) : (
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
                  <Wifi className="w-3 h-3" style={{ color: useWebSearch && hasInternet ? '#16a34a' : '#aaa' }} />
                  <span className="text-[11px] font-medium hidden sm:block" style={{ color: useWebSearch && hasInternet ? '#16a34a' : '#aaa' }}>Web</span>
                  {hasInternet && useWebSearch && (
                    <span className="text-[9px] font-black hidden sm:block" style={{ color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '1px 5px', borderRadius: '2px' }}>+1T</span>
                  )}
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
                style={{ background: isRecording || voiceLoading ? FG : 'rgba(0,0,0,0.05)' }}>
                {voiceLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                    className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: YUZU }} />
                ) : isRecording ? (
                  <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                    className="w-2.5 h-2.5 rounded-full" style={{ background: YUZU }} />
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
        {/* Comparison banner */}
        {comparisonMsg && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-2 px-3 py-2 flex items-center justify-between cursor-pointer"
            style={{ background: 'rgba(58,0,136,0.06)', borderRadius: '4px', border: '1px solid rgba(58,0,136,0.1)' }}
            onClick={() => navigate('/pricing')}>
            <span className="text-xs" style={{ color: '#3A0088' }}>{comparisonMsg}</span>
            <span className="text-[10px] font-bold ml-3 flex-shrink-0 px-2 py-0.5" style={{ background: '#3A0088', color: 'white', borderRadius: '3px' }}>Upgrade</span>
          </motion.div>
        )}

        {/* Free delay message */}


        <p className="text-center mt-1.5 text-[9px]" style={{ color: '#ccc' }}>
          Stensor est un outil IA · Les réponses peuvent contenir des erreurs
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