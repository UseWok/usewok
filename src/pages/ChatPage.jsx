import { useState, useRef, useEffect, useCallback } from 'react';
import DragDropOverlay from '@/components/DragDropOverlay';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, SlidersHorizontal, Mic, X, FileText, Bot,
  ChevronDown, Brain, Star, Crown, Send, Copy, Pencil, TrendingUp, Wifi, WifiOff, Lock, Check, Zap
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AGENTS } from '@/components/Sidebar';
import { getAgentConfig } from '@/lib/agents-config';
import ChatLoadingAnimation from '@/components/chat/ChatLoadingAnimation';
import FilePreviewPanel from '@/components/chat/FilePreviewPanel';
import { getUserPlan } from '@/lib/plans-config';
import { getUserColor } from '@/lib/user-color';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';
import { emitCreditsUpdate } from '@/lib/credits-events';

import { getDiscussions, saveDiscussions, getConversationMessages, saveConversationMessages, setCurrentUser, syncConversationToCloud, loadConversationFromCloud, loadConversationTitleFromCloud } from '@/lib/discussions';
import { initAgentsFromDB } from '@/lib/agents-config';
import AssistantMessage from '@/components/chat/AssistantMessage';
import UserMessageBubble from '@/components/chat/UserMessageBubble';
const STORAGE_KEY = 'stensor_discussions';
const CHAR_SPEED = 15;
const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';
const CORAL = '#FF4F00';
const MAX_VISIBLE_FILES = 1;

const ALL_MODES = [
  { id: 'ultimate', label: 'Expert', icon: Crown, model: 'claude_opus_4_6', desc: 'Le plus puissant', requiredPlan: 'expert', credit_cost: 4, credit_max: 8 },
  { id: 'pro', label: 'Avancé', icon: Star, model: 'gemini_3_1_pro', desc: 'Analyse avancée', requiredPlan: 'essential', credit_cost: 2, credit_max: 5 },
  { id: 'thinking', label: 'Standard', icon: Brain, model: 'gpt_5', desc: 'Mode standard', requiredPlan: null, credit_cost: 1, credit_max: 3 },
];




// Détection de message incompréhensible/gibberish
function isGibberish(text) {
  const t = text.trim();
  if (t.length === 0) return false;
  // Remove spaces and punctuation
  const letters = t.toLowerCase().replace(/[^a-záàâäéèêëíìîïóòôöúùûü]/g, '');
  if (letters.length === 0) return false; // only numbers/symbols
  if (letters.length < 2) return true;
  const vowels = (letters.match(/[aeiouáàâäéèêëíìîïóòôöúùûü]/g) || []).length;
  const vowelRatio = vowels / letters.length;
  // Detect longest consonant run
  const parts = letters.split(/[aeiouáàâäéèêëíìîïóòôöúùûü]/);
  const maxRun = Math.max(...parts.map(s => s.length));
  // No vowels at all and long enough = gibberish
  if (letters.length >= 4 && vowelRatio < 0.05) return true;
  // Very long consonant run = gibberish
  if (maxRun >= 5) return true;
  // Repeating same char pattern
  if (/^(.{1,3})\1{3,}$/.test(letters)) return true;
  return false;
}

