import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, ArrowUp, X, Check, FileText, Plus } from 'lucide-react';

export default function ChatInputBar({
  input, setInput, onSend, onStop, isLoading,
  files = [], setFiles,
  discussMode, setDiscussMode, editMode, setEditMode,
}) {
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const [editModeEnabled, setEditModeEnabled] = useState(false);
  
  const configRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null); // Added AbortController reference
  
  const charLimit = 300;

  // Cleanup abort controller on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const h = (e) => { if (configRef.current && !configRef.current.contains(e.target)) setShowAIConfig(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`;
    }
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

  const handleSend = () => {
    if (!isLoading && (input.trim() || (files?.length || 0) > 0)) {
      abortControllerRef.current = new AbortController();
      // Pass the signal to the parent function to abort the fetch request
      onSend(input, { files, signal: abortControllerRef.current.signal }); 
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (onStop) onStop();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = (e) => {
    const dropped = Array.from(e.target.files || []);
    if (dropped.length) setFiles(p => [...(p||[]), ...dropped.map(f => ({ file: f, name: f.name, url: URL.createObjectURL(f), type: f.type }))]);
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  const hasContent = !!(input.trim() || (files?.length || 0) > 0);

  return (
    <div ref={configRef} style={{ padding: '8px 14px 16px 14px', position: 'relative' }}>

      {/* AI config popup */}
      {showAIConfig && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 4px)', left: 14,
          width: 240, background: '#FFFFFF', borderRadius: 10, padding: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)', border: '1px solid #E0E0E0', zIndex: 999,
        }}>
          {[{ id: false, label: 'Flash', desc: 'Fastest versatile assistance' }, { id: true, label: 'Expert', desc: 'Advanced coding & mathematics' }].map(({ id, label, desc }) => (
            <button key={label} onClick={() => { setExpertMode(id); setShowAIConfig(false); }}
              style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 10px', borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 14, flexShrink: 0, paddingTop: 2 }}>
                {expertMode === id && <Check style={{ width: 12, height: 12, color: '#111', strokeWidth: 3 }} />}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111' }}>{label}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#999' }}>{desc}</p>
              </div>
            </button>
          ))}
          
          {/* Divider */}
          <div style={{ height: '1px', background: '#E0E0E0', margin: '6px 0' }} />
          
          {/* Edit mode button */}
          <button
            onClick={() => {
              setEditModeEnabled(!editModeEnabled);
              if (setEditMode) setEditMode(!editModeEnabled);
              setShowAIConfig(false);
            }}
            style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 10px', borderRadius: 7, border: 'none', background: editModeEnabled ? '#F0F0F0' : 'transparent', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = editModeEnabled ? '#E8E8E8' : '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = editModeEnabled ? '#F0F0F0' : 'transparent'}
          >
            <div style={{ width: 14, flexShrink: 0, paddingTop: 2 }}>
              {editModeEnabled && <Check style={{ width: 12, height: 12, color: '#111', strokeWidth: 3 }} />}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111' }}>Edit</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#999' }}>Modify existing project</p>
            </div>
          </button>
        </div>
      )}

      {/* File previews above input */}
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

      {/* ── PILL INPUT BAR — full-width pill, height ~44px ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#FFFFFF', border: '1px solid #E0E0E0',
        borderRadius: 24, padding: '0 12px', height: 44,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {/* Left icons: gear + plus - BLACK color */}
        <button
          onClick={() => setShowAIConfig(v => !v)}
          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#111111', display: 'flex', alignItems: 'center', padding: 2 }}
          onMouseEnter={e => e.currentTarget.style.color = '#333333'}
          onMouseLeave={e => e.currentTarget.style.color = '#111111'}
        >
          <Settings style={{ width: 16, height: 16 }} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#111111', display: 'flex', alignItems: 'center', padding: 2 }}
          onMouseEnter={e => e.currentTarget.style.color = '#333333'}
          onMouseLeave={e => e.currentTarget.style.color = '#111111'}
        >
          <Plus style={{ width: 16, height: 16 }} />
        </button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} multiple accept="image/*,application/pdf" onChange={handleFileChange} />

        {/* Center: textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value.substring(0, charLimit))}
          onKeyDown={handleKeyDown}
          placeholder="What would you like to change?"
          style={{
            flex: 1, background: 'transparent', outline: 'none', border: 'none',
            resize: 'none', height: 22, maxHeight: 80, overflowY: 'hidden',
            fontSize: 13, color: '#111111', lineHeight: 1.5,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
          className="placeholder:text-[#AAAAAA]"
          rows={1}
        />

        {/* Right: send button — solid black circle */}
        {isLoading ? (
          <button
            onClick={handleStop}
            style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => e.currentTarget.style.background = '#333'}
            onMouseLeave={e => e.currentTarget.style.background = '#111'}
          >
            <div style={{ width: 12, height: 12, background: '#FFF', borderRadius: 2 }} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!hasContent}
            style={{
              flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
              background: '#111111', border: 'none',
              cursor: hasContent ? 'pointer' : 'not-allowed',
              opacity: hasContent ? 1 : 0.4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'opacity 150ms, background 150ms',
            }}
            onMouseEnter={e => { if (hasContent) e.currentTarget.style.background = '#333'; }}
            onMouseLeave={e => { if (hasContent) e.currentTarget.style.background = '#111111'; }}
          >
            <ArrowUp style={{ width: 16, height: 16, color: '#FFFFFF' }} />
          </button>
        )}
      </div>
    </div>
  );
}