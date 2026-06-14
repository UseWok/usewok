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
import BuildToast, { showBuildToast, hideBuildToast } from '@/components/chat/BuildToast';
import WokHeaderMenu from '@/components/chat/WokHeaderMenu';
import ChatHeader from '@/components/chat/ChatHeader';
import IframeModal from '@/components/chat/IframeModal';
import ProModal from '@/components/chat/ProModal';
import FullscreenIframeModal from '@/components/chat/FullscreenIframeModal';
import PreviewSkeleton from '@/components/chat/PreviewSkeleton';
import HistoryPanel from '@/components/chat/HistoryPanel';
import AnalyticsPanel from '@/components/chat/AnalyticsPanel.jsx';
import MorePanel from '@/components/chat/MorePanel';
import { computeCreditCost, deductCredits, isUserLocked, initUserCredits, checkAndRenewCredits, fetchCreditsFromBackend } from '@/lib/credits';
import { isUserBanned } from '@/lib/credit-engine';
import { getBuildMode, subscribeBuildMode, hydrateBuildModeFromCloud } from '@/lib/build-mode-store';


// ── Lib ──
import { safeAsync, checkRateLimit, sanitizeInput } from '@/lib/code-quality';
import { classifyError } from '@/lib/error-handler';
import { initAgentsFromDB } from '@/lib/agents-config';
import { setCurrentUser, loadConversationFromCloud } from '@/lib/discussions';
import { getUserPlan, getPlanFeatures } from '@/lib/plans-config';
import {
  getLocalDiscussions, saveLocalDiscussions,
  getConversationMessages, saveConversationMessages,
  syncToCloud, loadFromCloud, loadDiscussionsFromCloud,
  createConversationInCloud,
} from '@/lib/chat-storage';
import {
  PROMPT_ARCHITECT, PROMPT_DATA_INSIGHT, PROMPT_AUTO_FIX, PROMPT_THINKING,
  CHOCOLATINE_CODE, MODIFY_KEYWORDS, DATA_QUERY_KEYWORDS
} from '@/lib/chat-prompts';
import {
  orchestrateGeneration, patchCode, runSafetyFilter, runAutofixPipeline, MODELS as ORCH_MODELS,
} from '@/lib/ai-orchestrator';
import { formatCode, splitThinkingFromCode } from '@/lib/code-formatter';
import { writeAuditLog } from '@/lib/serverGuard';

// ── Automated thumbnail generator — fires only for published builds ──
// Uses gpt-4o-mini to describe the app visually, then GenerateImage to produce a thumbnail.
// Non-blocking background job. Saves thumbnail_url to the Conversation record.
async function generateBuildThumbnail(convId, rawContent, appTitle) {
  try {
    // Step 1: Ask gpt-4o-mini to describe the app UI for image generation
    const description = await base44.integrations.Core.InvokeLLM({
      model: 'gpt_5_mini',
      prompt: `You are a UI screenshot describer. Given this React component code, write a vivid 1-sentence description of what the rendered UI looks like visually (colors, layout, key elements). Keep it under 80 words, suitable as an image generation prompt.\n\nApp title: "${appTitle}"\n\nCode (first 2000 chars):\n${(rawContent || '').slice(0, 2000)}`,
    });
    if (!description || typeof description !== 'string') return;

    // Step 2: Generate thumbnail image
    const { url: thumbnailUrl } = await base44.integrations.Core.GenerateImage({
      prompt: `Clean UI screenshot mockup of a web app: ${description.trim()}. Modern, professional, browser window frame, high-res, light background.`,
    });
    if (!thumbnailUrl) return;

    // Step 3: Persist thumbnail_url to the conversation record
    const results = await base44.entities.Conversation.filter({ conv_id: convId });
    if (results.length > 0) {
      await base44.entities.Conversation.update(results[0].id, { thumbnail_url: thumbnailUrl });
    }
  } catch {
    // Silent — thumbnail generation is best-effort
  }
}

