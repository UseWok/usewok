// 1. TOUS LES IMPORTS (Strictement en haut pour éviter le crash)
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import { CHAR_SPEED, LOGO_URL, FG, YUZU, isGibberish, GIBBERISH_RESPONSES } from '@/lib/chat-constants';
import { ALL_MODES } from '@/lib/modes-config';
import { completeReferralOnFirstMessage } from '@/lib/referral';
import { getUserPlan } from '@/lib/plans-config';
import { emitCreditsUpdate } from '@/lib/credits-events';
import { getDiscussions, saveDiscussions, getConversationMessages, saveConversationMessages, setCurrentUser, syncConversationToCloud, loadConversationFromCloud, loadConversationTitleFromCloud, getDiscussionDaysLeft } from '@/lib/discussions';
import { initAgentsFromDB, getAgentConfig } from '@/lib/agents-config';
import { useLanguage } from '@/lib/i18n';

import WorkspaceHeader from '@/components/chat/WorkspaceHeader';
import FichePanel from '@/components/chat/FichePanel';
import ChatInputBar from '@/components/chat/ChatInputBar';
import ChatUpgradeOverlay from '@/components/chat/ChatUpgradeOverlay';
import AssistantMessage from '@/components/chat/AssistantMessage';
import UserMessageBubble from '@/components/chat/UserMessageBubble';
import ChatLoadingAnimation from '@/components/chat/ChatLoadingAnimation';
import SynthesisProposal from '@/components/chat/SynthesisProposal';
import SynthesisProgress from '@/components/chat/SynthesisProgress';
import { ChevronRight, Star, Bot, Lock, FileText, Search, Settings } from 'lucide-react';
import { getUserColor } from '@/lib/user-color';

