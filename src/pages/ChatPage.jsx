import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

import { getUserPlan } from '@/lib/plans-config';
import { getDiscussions, saveDiscussions, getConversationMessages, saveConversationMessages, setCurrentUser, syncConversationToCloud, loadConversationFromCloud, loadConversationTitleFromCloud } from '@/lib/discussions';

import WorkspaceHeader from '@/components/chat/WorkspaceHeader';
import UpgradePlanModal from '@/components/chat/UpgradePlanModal'; 
import FichePanel from '@/components/chat/FichePanel';
import ChatInputBar from '@/components/chat/ChatInputBar';
import AssistantMessage from '@/components/chat/AssistantMessage';
import UserMessageBubble from '@/components/chat/UserMessageBubble';
import ChatLoadingAnimation from '@/components/chat/ChatLoadingAnimation';

const STENSOR_SYSTEM = `You are a brilliant financial expert. Go straight to the point. Always end with a concrete next step.`;

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const conversationId = urlParams.get('conversationId') || null;
  const convIdRef = useRef(conversationId || `conv_${Date.now()}`);
  const convId = convIdRef.current;

  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [discussMode, setDiscussMode] = useState(false);
  
  const [ficheContent, setFicheContent] = useState(null);
  const [isPreviewFakeLoading, setIsPreviewFakeLoading] = useState(false);
  const [convTitleDisplay, setConvTitleDisplay] = useState('');
  
  const [iframeModal, setIframeModal] = useState({ open: false, url: '' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const abortedRef = useRef(false);

  // --- SON DE FIN DE REPONSE ---
  const playDoneSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch(e) {}
  };

  useEffect(() => {
    if (!isLoadingConversation && messages.length === 0 && conversationId) navigate('/');
  }, [isLoadingConversation, messages.length, conversationId, navigate]);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u); setUserPlan(getUserPlan(u)); if (u?.id) setCurrentUser(u.id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!conversationId) { setIsLoadingConversation(false); return; }
    loadConversationFromCloud(conversationId).then(async (cloudMsgs) => {
      if (cloudMsgs && cloudMsgs.length > 0) {
        setMessages(cloudMsgs);
        saveConversationMessages(conversationId, cloudMsgs);
        const lastAsstMsg = [...cloudMsgs].reverse().find(m => m.role === 'assistant');
        if (lastAsstMsg) setFicheContent(lastAsstMsg.content);
        const title = await loadConversationTitleFromCloud(conversationId);
        if (title) setConvTitleDisplay(title);
        setIsPreviewFakeLoading(true);
        setTimeout(() => setIsPreviewFakeLoading(false), 2000);
      }
      setIsLoadingConversation(false);
    }).catch(() => setIsLoadingConversation(false));
  }, [conversationId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const saveToDiscussions = (title, preview) => {
    try {
      const stored = getDiscussions();
      const disc = { id: convId, title, preview, date: new Date().toISOString().slice(0, 10), updatedAt: Date.now() };
      const idx = stored.findIndex((d) => d.id === convId);
      if (idx >= 0) stored.splice(idx, 1);
      stored.unshift(disc);
      saveDiscussions(stored);
    } catch {}
  };

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() && isLoading) return;
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    abortedRef.current = false;

    await new Promise(resolve => setTimeout(resolve, 5000));
    if (abortedRef.current) return;

    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({ prompt: STENSOR_SYSTEM + "\n\nUser: " + text, model: 'gemini_3_flash' });
    } catch (err) {
      setIsLoading(false);
      setMessages([...newMessages, { role: 'assistant', content: "An error occurred." }]);
      return;
    }
    
    if (abortedRef.current) return;
    const content = typeof result === 'string' ? result : JSON.stringify(result);

    setIsLoading(false);
    playDoneSound(); // SON SATISFAISANT DE FIN
    
    if (!discussMode) {
      setIsPreviewFakeLoading(true);
      setTimeout(() => { setFicheContent(content); setIsPreviewFakeLoading(false); }, 1500);
    }
    
    const finalMsgs = [...newMessages, { role: 'assistant', content }];
    setMessages(finalMsgs);
    
    const titleToSave = convTitleDisplay || text.slice(0, 30);
    if (!convTitleDisplay) setConvTitleDisplay(titleToSave);
    
    saveToDiscussions(titleToSave, text);
    saveConversationMessages(convId, finalMsgs);
    syncConversationToCloud(convId, finalMsgs, { title: titleToSave, preview: text });

  }, [messages, discussMode, convId, convTitleDisplay, isLoading]);

  return (
    <div className="flex flex-col font-open h-screen w-full bg-white overflow-hidden [&::-webkit-scrollbar]:hidden">
      
      <WorkspaceHeader user={user} onUpgrade={() => setIframeModal({ open: true, url: '/pricing' })} isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 p-3 gap-3 overflow-hidden relative bg-[#F9FAFB]">

        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 420, opacity: 1 }} // CHAT PLUS LARGE (420px)
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="flex-shrink-0 flex flex-col overflow-hidden relative h-full bg-white rounded-[24px] shadow-sm border border-gray-100/50"
            >
              {/* APPLE MAC DOTS */}
              <div className="flex gap-2 px-5 pt-4 pb-1">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2 pb-4 [&::-webkit-scrollbar]:hidden">
                {isLoadingConversation && <div className="flex justify-center pt-10"><ChatLoadingAnimation /></div>}

                {!isLoadingConversation && messages.map((msg, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
                    {msg.role === 'assistant' ? <AssistantMessage content={msg.content} isGenerating={false} discussMode={discussMode} /> : <UserMessageBubble msg={msg} userName={user?.full_name?.split(' ')[0] || 'Me'} />}
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
                    <AssistantMessage content="" isGenerating={true} discussMode={discussMode} />
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex-shrink-0 flex flex-col p-3 pt-0">
                <ChatInputBar input={input} setInput={setInput} onSend={sendMessage} onStop={() => { abortedRef.current = true; setIsLoading(false); }} isLoading={isLoading} discussMode={discussMode} setDiscussMode={setDiscussMode} onOpenIframe={(url) => setIframeModal({ open: true, url })} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PREVIEW FULL SCREEN FLUIDE (Ne touche pas les bords grâce au gap-3 et padding du parent) */}
        <motion.div layout className="flex-1 flex flex-col bg-white border border-gray-200/60 rounded-[24px] overflow-hidden relative shadow-sm">
          <AnimatePresence>
            {isPreviewFakeLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-md">
                 <div className="flex flex-col items-center gap-4">
                   <svg className="w-8 h-8 animate-spin text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                   <span className="text-sm font-semibold text-gray-600 tracking-wide font-mono">Generating view...</span>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
          <FichePanel content={ficheContent} loading={false} link={`${window.location.origin}/p/${convId}`} />
        </motion.div>

      </div>

      <UpgradePlanModal open={iframeModal.open} url={iframeModal.url} onClose={() => setIframeModal({ open: false, url: '' })} />
    </div>
  );
}