const GIBBERISH_RESPONSES = [
  "Je ne comprends pas ce message — pourriez-vous reformuler votre question de façon plus claire ? 😊",
  "Ce message ne me dit rien, mais je suis là pour vous aider : posez-moi votre vraie question !",
  "Hmm, je n'arrive pas à interpréter ça — essayez de formuler autrement et je ferai de mon mieux.",
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
  const [isLoadingConversation, setIsLoadingConversation] = useState(() => {
    if (!conversationId) return false;
    const local = getConversationMessages(conversationId);
    return local.length === 0; // loading only if no local cache
  });
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
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
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
  const isMountedRef = useRef(true);
  const typewriterRef = useRef(null);

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
  const fmtN = (n) => { const r = Math.round(n * 10) / 10; return Number.isInteger(r) ? r.toString() : r.toFixed(1); };
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);
  const visibleFiles = files.slice(0, MAX_VISIBLE_FILES);
  const extraFiles = files.length > MAX_VISIBLE_FILES ? files.length - MAX_VISIBLE_FILES : 0;

  useEffect(() => {
    initAgentsFromDB().catch(() => {});
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

  useEffect(() => {
    if (initialQ && messages.length === 0) sendMessage(initialQ);
    // Scroll to bottom on mount
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { isMountedRef.current = false; if (typewriterRef.current) clearTimeout(typewriterRef.current); };
  }, []);

  // Load from cloud for cross-device sync
  useEffect(() => {
    if (!conversationId) return;
    loadConversationFromCloud(conversationId).then(cloudMsgs => {
      if (!isMountedRef.current) return;
      if (cloudMsgs && cloudMsgs.length > 0) {
        setMessages(cloudMsgs);
        saveConversationMessages(conversationId, cloudMsgs);
      }
      // Small delay so the blur transition looks smooth
      setTimeout(() => setIsLoadingConversation(false), 300);
    }).catch(() => {
      setIsLoadingConversation(false);
    });
  }, [conversationId]);

  // Auto-scroll: only if user hasn't scrolled up
  const scrollContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      userScrolledUpRef.current = distFromBottom > 80;
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (userScrolledUpRef.current) return; // user scrolled up — don't force scroll
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) setShowModeMenu(false);
      if (agentMenuRef.current && !agentMenuRef.current.contains(e.target)) setShowAgentMenu(false);
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) setShowFileMenu(false);
      if (atMenuRef.current && !atMenuRef.current.contains(e.target)) setShowAtMenu(false);
      if (internetMenuRef.current && !internetMenuRef.current.contains(e.target)) setShowInternetMenu(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
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
    // Remove any existing @AgentLabel mentions, then insert new one
    let cleaned = AGENTS.reduce((q, a) => q.replace(new RegExp(`@${a.label}\\s*`, 'g'), ''), input);
    const lastAt = cleaned.lastIndexOf('@');
    const base = lastAt !== -1 ? cleaned.slice(0, lastAt) : cleaned;
    setInput(base + `@${agent.label} `);
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
    // Remove any existing @ModeLabel mentions, then insert new one
    let cleaned = ALL_MODES.reduce((q, md) => q.replace(new RegExp(`@${md.label}\\s*`, 'g'), ''), input);
    const lastAt = cleaned.lastIndexOf('@');
    const base = lastAt !== -1 ? cleaned.slice(0, lastAt) : cleaned;
    setInput(base + `@${m.label} `);
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

    // Ensure user is loaded before sending (fixes Expert mode bug on initialQ)
    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = await base44.auth.me();
        if (currentUser) {
          setUser(currentUser);
          setCreditsUsed(currentUser.credits_used ?? 0);
        }
      } catch {}
    }

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

    const sentFileNames = files.map(f => f.name);
    const userMsg = { role: 'user', content: text, files: sentFileNames.length > 0 ? sentFileNames : undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setFiles([]);
    setIsLoading(true);

    // Gibberish detection — skip API, charge 1 tensor, return canned response
    if (isGibberish(text) && files.length === 0) {
      const canned = GIBBERISH_RESPONSES[Math.floor(Math.random() * GIBBERISH_RESPONSES.length)];
      setMessages([...newMessages, { role: 'assistant', content: canned }]);
      if (currentUser) {
        const newUsed = (currentUser.credits_used || 0) + 1;
        await base44.entities.User.update(currentUser.id, { credits_used: newUsed });
        setCreditsUsed(newUsed);
        setUser(prev => ({ ...prev, credits_used: newUsed }));
        emitCreditsUpdate(newUsed);
        incrementDailyUsed();
        setUser(prev => prev ? { ...prev, credits_used: newUsed } : prev);
      }
      setIsLoading(false);
      return;
    }

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
      const fileInstruction = file_urls.length > 0 ? '\n\nIMPORTANT: Files have been attached. Use them as context to answer but do not describe or list their content. Answer the user\'s question directly using the files as reference.' : '';
      const STENSOR_KNOWLEDGE = `
=== ABOUT STENSOR ===
Stensor is an AI-powered personal finance coach created by Jason Hanch.
Mission: Help everyone build financial freedom through smart, personalized coaching.
Website: stensor.app

=== SUBSCRIPTION PLANS ===

🆓 FREE PLAN — €0/month
- 10 tensors/month (AI credits)
- 5 tensors/day max (resets at midnight)
- Standard mode only
- 15 conversations max
- No file uploads, no internet search
- Community access included

⚡ ESSENTIAL PLAN — €9/month (or €7/month billed yearly = €84/year)
- 100 tensors/month
- Standard + Advanced modes
- Unlimited conversations
- File uploads (images & text)
- No internet search
- Priority support

🚀 ADVANCED PLAN — €19/month (or €15/month billed yearly = €180/year)
- 300 tensors/month
- All modes including Expert
- Unlimited conversations
- File uploads (all types)
- Internet/web search enabled
- Priority support + faster response

👑 EXPERT PLAN — €39/month (or €29/month billed yearly = €348/year)
- 1000 tensors/month
- All modes (Standard, Advanced, Expert/Claude Opus)
- Unlimited conversations
- Full file upload support
- Internet search enabled
- VIP support + dedicated coaching

🏆 SUPREME PLAN — €99/month (or €79/month billed yearly)
- Unlimited tensors
- All features unlocked
- Direct access to Jason Hanch
- Custom agent creation
- White-glove onboarding

=== WELCOME OFFER ===
New users get a 48-hour welcome offer: 20% off on yearly plans.
Offer applies to Essential, Advanced, and Expert plans.

=== AI MODES (Tensors) ===
- Standard mode: 1-3 tensors/message (GPT-5 based)
- Advanced mode: 2-5 tensors/message (Gemini Pro based) — Essential+ plans
- Expert mode: 4-8 tensors/message (Claude Opus 4 — most powerful) — Advanced+ plans
- First message always boosted silently with Expert model for best first impression
- Web Search: +1 tensor/message when enabled (Advanced+ plans)

=== FEATURES ===
- @ mentions: type @AgentName or @ModeName to switch agent/mode inline
- File uploads: attach images, PDFs, docs, spreadsheets for analysis
- Voice input: microphone support for hands-free input
- Internet search: real-time web context for up-to-date answers
- Discussion history: all conversations saved and synced across devices
- Referral program: invite friends and earn bonus tensors

=== AGENTS ===
- Global Agent: General financial coaching, all topics
- Spend without guilt: Behavioral finance, emotional spending, budget psychology
- Becoming financially free: Wealth building, investing, FIRE strategy, passive income

=== CREATOR ===
Jason Hanch — Founder & CEO of Stensor
Vision: Democratize access to high-quality financial coaching for everyone.
Philosophy: Finance should be simple, human, and empowering — not stressful.

=== SUPPORT ===
- Support ticket system built into the app
- Community page for sharing and connecting
- Settings page for account, plan management, notifications
`;

      const formatRule = `LANGUAGE: Always respond in the EXACT same language the user writes in. If unclear, default to English.

TONE: Warm, direct, like a knowledgeable friend. No filler words, no long intros.

FORMATTING (CRITICAL — never break these):
1. ALWAYS leave a blank line between every paragraph — NO EXCEPTIONS
2. Maximum 2 sentences per paragraph — never more
3. Bold **1-2 key numbers or facts** per response
4. 1-2 emojis max, only where they add clarity
5. Start with ONE warm, punchy sentence that connects with the person — then go straight to the answer
6. If listing, use bullet points with a blank line between each
7. End with ONE clear next step or action

BREVITY RULE: Give the most precise answer in the fewest words. Cut all filler. If something is unclear, say so immediately in one sentence and ask for clarification — do NOT guess and waste tokens.

SPACING: Every paragraph MUST be separated by a blank line. No dense walls of text. Spacious, readable layout only.`;

      const systemContext = agentConfig?.instructions
        ? `${agentConfig.instructions}${agentConfig.knowledge ? '\n\nKnowledge base:\n' + agentConfig.knowledge : ''}\n\n${STENSOR_KNOWLEDGE}\n\n${formatRule}\n\n`
        : `You are Stensor, a passionate and warm AI financial coach created by Jason Hanch. You genuinely love helping people transform their financial lives. Be enthusiastic, direct, and deeply human — like an excited best friend who happens to be a finance expert. ${agentLabel ? `Active agent context: ${agentLabel}.` : ''}\n\n${STENSOR_KNOWLEDGE}\n\n${formatRule}\n\n`;

      // Secret: first-ever message uses Expert model silently (claude_opus)
      const isFirstMessage = !currentUser?.first_message_sent;
      const secretModel = isFirstMessage ? 'claude_opus_4_6' : mode.model;
      const secretMode = isFirstMessage ? { id: 'ultimate', credit_cost: 4, credit_max: 8 } : mode;

      const useInternet = useWebSearch && hasInternet && secretModel !== 'claude_opus_4_6';

      const result = await base44.integrations.Core.InvokeLLM({
      prompt: systemContext + text + fileInstruction,
      model: secretModel,
      add_context_from_internet: useInternet,
      ...(file_urls.length > 0 ? { file_urls } : {}),
      });
      // ↑ file_urls is now passed correctly to the LLM
      const content = typeof result === 'string' ? result : JSON.stringify(result);


      // Credit cost — first message always costs exactly 1 tensor (secret expert boost)
      // Subsequent messages: weighted random per mode
      const r = Math.random();
      let baseCost;
      if (isFirstMessage) {
        baseCost = 1;
      } else {
        const effectiveModeId = mode.id;
        if (effectiveModeId === 'thinking') {
          baseCost = r < 0.6 ? 2 : r < 0.8 ? 1 : 3;
        } else if (effectiveModeId === 'pro') {
          baseCost = r < 0.5 ? 3 : r < 0.75 ? 2 : 5;
        } else if (effectiveModeId === 'ultimate') {
          baseCost = r < 0.5 ? 6 : r < 0.75 ? 4 : 8;
        } else {
          baseCost = 1;
        }
      }
      const webCost = useInternet && hasInternet ? 1 : 0;
      const costPerMsg = baseCost + webCost;

      if (currentUser) {
        const newUsed = (currentUser.credits_used || 0) + costPerMsg;
        await base44.entities.User.update(currentUser.id, { credits_used: newUsed });
        setCreditsUsed(newUsed);
        setUser(prev => ({ ...prev, credits_used: newUsed }));
        emitCreditsUpdate(newUsed);
        incrementDailyUsed();
        if (isFirstMessage) {
          await base44.auth.updateMe({ first_message_sent: true });
          currentUser = { ...currentUser, first_message_sent: true };
          setUser(prev => prev ? { ...prev, first_message_sent: true } : prev);
        }
      }

      // Meta info for this response
      const msgMeta = {
        modeName: isFirstMessage ? 'Expert' : mode.label,
        modelName: secretModel,
        usedInternet: useInternet,
        hasFiles: file_urls.length > 0,
      };

      // Generate AI title BEFORE typewriter — preserve existing cloud title for subsequent messages
      let convTitle = text.slice(0, 50);
      try {
        // Always check cloud first (works across all devices/platforms)
        const cloudTitle = await loadConversationTitleFromCloud(convId);
        if (cloudTitle) {
          convTitle = cloudTitle;
        } else if (newMessages.length === 1) {
          // First message — generate AI title and save everywhere
          const titleResult = await base44.integrations.Core.InvokeLLM({
            prompt: `Titre très court (3-5 mots) pour résumer ce message: "${text.slice(0, 150)}". Réponds UNIQUEMENT avec le titre, sans guillemets.`,
            model: 'gpt_5_mini',
          });
          if (typeof titleResult === 'string' && titleResult.trim()) convTitle = titleResult.trim().slice(0, 60);
        }
      } catch {}

      // Save discussion metadata with the correct title
      try {
        const stored = getDiscussions();
        const disc = { id: convId, title: convTitle, preview: text, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now(), model: mode.label, agent: currentAgent };
        const existingIdx = stored.findIndex(d => d.id === convId);
        if (existingIdx >= 0) stored.splice(existingIdx, 1);
        stored.unshift(disc);
        saveDiscussions(stored);
      } catch {}

      // Add assistant placeholder BEFORE typewriter starts
      setMessages([...newMessages, { role: 'assistant', content: '', meta: msgMeta }]);

      // Typewriter effect
      let i = 0;
      const typeNext = () => {
        if (!isMountedRef.current) {
          // Component unmounted — save final silently
          const finalMsgs = [...newMessages, { role: 'assistant', content, agent: currentAgent, meta: msgMeta }];
          saveConversationMessages(convId, finalMsgs);
          syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });
          return;
        }
        if (i < content.length) {
          i++;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: 'assistant', content: content.slice(0, i), meta: msgMeta };
            return updated;
          });
          typewriterRef.current = setTimeout(typeNext, CHAR_SPEED);
        } else {
          // Typing done — save final with correct title everywhere
          const finalMsgs = [...newMessages, { role: 'assistant', content, agent: currentAgent, meta: msgMeta }];
          saveConversationMessages(convId, finalMsgs);
          syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });
          // Reset to Standard mode only after first message secret boost
          if (isFirstMessage) {
            const standardMode = ALL_MODES.find(m => m.id === 'thinking');
            if (standardMode) setMode(standardMode);
          }
        }
      };
      typeNext();

      // Milestone : 10ème message
      const totalMsgs = [...newMessages, { role: 'assistant', content }].filter(m => m.role === 'user').length;
      if (totalMsgs === 10 && !milestoneShown) {
        setMilestoneShown(true);
        toast(
          <div>
            <p className="font-bold text-sm">{t('milestone_title')}</p>
            <p className="text-xs mt-0.5 opacity-70">{t('milestone_sub')}</p>
          </div>,
          { duration: 7000 }
        );
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('error_occurred') }]);
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
    toast.success(t('copied'), { duration: 1000 });
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
    <div className="flex flex-col font-be bg-white" style={{ height: '100dvh' }}>
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
            <p className="text-[10px] hidden sm:block" style={{ color: '#999' }}>{agentLabel || 'Global Agent'}</p>
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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 md:px-8 py-4 space-y-4 max-w-3xl mx-auto w-full">
        {isLoadingConversation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
            <div className="flex-shrink-0 mt-1">
              <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain opacity-60" />
            </div>
            <div className="flex flex-col gap-1.5 items-start">
              <p className="text-[10px] font-semibold px-1" style={{ color: '#bbb' }}>Chargement...</p>
              <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <ChatLoadingAnimation mode={mode.id} />
              </div>
            </div>
          </motion.div>
        )}
        {!isLoadingConversation && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
            <img src={LOGO_URL} alt="Stensor" className="w-12 h-12 object-contain" />
            <p className="text-sm" style={{ color: '#888' }}>{t('start_conversation')}</p>
          </div>
        )}
        {!isLoadingConversation && messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {msg.role === 'assistant'
              ? <AssistantMessage content={msg.content} agent={msg.agent || currentAgent} meta={msg.meta} />
              : <UserMessageBubble
                  msg={msg}
                  userName={userName}
                  user={user}
                  onCopy={copyMessage}
                  onEdit={() => editMessage(idx)}
                />
            }
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
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

      {/* Input area */}
      <div
        className="px-3 sm:px-4 pb-2 pt-1 flex-shrink-0 relative max-w-3xl mx-auto w-full"
        onDragEnter={e => { e.preventDefault(); dragCounterRef.current++; setIsDragging(true); }}
        onDragLeave={e => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setIsDragging(false); } }}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); dragCounterRef.current = 0; setIsDragging(false); const dropped = Array.from(e.dataTransfer.files || []); if (dropped.length === 0) return; if (!canUploadFiles) { setUpgradeFeature('Joindre un fichier'); setShowUpgradeOverlay(true); return; } setFiles(p => [...p, ...dropped]); }}>
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

        <DragDropOverlay visible={isDragging} canUpload={canUploadFiles} />
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
              placeholder={blocked ? t('blocked_placeholder') : t('send_message')}
              disabled={blocked} rows={1}
              className="w-full resize-none bg-transparent text-sm focus:outline-none leading-relaxed break-words"
              style={{ color: FG }} />
          </div>

          <div className="flex items-center justify-between px-3 pb-3 gap-2">
            <div className="flex items-center gap-0.5">
              {/* File */}
              <div className="relative flex-shrink-0" ref={fileMenuRef}>
                <button onClick={() => setShowFileMenu(!showFileMenu)}
                  className="w-7 h-7 rounded-sm flex items-center justify-center transition-colors hover:bg-black/5">
                  <Plus className="w-3.5 h-3.5" style={{ color: '#aaa' }} />
                </button>
                <AnimatePresence>
                  {showFileMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 shadow-xl p-1.5 min-w-[160px] z-[300] bg-white"
                      style={{ border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px' }}>
                      <button onClick={handleFileAttach}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left"
                        style={{ color: '#444', borderRadius: '3px' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <FileText className="w-3.5 h-3.5" style={{ color: canUploadFiles ? FG : '#ddd' }} />
                        <span>Attach file</span>
                        {!canUploadFiles ? (
                          <span className="ml-auto text-[9px] font-black px-1.5 py-0.5"
                            style={{ background: 'rgba(58,0,136,0.1)', color: '#3A0088', borderRadius: '3px' }}>
                            Essential+
                          </span>
                        ) : !canUploadExtended && (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5"
                            style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', borderRadius: '3px' }}>
                            Images/Text
                          </span>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Agent */}
              <div className="relative flex-shrink-0" ref={agentMenuRef}>
                <button onClick={() => setShowAgentMenu(!showAgentMenu)}
                  className="h-7 px-2 rounded-sm flex items-center gap-1 transition-colors hover:bg-black/5">
                  <Bot className="w-3 h-3" style={{ color: '#aaa' }} />
                  <span className="text-[11px] font-medium hidden sm:block" style={{ color: '#aaa' }}>
                    {agentLabel?.split(' ')[0] || 'Agent'}
                  </span>
                  <ChevronDown className="w-2.5 h-2.5" style={{ color: '#ccc' }} />
                </button>
                <AnimatePresence>
                  {showAgentMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 shadow-xl p-1.5 min-w-[190px] z-[300] bg-white"
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
              <div className="relative flex-shrink-0" ref={modeMenuRef}>
                <button onClick={() => setShowModeMenu(!showModeMenu)}
                  className="h-7 px-2 rounded-sm flex items-center gap-1 transition-colors hover:bg-black/5">
                  <SlidersHorizontal className="w-3 h-3" style={{ color: '#aaa' }} />
                  <span className="text-[11px] font-medium hidden sm:block" style={{ color: '#aaa' }}>{mode.label}</span>
                  <span className="text-[9px] font-black px-1 py-0.5" style={{ background: 'rgba(0,0,0,0.07)', color: '#888', borderRadius: '2px' }}>{mode.credit_cost}-{mode.credit_max}T</span>
                </button>
                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 shadow-xl p-1.5 min-w-[180px] z-[300] bg-white"
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
              <div className="relative flex-shrink-0" ref={internetMenuRef}>
                <button onClick={() => setShowInternetMenu(!showInternetMenu)}
                  className="h-7 px-2 rounded-sm flex items-center gap-1 transition-colors hover:bg-black/5"
                  style={{ background: useWebSearch ? 'rgba(22,163,74,0.08)' : 'transparent' }}>
                  <Wifi className="w-3 h-3" style={{ color: useWebSearch && hasInternet ? '#16a34a' : '#aaa' }} />
                  <span className="text-[11px] font-medium hidden sm:block" style={{ color: useWebSearch && hasInternet ? '#16a34a' : '#aaa' }}>Web</span>
                </button>
                <AnimatePresence>
                  {showInternetMenu && (
                    <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 shadow-xl z-[300] bg-white overflow-hidden"
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

            <div className="flex items-center gap-1.5 flex-shrink-0">
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

        <FilePreviewPanel
          files={files}
          open={showFilePanel}
          onClose={() => setShowFilePanel(false)}
          onRemove={(idx) => setFiles(p => p.filter((_, i) => i !== idx))}
        />

        <p className="text-center mt-1 text-[9px]" style={{ color: '#ccc' }}>
          {t('ai_disclaimer')}
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
                    <p className="text-base font-bold text-white">{t('upgrade_overlay_title')}</p>
                  </div>
                  <button onClick={() => setShowUpgradeOverlay(false)}
                    className="w-7 h-7 flex items-center justify-center transition-colors"
                    style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                {upgradeFeature && (
                  <p className="text-xs text-white/60">
                    {upgradeFeature} {t('upgrade_not_available')}
                  </p>
                )}
              </div>
              <div className="p-5 space-y-2">
                {[t('upgrade_feature_internet'), t('upgrade_feature_modes'), t('upgrade_feature_files'), t('upgrade_feature_discussions')].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '2px' }}>
                      <Check className="w-2.5 h-2.5" style={{ color: FG }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#444' }}>{f}</span>
                  </div>
                ))}
                <button onClick={() => { window.open('/pricing', '_blank'); }}
                  className="w-full mt-4 py-3 font-bold text-sm transition-all"
                  style={{ background: YUZU, color: FG, borderRadius: '4px' }}>
                  {t('see_plans')}
                </button>
                <button onClick={() => setShowUpgradeOverlay(false)}
                  className="w-full py-2 text-sm font-medium transition-colors hover:bg-black/5"
                  style={{ color: '#999', borderRadius: '4px' }}>
                  {t('continue_free')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}