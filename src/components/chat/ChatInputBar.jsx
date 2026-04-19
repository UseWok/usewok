import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Mic, X, FileText, Bot, ChevronDown,
  Crown, Wifi, WifiOff, Send
} from 'lucide-react';
import DragDropOverlay from '@/components/DragDropOverlay';
import FilePreviewPanel from '@/components/chat/FilePreviewPanel';
import ChatAtMenu from '@/components/chat/ChatAtMenu';
import { ALL_MODES, FG, YUZU } from '@/lib/chat-constants';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';

const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024;
const MAX_VISIBLE_FILES = 1;

const popUp = {
  initial: { opacity: 0, y: 6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.97 },
  transition: { duration: 0.1 },
};

export default function ChatInputBar({
  input, setInput, onSend, isLoading, blocked,
  mode, setMode, currentAgent, setCurrentAgent,
  userPlan, canUploadFiles, canUploadExtended, hasInternet,
  useWebSearch, setUseWebSearch,
  files, setFiles,
  onUpgradeRequest,
}) {
  const { t } = useLanguage();
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showAtMenu, setShowAtMenu] = useState(false);
  const [showFilePanel, setShowFilePanel] = useState(false);
  const [atQuery, setAtQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const agentMenuRef = useRef(null);
  const fileMenuRef = useRef(null);
  const atMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Close all menus when clicking outside
  useEffect(() => {
    const handler = (e) => {
      const refs = [agentMenuRef, fileMenuRef, atMenuRef];
      if (!refs.some(r => r.current?.contains(e.target))) {
        setShowAgentMenu(false);
        setShowFileMenu(false);
        setShowAtMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeAllMenus = () => {
    setShowAgentMenu(false);
    setShowFileMenu(false);
  };

  const AGENTS = [
    { id: 'global', label: "Knowing exactly where I'm going" },
    { id: 'emotions-depenses', label: 'Spend without guilt' },
    { id: 'wealth-strategy', label: 'Becoming financially free' },
  ];

  const allowedModes = userPlan
    ? ALL_MODES.filter(m => userPlan.allowed_modes?.includes(m.id) || (m.id === 'thinking' && userPlan.allowed_modes?.includes('fast')))
    : [ALL_MODES[ALL_MODES.length - 1]];

  const agentLabel = AGENTS.find(a => a.id === currentAgent)?.label || 'Global Agent';
  const ModeIcon = mode.icon;
  const visibleFiles = files.slice(0, MAX_VISIBLE_FILES);
  const extraFiles = files.length > MAX_VISIBLE_FILES ? files.length - MAX_VISIBLE_FILES : 0;
  const acceptedFileTypes = canUploadExtended
    ? '.jpg,.jpeg,.png,.gif,.txt,.csv,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.mp3,.mp4,.json,.html,.xml,.md'
    : '.jpg,.jpeg,.png,.gif,.txt,.csv';

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && (lastAt === val.length - 1 || !val.slice(lastAt + 1).includes(' '))) {
      setAtQuery(val.slice(lastAt + 1).toLowerCase());
      setShowAtMenu(true);
    } else {
      setShowAtMenu(false);
    }
  };

  const selectAtAgent = (agent) => {
    let cleaned = AGENTS.reduce((q, a) => q.replace(new RegExp(`@${a.label}\\s*`, 'g'), ''), input);
    const lastAt = cleaned.lastIndexOf('@');
    const base = lastAt !== -1 ? cleaned.slice(0, lastAt) : cleaned;
    setInput(base + `@${agent.label} `);
    setCurrentAgent(agent.id);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const selectAtMode = (m) => {
    if (!userPlan?.allowed_modes?.includes(m.id)) {
      onUpgradeRequest(`Mode ${m.label}`);
      return;
    }
    let cleaned = ALL_MODES.reduce((q, md) => q.replace(new RegExp(`@${md.label}\\s*`, 'g'), ''), input);
    const lastAt = cleaned.lastIndexOf('@');
    const base = lastAt !== -1 ? cleaned.slice(0, lastAt) : cleaned;
    setInput(base + `@${m.label} `);
    setMode(m);
    setShowAtMenu(false);
    textareaRef.current?.focus();
  };

  const handleFileAttach = () => {
    if (!canUploadFiles) { onUpgradeRequest(t('attach_file')); setShowFileMenu(false); return; }
    fileInputRef.current?.click();
    setShowFileMenu(false);
  };

  const toggleRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); setVoiceLoading(true); return; }
    finalTranscriptRef.current = '';
    const rec = new SR();
    rec.lang = 'fr-FR'; rec.continuous = true; rec.interimResults = false;
    rec.onresult = (e) => {
      const finals = Array.from(e.results).filter(r => r.isFinal).map(r => r[0].transcript.trim()).join(' ');
      if (finals) finalTranscriptRef.current = finals;
    };
    rec.onend = () => {
      setIsRecording(false); setVoiceLoading(false);
      const raw = finalTranscriptRef.current.trim();
      if (raw) {
        const isQ = /^(est-ce|qu'est|pourquoi|comment|quand|où|quel|quelle|combien|qui|que )/i.test(raw);
        let text = raw.charAt(0).toUpperCase() + raw.slice(1);
        if (!'.!?'.includes(text[text.length - 1])) text += isQ ? ' ?' : '.';
        setInput(text);
      }
      finalTranscriptRef.current = '';
    };
    rec.start(); recognitionRef.current = rec; setIsRecording(true);
  };

  const filteredAgents = AGENTS.filter(a => a.label.toLowerCase().includes(atQuery));
  const filteredModes = ALL_MODES.filter(m => m.label.toLowerCase().includes(atQuery));

  return (
    <div
      className="px-3 sm:px-4 pb-2 pt-1 flex-shrink-0 relative max-w-3xl mx-auto w-full"
      onDragEnter={e => { e.preventDefault(); dragCounterRef.current++; setIsDragging(true); }}
      onDragLeave={e => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setIsDragging(false); } }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault(); dragCounterRef.current = 0; setIsDragging(false);
        const dropped = Array.from(e.dataTransfer.files || []);
        if (dropped.length === 0) return;
        if (!canUploadFiles) { onUpgradeRequest('Joindre un fichier'); return; }
        setFiles(p => [...p, ...dropped]);
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef} type="file" multiple className="hidden"
        accept={acceptedFileTypes}
        onChange={e => {
          const newFiles = Array.from(e.target.files || []);
          const currentSize = files.reduce((acc, f) => acc + f.size, 0);
          const newSize = newFiles.reduce((acc, f) => acc + f.size, 0);
          if (currentSize + newSize > MAX_TOTAL_FILE_SIZE) {
            toast.error('Taille totale dépassée (max 20 Mo)');
            return;
          }
          setFiles(p => [...p, ...newFiles]);
        }}
      />

      {/* @ menu */}
      <ChatAtMenu
        open={showAtMenu}
        atMenuRef={atMenuRef}
        agents={AGENTS}
        filteredAgents={filteredAgents}
        filteredModes={filteredModes}
        currentAgent={currentAgent}
        currentMode={mode}
        userPlan={userPlan}
        onSelectAgent={selectAtAgent}
        onSelectMode={selectAtMode}
      />

      <DragDropOverlay visible={isDragging} canUpload={canUploadFiles} />

      <div className="bg-white overflow-visible rounded-md border border-border shadow-md">
        {/* Attached files */}
        {files.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap px-3 pt-3">
            {visibleFiles.map((file, idx) => (
              <div key={idx} className="relative flex items-center gap-2 px-2.5 py-1.5 group rounded-sm border border-border bg-muted/50" style={{ maxWidth: '120px' }}>
                <FileText className="w-3 h-3 flex-shrink-0" style={{ color: FG }} />
                <span className="text-[10px] font-medium truncate" style={{ color: FG }}>{file.name}</span>
                <button onClick={() => setFiles(p => p.filter((_, i) => i !== idx))}
                  className="w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-sm">
                  <X className="w-2 h-2 text-muted-foreground" />
                </button>
              </div>
            ))}
            {extraFiles > 0 && (
              <button onClick={() => setShowFilePanel(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black rounded-sm"
                style={{ background: FG, color: YUZU }}>
                ··· +{extraFiles}
              </button>
            )}
          </div>
        )}

        {/* Textarea */}
        <div className="px-4 pt-2 pb-1">
          <textarea
            ref={textareaRef} value={input} onChange={handleInputChange}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(input); } }}
            placeholder={blocked ? t('blocked_placeholder') : t('send_message')}
            disabled={blocked} rows={1}
            className="w-full resize-none bg-transparent text-sm focus:outline-none leading-relaxed break-words text-foreground"
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-3 gap-2">
          <div className="flex items-center gap-0.5">

            {/* + File / Internet menu */}
            <div className="relative flex-shrink-0" ref={fileMenuRef}>
              <button onClick={() => { closeAllMenus(); setShowFileMenu(s => !s); }}
                className="w-7 h-7 rounded-sm flex items-center justify-center transition-colors hover:bg-muted">
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {showFileMenu && (
                  <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 shadow-xl p-1.5 min-w-[190px] z-[300] bg-white rounded-sm border border-border">
                    {/* Attach file */}
                    <button onClick={handleFileAttach}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left rounded-sm hover:bg-muted"
                      style={{ color: canUploadFiles ? '#444' : '#bbb' }}>
                      <FileText className="w-3.5 h-3.5" style={{ color: canUploadFiles ? FG : '#ddd' }} />
                      <span>Attach file</span>
                      {!canUploadFiles && (
                        <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-sm" style={{ background: 'rgba(58,0,136,0.1)', color: '#3A0088' }}>Essential+</span>
                      )}
                    </button>
                    {/* Web search toggle */}
                    <button onClick={() => {
                      if (!hasInternet) { onUpgradeRequest('Internet Search'); setShowFileMenu(false); return; }
                      setUseWebSearch(w => !w); setShowFileMenu(false);
                    }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left rounded-sm hover:bg-muted"
                      style={{ color: hasInternet ? (useWebSearch ? '#16a34a' : '#444') : '#bbb' }}>
                      {useWebSearch && hasInternet
                        ? <Wifi className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
                        : <WifiOff className="w-3.5 h-3.5" style={{ color: hasInternet ? '#888' : '#ddd' }} />}
                      <span>Web Search</span>
                      {!hasInternet && <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">Advanced+</span>}
                      {hasInternet && (
                        <span className="ml-auto w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0"
                          style={{ borderColor: useWebSearch ? '#16a34a' : '#ddd', background: useWebSearch ? '#16a34a' : 'transparent' }}>
                          {useWebSearch && <span className="text-white text-[8px]">✓</span>}
                        </span>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Agent */}
            <div className="relative flex-shrink-0" ref={agentMenuRef}>
              <button onClick={() => { if (isLoading) return; closeAllMenus(); setShowAgentMenu(s => !s); }}
                disabled={isLoading}
                className="h-7 px-2 rounded-sm flex items-center gap-1 transition-colors hover:bg-muted">
                <Bot className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] font-medium hidden sm:block text-muted-foreground">
                  {agentLabel?.split(' ')[0] || 'Agent'}
                </span>
                <ChevronDown className="w-2.5 h-2.5 text-muted-foreground/60" />
              </button>
              <AnimatePresence>
                {showAgentMenu && (
                  <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 shadow-xl p-1.5 min-w-[190px] z-[300] bg-white rounded-sm border border-border">
                    {AGENTS.map(a => (
                      <button key={a.id} onClick={() => { setCurrentAgent(a.id); setShowAgentMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left rounded-sm"
                        style={{ color: currentAgent === a.id ? FG : '#666', background: currentAgent === a.id ? YUZU : 'transparent' }}
                        onMouseEnter={e => { if (currentAgent !== a.id) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                        onMouseLeave={e => { if (currentAgent !== a.id) e.currentTarget.style.background = 'transparent'; }}>
                        <Bot className="w-3 h-3" /> <span className="font-medium">{a.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Expert mode toggle */}
            {userPlan?.allowed_modes?.includes('ultimate') && (
              <button
                onClick={() => {
                  const expertMode = ALL_MODES.find(m => m.id === 'ultimate');
                  const autoMode = ALL_MODES.find(m => m.id === 'thinking');
                  setMode(mode.id === 'ultimate' ? autoMode : expertMode);
                }}
                disabled={isLoading}
                className="h-7 px-2 rounded-sm flex items-center gap-1.5 transition-colors hover:bg-muted"
                style={{ background: mode.id === 'ultimate' ? 'rgba(221,255,0,0.15)' : 'transparent' }}>
                <Crown className="w-3 h-3" style={{ color: mode.id === 'ultimate' ? FG : '#bbb' }} />
                <span className="text-[11px] font-semibold hidden sm:block" style={{ color: mode.id === 'ultimate' ? FG : '#bbb' }}>Expert</span>
              </button>
            )}
          </div>

          {/* Right: mic + send */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={toggleRecording}
              className="relative w-8 h-8 rounded-sm flex items-center justify-center transition-all"
              style={{ background: isRecording || voiceLoading ? FG : 'rgba(0,0,0,0.05)' }}>
              {voiceLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                  className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: YUZU }} />
              ) : isRecording ? (
                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                  className="w-2.5 h-2.5 rounded-full" style={{ background: YUZU }} />
              ) : (
                <Mic className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>

            <button
              onClick={() => onSend(input)}
              disabled={!input.trim() || isLoading || blocked}
              className="w-8 h-8 flex items-center justify-center rounded-sm transition-all"
              style={{
                background: input.trim() && !isLoading && !blocked ? FG : 'rgba(0,0,0,0.05)',
                cursor: !input.trim() || isLoading || blocked ? 'not-allowed' : 'pointer',
              }}>
              <Send className="w-3.5 h-3.5" style={{ color: input.trim() && !isLoading && !blocked ? 'white' : '#ccc' }} />
            </button>
          </div>
        </div>
      </div>

      <FilePreviewPanel
        files={files} open={showFilePanel}
        onClose={() => setShowFilePanel(false)}
        onRemove={idx => setFiles(p => p.filter((_, i) => i !== idx))}
      />

      <p className="text-center mt-1 text-[9px] text-muted-foreground">{t('ai_disclaimer')}</p>
    </div>
  );
}