// Placeholder stubs (replace with real implementations when available)
const COMPONENT_PACKET = {};
const PROACTIVE_INTELLIGENCE_LAYER = {};
const buildPreferenceHints = () => "";

// ── Center gutter: 2px separator that glows + shows resize handle on hover ──
function ChatGutter() {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: hovered ? 8 : 6, flexShrink: 0, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'col-resize', transition: 'width 150ms',
        zIndex: 20,
      }}
    >
      {/* The 2px line */}
      <div style={{
        width: 2, height: '100%', borderRadius: 1,
        background: hovered
          ? 'linear-gradient(180deg, transparent 0%, #F95738 40%, #F95738 60%, transparent 100%)'
          : 'linear-gradient(180deg, transparent 0%, #333 30%, #333 70%, transparent 100%)',
        boxShadow: hovered ? '0 0 8px rgba(249,87,56,0.5)' : 'none',
        transition: 'background 200ms, box-shadow 200ms',
        pointerEvents: 'none',
      }} />
      {/* Drag handle pill */}
      {hovered && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 16, height: 40, borderRadius: 8,
          background: '#2A2A2A', border: '1px solid #3A3A3A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 2, flexDirection: 'column',
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 2, height: 2, borderRadius: '50%', background: '#555' }} />
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [isRefreshingPreview, setIsRefreshingPreview] = useState(false);
  const [iframeModal, setIframeModal] = useState({ open: false, url: '' });
  const [showHistory, setShowHistory] = useState(false);
  const [showChatTitleMenu, setShowChatTitleMenu] = useState(false);
  const chatTitleRef = useRef(null);

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
  const [streamingThinking, setStreamingThinking] = useState('');

  const profileMenuRef = useRef(null);
  const abortedRef = useRef(false);

  // ── Build mode: sync from global store ──
  const [buildMode, setBuildModeState] = useState(() => getBuildMode());

  useEffect(() => {
    const unsub = subscribeBuildMode(m => setBuildModeState(m));
    hydrateBuildModeFromCloud();
    return unsub;
  }, []);

  // ── Credits helper — backend autoritaire ──
  const handleUpdateCredits = async (cost, idempotencyKey, isNewBuild = false) => {
    if (!user) return;
    try {
      const updatedUser = await deductCredits(user, cost, idempotencyKey, isNewBuild);
      if (updatedUser) setUser(updatedUser);
    } catch (err) {
      if (err.message === 'CREDITS_LOCKED') {
        toast.error('Crédits épuisés pour ce cycle.');
      } else if (err.message === 'LIMIT_REACHED') {
        toast.error('Build limit reached for your plan.');
        throw err;
      }
    }
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
    if (newSettings.isPublic !== undefined) setIsAppPublished(newSettings.isPublic);
    if (convId) {
      await safeAsync(async () => {
        const results = await base44.entities.Conversation.filter({ conv_id: convId });
        if (results.length > 0) {
          await base44.entities.Conversation.update(results[0].id, { title: newSettings.title, is_public: newSettings.isPublic, raw_content: ficheContent || results[0].raw_content });
        }
      }, null, 'Update app meta');
    }
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

    // ── Ban check (server-authoritative) ──
    if (isUserBanned(user)) {
      toast.error('Your account has been suspended. Contact support.');
      return;
    }

    // ── Credit lockout check ──
    if (isUserLocked(user)) {
      toast.error("Credits exhausted. Renewal in a few days.");
      return;
    }

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
    showBuildToast('working', { convUrl: `/chat?conversationId=${convId}` });

    // ── Immediate cloud registration on first message of a new conversation ──
    if (!conversationId && (messages || []).length === 0) {
      window.history.replaceState(null, '', `/chat?conversationId=${convId}`);
      createConversationInCloud(convId, text.slice(0, 80)).catch(() => {});

      // ── O2 Auto-naming: background parallel call (non-blocking) ──
      base44.integrations.Core.InvokeLLM({
        model: 'gpt_5_mini',
        prompt: `You are o2, a highly concise naming engine. Given a user's app build request, return a JSON object with a single field "title" that is exactly 2-3 words summarizing the app. Be direct, architectural, no articles.\n\nUser request: "${text.slice(0, 300)}"`,
        response_json_schema: { type: 'object', properties: { title: { type: 'string' } } },
        model: 'gpt_5_mini',
      }).then(async (result) => {
        const autoTitle = result?.title?.trim();
        if (!autoTitle) return;
        const results = await base44.entities.Conversation.filter({ conv_id: convId });
        if (results.length > 0) await base44.entities.Conversation.update(results[0].id, { title: autoTitle });
      }).catch(() => {});
    }

    try {
      // ── Auto-fix path — routes strictly to gpt_5_mini ──
      if (options.isCorrection) {
        const rawCode = ficheContent || '';
        // Extract raw code without fences for the pipeline
        const bt = String.fromCharCode(96);
        const fenceRegex = new RegExp(`${bt}{3}(?:jsx?)?\\n([\\s\\S]*?)${bt}{3}`, 'i');
        const fenceMatch = rawCode.match(fenceRegex);
        const codeForFix = fenceMatch ? fenceMatch[1] : rawCode;

        // Surgical: extract broken section → fix only that → patch back
        const { patched } = await runAutofixPipeline(options.rawError || '', codeForFix);
        if (abortedRef.current) return;

        // Re-wrap in fence if original had one
        const newContent = fenceMatch
          ? rawCode.replace(fenceMatch[0], `${bt}${bt}${bt}jsx\n${patched}\n${bt}${bt}${bt}`)
          : patched;

        setIsLoading(false);
        setFicheContent(newContent);
        const finalMsgs = [...newMessages, { role: 'assistant', content: "Error patched — only the broken section was rewritten.", rawContent: newContent }];
        setMessages(finalMsgs);
        saveConversationMessages(convId, finalMsgs);
        if (!conversationId) window.history.replaceState(null, '', `/chat?conversationId=${convId}`);
        await syncToCloud(convId, finalMsgs, { title: 'Error fix', preview: 'Surgical patch applied', rawContent: newContent });
        return;
      }

      const userMessageIndex = (messages || []).filter(m => m.role === 'user').length;

      // ── Build / modify path ──
      // #15: Preserve any existing generated images — strip image-regen instructions unless explicit
      const hasExplicitImageRequest = /\b(new image|regenerate image|generate image|change image|replace image|update image)\b/i.test(text);
      const isModification = !!(editMode && ficheContent) || !!(ficheContent && MODIFY_KEYWORDS.test(text));
      
      if (user && !isModification && !discussMode) {
        const planFeatures = getPlanFeatures(user);
        const userPlanInfo = getUserPlan(user);
        if (planFeatures.max_builds !== undefined && (user.project_count || 0) >= planFeatures.max_builds) {
          toast.error(`You have reached the maximum of ${planFeatures.max_builds} builds for the ${userPlanInfo?.name} plan. Please upgrade to continue.`);
          setIsLoading(false);
          setMessages([...newMessages, { role: 'assistant', content: `You've hit the ${planFeatures.max_builds} build limit for your plan. Please upgrade to continue building.` }]);
          return;
        }
      }
      const imageUrls2 = (options.files || files || []).filter(f => f.type?.startsWith('image/')).map(f => f.url);

      // ── Thinking layer: call first, stream result char-by-char ──
      setStreamingThinking('');
      const thinkingPayload = { prompt: PROMPT_THINKING + '\n\nUser request: ' + text, model: ORCH_MODELS.DEFAULT };
      const thinkingResult = await cachedAIRequest(thinkingPayload, () => base44.integrations.Core.InvokeLLM({ ...thinkingPayload }));
      const thinkingBlock = typeof thinkingResult === 'string' ? thinkingResult : '';

      // Stream the thinking text character by character
      if (thinkingBlock) {
        // Extract content inside <thinking> tags for streaming
        const thinkMatch = thinkingBlock.match(/<thinking>([\s\S]*?)<\/thinking>/i);
        const thinkContent = thinkMatch ? thinkMatch[1].trim() : thinkingBlock;
        let streamed = '';
        for (let i = 0; i < thinkContent.length; i++) {
          if (abortedRef.current) break;
          streamed += thinkContent[i];
          setStreamingThinking(streamed);
          // Vary speed: faster for spaces, slower for punctuation
          const ch = thinkContent[i];
          const delay = ch === ' ' ? 8 : (ch === '\n' ? 40 : (/[.!?]/.test(ch) ? 60 : 18));
          await new Promise(r => setTimeout(r, delay));
        }
      }

      // ── Orchestrated generation ──
      // ── DYNAMIC AI ROUTING: pass searchActive flag to orchestrator ──
      // When searchActive=true, orchestrator strictly routes to gemini_3_flash + web search
      const orchResult = await orchestrateGeneration(text, {
        existingCode: isModification ? ficheContent : null,
        userMessageIndex,
        fileUrls: imageUrls2,
        needsWebSearch: false,
        searchActive: !!(options.searchActive),
        systemPrompt: PROMPT_ARCHITECT,
        buildMode: buildMode,
      });

      if (abortedRef.current) return;

      const bt = String.fromCharCode(96);
      let rawCodeResult = typeof orchResult.code === 'string' ? orchResult.code : JSON.stringify(orchResult.code || '');

      // For modifications: patch only the changed section back into the full code
      let finalRawCode = rawCodeResult;
      if (isModification && orchResult.codeSection && ficheContent) {
        finalRawCode = patchCode(ficheContent, orchResult.codeSection, rawCodeResult);
      }

      // Apply client-side code formatter
      const { thinking: llmThinking, code: cleanCode } = splitThinkingFromCode(finalRawCode);
      const formattedCode = formatCode(cleanCode || finalRawCode);

      // Wrap in code fence if not already
      let codeOnly = formattedCode;
      if (!codeOnly.includes(bt + bt + bt)) {
        codeOnly = `${bt}${bt}${bt}jsx\n${codeOnly}\n${bt}${bt}${bt}`;
      }

      // rawContent = code for the preview iframe (without fences)
      const rawContent = codeOnly;

      // chatDisplayContent — readable summary only
      const codeBlockRegex = new RegExp(`${bt}{3}(?:jsx?|javascript|react)?\\n([\\s\\S]*?)${bt}{3}`, 'gi');
      let chatDisplayContent = codeOnly.replace(codeBlockRegex, '').trim() || 'Architecture generated successfully.';

      // Optional data insight (gpt_5_mini)
      let formattedInsight = null;
      if (DATA_QUERY_KEYWORDS.test(text) && !isModification) {
        const insightPrompt = PROMPT_DATA_INSIGHT + '\n\nUser query: ' + text;
        const insightPayload = { prompt: insightPrompt, model: ORCH_MODELS.DEFAULT };
        const insightResult = await cachedAIRequest(insightPayload, () => base44.integrations.Core.InvokeLLM({ ...insightPayload }));
        formattedInsight = typeof insightResult === 'string' ? insightResult : null;
      }

      const finalContent = thinkingBlock
        ? thinkingBlock + '\n\n' + (formattedInsight ? chatDisplayContent + '\n\n' + formattedInsight : chatDisplayContent)
        : (formattedInsight ? chatDisplayContent + '\n\n' + formattedInsight : chatDisplayContent);

      // ── Deduct credits — secure, irreversible, idempotent ──
      const cost = computeCreditCost(buildMode, isModification);
      const iKey = `build_${convId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const isNewBuild = !isModification && !discussMode && !!user;
      await handleUpdateCredits(cost, iKey, isNewBuild);

      // Always persist URL first so the build is reachable even if user leaves immediately
      if (!conversationId) window.history.replaceState(null, '', `/chat?conversationId=${convId}`);

      setIsLoading(false);
      setStreamingThinking('');
      hideBuildToast();
      setTimeout(() => showBuildToast('saved', { title: 'Build saved', body: 'Your build has been saved to history.' }), 100);
      if (!discussMode) setFicheContent(rawContent);

      const finalMsgs = [...newMessages, { role: 'assistant', content: finalContent, rawContent }];
      setMessages(finalMsgs);
      saveConversationMessages(convId, finalMsgs);

      // ── Hard save to cloud immediately (no fire-and-forget — await to guarantee persistence) ──
      const isPublished = !!(appSettings?.isPublic);
      await syncToCloud(convId, finalMsgs, {
        title: text.slice(0, 80),
        preview: text.slice(0, 120),
        is_public: isPublished,
        rawContent: rawContent || null,
      });

      // ── Automated thumbnail: only for published builds, background job (non-blocking) ──
      if (isPublished && rawContent) {
        generateBuildThumbnail(convId, rawContent, text.slice(0, 80)).catch(() => {});
      }

      saveToDiscussionsLogic(text.slice(0, 60) || 'New Chat', text);
      if (window.innerWidth < 768 && !discussMode) setMobileView('preview');

    } catch (err) {
      if (err.name === 'AbortError') return;
      setIsLoading(false);
      const classified = classifyError(err, 'Code generation');
      hideBuildToast();
      showBuildToast('error', {
        title: classified.title || 'Runtime error',
        body: classified.hint || classified.raw || 'Something went wrong.',
        onFix: () => {
          const errorText = classified.raw || classified.title;
          const bt = String.fromCharCode(96);
          sendMessage(`The following errors happened in the app:\n\n${bt}${bt}${bt}\n${errorText}\n${bt}${bt}${bt}\n\nPlease help me fix these errors.`, { isCorrection: true, rawError: errorText });
        },
      });
      setMessages([...newMessages, { role: 'assistant', content: classified.hint || classified.title }]);
      // Server-side audit log for all generation errors (not just UI toasts)
      if (user?.id) {
        writeAuditLog(user.id, {
          action: 'generate',
          resource_type: 'Generation',
          resource_id: convId,
          status: 'failed',
          error_message: err?.message || 'Unknown error',
          metadata: { title: classified.title, hint: classified.hint, conv_id: convId },
        }).catch(() => {});
      }
    }
  }, [messages, isLoading, discussMode, currentWorkspace, user, ficheContent, editMode]);

  const handleStop = useCallback(() => {
    abortedRef.current = true;
    setIsLoading(false);
    hideBuildToast();
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



  useEffect(() => {
    const initAuth = async () => {
      await safeAsync(() => initAgentsFromDB(), null, 'Init agents');
      let u = await safeAsync(() => base44.auth.me(), null, 'Fetch user');
      if (u) {
        // Initialize credits for new users — always calls backend, no exemptions
        await initUserCredits(u);
        // Re-fetch user after init to get fresh credits_used/credits_limit from backend
        u = await safeAsync(() => base44.auth.me(), u, 'Refresh user after init');
        u = await checkAndRenewCredits(u);
        // Final re-fetch to ensure credits_used is accurate after potential renewal
        u = await safeAsync(() => base44.auth.me(), u, 'Refresh user after renewal');
        setUser(u);
        if (u.id) setCurrentUser(u.id);
        setUserPlan(getUserPlan(u));
      }
    };
    initAuth();
  }, [conversationId]);

  useEffect(() => {
    // Reset logs for every new build session
    if (!conversationId) {
      try {
        ['wok_log_0','wok_log_1','wok_log_2'].forEach(k => localStorage.removeItem(k));
        localStorage.removeItem('wok_log_slot');
      } catch {}
    }
    if (initialQ && (messages?.length || 0) === 0 && !conversationId) sendMessage(initialQ);
  }, []);

  // Load conversation from cloud on mount (cross-device)
  useEffect(() => {
    if (!conversationId) { setMessages([]); setFicheContent(null); return; }

    const loadConv = async () => {
      // 1. Show local cache instantly while cloud loads
      const localMsgs = getConversationMessages(conversationId);
      if (localMsgs.length > 0) setMessages(localMsgs);
      const localFiche = localStorage.getItem(`fiche_${conversationId}`);
      if (localFiche) setFicheContent(localFiche);

      // 2. Load from cloud (authoritative)
      const cloud = await safeAsync(() => loadFromCloud(conversationId), null, 'Load conversation');
      if (cloud) {
        const safe = Array.isArray(cloud.messages) ? cloud.messages : [];
        if (safe.length > 0) {
          setMessages(safe);
          saveConversationMessages(conversationId, safe);
        }
        if (cloud.title) {
          setAppSettings(prev => ({ ...prev, title: cloud.title }));
        }
        setIsAppPublished(!!cloud.is_public);
        setAppSettings(prev => ({ ...prev, isPublic: !!cloud.is_public }));

        // 3. Restore preview content — try all sources in order of reliability
        let rawContent = cloud.rawContent;

        // 3a. If stored as a URL (large content), fetch it
        if (!rawContent && cloud.rawContentUrl) {
          try {
            const res = await fetch(cloud.rawContentUrl);
            rawContent = await res.text();
          } catch {}
        }

        // 3b. Fallback: extract from last assistant message with rawContent
        if (!rawContent && safe.length > 0) {
          const last = safe.filter(m => m.role === 'assistant' && m.rawContent).pop();
          rawContent = last?.rawContent || null;
        }

        // 3c. Last resort: local localStorage
        if (!rawContent) {
          rawContent = localStorage.getItem(`fiche_${conversationId}`);
        }

        if (rawContent) {
          setFicheContent(rawContent);
          localStorage.setItem(`fiche_${conversationId}`, rawContent);
        }
      } else {
        // Cloud failed — rely entirely on local data
        if (localMsgs.length > 0) {
          const last = localMsgs.filter(m => m.role === 'assistant' && m.rawContent).pop();
          if (last?.rawContent && !localFiche) {
            setFicheContent(last.rawContent);
            localStorage.setItem(`fiche_${conversationId}`, last.rawContent);
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
    if (runtimeError && !isLoading) {
      setPendingError(runtimeError);
      showBuildToast('error', {
        title: 'Runtime error',
        body: runtimeError,
        onFix: () => {
          const bt = String.fromCharCode(96);
          sendMessage(`The following errors happened in the app:\n\n${bt}${bt}${bt}\n${runtimeError}\n${bt}${bt}${bt}\n\nPlease help me fix these errors.`, { isCorrection: true, rawError: runtimeError });
        },
      });
      setRuntimeError(null);
    }
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
      style={{ backgroundColor: '#1F1F1F' }}>

      <style>{`html,body{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

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
        ficheContent={ficheContent}
        user={user}
      />
      
      {/* Global draggable build toast */}
      <BuildToast />

      {/* Sidebar */}
      <ChatWorkspaceSidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} user={user} convId={conversationId || convId} hidden={!!fullscreenModal} />

      {/* ── Main layout: fills entire screen ── */}
      <div
        ref={containerRef}
        className="flex w-full h-full overflow-hidden"
        style={{ background: '#1F1F1F' }}>

        <div className="flex w-full h-full" style={{ gap: 0, padding: '6px 6px 6px 6px', boxSizing: 'border-box' }}>
          {/* ── Left: Chat panel ── */}
          {chatVisible && (
            <div style={{ width: 420, minWidth: 420, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#1F1F1F', position: 'relative' }}>

              {/* ── Chat top bar: logo+title (left) + history clock (right) ── */}
              <div style={{
                height: 44, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 8px 0 4px',
                position: 'relative', zIndex: 10,
                background: 'transparent',
              }}>
                {/* WOK logo + project name — clickable opens sidebar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }} ref={chatTitleRef}>
                  <img
                    src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png"
                    alt="WOK"
                    style={{ width: 36, height: 'auto', objectFit: 'contain', mixBlendMode: 'screen', flexShrink: 0 }}
                  />
                  <button
                    onClick={() => setIsSidebarOpen(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      height: 28, padding: '0 7px', border: 'none',
                      background: 'transparent', cursor: 'pointer', borderRadius: 6,
                      fontSize: 13, fontWeight: 500, color: '#ccc',
                      fontFamily: 'Inter, sans-serif', maxWidth: 180,
                      transition: 'background 120ms, color 120ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#2A2A2A'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ccc'; }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {appSettings?.title || 'My App'}
                    </span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: '#555' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>

                {/* History (clock) — top right of chat */}
                <button
                  title={showHistory ? 'Hide versions' : 'Version history'}
                  onClick={() => setShowHistory(v => !v)}
                  style={{
                    width: 28, height: 28, borderRadius: 7, border: 'none',
                    background: showHistory ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', transition: 'background 120ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background = showHistory ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
                  </svg>
                </button>
              </div>



              {/* History panel replaces chat when open — stays in chat column, never over preview */}
              {showHistory ? (
                <div style={{ flex: 1, overflow: 'hidden', borderRadius: 10, border: '1px solid #2A2A2A', background: '#1E1E1E', margin: '6px 0 0 0' }}>
                  <HistoryPanel messages={messages} ficheContent={ficheContent} convId={conversationId || convId} setFicheContent={(c) => { setFicheContent(c); setShowHistory(false); }} user={user} />
                </div>
              ) : isLoadingConversation ? (
                <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'hidden' }}>
                  {[120, 220, 90, 180, 140].map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
                      {i % 2 === 0 && <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2A2A2A', flexShrink: 0 }} />}
                      <div style={{ height: 40, width: w, maxWidth: '70%', borderRadius: 12, background: '#2A2A2A', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)', backgroundSize: '200% 100%', animation: `chatsk 1.4s ease-in-out ${i*0.15}s infinite` }} />
                      </div>
                    </div>
                  ))}
                  <style>{`@keyframes chatsk{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
                </div>
              ) : (
                <>
                  <MessageList
                    messages={messages}
                    isLoading={isLoading}
                    currentQuery={currentQuery}
                    setFicheContent={setFicheContent}
                    setViewMode={setViewMode}
                    streamingThinking={streamingThinking}
                  />
                  <div className="flex-shrink-0">
                    <ErrorNotification error={pendingError} onFix={handleFixError} onDismiss={() => setPendingError(null)} />
                    <ChatInputBar
                      input={input} setInput={setInput}
                      onSend={(text, opts) => sendMessage(text, { ...opts })}
                      onStop={handleStop}
                      isLoading={isLoading}
                      files={files} setFiles={setFiles}
                      discussMode={discussMode} setDiscussMode={setDiscussMode}
                      editMode={editMode} setEditMode={setEditMode}
                      onUpgrade={() => {}}
                      locked={isUserLocked(user)}
                      buildMode={buildMode}
                      user={user}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Center gutter: 2px glowing separator with resize handle on hover ── */}
          {chatVisible && <ChatGutter />}

          {/* ── Right: Preview panel ── */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#1F1F1F', display: 'flex', flexDirection: 'column' }}>
            {/* Header bar */}
            <ChatHeader
              user={user}
              chatVisible={chatVisible}
              setChatVisible={setChatVisible}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onPublish={() => setShowPublishModal(true)}
              onRefresh={() => { setIframeRefreshKey(k => k + 1); setIsRefreshingPreview(true); setTimeout(() => setIsRefreshingPreview(false), 1200); }}
              onExport={() => {
                // Trigger export via a custom event that FichePanel listens to
                window.dispatchEvent(new CustomEvent('wok_export_zip'));
              }}
              appTitle={appSettings?.title || 'My App'}
              onTitleChange={(t) => handleUpdateAppMeta({ ...appSettings, title: t })}
              mobilePreview={mobilePreview}
              setMobilePreview={setMobilePreview}
              showHistory={showHistory}
              setShowHistory={setShowHistory}
            />

            {/* Preview area */}
            <div style={{
              position: 'absolute', top: 44, left: 4, right: 6, bottom: 6,
              display: 'flex', alignItems: 'stretch', justifyContent: 'center',
              borderRadius: 10,
              border: '0.5px solid rgba(250,249,246,0.2)',
              overflow: 'hidden',
            }}>

            {/* Analytics panel */}
            {viewMode === 'analytics' && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 99, background: '#141414', borderRadius: 8, overflow: 'hidden' }}>
                <AnalyticsPanel convId={conversationId || convId} />
              </div>
            )}

            {/* More panel — logs + code editor */}
            {viewMode === 'more' && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 99, borderRadius: 8, overflow: 'hidden' }}>
                <MorePanel
                  ficheContent={ficheContent}
                  onUpdateContent={setFicheContent}
                  user={user}
                  isLoading={isLoading}
                />
              </div>
            )}



            {/* Preview container — mobile mode centers the phone, desktop fills full width */}
            <motion.div
              animate={mobilePreview
                ? { width: 390, borderRadius: 20 }
                : { width: '100%', borderRadius: 0 }
              }
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              style={{
                overflow: 'hidden', background: '#FFFFFF', flexShrink: 0,
                alignSelf: mobilePreview ? 'center' : 'stretch',
                boxShadow: 'none',
                border: 'none',
                height: mobilePreview ? 'calc(100% - 0px)' : '100%',
              }}
            >

              

              {/* Refresh: minimal top loader only — no overlay, no darkening */}
              <AnimatePresence>
                {isRefreshingPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      position: 'absolute', top: 14, left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 52,
                      display: 'flex', alignItems: 'center', gap: 7,
                      background: 'rgba(20,20,20,0.78)',
                      border: '1px solid rgba(249,87,56,0.2)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: 999,
                      padding: '6px 12px 6px 9px',
                      pointerEvents: 'none',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" style={{ animation: 'refresh-spin 0.7s linear infinite', flexShrink: 0 }}>
                      <circle cx="6.5" cy="6.5" r="5" fill="none" stroke="rgba(249,87,56,0.2)" strokeWidth="1.5"/>
                      <path d="M 6.5 1.5 A 5 5 0 0 1 11.5 6.5" fill="none" stroke="#F95738" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#ccc', fontFamily: 'Inter, sans-serif' }}>
                      Refreshing
                    </span>
                    <style>{`@keyframes refresh-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                  </motion.div>
                )}
              </AnimatePresence>

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
              ) : isLoadingConversation ? (
                <PreviewSkeleton />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fafaf9' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
                  </div>
                  <p style={{ fontSize: 12, color: '#bbb', fontFamily: 'Inter, sans-serif', margin: 0 }}>Start a conversation to see the preview</p>
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
              <ChatInputBar input={input} setInput={setInput} onSend={(text, opts) => sendMessage(text, { ...opts })} onStop={handleStop} isLoading={isLoading} files={files} setFiles={setFiles} discussMode={discussMode} setDiscussMode={setDiscussMode} editMode={editMode} setEditMode={setEditMode} />
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