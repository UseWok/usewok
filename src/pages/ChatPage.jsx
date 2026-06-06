// ChatPage.jsx — lean orchestrator, ~350 lines
// All sub-components are in components/chat/ — all prompts in lib/chat-prompts.js
// All storage helpers in lib/chat-storage.js

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44, cachedAIRequest } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
// motion already imported above

// ── Components ──
import AssistantMessage from '@/components/chat/AssistantMessage';
import ErrorNotification from '@/components/chat/ErrorNotification';
import ChatInputBar from '@/components/chat/ChatInputBar';
import EditModeOverlay from '@/components/chat/EditModeOverlay';
import FichePanel from '@/components/chat/FichePanel';
import ChatWorkspaceSidebar from '@/components/chat/ChatWorkspaceSidebar';
import PreviewLoadingFeature from '@/components/chat/PreviewLoadingFeature';
// ZoomToggle removed
import MessageList from '@/components/chat/MessageList';
// SuggestionsBar removed
import UserMessageBubble from '@/components/chat/UserMessageBubble';
import PublishAppModal from '@/components/chat/PublishAppModal';
import WokHeaderMenu from '@/components/chat/WokHeaderMenu';
import ChatHeader from '@/components/chat/ChatHeader';
import IframeModal from '@/components/chat/IframeModal';
import ProModal from '@/components/chat/ProModal';
import FullscreenIframeModal from '@/components/chat/FullscreenIframeModal';
import PreviewSkeleton from '@/components/chat/PreviewSkeleton';
import HistoryPanel from '@/components/chat/HistoryPanel';
import AnalyticsPanel from '@/components/chat/AnalyticsPanel';
import LogsPanel from '@/components/chat/LogsPanel';
import { appendLog } from '@/components/chat/LogsPanel';


// ── Lib ──
import { safeAsync, checkRateLimit, sanitizeInput } from '@/lib/code-quality';
import { classifyError } from '@/lib/error-handler';
import { initAgentsFromDB } from '@/lib/agents-config';
import { setCurrentUser, loadConversationFromCloud } from '@/lib/discussions';
import { getUserPlan } from '@/lib/plans-config';
import {
  getLocalDiscussions, saveLocalDiscussions,
  getConversationMessages, saveConversationMessages,
  syncToCloud, loadFromCloud, loadDiscussionsFromCloud,
} from '@/lib/chat-storage';
import {
  PROMPT_ARCHITECT, PROMPT_DATA_INSIGHT, PROMPT_AUTO_FIX, PROMPT_THINKING,
  CHOCOLATINE_CODE, MODIFY_KEYWORDS, DATA_QUERY_KEYWORDS
} from '@/lib/chat-prompts';

// Placeholder stubs (replace with real implementations when available)
const COMPONENT_PACKET = {};
const PROACTIVE_INTELLIGENCE_LAYER = {};
const buildPreferenceHints = () => "";

