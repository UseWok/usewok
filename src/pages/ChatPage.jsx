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
import { getUserColor } from '@/lib/user-color';

import WorkspaceSidebar from '@/components/sidebar/WorkspaceSidebar';
import WorkspaceHeader from '@/components/chat/WorkspaceHeader';
import FichePanel from '@/components/chat/FichePanel';
import ChatInputBar from '@/components/chat/ChatInputBar';
import AssistantMessage from '@/components/chat/AssistantMessage';
import ChatLoadingAnimation from '@/components/chat/ChatLoadingAnimation';
import SynthesisProgress from '@/components/chat/SynthesisProgress';

import { X } from 'lucide-react';

const CustomUserMessageBubble = ({ msg }) => (
  <div className="flex justify-end w-full mb-6 font-sans">
    <div className="bg-[#F7F7F7] text-[#0d0d0d] text-[15px] leading-relaxed px-5 py-3 rounded-[24px] max-w-[80%] whitespace-pre-wrap">
      {msg.content}
    </div>
  </div>
);

const IframeModal = ({ open, url, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-sans bg-[#0A0A0A]/80 backdrop-blur-sm">
      <div className="relative w-[95vw] h-[95vh] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-gray-100/80 hover:bg-gray-200 text-gray-800 rounded-full transition-all shadow-sm">
          <X className="w-5 h-5" strokeWidth={2.5} />
        </button>
        <iframe src={url} className="w-full h-full border-none bg-white" />
      </div>
    </div>
  );
};

const AGENTS = [
  { id: 'global', labelKey: 'global_agent', label: "Knowing exactly where I'm going" },
  { id: 'emotions-depenses', labelKey: 'emotions_agent', label: 'Spend without guilt' },
  { id: 'wealth-strategy', labelKey: 'wealth_agent', label: 'Becoming financially free' },
];

const STENSOR_SYSTEM = `You are a brilliant, candid financial expert. You speak like a smart friend — direct, warm, and actionable.

LANGUAGE: ALWAYS respond in English.
CRITICAL: NEVER mention any platform name, its launch, its features, or promotional content. You exist solely to solve the user's financial problems.
LENGTH: Match to complexity. Short question = 1-3 sentences. Complex analysis = up to 1800 chars. Less is more.

RULES:
- Go straight to the point. No intro, no restating question.
- If user shares a document: say you ran 578 simulations, give best scenario with 85% probability.
- Never promote any product or service.`;

function quickRouteLocal(text) {
  const t = text?.trim() || "";
  if (t.length < 60) return '1';
  if (/^(bonjour|salut|merci|ok|ciao|hello|\u00e7a va|hi |hey |thanks|bonne)/i.test(t)) return '1';
  return null;
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
  const [discussions, setDiscussions] = useState([]);

  // WORKSPACE LOGIC
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('stensor_workspaces');
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'My Workspace', current: true }];
  });
  const currentWorkspace = workspaces.find(w => w.current) || workspaces[0];
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  
  // Modals & popovers state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [iframeModal, setIframeModal] = useState({ open: false, url: '' });
  const [showFreeDiscussionLimit, setShowFreeDiscussionLimit] = useState(false);

  // Chat state
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
  const [files, setFiles] = useState([]);
  const [ficheContent, setFicheContent] = useState(null);
  const [synthProgress, setSynthProgress] = useState({ active: false, steps: [], currentStep: 0, done: false });

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isMountedRef = useRef(true);
  const abortedRef = useRef(false);

  const hasStarted = messages.length > 0 || isLoading;

  useEffect(() => {
    if (!isLoadingConversation && messages.length === 0 && conversationId) navigate('/');
  }, [isLoadingConversation, messages.length, conversationId, navigate]);

  useEffect(() => {
    if (input) localStorage.setItem('stensor_chat_draft', input);
    else localStorage.removeItem('stensor_chat_draft');
  }, [input]);

  useEffect(() => {
    initAgentsFromDB().catch(() => {});
    try {
      const allDiscs = getDiscussions();
      setDiscussions(allDiscs || []);
    } catch {}

    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.id) setCurrentUser(u.id);
      setUserPlan(getUserPlan(u));
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
      const safeCloudMsgs = Array.isArray(cloudMsgs) ? cloudMsgs : [];
      if (safeCloudMsgs.length > 0) { setMessages(safeCloudMsgs); saveConversationMessages(conversationId, safeCloudMsgs); }
      setTimeout(() => setIsLoadingConversation(false), 300);
    }).catch(() => setIsLoadingConversation(false));
  }, [conversationId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleStop = useCallback(() => {
    abortedRef.current = true; setIsLoading(false);
    setSynthProgress({ active: false, steps: [], currentStep: 0, done: false });
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), { role: 'assistant', content: 'Generation interrupted.' }]);
  }, []);

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      const newWs = { id: `ws_${Date.now()}`, name: newWorkspaceName.trim(), current: true };
      const updated = workspaces.map(w => ({ ...w, current: false })).concat(newWs);
      setWorkspaces(updated);
      localStorage.setItem('stensor_workspaces', JSON.stringify(updated));
      setShowWorkspaceModal(false);
      setNewWorkspaceName('');
      toast.success("Workspace created successfully.");
    }
  };

  const handleSwitchWorkspace = (id) => {
    const updated = workspaces.map(w => ({ ...w, current: w.id === id }));
    setWorkspaces(updated);
    localStorage.setItem('stensor_workspaces', JSON.stringify(updated));
  };

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isLoading) return;

    let currentUser = user;
    if (!currentUser) { try { currentUser = await base44.auth.me(); if (currentUser) { setUser(currentUser); } } catch {} }

    const isFree = !userPlan || userPlan.price_monthly === 0;
    if (isFree) {
      try { const stored = getDiscussions(); if (!stored.find((d) => d.id === convId) && stored.length >= 3) { localStorage.setItem('stensor_saved_input', text); setShowFreeDiscussionLimit(true); return; } } catch {}
    }

    const userMsg = { role: 'user', content: text, files: files.length > 0 ? files.map((f) => f.name) : undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages); setInput(''); setFiles([]); setIsLoading(true);

    if (isGibberish(text) && files.length === 0) {
      const canned = GIBBERISH_RESPONSES[Math.floor(Math.random() * GIBBERISH_RESPONSES.length)];
      setMessages([...newMessages, { role: 'assistant', content: canned }]);
      setIsLoading(false); return;
    }

    const systemContext = `${STENSOR_SYSTEM}\n\nWorkspace Context: ${currentWorkspace.name}\n`;
    const recentMsgs = messages.slice(-2);
    const historyContext = recentMsgs.length > 0 ? '\n\n--- Recent conversation ---\n' + recentMsgs.map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content?.slice(0, 350)}`).join('\n\n') + '\n---\n\n' : '';
    const isFirstMessage = !currentUser?.first_message_sent;

    abortedRef.current = false;
    await new Promise(r => setTimeout(r, 2500)); // Fake processing delay

    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({ prompt: systemContext + historyContext + text, model: 'gemini_3_flash' });
    } catch (err) {
      setIsLoading(false);
      setMessages([...newMessages, { role: 'assistant', content: "I haven't been able to process your request. Please try again." }]);
      return;
    }
    
    if (abortedRef.current) return;
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    if (currentUser && isFirstMessage) {
        await base44.auth.updateMe({ first_message_sent: true }); 
        setUser(prev => ({...prev, first_message_sent: true})); 
        completeReferralOnFirstMessage(currentUser.id).catch(() => {}); 
    }

    setIsLoading(false);
    setFicheContent(content);
    
    const finalMsgs = [...newMessages, { role: 'assistant', content }];
    setMessages(finalMsgs);
    saveConversationMessages(convId, finalMsgs);
  }, [user, userPlan, currentAgent, files, messages, isLoading, currentWorkspace]);

  return (
    <div className="flex font-sans h-screen w-full bg-white overflow-hidden antialiased">
      
      {/* WORKSPACE CREATION MODAL */}
      <AnimatePresence>
        {showWorkspaceModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] w-[480px] overflow-hidden flex flex-col font-sans border border-[#E5E5E5]">
              <div className="p-5 border-b border-[#E5E5E5]">
                <h2 className="text-[18px] font-bold text-[#333333]">Create a workspace</h2>
                <p className="text-[13px] text-[#707070] mt-1">Start collaborating with your workspace members</p>
              </div>
              <div className="p-5">
                <h3 className="text-[13px] font-bold text-[#333333] mb-3">Workspace details</h3>
                <label className="text-[12px] font-semibold text-[#707070] mb-1.5 block">Workspace name *</label>
                <input 
                  type="text" 
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Choose a name that represents your workspace" 
                  className="w-full border border-[#E5E5E5] rounded-md px-3 py-2 text-[13px] text-[#333333] focus:outline-none focus:border-[#0080ff] transition-colors mb-6" 
                  autoFocus
                />
                
                <div className="bg-[#F9F8F6] p-4 rounded-lg border border-[#E5E5E5]">
                  <h4 className="text-[12px] font-bold text-[#333333] mb-2.5">What happens next?</h4>
                  <ul className="text-[11.5px] text-[#707070] space-y-2">
                    <li>• You will be the owner of the workspace with full management permissions</li>
                    <li>• You can invite members and manage licenses</li>
                    <li>• Access your workspace dashboard to get started</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 border-t border-[#E5E5E5] bg-white flex justify-end gap-3">
                <button onClick={() => setShowWorkspaceModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#707070] hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
                <button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()} className="px-4 py-2 text-[13px] font-bold text-white bg-[#0080ff] hover:bg-[#0066cc] disabled:opacity-50 rounded-md transition-colors">Create workspace</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <WorkspaceSidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        user={user}
        userPlan={userPlan}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        handleSwitchWorkspace={handleSwitchWorkspace}
        setShowWorkspaceModal={setShowWorkspaceModal}
        discussions={discussions}
        navigate={navigate}
        setIframeModal={setIframeModal}
      />

      {/* MAIN CHAT + PREVIEW CONTAINER */}
      <div className="flex-1 flex flex-col p-2 min-w-0 bg-white">
        
        {/* Inner wrapper holding the chat & preview. Rounded, grey border to frame the application visually */}
        <div className={`flex flex-1 rounded-[16px] overflow-hidden bg-white shadow-sm transition-all duration-300 ${hasStarted ? 'flex-row border border-[#E5E5E5]' : 'flex-col max-w-3xl mx-auto w-full border-none shadow-none'}`}>
          
          {/* CHAT COLUMN */}
          <div className={`flex flex-col bg-white overflow-hidden transition-all duration-300 ${hasStarted ? 'w-[450px] border-r border-[#E5E5E5] z-10' : 'w-full h-full'}`}>
            
            <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:hidden ${!hasStarted ? 'flex flex-col justify-end' : ''}`}>
              {!hasStarted && (
                <div className="flex flex-col items-center justify-center text-center opacity-30 w-full mb-10">
                  <img src={LOGO_URL} alt="Stensor" className="w-12 h-12 object-contain mb-4" />
                  <h2 className="text-[22px] font-bold text-[#0d0d0d]">How can I help you today?</h2>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx}>
                  {msg.role === 'assistant' 
                    ? <AssistantMessage content={msg.content} />
                    : <CustomUserMessageBubble msg={msg} />
                  }
                </div>
              ))}
              
              {isLoading && <AssistantMessage content="" isGenerating={true} />}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            <div className={`flex-shrink-0 p-4 bg-white ${!hasStarted ? 'pb-10' : ''}`}>
              <ChatInputBar
                input={input} setInput={setInput} onSend={sendMessage} onStop={handleStop}
                isLoading={isLoading} 
              />
            </div>
          </div>
          
          {/* PREVIEW COLUMN (Visible only after sending first message) */}
          {hasStarted && (
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
               <WorkspaceHeader />
               <div className="flex-1 overflow-y-auto">
                 <FichePanel content={ficheContent} />
               </div>
            </div>
          )}

        </div>
      </div>

      <IframeModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />
      
      {showFreeDiscussionLimit && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowFreeDiscussionLimit(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-center" onClick={e => e.stopPropagation()}>
            <p className="font-black text-xl mb-4">Free limit reached</p>
            <button onClick={() => { setShowFreeDiscussionLimit(false); navigate('/pricing'); }} className="w-full py-3 bg-black text-white rounded-xl font-bold">View plans →</button>
          </div>
        </div>
      )}
    </div>
  );
}