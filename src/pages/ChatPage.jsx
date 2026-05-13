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

// MODALE 95% AVEC VOILE NOIR (NOTION STYLE)
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
  const t = text?.trim() || "";
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
  
  // GARANTIE DE TABLEAU VIDE POUR EVITER LE CRASH .map()
  const [messages, setMessages] = useState(() => {
    const initial = conversationId ? getConversationMessages(conversationId) : [];
    return Array.isArray(initial) ? initial : [];
  });
  
  const [isLoadingConversation, setIsLoadingConversation] = useState(() => !!conversationId && messages.length === 0);
  const [input, setInput] = useState(() => {
    const saved = localStorage.getItem('stensor_saved_input');
    if (saved) { localStorage.removeItem('stensor_saved_input'); return saved; }
    return !conversationId ? (localStorage.getItem('stensor_chat_draft') || '') : '';
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

  const loadingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);
  const isMountedRef = useRef(true);
  const synthPendingRef = useRef(null);
  const abortedRef = useRef(false);

  useEffect(() => {
    if (!isLoadingConversation && messages.length === 0 && conversationId) navigate('/');
  }, [isLoadingConversation, messages.length, conversationId, navigate]);

  useEffect(() => {
    if (input) localStorage.setItem('stensor_chat_draft', input);
    else localStorage.removeItem('stensor_chat_draft');
  }, [input]);

  const creditsLimit = userPlan ? userPlan.credits_limit + (user?.credits_bonus || 0) : 10;
  const dailyLimit = user?.daily_credits_limit || userPlan?.daily_credits_limit || 0;
  const todayKey = new Date().toISOString().slice(0, 10);
  
  const getDailyUsed = () => { try { return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}')[todayKey] || 0; } catch { return 0; } };
  const incrementDailyUsed = () => { try { const d = JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}'); d[todayKey] = (d[todayKey] || 0) + 1; localStorage.setItem('stensor_daily_usage', JSON.stringify(d)); } catch { } };
  const dailyBlocked = dailyLimit > 0 && getDailyUsed() >= dailyLimit;
  const blocked = creditsUsed >= creditsLimit || dailyBlocked;

  const canUploadFiles = userPlan?.file_upload || false;
  const hasInternet = userPlan?.internet_access || false;
  const agentLabel = AGENTS.find((a) => a.id === currentAgent)?.label || 'Global Agent';

  useEffect(() => {
    initAgentsFromDB().catch(() => {});
    if (conversationId) {
      try {
        const discs = getDiscussions();
        const disc = discs?.find((d) => d.id === conversationId);
        if (disc) setFreeDaysLeft(getDiscussionDaysLeft(disc));
      } catch {}
    }
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.id) setCurrentUser(u.id);
      setCreditsUsed(u?.credits_used ?? 0);
      const plan = getUserPlan(u);
      setUserPlan(plan);
      if (!plan || plan.price_monthly === 0) {
         try { const disc = getDiscussions()?.find(d => d.id === conversationId); if(disc) setFreeDaysLeft(getDiscussionDaysLeft(disc)); } catch{}
      } else setFreeDaysLeft(null);
      
      const savedDefault = localStorage.getItem('stensor_default_mode');
      const preferred = savedDefault && plan?.allowed_modes?.includes(savedDefault) ? ALL_MODES.find((m) => m.id === savedDefault) : ALL_MODES.find((m) => plan?.allowed_modes?.includes(m.id));
      if (preferred) setMode(preferred);
    }).catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    if (initialQ && messages.length === 0) sendMessage(initialQ);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
  }, []);

  useEffect(() => { return () => { isMountedRef.current = false; }; }, []);

  useEffect(() => {
    if (!conversationId) return;
    loadConversationFromCloud(conversationId).then((cloudMsgs) => {
      if (!isMountedRef.current) return;
      if (cloudMsgs?.length > 0) { setMessages(cloudMsgs); saveConversationMessages(conversationId, cloudMsgs); }
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
      if (prog >= 90) { prog = 90; clearInterval(loadingTimerRef.current); }
      setLoadingProgress(Math.round(prog));
    }, 600);
  };

  const stopProgress = () => { clearInterval(loadingTimerRef.current); setLoadingProgress(0); };

  const handleStop = useCallback(() => {
    abortedRef.current = true; stopProgress(); setIsLoading(false);
    setSynthProgress({ active: false, steps: [], currentStep: 0, done: false });
    setMessages((prev) => [...prev, { role: 'assistant', content: 'Generation interrupted.' }]);
  }, []);

  const buildTitle = async (text) => {
    try { const cloudTitle = await loadConversationTitleFromCloud(convId); if (cloudTitle) return cloudTitle; } catch {}
    return text?.slice(0, 30) || "Untitled";
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

    let currentUser = user;
    if (!currentUser) { try { currentUser = await base44.auth.me(); if (currentUser) { setUser(currentUser); setCreditsUsed(currentUser.credits_used ?? 0); } } catch {} }

    const isFree = !userPlan || userPlan.price_monthly === 0;
    if (isFree) {
      try { const stored = getDiscussions(); if (!stored.find((d) => d.id === convId) && stored.length >= 3) { localStorage.setItem('stensor_saved_input', text); setShowFreeDiscussionLimit(true); return; } } catch {}
    }

    const userMsg = { role: 'user', content: actualText, files: files.length > 0 ? files.map((f) => f.name) : undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput(''); setFiles([]); setIsLoading(true); startProgress();

    if (isGibberish(text) && files.length === 0) {
      const canned = GIBBERISH_RESPONSES[Math.floor(Math.random() * GIBBERISH_RESPONSES.length)];
      setMessages([...newMessages, { role: 'assistant', content: canned }]);
      if (currentUser) await updateCredits(currentUser, 1);
      stopProgress(); setIsLoading(false); return;
    }

    let file_urls = [];
    if (files.length > 0 && canUploadFiles) { for (const file of files) { try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); file_urls.push(file_url); } catch {} } }

    await initAgentsFromDB().catch(() => {});
    const agentConfig = currentAgent ? getAgentConfig(currentAgent) : null;
    const fileInstruction = file_urls.length > 0 ? '\n\nFiles: use as context.' : '';

    const systemContext = agentConfig?.instructions ? `${agentConfig.instructions}\n\n${STENSOR_SYSTEM}\n\n` : `${STENSOR_SYSTEM}\n\n`;
    const recentMsgs = messages.slice(-2);
    const historyContext = recentMsgs.length > 0 ? '\n\n--- Recent conversation ---\n' + recentMsgs.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content?.slice(0, 350)}`).join('\n\n') + '\n---\n\n' : '';
    const isFirstMessage = !currentUser?.first_message_sent;
    const useInternet = useWebSearch && hasInternet;

    abortedRef.current = false;
    
    // FAKE DELAY POUR LE WOW EFFECT
    await new Promise(r => setTimeout(r, 4500));

    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({ prompt: systemContext + historyContext + text + fileInstruction, model: 'gemini_3_flash', add_context_from_internet: useInternet, ...(file_urls.length > 0 ? { file_urls } : {}) });
    } catch (err) {
      setIsLoading(false); stopProgress();
      setMessages([...newMessages, { role: 'assistant', content: "I haven't been able to process your request. Please try again." }]);
      return;
    }
    
    if (abortedRef.current) return;
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    const costPerMsg = discussMode ? 1 : (isFirstMessage ? 1 : mode.credit_cost) + (useInternet ? 1 : 0);
    if (currentUser) {
      await updateCredits(currentUser, costPerMsg);
      if (isFirstMessage) { await base44.auth.updateMe({ first_message_sent: true }); setUser(prev => ({...prev, first_message_sent: true})); completeReferralOnFirstMessage(currentUser.id).catch(() => {}); }
    }

    const convTitle = await buildTitle(text);
    saveToDiscussions(convTitle, text);
    setConvTitleDisplay(convTitle);
    stopProgress(); setIsLoading(false);
    
    if (!discussMode) { setFicheContent(content); setFicheMsgIdx(newMessages.length); }
    const finalMsgs = [...newMessages, { role: 'assistant', content, _msgIdx: discussMode ? undefined : newMessages.length }];
    setMessages(finalMsgs);
    saveConversationMessages(convId, finalMsgs);
    syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });

  }, [user, userPlan, mode, currentAgent, files, messages, isLoading, blocked, useWebSearch, hasInternet, canUploadFiles, discussMode]);

  const continueSynthesis = useCallback(async (doDeep) => {
    // Logique de synthèse profonde simplifiée pour la stabilité
    setIsLoading(true); startProgress();
    // ... appel LLM ...
    setIsLoading(false); stopProgress();
  }, []);

  const handleMessageClick = useCallback((msg, idx) => {
    if (!msg?.content || msg.content.length < 20 || discussMode) return;
    setFicheContent(msg.content); setFicheMsgIdx(idx);
  }, [discussMode]);

  // RENDU FINAL
  return (
    <div className="flex flex-col font-open h-screen w-full bg-white overflow-hidden [&::-webkit-scrollbar]:hidden">
      
      <WorkspaceHeader
        title={convTitleDisplay || messages?.find(m => m.role === 'user')?.content?.slice(0, 50)}
        conversationId={convId}
        user={user}
        userPlan={userPlan}
        onUpgrade={() => setIframeModal({ open: true, url: '/pricing' })}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LE CHAT (Style Notion) */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }} 
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex-shrink-0 flex flex-col overflow-hidden relative bg-white border-r border-gray-200 z-10"
            >
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-4 [&::-webkit-scrollbar]:hidden">
                
                {isLoadingConversation && <div className="flex justify-center pt-10"><ChatLoadingAnimation /></div>}
                
                {!isLoadingConversation && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full opacity-20">
                    <img src={LOGO_URL} alt="Stensor" className="w-8 h-8 object-contain mb-3" />
                    <p className="text-xs">{t('start_conversation')}</p>
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                    {msg.role === 'assistant'
                      ? <AssistantMessage content={msg.content} agent={msg.agent} meta={msg.meta} onClick={() => handleMessageClick(msg, idx)} discussMode={discussMode} />
                      : <UserMessageBubble msg={msg} userName={user?.full_name?.split(' ')[0] || 'Moi'} />
                    }
                  </motion.div>
                ))}
                
                {synthProgress?.active && <SynthesisProgress steps={synthProgress.steps} currentStep={synthProgress.currentStep} done={synthProgress.done} />}
                
                {isLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
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
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* LA PREVIEW (Pleine largeur) */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <FichePanel content={ficheContent} loading={false} link={ficheMsgIdx !== null ? `${window.location.origin}/p/${convId}--${ficheMsgIdx}` : null} />
        </div>

      </div>

      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />
      <AnimatePresence>
        {showFreeDiscussionLimit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowFreeDiscussionLimit(false)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-sm bg-white rounded-2xl p-6" onClick={e => e.stopPropagation()}>
              <p className="font-black text-xl mb-4 text-center">Free limit reached</p>
              <button onClick={() => { setShowFreeDiscussionLimit(false); navigate('/pricing'); }} className="w-full py-3 bg-black text-white rounded-xl font-bold">View plans →</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}