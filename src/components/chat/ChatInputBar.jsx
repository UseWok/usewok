/**
 * ChatInputBar — WOK Premium Chat Input
 *
 * DESIGN RULES:
 * - ALL dropdowns open UPWARD.
 * - img2 (be26ef948) = Standard logo. img3 (0e46ff93c) = Max logo (transparent).
 * - Automatic mode: shows both logos side by side.
 * - Google Search active: shows Google G logo next to model logos in toolbar.
 * - Action button (AI Settings) is leftmost, isolated with white bg.
 * - All buttons: rounded-full (border-radius: 999px).
 * - iOS-style mic animation: concentric glow rings.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, X, FileText, Mic, MicOff, ChevronDown, Check, Lock, Upload, Plus } from 'lucide-react';
import { getBuildMode, setBuildMode as setGlobalBuildMode } from '@/lib/build-mode-store';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────
// LOGOS
// img2 = Standard (be26ef948), img3 = Max (0e46ff93c), img1 = Google G (3a327ee44)
// ─────────────────────────────────────────────────────────────────

const SparkleIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="sg1" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444"/>
        <stop offset="33%" stopColor="#3B82F6"/>
        <stop offset="66%" stopColor="#22C55E"/>
        <stop offset="100%" stopColor="#EAB308"/>
      </linearGradient>
    </defs>
    <path d="M50 2 C50 2 53 38 70 50 C53 62 50 98 50 98 C50 98 47 62 30 50 C47 38 50 2 50 2Z" fill="url(#sg1)"/>
    <path d="M2 50 C2 50 38 47 50 30 C62 47 98 50 98 50 C98 50 62 53 50 70 C38 53 2 50 2 50Z" fill="url(#sg1)"/>
  </svg>
);

// ── Unified logo size: all AI logos render in a fixed 16×16 container ──
const LOGO_SIZE = 16;

/** Standard = img2 */
const StandardLogo = ({ size = LOGO_SIZE }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: LOGO_SIZE, height: LOGO_SIZE, flexShrink: 0 }}>
    <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/be26ef948_image.png" alt="Standard"
      style={{ width: LOGO_SIZE, height: LOGO_SIZE, objectFit: 'contain', mixBlendMode: 'screen', display: 'block' }} />
  </span>
);

/** Max = img3 */
const MaxLogo = ({ size = LOGO_SIZE }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: LOGO_SIZE, height: LOGO_SIZE, flexShrink: 0 }}>
    <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/0e46ff93c_image.png" alt="Max"
      style={{ width: LOGO_SIZE, height: LOGO_SIZE, objectFit: 'contain', mixBlendMode: 'screen', display: 'block' }} />
  </span>
);

/** Google G = img1 */
const GoogleGLogo = ({ size = LOGO_SIZE }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: LOGO_SIZE, height: LOGO_SIZE, flexShrink: 0 }}>
    <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/3a327ee44_image.png" alt="Google"
      style={{ width: LOGO_SIZE, height: LOGO_SIZE, objectFit: 'contain', mixBlendMode: 'screen', display: 'block' }} />
  </span>
);