// 2. MODALE 95% AVEC VOILE NOIR (NOTION STYLE)
const IframeModal = ({ open, url, onClose }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center font-open">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ y: 50, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.98 }} transition={{ type: "spring", damping: 25 }} className="relative w-[95vw] h-[95vh] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-gray-200">
          <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-gray-100/80 hover:bg-gray-200 text-gray-800 rounded-full transition-all shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <iframe src={url} className="w-full h-full border-none bg-white" />
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const AGENTS = [
  { id: 'global', label: "Knowing exactly where I'm going" },
  { id: 'emotions-depenses', label: 'Spend without guilt' },
  { id: 'wealth-strategy', label: 'Becoming financially free' }
];

const STENSOR_SYSTEM = `You are a brilliant, candid financial expert. You speak like a smart friend — direct, warm, and actionable.

LANGUAGE: ALWAYS respond in the same language as the user.
CRITICAL: NEVER mention any platform name, its launch, its features, or promotional content. You exist solely to solve the user's financial problems.
LENGTH: Match to complexity. Short question = 1-3 sentences. Complex analysis = up to 1800 chars. Less is more.

FORMAT:
- Blank lines between paragraphs and around lists
- Bold numbers and key terms
- ### headers for multi-part answers
- Bullet points for any list (never inline)
- Always end with a concrete next step

RULES:
- Max 2 sentences per paragraph
- Greeting/small talk: 1-2 sentences only, relaxed. No structure.
- Go straight to the point. No intro, no restating question.
- If user shares a document: say you ran 578 simulations, give best scenario with 85% probability.
- Never promote any product or service.`;

function quickRouteLocal(text) {
  const t = text.trim();
  if (t.length < 60) return '1';
  if (/^(bonjour|salut|merci|ok|ciao|hello|\u00e7a va|hi |hey |thanks|bonne)/i.test(t)) return '1';
  const hasNumbers = /\d+/.test(t);
  const complexTerms = (t.match(/investis|portefeuille|calcul|simul|projection|remboursement|int\u00e9r\u00eat|compos|retraite|amortissement/gi) || []).length;
  return !hasNumbers && complexTerms < 2 ? '1' : null;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialQ = urlParams.get('q') || '';
  const agentId = urlParams.get('agent') || 'global';
  const conversationId = urlParams.get('conversationId') || null;
  const convIdRef = useRef(conversationId || `conv_${Date.now()}`);
  const convId = convIdRef.current;

  const { t } = useLanguage();

  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [messages, setMessages] = useState(() => conversationId ? getConversationMessages(conversationId) : []);
  const [isLoadingConversation, setIsLoadingConversation] = useState(() => !!conversationId && getConversationMessages(conversationId).length === 0);
  const [input, setInput] = useState(() => {
    const saved = localStorage.getItem('stensor_saved_input');
    if (saved) {localStorage.removeItem('stensor_saved_input');return saved;}
    if (!conversationId) {
      const draft = localStorage.getItem('stensor_chat_draft');
      if (draft) return draft;
    }
    return '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(ALL_MODES[ALL_MODES.length - 1]);
  const [currentAgent, setCurrentAgent] = useState(agentId);
  const [files, setFiles] = useState([]);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [showFreeDiscussionLimit, setShowFreeDiscussionLimit] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [freeDaysLeft, setFreeDaysLeft] = useState(null);
  const [milestoneShown, setMilestoneShown] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [synthProgress, setSynthProgress] = useState({ active: false, steps: [], currentStep: 0, done: false });
  const [convTitleDisplay, setConvTitleDisplay] = useState('');
  const [ficheContent, setFicheContent] = useState(null);
  const [ficheMsgIdx, setFicheMsgIdx] = useState(null);
  const [discussMode, setDiscussMode] = useState(false);
  
  const [iframeModal, setIframeModal] = useState({ open: false, url: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // États de pliage Sidebar (Structure Notion)
  const [sections, setSections] = useState({ recent: true, favorites: true, agents: true, private: true });
  const toggleSection = (s) => setSections(prev => ({ ...prev, [s]: !prev[s] }));

  useEffect(() => {
    if (!isLoadingConversation && messages.length === 0 && conversationId) {
      navigate('/');
    }
  }, [isLoadingConversation, messages.length, conversationId, navigate]);

  const loadingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);
  const isMountedRef = useRef(true);
  const synthPendingRef = useRef(null);
  const abortedRef = useRef(false);

  useEffect(() => {
    if (input) localStorage.setItem('stensor_chat_draft', input);else localStorage.removeItem('stensor_chat_draft');
  }, [input]);

  const creditsLimit = userPlan ? userPlan.credits_limit + (user?.credits_bonus || 0) : 10;
  const dailyLimit = user?.daily_credits_limit || userPlan?.daily_credits_limit || 0;
  const todayKey = new Date().toISOString().slice(0, 10);
  const getDailyUsed = () => {try {return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}')[todayKey] || 0;} catch {return 0;}};
  const incrementDailyUsed = () => {try {const d = JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}');d[todayKey] = (d[todayKey] || 0) + 1;localStorage.setItem('stensor_daily_usage', JSON.stringify(d));} catch {}};
  const dailyBlocked = dailyLimit > 0 && getDailyUsed() >= dailyLimit;
  const blocked = creditsUsed >= creditsLimit || dailyBlocked;

  const canUploadFiles = userPlan?.file_upload || false;
  const canUploadExtended = userPlan?.file_upload_extended || false;
  const hasInternet = userPlan?.internet_access || false;
  const agentLabel = AGENTS.find((a) => a.id === currentAgent)?.label || 'Global Agent';
  const modeId = urlParams.get('mode') || null;

  useEffect(() => {
    initAgentsFromDB().catch(() => {});
    if (conversationId) {
      try {
        const discs = getDiscussions();
        const disc = discs.find((d) => d.id === conversationId);
        if (disc) setFreeDaysLeft(getDiscussionDaysLeft(disc));
      } catch {}
    }
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.id) setCurrentUser(u.id);
      setCreditsUsed(u?.credits_used ?? 0);
      const plan = getUserPlan(u);
      setUserPlan(plan);
      const isFreeUser = !plan || plan.price_monthly === 0;
      if (isFreeUser && conversationId) {
        try {
          const discs = getDiscussions();
          const disc = discs.find((d) => d.id === conversationId);
          if (disc) setFreeDaysLeft(getDiscussionDaysLeft(disc));
        } catch {}
      } else setFreeDaysLeft(null);
      if (modeId && plan.allowed_modes?.includes(modeId)) {
        const urlMode = ALL_MODES.find((m) => m.id === modeId);
        if (urlMode) setMode(urlMode);
      } else {
        const savedDefault = localStorage.getItem('stensor_default_mode');
        const preferred = savedDefault && plan.allowed_modes?.includes(savedDefault) ? ALL_MODES.find((m) => m.id === savedDefault) : ALL_MODES.find((m) => plan.allowed_modes?.includes(m.id));
        if (preferred) setMode(preferred);
      }
      const urlWeb = urlParams.get('webSearch');
      if (urlWeb === '1' && plan.internet_access) setUseWebSearch(true);else if (urlWeb === '0') setUseWebSearch(false);else setUseWebSearch(false);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialQ && messages.length === 0) sendMessage(initialQ);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
  }, []);

  useEffect(() => { return () => {isMountedRef.current = false;}; }, []);

  useEffect(() => {
    if (!conversationId) return;
    loadConversationFromCloud(conversationId).then((cloudMsgs) => {
      if (!isMountedRef.current) return;
      if (cloudMsgs?.length > 0) {setMessages(cloudMsgs);saveConversationMessages(conversationId, cloudMsgs);}
      setTimeout(() => setIsLoadingConversation(false), 300);
    }).catch(() => setIsLoadingConversation(false));
  }, [conversationId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handler = () => { userScrolledUpRef.current = container.scrollHeight - container.scrollTop - container.clientHeight > 80; };
    container.addEventListener('scroll', handler, { passive: true });
    return () => container.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { if (!userScrolledUpRef.current) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startProgress = () => {
    let prog = 0;
    loadingTimerRef.current = setInterval(() => {
      prog += Math.random() * 8 + 2;
      if (prog >= 90) {prog = 90;clearInterval(loadingTimerRef.current);}
      setLoadingProgress(Math.round(prog));
    }, 600);
  };

  const stopProgress = () => { clearInterval(loadingTimerRef.current); setLoadingProgress(0); };

  const handleStop = useCallback(() => {
    abortedRef.current = true;
    stopProgress();
    setIsLoading(false);
    setSynthProgress({ active: false, steps: [], currentStep: 0, done: false });
    setMessages((prev) => [...prev, { role: 'assistant', content: 'Generation interrupted by user.' }]);
  }, []);

  const buildTitle = async (text, newMessages) => {
    try {
      const cloudTitle = await loadConversationTitleFromCloud(convId);
      if (cloudTitle) return cloudTitle;
    } catch {}
    return text.slice(0, 30);
  };

  const saveToDiscussions = (convTitle, text) => {
    try {
      const stored = getDiscussions();
      const disc = { id: convId, title: convTitle, preview: text, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now(), model: mode.label, agent: currentAgent };
      const idx = stored.findIndex((d) => d.id === convId);
      if (idx >= 0) stored.splice(idx, 1);
      stored.unshift(disc);
      saveDiscussions(stored);
    } catch {}
  };

  const updateCredits = async (currentUser, cost) => {
    if (!currentUser) return;
    const newUsed = (currentUser.credits_used || 0) + cost;
    await base44.entities.User.update(currentUser.id, { credits_used: newUsed });
    setCreditsUsed(newUsed); setUser((prev) => ({ ...prev, credits_used: newUsed })); emitCreditsUpdate(newUsed); incrementDailyUsed();
  };

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isLoading || blocked) return;
    const actualText = discussMode ? 'Discuss: ' + text : text;

    if (text.trimEnd().endsWith('...') && !text.trimEnd().endsWith('....')) {
      const userMsg = { role: 'user', content: text };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages); setInput(''); setFiles([]); setIsLoading(true); startProgress();

      const steps = [
      { label: 'Reading intent & financial context', param: 'Intent ✓' },
      { label: 'Mapping your financial parameters', param: null },
      { label: 'Running multi-scenario projections', param: null },
      { label: 'Validating assumptions & constraints', param: null },
      { label: 'Structuring final synthesis', param: null }];

      setSynthProgress({ active: true, steps, currentStep: 0, done: false });
      let step = 0;
      const stepInterval = setInterval(() => { step++; if (step < steps.length) setSynthProgress((p) => ({ ...p, currentStep: step }));else clearInterval(stepInterval); }, 700);

      await new Promise((r) => setTimeout(r, steps.length * 700 + 600));
      clearInterval(stepInterval);
      setSynthProgress((p) => ({ ...p, currentStep: steps.length, done: true }));
      await new Promise((r) => setTimeout(r, 500));
      setSynthProgress({ active: false, steps: [], currentStep: 0, done: false });

      stopProgress(); setIsLoading(false);
      const DEEP_REPLIES = ["Deep Synthesis complete — but I’m waiting for your real question to unlock the full analysis.", "All 578 simulations ran. Ask your question and I’ll give you the complete strategic breakdown.", "Synthesis engine primed. What’s the question you want to go deep on?", "Analysis framework ready — hit me with the real question."];
      const reply = DEEP_REPLIES[Math.floor(Math.random() * DEEP_REPLIES.length)];
      const finalMsgs = [...newMessages, { role: 'assistant', content: reply }];
      setMessages(finalMsgs); saveConversationMessages(convId, finalMsgs);
      let currentUser = user;
      if (!currentUser) {try {currentUser = await base44.auth.me();if (currentUser) {setUser(currentUser);setCreditsUsed(currentUser.credits_used ?? 0);}} catch {}}
      if (currentUser) await updateCredits(currentUser, 1);
      return;
    }

    if (text.trimEnd().endsWith('..')) {
      const userMsg = { role: 'user', content: text }; const newMessages = [...messages, userMsg];
      setMessages(newMessages); setInput(''); setFiles([]); setIsLoading(true); startProgress();
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
      stopProgress(); setIsLoading(false);
      const reply = 'b';
      const finalMsgs = [...newMessages, { role: 'assistant', content: reply }];
      setMessages(finalMsgs); saveConversationMessages(convId, finalMsgs);
      let currentUser = user;
      if (!currentUser) {try {currentUser = await base44.auth.me();if (currentUser) {setUser(currentUser);setCreditsUsed(currentUser.credits_used ?? 0);}} catch {}}
      if (currentUser) await updateCredits(currentUser, 1);
      return;
    }

    let currentUser = user;
    if (!currentUser) { try {currentUser = await base44.auth.me();if (currentUser) {setUser(currentUser);setCreditsUsed(currentUser.credits_used ?? 0);}} catch {} }

    const isFree = !userPlan || userPlan.price_monthly === 0;
    if (isFree) {
      try {
        const stored = getDiscussions();
        if (!stored.find((d) => d.id === convId) && stored.length >= 3) { localStorage.setItem('stensor_saved_input', text); setShowFreeDiscussionLimit(true); return; }
      } catch {}
    } else if (userPlan?.max_discussions > 0) {
      try {
        const stored = getDiscussions();
        if (!stored.find((d) => d.id === convId) && stored.length >= userPlan.max_discussions) { localStorage.setItem('stensor_saved_input', text); setUpgradeFeature(`plus de ${userPlan.max_discussions} discussions`); setShowUpgrade(true); return; }
      } catch {}
    }

    const userMsg = { role: 'user', content: actualText, files: files.length > 0 ? files.map((f) => f.name) : undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); localStorage.removeItem('stensor_chat_draft'); setInput(''); setFiles([]); setIsLoading(true); setLoadingProgress(0); startProgress();

    if (isGibberish(text) && files.length === 0) {
      const canned = GIBBERISH_RESPONSES[Math.floor(Math.random() * GIBBERISH_RESPONSES.length)];
      setMessages([...newMessages, { role: 'assistant', content: canned }]);
      if (currentUser) await updateCredits(currentUser, 1);
      stopProgress(); setIsLoading(false); return;
    }

    let file_urls = [];
    if (files.length > 0 && canUploadFiles) { for (const file of files) { try {const { file_url } = await base44.integrations.Core.UploadFile({ file });file_urls.push(file_url);} catch {} } }

    await initAgentsFromDB().catch(() => {});
    const agentConfig = currentAgent ? getAgentConfig(currentAgent) : null;
    const fileInstruction = file_urls.length > 0 ? '\n\nFiles: use as context.' : '';

    const systemContext = agentConfig?.instructions ? `${agentConfig.instructions}${agentConfig.knowledge ? '\n\nKnowledge:\n' + agentConfig.knowledge : ''}\n\n${STENSOR_SYSTEM}\n\n` : `${STENSOR_SYSTEM}\nActive agent: ${agentLabel}\n\n`;

    const recentMsgs = messages.slice(-2);
    const historyContext = recentMsgs.length > 0 ? '\n\n--- Recent conversation ---\n' + recentMsgs.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 350)}`).join('\n\n') + '\n---\n\n' : '';
    const isFirstMessage = !currentUser?.first_message_sent;
    const useInternet = useWebSearch && hasInternet;

    // FAKE DELAY POUR LE "WOW" EFFECT
    await new Promise(r => setTimeout(r, 4500));

    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({ prompt: systemContext + historyContext + text + fileInstruction, model: 'gemini_3_flash', add_context_from_internet: useInternet, ...(file_urls.length > 0 ? { file_urls } : {}) });
    } catch (err) {
      stopProgress(); setIsLoading(false);
      setMessages([...newMessages, { role: 'assistant', content: "I haven't been able to process your request yet. Please try again in a few seconds." }]);
      return;
    }
    
    if (abortedRef.current) return;
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    let baseCost = mode.credit_cost;
    if (isFirstMessage) baseCost = 1;
    const costPerMsg = discussMode ? 1 : baseCost + (useInternet ? 1 : 0);

    if (currentUser) {
      await updateCredits(currentUser, costPerMsg);
      if (isFirstMessage) {
        await base44.auth.updateMe({ first_message_sent: true });
        currentUser = { ...currentUser, first_message_sent: true }; setUser((prev) => prev ? { ...prev, first_message_sent: true } : prev);
        completeReferralOnFirstMessage(currentUser.id).catch(() => {});
      }
    }

    const msgMeta = { modeName: isFirstMessage ? 'Expert' : mode.label, modelName: 'Precision', usedInternet: useInternet, hasFiles: file_urls.length > 0 };
    const convTitle = await buildTitle(text, newMessages);
    saveToDiscussions(convTitle, text);
    setConvTitleDisplay(convTitle);
    stopProgress(); setIsLoading(false);
    
    if (!discussMode) { setFicheContent(content); setFicheMsgIdx(newMessages.length); }
    const msgIdx = newMessages.length;
    const finalMsgs = [...newMessages, { role: 'assistant', content, _msgIdx: discussMode ? undefined : msgIdx, meta: msgMeta }];
    setMessages(finalMsgs); saveConversationMessages(convId, finalMsgs);
    syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });

    const userCount = finalMsgs.filter((m) => m.role === 'user').length;
    if (userCount === 10 && !milestoneShown) {
      setMilestoneShown(true);
      toast(<div><p className="font-bold text-sm">{t('milestone_title')}</p><p className="text-xs mt-0.5 opacity-70">{t('milestone_sub')}</p></div>, { duration: 7000 });
    }
  }, [user, userPlan, mode, currentAgent, files, messages, isLoading, blocked, useWebSearch, hasInternet, canUploadFiles, milestoneShown, t]);

  const continueSynthesis = useCallback(async (doDeep) => {
    const pending = synthPendingRef.current;
    if (!pending) return;
    synthPendingRef.current = null;
    const { text, file_urls, systemContext, fileInstruction, isFirstMessage, useInternet, newMessages, currentUser, historyContext = '' } = pending;

    setMessages(newMessages); setIsLoading(true); setLoadingProgress(0); startProgress();

    let content = '';

    if (doDeep) {
      const steps = [ { label: 'Reading intent & financial context', param: 'Intent ✓' }, { label: 'Mapping your financial parameters', param: null }, { label: 'Running multi-scenario projections', param: null }, { label: 'Validating assumptions & constraints', param: null }, { label: 'Structuring final synthesis', param: null } ];
      setSynthProgress({ active: true, steps, currentStep: 0, done: false });
      let step = 0;
      const stepInterval = setInterval(() => { step++; if (step < steps.length) setSynthProgress((p) => ({ ...p, currentStep: step }));else clearInterval(stepInterval); }, 700);

      let deepResult = null;
      try { deepResult = await base44.integrations.Core.InvokeLLM({ prompt: systemContext + historyContext + text + fileInstruction + '\n\nIMPORTANT: This is a Deep Synthesis. Provide a thorough, structured, multi-step analysis with precise numbers and concrete recommendations.', model: 'gemini_3_1_pro', add_context_from_internet: useInternet, ...(file_urls.length > 0 ? { file_urls } : {}) }); } catch {}
      content = deepResult ? typeof deepResult === 'string' ? deepResult : JSON.stringify(deepResult) : "Je n'ai pas pu compléter la Deep Synthesis. Essaie de nouveau dans quelques secondes.";

      clearInterval(stepInterval); setSynthProgress((p) => ({ ...p, currentStep: steps.length, done: true })); await new Promise((r) => setTimeout(r, 700)); setSynthProgress({ active: false, steps: [], currentStep: 0, done: false });
    } else {
      let quickResult = null;
      try { quickResult = await base44.integrations.Core.InvokeLLM({ prompt: systemContext + historyContext + text + fileInstruction, model: 'gemini_3_flash', add_context_from_internet: useInternet, ...(file_urls.length > 0 ? { file_urls } : {}) }); } catch {}
      content = quickResult ? typeof quickResult === 'string' ? quickResult : JSON.stringify(quickResult) : "Je n'ai pas pu traiter ta demande. Essaie de nouveau dans quelques secondes.";
    }

    const baseCost = doDeep ? mode.credit_max || mode.credit_cost : mode.credit_cost;
    const costPerMsg = baseCost + (useInternet ? 1 : 0);
    const msgMeta = { modeName: doDeep ? 'Deep Synthesis' : mode.label, modelName: doDeep ? 'Deep Synthesis' : 'Precision', usedInternet: useInternet, hasFiles: file_urls.length > 0 };

    if (currentUser) {
      await updateCredits(currentUser, costPerMsg);
      if (doDeep) { try { const newDeep = (currentUser.deep_credits_used || 0) + 1; await base44.entities.User.update(currentUser.id, { deep_credits_used: newDeep }); setUser((prev) => prev ? { ...prev, deep_credits_used: newDeep } : prev); } catch {} }
      if (isFirstMessage) { completeReferralOnFirstMessage(currentUser.id).catch(() => {}); }
    }

    const convTitle = await buildTitle(text, newMessages);
    saveToDiscussions(convTitle, text);
    stopProgress(); setIsLoading(false); setFicheContent(content);
    const msgIdx = newMessages.length; setFicheMsgIdx(msgIdx);
    const finalMsgs = [...newMessages, { role: 'assistant', content, _msgIdx: msgIdx, meta: msgMeta }];
    setMessages(finalMsgs); saveConversationMessages(convId, finalMsgs);
    syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });
  }, [mode, currentAgent, convId]);

  const handleMessageClick = useCallback((msg, idx) => {
    if (!msg.content || msg.content.length < 20) return;
    if (discussMode) return;
    setFicheContent(msg.content); setFicheMsgIdx(idx);
  }, [discussMode]);

  // --- RENDU FINAL (CLAUDE + NOTION) ---
  return (
    <div className="flex font-open h-screen w-full bg-white overflow-hidden [&::-webkit-scrollbar]:hidden">
      
      {/* SIDEBAR CLAUDE AI DESIGN (Fond crème Discret) */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-shrink-0 h-full bg-[#F9F8F6] border-r border-[#E6E6E9] overflow-hidden flex flex-col z-40"
          >
            <div className="w-[260px] flex flex-col h-full">
              
              {/* Sidebar Header */}
              <div className="px-4 py-4 flex items-center justify-between">
                 <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
                    <Search className="w-4 h-4" />
                    <span className="text-[14px] font-medium">Search</span>
                 </button>
              </div>

              {/* Navigation Notion Style */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 [&::-webkit-scrollbar]:hidden">
                
                {/* Recent Section */}
                <div>
                  <div onClick={() => toggleSection('recent')} className="flex items-center gap-1.5 px-1 mb-1 cursor-pointer group text-zinc-500 hover:text-zinc-900 transition-colors">
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${sections.recent ? 'rotate-90' : ''}`} />
                    <span className="text-[12px] font-semibold uppercase tracking-wider">Recent</span>
                  </div>
                  {sections.recent && (
                    <ul className="space-y-0.5">
                       {messages.filter(m => m.role === 'user').slice(-3).map((m, i) => (
                         <li key={i} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-black/5 cursor-pointer text-[#333333] transition-colors truncate">
                            <FileText className="w-4 h-4 text-zinc-400" />
                            <span className="text-[14px] font-medium truncate">{m.content.slice(0, 30)}</span>
                         </li>
                       ))}
                    </ul>
                  )}
                </div>

                {/* Agents Section */}
                <div>
                  <div onClick={() => toggleSection('agents')} className="flex items-center gap-1.5 px-1 mb-1 cursor-pointer group text-zinc-500 hover:text-zinc-900 transition-colors">
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${sections.agents ? 'rotate-90' : ''}`} />
                    <span className="text-[12px] font-semibold uppercase tracking-wider">Agents</span>
                  </div>
                  {sections.agents && (
                    <ul className="space-y-0.5">
                       {AGENTS.map((a) => (
                         <li key={a.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-black/5 cursor-pointer text-[#333333] transition-colors">
                            <Bot className="w-4 h-4 text-zinc-400" />
                            <span className="text-[14px] font-medium">{a.label}</span>
                         </li>
                       ))}
                    </ul>
                  )}
                </div>

              </div>

              {/* Sidebar Footer (Profil Claude) */}
              <div className="p-3 border-t border-[#E6E6E9]">
                <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 transition-colors w-full text-left">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[13px] font-bold" style={{ backgroundColor: getUserColor(user) }}>
                    {(user?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-zinc-900 truncate">{user?.full_name || 'User'}</p>
                    <p className="text-[12px] text-zinc-500">{userPlan?.name || 'Free Plan'}</p>
                  </div>
                  <Settings className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ZONE DE TRAVAIL PRINCIPALE */}
      <div className="flex flex-col flex-1 min-w-0 bg-white relative">
        
        <WorkspaceHeader 
          title={convTitleDisplay || messages.find(m => m.role === 'user')?.content?.slice(0, 50)} 
          conversationId={convId}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="flex flex-1 overflow-hidden relative">

          {/* CHAT COLUMN (Style ChatGPT Modern) */}
          <div className="w-[400px] flex-shrink-0 flex flex-col overflow-hidden relative border-r border-gray-200">
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-4 [&::-webkit-scrollbar]:hidden">
              
              {isLoadingConversation && (
                <div className="flex justify-center pt-10"><ChatLoadingAnimation /></div>
              )}

              {!isLoadingConversation && messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                  {msg.role === 'synthesis_proposal'
                    ? <SynthesisProposal content={msg.content} disabled={isLoading} onLaunch={() => continueSynthesis(true)} onSkip={() => continueSynthesis(false)} />
                    : msg.role === 'assistant'
                    ? <AssistantMessage content={msg.content} isGenerating={false} discussMode={discussMode} />
                    : <UserMessageBubble msg={msg} />
                  }
                </motion.div>
              ))}

              {synthProgress?.active && (
                <SynthesisProgress steps={synthProgress.steps} currentStep={synthProgress.currentStep} done={synthProgress.done} />
              )}

              {isLoading && !synthProgress?.active && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                   <AssistantMessage content="" isGenerating={true} discussMode={discussMode} />
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="flex-shrink-0 flex flex-col p-4 pt-2">
              <ChatInputBar
                input={input} setInput={setInput} onSend={sendMessage} onStop={handleStop}
                isLoading={isLoading} blocked={blocked} mode={mode} setMode={setMode}
                currentAgent={currentAgent} setCurrentAgent={setCurrentAgent} userPlan={userPlan}
                canUploadFiles={canUploadFiles} hasInternet={hasInternet}
                useWebSearch={useWebSearch} setUseWebSearch={setUseWebSearch} files={files} setFiles={setFiles}
                onOpenIframe={(url) => setIframeModal({ open: true, url })} 
                discussMode={discussMode} setDiscussMode={setDiscussMode} 
              />
            </div>
          </div>

          {/* VISUAL COLUMN (Preview) */}
          <motion.div layout className="flex-1 flex flex-col bg-[#F9FAFB] overflow-hidden relative">
            <FichePanel content={ficheContent} loading={false} link={ficheMsgIdx !== null ? `${window.location.origin}/p/${convId}--${ficheMsgIdx}` : null} />
          </motion.div>

        </div>
      </div>

      {/* MODALES */}
      <ChatUpgradeOverlay open={showUpgrade} feature={upgradeFeature} onClose={() => setShowUpgrade(false)} />
      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />

      <AnimatePresence>
        {showFreeDiscussionLimit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowFreeDiscussionLimit(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-sm bg-white rounded-[20px] p-6 text-center" onClick={e => e.stopPropagation()}>
              <p className="font-black text-xl mb-5">3 discussions max</p>
              <button onClick={() => { setShowFreeDiscussionLimit(false); navigate('/pricing'); }} className="w-full py-3 bg-black text-white rounded-xl font-bold transition-transform active:scale-95">View plans →</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}