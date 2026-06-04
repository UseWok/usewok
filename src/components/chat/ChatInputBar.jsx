import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, X, FileText, Plus, Mic, ChevronDown, Check, Settings, History, Camera, Paperclip } from 'lucide-react';

// ── Real-time waveform using AnalyserNode ──
function LiveWaveform({ analyserRef }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const BAR_COUNT = 60;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const analyser = analyserRef.current;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        // Check if any sound is detected
        const maxVal = Math.max(...data);
        const barW = W / BAR_COUNT;
        for (let i = 0; i < BAR_COUNT; i++) {
          if (maxVal < 5) {
            // Strictly frozen when silent — no animation
            ctx.fillStyle = 'rgba(30,30,30,0.15)';
            ctx.beginPath();
            ctx.roundRect(i * barW + 1, (H - 2) / 2, barW - 2, 2, 1);
            ctx.fill();
          } else {
            // Map bars so peak is at center
            const center = BAR_COUNT / 2;
            const dist = Math.abs(i - center) / center; // 0=center, 1=edge
            const mirrorIdx = Math.floor(Math.abs(i - center) / center * (data.length / 2));
            const rawVal = data[mirrorIdx] / 255;
            // Bell-shaped envelope — center peaks higher
            const envelope = Math.pow(1 - dist, 1.5);
            const val = rawVal * envelope;
            const barH = Math.max(2, val * H * 0.9);
            ctx.fillStyle = `rgba(30, 30, 30, ${0.25 + val * 0.75})`;
            ctx.beginPath();
            ctx.roundRect(i * barW + 1, (H - barH) / 2, barW - 2, barH, 2);
            ctx.fill();
          }
        }
      } else {
        // No analyser yet — static flat bars
        const barW = W / BAR_COUNT;
        for (let i = 0; i < BAR_COUNT; i++) {
          ctx.fillStyle = 'rgba(30,30,30,0.15)';
          ctx.beginPath();
          ctx.roundRect(i * barW + 1, (H - 2) / 2, barW - 2, 2, 1);
          ctx.fill();
        }
      }
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyserRef]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={36}
      style={{ flex: 1, display: 'block', height: 36 }}
    />
  );
}