// ─────────────────────────────────────────────────────────────────
// iOS-STYLE MIC ANIMATION — concentric glow rings reacting to voice
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
      {/* Outer glow ring 2 */}
      <motion.div
        animate={{ scale: ring2Scale, opacity: 0.12 + level * 0.15 }}
        transition={{ duration: 0.08 }}
        style={{
          position: 'absolute', width: 52, height: 52, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,255,255,${0.3 + level * 0.5}) 0%, transparent 70%)`,
        }}
      />
      {/* Outer glow ring 1 */}
      <motion.div
        animate={{ scale: ringScale, opacity: 0.25 + level * 0.3 }}
        transition={{ duration: 0.06 }}
        style={{
          position: 'absolute', width: 38, height: 38, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,255,255,${0.5 + level * 0.4}) 0%, transparent 70%)`,
        }}
      />
      {/* Center mic icon */}
      <motion.div
        animate={{ scale: 1 + level * 0.12 }}
        transition={{ duration: 0.06 }}
        style={{
          position: 'relative', width: 28, height: 28, borderRadius: '50%',
          background: `rgba(255,255,255,${0.9 + level * 0.1})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 ${8 + level * 20}px rgba(255,255,255,${0.3 + level * 0.5})`,
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#EF4444' }}
        />
        <Mic style={{ width: 13, height: 13, color: '#111' }} />
      </motion.div>
      {/* Duration */}
      <span style={{
        position: 'absolute', right: 0,
        fontSize: 12, fontWeight: 600, color: '#555',
        fontVariantNumeric: 'tabular-nums', minWidth: 36,
      }}>
        {`${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MODEL SELECTOR DROPDOWN — opens UPWARD
// ─────────────────────────────────────────────────────────────────
function BuildMenu({ buildMode, setBuildMode, setDiscussMode, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
        background: '#1A1A1A', border: '1px solid #2E2E2E',
        borderRadius: 14, padding: '4px', minWidth: 240,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 9999,
      }}
    >
      {/* Automatic */}
      <button
        onClick={() => { setBuildMode('Automatic'); setDiscussMode?.(false); onClose(); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '8px 12px', border: 'none',
          background: buildMode === 'Automatic' ? 'rgba(255,255,255,0.06)' : 'transparent',
          borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', gap: 8,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = buildMode === 'Automatic' ? 'rgba(255,255,255,0.06)' : 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            <StandardLogo />
            <MaxLogo />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Automatic</div>
            <div style={{ fontSize: 11, fontWeight: 400, color: '#555', lineHeight: 1.3 }}>
              Best model selected per request.
            </div>
          </div>
        </div>
        {buildMode === 'Automatic' && <Check style={{ width: 13, height: 13, color: '#fff', flexShrink: 0 }} />}
      </button>

      <div style={{ height: 1, background: '#2A2A2A', margin: '2px 0' }} />

      {/* Standard */}
      <button
        onClick={() => { setBuildMode('Flash'); setDiscussMode?.(false); onClose(); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '7px 12px', border: 'none',
          background: buildMode === 'Flash' ? 'rgba(255,255,255,0.06)' : 'transparent',
          borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = buildMode === 'Flash' ? 'rgba(255,255,255,0.06)' : 'transparent'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StandardLogo />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#ccc' }}>Standard</span>
        </span>
        {buildMode === 'Flash' && <Check style={{ width: 13, height: 13, color: '#fff', flexShrink: 0 }} />}
      </button>

      {/* Max */}
      <button
        onClick={() => { setBuildMode('Max'); setDiscussMode?.(false); onClose(); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '7px 12px', border: 'none',
          background: buildMode === 'Max' ? 'rgba(255,255,255,0.06)' : 'transparent',
          borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = buildMode === 'Max' ? 'rgba(255,255,255,0.06)' : 'transparent'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MaxLogo />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#ccc' }}>Max</span>
          <span style={{ fontSize: 10, fontWeight: 700, background: '#8F41FD', color: '#fff', borderRadius: 999, padding: '1px 7px' }}>NEW</span>
        </span>
        {buildMode === 'Max' && <Check style={{ width: 13, height: 13, color: '#fff', flexShrink: 0 }} />}
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// AI SETTINGS DROPDOWN — opens UPWARD, anchored LEFT
// ─────────────────────────────────────────────────────────────────
function AISettingsMenu({ onClose, onEnhance, onToggleSearch, onImportFile, isEnhancing, searchActive }) {
  const ref = useRef(null);
  const importRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
        background: '#1A1A1A', border: '1px solid #2E2E2E',
        borderRadius: 14, padding: '4px', minWidth: 240,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 9999,
      }}
    >
      {/* Enhance prompt */}
      <button
        onClick={() => { if (!isEnhancing) { onEnhance?.(); onClose(); } }}
        disabled={isEnhancing}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          width: '100%', padding: '8px 12px', border: 'none',
          background: 'transparent', borderRadius: 10,
          cursor: isEnhancing ? 'wait' : 'pointer', textAlign: 'left',
          fontFamily: 'Inter, sans-serif', opacity: isEnhancing ? 0.6 : 1,
        }}
        onMouseEnter={e => { if (!isEnhancing) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ flexShrink: 0, marginTop: 2 }}><SparkleIcon size={18} /></div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
            {isEnhancing ? 'Enhancing…' : 'Enhance prompt'}
          </div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 3, lineHeight: 1.4 }}>
            Rewrite your prompt for optimal results.
          </div>
        </div>
      </button>

      {/* Import from Computer */}
      <input ref={importRef} type="file" multiple accept="image/*,application/pdf,.txt,.csv,.json,.md"
        style={{ display: 'none' }} onChange={(e) => { onImportFile?.(e); onClose(); }} />
      <button
        onClick={() => importRef.current?.click()}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '7px 12px', border: 'none',
          background: 'transparent', borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Upload style={{ width: 15, height: 15, color: '#888', flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: '#ccc' }}>Import from Computer</span>
      </button>

      {/* Search Google — toggleable */}
      <button
        onClick={() => { onToggleSearch?.(); onClose(); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '7px 12px', border: 'none',
          background: searchActive ? 'rgba(255,255,255,0.06)' : 'transparent',
          borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}
        onMouseEnter={e => e.currentTarget.style.background = searchActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}
        onMouseLeave={e => e.currentTarget.style.background = searchActive ? 'rgba(255,255,255,0.06)' : 'transparent'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flexShrink: 0 }}><GoogleGLogo size={15} /></div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#ccc' }}>Search Google</span>
        </span>
        {searchActive && <Check style={{ width: 13, height: 13, color: '#fff', flexShrink: 0 }} />}
      </button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function ChatInputBar({
  input, setInput, onSend, onStop, isLoading,
  files = [], setFiles,
  discussMode, setDiscussMode, editMode, setEditMode,
  onUpgrade,
  locked = false,
  buildMode: externalBuildMode,
}) {
  const [buildMode, setBuildModeLocal] = useState(() => externalBuildMode || getBuildMode());
  useEffect(() => {
    if (externalBuildMode && externalBuildMode !== buildMode) setBuildModeLocal(externalBuildMode);
  }, [externalBuildMode]);
  const setBuildMode = (mode) => { setBuildModeLocal(mode); setGlobalBuildMode(mode); };

  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [micDenied, setMicDenied] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const buildMenuRef = useRef(null);
  const aiMenuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const newH = Math.min(el.scrollHeight, 288);
    el.style.height = `${Math.max(24, newH)}px`;
    el.style.overflowY = el.scrollHeight > 288 ? 'auto' : 'hidden';
  }, [input]);

  // Paste handler
  const handlePaste = useCallback((e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const media = items.filter(it => it.kind === 'file' && (it.type.startsWith('image/') || it.type === 'application/pdf'));
    if (!media.length) return;
    e.preventDefault();
    setFiles(p => [...(p || []), ...media.map(it => { const f = it.getAsFile(); return { file: f, name: f.name || 'pasted', url: URL.createObjectURL(f), type: f.type }; })]);
  }, [setFiles]);
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // Mic recording
  const handleMicClick = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicDenied(false);
      streamRef.current = stream;
      chunksRef.current = [];
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);
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
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
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

  const handleSend = () => {
    if (!isLoading && (input.trim() || (files?.length || 0) > 0)) onSend(input, { files, buildMode, searchActive });
  };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleFileChange = (e) => {
    const dropped = Array.from(e.target.files || []);
    if (dropped.length) setFiles(p => [...(p || []), ...dropped.map(f => ({ file: f, name: f.name, url: URL.createObjectURL(f), type: f.type }))]);
  };
  const handleImportFile = (e) => {
    const dropped = Array.from(e.target.files || []);
    if (dropped.length) setFiles(p => [...(p || []), ...dropped.map(f => ({ file: f, name: f.name, url: URL.createObjectURL(f), type: f.type }))]);
  };

  const handleEnhancePrompt = async () => {
    if (!input.trim() || isEnhancing) return;
    setIsEnhancing(true);
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

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));
  const hasContent = !!(input.trim() || (files?.length || 0) > 0);

  // Model logos shown in toolbar
  const ModelLogos = () => {
    if (buildMode === 'Automatic') return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <StandardLogo size={14} />
        <MaxLogo size={14} />
      </span>
    );
    if (buildMode === 'Max') return <MaxLogo size={15} />;
    return <StandardLogo size={15} />;
  };
  const modelLabel = buildMode === 'Automatic' ? 'Automatic' : buildMode === 'Max' ? 'Max' : 'Standard';

  // Rounded-full button helper
  const RoundBtn = ({ onClick, title, children, active = false, extraStyle = {}, onMouseEnterStyle = {}, onMouseLeaveStyle = {} }) => (
    <button onClick={onClick} title={title} style={{
      width: 30, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      transition: 'background 120ms',
      background: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)',
      ...extraStyle,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; Object.assign(e.currentTarget.style, onMouseEnterStyle); }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)'; Object.assign(e.currentTarget.style, onMouseLeaveStyle); }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ padding: '0 8px 8px', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── File previews ── */}
      <AnimatePresence>
        {(files?.length || 0) > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8, maxHeight: 200, overflowY: 'auto', padding: '0 8px' }}>
            {files.map((file, i) => (
              <motion.div key={`${file.name}-${i}`} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#2A2A2A', borderRadius: 12, padding: '7px 10px', border: '1px solid #333' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#1A1A1A' }}>
                  {file.type?.startsWith('image/') ? (
                    <img src={file.url} style={{ objectFit: 'cover', width: '100%', height: '100%' }} alt="preview" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText style={{ width: 14, height: 14, color: '#666' }} />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#aaa', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <button onClick={() => removeFile(i)} style={{ width: 20, height: 20, background: 'transparent', color: '#555', borderRadius: 999, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ccc'} onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                  <X style={{ width: 12, height: 12 }} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main input card ── */}
      <div style={{ background: '#242424', border: '1.5px solid rgba(255,255,255,0.10)', borderRadius: 22, overflow: 'visible', position: 'relative' }}>

        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <IOSMicVisualizer analyserRef={analyserRef} duration={recordingDuration} />
            </motion.div>
          ) : (
            <motion.div key="textarea" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <AnimatePresence>
                {editMode && (
                  <motion.div key="design-chip" initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
                    style={{ paddingLeft: 14, paddingRight: 14, paddingTop: 10, overflow: 'hidden' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: '#333', fontSize: 12, fontWeight: 500, color: '#fff' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><circle cx="8" cy="14" r="1" fill="#aaa" stroke="none"/>
                        <circle cx="12" cy="9" r="1" fill="#aaa" stroke="none"/><circle cx="16" cy="14" r="1" fill="#aaa" stroke="none"/>
                      </svg>
                      Design
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div style={{ padding: '14px 16px 0' }}>
                <textarea ref={textareaRef}
                  value={locked ? '' : input}
                  onChange={(e) => { if (!locked) setInput(e.target.value); }}
                  onKeyDown={locked ? undefined : handleKeyDown}
                  placeholder={locked ? '⛔ Credits exhausted — renewal in a few days' : 'Ask anything...'}
                  style={{
                    width: '100%', background: 'transparent', outline: 'none', border: 'none',
                    resize: 'none', fontSize: 14, color: '#fff', lineHeight: '24px', height: '24px',
                    maxHeight: '288px', overflowY: 'hidden',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    WebkitFontSmoothing: 'antialiased', boxSizing: 'border-box', display: 'block',
                  }}
                  className="placeholder:text-[#555] textarea-custom-scroll"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', gap: 5 }}>

          <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*,application/pdf" onChange={handleFileChange} />

          {/* ── LEFT: AI Settings action button — same style as mic button ── */}
          {!isRecording && (
            <div ref={aiMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setShowAIMenu(v => !v); }}
                title="AI Settings"
                style={{
                  width: 30, height: 30, borderRadius: 999,
                  background: showAIMenu ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background 120ms',
                  opacity: isEnhancing ? 0.6 : 1,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = showAIMenu ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.10)'}
              >
                <Plus style={{ width: 14, height: 14, color: '#fff' }} />
              </button>
              <AnimatePresence>
                {showAIMenu && (
                  <AISettingsMenu
                    onClose={() => setShowAIMenu(false)}
                    onEnhance={handleEnhancePrompt}
                    onToggleSearch={() => setSearchActive(v => !v)}
                    onImportFile={handleImportFile}
                    isEnhancing={isEnhancing}
                    searchActive={searchActive}
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* ── Recording controls ── */}
          {isRecording ? (
            <>
              <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                onClick={handleDiscardRecording}
                style={{ width: 30, height: 30, borderRadius: 999, background: 'transparent', border: '1px solid #444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', flexShrink: 0 }}>
                <X style={{ width: 13, height: 13 }} />
              </motion.button>
              <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.05 }}
                onClick={handleConfirmRecording}
                style={{ width: 30, height: 30, borderRadius: 999, background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check style={{ width: 14, height: 14, color: '#111' }} />
              </motion.button>
            </>
          ) : (
            <>
              {/* ── Model selector ── */}
              <div ref={buildMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setShowBuildMenu(v => !v); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    height: 30, padding: '0 10px', borderRadius: 999, border: 'none',
                    background: 'rgba(255,255,255,0.10)', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, color: '#fff', transition: 'background 120ms',
                    }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
                >
                  <ModelLogos />
                  {/* Google search indicator — shown when active */}
                  {searchActive && (
                    <motion.span initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', alignItems: 'center' }}>
                      <GoogleGLogo size={13} />
                    </motion.span>
                  )}
                  <span>{modelLabel}</span>
                  <ChevronDown style={{ width: 11, height: 11, opacity: 0.6 }} />
                </button>
                <AnimatePresence>
                  {showBuildMenu && (
                    <BuildMenu buildMode={buildMode} setBuildMode={setBuildMode}
                      setDiscussMode={setDiscussMode} onClose={() => setShowBuildMenu(false)} />
                  )}
                </AnimatePresence>
              </div>

              {/* ── Mic ── */}
              <button
                onClick={handleMicClick}
                title={micDenied ? 'Microphone access denied' : 'Record audio'}
                style={{
                  width: 30, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: micDenied ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.10)',
                  transition: 'background 120ms',
                }}
                onMouseEnter={e => e.currentTarget.style.background = micDenied ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = micDenied ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.10)'}
              >
                {micDenied
                  ? <MicOff style={{ width: 14, height: 14, color: '#EF4444' }} />
                  : <Mic style={{ width: 14, height: 14, color: '#fff' }} />
                }
              </button>

              {/* ── Send / Stop / Locked ── */}
              {locked ? (
                <button onClick={() => onUpgrade?.()} title="Credits exhausted"
                  style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 999, background: '#EF4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock style={{ width: 13, height: 13, color: '#fff', strokeWidth: 2.5 }} />
                </button>
              ) : isLoading ? (
                <button onClick={onStop}
                  style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 999, background: 'rgba(255,255,255,0.10)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 10, height: 10, background: '#FFF', borderRadius: 3 }} />
                </button>
              ) : (
                <button onClick={handleSend} disabled={!hasContent}
                  style={{
                    flexShrink: 0, width: 30, height: 30, borderRadius: 999,
                    background: hasContent ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                    border: 'none', cursor: hasContent ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 120ms',
                  }}>
                  <ArrowUp style={{ width: 15, height: 15, color: '#111', strokeWidth: 2 }} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}