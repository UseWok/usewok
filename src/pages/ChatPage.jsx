import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

import { CHAR_SPEED, LOGO_URL, FG, YUZU, isGibberish, GIBBERISH_RESPONSES } from '@/lib/chat-constants';
import { ALL_MODES } from '@/lib/modes-config';
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

const STENSOR_SYSTEM = `Tu es Stensor — un ami financier brillant, chaleureux et attachant. Tu parles comme un vrai ami qui te veut du bien, pas comme un robot.

LANGAGE : Réponds TOUJOURS dans la même langue que l'utilisateur.

LONGUEUR INTELLIGENTE : La longueur idéale dépend de la question. Pour une simple salutation ou question courte : 1-3 phrases MAX. Pour une analyse complexe : jusqu'à 1800 caractères. Adapte toujours — moins c'est souvent mieux. Ne remplis jamais pour avoir l'air complet.

SAUTS DE LIGNE OBLIGATOIRES : Dès que tu dépasses 2 phrases, tu DOIS insérer une ligne vide (comme appuyer 2x sur Entrée) entre chaque paragraphe, avant et après chaque liste, avant et après chaque titre. JAMAIS deux paragraphes collés. Chaque bloc est séparé d'une ligne vide.

FORMATAGE OBLIGATOIRE — SUIS CET EXEMPLE À LA LETTRE :

---
EXEMPLE DE RÉPONSE MODÈLE (copie exactement ce style d'espacement) :

Bonne question !

Voici ce que je te recommande pour **investir 500€/mois** :

- **60%** → ETF World (MSCI World) — croissance long terme
- **30%** → Obligations — stabilité
- **10%** → Cash de précaution

### Pourquoi cette répartition ?

Elle maximise ton **rendement moyen à 7%/an** tout en limitant le risque.

Avec **500€/mois pendant 20 ans**, tu arrives à **~260 000€**.

➡️ Prochaine étape : ouvre un **PEA** cette semaine — c'est gratuit et ça prend 10 min.
---

RÈGLES NON NÉGOCIABLES :
- **JAMAIS de mur de texte.** Max 2 phrases par paragraphe, puis TOUJOURS une ligne vide.
- **Ligne vide obligatoire** entre CHAQUE élément (intro, liste, section, conclusion).
- **Gras** sur tous les chiffres, mots-clés et actions importantes.
- **### Titres** si la réponse a plusieurs parties.
- **Bullet points** dès que tu listes quoi que ce soit (jamais de liste inline).
- Termine TOUJOURS par une ligne ➡️ avec 1 prochaine étape concrète.
- Pas de formules creuses comme "Bien sûr !", "Absolument !", "Certainement !".
- **Droit au but** : pas d'introduction inutile, pas de répétition de la question, pas de conclusion molle. Commence directement par l'essentiel.
- **Règle sociale ABSOLUE** : si le message est une salutation ou petite conversation ("bonjour", "comment ça va", "merci", "ok", "ciao", etc.) → réponds en 1-2 phrases MAX, détendu et humain. JAMAIS de plan, liste ou structure pour une salutation. Exemple : "Bonjour ! Bien et toi ? C'est quoi ton objectif financier du moment ?" — c'est TOUT.
- **Choix multiples** : TOUJOURS sous forme de liste avec un **-** par option. Jamais de choix en ligne (A ou B ou C). Chaque option = une ligne séparée.
- Moins c'est plus : si tu peux dire la même chose en 2 mots plutôt que 6, fais-le.
- NE DIS JAMAIS que tu n'as pas compris — réponds toujours.
- Mode pub : si l'utilisateur dit 'JE VAIS TE POSER UNE QUESTION', vends-toi avec énergie, tableau, étapes ultra concrètes.
- Si l'utilisateur montre un document : dis que tu as lancé **578 simulations**, donne le meilleur scénario avec **85% de probabilité de succès**.`;

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
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [showFreeDiscussionLimit, setShowFreeDiscussionLimit] = useState(false);
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
        const savedDefault = localStorage.getItem('stensor_default_mode');
        const preferred = savedDefault && plan.allowed_modes?.includes(savedDefault)
          ? ALL_MODES.find(m => m.id === savedDefault)
          : ALL_MODES.find(m => plan.allowed_modes?.includes(m.id));
        if (preferred) setMode(preferred);
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

    // Check discussion limit (hard limit of 3 for free plan)
    const isFree = !userPlan || userPlan.price_monthly === 0;
    const FREE_DISCUSSION_LIMIT = 3;
    if (isFree) {
      try {
        const stored = getDiscussions();
        const isExisting = stored.find(d => d.id === convId);
        if (!isExisting && stored.length >= FREE_DISCUSSION_LIMIT) {
          setShowFreeDiscussionLimit(true);
          return;
        }
      } catch {}
    } else if (userPlan?.max_discussions > 0) {
      try {
        const stored = getDiscussions();
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

    // Build AI DNA context from user preferences
    const VISION_MAP = { fire: 'Liberté Totale (FIRE / retraite anticipée)', heritage: 'Héritage immobilier familial', entrepreneur: 'Impact entrepreneurial', serenite: 'Sérénité financière quotidienne' };
    const PERSONALITY_MAP = { sniper: 'Le Sniper (direct, froid, chiffres purs)', architect: "L'Architecte (pédagogue, visionnaire)", guardian: 'Le Gardien (prudent, protecteur)' };
    const TONE_MAP = { brutal: 'sans filtre, direct même si dur', kind: 'bienveillant, célèbre les victoires' };
    const DEPTH_MAP = { concise: 'très concis et percutant', balanced: 'équilibré', deep: 'analyse complète et exhaustive' };
    const dnaLines = [];
    if (currentUser?.ai_vision) dnaLines.push(`- Vision de vie : ${VISION_MAP[currentUser.ai_vision] || currentUser.ai_vision}`);
    if (currentUser?.ai_personality) dnaLines.push(`- Ton caractère : ${PERSONALITY_MAP[currentUser.ai_personality] || currentUser.ai_personality}`);
    if (currentUser?.ai_golden_rule) dnaLines.push(`- Règle d'or à ne jamais enfreindre : "${currentUser.ai_golden_rule}"`);
    if (currentUser?.ai_tone) dnaLines.push(`- Style de communication : ${TONE_MAP[currentUser.ai_tone] || currentUser.ai_tone}`);
    if (currentUser?.ai_depth) dnaLines.push(`- Profondeur d'analyse : ${DEPTH_MAP[currentUser.ai_depth] || currentUser.ai_depth}`);
    if (currentUser?.ai_context) dnaLines.push(`- Contexte personnel : ${currentUser.ai_context}`);
    const dnaBlock = dnaLines.length > 0 ? `\n\n## PROFIL PERSONNALISÉ DE L'UTILISATEUR (RESPECTE ABSOLUMENT CES PRÉFÉRENCES) :\n${dnaLines.join('\n')}\n` : '';

    const systemContext = agentConfig?.instructions
      ? `${agentConfig.instructions}${agentConfig.knowledge ? '\n\nKnowledge:\n' + agentConfig.knowledge : ''}\n\n${STENSOR_SYSTEM}${dnaBlock}\n\n`
      : `${STENSOR_SYSTEM}${dnaBlock}\nActive agent: ${agentLabel}\n\n`;

    const isFirstMessage = !currentUser?.first_message_sent;
    const secretModel = isFirstMessage ? 'gemini_3_1_pro' : mode.model;
    const useInternet = useWebSearch && hasInternet && secretModel !== 'gemini_3_1_pro';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: systemContext + text + fileInstruction,
      model: secretModel,
      add_context_from_internet: useInternet,
      ...(file_urls.length > 0 ? { file_urls } : {}),
    });
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    // Credit cost — minimum garanti par mode, peut aller jusqu'à credit_max
    let baseCost = mode.credit_cost;
    if (mode.credit_max && mode.credit_max > mode.credit_cost) {
      baseCost = Math.floor(Math.random() * (mode.credit_max - mode.credit_cost + 1)) + mode.credit_cost;
    }
    if (isFirstMessage) { baseCost = 1; }
    const costPerMsg = baseCost + (useInternet ? 1 : 0);

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

    const msgMeta = { modeName: isFirstMessage ? 'Expert' : mode.label, modelName: secretModel, usedInternet: useInternet, hasFiles: file_urls.length > 0 };

    let convTitle = text.slice(0, 50);
    try {
      const cloudTitle = await loadConversationTitleFromCloud(convId);
      if (cloudTitle) { convTitle = cloudTitle; }
      else if (newMessages.length === 1) {
        const titleResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Titre très court (3-5 mots) pour: "${text.slice(0, 150)}". Répondre UNIQUEMENT avec le titre.`,
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

      {/* Free plan discussion limit modal */}
      <AnimatePresence>
        {showFreeDiscussionLimit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowFreeDiscussionLimit(false)}>
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="w-full max-w-sm bg-white overflow-hidden"
              style={{ borderRadius: '20px' }}
              onClick={e => e.stopPropagation()}>
              {/* Header gradient */}
              <div className="px-6 pt-8 pb-6 text-center" style={{ background: 'linear-gradient(135deg, #f8ffd0 0%, #e8ff80 100%)' }}>
                <div className="text-4xl mb-3">💬</div>
                <p className="font-black text-xl" style={{ color: FG }}>3 discussions max</p>
                <p className="text-xs font-medium mt-1.5" style={{ color: 'rgba(10,10,10,0.5)' }}>Plan gratuit</p>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-center leading-relaxed mb-5" style={{ color: '#555' }}>
                  Tu as atteint la limite de <strong>3 discussions</strong> sur le plan gratuit.<br />
                  Supprime une discussion existante ou passe à un plan payant pour continuer.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => { setShowFreeDiscussionLimit(false); navigate('/pricing'); }}
                    className="w-full py-3.5 font-black text-sm transition-all hover:opacity-90"
                    style={{ background: FG, color: 'white', borderRadius: '10px' }}>
                    Voir les plans →
                  </button>
                  <button
                    onClick={() => { setShowFreeDiscussionLimit(false); navigate('/app'); }}
                    className="w-full py-3 font-medium text-sm transition-all hover:bg-black/5"
                    style={{ color: '#888', borderRadius: '10px' }}>
                    Gérer mes discussions
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}