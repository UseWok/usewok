/**
 * ChatInputBar — WOK Premium Chat Input
 *
 * DESIGN RULES:
 * - dropDirection="up"   → dropdowns open UPWARD  (Chat page)
 * - dropDirection="down" → dropdowns open DOWNWARD (Home page)
 * - Buttons: light background, subtle border, dark icons (img1 style)
 * - Border: clean white card with soft border (img2 style)
 * - Enter to send, Shift+Enter for newline
 */

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Mic, MicOff, ChevronDown, Check, Lock, Upload, X, FileText } from 'lucide-react';
import { getPlanFeatures } from '@/lib/plans-config';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import GoogleDrivePickerModal from '@/components/chat/GoogleDrivePickerModal';

// ─────────────────────────────────────────────────────────────────
// LOGOS
// ─────────────────────────────────────────────────────────────────

// ✦ 5-pointed hollow star for Automatic model
const StarIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// Gemini logo — official Google 'G' logo
const GeminiLogoImg = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
  </svg>
);

// Google logo for Search Google button
const GoogleSearchLogo = ({ size = 15 }) => (
  <img
    src="https://media.base44.com/images/public/6a2edc91082e534601118582/c7b1866aa_image.png"
    width={size} height={size}
    style={{ flexShrink: 0, objectFit: 'contain' }}
    alt="Google"
  />
);

// OpenAI / ChatGPT logo
const OpenAILogo = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.897zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.402-.681zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>
);

// Google Drive logo — custom SVG
const DriveLogo = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 87.3 78" style={{ flexShrink: 0 }}>
    <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0a15.92 15.92 0 001.55 7.27z" fill="#0066da"/>
    <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.55 48.75A15.96 15.96 0 000 56h27.5z" fill="#00ac47"/>
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c1-1.7 1.55-3.65 1.55-7.5H60.1l5.85 11.65z" fill="#ea4335"/>
    <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.85 0H34.45c-1.65 0-3.2.45-4.55 1.2z" fill="#00832d"/>
    <path d="M59.8 56H27.5L13.75 79.8c1.35.8 2.9 1.2 4.55 1.2h50.7c1.65 0 3.2-.45 4.55-1.2z" fill="#2684fc"/>
    <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 60.1 56h27.45a16.1 16.1 0 00-1.55-7.27z" fill="#ffba00"/>
  </svg>
);

// Claude logo — rendered 1.6× larger, no white bg
const ClaudeLogo = ({ size = 16 }) => {
  const s = Math.round(size * 1.6);
  return (
    <img
      src="https://media.base44.com/images/public/6a2edc91082e534601118582/e6e91cbc5_image.png"
      width={s} height={s}
      style={{ flexShrink: 0, objectFit: 'contain', mixBlendMode: 'multiply' }}
      alt="Claude"
    />
  );
};

const AutoLogo = ({ size = 16 }) => <StarIcon size={size} />;
const GeminiLogo = ({ size = 16 }) => <GeminiLogoImg size={size} />;

