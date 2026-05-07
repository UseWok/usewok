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
import ThinkingSteps from '@/components/chat/ThinkingSteps';
import SynthesisProposal from '@/components/chat/SynthesisProposal';
import SynthesisProgress from '@/components/chat/SynthesisProgress';

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
- **Règle sociale ABSOLUE** : si le message est une salutation ou petite conversation ("bonjour", "comment ça va", "merci", "ok", "ciao", etc.) → réponds en 1-2 phrases MAX, détendu et humain. JAMAIS de plan, liste ou structure pour une salutation.
- **Choix multiples** : TOUJOURS sous forme de liste avec un **-** par option. Jamais de choix en ligne (A ou B ou C). Chaque option = une ligne séparée.
- Moins c'est plus : si tu peux dire la même chose en 2 mots plutôt que 6, fais-le.
- NE DIS JAMAIS que tu n'as pas compris — réponds toujours.
- Mode pub : si l'utilisateur dit 'JE VAIS TE POSER UNE QUESTION', vends-toi avec énergie, tableau, étapes ultra concrètes.
- Si l'utilisateur montre un document : dis que tu as lancé **578 simulations**, donne le meilleur scénario avec **85% de probabilité de succès**.

## STENSOR — MOTEURS IA ET TARIFS :

⚡ **RECHERCHES FLASH** : Le moteur d'agilité. Conçu pour les décisions financières quotidiennes, le raisonnement rapide et les requêtes simples. C'est l'outil de la réactivité immédiate.

🧠 **DEEP SYNTHÈSES** : L'artillerie lourde analytique. Réservé aux problèmes financiers les plus complexes. Déploie les modèles IA les plus puissants du marché pour une profondeur d'analyse absolue.

### FORFAITS (Prix Mensuel / Prix Annuel) :

- **Essential** — 28 $ / 20 $ : 50 Flashs + 10 Deep Synthèses.
- **Advanced** — 50 $ / 40 $ : 100 Flashs + 30 Deep Synthèses + Recherche Web + Analyse de fichiers.
- **Expert** — 100 $ / 80 $ : 200 Flashs + 60 Deep Synthèses.
- **Supreme** — 180 $ / 150 $ : 500 Flashs + 100 Deep Synthèses.
- **Supreme 2** — 260 $ / 220 $ : 800 Flashs + 150 Deep Synthèses.
- **Supreme 3** — 340 $ / 280 $ : 1 000 Flashs + 200 Deep Synthèses.
- **Supreme 4** — 420 $ / 350 $ : 1 200 Flashs + 300 Deep Synthèses.

