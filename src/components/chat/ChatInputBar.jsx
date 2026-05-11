import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Mic, X, FileText,
  Wifi, WifiOff, Send, Brain, MessageCircle } from
'lucide-react';
import AISettingsModal from '@/components/settings/AISettingsModal';
import DragDropOverlay from '@/components/DragDropOverlay';
import FilePreviewPanel from '@/components/chat/FilePreviewPanel';
import { FG, YUZU } from '@/lib/chat-constants';
import { ALL_MODES } from '@/lib/modes-config';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';

const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024;
const MAX_VISIBLE_FILES = 1;

const popUp = {
  initial: { opacity: 0, y: 6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.97 },
  transition: { duration: 0.1 }
};

export default function ChatInputBar({
  input, setInput, onSend, onStop, isLoading, blocked,
  mode, setMode, currentAgent, setCurrentAgent,
  userPlan, canUploadFiles, canUploadExtended, hasInternet,
  useWebSearch, setUseWebSearch,
  files, setFiles,
  onUpgradeRequest,
  discussMode, setDiscussMode
}) {
  const { t } = useLanguage();
  const [showDNA, setShowDNA] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);

  const [showFilePanel, setShowFilePanel] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const fileMenuRef = useRef(null);

  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Close all menus when clicking outside
  useEffect(() => {
    const handler = (e) => {
      const refs = [fileMenuRef];
      if (!refs.some((r) => r.current?.contains(e.target))) {
        setShowFileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const closeAllMenus = () => {
    setShowFileMenu(false);
  };

  const isFree = !userPlan || userPlan.price_monthly === 0;
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
  const FREE_MOBILE_CHAR_LIMIT = 400;

  // Auto-expand textarea up to 4 lines
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineH = 24;
    const maxH = lineH * 4;
    ta.style.height = Math.min(ta.scrollHeight, maxH) + 'px';
    ta.style.overflowY = ta.scrollHeight > maxH ? 'auto' : 'hidden';
  }, [input]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (isFree && isMobileDevice && val.length > FREE_MOBILE_CHAR_LIMIT) return;
    setInput(val);
  };

  // Exclude 'thinking' (Standard) mode from selector
  const allowedModes = userPlan ?
  ALL_MODES.filter((m) => m.id !== 'thinking' && (userPlan.allowed_modes?.includes(m.id) || userPlan.allowed_modes?.includes('fast'))) :
  [ALL_MODES[ALL_MODES.length - 1]];

  const ModeIcon = mode.icon;
  const visibleFiles = files.slice(0, MAX_VISIBLE_FILES);
  const extraFiles = files.length > MAX_VISIBLE_FILES ? files.length - MAX_VISIBLE_FILES : 0;
  const acceptedFileTypes = canUploadExtended ?
  '.jpg,.jpeg,.png,.gif,.pdf,.txt,.csv,.xlsx,.docx' :
  '.jpg,.jpeg,.png,.gif,.txt,.csv';



  const handleFileAttach = () => {
    if (!canUploadFiles) {onUpgradeRequest(t('attach_file'));setShowFileMenu(false);return;}
    fileInputRef.current?.click();
    setShowFileMenu(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {recognitionRef.current?.stop();setIsRecording(false);setVoiceLoading(false);return;}

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error('Voice input not supported on this browser. Try Chrome or Safari.');
      return;
    }

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        toast.error('Microphone access denied. Please allow it in your browser settings.');
        return;
      }
    }

    finalTranscriptRef.current = '';
    const rec = new SR();
    rec.lang = navigator.language || 'fr-FR';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const finals = Array.from(e.results).filter((r) => r.isFinal).map((r) => r[0].transcript.trim()).join(' ');
      if (finals) finalTranscriptRef.current = finals;
    };
    rec.onerror = (e) => {
      if (e.error !== 'aborted') toast.error('Voice error: ' + e.error);
      setIsRecording(false);setVoiceLoading(false);
    };
    rec.onend = () => {
      setIsRecording(false);setVoiceLoading(false);
      const raw = finalTranscriptRef.current.trim();
      if (raw) {
        const isQ = /^(est-ce|qu'est|pourquoi|comment|quand|où|quel|quelle|combien|qui|que )/i.test(raw);
        let text = raw.charAt(0).toUpperCase() + raw.slice(1);
        if (!'.!?'.includes(text[text.length - 1])) text += isQ ? ' ?' : '.';
        setInput(text);
      }
      finalTranscriptRef.current = '';
    };
    try {
      setIsRecording(true);
      rec.start();
      recognitionRef.current = rec;
    } catch (err) {
      toast.error('Could not start microphone. Try again.');
      setIsRecording(false);
    }
  };

  return (
    <div
      className="px-3 sm:px-4 pb-2 pt-0 flex-shrink-0 relative w-full rounded-md"
      onDragEnter={(e) => {e.preventDefault();dragCounterRef.current++;setIsDragging(true);}}
      onDragLeave={(e) => {e.preventDefault();dragCounterRef.current--;if (dragCounterRef.current <= 0) {dragCounterRef.current = 0;setIsDragging(false);}}}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();dragCounterRef.current = 0;setIsDragging(false);
        const dropped = Array.from(e.dataTransfer.files || []);
        if (dropped.length === 0) return;
        if (!canUploadFiles) {onUpgradeRequest('Joindre un fichier');return;}
        setFiles((p) => [...p, ...dropped]);
      }}>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef} type="file" multiple className="hidden"
        accept={acceptedFileTypes}
        onChange={(e) => {
          const newFiles = Array.from(e.target.files || []);
          const currentSize = files.reduce((acc, f) => acc + f.size, 0);
          const newSize = newFiles.reduce((acc, f) => acc + f.size, 0);
          if (currentSize + newSize > MAX_TOTAL_FILE_SIZE) {
            toast.error('Total size exceeded (max 5 Mo)');
            return;
          }
          setFiles((p) => [...p, ...newFiles]);
        }} />
      

      <DragDropOverlay visible={isDragging} canUpload={canUploadFiles} />

      <div className="bg-white overflow-visible" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        {/* Attached files */}
        {files.length > 0 &&
        <div className="flex items-center gap-2 flex-wrap px-3 pt-3">
            {visibleFiles.map((file, idx) =>
          <div key={idx} className="relative flex items-center gap-2 px-2.5 py-1.5 group rounded-sm border border-border bg-muted/50" style={{ maxWidth: '120px' }}>
                <FileText className="w-3 h-3 flex-shrink-0" style={{ color: FG }} />
                <span className="text-[10px] font-medium truncate" style={{ color: FG }}>{file.name}</span>
                <button onClick={() => setFiles((p) => p.filter((_, i) => i !== idx))}
            className="w-3.5 h-3.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-sm">
                  <X className="w-2 h-2 text-muted-foreground" />
                </button>
              </div>
          )}
            {extraFiles > 0 &&
          <button onClick={() => setShowFilePanel(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black rounded-sm"
          style={{ background: FG, color: YUZU }}>
                ··· +{extraFiles}
              </button>
          }
          </div>
        }

        {/* Textarea */}
        <div className="px-4 pt-2 pb-1">
          <textarea
            ref={textareaRef} value={input} onChange={handleInputChange}
            onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault();onSend(input);}}}
            placeholder={blocked ? t('blocked_placeholder') : t('send_message')}
            disabled={blocked} rows={1}
            style={{ minHeight: '24px', maxHeight: '96px', resize: 'none', overflowY: 'hidden' }}
            className="w-full bg-transparent text-sm focus:outline-none leading-relaxed break-words text-foreground transition-all" />
          
          {isFree && isMobileDevice && input.length > 350 &&
          <p className="text-[10px] text-right mt-0.5 px-1" style={{ color: input.length >= FREE_MOBILE_CHAR_LIMIT ? '#ef4444' : '#aaa' }}>
              {input.length}/{FREE_MOBILE_CHAR_LIMIT}
            </p>
          }
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-3 gap-2">
          <div className="flex items-center gap-1">
            {/* AI DNA Settings */}
            <button onClick={() => setShowDNA(true)}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-muted"
            title="AI Settings (DNA)">
              <Brain className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {/* + File / Internet menu */}
            <div className="relative flex-shrink-0" ref={fileMenuRef}>
              <button onClick={() => {closeAllMenus();setShowFileMenu((s) => !s);}}
              className="w-7 h-7 rounded-sm flex items-center justify-center transition-colors hover:bg-muted">
                <Plus className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <AnimatePresence>
                {showFileMenu &&
                <motion.div {...popUp} className="absolute bottom-full mb-2 left-0 shadow-xl p-1.5 min-w-[190px] z-[300] bg-white rounded-sm border border-border">
                    {/* Attach file */}
                    <button onClick={handleFileAttach}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left rounded-sm hover:bg-muted"
                  style={{ color: canUploadFiles ? '#444' : '#bbb' }}>
                      <FileText className="w-3.5 h-3.5" style={{ color: canUploadFiles ? FG : '#ddd' }} />
                      <span>Attach file</span>
                      {!canUploadFiles &&
                    <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-sm" style={{ background: 'rgba(58,0,136,0.1)', color: '#3A0088' }}>Essential+</span>
                    }
                    </button>
                    {/* Web search toggle */}
                    <button onClick={() => {
                    if (!hasInternet) {onUpgradeRequest('Internet Search');setShowFileMenu(false);return;}
                    setUseWebSearch((w) => !w);setShowFileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors text-left rounded-sm hover:bg-muted"
                  style={{ color: hasInternet ? useWebSearch ? '#16a34a' : '#444' : '#bbb' }}>
                      {useWebSearch && hasInternet ?
                    <Wifi className="w-3.5 h-3.5" style={{ color: '#16a34a' }} /> :
                    <WifiOff className="w-3.5 h-3.5" style={{ color: hasInternet ? '#888' : '#ddd' }} />}
                      <span>Web Search</span>
                      {!hasInternet && <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">Advanced+</span>}
                      {hasInternet &&
                    <span className="ml-auto w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: useWebSearch ? '#16a34a' : '#ddd', background: useWebSearch ? '#16a34a' : 'transparent' }}>
                          {useWebSearch && <span className="text-white text-[8px]">✓</span>}
                        </span>
                    }
                    </button>
                  </motion.div>
                }
              </AnimatePresence>
            </div>

            {/* Discuss toggle */}
            <button
              onClick={() => setDiscussMode && setDiscussMode((d) => !d)}
              className="h-7 px-2.5 rounded-md flex items-center gap-1.5 text-[11px] font-semibold transition-all"
              style={{ background: discussMode ? FG : 'transparent', color: discussMode ? YUZU : '#555' }}>
              <MessageCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Discuss</span>
            </button>

          </div>

          {/* Right: mic + send */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={toggleRecording}
            className="relative w-8 h-8 rounded-sm flex items-center justify-center transition-all"
            style={{ background: isRecording || voiceLoading ? FG : 'rgba(0,0,0,0.05)' }}>
              {voiceLoading ?
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
              className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: YUZU }} /> :
              isRecording ?
              <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
              className="w-2.5 h-2.5 rounded-full" style={{ background: YUZU }} /> :

              <Mic className="w-3.5 h-3.5 text-muted-foreground" />
              }
            </button>

            {isLoading ?
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 h-8 rounded-sm font-black text-xs transition-all hover:opacity-85 animate-pulse"
              style={{ background: '#ef4444', color: 'white', cursor: 'pointer' }}
              title="Stop generation">
                <span className="w-2.5 h-2.5 rounded-sm bg-white flex-shrink-0" />
                Stop
              </button> :

            <button
              onClick={() => onSend(input)}
              disabled={!input.trim() || blocked}
              className="w-8 h-8 flex items-center justify-center rounded-sm transition-all"
              style={{
                background: input.trim() && !blocked ? FG : 'rgba(0,0,0,0.05)',
                cursor: !input.trim() || blocked ? 'not-allowed' : 'pointer'
              }}>
                <Send className="w-3.5 h-3.5" style={{ color: input.trim() && !blocked ? 'white' : '#ccc' }} />
              </button>
            }
          </div>
        </div>
      </div>

      <FilePreviewPanel
        files={files} open={showFilePanel}
        onClose={() => setShowFilePanel(false)}
        onRemove={(idx) => setFiles((p) => p.filter((_, i) => i !== idx))} />
      

      
      <AISettingsModal open={showDNA} onClose={() => setShowDNA(false)} />
    </div>);

}