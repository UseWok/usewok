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

LANGUAGE: ALWAYS reply in the same language as the user's message. If they write in French, reply in French. If in Spanish, reply in Spanish. Match their language perfectly.

SMART LENGTH: The ideal length depends on the question. For a simple greeting or short question: 1-3 sentences MAX. For complex analysis: up to 1800 characters. Always adapt — less is often more. Never pad to seem thorough.

MANDATORY LINE BREAKS: Whenever you exceed 2 sentences, you MUST insert a blank line (press Enter twice) between each paragraph, before and after each list, before and after each heading. NEVER two paragraphs stuck together. Each block is separated by a blank line.

MANDATORY FORMATTING — FOLLOW THIS EXAMPLE EXACTLY:

---
MODEL RESPONSE EXAMPLE (copy this spacing style exactly):

Good question!

Here's what I recommend for **investing $500/month**:

- **60%** → World ETF (MSCI World) — long-term growth
- **30%** → Bonds — stability
- **10%** → Emergency cash

### Why this allocation?

It maximizes your **average return of 7%/year** while limiting risk.

With **$500/month for 20 years**, you reach **~$260,000**.

➡️ Next step: open a **brokerage account** this week — it's free and takes 10 min.
---

NON-NEGOTIABLE RULES:
- **NEVER a wall of text.** Max 2 sentences per paragraph, then ALWAYS a blank line.
- **Mandatory blank line** between EACH element (intro, list, section, conclusion).
- **Bold** on all numbers, key words, and important actions.
- **### Headings** if the response has multiple parts.
- **Bullet points** whenever you list anything (never inline lists).
- ALWAYS end with a ➡️ line with 1 concrete next step.
- No empty phrases like "Of course!", "Absolutely!", "Certainly!".
- **Straight to the point**: no unnecessary intro, no repeating the question, no weak conclusion. Start directly with what matters.
- **ABSOLUTE SOCIAL RULE**: if the message is a greeting or small talk ("hello", "how are you", "thanks", "ok", "bye", etc.) → reply in 1-2 sentences MAX, relaxed and human. NEVER a plan, list, or structure for a greeting.
- **Multiple choices**: ALWAYS as a list with one **-** per option. Never choices inline (A or B or C). Each option = one separate line.
- Less is more: if you can say the same thing in 2 words instead of 6, do it.
- NEVER say you didn't understand — always reply.
- Ad mode: if the user says 'I HAVE A QUESTION FOR YOU', sell yourself with energy, tables, ultra-concrete steps.
- If the user shows a document: say you ran **578 simulations**, give the best scenario with **85% probability of success**.`;

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
  const [loadingProgress, setLoadingProgress] = useState(0);
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
    setLoadingProgress(0);
    // Fake progress animation
    let prog = 0;
    loadingTimerRef.current = setInterval(() => {
      prog += Math.random() * 8 + 2;
      if (prog >= 90) { prog = 90; clearInterval(loadingTimerRef.current); }
      setLoadingProgress(Math.round(prog));
    }, 600);

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
    setLoadingProgress(0);
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
              ? <AssistantMessage content={msg.content} agent={msg.agent || currentAgent} meta={msg.meta} />
              : <UserMessageBubble msg={msg} userName={user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Moi'} user={user} onCopy={copyMessage} onEdit={() => editMessage(idx)} />
            }
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
            <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain opacity-60 flex-shrink-0 mt-1" />
            <div className="flex flex-col gap-1.5 items-start">
              <p className="text-[10px] font-semibold px-1 text-muted-foreground">Stensor</p>
              <div className="bg-white border border-border rounded-sm shadow-sm">
                <ChatLoadingAnimation mode={mode.id} />
              </div>
              {loadingProgress > 0 && (
                <div className="flex items-center gap-2 px-1">
                  <div className="w-24 h-1 rounded-full overflow-hidden bg-black/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-fg rounded-full"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-zinc-400">~{loadingProgress}%</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
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