// ── Plus dropdown menu ──
function PlusMenu({ onClose, onAttachFile, onScreenshot }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const menuStyle = {
    position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
    background: '#fff',
    border: '1.5px solid #1A1A1A',
    borderRadius: 10, padding: '4px', minWidth: 200,
    boxShadow: '0 6px 24px rgba(0,0,0,0.14)', zIndex: 9999,
  };
  const itemStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '8px 10px', border: 'none',
    background: 'transparent', borderRadius: 7, cursor: 'pointer',
    fontSize: 13, color: '#111', fontFamily: 'Inter, sans-serif', textAlign: 'left',
  };

  return (
    <div ref={ref} style={menuStyle}>
      <button style={itemStyle}
        onMouseEnter={e => e.currentTarget.style.background = '#F4F4F4'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        onClick={onClose}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Settings style={{ width: 14, height: 14, color: '#555' }} />
          Settings
        </span>
        <span style={{ fontSize: 11, color: '#888', fontFamily: 'ui-monospace, monospace', background: '#F0F0F0', borderRadius: 4, padding: '1px 5px' }}>Ctrl.</span>
      </button>
      <button style={itemStyle}
        onMouseEnter={e => e.currentTarget.style.background = '#F4F4F4'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        onClick={onClose}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <History style={{ width: 14, height: 14, color: '#555' }} />
          History
        </span>
      </button>
      <div style={{ height: 1, background: '#E0E0E0', margin: '4px 0' }} />
      <button style={itemStyle}
        onMouseEnter={e => e.currentTarget.style.background = '#F4F4F4'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        onClick={() => { onScreenshot?.(); onClose(); }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Camera style={{ width: 14, height: 14, color: '#555' }} />
          Take a screenshot
        </span>
      </button>
      <button style={itemStyle}
        onMouseEnter={e => e.currentTarget.style.background = '#F4F4F4'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        onClick={() => { onAttachFile?.(); onClose(); }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Paperclip style={{ width: 14, height: 14, color: '#555' }} />
          Attach a file
        </span>
      </button>
    </div>
  );
}

// ── Build mode dropdown (Flash / Expert + Upgrade) ──
function BuildMenu({ buildMode, setBuildMode, setDiscussMode, onClose, onUpgrade }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const MODES = [
    { id: 'Flash', label: 'Flash', desc: 'Fast, direct changes' },
    { id: 'Expert', label: 'Expert', desc: 'Deep reasoning mode' },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 4, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97 }}
      transition={{ duration: 0.1 }}
      style={{
        position: 'absolute', bottom: 'calc(100% + 6px)', right: 0,
        background: '#FFFFFF', border: '1px solid #E4E0D9',
        borderRadius: 12, padding: '4px', minWidth: 210,
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)', zIndex: 9999,
      }}
    >
      {MODES.map(m => {
        const isActive = buildMode === m.id;
        return (
          <button key={m.id}
            onClick={() => { setBuildMode(m.id); setDiscussMode?.(false); onClose(); }}
            style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              width: '100%', padding: '9px 12px', border: 'none',
              background: isActive ? '#F5F3F0' : 'transparent',
              borderRadius: 8, cursor: 'pointer', textAlign: 'left',
              fontFamily: 'Inter, sans-serif', gap: 8,
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F5F3F0'; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{m.label}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{m.desc}</div>
            </div>
            {isActive && <Check style={{ width: 13, height: 13, color: '#111', marginTop: 2, flexShrink: 0 }} />}
          </button>
        );
      })}

      {/* Promo / Upgrade row */}
      <div style={{ height: 1, background: '#EEEBE5', margin: '4px 0' }} />
      <button
        onClick={() => { onUpgrade?.(); onClose(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '8px 12px', border: 'none',
          background: 'transparent', borderRadius: 8, cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F5F3F0'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{
          width: 18, height: 18, borderRadius: '50%',
          background: '#8F41FD',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {/* Arrow pointing UP */}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#8F41FD' }}>
          Upgrade to Creator
        </span>
      </button>
    </motion.div>
  );
}

export default function ChatInputBar({
  input, setInput, onSend, onStop, isLoading,
  files = [], setFiles,
  discussMode, setDiscussMode, editMode, setEditMode,
  onUpgrade,
}) {
  const [buildMode, setBuildMode] = useState('Flash');
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [editActivating, setEditActivating] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const buildMenuRef = useRef(null);
  const plusBtnRef = useRef(null);
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
    el.style.height = `${Math.max(80, el.scrollHeight)}px`;
  }, [input]);

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

  // ── Mic with real AnalyserNode for live spectrum ──
  const handleMicClick = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      // Real-time analyser
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
      console.warn('Mic access denied', err);
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
    stopStream();
    setIsRecording(false);
    setRecordingDuration(0);
    chunksRef.current = [];
  };

  const handleConfirmRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
    stopStream();
    setIsRecording(false);
    setRecordingDuration(0);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const formatDuration = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSend = () => {
    if (!isLoading && (input.trim() || (files?.length || 0) > 0)) onSend(input, { files });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = (e) => {
    const dropped = Array.from(e.target.files || []);
    if (dropped.length) setFiles(p => [...(p || []), ...dropped.map(f => ({ file: f, name: f.name, url: URL.createObjectURL(f), type: f.type }))]);
  };

  // Visual Edits: activate with micro-delay, deactivate instantly
  const handleVisualEditToggle = () => {
    if (editMode) {
      // Instant deactivation
      setEditMode(false);
      setEditActivating(false);
    } else {
      // Micro-delay activation
      setEditActivating(true);
      setTimeout(() => {
        setEditActivating(false);
        setEditMode(true);
      }, 320);
    }
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));
  const hasContent = !!(input.trim() || (files?.length || 0) > 0);

  const visualEditActive = editMode || editActivating;

  return (
    <div style={{ padding: '0 8px 8px', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* File previews */}
      <AnimatePresence>
        {(files?.length || 0) > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', gap: 8, marginBottom: 8, overflowX: 'auto' }}>
            {files.map((file, i) => (
              <motion.div key={`${file.name}-${i}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, border: '1px solid #E0E0E0', background: '#F5F5F5', overflow: 'hidden' }}>
                  {file.type?.startsWith('image/') ? (
                    <img src={file.url} style={{ objectFit: 'cover', width: '100%', height: '100%' }} alt="preview" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      <FileText style={{ width: 14, height: 14, color: '#999' }} />
                      <span style={{ fontSize: 9, color: '#666', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => removeFile(i)}
                  style={{ position: 'absolute', top: -4, right: -4, width: 15, height: 15, background: '#111', color: '#FFF', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X style={{ width: 9, height: 9 }} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main input card ── */}
      <div style={{
        background: '#F0ECE3',
        border: '1px solid #D9D5CC',
        borderRadius: 10,
        overflow: 'visible',
        position: 'relative',
        boxShadow: 'none',
      }}>

        {/* ── Recording mode ── */}
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ padding: '14px 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              {/* Red pulsing dot */}
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }}
              />
              {/* Live spectrum waveform */}
              <LiveWaveform analyserRef={analyserRef} />
              {/* Duration */}
              <span style={{ fontSize: 12, fontWeight: 600, color: '#555', fontVariantNumeric: 'tabular-nums', flexShrink: 0, minWidth: 36 }}>
                {formatDuration(recordingDuration)}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="textarea"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Design chip — dark bg when active, animated slide-down */}
              <AnimatePresence>
                {editMode && (
                  <motion.div
                    key="design-chip"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    style={{ paddingLeft: 14, paddingRight: 14, paddingTop: 10, overflow: 'hidden' }}
                  >
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 999,
                      background: '#2A2A2A', border: 'none',
                      fontSize: 12, fontWeight: 500, color: '#fff',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="8" cy="14" r="1" fill="#aaa" stroke="none"/>
                        <circle cx="12" cy="9" r="1" fill="#aaa" stroke="none"/>
                        <circle cx="16" cy="14" r="1" fill="#aaa" stroke="none"/>
                      </svg>
                      Design
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ padding: '12px 14px 0' }}>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  style={{
                    width: '100%',
                    background: 'transparent',
                    outline: 'none',
                    border: 'none',
                    resize: 'none',
                    fontSize: 14,
                    color: '#111',
                    lineHeight: '20px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    boxSizing: 'border-box',
                    display: 'block',
                  }}
                  className="placeholder:text-[#BBBBBA]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bottom toolbar ── */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 10px', gap: 6 }}>

          {/* Plus — perfectly round, with dropdown */}
          <div ref={plusBtnRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowPlusMenu(v => !v)}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#555', transition: 'background 120ms', flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E6E1D7'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'}
            >
              <Plus style={{ width: 15, height: 15 }} />
            </button>
            <AnimatePresence>
              {showPlusMenu && (
                <motion.div
                  key="plus-menu"
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                >
                  <PlusMenu
                    onClose={() => setShowPlusMenu(false)}
                    onAttachFile={() => fileInputRef.current?.click()}
                    onScreenshot={null}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*,application/pdf" onChange={handleFileChange} />

          {/* Visual edits pill — assertive blue, no shadow */}
          <button
            onClick={handleVisualEditToggle}
            disabled={editActivating}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 12px',
              borderRadius: 999,
              background: visualEditActive ? '#2563EB' : 'rgba(255,255,255,0.7)',
              border: 'none',
              cursor: editActivating ? 'wait' : 'pointer',
              fontSize: 13, fontWeight: 500,
              color: visualEditActive ? '#fff' : '#444',
              boxShadow: 'none',
              transition: 'background 120ms',
              flexShrink: 0,
              opacity: editActivating ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (!visualEditActive) e.currentTarget.style.background = '#E6E1D7'; }}
            onMouseLeave={e => { if (!visualEditActive) e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={visualEditActive ? '#fff' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3l14 9-7 1-3 7L5 3z"/>
              <path d="M19 3l-3 3M21 8l-3-1M19 13l-3-2"/>
            </svg>
            Visual edits
          </button>

          <div style={{ flex: 1 }} />

          {/* ── Recording controls ── */}
          {isRecording ? (
            <>
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleDiscardRecording}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#FFFFFF', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#555', flexShrink: 0,
                }}
              >
                <X style={{ width: 14, height: 14 }} />
              </motion.button>

              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05 }}
                onClick={handleConfirmRecording}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#111', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Check style={{ width: 15, height: 15, color: '#fff' }} />
              </motion.button>
            </>
          ) : (
            <>
              {/* Build mode dropdown */}
              <div ref={buildMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setShowBuildMenu(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    height: 32, padding: '0 8px',
                    borderRadius: 6, border: 'none',
                    background: 'transparent', cursor: 'pointer',
                    fontSize: 13, fontWeight: 500, color: '#333',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E6E1D7'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {buildMode}
                  <ChevronDown style={{ width: 13, height: 13, color: '#888' }} />
                </button>
                <AnimatePresence>
                  {showBuildMenu && (
                    <BuildMenu
                      buildMode={buildMode}
                      setBuildMode={setBuildMode}
                      setDiscussMode={setDiscussMode}
                      onClose={() => setShowBuildMenu(false)}
                      onUpgrade={onUpgrade}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Mic */}
              <button
                onClick={handleMicClick}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.7)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#555', transition: 'background 120ms', flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#E6E1D7'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.7)'}
              >
                <Mic style={{ width: 14, height: 14 }} />
              </button>

              {/* Send / Stop — no transition animation when hasContent changes */}
              {isLoading ? (
                <button onClick={onStop}
                  style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 11, height: 11, background: '#FFF', borderRadius: 2 }} />
                </button>
              ) : (
                <button onClick={handleSend} disabled={!hasContent}
                  style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
                    background: hasContent ? '#111' : '#D4CFC7',
                    border: 'none', cursor: hasContent ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    // No transition — instant state change
                  }}>
                  <ArrowUp style={{ width: 15, height: 15, color: '#FFF' }} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}