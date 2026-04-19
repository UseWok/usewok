import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import { ALL_MODES, CHAR_SPEED, LOGO_URL, FG, YUZU, isGibberish, GIBBERISH_RESPONSES } from '@/lib/chat-constants';
import { completeReferralOnFirstMessage } from '@/lib/referral';
import { getUserPlan } from '@/lib/plans-config';
import { emitCreditsUpdate } from '@/lib/credits-events';
import { getDiscussions, saveDiscussions, getConversationMessages, saveConversationMessages, setCurrentUser, syncConversationToCloud, loadConversationFromCloud, loadConversationTitleFromCloud } from '@/lib/discussions';
import { initAgentsFromDB, getAgentConfig } from '@/lib/agents-config';
import { useLanguage } from '@/lib/i18n';

import ChatTopBar from '@/components/chat/ChatTopBar';
import ChatInputBar from '@/components/chat/ChatInputBar';
import ChatUpgradeOverlay from '@/components/chat/ChatUpgradeOverlay';
import AssistantMessage from '@/components/chat/AssistantMessage';
import UserMessageBubble from '@/components/chat/UserMessageBubble';
import ChatLoadingAnimation from '@/components/chat/ChatLoadingAnimation';

const STORAGE_KEY = 'stensor_discussions';
const AGENTS = [
  { id: 'global', label: "Knowing exactly where I'm going" },
  { id: 'emotions-depenses', label: 'Spend without guilt' },
  { id: 'wealth-strategy', label: 'Becoming financially free' },
];

const STENSOR_SYSTEM = `You are Stensor — a brilliant, warm, and engaging financial friend. You speak like a real friend who genuinely wants the best for the user, not like a robot.

LANGUAGE: ALWAYS reply in the same language as the user's message. If they write in French, reply in French. Match their language perfectly.

CRITICAL — ANSWER THE ACTUAL QUESTION:
- **Read the question carefully** — what are they REALLY asking?
- **NEVER default to investment advice** if the question is about something else (budgeting, debt, savings, career, spending habits, etc.).
- If they ask about **saving for a goal**, talk about saving strategies — NOT investing.
- If they ask about **debt**, talk about debt payoff — NOT investing.
- If they ask about **budgeting**, talk about budgeting — NOT investing.
- **Match the topic**: answer what they asked, not what you think they should ask.

MANDATORY SPACING — NON-NEGOTIABLE:
- **Every 2 sentences MAX**, add **2 blank lines** (press Enter twice).
- **NEVER** write more than 2 sentences without a double line break.

MANDATORY FORMATTING:
- **Bold** key numbers, actions, and important concepts.
- Use **## Headings** to separate major sections.
- **Bullet points** for any list (one item per line).
- **NO blocks of text** — everything must feel spacious.
- **Concrete actions only**: specific numbers, percentages, timeframes, exact steps.

RESPONSE STRUCTURE:
1. **Warm opening** (1 sentence) — show you understand THEIR specific situation.
2. **## [Topic-specific heading]** — address what they actually asked.
3. **2-3 concrete recommendations** tailored to their question.
4. **## Why this works** — 1-2 sentences with reasoning.
5. **➡️ Next step** — one action they can take TODAY.

HAVE AN OPINION:
- **Don't be neutral** — take a stance based on their situation.
- **Be direct**: "Here's what I'd do" not "Some people do X, others do Y".
- **Show personality**: you're a friend, not a textbook.
- **Ask clarifying questions** if needed: "How much do you have saved already?"

EXAMPLE — If asked "How do I save $5000 for a trip in 6 months?":

I love this goal — let's make it happen.

## Your 6-month savings plan

- **Save $833/month** — set up **auto-transfer on payday** to a **separate high-yield account**.
- **Cut 2 expenses** temporarily: subscriptions (**$50/month**) + dining out (**$200/month**) = **$250/month freed up**.
- **Pick up a side gig**: weekend shifts or freelance (**$300-400/month**).

## Why this works

You'll hit **$5000 in 6 months** without touching your regular budget.

➡️ **Today**: Open a separate savings account and name it "Trip Fund" — visual separation helps.

RULES:
- **NEVER** say "Of course!", "Absolutely!", "Certainly!" — start directly.
- **ALWAYS** use ## for section headers.
- **ALWAYS** end with ➡️ and one concrete action.
- **NO walls of text** — double breaks every 2 sentences.
- **Be specific**: bank names, dollar amounts, timeframes.
- **Show empathy**: validate their feelings and goals.
- **Use 1-2 emojis max** for warmth.
- **STAY ON TOPIC**: if they ask about X, talk about X — not investing.`;

