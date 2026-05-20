import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Sparkles, Zap, Image as ImageIcon, X, Check, FileText } from 'lucide-react';

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
  const [expertMode, setExpertMode] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('balanced');
  const configRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const charLimit = 300;

  // Close config on outside click
  useEffect(() => {
    const h = (e) => {
      if (configRef.current && !configRef.current.contains(e.target))
        setShowAIConfig(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const sh = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(sh, 56), 168)}px`;
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
    { id: 'creative', name: 'Créatif' },
    { id: 'balanced', name: 'Équilibré' },
    { id: 'precise', name: 'Précis' },
  ];

  const transition = 'transition-all duration-200 ease-out';

  return (
    <div className={`flex flex-col w-full relative overflow-visible`} ref={configRef}>
      {aiThemePromptActive && (
        <div className="absolute -top-10 left-2 z-[999]">
          <div
            className={`bg-[#0055FF]/10 border border-[#0055FF]/30 text-[#0055FF] text-[11px] font-bold px-3 py-1.5 rounded-md flex items-center gap-2 shadow-sm ${transition}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Personnalisation de l'apparence...
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
          className={`absolute bottom-[calc(100%+12px)] left-0 w-[240px] bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl shadow-2xl z-[999] p-2 font-sans ${transition}`}
          style={{ animation: 'wok-slide-in 200ms ease-out both' }}
        >
          {/* Engine toggle */}
          <button
            onClick={() => { setExpertMode(false); setShowAIConfig(false); }}
            className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between hover:bg-[#1A1A1A] ${transition}`}
          >
            <span className="text-[13px] font-bold text-white">Moteur standard</span>
            {!expertMode && <Check className="w-4 h-4 text-[#0055FF]" />}
          </button>

          <button
            onClick={() => { setExpertMode(true); setShowAIConfig(false); }}
            className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between hover:bg-[#1A1A1A] ${transition} mt-1`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#0055FF]" />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-white leading-none">Mode Expert</span>
                <span className="text-[10.5px] text-gray-500 leading-none mt-0.5">Analyse approfondie & précision</span>
              </div>
            </div>
            {expertMode && <Check className="w-4 h-4 text-[#0055FF]" />}
          </button>

          <div className="mx-3 my-2 border-b border-[#2A2A2A]" />

          {/* Strategy */}
          <div className="space-y-0.5">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => { setSelectedStrategy(m.id); setShowAIConfig(false); }}
                className={`w-full text-left p-2 rounded-lg flex items-center justify-between ${transition} ${
                  selectedStrategy === m.id
                    ? 'bg-[#1A1A1A] text-white'
                    : 'hover:bg-[#1A1A1A] text-gray-400'
                }`}
              >
                <span className="text-[12px] font-semibold">{m.name}</span>
                {selectedStrategy === m.id && <Check className="w-3.5 h-3.5 text-[#0055FF]" />}
              </button>
            ))}
          </div>

          {expertMode && (
            <div className="mt-2 mx-1 px-3 py-2 bg-[#0055FF]/8 border border-[#0055FF]/20 rounded-lg">
              <p className="text-[10.5px] text-[#4d88ff] font-medium leading-snug">
                Raisonnement étendu · Contexte renforcé · Réponses structurées
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main input container */}
      <div
        className={`bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl flex flex-col shadow-sm focus-within:border-[#0055FF]/50 z-10 w-full overflow-hidden ${transition}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* File previews at top — appear instantly, no loading */}
        {(files?.length || 0) > 0 && (
          <div className="flex gap-2 px-4 pt-3 pb-1 overflow-x-auto">
            {files.map((file, i) => (
              <div
                key={i}
                className="group relative flex-shrink-0"
                style={{ animation: 'wok-slide-in 200ms ease-out both' }}
              >
                <div
                  className={`w-14 h-14 rounded-lg border-2 border-[#1a1a1a] outline outline-1 outline-[#000] flex items-center justify-center bg-[#0F0F0F] overflow-hidden ${transition}`}
                  style={{ boxShadow: '0 0 0 1.5px rgba(0,0,0,0.7)' }}
                >
                  {file.type?.startsWith('image/') ? (
                    <img src={file.url} className="object-cover w-full h-full" alt="preview" />
                  ) : (
                    <FileText className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                {/* Remove button — top-left, appears on hover/touch */}
                <button
                  onClick={() => removeFile(i)}
                  className={`absolute -top-1.5 -left-1.5 w-5 h-5 bg-[#0a0a0a] border border-[#3a3a3a] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 ${transition} hover:bg-red-600 hover:border-red-500`}
                  aria-label="Supprimer le fichier"
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
              ? "Décrivez le changement d'apparence..."
              : expertMode
              ? 'Mode Expert activé — posez votre question...'
              : 'Message Wok...'
          }
          className="w-full bg-transparent text-[15px] text-white placeholder:text-gray-500 focus:outline-none resize-none leading-relaxed px-4 pt-4 pb-2"
          style={{ fontFamily: '"Open Sans", sans-serif' }}
        />

        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAIConfig(!showAIConfig)}
              className={`p-2 rounded-md ${transition} active:scale-95 relative ${
                showAIConfig ? 'bg-[#2A2A2A] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
              }`}
            >
              <Settings className="w-4 h-4" />
              {expertMode && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#0055FF] rounded-full" />
              )}
            </button>

            <button
              onClick={() => fileInputRef.current.click()}
              className={`p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-md ${transition} active:scale-95`}
            >
              <ImageIcon className="w-4 h-4" />
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
              className={`text-[11px] font-bold ${
                input.length >= charLimit ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {input.length}/{charLimit}
            </span>

            {isLoading ? (
              <button
                onClick={onStop}
                className={`w-9 h-9 bg-[#0055FF] text-white rounded-[10px] flex items-center justify-center shadow-sm hover:bg-[#0044CC] active:scale-95 ${transition}`}
              >
                <div className="w-3 h-3 bg-white rounded-[2px]" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() && (files?.length || 0) === 0}
                className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${transition} active:scale-95 shadow-sm ${
                  input.trim() || (files?.length || 0) > 0
                    ? 'bg-[#0055FF] text-white hover:bg-[#0044CC]'
                    : 'bg-[#2A2A2A] text-gray-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}