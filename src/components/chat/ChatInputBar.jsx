import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, ArrowUp, Image as ImageIcon, X, Check, FileText, ChevronRight, Pencil } from 'lucide-react';

export default function ChatInputBar({
  input,
  setInput,
  onSend,
  onStop,
  isLoading,
  files = [],
  setFiles,
  aiThemePromptActive,
  setAiThemePromptActive,
  discussMode,
  setDiscussMode,
  editMode,
  setEditMode,
}) {
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showSkillsMenu, setShowSkillsMenu] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const configRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const charLimit = 300;

  // Close config on outside click
  useEffect(() => {
    const h = (e) => {
      if (configRef.current && !configRef.current.contains(e.target)) {
        setShowAIConfig(false);
        setShowSkillsMenu(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const sh = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(sh, 48), 168)}px`;
    }
  }, [input]);

  // Paste: images/files from clipboard
  const handlePaste = useCallback(
    (e) => {
      const items = Array.from(e.clipboardData?.items || []);
      const mediaItems = items.filter(
        (it) => it.kind === 'file' && (it.type.startsWith('image/') || it.type === 'application/pdf')
      );
      if (mediaItems.length === 0) return;
      e.preventDefault();
      const parsed = mediaItems.map((it) => {
        const file = it.getAsFile();
        return { file, name: file.name || 'pasted', url: URL.createObjectURL(file), type: file.type };
      });
      setFiles((p) => [...(p || []), ...parsed]);
    },
    [setFiles]
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleSend = () => {
    if (!isLoading && (input.trim() || (files?.length || 0) > 0)) {
      // Pass files as extra context to onSend
      onSend(input, { files });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const dropped = Array.from(e.target.files || []);
    if (dropped.length > 0) {
      const parsed = dropped.map((file) => ({
        file,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      }));
      setFiles((p) => [...(p || []), ...parsed]);
    }
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) {
      const parsed = dropped.map((file) => ({
        file,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      }));
      setFiles((p) => [...(p || []), ...parsed]);
    }
  };

  const modes = [
    { id: 'creative', name: 'Creative' },
    { id: 'balanced', name: 'Balanced' },
    { id: 'precise', name: 'Precise' },
  ];

  const transition = 'transition-all duration-200';
  const hasContent = input.trim() || (files?.length || 0) > 0;

  return (
    <div className="flex flex-col w-full relative overflow-visible" ref={configRef}>

      {/* AI Config panel */}
      {showAIConfig && (
        <div
          className="absolute bottom-[calc(100%+12px)] left-0 w-[320px] bg-[#13131A] rounded-2xl p-2 shadow-2xl font-sans border border-white/[0.07] select-none z-[999]"
          style={{ animation: 'wok-slide-in 200ms ease-out both' }}
        >
          <button onClick={() => { setExpertMode(false); setShowAIConfig(false); }}
            className="w-full flex items-start text-left p-3 rounded-xl hover:bg-white/[0.06] transition-colors">
            <div className="w-7 flex-shrink-0 pt-0.5">{!expertMode && <Check className="w-4 h-4 text-indigo-400 stroke-[3]" />}</div>
            <div>
              <p className="text-sm font-semibold text-white">Flash</p>
              <p className="text-xs text-zinc-500 mt-0.5">Fastest versatile assistance</p>
            </div>
          </button>
          <button onClick={() => { setExpertMode(true); setShowAIConfig(false); }}
            className="w-full flex items-start text-left p-3 rounded-xl hover:bg-white/[0.06] transition-colors">
            <div className="w-7 flex-shrink-0 pt-0.5">{expertMode && <Check className="w-4 h-4 text-indigo-400 stroke-[3]" />}</div>
            <div>
              <p className="text-sm font-semibold text-white">Expert</p>
              <p className="text-xs text-zinc-500 mt-0.5">Advanced coding & mathematics</p>
            </div>
          </button>
        </div>
      )}

      {/* Main input container */}
      <div
        className={`bg-zinc-900 border rounded-2xl px-4 py-3 ${transition} ${
          hasContent ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-white/10'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* File previews */}
        <AnimatePresence>
          {(files?.length || 0) > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 pb-2 mb-2 overflow-x-auto border-b border-white/5">
              {files.map((file, i) => (
                <motion.div key={`${file.name}-${i}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }} className="group relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl border border-white/[0.08] bg-white/[0.05] overflow-hidden">
                    {file.type?.startsWith('image/') ? (
                      <img src={file.url} className="object-cover w-full h-full" alt="preview" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <FileText className="w-5 h-5 text-zinc-500" />
                        <span className="text-[9px] text-zinc-600 truncate px-1 max-w-full">{file.name}</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-zinc-800 border border-white/10 text-zinc-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 hover:text-white transition-all">
                    <X className="w-2.5 h-2.5" />
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
          placeholder="Describe what to build or change..."
          className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 resize-none outline-none leading-relaxed"
          style={{ minHeight: '44px', maxHeight: '160px', fontFamily: '"Open Sans", sans-serif' }}
        />

        {/* Action bar */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAIConfig(!showAIConfig)}
              className={`p-1.5 rounded-lg transition-colors relative ${showAIConfig ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-300'}`}
            >
              <Settings className="w-4 h-4" />
              {expertMode && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />}
            </button>
            <button onClick={() => fileInputRef.current.click()}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 transition-colors">
              <ImageIcon className="w-4 h-4" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,application/pdf" onChange={handleFileChange} />
          </div>

          <div className="flex items-center gap-2">
            {input.length > 0 && (
              <span className={`text-[10px] ${input.length >= charLimit ? 'text-red-500' : 'text-zinc-700'}`}>
                {input.length}/{charLimit}
              </span>
            )}
            {isLoading ? (
              <button onClick={onStop}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl p-2 transition-colors">
                <div className="w-3 h-3 bg-white rounded-[2px]" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!hasContent}
                className={`rounded-xl p-2 transition-all ${
                  hasContent
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                    : 'bg-indigo-600 text-white opacity-30 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}