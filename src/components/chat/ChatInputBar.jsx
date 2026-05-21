import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Sparkles, Image as ImageIcon, X, Check, FileText, ChevronRight } from 'lucide-react';

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

  // Flawless Auto-resize textarea
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
    if (!isLoading && (input.trim() || (files?.length || 0) > 0)) onSend(input);
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

  // Drag-over on textarea to accept files
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

  return (
    <div className={`flex flex-col w-full relative overflow-visible`} ref={configRef}>
      {aiThemePromptActive && (
        <div className="absolute -top-10 left-4 z-[999]">
          <div
            className={`bg-[#0055FF]/10 border border-[#0055FF]/30 text-[#0055FF] text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm ${transition}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Customizing appearance...
            <button
              onClick={() => setAiThemePromptActive(false)}
              className={`hover:bg-[#0055FF]/20 text-white rounded-full p-0.5 ml-1 ${transition}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* AI Config panel */}
      {showAIConfig && (
        <div
          className={`absolute bottom-[calc(100%+16px)] left-0 w-[340px] bg-[#1E1F22] rounded-[24px] p-2 shadow-2xl font-sans border border-[#333538] select-none z-[999] ${transition}`}
          style={{ animation: 'wok-slide-in 200ms ease-out both' }}
        >
          {/* Flash Mode (Standard Engine) */}
          <button
            onClick={() => { setExpertMode(false); setShowAIConfig(false); }}
            className="w-full flex items-start text-left p-3 rounded-[16px] transition-colors duration-200 hover:bg-[#2A2B2E]"
          >
            <div className="w-8 flex-shrink-0 flex items-center justify-start pt-0.5">
              {!expertMode && <Check className="w-5 h-5 text-white stroke-[3]" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-white leading-snug">Flash</span>
              <span className="text-[14px] text-[#A0A2A5] mt-0.5">Fastest versatile assistance</span>
            </div>
          </button>

          {/* Expert Mode (Advanced Engine) */}
          <button
            onClick={() => { setExpertMode(true); setShowAIConfig(false); }}
            className="w-full flex items-start text-left p-3 rounded-[16px] transition-colors duration-200 hover:bg-[#2A2B2E]"
          >
            <div className="w-8 flex-shrink-0 flex items-center justify-start pt-0.5">
              {expertMode && <Check className="w-5 h-5 text-white stroke-[3]" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-white leading-snug">Expert</span>
              <span className="text-[14px] text-[#A0A2A5] mt-0.5">Advanced coding and mathematics</span>
            </div>
          </button>

          {/* Divider */}
          <div className="h-[1px] bg-[#333538] my-1 mx-4" />

          {/* Skills Menu Trigger */}
          <div 
            className="relative"
            onMouseEnter={() => setShowSkillsMenu(true)}
            onMouseLeave={() => setShowSkillsMenu(false)}
          >
            <button
              onClick={() => setShowSkillsMenu(!showSkillsMenu)}
              className="w-full flex items-center justify-between text-left p-3 rounded-[16px] transition-colors duration-200 hover:bg-[#2A2B2E]"
            >
              <div className="flex items-start">
                <div className="w-8 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-white leading-snug">Skills</span>
                  <span className="text-[14px] text-[#A0A2A5] mt-0.5 capitalize">
                    {modes.find((m) => m.id === selectedStrategy)?.name || 'Standard'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#A0A2A5] mr-1" />
            </button>

            {/* Flyout Sub-menu for Skills */}
            {showSkillsMenu && (
              <div className="absolute left-[calc(100%+8px)] bottom-0 w-[260px] bg-[#1E1F22] rounded-[24px] p-2 shadow-2xl border border-[#333538] z-50">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { 
                      setSelectedStrategy(m.id); 
                      setShowAIConfig(false); 
                      setShowSkillsMenu(false); 
                    }}
                    className="w-full flex items-center text-left p-3 rounded-[16px] transition-colors duration-200 hover:bg-[#2A2B2E]"
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

      {/* Main input container (Sleek Gemini-style) */}
      <div
        className={`bg-[#131313] hover:bg-[#181818] focus-within:bg-[#1A1A1A] border border-transparent focus-within:border-[#333333] rounded-[28px] flex flex-col z-10 w-full overflow-hidden ${transition} shadow-[0_0_20px_rgba(0,0,0,0.2)]`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* File previews at top */}
        {(files?.length || 0) > 0 && (
          <div className="flex gap-2 px-5 pt-3 pb-1 overflow-x-auto">
            {files.map((file, i) => (
              <div
                key={i}
                className="group relative flex-shrink-0"
                style={{ animation: 'wok-slide-in 200ms ease-out both' }}
              >
                <div
                  className={`w-14 h-14 rounded-xl border-2 border-[#1a1a1a] outline outline-1 outline-[#000] flex items-center justify-center bg-[#0F0F0F] overflow-hidden ${transition}`}
                >
                  {file.type?.startsWith('image/') ? (
                    <img src={file.url} className="object-cover w-full h-full" alt="preview" />
                  ) : (
                    <FileText className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className={`absolute -top-1.5 -left-1.5 w-5 h-5 bg-[#0a0a0a] border border-[#3a3a3a] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 ${transition} hover:bg-red-600 hover:border-red-500`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

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
          className="w-full bg-transparent text-[15px] text-white placeholder:text-gray-500 focus:outline-none resize-none leading-relaxed px-5 pt-3.5 pb-1"
          style={{ fontFamily: '"Open Sans", sans-serif' }}
        />

        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAIConfig(!showAIConfig)}
              className={`p-2 rounded-full ${transition} active:scale-95 relative ${
                showAIConfig ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <Settings className="w-[18px] h-[18px]" />
              {expertMode && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#0055FF] rounded-full" />
              )}
            </button>

            <button
              onClick={() => fileInputRef.current.click()}
              className={`p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-full ${transition} active:scale-95`}
            >
              <ImageIcon className="w-[18px] h-[18px]" />
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
                input.length >= charLimit ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              {input.length > 0 ? `${input.length}/${charLimit}` : ''}
            </span>

            {isLoading ? (
              <button
                onClick={onStop}
                className={`w-9 h-9 bg-[#0055FF] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#0044CC] active:scale-95 ${transition}`}
              >
                <div className="w-3 h-3 bg-white rounded-[2px]" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() && (files?.length || 0) === 0}
                className={`w-9 h-9 rounded-full flex items-center justify-center ${transition} active:scale-95 ${
                  input.trim() || (files?.length || 0) > 0
                    ? 'bg-white text-[#0F0F0F] hover:bg-gray-200 shadow-md'
                    : 'bg-[#2A2A2A] text-gray-500 cursor-not-allowed opacity-50'
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