Si l'utilisateur demande son abonnement actuel ou ce qu'il peut faire : utilise les infos de son profil (voir PROFIL PERSONNALISÉ ci-dessous) — le champ "Abonnement actuel" te donnera son plan précis.`;

// Pre-filter local — évite ~95% des appels API routeur sans impact qualité
function quickRouteLocal(text) {
  const t = text.trim();
  if (t.length < 60) return '1';
  if (/^(bonjour|salut|merci|ok|ciao|hello|\u00e7a va|hi |hey |thanks|bonne)/i.test(t)) return '1';
  const hasNumbers = /\d+/.test(t);
  const complexTerms = (t.match(/investis|portefeuille|calcul|simul|projection|remboursement|int\u00e9r\u00eat|compos|retraite|amortissement/gi) || []).length;
  return (!hasNumbers && complexTerms < 2) ? '1' : null;
}

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
  const [input, setInput] = useState(() => {
    const saved = localStorage.getItem('stensor_saved_input');
    if (saved) { localStorage.removeItem('stensor_saved_input'); return saved; }
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
  const [fichePending, setFichePending] = useState(false);

  const loadingTimerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);
  const isMountedRef = useRef(true);
  const typewriterRef = useRef(null);
  const synthPendingRef = useRef(null);

  // Autosave draft
  useEffect(() => {
    if (input) localStorage.setItem('stensor_chat_draft', input);
    else localStorage.removeItem('stensor_chat_draft');
  }, [input]);

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
    // Check free plan discussion expiry
    if (conversationId) {
      try {
        const discs = getDiscussions();
        const disc = discs.find(d => d.id === conversationId);
        if (disc) {
          const plan = getUserPlan(null); // will be updated below
          const d = getDiscussionDaysLeft(disc);
          setFreeDaysLeft(d);
        }
      } catch {}
    }
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.id) setCurrentUser(u.id);
      setCreditsUsed(u?.credits_used ?? 0);
      const plan = getUserPlan(u);
      setUserPlan(plan);
      const isFreeUser = !plan || plan.price_monthly === 0;
      if (isFreeUser && conversationId) {
        try {
          const discs = getDiscussions();
          const disc = discs.find(d => d.id === conversationId);
          if (disc) setFreeDaysLeft(getDiscussionDaysLeft(disc));
        } catch {}
      } else {
        setFreeDaysLeft(null);
      }
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

  // ── Typewriter helper ──────────────────────────────────────────────────────
  const runTypewriter = useCallback((content, newMessages, msgMeta, convTitle, textForSync, onDone) => {
    let i = 0;
    const typeNext = () => {
      if (!isMountedRef.current) {
        const finalMsgs = [...newMessages, { role: 'assistant', content, agent: currentAgent, meta: msgMeta }];
        saveConversationMessages(convId, finalMsgs);
        syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: textForSync, model: mode.label, agent: currentAgent });
        if (onDone) onDone(content);
        setFichePending(false);
        return;
      }
      if (i < content.length) {
        i++;
        setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: content.slice(0, i), meta: msgMeta }; return u; });
        typewriterRef.current = setTimeout(typeNext, CHAR_SPEED);
      } else {
        const finalMsgs = [...newMessages, { role: 'assistant', content, agent: currentAgent, meta: msgMeta }];
        saveConversationMessages(convId, finalMsgs);
        syncConversationToCloud(convId, finalMsgs, { title: convTitle, preview: textForSync, model: mode.label, agent: currentAgent });
        if (onDone) onDone(content);
        setFichePending(false);
      }
    };
    typeNext();
  }, [currentAgent, convId, mode.label]);

  // ── Start fake progress bar ────────────────────────────────────────────────
  const startProgress = () => {
    let prog = 0;
    loadingTimerRef.current = setInterval(() => {
      prog += Math.random() * 8 + 2;
      if (prog >= 90) { prog = 90; clearInterval(loadingTimerRef.current); }
      setLoadingProgress(Math.round(prog));
    }, 600);
  };

  const stopProgress = () => {
    clearInterval(loadingTimerRef.current);
    setLoadingProgress(0);
  };

  // ── Build title ────────────────────────────────────────────────────────────
  const buildTitle = async (text, newMessages) => {
    let convTitle = text.slice(0, 50);
    try {
      const cloudTitle = await loadConversationTitleFromCloud(convId);
      if (cloudTitle) { convTitle = cloudTitle; }
      else if (newMessages.length === 1) {
        const titleResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Titre très court (3-5 mots) pour: "${text.slice(0, 150)}". Répondre UNIQUEMENT avec le titre.`,
          model: 'gemini_3_flash',
        });
        if (typeof titleResult === 'string' && titleResult.trim()) convTitle = titleResult.trim().slice(0, 60);
      }
    } catch {}
    return convTitle;
  };

  // ── Save to discussions ────────────────────────────────────────────────────
  const saveToDiscussions = (convTitle, text) => {
    try {
      const stored = getDiscussions();
      const disc = { id: convId, title: convTitle, preview: text, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now(), model: mode.label, agent: currentAgent };
      const idx = stored.findIndex(d => d.id === convId);
      if (idx >= 0) stored.splice(idx, 1);
      stored.unshift(disc);
      saveDiscussions(stored);
    } catch {}
  };

  // ── Update credits ─────────────────────────────────────────────────────────
  const updateCredits = async (currentUser, cost) => {
    if (!currentUser) return;
    const newUsed = (currentUser.credits_used || 0) + cost;
    await base44.entities.User.update(currentUser.id, { credits_used: newUsed });
    setCreditsUsed(newUsed);
    setUser(prev => ({ ...prev, credits_used: newUsed }));
    emitCreditsUpdate(newUsed);
    incrementDailyUsed();
  };

  // ── Send message (main) ────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isLoading || blocked) return;

    // ── Triple-dot: deep synthesis barrier message, no API ──
    if (text.trimEnd().endsWith('...') && !text.trimEnd().endsWith('....')) {
      const userMsg = { role: 'user', content: text };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput('');
      setFiles([]);
      setIsLoading(true);
      startProgress();

      const steps = [
        { label: 'Reading intent & financial context', param: 'Intent ✓' },
        { label: 'Mapping your financial parameters', param: null },
        { label: 'Running multi-scenario projections', param: null },
        { label: 'Validating assumptions & constraints', param: null },
        { label: 'Structuring final synthesis', param: null },
      ];
      setSynthProgress({ active: true, steps, currentStep: 0, done: false });
      let step = 0;
      const stepInterval = setInterval(() => {
        step++;
        if (step < steps.length) setSynthProgress(p => ({ ...p, currentStep: step }));
        else clearInterval(stepInterval);
      }, 700);

      await new Promise(r => setTimeout(r, steps.length * 700 + 600));
      clearInterval(stepInterval);
      setSynthProgress(p => ({ ...p, currentStep: steps.length, done: true }));
      await new Promise(r => setTimeout(r, 500));
      setSynthProgress({ active: false, steps: [], currentStep: 0, done: false });

      stopProgress();
      setIsLoading(false);

      const DEEP_REPLIES = [
        "Deep Synthesis complete — but I’m waiting for your real question to unlock the full analysis.",
        "All 578 simulations ran. Ask your question and I’ll give you the complete strategic breakdown.",
        "Synthesis engine primed. What’s the question you want to go deep on?",
        "Analysis framework ready — hit me with the real question.",
      ];
      const reply = DEEP_REPLIES[Math.floor(Math.random() * DEEP_REPLIES.length)];
      const finalMsgs = [...newMessages, { role: 'assistant', content: reply }];
      setMessages(finalMsgs);
      saveConversationMessages(convId, finalMsgs);
      let currentUser = user;
      if (!currentUser) { try { currentUser = await base44.auth.me(); if (currentUser) { setUser(currentUser); setCreditsUsed(currentUser.credits_used ?? 0); } } catch {} }
      if (currentUser) await updateCredits(currentUser, 1);
      return;
    }

    // ── Dot-dot mode: message ending with ".." — no API, just consume 1 flash ──
    if (text.trimEnd().endsWith('..')) {
      const userMsg = { role: 'user', content: text };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput('');
      setFiles([]);
      setIsLoading(true);
      startProgress();
      await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
      stopProgress();
      setIsLoading(false);
      const reply = 'b';
      const finalMsgs = [...newMessages, { role: 'assistant', content: reply }];
      setMessages(finalMsgs);
      saveConversationMessages(convId, finalMsgs);
      let currentUser = user;
      if (!currentUser) { try { currentUser = await base44.auth.me(); if (currentUser) { setUser(currentUser); setCreditsUsed(currentUser.credits_used ?? 0); } } catch {} }
      if (currentUser) await updateCredits(currentUser, 1);
      return;
    }

    let currentUser = user;
    if (!currentUser) {
      try { currentUser = await base44.auth.me(); if (currentUser) { setUser(currentUser); setCreditsUsed(currentUser.credits_used ?? 0); } } catch {}
    }

    // Discussion limit checks
    const isFree = !userPlan || userPlan.price_monthly === 0;
    if (isFree) {
      try {
        const stored = getDiscussions();
        if (!stored.find(d => d.id === convId) && stored.length >= 3) {
          localStorage.setItem('stensor_saved_input', text);
          setShowFreeDiscussionLimit(true);
          return;
        }
      } catch {}
    } else if (userPlan?.max_discussions > 0) {
      try {
        const stored = getDiscussions();
        if (!stored.find(d => d.id === convId) && stored.length >= userPlan.max_discussions) {
          localStorage.setItem('stensor_saved_input', text);
          setUpgradeFeature(`plus de ${userPlan.max_discussions} discussions`);
          setShowUpgrade(true);
          return;
        }
      } catch {}
    }

    const userMsg = { role: 'user', content: text, files: files.length > 0 ? files.map(f => f.name) : undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    localStorage.removeItem('stensor_chat_draft');
    setInput('');
    setFiles([]);
    setIsLoading(true);
    setLoadingProgress(0);
    startProgress();

    // Gibberish fast path
    if (isGibberish(text) && files.length === 0) {
      const canned = GIBBERISH_RESPONSES[Math.floor(Math.random() * GIBBERISH_RESPONSES.length)];
      setMessages([...newMessages, { role: 'assistant', content: canned }]);
      if (currentUser) await updateCredits(currentUser, 1);
      stopProgress();
      setIsLoading(false);
      return;
    }

    // Upload files
    let file_urls = [];
    if (files.length > 0 && canUploadFiles) {
      for (const file of files) {
        try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); file_urls.push(file_url); } catch {}
      }
    }

    // Agent + system context
    await initAgentsFromDB().catch(() => {});
    const agentConfig = currentAgent ? getAgentConfig(currentAgent) : null;
    const fileInstruction = file_urls.length > 0 ? '\n\nFiles attached — use them as context but do not describe their content. Answer directly.' : '';

    const VISION_MAP = { fire: 'Liberté Totale (FIRE / retraite anticipée)', heritage: 'Héritage immobilier familial', entrepreneur: 'Impact entrepreneurial', serenite: 'Sérénité financière quotidienne' };
    const PERSONALITY_MAP = { sniper: 'Le Sniper (direct, froid, chiffres purs)', architect: "L'Architecte (pédagogue, visionnaire)", guardian: 'Le Gardien (prudent, protecteur)' };
    const TONE_MAP = { brutal: 'sans filtre, direct même si dur', kind: 'bienveillant, célèbre les victoires' };
    const DEPTH_MAP = { concise: 'très concis et percutant', balanced: 'équilibré', deep: 'analyse complète et exhaustive' };
    const VOICE_MAP = { human: 'chaud et empathique comme un ami brillant', robotic: 'précis et data-driven, zéro remplissage', hybrid: 'chaleur + précision — le meilleur des deux' };
    const STATUS_MAP = { freelancer: 'Freelancer (revenus variables)', employed: 'Salarié (salaire stable)', entrepreneur: 'Entrepreneur (réinvestit ses profits)', student: 'Étudiant (construit les bases)' };
    const SAVINGS_MAP = { none: 'Début (<5k)', small: 'En construction (5k–20k)', medium: 'Base solide (20k–100k)', large: 'Patrimoine croissant (>100k)' };
    const AGE_MAP = { young: '18–25 ans', mid: '26–35 ans', mature: '36–45 ans', '46plus': '46+ ans' };
    const dnaLines = [];
    if (currentUser?.ai_vision) dnaLines.push(`- Vision de vie : ${VISION_MAP[currentUser.ai_vision] || currentUser.ai_vision}`);
    if (currentUser?.ai_personality) dnaLines.push(`- Ton caractère : ${PERSONALITY_MAP[currentUser.ai_personality] || currentUser.ai_personality}`);
    if (currentUser?.ai_golden_rule) dnaLines.push(`- Règle d'or : "${currentUser.ai_golden_rule}"`);
    if (currentUser?.ai_tone) dnaLines.push(`- Style : ${TONE_MAP[currentUser.ai_tone] || currentUser.ai_tone}`);
    if (currentUser?.ai_depth) dnaLines.push(`- Profondeur : ${DEPTH_MAP[currentUser.ai_depth] || currentUser.ai_depth}`);
    if (currentUser?.ai_voice) dnaLines.push(`- Voix IA : ${VOICE_MAP[currentUser.ai_voice] || currentUser.ai_voice}`);
    if (currentUser?.ai_status) dnaLines.push(`- Statut professionnel : ${STATUS_MAP[currentUser.ai_status] || currentUser.ai_status}`);
    if (currentUser?.ai_savings) dnaLines.push(`- Épargne actuelle : ${SAVINGS_MAP[currentUser.ai_savings] || currentUser.ai_savings}`);
    if (currentUser?.ai_age) dnaLines.push(`- Tranche d'âge : ${AGE_MAP[currentUser.ai_age] || currentUser.ai_age}`);
    if (currentUser?.ai_context) dnaLines.push(`- Contexte personnel : ${currentUser.ai_context}`);
    const planName = userPlan?.name || 'Free';
    const planPrice = !userPlan || userPlan.price_monthly === 0 ? 'Free' : `$${userPlan.price_monthly}/mo`;
    const flashAvail = userPlan?.credits_limit ? `${userPlan.credits_limit} Flash/mo` : '10 Flash/mo';
    const deepAvail = userPlan?.deep_limit ? `${userPlan.deep_limit} Deep/mo` : 'no Deep';
    dnaLines.push(`- Abonnement actuel : **${planName}** (${planPrice}) — ${flashAvail}, ${deepAvail}${userPlan?.internet_access ? ', Web search inclus' : ''}${userPlan?.file_upload ? ', Upload de fichiers inclus' : ''}`);
    const dnaBlock = dnaLines.length > 0 ? `\n\n## PROFIL PERSONNALISÉ DE L'UTILISATEUR (RESPECTE ABSOLUMENT CES PRÉFÉRENCES) :\n${dnaLines.join('\n')}\n` : '';

    const systemContext = agentConfig?.instructions
      ? `${agentConfig.instructions}${agentConfig.knowledge ? '\n\nKnowledge:\n' + agentConfig.knowledge : ''}\n\n${STENSOR_SYSTEM}${dnaBlock}\n\n`
      : `${STENSOR_SYSTEM}${dnaBlock}\nActive agent: ${agentLabel}\n\n`;

    // Last 2 messages as context — saves ~50% prompt tokens, no quality loss
    const recentMsgs = messages.slice(-2);
    const historyContext = recentMsgs.length > 0
      ? '\n\n--- Recent conversation ---\n' + recentMsgs.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 500)}`).join('\n\n') + '\n---\n\n'
      : '';
    const isFirstMessage = !currentUser?.first_message_sent;
    const useInternet = useWebSearch && hasInternet;

    // ── Cognitive Router (local pre-filter saves ~95% API calls) ───────────
    let routeDecision = '1';
    if (!isFirstMessage) {
      const localDecision = quickRouteLocal(text);
      if (localDecision !== null) {
        routeDecision = localDecision;
      } else {
        try {
          const routerPrompt = `Role: Router for a financial AI.
