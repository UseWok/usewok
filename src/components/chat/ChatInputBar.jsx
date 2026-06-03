import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, X, FileText, Plus, Mic, ChevronDown, Check } from 'lucide-react';

// ── Visual Edits icon (cursor + rotate, matches Lovable) ──
const VisualEditsIcon = ({ active }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2H3v16h5v4l4-4h5l4-4V2zM11 11V7M16 11V7" />
    <path d="M8 11V9"/>
  </svg>
);

// Simpler, cleaner icon matching the image (palette/cursor hybrid)
const EditIcon = ({ active }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#555'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ── Waveform: expressive, varied heights, fluid ──
const BAR_COUNT = 28;
const BAR_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const center = BAR_COUNT / 2;
  const dist = Math.abs(i - center) / center;
  return Math.max(6, Math.round((1 - dist * 0.5) * 28 + Math.sin(i * 1.3) * 8));
});

function Waveform() {
  return (
    <div style={{
      flex: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 3, height: 36, padding: '0 8px',
    }}>
      {BAR_HEIGHTS.map((baseH, i) => (
        <motion.div
          key={i}
          animate={{
            height: [
              baseH * 0.4,
              baseH * (0.8 + Math.random() * 0.8),
              baseH * 0.3,
              baseH * (1 + Math.random() * 0.6),
              baseH * 0.4,
            ],
            opacity: [0.5, 1, 0.6, 1, 0.5],
          }}
          transition={{
            duration: 0.9 + (i % 5) * 0.15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.038,
          }}
          style={{
            width: 3,
            borderRadius: 999,
            background: `hsl(${220 + i * 1.5}, 70%, 45%)`,
            flexShrink: 0,
            minHeight: 3,
          }}
        />
      ))}
    </div>
  );
}

export default function ChatInputBar({
  input, setInput, onSend, onStop, isLoading,
  files = [], setFiles,
  discussMode, setDiscussMode, editMode, setEditMode,
}) {
  const [buildMode, setBuildMode] = useState('Build');
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const buildMenuRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(20 * 4, el.scrollHeight)}px`;
  }, [input]);

  // Close build dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (buildMenuRef.current && !buildMenuRef.current.contains(e.target)) setShowBuildMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

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

  // ── Mic ──
  const handleMicClick = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
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
  };

  const handleDiscardRecording = () => {
    mediaRecorderRef.current?.stop();
    stopStream();
    setIsRecording(false);
    setRecordingDuration(0);
    chunksRef.current = [];
  };

  // On confirm: append "[Voice note]" placeholder to input text
  const handleConfirmRecording = () => {
    mediaRecorderRef.current?.stop();
    stopStream();
    setIsRecording(false);
    setRecordingDuration(0);
    // Append a voice note marker to the textarea
    setInput(prev => (prev ? prev + ' ' : '') + '[Voice note]');
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

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));
  const hasContent = !!(input.trim() || (files?.length || 0) > 0);
  const BUILD_MODES = ['Build', 'Discuss'];

  return (
    <div style={{ padding: '0 10px 10px', fontFamily: 'Inter, system-ui, sans-serif' }}>

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
        background: '#FFFFFF',
        border: '1px solid #E4E4E2',
        borderRadius: 12,
        overflow: 'hidden',
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
              style={{ padding: '10px 14px 0', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              {/* Red pulsing dot */}
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }}
              />
              <Waveform />
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
              {/* Design chip inside card, above textarea — only when editMode */}
              <AnimatePresence>
                {editMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.16 }}
                    style={{ paddingLeft: 14, paddingRight: 14, overflow: 'hidden' }}
                  >
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 999,
                      background: '#F0F0EE', border: '1px solid #E0E0DE',
                      fontSize: 12, fontWeight: 500, color: '#444',
                    }}>
                      {/* Palette icon */}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <circle cx="8" cy="14" r="1" fill="#555" stroke="none"/>
                        <circle cx="12" cy="9" r="1" fill="#555" stroke="none"/>
                        <circle cx="16" cy="14" r="1" fill="#555" stroke="none"/>
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
                  placeholder="Ask Lovable..."
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

          {/* Plus */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'transparent', border: '1px solid #E4E4E2',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#555', transition: 'background 120ms', flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Plus style={{ width: 15, height: 15 }} />
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*,application/pdf" onChange={handleFileChange} />

          {/* Visual edits pill */}
          <button
            onClick={() => { if (setEditMode) setEditMode(v => !v); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 12px',
              borderRadius: 999,
              background: editMode ? '#1740B0' : '#F5F5F3',
              border: editMode ? '1px solid #1233A0' : '1px solid #E4E4E2',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              color: editMode ? '#fff' : '#444',
              transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
              flexShrink: 0,
              boxShadow: editMode ? '0 2px 8px rgba(23,64,176,0.25)' : 'none',
            }}
            onMouseEnter={e => { if (!editMode) e.currentTarget.style.background = '#ECECEA'; }}
            onMouseLeave={e => { if (!editMode) e.currentTarget.style.background = '#F5F5F3'; }}
          >
            {/* Cursor + arrows icon (matches Lovable image) */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={editMode ? '#fff' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3l14 9-7 1-3 7L5 3z"/>
              <path d="M19 3l-3 3M21 8l-3-1M19 13l-3-2"/>
            </svg>
            Visual edits
          </button>

          <div style={{ flex: 1 }} />

          {/* ── Recording controls ── */}
          {isRecording ? (
            <>
              {/* Discard */}
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleDiscardRecording}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#F5F5F3', border: '1px solid #E4E4E2',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#555', flexShrink: 0,
                }}
              >
                <X style={{ width: 14, height: 14 }} />
              </motion.button>

              {/* Confirm */}
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
                    height: 32, padding: '0 12px',
                    borderRadius: 999, border: '1px solid #E4E4E2',
                    background: '#F5F5F3', cursor: 'pointer',
                    fontSize: 13, fontWeight: 500, color: '#333',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ECECEA'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F5F5F3'}
                >
                  {buildMode}
                  <ChevronDown style={{ width: 13, height: 13, color: '#888' }} />
                </button>
                <AnimatePresence>
                  {showBuildMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.1 }}
                      style={{
                        position: 'absolute', bottom: 'calc(100% + 6px)', right: 0,
                        background: '#fff', border: '1px solid #E4E4E2',
                        borderRadius: 10, padding: 4, minWidth: 130,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 999,
                      }}
                    >
                      {BUILD_MODES.map(m => (
                        <button key={m}
                          onClick={() => { setBuildMode(m); setShowBuildMenu(false); if (setDiscussMode) setDiscussMode(m === 'Discuss'); }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '7px 10px', border: 'none', background: 'transparent', borderRadius: 7, cursor: 'pointer', fontSize: 13, color: '#333', fontFamily: 'Inter, sans-serif' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {m}
                          {buildMode === m && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#111', display: 'inline-block' }} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mic */}
              <button
                onClick={handleMicClick}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#F5F5F3', border: '1px solid #E4E4E2',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#555', transition: 'background 120ms', flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#ECECEA'}
                onMouseLeave={e => e.currentTarget.style.background = '#F5F5F3'}
              >
                <Mic style={{ width: 14, height: 14 }} />
              </button>

              {/* Send / Stop */}
              {isLoading ? (
                <button onClick={onStop}
                  style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 11, height: 11, background: '#FFF', borderRadius: 2 }} />
                </button>
              ) : (
                <button onClick={handleSend} disabled={!hasContent}
                  style={{
                    flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
                    background: hasContent ? '#111' : '#DDDDD9',
                    border: 'none', cursor: hasContent ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 150ms',
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