import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw, ExternalLink, ArrowLeft, Mail, ChevronDown, ChevronsRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const XIcon = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>);
const LinkedInIcon = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>);
const FacebookIcon = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>);
const WhatsAppIcon = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>);

const Toggle = ({ enabled, onChange }) => (
  <button onClick={onChange} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ease-in-out ${enabled ? 'bg-[#0055FF]' : 'bg-[#2A2A2A]'}`}>
    <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out" style={{ transform: enabled ? 'translateX(18px)' : 'translateX(2px)' }} />
  </button>
);

export default function WorkspaceHeader({
  onReloadIframe,
  onReload,
  convId,
  projectNumber,
  discussions = [],
  onSelectDiscussion,
  onTogglePreview,
}) {
  const [showPublish, setShowPublish] = useState(false);
  const [publishView, setPublishView] = useState('main');
  const [isPublished, setIsPublished] = useState(false);
  const [customSlug, setCustomSlug] = useState(convId || `conv_${Date.now().toString().slice(-6)}`);
  const [tempSlug, setTempSlug] = useState(customSlug);
  const [isPublic, setIsPublic] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const publishRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const slug = convId || `conv_${Date.now().toString().slice(-6)}`;
    setCustomSlug(slug);
    setTempSlug(slug);
  }, [convId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (publishRef.current && !publishRef.current.contains(e.target)) {
        setShowPublish(false);
        setTimeout(() => setPublishView('main'), 200);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePublish = async () => {
    try {
      if (convId) {
        const results = await base44.entities.Conversation.filter({ conv_id: convId });
        const payload = { conv_id: convId, is_public: isPublic, slug: customSlug };
        if (results.length > 0) {
          await base44.entities.Conversation.update(results[0].id, payload);
        } else {
          await base44.entities.Conversation.create(payload);
        }
      }
      setIsPublished(true);
      toast.success(isPublic ? "App is now public — link is live!" : "App saved as private.");
      setShowPublish(false);
    } catch {
      toast.error("Could not save. Check your connection.");
    }
  };

  const handleSaveDomain = async () => {
    const slug = tempSlug.trim();
    if (!slug) { toast.error("The path cannot be empty."); return; }
    const isValid = /^[a-z0-9-]{1,30}$/.test(slug);
    if (!isValid) { toast.error("Invalid URL. Use lowercase letters, numbers, hyphens. (Max 30 chars)"); return; }
    try {
      if (convId) await base44.entities.Conversation.update(convId, { slug });
      setCustomSlug(slug);
      setShowDomainModal(false);
      toast.success("Domain configuration saved.");
    } catch {
      setCustomSlug(slug);
      setShowDomainModal(false);
    }
  };

  const shareUrl = `${window.location.origin}/p/${customSlug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const displayNumber = projectNumber || '—';

  return (
    <>
      {/* ── Domain Modal ── */}
      {showDomainModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center font-sans bg-black/60 backdrop-blur-sm">
          <div className="relative w-[95%] md:w-[520px] bg-card rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="text-[16px] font-bold text-foreground">Custom Domain Configuration</h2>
              <p className="text-[12px] text-muted-foreground mt-1">Manage the public access link for your project.</p>
            </div>
            <div className="p-6">
              <label className="text-[12px] font-bold text-foreground mb-2 block">Public Link (Max 30 chars)</label>
              <div className="flex items-center w-full border border-border rounded-md overflow-hidden focus-within:border-[#0055FF] transition-colors">
                <div className="bg-muted px-3 py-2 border-r border-border text-[13px] text-muted-foreground font-mono select-none hidden md:block">
                  {window.location.origin}/p/
                </div>
                <input
                  type="text"
                  maxLength={30}
                  value={tempSlug}
                  onChange={(e) => setTempSlug(e.target.value)}
                  className="flex-1 px-3 py-2 text-[13px] font-mono focus:outline-none text-foreground bg-card"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowDomainModal(false)} className="px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors">Cancel</button>
              <button onClick={handleSaveDomain} className="px-4 py-2 text-[13px] font-bold text-white bg-[#0055FF] hover:bg-[#0044CC] rounded-md transition-colors shadow-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar: no background, no border — floats above the preview card ── */}
      <div className="flex items-center justify-between px-4 h-12 flex-shrink-0 z-30 font-sans w-full">

        {/* LEFT: empty spacer */}
        <div className="w-6" />

        {/* CENTER: project pill + refresh */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 px-1.5 py-1 bg-background/80 backdrop-blur border border-border rounded-full shadow-sm">
          <button
            onClick={onReloadIframe}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-border mx-0.5" />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProjectDropdown(v => !v)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-muted transition-colors"
            >
              <span className="text-[12px] font-bold text-foreground font-mono">/project{displayNumber}</span>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProjectDropdown && discussions.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[220px] bg-card border border-border rounded-xl shadow-2xl z-[999] py-1.5 overflow-hidden">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-1.5">Projects in this session</p>
                {discussions.map((d, i) => (
                  <button
                    key={d.id}
                    onClick={() => { onSelectDiscussion && onSelectDiscussion(d.id); setShowProjectDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-[13px] hover:bg-muted flex items-center gap-2.5 transition-colors ${d.id === convId ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
                  >
                    <span className="text-[10px] font-mono text-muted-foreground w-8 flex-shrink-0">/p{i + 1}</span>
                    <span className="truncate">{d.title || d.preview || 'New chat'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Publish */}
        <div className="flex justify-end items-center gap-2 relative" ref={publishRef}>
          <button
            onClick={() => setShowPublish(!showPublish)}
            className="px-3 py-1 bg-transparent text-white text-[11px] font-bold rounded-lg border border-white/70 hover:bg-white/10 shadow-sm transition-colors whitespace-nowrap"
          >
            Publish
          </button>

          {showPublish && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-[300px] bg-card border border-border rounded-xl shadow-2xl z-[999] text-left font-sans p-1">
              {publishView === 'main' ? (
                <>
                  <div className="p-3 border-b border-border">
                    <h3 className="text-[14px] font-bold text-foreground">Publish App</h3>
                  </div>

                  {isPublished && (
                    <div className="px-3 pt-3 pb-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Live URL</p>
                      <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] text-foreground hover:underline font-mono truncate flex items-center gap-1.5 p-2 bg-muted rounded-md border border-border">
                        {window.location.host}/p/{customSlug} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}

                  <div className="p-2 space-y-1 mt-1">
                    <button onClick={() => { setShowPublish(false); setShowDomainModal(true); }} className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors">
                      <h4 className="text-[13px] font-bold text-foreground">Custom domain</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Configure your public routing.</p>
                    </button>
                    <button onClick={() => setPublishView('share')} className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors">
                      <h4 className="text-[13px] font-bold text-foreground">Share your app</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Share via email or social networks.</p>
                    </button>
                  </div>

                  <div className="border-t border-border pt-3 px-3">
                    <h4 className="text-[12px] font-bold text-foreground mb-2">Project Visibility</h4>
                    <div className="flex items-center justify-between bg-muted p-2.5 rounded-md border border-border">
                      <div className="flex items-center gap-2.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span className="text-[12px] font-bold text-foreground">Public Project</span>
                      </div>
                      <Toggle enabled={isPublic} onChange={() => setIsPublic(!isPublic)} />
                    </div>
                  </div>

                  <div className="px-3 pb-2 pt-1">
                    <button onClick={handlePublish} className="w-full py-2 bg-[#0055FF] text-white text-[13px] font-bold rounded-md hover:bg-[#0044CC] shadow-sm mt-3">
                      {isPublished ? 'Update Live Build' : 'Deploy'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 border-b border-border flex items-center gap-2">
                    <button onClick={() => setPublishView('main')} className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"><ArrowLeft className="w-4 h-4" /></button>
                    <h3 className="text-[14px] font-bold text-foreground">Share App</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 border border-border rounded-md p-1.5 bg-muted">
                      <div className="px-2 flex-1 text-[12px] font-mono text-foreground truncate">{shareUrl}</div>
                      <button onClick={copyToClipboard} className="px-3 py-1.5 bg-[#0055FF] text-white text-[12px] font-bold rounded hover:bg-[#0044CC] shadow-sm transition-colors">Copy</button>
                    </div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-center">Share via</p>
                    <div className="grid grid-cols-5 gap-2">
                      <a href={`https://twitter.com/intent/tweet?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="aspect-square flex items-center justify-center rounded-md border border-border bg-muted hover:bg-[#0055FF] hover:text-white text-foreground transition-colors"><XIcon /></a>
                      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="aspect-square flex items-center justify-center rounded-md border border-border bg-muted hover:bg-[#0055FF] hover:text-white text-foreground transition-colors"><LinkedInIcon /></a>
                      <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="aspect-square flex items-center justify-center rounded-md border border-border bg-muted hover:bg-[#0055FF] hover:text-white text-foreground transition-colors"><FacebookIcon /></a>
                      <a href={`https://api.whatsapp.com/send?text=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="aspect-square flex items-center justify-center rounded-md border border-border bg-muted hover:bg-[#0055FF] hover:text-white text-foreground transition-colors"><WhatsAppIcon /></a>
                      <a href={`mailto:?body=${shareUrl}`} className="aspect-square flex items-center justify-center rounded-md border border-border bg-muted hover:bg-[#0055FF] hover:text-white text-foreground transition-colors"><Mail className="w-4 h-4" /></a>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}