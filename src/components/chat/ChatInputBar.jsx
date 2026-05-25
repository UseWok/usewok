import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, ArrowUp, X, Check, FileText, Plus } from 'lucide-react';

export default function ChatInputBar({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
  files = [],
  setFiles,
  discussMode,
  setDiscussMode,
  editMode,
  setEditMode,
}) {
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const configRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const charLimit = 300;

  // Close config on outside click
  useEffect(() => {
    const h = (e) => {
      if (configRef.current && !configRef.current.contains(e.target)) setShowAIConfig(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const sh = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(sh, 40), 120)}px`;
    }
  }, [input]);

  // Paste images/files
  const handlePaste = useCallback((e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const mediaItems = items.filter(it => it.kind === 'file' && (it.type.startsWith('image/') || it.type === 'application/pdf'));
    if (!mediaItems.length) return;
    e.preventDefault();
    setFiles(p => [...(p || []), ...mediaItems.map(it => {
      const file = it.getAsFile();
      return { file, name: file.name || 'pasted', url: URL.createObjectURL(file), type: file.type };
    })]);
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
    if (dropped.length > 0) {
      setFiles(p => [...(p || []), ...dropped.map(file => ({ file, name: file.name, url: URL.createObjectURL(file), type: file.type }))]);
    }
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) {
      setFiles(p => [...(p || []), ...dropped.map(file => ({ file, name: file.name, url: URL.createObjectURL(file), type: file.type }))]);
    }
  };

  const hasContent = !!(input.trim() || (files?.length || 0) > 0);

  return (
    <div
      ref={configRef}
      style={{ padding: '8px 12px 14px 12px', position: 'relative' }}
    >
      {/* AI Config popup */}
      {showAIConfig && (
        <div
          style={{
            position: 'absolute', bottom: 'calc(100% + 6px)', left: 12,
            width: 260, background: '#FFFFFF', borderRadius: 12, padding: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)', border: '1px solid #E5E5E5',
            zIndex: 999,
          }}
        >
          {[
            { id: false, label: 'Flash', desc: 'Fastest versatile assistance' },
            { id: true,  label: 'Expert', desc: 'Advanced coding & mathematics' },
          ].map(({ id, label, desc }) => (
            <button
              key={label}
              onClick={() => { setExpertMode(id); setShowAIConfig(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 12px', borderRadius: 8, border: 'none', background: 'transparent',
                cursor: 'pointer', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F4F4F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 16, flexShrink: 0, paddingTop: 2 }}>
                {expertMode === id && <Check style={{ width: 13, height: 13, color: '#18181B', strokeWidth: 3 }} />}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#18181B' }}>{label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#A1A1AA' }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input container — white card, rounded, subtle border */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E2E2',
          borderRadius: 18,
          padding: '12px 14px 10px 14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}
      >
        {/* File previews */}
        <AnimatePresence>
          {(files?.length || 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', gap: 8, paddingBottom: 10, marginBottom: 8, overflowX: 'auto', borderBottom: '1px solid #F0F0F0' }}
            >
              {files.map((file, i) => (
                <motion.div key={`${file.name}-${i}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                  style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 10, border: '1px solid #E5E5E5', background: '#F4F4F5', overflow: 'hidden' }}>
                    {file.type?.startsWith('image/') ? (
                      <img src={file.url} style={{ objectFit: 'cover', width: '100%', height: '100%' }} alt="preview" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <FileText style={{ width: 14, height: 14, color: '#A1A1AA' }} />
                        <span style={{ fontSize: 9, color: '#71717A', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeFile(i)}
                    style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, background: '#18181B', color: '#FFF', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X style={{ width: 10, height: 10 }} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value.substring(0, charLimit))}
          onKeyDown={handleKeyDown}
          placeholder="What would you like to change?"
          style={{
            width: '100%', background: 'transparent', outline: 'none', border: 'none',
            resize: 'none', minHeight: 40, maxHeight: 120, overflowY: 'auto',
            fontSize: 14, color: '#18181B', lineHeight: 1.5,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
          className="placeholder:text-zinc-400"
        />

        {/* Bottom action bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '1px solid #F0F0F0' }}>
          {/* Left: gear + plus */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setShowAIConfig(v => !v)}
              style={{ padding: 4, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: '#A1A1AA', display: 'flex', alignItems: 'center', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#52525B'}
              onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}
            >
              <Settings style={{ width: 18, height: 18 }} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: 4, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', color: '#A1A1AA', display: 'flex', alignItems: 'center', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = '#52525B'}
              onMouseLeave={e => e.currentTarget.style.color = '#A1A1AA'}
            >
              <Plus style={{ width: 18, height: 18 }} />
            </button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*,application/pdf" onChange={handleFileChange} />
          </div>

          {/* Right: send / stop */}
          {isLoading ? (
            <button
              onClick={onStop}
              style={{
                width: 36, height: 36, borderRadius: 10, background: '#18181B', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#3F3F46'}
              onMouseLeave={e => e.currentTarget.style.background = '#18181B'}
            >
              <div style={{ width: 14, height: 14, background: '#FFFFFF', borderRadius: 3 }} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!hasContent}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: hasContent ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: hasContent ? '#18181B' : '#18181B',
                opacity: hasContent ? 1 : 0.45,
                boxShadow: hasContent ? '0 1px 3px rgba(0,0,0,0.20)' : 'none',
                transition: 'opacity 150ms, background 150ms',
              }}
              onMouseEnter={e => { if (hasContent) e.currentTarget.style.background = '#3F3F46'; }}
              onMouseLeave={e => { if (hasContent) e.currentTarget.style.background = '#18181B'; }}
            >
              <ArrowUp style={{ width: 18, height: 18, color: '#FFFFFF' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}