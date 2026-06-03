import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, X, FileText, Plus, Mic, ChevronDown } from 'lucide-react';

// Visual Edits icon (cursor + pencil)
const VisualEditsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
  </svg>
);

export default function ChatInputBar({
  input, setInput, onSend, onStop, isLoading,
  files = [], setFiles,
  discussMode, setDiscussMode, editMode, setEditMode,
}) {
  const [buildMode, setBuildMode] = useState('Build');
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const buildMenuRef = useRef(null);

  // Auto-resize textarea upward — default 4 rows
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 20; // ~1.5 * 13px font
    const minH = lineHeight * 4;
    const newH = Math.max(minH, el.scrollHeight);
    el.style.height = `${newH}px`;
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

  const handleSend = () => {
    if (!isLoading && (input.trim() || (files?.length || 0) > 0)) {
      onSend(input, { files });
    }
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

  // Shared border-radius matches preview container (10px)
  const BAR_RADIUS = 10;

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
        borderRadius: BAR_RADIUS,
        boxShadow: 'none',
        overflow: 'hidden',
      }}>
        {/* Placeholder text area */}
        <div style={{ padding: '14px 14px 0' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell Lovable what to do instead..."
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

        {/* Bottom toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '10px 10px 10px',
          gap: 6,
        }}>
          {/* Plus button */}
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
            onClick={() => { if (setEditMode) setEditMode(e => !e); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 12px',
              borderRadius: 999,
              background: editMode ? '#EEF0FF' : '#F5F5F3',
              border: editMode ? '1px solid #C7CAFF' : '1px solid #E4E4E2',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              color: editMode ? '#4F46E5' : '#444',
              transition: 'background 120ms, border 120ms',
              flexShrink: 0,
            }}
            onMouseEnter={e => { if (!editMode) e.currentTarget.style.background = '#ECECEA'; }}
            onMouseLeave={e => { if (!editMode) e.currentTarget.style.background = '#F5F5F3'; }}
          >
            <VisualEditsIcon />
            Visual edits
          </button>

          <div style={{ flex: 1 }} />

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
                    <button key={m} onClick={() => { setBuildMode(m); setShowBuildMenu(false); if (setDiscussMode) setDiscussMode(m === 'Discuss'); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '7px 10px', border: 'none',
                        background: 'transparent', borderRadius: 7,
                        cursor: 'pointer', fontSize: 13, color: '#333',
                        fontFamily: 'Inter, sans-serif',
                      }}
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

          {/* Mic button */}
          <button
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
            <button
              onClick={onStop}
              style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{ width: 11, height: 11, background: '#FFF', borderRadius: 2 }} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!hasContent}
              style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
                background: hasContent ? '#111' : '#DDDDD9',
                border: 'none', cursor: hasContent ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 150ms',
              }}
            >
              <ArrowUp style={{ width: 15, height: 15, color: '#FFF' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}