export default function ChatPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(ALL_MODES[ALL_MODES.length - 1]);
  const [currentAgent, setCurrentAgent] = useState(agentId);
  const [files, setFiles] = useState([]);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [milestoneShown, setMilestoneShown] = useState(false);
  const [showLoadingDetails, setShowLoadingDetails] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState([]);
  const loadingTimerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);
  const isMountedRef = useRef(true);
  const typewriterRef = useRef(null);

  const creditsLimit = userPlan ? userPlan.credits_limit + (user?.credits_bonus || 0) : 10;
  const dailyLimit = user?.daily_credits_limit || userPlan?.daily_credits_limit || 0;
  const todayKey = new Date().toISOString().slice(0, 10);
  const getDailyUsed = () => { try { return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}')[todayKey] || 0; } catch { return 0; } };
  const incrementDailyUsed = () => { try { const d = JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}'); d[todayKey] = (d[todayKey] || 0) + 1; localStorage.setItem('stensor_daily_usage', JSON.stringify(d)); } catch {} };
  const dailyBlocked = dailyLimit > 0 && getDailyUsed() >= dailyLimit;
  const blocked = creditsUsed >= creditsLimit || dailyBlocked;

  const canUploadFiles = userPlan?.file_upload || false;
  const canUploadExtended = userPlan?.file_upload_extended || false;
  const hasInternet = userPlan?.internet_access || false;
  const agentLabel = AGENTS.find(a => a.id === currentAgent)?.label || 'Global Agent';
  const modeId = urlParams.get('mode') || null;

  useEffect(() => {
    initAgentsFromDB().catch(() => {});
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.id) setCurrentUser(u.id);
      setCreditsUsed(u?.credits_used ?? 0);
      const plan = getUserPlan(u);
      setUserPlan(plan);
      if (modeId && plan.allowed_modes?.includes(modeId)) {
        const urlMode = ALL_MODES.find(m => m.id === modeId);
        if (urlMode) setMode(urlMode);
      } else {
        const best = ALL_MODES.find(m => plan.allowed_modes?.includes(m.id));
        if (best) setMode(best);
      }
      const urlWeb = urlParams.get('webSearch');
      if (urlWeb === '1' && plan.internet_access) setUseWebSearch(true);
      else if (urlWeb === '0') setUseWebSearch(false);
      else if (plan.internet_access) setUseWebSearch(true);
      else setUseWebSearch(false);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialQ && messages.length === 0) sendMessage(initialQ);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
  }, []);

  useEffect(() => {
    return () => { isMountedRef.current = false; if (typewriterRef.current) clearTimeout(typewriterRef.current); };
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    loadConversationFromCloud(conversationId).then(cloudMsgs => {
      if (!isMountedRef.current) return;
      if (cloudMsgs?.length > 0) { setMessages(cloudMsgs); saveConversationMessages(conversationId, cloudMsgs); }
      setTimeout(() => setIsLoadingConversation(false), 300);
    }).catch(() => setIsLoadingConversation(false));
  }, [conversationId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const handler = () => {
      userScrolledUpRef.current = container.scrollHeight - container.scrollTop - container.clientHeight > 80;
    };
    container.addEventListener('scroll', handler, { passive: true });
    return () => container.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!userScrolledUpRef.current) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isLoading || blocked) return;

    let currentUser = user;
    if (!currentUser) {
      try { currentUser = await base44.auth.me(); if (currentUser) { setUser(currentUser); setCreditsUsed(currentUser.credits_used ?? 0); } } catch {}
    }

    // Check discussion limit
    if (userPlan?.max_discussions > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!stored.find(d => d.id === convId) && stored.length >= userPlan.max_discussions) {
          setUpgradeFeature(`plus de ${userPlan.max_discussions} discussions`);
          setShowUpgrade(true);
          return;
        }
      } catch {}
    }

    const userMsg = { role: 'user', content: text, files: files.length > 0 ? files.map(f => f.name) : undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setFiles([]);
    setIsLoading(true);
    setShowLoadingDetails(true);
    setLoadingSteps([
      { text: 'Understanding your question...', time: Date.now() },
    ]);
    
    // Simulation des étapes de réflexion
    const steps = [
      { text: 'Searching for context...', delay: 800 },
      { text: 'Analyzing key concepts...', delay: 1500 },
      { text: 'Building your answer...', delay: 2200 },
    ];
    
    steps.forEach((step, idx) => {
      setTimeout(() => {
        setLoadingSteps(prev => [...prev, { text: step.text, time: Date.now() }]);
      }, step.delay);
    });

    // Gibberish fast path
    if (isGibberish(text) && files.length === 0) {
      const canned = GIBBERISH_RESPONSES[Math.floor(Math.random() * GIBBERISH_RESPONSES.length)];
      setMessages([...newMessages, { role: 'assistant', content: canned }]);
      if (currentUser) {
        const newUsed = (currentUser.credits_used || 0) + 1;
        await base44.entities.User.update(currentUser.id, { credits_used: newUsed });
        setCreditsUsed(newUsed); setUser(prev => ({ ...prev, credits_used: newUsed }));
        emitCreditsUpdate(newUsed); incrementDailyUsed();
      }
      setIsLoading(false);
      return;
    }

    let file_urls = [];
    if (files.length > 0 && canUploadFiles) {
      for (const file of files) {
        try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); file_urls.push(file_url); } catch {}
      }
    }

    // Always fetch latest agent config from DB before building system prompt
    await initAgentsFromDB().catch(() => {});
    const agentConfig = currentAgent ? getAgentConfig(currentAgent) : null;
    const fileInstruction = file_urls.length > 0 ? '\n\nFiles attached — use them as context but do not describe their content. Answer directly.' : '';
    const systemContext = agentConfig?.instructions
      ? `${agentConfig.instructions}${agentConfig.knowledge ? '\n\nKnowledge:\n' + agentConfig.knowledge : ''}\n\n${STENSOR_SYSTEM}\n\n`
      : `${STENSOR_SYSTEM}\nActive agent: ${agentLabel}\n\n`;

    const isFirstMessage = !currentUser?.first_message_sent;
    // First message: Gemini 3.1 Pro with internet, FREE. Then normal models.
    const autoModel = mode.id === 'ultimate' ? 'claude_sonnet_4_6' : 'gpt_5';
    const secretModel = isFirstMessage ? 'gemini_3_1_pro' : autoModel;
    const useInternet = isFirstMessage ? true : (useWebSearch && hasInternet);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: systemContext + text + fileInstruction,
      model: secretModel,
      add_context_from_internet: useInternet,
      ...(file_urls.length > 0 ? { file_urls } : {}),
    });
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    // Credit cost - First message FREE, then normal pricing
    let baseCost;
    if (isFirstMessage) { baseCost = 0; } // First message FREE
    else if (mode.id === 'ultimate') { baseCost = 3; } // Claude Sonnet
    else { baseCost = 1; } // GPT-5
    const costPerMsg = baseCost + (useInternet && !isFirstMessage ? 1 : 0);

    if (currentUser) {
      const newUsed = (currentUser.credits_used || 0) + costPerMsg;
      await base44.entities.User.update(currentUser.id, { credits_used: newUsed });
      setCreditsUsed(newUsed); setUser(prev => ({ ...prev, credits_used: newUsed }));
      emitCreditsUpdate(newUsed); incrementDailyUsed();
      if (isFirstMessage) {
        await base44.auth.updateMe({ first_message_sent: true });
        currentUser = { ...currentUser, first_message_sent: true };
        setUser(prev => prev ? { ...prev, first_message_sent: true } : prev);
        // Complete referral and gift Tensors to referrer
        completeReferralOnFirstMessage(currentUser.id).catch(() => {});
      }
    }

    const msgMeta = { modeName: mode.label, usedInternet: useInternet, hasFiles: file_urls.length > 0 };

    let convTitle = text.slice(0, 50);
    try {
      const cloudTitle = await loadConversationTitleFromCloud(convId);
      if (cloudTitle) { convTitle = cloudTitle; }
      else if (newMessages.length === 1) {
        const titleResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate a very short title (3-5 words) for this message: "${text.slice(0, 150)}". The title language must match the language of the message. Reply ONLY with the title, nothing else.`,
          model: 'gpt_5_mini',
        });
        if (typeof titleResult === 'string' && titleResult.trim()) convTitle = titleResult.trim().slice(0, 60);
      }
    } catch {}

    try {
      const stored = getDiscussions();
      const disc = { id: convId, title: convTitle, preview: text, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now(), model: mode.label, agent: currentAgent };
      const idx = stored.findIndex(d => d.id === convId);
      if (idx >= 0) stored.splice(idx, 1);
      stored.unshift(disc);
      saveDiscussions(stored);
    } catch {}

    setMessages([...newMessages, { role: 'assistant', content: '', meta: msgMeta }]);

    // Typewriter
    let i = 0;
    const typeNext = () => {
      if (!isMountedRef.current) {
        const finalMsgs = [...newMessages, { role: 'assistant', content, agent: currentAgent, meta: msgMeta }];
        saveConversationMessages(convId, finalMsgs);
        syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });
        return;
      }
      if (i < content.length) {
        i++;
        setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: content.slice(0, i), meta: msgMeta }; return u; });
        typewriterRef.current = setTimeout(typeNext, CHAR_SPEED);
      } else {
        const finalMsgs = [...newMessages, { role: 'assistant', content, agent: currentAgent, meta: msgMeta }];
        saveConversationMessages(convId, finalMsgs);
        syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });
        if (isFirstMessage) { const std = ALL_MODES.find(m => m.id === 'thinking'); if (std) setMode(std); }
      }
    };
    typeNext();

    // Milestone toast
    const userCount = [...newMessages, { role: 'assistant', content }].filter(m => m.role === 'user').length;
    if (userCount === 10 && !milestoneShown) {
      setMilestoneShown(true);
      toast(<div><p className="font-bold text-sm">{t('milestone_title')}</p><p className="text-xs mt-0.5 opacity-70">{t('milestone_sub')}</p></div>, { duration: 7000 });
    }

    clearInterval(loadingTimerRef.current);
    setLoadingSteps(prev => [...prev, { text: 'Réponse générée avec succès ✓', time: Date.now() }]);
    setTimeout(() => setShowLoadingDetails(false), 3000);
    setIsLoading(false);
  }, [user, userPlan, mode, currentAgent, files, messages, isLoading, blocked, useWebSearch, hasInternet, canUploadFiles, milestoneShown, t]);

  const editMessage = (idx) => { setInput(messages[idx].content); setMessages(prev => prev.slice(0, idx)); };
  const copyMessage = (content) => { navigator.clipboard.writeText(content); toast.success(t('copied'), { duration: 1000 }); };

  const handleUpgradeRequest = (feature = '') => { setUpgradeFeature(feature); setShowUpgrade(true); };

  return (
    <div className="flex flex-col font-be bg-white" style={{ height: '100dvh' }}>
      <ChatTopBar
        user={user} mode={mode} hasInternet={hasInternet && useWebSearch}
        agentLabel={agentLabel} onUpgradeClick={() => handleUpgradeRequest('')}
      />

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 md:px-8 py-4 space-y-4 max-w-3xl mx-auto w-full">
        {isLoadingConversation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
            <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain opacity-60 flex-shrink-0 mt-1" />
            <div className="flex flex-col gap-1.5 items-start">
              <p className="text-[10px] font-semibold px-1 text-muted-foreground">Chargement...</p>
              <div className="bg-white border border-border rounded-sm shadow-sm">
                <ChatLoadingAnimation mode={mode.id} />
              </div>
            </div>
          </motion.div>
        )}

        {!isLoadingConversation && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
            <img src={LOGO_URL} alt="Stensor" className="w-12 h-12 object-contain" />
            <p className="text-sm text-muted-foreground">{t('start_conversation')}</p>
          </div>
        )}

        {!isLoadingConversation && messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {msg.role === 'assistant'
              ? <AssistantMessage content={msg.content} agent={msg.agent || currentAgent} meta={msg.meta} onClick={() => {}} />
              : <UserMessageBubble msg={msg} userName={user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Moi'} user={user} onCopy={copyMessage} onEdit={() => editMessage(idx)} />
            }
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
            <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain opacity-60 flex-shrink-0 mt-1" />
            <div className="flex flex-col gap-1.5 items-start">
              <p className="text-[10px] font-semibold px-1 text-muted-foreground">Stensor</p>
              <div 
                onClick={() => setShowLoadingDetails(s => !s)}
                className="bg-white border border-border rounded-sm shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <ChatLoadingAnimation mode={mode.id} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading details window */}
        <AnimatePresence>
          {showLoadingDetails && isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="max-w-3xl mx-auto w-full px-3 md:px-8">
              <div className="bg-white border border-border rounded-lg shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="w-4 h-4 rounded-full border-2"
                    style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: '#DDFF00' }}
                  />
                  <p className="text-sm font-bold text-fg">AI is thinking</p>
                </div>
                <div className="p-5 space-y-3">
                  {loadingSteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${idx === loadingSteps.length - 1 ? 'bg-[#DDFF00] animate-pulse' : 'bg-green-500'}`} />
                      <span className={`text-sm ${idx === loadingSteps.length - 1 ? 'font-bold text-fg' : 'text-zinc-500'}`}>{step.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <ChatInputBar
        input={input} setInput={setInput} onSend={sendMessage}
        isLoading={isLoading} blocked={blocked}
        mode={mode} setMode={setMode}
        currentAgent={currentAgent} setCurrentAgent={setCurrentAgent}
        userPlan={userPlan}
        canUploadFiles={canUploadFiles} canUploadExtended={canUploadExtended}
        hasInternet={hasInternet}
        useWebSearch={useWebSearch} setUseWebSearch={setUseWebSearch}
        files={files} setFiles={setFiles}
        onUpgradeRequest={handleUpgradeRequest}
      />

      <ChatUpgradeOverlay
        open={showUpgrade} feature={upgradeFeature}
        onClose={() => setShowUpgrade(false)}
      />
    </div>
  );
}