// Crosshair / Focus SVG for "Objectif"
const CrosshairIcon = ({ size = 14, color = 'rgba(0,0,0,0.45)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="7"/>
    <line x1="12" y1="2" x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2" y1="12" x2="5" y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
    <circle cx="12" cy="12" r="2" fill={color} stroke="none"/>
  </svg>
);

function ModelLogo({ type, size = 16 }) {
  if (type === 'claude') return <ClaudeLogo size={size} />;
  if (type === 'openai') return <OpenAILogo size={size} />;
  if (type === 'gemini') return <GeminiLogo size={size} />;
  return <AutoLogo size={size} />;
}

// Model name color: auto=black bold, claude=black, gemini=black, openai=black
function modelNameStyle(m) {
  return { fontSize: 14, fontWeight: m.isAuto ? 600 : 400, color: '#111', display: 'block', lineHeight: 1.3 };
}

// ─────────────────────────────────────────────────────────────────
// MODEL LIST — exact hierarchy, immutable order
// ─────────────────────────────────────────────────────────────────
const ALL_MODELS = [
  { id: 'automatic',        name: 'Automatique',        subtitle: 'Le meilleur modèle IA est sélectionné pour chaque requête', logo: 'auto',   isAuto: true },
  { id: 'gemini-31-pro',    name: 'Gemini 3.1 Pro',    logo: 'gemini' },
  { id: 'claude-sonnet-46', name: 'Claude Sonnet 4.6', logo: 'claude' },
  { id: 'claude-opus-46',   name: 'Claude Opus 4.6',   logo: 'claude' },
  { id: 'claude-opus-48',   name: 'Claude Opus 4.8',   logo: 'claude' },
  { id: 'chatgpt-55',       name: 'ChatGPT 5.5',       logo: 'openai' },
];

// ─────────────────────────────────────────────────────────────────
// WAVEFORM MIC VISUALIZER — realistic horizontal CSS bars
// ─────────────────────────────────────────────────────────────────
const NUM_BARS = 28;

// CSS for bar animations injected once
const MIC_STYLE = `
@keyframes micBar {
  0%, 100% { transform: scaleY(0.15); }
  50%       { transform: scaleY(1); }
}
`;

function WaveformMicVisualizer({ analyserRef, duration }) {
  const barsRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const analyser = analyserRef.current;
      if (!analyser) return;
      const buf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(buf);
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const idx = Math.floor((i / NUM_BARS) * buf.length * 0.6);
        const v = Math.max(0.08, buf[idx] / 255);
        bar.style.transform = `scaleY(${v})`;
      });
    };
    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyserRef]);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, height: 40, paddingLeft: 4 }}>
      <style>{MIC_STYLE}</style>
      {/* Red dot */}
      <motion.div
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }}
      />
      {/* Horizontal bar waveform */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, height: 32 }}>
        {Array.from({ length: NUM_BARS }).map((_, i) => {
          // stagger delay creates a natural wave propagation effect
          const delay = `${((i / NUM_BARS) * 0.8).toFixed(2)}s`;
          const dur = `${(0.4 + (i % 5) * 0.07).toFixed(2)}s`;
          return (
            <div
              key={i}
              ref={el => barsRef.current[i] = el}
              style={{
                width: 2.5,
                height: '100%',
                background: '#111',
                borderRadius: 2,
                transform: 'scaleY(0.12)',
                transformOrigin: 'center',
                animation: `micBar ${dur} ${delay} ease-in-out infinite`,
                transition: 'transform 50ms',
              }}
            />
          );
        })}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#555', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
        {`${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// OBJECTIF BUTTON — light bg, blue icon only when active
// ─────────────────────────────────────────────────────────────────
function ObjectifButton({ active, onToggle, dropDirection = 'up' }) {
  const [hovered, setHovered] = useState(false);
  const tooltipStyle = dropDirection === 'up'
    ? { bottom: 'calc(100% + 8px)', top: 'auto' }
    : { top: 'calc(100% + 8px)', bottom: 'auto' };

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: dropDirection === 'up' ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dropDirection === 'up' ? 4 : -4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute', ...tooltipStyle,
              left: '50%', transform: 'translateX(-50%)',
              background: '#111', color: '#fff',
              fontSize: 11, lineHeight: 1.55,
              padding: '7px 11px', borderRadius: 8,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              zIndex: 9999, pointerEvents: 'none', textAlign: 'center',
            }}>
            Focus mode improves quality,<br />uses more credits
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 28, height: 28, borderRadius: 6,
          border: active ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(0,0,0,0.18)',
          background: active ? 'rgba(59,130,246,0.08)' : 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 120ms',
        }}
        onMouseEnter={e => { setHovered(true); if (!active) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.35)'; }}
        onMouseLeave={e => { setHovered(false); if (!active) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'; }}
      >
        <CrosshairIcon size={13} color={active ? '#3B82F6' : '#111'} />
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
  dropDirection = 'up',   // 'up' = chat page, 'down' = home page
  hideName = false,       // if true, only show logo on model button (Chat page)
}) {
  const planFeatures = getPlanFeatures(user);
  const [selectedModel, setSelectedModel] = useState('automatic');
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [objectifActive, setObjectifActive] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
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
      const bMode = selectedModel === 'automatic' ? 'Automatic' : (selectedModel.includes('opus') ? 'Max' : 'Flash');
      onSend(input, { files, buildMode: bMode, searchActive, selectedModel, objectifActive });
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
        setMicDenied(true);
        toast.error('Microphone access denied.', { style: { background: '#3F3F46', color: '#fff', borderRadius: '999px' } });
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
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    // If still recording, stop it and wait for final ondataavailable
    const finalize = async () => {
      stopStream();
      setIsRecording(false);
      setRecordingDuration(0);

      const chunks = chunksRef.current;
      if (!chunks || chunks.length === 0) {
        setTimeout(() => textareaRef.current?.focus(), 50);
        return;
      }

      const mimeType = recorder.mimeType || 'audio/webm';
      const blob = new Blob(chunks, { type: mimeType });
      chunksRef.current = [];

      // Show a brief "transcribing..." indicator
      setInput('⏳ Transcription en cours…');

      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: blob });
        const transcript = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
        setInput(transcript || '');
      } catch {
        setInput('');
        toast.error('Transcription failed', { style: { background: '#3F3F46', color: '#fff', borderRadius: '999px' } });
      }
      setTimeout(() => textareaRef.current?.focus(), 50);
    };

    if (recorder.state !== 'inactive') {
      recorder.onstop = finalize;
      recorder.stop();
    } else {
      finalize();
    }
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));
  const hasContent = !!(input.trim() || (files?.length || 0) > 0);
  const activeModel = ALL_MODELS.find(m => m.id === selectedModel) || ALL_MODELS[0]; // fallback to Automatic
  const canUpload = !!(planFeatures?.file_upload);
  const hasInternet = !!(planFeatures?.web_search);

  // Dropdown position helpers
  const isUp = dropDirection === 'up';
  const menuPos = isUp
    ? { bottom: 'calc(100% + 8px)', top: 'auto' }
    : { top: 'calc(100% + 8px)', bottom: 'auto' };
  const menuAnim = isUp
    ? { initial: { opacity: 0, y: 6, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 6, scale: 0.97 } }
    : { initial: { opacity: 0, y: -6, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -6, scale: 0.97 } };

  const dropdownBase = {
    background: '#FFFFFF',
    border: '1px solid rgba(0,0,0,0.09)',
    borderRadius: 8,
    boxShadow: '0 6px 20px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
    zIndex: 999,
  };

  // Square button — transparent bg, gray border, black icon
  const lightBtn = {
    width: 28, height: 28, borderRadius: 6,
    border: '1px solid rgba(0,0,0,0.18)',
    background: 'transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color 120ms',
  };

  const handleDriveImport = (importedFiles) => {
    setFiles(prev => [...(prev || []), ...importedFiles]);
  };

  return (
    <div style={{ padding: '0 8px 8px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Google Drive Picker Modal */}
      <AnimatePresence>
        {showDrivePicker && (
          <GoogleDrivePickerModal
            onClose={() => setShowDrivePicker(false)}
            onImport={handleDriveImport}
          />
        )}
      </AnimatePresence>

      {/* ── File previews ── */}
      <AnimatePresence>
        {(files?.length || 0) > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8, maxHeight: 200, overflowY: 'auto', padding: '0 8px' }}>
            {files.map((file, i) => (
              <motion.div key={`${file.name}-${i}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F4F4F2', borderRadius: 12, padding: '7px 10px', border: '1px solid #E8E8E4' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#E8E8E4' }}>
                  {file.type?.startsWith('image/') ? (
                    <img src={file.url} style={{ objectFit: 'cover', width: '100%', height: '100%' }} alt="preview" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText style={{ width: 14, height: 14, color: '#999' }} />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#555', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <button onClick={() => removeFile(i)} style={{ width: 20, height: 20, background: 'transparent', color: '#BBB', borderRadius: 999, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#333'} onMouseLeave={e => e.currentTarget.style.color = '#BBB'}>
                  <X style={{ width: 12, height: 12 }} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main input card — white, soft border (img2) ── */}
      <div style={{ background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.10)', borderRadius: 20, overflow: 'visible', position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <WaveformMicVisualizer analyserRef={analyserRef} duration={recordingDuration} />
            </motion.div>
          ) : (
            <motion.div key="textarea" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div style={{ padding: '14px 16px 0', paddingLeft: _extraTextareaPaddingLeft > 0 ? `${_extraTextareaPaddingLeft}px` : '16px' }}>
                <textarea
                  ref={textareaRef}
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
                  className="placeholder:text-[#BABAB4] textarea-custom-scroll"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', gap: 5 }}>

          <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*,application/pdf" onChange={handleFileChange} />

          {!isRecording && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>

              {/* Plus Menu */}
              <div ref={plusMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  style={{ ...lightBtn, borderColor: showPlusMenu ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.18)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.35)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = showPlusMenu ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.18)'}
                >
                  <Plus style={{ width: 14, height: 14, color: '#111' }} />
                </button>
                <AnimatePresence>
                  {showPlusMenu && (
                    <motion.div {...menuAnim} transition={{ duration: 0.13 }}
                      style={{ position: 'absolute', ...menuPos, left: 0, ...dropdownBase, minWidth: 220, overflow: 'hidden', padding: '4px' }}>

                      {/* Upload from computer */}
                      <button onClick={() => { if (canUpload) { fileInputRef.current?.click(); setShowPlusMenu(false); } }} disabled={!canUpload}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 9, padding: '7px 10px', background: 'none', border: 'none', borderRadius: 5, cursor: canUpload ? 'pointer' : 'default', opacity: canUpload ? 1 : 0.4, fontFamily: 'Inter, sans-serif' }}
                        onMouseEnter={e => { if (canUpload) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <Upload style={{ width: 13, height: 13, color: '#6366F1', flexShrink: 0 }} />
                          <span style={{ fontSize: 12.5, fontWeight: 500, color: '#1A1A1A' }}>Upload from computer</span>
                        </div>
                        {!canUpload && <Lock style={{ width: 10, height: 10, color: '#BBB' }} />}
                      </button>

                      {/* Web search */}
                      <button onClick={() => { if (hasInternet) { setSearchActive(v => !v); setShowPlusMenu(false); } }} disabled={!hasInternet}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 9, padding: '7px 10px', background: 'none', border: 'none', borderRadius: 5, cursor: hasInternet ? 'pointer' : 'default', opacity: hasInternet ? 1 : 0.4, fontFamily: 'Inter, sans-serif' }}
                        onMouseEnter={e => { if (hasInternet) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <GoogleSearchLogo size={13} />
                          <span style={{ fontSize: 12.5, fontWeight: 500, color: '#1A1A1A' }}>Search Google</span>
                          {hasInternet && (
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 999, background: searchActive ? '#111' : 'rgba(0,0,0,0.06)', color: searchActive ? '#fff' : '#888', letterSpacing: '0.04em' }}>
                              {searchActive ? 'ON' : 'OFF'}
                            </span>
                          )}
                        </div>
                        {!hasInternet && <Lock style={{ width: 10, height: 10, color: '#BBB' }} />}
                      </button>

                      {/* Import from Google Drive */}
                      <button onClick={() => { setShowPlusMenu(false); setShowDrivePicker(true); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', background: 'none', border: 'none', borderRadius: 5, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <DriveLogo size={22} />
                        <span style={{ fontSize: 12.5, fontWeight: 500, color: '#1A1A1A' }}>Import from Google Drive</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Objectif only (Skill removed) */}
              <ObjectifButton active={objectifActive} onToggle={() => setObjectifActive(v => !v)} dropDirection={dropDirection} />
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* ── RIGHT: Model Selector / Send / Mic ── */}
          {isRecording ? (
            <>
              <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={handleDiscardRecording}
                style={{ width: 32, height: 32, borderRadius: 10, background: '#F5F5F3', border: '1px solid rgba(0,0,0,0.10)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', flexShrink: 0 }}>
                <X style={{ width: 13, height: 13 }} />
              </motion.button>
              <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 }} onClick={handleConfirmRecording}
                style={{ width: 32, height: 32, borderRadius: 10, background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check style={{ width: 14, height: 14, color: '#fff' }} />
              </motion.button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>

              {/* Model Selector */}
              <div ref={modelMenuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowModelMenu(v => !v)}
                  style={{
                    height: 32, padding: hideName ? '0 6px' : '0 10px',
                    borderRadius: 10, border: 'none',
                    background: showModelMenu ? 'rgba(0,0,0,0.06)' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.65)',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = showModelMenu ? 'rgba(0,0,0,0.06)' : 'transparent'}
                >
                  {/* Always show logo */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ModelLogo type={activeModel.logo} size={14} />
                  </div>
                  {/* Show name only when hideName is false */}
                  {!hideName && (
                    <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeModel.name}
                    </span>
                  )}
                  <ChevronDown style={{ width: 11, height: 11, opacity: 0.5, flexShrink: 0 }} />
                </button>

                <AnimatePresence>
                  {showModelMenu && (
                    <motion.div {...menuAnim} transition={{ duration: 0.13 }}
                      style={{ position: 'absolute', ...menuPos, right: 0, ...dropdownBase, padding: '4px', minWidth: 260 }}>

                      {ALL_MODELS.map((m) => {
                        const isSelected = selectedModel === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => { setSelectedModel(m.id); setShowModelMenu(false); }}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                              padding: '10px 13px',
                              background: 'transparent',
                              border: 'none', borderRadius: 5, cursor: 'pointer', textAlign: 'left',
                              transition: 'background 100ms',
                            }}
                            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <ModelLogo type={m.logo} size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 13.5, fontWeight: isSelected ? 600 : (m.isAuto ? 600 : 400), color: '#111', display: 'block', lineHeight: 1.3 }}>{m.name}</span>
                              {m.subtitle && (
                                <span style={{ fontSize: 12, color: '#888', display: 'block', lineHeight: 1.4, marginTop: 2 }}>{m.subtitle}</span>
                              )}
                            </div>
                            {isSelected && (
                              <Check style={{ width: 12, height: 12, color: '#111', flexShrink: 0 }} />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mic button */}
              <button
                onClick={handleMicClick}
                style={{ ...lightBtn }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.35)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'}
              >
                {micDenied
                  ? <MicOff style={{ width: 13, height: 13, color: '#EF4444' }} />
                  : <Mic style={{ width: 13, height: 13, color: '#111' }} />}
              </button>

              {/* Send button */}
              {isLoading ? (
                <button onClick={onStop} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 10, background: '#F5F5F3', border: '1px solid rgba(0,0,0,0.10)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 10, height: 10, background: '#333', borderRadius: 3 }} />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!hasContent}
                  style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: 10,
                    background: hasContent ? '#111' : '#F0F0EE',
                    border: 'none', cursor: hasContent ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 120ms',
                  }}
                >
                  {/* Arrow up send icon */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hasContent ? '#fff' : 'rgba(0,0,0,0.2)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/>
                    <polyline points="5 12 12 5 19 12"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}