const CARD_RADIUS = 16;

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialQ = urlParams.get('q') || '';
  const conversationId = urlParams.get('conversationId') || null;
  const convIdRef = useRef(conversationId || `conv_${Date.now()}`);
  const convId = convIdRef.current;

  // ── Auth & user ──
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);

  // ── Workspace ──
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('wok_workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'My Workspace', current: true }];
  });
  const currentWorkspace = workspaces.find((w) => w.current) || workspaces[0];
  const [discussions, setDiscussions] = useState(() => getLocalDiscussions(currentWorkspace.id) || []);

  // ── UI state ──
  const [viewMode, setViewMode] = useState('preview');
  const containerRef = useRef(null);
  const [customSlug] = useState(convId || `conv_${Date.now().toString().slice(-6)}`);
  const [appSettings, setAppSettings] = useState({
    title: 'AI-Powered Interface',
    description: 'A highly optimized interactive experience built with Wok.',
    isPublic: true,
    showBadge: true
  });

  // ── Modal state ──
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState('chat');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [fullscreenModal, setFullscreenModal] = useState(null);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isAppPublished, setIsAppPublished] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [iframeRefreshKey, setIframeRefreshKey] = useState(0);
  const [iframeModal, setIframeModal] = useState({ open: false, url: '' });
  const [showHistory, setShowHistory] = useState(false);

  // ── Chat state ──
  const [messages, setMessages] = useState(() => {
    const initial = conversationId ? getConversationMessages(conversationId) : [];
    return Array.isArray(initial) ? initial : [];
  });
  const [isLoadingConversation, setIsLoadingConversation] = useState(
    () => !!conversationId && (getConversationMessages(conversationId)?.length || 0) === 0
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Chat bar background
  const CHAT_BG = '#FAF9F5';
  const [currentQuery, setCurrentQuery] = useState('');
  const [files, setFiles] = useState([]);
  // Restore last generated content on mount (F5 persistence)
  const [ficheContent, setFicheContent] = useState(() => {
    try {
      const key = `fiche_${conversationId || convIdRef.current}`;
      return localStorage.getItem(key) || null;
    } catch { return null; }
  });
  const [discussMode, setDiscussMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [runtimeError, setRuntimeError] = useState(null);
  const [pendingError, setPendingError] = useState(null);

  const profileMenuRef = useRef(null);
  const abortedRef = useRef(false);

  // ── Credits helper ──
  const handleUpdateCredits = async (cost) => {
    if (!user) return;
    const newUsed = (user.credits_used || 0) + cost;
    await base44.entities.User.update(user.id, { credits_used: newUsed });
    setUser((prev) => ({ ...prev, credits_used: newUsed }));
  };

  // ── Persist discussion to local cache + cloud ──
  const saveToDiscussionsLogic = (convTitle, text, rawContent = null) => {
    try {
      const stored = getLocalDiscussions(currentWorkspace.id);
      const disc = { id: convId, title: convTitle, preview: text, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now(), emoji: '💬' };
      const idx = stored.findIndex((d) => d.id === convId);
      if (idx >= 0) stored.splice(idx, 1);
      stored.unshift(disc);
      saveLocalDiscussions(currentWorkspace.id, stored);
      setDiscussions(stored);
    } catch {}
  };

  // ── Workspace handlers ──
  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim().length < 3) { toast.error("Workspace name must be at least 3 characters."); return; }
    if (workspaces.length >= 4) { toast.error("Maximum limit of 4 workspaces reached."); return; }
    const newWs = { id: `ws_${Date.now()}`, name: newWorkspaceName.trim(), current: true };
    const updated = workspaces.map((w) => ({ ...w, current: false })).concat(newWs);
    setWorkspaces(updated);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    setDiscussions([]);
    setShowWorkspaceModal(false);
    setNewWorkspaceName('');
    navigate('/app');
    toast.success("Workspace created.");
  };

  const deleteDiscussion = (e, id) => {
    e?.stopPropagation?.();
    const updated = discussions.filter((d) => d.id !== id);
    setDiscussions(updated);
    saveLocalDiscussions(currentWorkspace.id, updated);
    if (conversationId === id) navigate('/');
  };

  // ── App meta handlers ──
  const handleUpdateAppMeta = async (newSettings) => {
    setAppSettings(newSettings);
    if (convId) {
      await safeAsync(async () => {
        await base44.entities.Conversation.update(convId, { title: newSettings.title, is_public: newSettings.isPublic });
        const { syncConversationToCloud } = await import('@/lib/discussions');
        await syncConversationToCloud(convId, messages || [], newSettings);
      }, null, 'Update app meta');
    }
    toast.success("Settings updated successfully.");
  };

  const handleCloneApp = async () => {
    const newConvId = `conv_${Date.now()}`;
    saveConversationMessages(newConvId, messages);
    await safeAsync(async () => {
      const { syncConversationToCloud } = await import('@/lib/discussions');
      await syncConversationToCloud(newConvId, messages || [], { title: appSettings.title + ' (Copy)', preview: appSettings.description, is_public: false });
    }, null, 'Clone conversation');
    toast.success("Application cloned. New URL generated.");
    navigate(`/chat?conversationId=${newConvId}`);
  };

  const handleUnpublishApp = async () => {
    const newSettings = { ...appSettings, isPublic: false };
    setAppSettings(newSettings);
    if (convId) {
      await safeAsync(async () => {
        await base44.entities.Conversation.update(convId, { is_public: false });
        const { syncConversationToCloud } = await import('@/lib/discussions');
        await syncConversationToCloud(convId, messages || [], newSettings);
      }, null, 'Unpublish app');
    }
    toast.success("Application unpublished.");
  };

  const handleDeleteApp = async () => {
    deleteDiscussion(null, convId);
    if (convId) {
      await safeAsync(async () => {
        const results = await base44.entities.Conversation.filter({ conv_id: convId });
        if (results.length > 0) await base44.entities.Conversation.delete(results[0].id);
      }, null, 'Delete conversation');
    }
    toast.success("Application deleted permanently.");
  };

  // ── Error fix handler ──
  const handleFixError = () => {
    if (!pendingError) return;
    const savedError = pendingError;
    setPendingError(null);
    const bt = String.fromCharCode(96);
    sendMessage(`The following errors happened in the app:\n\n${bt}${bt}${bt}\n${savedError}\n${bt}${bt}${bt}\n\nPlease help me fix these errors.`, { isCorrection: true, rawError: savedError });
  };

  // ── Core send logic ──
  const sendMessage = useCallback(async (text, options = {}) => {
    if ((!text?.trim() && !options.files?.length) || isLoading) return;

    // ── Security: sanitize & rate-limit ──
    const safeText = sanitizeInput(text, 4000);
    if (!safeText && !options.files?.length) return;

    if (!checkRateLimit('sendMessage', 8, 15000)) {
      toast.error("Slow down — too many requests. Wait a moment before sending.");
      return;
    }

    // Re-assign text to sanitized version
    text = safeText;

    // Easter egg
    if (text.trim() === '16/06/2010') {
      const userMsg = { role: 'user', content: text };
      const newMessages = [...(messages || []), userMsg];
      setMessages(newMessages);
      setCurrentQuery(text);
      setInput('');
      setFiles([]);
      setIsLoading(true);
      abortedRef.current = false;
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 20000);
        const check = setInterval(() => { if (abortedRef.current) { clearTimeout(timer); clearInterval(check); resolve(); } }, 200);
      });
      if (abortedRef.current) return;
      await handleUpdateCredits(1);
      const finalMsgs = [...newMessages, { role: 'assistant', content: "Analyse complete. Debat resolu.", rawContent: CHOCOLATINE_CODE }];
      setMessages(finalMsgs);
      saveConversationMessages(convId, finalMsgs);
      setFicheContent(CHOCOLATINE_CODE);
      if (convId) {
        await syncToCloud(convId, finalMsgs, { title: 'Chocolatine', preview: 'Le debat ultime', is_public: true, rawContent: CHOCOLATINE_CODE });
        if (!conversationId) window.history.replaceState(null, '', `/chat?conversationId=${convId}`);
      }
      setIsLoading(false);
      return;
    }

    const imageUrls = (options.files || files || []).filter((f) => f.type?.startsWith('image/')).map((f) => f.url);
    const userMsg = { role: 'user', content: text, images: imageUrls.length > 0 ? imageUrls : undefined };
    const newMessages = [...(messages || []), userMsg];
    setMessages(newMessages);
    setCurrentQuery(text);
    setInput('');
    setFiles([]);
    setIsLoading(true);
    abortedRef.current = false;

    try {
      // ── Auto-fix path ──
      if (options.isCorrection) {
        const bt = String.fromCharCode(96);
        let codeToFix = ficheContent || "";
        let codeMatch = null;
        const startIdx = codeToFix.indexOf(`${bt}${bt}${bt}`);
        const endIdx = codeToFix.lastIndexOf(`${bt}${bt}${bt}`);
        if (startIdx !== -1 && endIdx !== -1 && startIdx !== endIdx) {
          codeMatch = codeToFix.substring(startIdx, endIdx + 3);
          codeToFix = codeMatch;
        }
        const fixPayload = { prompt: PROMPT_AUTO_FIX + "\n\nError:\n" + options.rawError + "\n\nCode:\n" + codeToFix, model: 'gemini_3_1_pro' };
        const fixResult = await cachedAIRequest(fixPayload, () => base44.integrations.Core.InvokeLLM({ ...fixPayload }));
        if (abortedRef.current) return;
        const fixedCode = typeof fixResult === 'string' ? fixResult : JSON.stringify(fixResult);
        let newContent = ficheContent;
        if (codeMatch) {
          let finalFixed = fixedCode;
          if (!finalFixed.includes(bt)) finalFixed = `${bt}${bt}${bt}jsx\n${finalFixed}\n${bt}${bt}${bt}`;
          newContent = ficheContent.replace(codeMatch, finalFixed);
        } else {
          newContent = fixedCode;
        }
        await handleUpdateCredits(0);
        setIsLoading(false);
        setFicheContent(newContent);
        const finalMsgs = [...newMessages, { role: 'assistant', content: "Architecture successfully recompiled.", rawContent: newContent }];
        setMessages(finalMsgs);
        saveConversationMessages(convId, finalMsgs);
        await syncToCloud(convId, finalMsgs, { title: 'Error fix', preview: 'Code fixed', rawContent: newContent });
        return;
      }

      // ── Pre-analysis gatekeeper (gpt_5_mini) ──
      const preAnalysisPayload = {
        prompt: `You are the creative director of Wok — a next-generation AI interface studio. Users describe what they want to build and you decide if there is enough signal to begin.

User message: "${text}"

Rules:
- Be GENEROUS. Even a vague idea like "a dashboard" or "a landing page" is sufficient — Wok will creatively interpret it.
- Only return sufficient=false if the message is truly empty, nonsensical, or completely unrelated to building any kind of interface, tool, or experience.
- If sufficient=false, your reply must: (1) acknowledge what the user said, (2) give ONE concrete example of what a buildable version would look like, (3) be written in the user's language, max 2 sentences, no emojis.
- If sufficient=true, return an empty reply string.

Reply JSON: { "sufficient": true/false, "reply": "..." }`,
        model: 'gpt_5_mini',
        response_json_schema: { type: 'object', properties: { sufficient: { type: 'boolean' }, reply: { type: 'string' } } }
      };
      const preAnalysis = await cachedAIRequest(preAnalysisPayload, () => base44.integrations.Core.InvokeLLM({ ...preAnalysisPayload }));
      if (!preAnalysis?.sufficient && preAnalysis?.reply) {
        setIsLoading(false);
        const clarifyMsgs = [...newMessages, { role: 'assistant', content: preAnalysis.reply }];
        setMessages(clarifyMsgs);
        saveConversationMessages(convId, clarifyMsgs);
        saveToDiscussionsLogic("New Chat", text);
        await syncToCloud(convId, clarifyMsgs, { title: text.slice(0, 80), preview: text.slice(0, 120) });
        if (!conversationId) window.history.replaceState(null, '', `/chat?conversationId=${convId}`);
        return;
      }

      // ── Build / modify path ──
      const isModification = editMode && ficheContent ? true : ficheContent ? MODIFY_KEYWORDS.test(text) : false;
      const preferenceHints = buildPreferenceHints(messages);
      const contextSuffix = preferenceHints ? `\n\nUSER CONTEXT:\n${preferenceHints}` : '';

      // Conversation history for continuity (last 4 exchanges, no code blobs)
      const historyContext = (messages || []).slice(-8)
        .filter(m => m.role === 'user' || (m.role === 'assistant' && !m.rawContent))
        .map(m => `${m.role === 'user' ? 'User' : 'Wok'}: ${m.content?.slice(0, 200)}`)
        .join('\n');
      const historySuffix = historyContext ? `\n\nCONVERSATION HISTORY (for continuity only):\n${historyContext}` : '';

      const architectPrompt = isModification
        ? PROMPT_ARCHITECT + contextSuffix + historySuffix + '\n\n══ MODIFICATION REQUEST ══\n\nExisting code:\n' + ficheContent + '\n\nUser request: ' + text + '\n\nApply ONLY the requested change. Preserve the full layout, all existing sections, and the visual identity.'
        : PROMPT_ARCHITECT + contextSuffix + historySuffix + '\n\n══ BUILD REQUEST ══\n\nCreate a world-class, production-ready UI for: ' + text + '\n\nThis must be the best UI ever built for this use case. Surprise the user.';

      // ── Thinking layer (gpt_5_mini — o1-mini style) ──
      const thinkingPayload = { prompt: PROMPT_THINKING + '\n\nUser request: ' + text, model: 'gpt_5_mini' };
      const thinkingResult = await cachedAIRequest(thinkingPayload, () => base44.integrations.Core.InvokeLLM({ ...thinkingPayload }));
      const thinkingBlock = typeof thinkingResult === 'string' ? thinkingResult : '';

      // ── Architect builder (gemini_3_1_pro) ──
      const codePayload = { prompt: architectPrompt, model: 'gemini_3_1_pro' };
      const codeResult = await cachedAIRequest(codePayload, () => base44.integrations.Core.InvokeLLM({ ...codePayload, signal: options.signal }));

      // ── Optional data insight ──
      let formattedInsight = null;
      if (DATA_QUERY_KEYWORDS.test(text) && !isModification) {
        const insightPrompt = PROMPT_DATA_INSIGHT + "\n\nUser query: " + text + "\n\nContext: " + ((messages || []).slice(-3).map(m => m.content).join(' '));
        const insightPayload = { prompt: insightPrompt, model: 'gpt_5_mini' };
        const insightResult = await cachedAIRequest(insightPayload, () => base44.integrations.Core.InvokeLLM({ ...insightPayload, signal: options.signal }));
        formattedInsight = typeof insightResult === 'string' ? insightResult : JSON.stringify(insightResult);
      }

      if (abortedRef.current) return;

      const bt = String.fromCharCode(96);
      let fullLLMResponse = typeof codeResult === 'string' ? codeResult : JSON.stringify(codeResult);

      // Strip any thinking block the architect may have emitted (we use our dedicated one)
      let codeOnly = fullLLMResponse.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
      if (!codeOnly.includes(bt)) codeOnly = `${bt}${bt}${bt}jsx\n${codeOnly}\n${bt}${bt}${bt}`;

      // rawContent = clean code for the preview iframe
      const rawContent = codeOnly;

      // chatDisplayContent — strip code blobs, keep only readable text
      const codeBlockRegex = new RegExp(`${bt}{3}(?:jsx|javascript|react)?\\n([\\s\\S]*?)${bt}{3}`, 'gi');
      let chatDisplayContent = codeOnly.replace(codeBlockRegex, '').trim() || "Architecture generated successfully.";
      // Prepend dedicated thinking block (from gpt_5_mini) so AssistantMessage can parse it
      const finalContent = thinkingBlock
        ? thinkingBlock + '\n\n' + (formattedInsight ? chatDisplayContent + '\n\n' + formattedInsight : chatDisplayContent)
        : (formattedInsight ? chatDisplayContent + '\n\n' + formattedInsight : chatDisplayContent);

      const creditsLimit = userPlan?.credits_limit || user?.credits_limit || 10;
      const creditsUsed = user?.credits_used || 0;
      const cost = creditsUsed >= creditsLimit * 2 ? 2 : 1;
      await handleUpdateCredits(cost);

      if (!isModification && !discussMode && user) {
        const newCount = (user.project_count || 0) + 1;
        base44.entities.User.update(user.id, { project_count: newCount }).catch(() => {});
        setUser((prev) => ({ ...prev, project_count: newCount }));
      }

      setIsLoading(false);
      if (!discussMode) setFicheContent(rawContent);

      const finalMsgs = [...newMessages, { role: 'assistant', content: finalContent, rawContent }];
      setMessages(finalMsgs);
      saveConversationMessages(convId, finalMsgs);

      // Always persist URL first so the build is reachable even if user leaves immediately
      if (!conversationId) window.history.replaceState(null, '', `/chat?conversationId=${convId}`);

      // Cloud sync — includes rawContent for cross-device preview restore (always, no publish required)
      syncToCloud(convId, finalMsgs, {
        title: text.slice(0, 80),
        preview: text.slice(0, 120),
        is_public: false, // saved privately regardless of publish state
        rawContent: rawContent || null,
      });
      saveToDiscussionsLogic(text.slice(0, 60) || 'New Chat', text);
      if (window.innerWidth < 768 && !discussMode) setMobileView('preview');

    } catch (err) {
      if (err.name === 'AbortError') return;
      setIsLoading(false);
      const classified = classifyError(err, 'Code generation');
      // Surface contextual error in the notification banner (not chat)
      setRuntimeError(classified.raw || classified.title);
      // Add a concise chat message — no raw stack traces exposed to users
      setMessages([...newMessages, { role: 'assistant', content: classified.hint || classified.title }]);
    }
  }, [messages, isLoading, discussMode, currentWorkspace, user, ficheContent, editMode]);

  const handleStop = useCallback(() => {
    abortedRef.current = true;
    setIsLoading(false);
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), { role: 'assistant', content: 'Generation stopped.' }]);
  }, []);

  // ── Effects ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Telemetry logging ──
  useEffect(() => {
    appendLog('INFO', `APP_START path=${window.location.pathname}`);
    const handleUnload = () => appendLog('INFO', 'APP_CLOSE');
    const handleVisibility = () => appendLog('INFO', `VISIBILITY_CHANGE state=${document.visibilityState}`);
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await safeAsync(() => initAgentsFromDB(), null, 'Init agents');
      const u = await safeAsync(() => base44.auth.me(), null, 'Fetch user');
      if (u) { setUser(u); if (u.id) setCurrentUser(u.id); setUserPlan(getUserPlan(u)); }
    };
    initAuth();
  }, [conversationId]);

  useEffect(() => {
    if (initialQ && (messages?.length || 0) === 0 && !conversationId) sendMessage(initialQ);
  }, []);

  // Load conversation from cloud on mount (cross-device)
  useEffect(() => {
    if (!conversationId) { setMessages([]); setFicheContent(null); return; }
    const loadConv = async () => {
      const cloud = await safeAsync(() => loadFromCloud(conversationId), null, 'Load conversation');
      if (cloud) {
        const safe = Array.isArray(cloud.messages) ? cloud.messages : [];
        if (safe.length > 0) {
          setMessages(safe);
          saveConversationMessages(conversationId, safe);
        }
        if (cloud.rawContent) {
          setFicheContent(cloud.rawContent);
          localStorage.setItem(`fiche_${conversationId}`, cloud.rawContent);
        } else {
          // Fallback: try to restore from last assistant message rawContent
          const last = safe.filter((m) => m.role === 'assistant' && m.rawContent).pop();
          if (last?.rawContent) {
            setFicheContent(last.rawContent);
            localStorage.setItem(`fiche_${conversationId}`, last.rawContent);
          } else {
            const stored = localStorage.getItem(`fiche_${conversationId}`);
            if (stored) setFicheContent(stored);
          }
        }
      }
      setIsLoadingConversation(false);
    };
    loadConv();
  }, [conversationId]);

  // Load discussions list from cloud for sidebar (cross-device)
  useEffect(() => {
    loadDiscussionsFromCloud().then(cloudDiscs => {
      if (cloudDiscs.length > 0) {
        setDiscussions(cloudDiscs);
        saveLocalDiscussions(currentWorkspace.id, cloudDiscs);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (runtimeError && !isLoading) { setPendingError(runtimeError); setRuntimeError(null); }
  }, [runtimeError, isLoading]);

  // Persist ficheContent to localStorage for F5 reload
  useEffect(() => {
    const key = `fiche_${conversationId || convId}`;
    if (ficheContent) localStorage.setItem(key, ficheContent);
  }, [ficheContent, conversationId, convId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); toast.info('Auto-save active'); }
      if (e.key === 'Escape') { setFullscreenModal(null); setShowPublishModal(false); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Render ──
  return (
    <div
      className="flex w-screen h-screen font-sans antialiased overflow-hidden"
      style={{ backgroundColor: '#181818' }}>

      <style>{`html,body{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}`}</style>

      {/* (WokHeaderMenu removed — replaced by ChatHeader inside preview panel) */}

      {/* Workspace modal */}
      <ProModal open={showWorkspaceModal} onClose={() => setShowWorkspaceModal(false)} title="Create a workspace"
        subtitle="Start collaborating with your workspace members" actionText="Create workspace" onAction={handleCreateWorkspace}>
        <label className="text-[12px] font-semibold mb-1.5 block">Workspace name *</label>
        <input type="text" value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)}
          placeholder="Choose a name..." className="w-full border rounded-md px-3 py-2 text-[13px] focus:outline-none mb-4" autoFocus />
      </ProModal>

      {/* Iframe & fullscreen modals */}
      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />
      <FullscreenIframeModal modal={fullscreenModal} onClose={() => setFullscreenModal(null)} />
      <PublishAppModal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        appUrl={`https://wok.base44.app/tools/${customSlug || convId}`}
        isPublished={isAppPublished}
        setIsPublished={setIsAppPublished}
        customSlug={customSlug || convId}
        appSettings={appSettings}
        onUpdateSettings={handleUpdateAppMeta}
      />
      
      {/* Sidebar */}
      <ChatWorkspaceSidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} user={user} convId={conversationId || convId} hidden={!!fullscreenModal} />

      {/* ── Main layout: fills entire screen ── */}
      <div
        ref={containerRef}
        className="flex w-full h-full overflow-hidden"
        style={{ background: '#181818' }}>

        <div className="flex w-full h-full" style={{ gap: 6, padding: '6px 6px 6px 6px' }}>
          {/* ── Left: Chat panel ── */}
          {chatVisible && (
            <div style={{ width: 360, minWidth: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#181818' }}>
              {/* History panel replaces chat when open — stays in chat column, never over preview */}
              {showHistory ? (
                <div style={{ flex: 1, overflow: 'hidden', borderRadius: 10, border: '1px solid #2A2A2A', background: '#1E1E1E', margin: '0 0 0 8px' }}>
                  <HistoryPanel messages={messages} ficheContent={ficheContent} convId={conversationId || convId} setFicheContent={(c) => { setFicheContent(c); setShowHistory(false); }} />
                </div>
              ) : (
                <>
                  <MessageList
                    messages={messages}
                    isLoading={isLoading}
                    currentQuery={currentQuery}
                    setFicheContent={setFicheContent}
                    setViewMode={setViewMode}
                  />
                  <div className="flex-shrink-0">
                    <ErrorNotification error={pendingError} onFix={handleFixError} onDismiss={() => setPendingError(null)} />
                    <ChatInputBar
                      input={input} setInput={setInput}
                      onSend={sendMessage} onStop={handleStop}
                      isLoading={isLoading}
                      files={files} setFiles={setFiles}
                      discussMode={discussMode} setDiscussMode={setDiscussMode}
                      editMode={editMode} setEditMode={setEditMode}
                      onUpgrade={() => {}}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Right: Preview panel ── */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#181818' }}>
            {/* Header bar */}
            <ChatHeader
              user={user}
              chatVisible={chatVisible}
              setChatVisible={setChatVisible}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onPublish={() => setShowPublishModal(true)}
              onRefresh={() => setIframeRefreshKey(k => k + 1)}
              appTitle={appSettings?.title || 'My App'}
              onTitleChange={(t) => handleUpdateAppMeta({ ...appSettings, title: t })}
              mobilePreview={mobilePreview}
              setMobilePreview={setMobilePreview}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
            />

            {/* Preview area — equal top/bottom/right padding so bottom margin matches chat bottom margin */}
            <div style={{
              position: 'absolute', top: 44, left: 4, right: 0, bottom: 0,
              display: 'flex', alignItems: 'stretch', justifyContent: 'center',
            }}>

            {/* Analytics panel */}
            {viewMode === 'analytics' && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 99, background: '#FAF9F5', borderRadius: 8, overflow: 'hidden', border: '1px solid #D9D5CC' }}>
                <AnalyticsPanel />
              </div>
            )}

            {/* Logs panel */}
            {viewMode === 'logs' && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 99, background: '#FAF9F5', borderRadius: 8, overflow: 'hidden', border: '1px solid #D9D5CC' }}>
                <LogsPanel />
              </div>
            )}

            {/* Preview container — mobile mode centers the phone, desktop fills full width */}
            <motion.div
              animate={mobilePreview
                ? { width: 390, borderRadius: 20 }
                : { width: '100%', borderRadius: 10 }
              }
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              style={{
                overflow: 'hidden', background: '#FFFFFF', flexShrink: 0,
                alignSelf: mobilePreview ? 'center' : 'stretch',
                boxShadow: 'none',
                border: '1px solid #2A2A2A',
                height: mobilePreview ? 'calc(100% - 0px)' : '100%',
              }}
            >

              

              {ficheContent ? (
                <FichePanel
                  content={ficheContent}
                  iframeRefreshKey={iframeRefreshKey}
                  onError={setRuntimeError}
                  onSuccess={() => setRuntimeError(null)}
                  isPublic={false}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  appSettings={appSettings}
                  onUpdateSettings={handleUpdateAppMeta}
                  onClone={handleCloneApp}
                  onDelete={handleDeleteApp}
                  onUnpublish={handleUnpublishApp}
                  customSlug={customSlug}
                  onUpdateContent={setFicheContent}
                />
              ) : isLoading && messages.length === 0 ? (
                <PreviewLoadingFeature />
              ) : isLoading ? (
                <PreviewSkeleton />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: 13, color: '#CCCCCC', fontFamily: 'Inter, sans-serif' }}>Preview</p>
                </div>
              )}
            </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="fixed inset-0 flex md:hidden flex-col bg-white">
        <div className="flex px-3 py-2 border-b border-zinc-200 bg-white flex-shrink-0">
          <div className="flex bg-zinc-100 p-1 rounded-lg gap-0.5 w-full">
            <button onClick={() => setMobileView('chat')}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${mobileView === 'chat' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}>Chat</button>
            <button onClick={() => setMobileView('preview')} disabled={!ficheContent && !isLoading}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-colors ${mobileView === 'preview' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'} ${!ficheContent && !isLoading ? 'opacity-30' : ''}`}>
              Preview {isLoading && mobileView !== 'preview' && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full ml-1 animate-pulse align-middle" />}
            </button>
          </div>
        </div>

        {mobileView === 'chat' && (
          <div className="flex flex-col flex-1 overflow-hidden bg-white">
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-3">
              {messages?.map((msg, idx) => (
                <div key={idx}>
                  {msg.role === 'assistant'
                    ? <AssistantMessage content={msg.content} isGenerating={false} query={msg.content} rawContent={msg.rawContent} onPreviewClick={() => { if (msg.rawContent) { setFicheContent(msg.rawContent); setMobileView('preview'); } }} />
                    : <UserMessageBubble msg={msg} />}
                </div>
              ))}
              {isLoading && <AssistantMessage content={null} isGenerating={true} query={currentQuery} />}
            </div>
            <div className="flex-shrink-0">
              <ErrorNotification error={pendingError} onFix={handleFixError} onDismiss={() => setPendingError(null)} />
              <ChatInputBar input={input} setInput={setInput} onSend={sendMessage} onStop={handleStop} isLoading={isLoading} files={files} setFiles={setFiles} discussMode={discussMode} setDiscussMode={setDiscussMode} editMode={editMode} setEditMode={setEditMode} />
            </div>
          </div>
        )}

        {mobileView === 'preview' && (
          <div className="flex-1 overflow-hidden relative bg-black">
            <EditModeOverlay active={editMode} onDisable={() => setEditMode(false)} />
            {ficheContent && <FichePanel content={ficheContent} onError={setRuntimeError} onSuccess={() => setRuntimeError(null)} isPublic={false} viewMode={viewMode} setViewMode={setViewMode} appSettings={appSettings} onUpdateSettings={handleUpdateAppMeta} onClone={handleCloneApp} onDelete={handleDeleteApp} onUnpublish={handleUnpublishApp} customSlug={customSlug} onUpdateContent={setFicheContent} />}
          </div>
        )}
      </div>
    </div>
  );
}