/**
 * ChatInputBar — WOK Premium Chat Input
 *
 * DESIGN RULES:
 * - ALL dropdowns open UPWARD.
 * - Model selector with families (Claude, ChatGPT, Gemini)
 * - Send button is replaced by the selected model's logo.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Mic, MicOff, ChevronDown, Check, Lock, Upload, X, FileText, Target, Zap } from 'lucide-react';
import { getBuildMode, setBuildMode as setGlobalBuildMode } from '@/lib/build-mode-store';
import { getPlanFeatures } from '@/lib/plans-config';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────
// LOGOS
// ─────────────────────────────────────────────────────────────────

const ClaudeLogo = ({ size = 16 }) => (
  <img src="https://www.anthropic.com/images/icons/apple-touch-icon.png" alt="Claude"
    style={{ width: size, height: size, borderRadius: 4, objectFit: 'contain', flexShrink: 0 }} />
);
const OpenAILogo = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.897zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.681zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>
);
const GeminiLogo = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="gem-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4285F4"/>
        <stop offset="50%" stopColor="#9B72CB"/>
        <stop offset="100%" stopColor="#D96570"/>
      </linearGradient>
    </defs>
    <path d="M12 2C12 2 14 8 20 12C14 16 12 22 12 22C12 22 10 16 4 12C10 8 12 2 12 2Z" fill="url(#gem-g)"/>
  </svg>
);
const AutoLogo = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3L13.5 9H19.5L14.5 13L16.5 19L12 15.5L7.5 19L9.5 13L4.5 9H10.5L12 3Z" fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
);

const GoogleGLogo = ({ size = 16 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, flexShrink: 0 }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  </span>
);

const MODEL_FAMILIES = [
  { id: 'automatic', name: 'Automatic', desc: 'Combinaison intelligente', logo: 'auto', isAuto: true },
  { id: 'claude-opus-48', name: 'Claude Opus 4.8', logo: 'claude' },
  { id: 'claude-sonnet-46', name: 'Claude Sonnet 4.6', logo: 'claude' },
  { id: 'chatgpt-55', name: 'ChatGPT 5.5', logo: 'openai' },
  { id: 'chatgpt-50', name: 'ChatGPT 5.0', logo: 'openai' },
  { id: 'gemini-advanced', name: 'Gemini Advanced', logo: 'gemini' },
];

function ModelLogo({ type, size = 16 }) {
  if (type === 'claude') return <ClaudeLogo size={size} />;
  if (type === 'openai') return <OpenAILogo size={size} />;
  if (type === 'gemini') return <GeminiLogo size={size} />;
  return <AutoLogo size={size} />;
}

// ─────────────────────────────────────────────────────────────────
// IOS-STYLE MIC ANIMATION
// ─────────────────────────────────────────────────────────────────
function IOSMicVisualizer({ analyserRef, duration }) {
  const [level, setLevel] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const analyser = analyserRef.current;
      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(Math.min(1, avg / 80));
      }
    };
    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyserRef]);

  const ringScale = 1 + level * 0.6;
  const ring2Scale = 1 + level * 1.1;

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: 52 }}>
      <motion.div animate={{ scale: ring2Scale, opacity: 0.12 + level * 0.15 }} transition={{ duration: 0.08 }}
        style={{ position: 'absolute', width: 52, height: 52, borderRadius: '50%', background: `radial-gradient(circle, rgba(0,0,0,${0.3 + level * 0.5}) 0%, transparent 70%)` }} />
      <motion.div animate={{ scale: ringScale, opacity: 0.25 + level * 0.3 }} transition={{ duration: 0.06 }}
        style={{ position: 'absolute', width: 38, height: 38, borderRadius: '50%', background: `radial-gradient(circle, rgba(0,0,0,${0.5 + level * 0.4}) 0%, transparent 70%)` }} />
      <motion.div animate={{ scale: 1 + level * 0.12 }} transition={{ duration: 0.06 }}
        style={{ position: 'relative', width: 28, height: 28, borderRadius: '50%', background: `rgba(0,0,0,${0.9 + level * 0.1})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${8 + level * 20}px rgba(0,0,0,${0.3 + level * 0.5})` }}>
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#EF4444' }} />
        <Mic style={{ width: 13, height: 13, color: '#fff' }} />
      </motion.div>
      <span style={{ position: 'absolute', right: 0, fontSize: 12, fontWeight: 600, color: '#555', fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>
        {`${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// OBJECTIF & COMPÉTENCE BUTTONS
// ─────────────────────────────────────────────────────────────────
function ObjectifButton({ active, onToggle }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.12 }}
            style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: '#1A1A1A', color: '#fff', fontSize: 12, lineHeight: 1.5, padding: '8px 12px', borderRadius: 8, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 100, pointerEvents: 'none', textAlign: 'center' }}>
            Le mode objectif améliore la qualité,<br />consomme plus de crédits
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={onToggle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(0,0,0,0.10)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}
        onMouseEnterCapture={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'} onMouseLeaveCapture={e => e.currentTarget.style.background = 'transparent'}>
        <Target style={{ width: 14, height: 14, color: active ? '#3B82F6' : 'rgba(0,0,0,0.45)' }} />
      </button>
    </div>
  );
}

function CompetenceButton({ selected, onClick }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <span style={{ position: 'absolute', top: -6, right: -4, zIndex: 2, fontSize: 8, fontWeight: 600, letterSpacing: '0.03em', padding: '1px 4px', borderRadius: 999, background: 'rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.35)', pointerEvents: 'none', lineHeight: 1.5 }}>
        À venir
      </span>
      <button onClick={onClick}
        style={{ height: 30, paddingLeft: 8, paddingRight: 8, display: 'flex', alignItems: 'center', gap: 5, borderRadius: 8, border: '1px solid rgba(0,0,0,0.10)', background: selected ? 'rgba(221,255,0,0.12)' : 'transparent', cursor: 'pointer', fontSize: 12, color: 'rgba(0,0,0,0.55)', transition: 'background 120ms' }}
        onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }} onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}>
        <Zap style={{ width: 12, height: 12, color: selected ? '#0A0A0A' : 'rgba(0,0,0,0.5)' }} />
        <span style={{ fontWeight: selected ? 600 : 400 }}>Compétence</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function ChatInputBar({
  input, setInput, onSend, onStop, isLoading,
  files = [], setFiles,
  buildMode: externalBuildMode,
  user,
  _extraTextareaPaddingLeft = 0,
}) {
  const planFeatures = getPlanFeatures(user);
  const [selectedModel, setSelectedModel] = useState('automatic');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [objectifActive, setObjectifActive] = useState(false);
  const [competenceSelected, setCompetenceSelected] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [micDenied, setMicDenied] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const modelMenuRef = useRef(null);
  const plusMenuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Sync external mode if needed
  useEffect(() => {
    if (externalBuildMode) {
      if (externalBuildMode === 'Max') setSelectedModel('claude-opus-48');
      else if (externalBuildMode === 'Flash') setSelectedModel('claude-sonnet-46');
      else setSelectedModel('automatic');
    }
  }, [externalBuildMode]);

  // Click outside to close menus
  useEffect(() => {
    const h = (e) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) setShowModelMenu(false);
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) setShowPlusMenu(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Auto-resize textarea
  const MAX_TEXTAREA_H = 240;
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const newH = Math.min(el.scrollHeight, MAX_TEXTAREA_H);
    el.style.height = `${Math.max(24, newH)}px`;
    el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_H ? 'auto' : 'hidden';
  }, [input]);

  const handleSend = () => {
    if (!isLoading && (input.trim() || (files?.length || 0) > 0)) {
      // Map back to internal modes for backend compatibility if necessary
      const bMode = selectedModel === 'automatic' ? 'Automatic' : (selectedModel.includes('opus') ? 'Max' : 'Flash');
      onSend(input, { files, buildMode: bMode, searchActive, selectedModel });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = (e) => {
    const dropped = Array.from(e.target.files || []);
    if (dropped.length) setFiles(p => [...(p || []), ...dropped.map(f => ({ file: f, name: f.name, url: URL.createObjectURL(f), type: f.type }))]);
    setShowPlusMenu(false);
  };

  const handleEnhancePrompt = async () => {
    if (!input.trim() || isEnhancing) return;
    setIsEnhancing(true); setShowPlusMenu(false);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        model: 'gpt_5_mini',
        prompt: `Rewrite this user prompt to be highly optimized, clear, and specific for an AI UI builder. Output ONLY the rewritten prompt in English, under 150 characters. No explanation, no quotes, no prefix.\n\nOriginal: "${input.trim()}"`,
      });
      if (typeof result === 'string' && result.trim()) setInput(result.trim().slice(0, 200));
    } catch {
      toast.error('Could not enhance prompt.', { style: { background: '#3F3F46', color: '#fff', borderRadius: '999px' } });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Mic recording logic
  const handleMicClick = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicDenied(false); streamRef.current = stream; chunksRef.current = [];
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser(); analyser.fftSize = 256;
      source.connect(analyser); analyserRef.current = analyser;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start(100); setIsRecording(true); setRecordingDuration(0);
      timerRef.current = setInterval(() => setRecordingDuration(d => d + 1), 1000);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicDenied(true); toast.error('Microphone access denied.', { style: { background: '#3F3F46', color: '#fff', borderRadius: '999px' } });
      }
    }
  };
  const stopStream = () => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
    audioCtxRef.current?.close(); audioCtxRef.current = null; analyserRef.current = null;
  };
  const handleDiscardRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    stopStream(); setIsRecording(false); setRecordingDuration(0); chunksRef.current = [];
  };
  const handleConfirmRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    stopStream(); setIsRecording(false); setRecordingDuration(0);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));
  const hasContent = !!(input.trim() || (files?.length || 0) > 0);
  const activeModel = MODEL_FAMILIES.find(m => m.id === selectedModel) || MODEL_FAMILIES[0];
  const canUpload = !!(planFeatures?.file_upload);
  const hasInternet = !!(planFeatures?.web_search);

  return (
    <div style={{ padding: '0 8px 8px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ── File previews ── */}
      <AnimatePresence>
        {(files?.length || 0) > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8, maxHeight: 200, overflowY: 'auto', padding: '0 8px' }}>
            {files.map((file, i) => (
              <motion.div key={`${file.name}-${i}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#EFEFED', borderRadius: 12, padding: '7px 10px', border: '1px solid #E0E0DC' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#E0E0DC' }}>
                  {file.type?.startsWith('image/') ? (
                    <img src={file.url} style={{ objectFit: 'cover', width: '100%', height: '100%' }} alt="preview" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText style={{ width: 14, height: 14, color: '#999' }} />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#555', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <button onClick={() => removeFile(i)} style={{ width: 20, height: 20, background: 'transparent', color: '#AAA', borderRadius: 999, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#333'} onMouseLeave={e => e.currentTarget.style.color = '#AAA'}>
                  <X style={{ width: 12, height: 12 }} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main input card ── */}
      <div style={{ background: '#F7F7F5', border: '1.5px solid #DDDDD9', borderRadius: 22, overflow: 'visible', position: 'relative' }}>
        
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <IOSMicVisualizer analyserRef={analyserRef} duration={recordingDuration} />
            </motion.div>
          ) : (
            <motion.div key="textarea" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div style={{ padding: '14px 16px 0', paddingLeft: _extraTextareaPaddingLeft > 0 ? `${_extraTextareaPaddingLeft}px` : '16px' }}>
                <textarea ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  style={{
                    width: '100%', background: 'transparent', outline: 'none', border: 'none',
                    resize: 'none', fontSize: 14, color: '#111', lineHeight: '24px', height: '24px',
                    maxHeight: '288px', overflowY: 'hidden',
                    fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
                    WebkitFontSmoothing: 'antialiased', boxSizing: 'border-box', display: 'block',
                  }}
                  className="placeholder:text-[#AAA] textarea-custom-scroll"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', gap: 5 }}>
          
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*,application/pdf" onChange={handleFileChange} />

          {!isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              
              {/* Plus Menu */}
              <div ref={plusMenuRef} style={{ position: 'relative' }}>
                <button onClick={() => setShowPlusMenu(!showPlusMenu)}
                  style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(0,0,0,0.10)', background: showPlusMenu ? 'rgba(0,0,0,0.06)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = showPlusMenu ? 'rgba(0,0,0,0.06)' : 'transparent'}>
                  <Plus style={{ width: 14, height: 14, color: 'rgba(0,0,0,0.5)' }} />
                </button>
                <AnimatePresence>
                  {showPlusMenu && (
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.12 }}
                      style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, minWidth: 240, boxShadow: '0 16px 48px rgba(0,0,0,0.13)', zIndex: 200, overflow: 'hidden' }}>
                      <button onClick={handleEnhancePrompt} disabled={isEnhancing || !input.trim()}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'none', border: 'none', cursor: input.trim() ? 'pointer' : 'default', opacity: input.trim() ? 1 : 0.45 }}
                        onMouseEnter={e => { if (input.trim()) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <AutoLogo size={16} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{isEnhancing ? 'Amélioration…' : 'Améliorer le prompt'}</span>
                        </div>
                      </button>
                      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '0 12px' }} />
                      <button onClick={() => { if (canUpload) { fileInputRef.current?.click(); } }} disabled={!canUpload}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'none', border: 'none', cursor: canUpload ? 'pointer' : 'default', opacity: canUpload ? 1 : 0.45 }}
                        onMouseEnter={e => { if (canUpload) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <Upload style={{ width: 14, height: 14, color: '#6366F1' }} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>Importer depuis l'ordinateur</span>
                        </div>
                        {!canUpload && <Lock style={{ width: 11, height: 11, color: '#888' }} />}
                      </button>
                      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '0 12px' }} />
                      <button onClick={() => { if (hasInternet) { setSearchActive(v => !v); setShowPlusMenu(false); } }} disabled={!hasInternet}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', background: 'none', border: 'none', cursor: hasInternet ? 'pointer' : 'default', opacity: hasInternet ? 1 : 0.45 }}
                        onMouseEnter={e => { if (hasInternet) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <GoogleGLogo size={14} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>Rechercher sur Google</span>
                          {hasInternet && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: searchActive ? '#111' : 'rgba(0,0,0,0.07)', color: searchActive ? '#fff' : '#888' }}>
                              {searchActive ? 'ON' : 'OFF'}
                            </span>
                          )}
                        </div>
                        {!hasInternet && <Lock style={{ width: 11, height: 11, color: '#888' }} />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Objectif & Compétence */}
              <ObjectifButton active={objectifActive} onToggle={() => setObjectifActive(v => !v)} />
              <CompetenceButton selected={competenceSelected} onClick={() => setCompetenceSelected(v => !v)} />

            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* ── RIGHT: Model Selector / Send / Mic ── */}
          {isRecording ? (
            <>
              <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={handleDiscardRecording}
                style={{ width: 30, height: 30, borderRadius: 999, background: 'transparent', border: '1px solid #444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', flexShrink: 0 }}>
                <X style={{ width: 13, height: 13 }} />
              </motion.button>
              <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 }} onClick={handleConfirmRecording}
                style={{ width: 30, height: 30, borderRadius: 999, background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check style={{ width: 14, height: 14, color: '#fff' }} />
              </motion.button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Model Selector Dropdown */}
              <div ref={modelMenuRef} style={{ position: 'relative' }}>
                <button onClick={() => setShowModelMenu(v => !v)}
                  style={{ height: 30, padding: '0 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.10)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.65)', transition: 'background 120ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <ModelLogo type={activeModel.logo} size={14} />
                  <span>{activeModel.name.replace('Claude ', '').replace('ChatGPT ', '')}</span>
                  <ChevronDown style={{ width: 11, height: 11, opacity: 0.5 }} />
                </button>

                <AnimatePresence>
                  {showModelMenu && (
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.12 }}
                      style={{ position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 14, padding: 6, minWidth: 260, boxShadow: '0 12px 40px rgba(0,0,0,0.14)', zIndex: 999 }}>
                      <div style={{ padding: '6px 12px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Modèles</span>
                      </div>
                      {MODEL_FAMILIES.map((m) => {
                        const isAuto = m.isAuto;
                        return (
                          <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelMenu(false); }}
                            style={{ width: '100%', display: 'flex', alignItems: isAuto ? 'flex-start' : 'center', gap: 10, padding: isAuto ? '10px 12px' : '8px 12px', background: isAuto ? 'rgba(99,102,241,0.04)' : 'transparent', border: 'none', borderRadius: 9, cursor: 'pointer', textAlign: 'left', marginBottom: isAuto ? 6 : 0, transition: 'background 100ms' }}
                            onMouseEnter={e => e.currentTarget.style.background = isAuto ? 'rgba(99,102,241,0.08)' : 'rgba(0,0,0,0.04)'} onMouseLeave={e => e.currentTarget.style.background = isAuto ? 'rgba(99,102,241,0.04)' : 'transparent'}>
                            <div style={{ flexShrink: 0, marginTop: isAuto ? 2 : 0 }}><ModelLogo type={m.logo} size={isAuto ? 16 : 14} /></div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 13, fontWeight: isAuto ? 600 : 500, color: isAuto ? '#6366F1' : '#1A1A1A', display: 'block', lineHeight: 1.3 }}>{m.name}</span>
                              {isAuto && m.desc && <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.42)', lineHeight: 1.4, display: 'block', marginTop: 2 }}>{m.desc}</span>}
                            </div>
                            {selectedModel === m.id && (
                              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check style={{ width: 10, height: 10, color: '#fff' }} /></div>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mic button */}
              <button onClick={handleMicClick}
                style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'transparent', transition: 'background 120ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {micDenied ? <MicOff style={{ width: 14, height: 14, color: '#EF4444' }} /> : <Mic style={{ width: 14, height: 14, color: 'rgba(0,0,0,0.5)' }} />}
              </button>

              {/* Send Button replaces old arrow with Model Logo */}
              {isLoading ? (
                <button onClick={onStop} style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: 'rgba(0,0,0,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 10, height: 10, background: '#333', borderRadius: 3 }} />
                </button>
              ) : (
                <button onClick={handleSend} disabled={!hasContent}
                  style={{
                    flexShrink: 0, width: 30, height: 30, borderRadius: 8,
                    background: hasContent ? (activeModel.isAuto ? '#6366F1' : '#111') : 'rgba(0,0,0,0.04)',
                    border: 'none', cursor: hasContent ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 120ms', color: hasContent ? '#fff' : 'rgba(0,0,0,0.2)'
                  }}>
                  {hasContent ? (
                    <ModelLogo type={activeModel.logo} size={14} />
                  ) : (
                    <ModelLogo type={activeModel.logo} size={14} />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}