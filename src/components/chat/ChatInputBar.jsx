import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, Sparkles, Image as ImageIcon, X, Check, FileText, ChevronRight, Pencil } from 'lucide-react';

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

  const transition = 'transition-all duration-300 ease-[cubic-bezier(0,0,0.2,1)]';

  // Light mode uses soft off-white; dark mode keeps dark surface
  const containerBg = 'bg-white/[0.04] hover:bg-white/[0.055] focus-within:bg-white/[0.06]';
  const borderStyle = 'border border-white/[0.07] focus-within:border-white/[0.12]';
  const textColor = 'text-zinc-100 placeholder:text-zinc-600';
  const iconColor = 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.07]';

  return (
    <div className={`flex flex-col w-full relative overflow-visible`} ref={configRef}>
      {aiThemePromptActive && (
        <div className="absolute -top-10 left-4 z-[999]">
          <div className={`bg-primary/10 border border-primary/30 text-primary text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm ${transition}`}>
            <Sparkles className="w-3.5 h-3.5" />
            Customizing appearance...
            <button onClick={() => setAiThemePromptActive(false)} className={`hover:bg-[#0055FF]/20 rounded-full p-0.5 ml-1 ${transition}`}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* AI Config panel */}
      {showAIConfig && (
        <div
          className={`absolute bottom-[calc(100%+16px)] left-0 w-[340px] bg-[#13131A] rounded-2xl p-2 shadow-2xl font-sans border border-white/[0.07] select-none z-[999] ${transition}`}
          style={{ animation: 'wok-slide-in 200ms ease-out both' }}
        >
          <button
            onClick={() => { setExpertMode(false); setShowAIConfig(false); }}
            className="w-full flex items-start text-left p-3 rounded-xl transition-colors duration-200 hover:bg-white/[0.06]"
          >
            <div className="w-8 flex-shrink-0 flex items-center justify-start pt-0.5">
              {!expertMode && <Check className="w-5 h-5 text-white stroke-[3]" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-white leading-snug">Flash</span>
              <span className="text-[14px] text-zinc-500 mt-0.5">Fastest versatile assistance</span>
            </div>
          </button>

          <button
            onClick={() => { setExpertMode(true); setShowAIConfig(false); }}
            className="w-full flex items-start text-left p-3 rounded-xl transition-colors duration-200 hover:bg-white/[0.06]"
          >
            <div className="w-8 flex-shrink-0 flex items-center justify-start pt-0.5">
              {expertMode && <Check className="w-5 h-5 text-white stroke-[3]" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-white leading-snug">Expert</span>
              <span className="text-[14px] text-zinc-500 mt-0.5">Advanced coding and mathematics</span>
            </div>
          </button>

          <div className="h-[1px] bg-white/[0.06] my-1 mx-4" />

          <div
            className="relative"
            onMouseEnter={() => setShowSkillsMenu(true)}
            onMouseLeave={() => setShowSkillsMenu(false)}
          >
            <button
              onClick={() => setShowSkillsMenu(!showSkillsMenu)}
              className="w-full flex items-center justify-between text-left p-3 rounded-xl transition-colors duration-200 hover:bg-white/[0.06]"
            >
              <div className="flex items-start">
                <div className="w-8 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-white leading-snug">Skills</span>
                  <span className="text-[14px] text-zinc-500 mt-0.5 capitalize">
                    {modes.find((m) => m.id === selectedStrategy)?.name || 'Standard'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 mr-1" />
            </button>

            {showSkillsMenu && (
              <div className="absolute left-[calc(100%+8px)] bottom-0 w-[260px] bg-[#13131A] rounded-2xl p-2 shadow-2xl border border-white/[0.07] z-50">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedStrategy(m.id); setShowAIConfig(false); setShowSkillsMenu(false); }}
                    className="w-full flex items-center text-left p-3 rounded-xl transition-colors duration-200 hover:bg-white/[0.06]"
                  >
                    <div className="w-8 flex-shrink-0 flex items-center justify-start">
                      {selectedStrategy === m.id && <Check className="w-5 h-5 text-white stroke-[3]" />}
                    </div>
                    <span className="text-[15px] font-semibold text-white">{m.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main input container */}
      <div
        className={`${containerBg} ${borderStyle} rounded-[28px] flex flex-col z-10 w-full overflow-hidden ${transition} shadow-sm`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Large image previews */}
        <AnimatePresence>
          {(files?.length || 0) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-3 px-4 pt-3 pb-1 overflow-x-auto"
            >
              <AnimatePresence>
                {files.map((file, i) => (
                  <motion.div
                    key={`${file.name}-${i}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.22, ease: 'easeInOut' } }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="group relative flex-shrink-0"
                  >
                    <div className="w-24 h-24 rounded-2xl border border-white/[0.08] bg-white/[0.05] overflow-hidden shadow-sm">
                      {file.type?.startsWith('image/') ? (
                        <img src={file.url} className="object-cover w-full h-full" alt="preview" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <FileText className="w-8 h-8 text-[#9CA3AF]" />
                          <span className="text-[10px] text-[#9CA3AF] font-medium truncate px-2 max-w-full">{file.name}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className={`absolute -top-2 -right-2 w-6 h-6 bg-[#13131A] border border-white/[0.12] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 ${transition} hover:bg-red-600 hover:border-red-500 shadow-md`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value.substring(0, charLimit))}
          onKeyDown={handleKeyDown}
          placeholder={
            aiThemePromptActive
              ? "Describe the change in appearance..."
              : expertMode
              ? 'Expert mode activated — ask your question...'
              : 'Message Wok...'
          }
          className={`w-full bg-transparent text-[15px] ${textColor} focus:outline-none resize-none leading-relaxed px-5 pt-3.5 pb-1`}
          style={{ fontFamily: '"Open Sans", sans-serif' }}
        />

        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAIConfig(!showAIConfig)}
              className={`p-2 rounded-full ${transition} active:scale-95 relative ${
                showAIConfig ? 'bg-white/[0.10] text-white' : `${iconColor}`
              }`}
            >
              <Settings className="w-[18px] h-[18px]" />
              {expertMode && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </button>

            <button
              onClick={() => fileInputRef.current.click()}
              className={`p-2 rounded-full ${transition} active:scale-95 ${iconColor}`}
            >
              <ImageIcon className="w-[18px] h-[18px]" />
            </button>

            {/* Edit mode toggle */}
            <button
              onClick={() => setEditMode && setEditMode(v => !v)}
              title={editMode ? 'Mode Édition actif — l\'IA modifie le code existant' : 'Mode Édition — cliquez pour modifier plutôt que recréer'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold ${transition} active:scale-95 ${
                editMode
                  ? 'bg-violet-500/20 text-violet-500 border border-violet-500/40'
                  : `${iconColor} border border-transparent`
              }`}
            >
              <Pencil className="w-[15px] h-[15px]" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex items-center gap-3 pr-1">
            <span
            className={`text-[11px] font-medium transition-colors ${
            input.length >= charLimit ? 'text-red-500' : 'text-zinc-600'
            }`}
            >
              {input.length > 0 ? `${input.length}/${charLimit}` : ''}
            </span>

            {isLoading ? (
              <button
                onClick={onStop}
                className={`w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center shadow-indigo hover:bg-primary/90 active:scale-95 ${transition}`}
              >
                <div className="w-3 h-3 bg-white rounded-[2px]" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() && (files?.length || 0) === 0}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${transition} active:scale-95 ${
                  input.trim() || (files?.length || 0) > 0
                    ? 'bg-primary text-white hover:bg-primary/90 shadow-indigo'
                    : 'bg-white/[0.06] text-zinc-600 cursor-not-allowed opacity-40'
                }`}
              >
                <Sparkles className="w-[18px] h-[18px]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}