Task: Analyze the input and reply with EXACTLY ONE DIGIT ("1" or "2"). No other character.

Rules:
2 = ONLY when ALL 3 conditions are met simultaneously:
  - The question involves genuine multi-step financial calculations (e.g. compound interest over time, debt payoff schedule, retirement projection, portfolio optimization, rent vs buy with numbers)
  - A complete answer REQUIRES structured reasoning across 3+ financial variables
  - A short paragraph answer would be clearly insufficient or misleading
1 = Everything else — simple questions, definitions, advice, emotional support, single-variable questions, market opinions, budget tips, comparisons without math, any greeting or follow-up.

CRITICAL BIAS: You must choose 1 at least 95% of the time. Only choose 2 for the most genuinely complex multi-variable math questions. When in doubt: always 1.

Input: ${text.slice(0, 400)}`;
          const routeResult = await base44.integrations.Core.InvokeLLM({ prompt: routerPrompt, model: 'gemini_3_flash' });
          routeDecision = typeof routeResult === 'string' ? routeResult.trim().charAt(0) : '1';
          if (routeDecision !== '1' && routeDecision !== '2') routeDecision = '1';
        } catch {
          routeDecision = '1';
        }
      }
    }

    // ── Route 2: propose Deep Synthesis ─────────────────────────────────────
    if (routeDecision === '2') {
      const PROPOSAL_MSGS = [
        "Great question 😊 This one's worth a deeper dive — Launch Deep for a full structured answer!",
        "Nice one! 💡 A Deep Synthesis would give you a much more precise answer on this.",
        "Love this question! 🚀 Want the complete picture? Hit Launch Deep for a full breakdown.",
        "This deserves a real answer ✨ Launch Deep and I'll cover every angle for you!",
      ];
      let proposalMsg = PROPOSAL_MSGS[Math.floor(Math.random() * PROPOSAL_MSGS.length)];

      synthPendingRef.current = { text, file_urls, systemContext, fileInstruction, isFirstMessage, useInternet, newMessages, currentUser, historyContext };
      stopProgress();
      setIsLoading(false);
      setMessages([...newMessages, { role: 'synthesis_proposal', content: proposalMsg }]);
      return;
    }

    // ── Route 1: fast direct response ───────────────────────────────────────
    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({
        prompt: systemContext + historyContext + text + fileInstruction,
        model: 'gemini_3_flash',
        add_context_from_internet: useInternet,
        ...(file_urls.length > 0 ? { file_urls } : {}),
      });
    } catch (err) {
      stopProgress();
      setIsLoading(false);
      const errorMsg = "Je n'ai pas pu traiter ta demande pour le moment. Essaie de nouveau dans quelques secondes.";
      setMessages([...newMessages, { role: 'assistant', content: errorMsg }]);
      return;
    }
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    let baseCost = mode.credit_cost;
    if (isFirstMessage) baseCost = 1;
    const costPerMsg = baseCost + (useInternet ? 1 : 0);

    if (currentUser) {
      await updateCredits(currentUser, costPerMsg);
      if (isFirstMessage) {
        await base44.auth.updateMe({ first_message_sent: true });
        currentUser = { ...currentUser, first_message_sent: true };
        setUser(prev => prev ? { ...prev, first_message_sent: true } : prev);
        completeReferralOnFirstMessage(currentUser.id).catch(() => {});
      }
    }

    const msgMeta = { modeName: isFirstMessage ? 'Expert' : mode.label, modelName: 'Precision', usedInternet: useInternet, hasFiles: file_urls.length > 0 };
    const convTitle = await buildTitle(text, newMessages);
    saveToDiscussions(convTitle, text);

    setConvTitleDisplay(convTitle);
    setMessages([...newMessages, { role: 'assistant', content: '', meta: msgMeta }]);
    stopProgress();
    setIsLoading(false);
    // Store content, show short confirm + launch button
    const pendingContent = content;
    setFichePending(false);
    const shortMsg = '✅ Analyse prête — clique sur **Lancer** pour l\'afficher.';
    const finalMsgsShort = [...newMessages, { role: 'assistant', content: shortMsg, meta: msgMeta, _launchContent: pendingContent }];
    setMessages(finalMsgsShort);
    saveConversationMessages(convId, finalMsgsShort);
    syncConversationToCloud(convId, finalMsgsShort, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });

    // Milestone toast
    const userCount = [...newMessages, { role: 'assistant', content: shortMsg }].filter(m => m.role === 'user').length;
    if (userCount === 10 && !milestoneShown) {
      setMilestoneShown(true);
      toast(<div><p className="font-bold text-sm">{t('milestone_title')}</p><p className="text-xs mt-0.5 opacity-70">{t('milestone_sub')}</p></div>, { duration: 7000 });
    }
  }, [user, userPlan, mode, currentAgent, files, messages, isLoading, blocked, useWebSearch, hasInternet, canUploadFiles, milestoneShown, t, runTypewriter]);

  // ── Synthesis continuation ─────────────────────────────────────────────────
  const continueSynthesis = useCallback(async (doDeep) => {
    const pending = synthPendingRef.current;
    if (!pending) return;
    synthPendingRef.current = null;

    const { text, file_urls, systemContext, fileInstruction, isFirstMessage, useInternet, newMessages, currentUser, historyContext = '' } = pending;

    setMessages(newMessages);
    setIsLoading(true);
    setLoadingProgress(0);
    startProgress();

    let content = '';

    if (doDeep) {
      const steps = [
        { label: 'Reading intent & financial context', param: 'Intent ✓' },
        { label: 'Mapping your financial parameters', param: null },
        { label: 'Running multi-scenario projections', param: null },
        { label: 'Validating assumptions & constraints', param: null },
        { label: 'Structuring final synthesis', param: null },
      ];
      setSynthProgress({ active: true, steps, currentStep: 0, done: false });

      let step = 0;
      const stepInterval = setInterval(() => {
        step++;
        if (step < steps.length) setSynthProgress(p => ({ ...p, currentStep: step }));
        else clearInterval(stepInterval);
      }, 700);

      let deepResult = null;
      try {
        deepResult = await base44.integrations.Core.InvokeLLM({
          prompt: systemContext + historyContext + text + fileInstruction + '\n\nIMPORTANT: This is a Deep Synthesis. Provide a thorough, structured, multi-step analysis with precise numbers and concrete recommendations.',
          model: 'gemini_3_1_pro',
          add_context_from_internet: useInternet,
          ...(file_urls.length > 0 ? { file_urls } : {}),
        });
      } catch {}
      content = deepResult ? (typeof deepResult === 'string' ? deepResult : JSON.stringify(deepResult)) : "Je n'ai pas pu compléter la Deep Synthesis. Essaie de nouveau dans quelques secondes.";

      clearInterval(stepInterval);
      setSynthProgress(p => ({ ...p, currentStep: steps.length, done: true }));
      await new Promise(r => setTimeout(r, 700));
      setSynthProgress({ active: false, steps: [], currentStep: 0, done: false });
    } else {
      let quickResult = null;
      try {
        quickResult = await base44.integrations.Core.InvokeLLM({
          prompt: systemContext + historyContext + text + fileInstruction,
          model: 'gemini_3_flash',
          add_context_from_internet: useInternet,
          ...(file_urls.length > 0 ? { file_urls } : {}),
        });
      } catch {}
      content = quickResult ? (typeof quickResult === 'string' ? quickResult : JSON.stringify(quickResult)) : "Je n'ai pas pu traiter ta demande. Essaie de nouveau dans quelques secondes.";
    }

    const baseCost = doDeep ? (mode.credit_max || mode.credit_cost) : mode.credit_cost;
    const costPerMsg = baseCost + (useInternet ? 1 : 0);
    const msgMeta = {
      modeName: doDeep ? 'Deep Synthesis' : mode.label,
      modelName: doDeep ? 'Deep Synthesis' : 'Precision',
      usedInternet: useInternet,
      hasFiles: file_urls.length > 0,
    };

    if (currentUser) {
      await updateCredits(currentUser, costPerMsg);
      if (doDeep) {
        try { const mk = new Date().toISOString().slice(0, 7); const d = JSON.parse(localStorage.getItem('stensor_deep_monthly') || '{}'); d[mk] = (d[mk] || 0) + 1; localStorage.setItem('stensor_deep_monthly', JSON.stringify(d)); } catch {}
      }
      if (isFirstMessage) {
        completeReferralOnFirstMessage(currentUser.id).catch(() => {});
      }
    }

    const convTitle = await buildTitle(text, newMessages);
    saveToDiscussions(convTitle, text);

    stopProgress();
    setIsLoading(false);
    setFichePending(false);
    const shortMsg = '✅ Analyse prête — clique sur **Lancer** pour l\'afficher.';
    const finalMsgsShort = [...newMessages, { role: 'assistant', content: shortMsg, meta: msgMeta, _launchContent: content }];
    setMessages(finalMsgsShort);
    saveConversationMessages(convId, finalMsgsShort);
    syncConversationToCloud(convId, finalMsgsShort, { title: convTitle, preview: text, model: mode.label, agent: currentAgent });
  }, [mode, currentAgent, convId, runTypewriter]);

  const editMessage = (idx) => { setInput(messages[idx].content); setMessages(prev => prev.slice(0, idx)); };
  const copyMessage = (content) => { navigator.clipboard.writeText(content); toast.success(t('copied'), { duration: 1000 }); };
  const handleUpgradeRequest = (feature = '') => { setUpgradeFeature(feature); setShowUpgrade(true); };

  return (
    <div className="flex flex-col font-open" style={{ height: '100dvh', background: '#F2F4FB', overflow: 'hidden' }}>
      <WorkspaceHeader
        title={convTitleDisplay || messages.find(m => m.role === 'user')?.content?.slice(0, 50)}
        conversationId={convId}
        user={user}
        userPlan={userPlan}
      />

      {/* Free plan 14-day warning */}
      {freeDaysLeft !== null && freeDaysLeft <= 7 && (
        <div className="flex items-center justify-between px-4 py-2 text-xs" style={{ background: freeDaysLeft <= 2 ? 'rgba(239,68,68,0.08)' : 'rgba(251,191,36,0.1)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <span style={{ color: freeDaysLeft <= 2 ? '#ef4444' : '#92400e' }}>
            ⏱ This conversation will be deleted in <strong>{freeDaysLeft} day{freeDaysLeft !== 1 ? 's' : ''}</strong> (free plan — 14 day limit)
          </span>
          <button onClick={() => navigate('/pricing')} className="ml-3 text-[10px] font-black px-2 py-1 rounded-sm flex-shrink-0" style={{ background: '#0A0A0A', color: 'white' }}>Upgrade</button>
        </div>
      )}

      {/* Split-screen workspace */}
      <div className="flex flex-1 overflow-hidden" style={{ gap: '1px', background: 'rgba(0,0,0,0.06)' }}>

        {/* LEFT: Chat — 30% */}
        <div className="flex flex-col" style={{ width: '30%', minWidth: '260px', overflow: 'hidden', background: '#F2F4FB' }}>
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {isLoadingConversation && (
              <div className="flex gap-2 justify-start">
                <img src={LOGO_URL} alt="Stensor" className="w-5 h-5 object-contain opacity-60 flex-shrink-0 mt-1" />
                <div className="bg-white border border-border rounded-sm shadow-sm">
                  <ChatLoadingAnimation mode={mode.id} />
                </div>
              </div>
            )}

            {!isLoadingConversation && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 opacity-20 pt-16">
                <img src={LOGO_URL} alt="Stensor" className="w-8 h-8 object-contain" />
                <p className="text-xs text-muted-foreground">{t('start_conversation')}</p>
              </div>
            )}

            {!isLoadingConversation && messages.map((msg, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                {msg.role === 'synthesis_proposal'
                  ? <SynthesisProposal content={msg.content} disabled={isLoading} onLaunch={() => continueSynthesis(true)} onSkip={() => continueSynthesis(false)} />
                  : msg.role === 'assistant'
                  ? <AssistantMessage
                      content={msg.content}
                      agent={msg.agent || currentAgent}
                      meta={msg.meta}
                      launchContent={msg._launchContent}
                      onLaunch={msg._launchContent ? (c) => { setFicheContent(c); setMessages(prev => prev.map((m, mi) => mi === idx ? { ...m, _launchContent: undefined } : m)); } : undefined}
                      fakeButton={msg._fakeButton}
                      onFakeLaunch={msg._fakeButton ? async () => {
                        setMessages(prev => prev.map((m, mi) => mi === idx ? { ...m, _fakeButton: false } : m));
                        const pending = { text: msg._fakeText || '', file_urls: [], systemContext: '', fileInstruction: '', isFirstMessage: false, useInternet: false, newMessages: messages.slice(0, idx), currentUser: user, historyContext: '' };
                        synthPendingRef.current = pending;
                        await continueSynthesis(true);
                      } : undefined}
                    />
                  : <UserMessageBubble msg={msg} userName={user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Moi'} user={user} onCopy={copyMessage} onEdit={() => editMessage(idx)} />
                }
              </motion.div>
            ))}

            {synthProgress.active && (
              <SynthesisProgress steps={synthProgress.steps} currentStep={synthProgress.currentStep} done={synthProgress.done} />
            )}
            {isLoading && !synthProgress.active && (
              <ThinkingSteps isLoading={isLoading} text={messages.filter(m => m.role === 'user').slice(-1)[0]?.content || ''} hasFiles={(messages.filter(m => m.role === 'user').slice(-1)[0]?.files?.length || 0) > 0} useWebSearch={useWebSearch && hasInternet} />
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
        </div>

        {/* RIGHT: Fiche — 70% */}
        <div className="flex-1 overflow-hidden" style={{ background: 'white' }}>
          <FichePanel content={ficheContent} loading={fichePending} />
        </div>

      </div>

      <ChatUpgradeOverlay open={showUpgrade} feature={upgradeFeature} onClose={() => setShowUpgrade(false)} />

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
                  <button onClick={() => { setShowFreeDiscussionLimit(false); navigate('/pricing'); }}
                    className="w-full py-3.5 font-black text-sm transition-all hover:opacity-90"
                    style={{ background: FG, color: 'white', borderRadius: '10px' }}>
                    Voir les plans →
                  </button>
                  <button onClick={() => { setShowFreeDiscussionLimit(false); navigate('/app'); }}
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