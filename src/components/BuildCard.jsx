import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, Link, MoreHorizontal, ExternalLink, Pencil, Trash2, X, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { saveDiscussions, getDiscussions } from '@/lib/discussions';

// ── Skeleton loader matching 16:9 architecture ──
function CardSkeleton() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F0F0F0', display: 'flex', flexDirection: 'column', padding: 14, gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
        <div style={{ height: 7, width: 48, background: '#DCDCDC', borderRadius: 4 }} />
        <div style={{ height: 7, width: 56, background: '#E4E4E4', borderRadius: 4 }} />
        <div style={{ height: 7, width: 36, background: '#E4E4E4', borderRadius: 4 }} />
      </div>
      <div style={{ height: 13, width: '78%', background: '#D0D0D0', borderRadius: 4, marginTop: 6 }} />
      <div style={{ height: 13, width: '60%', background: '#D0D0D0', borderRadius: 4 }} />
      <div style={{ height: 7, width: '88%', background: '#E2E2E2', borderRadius: 4, marginTop: 4 }} />
      <div style={{ height: 7, width: '68%', background: '#E8E8E8', borderRadius: 4 }} />
      <div style={{ height: 20, width: 64, background: '#2A2A2A', borderRadius: 6, marginTop: 10 }} />
    </div>
  );
}

// ── Link copy modal ──
function LinkModal({ conv, onClose }) {
  const [copiedWok, setCopiedWok] = useState(false);
  const [copiedPub, setCopiedPub] = useState(false);
  const wokUrl = `https://wok.base44.app/chat?conversationId=${conv.id}`;
  const pubUrl = conv.is_public ? `https://wok.base44.app/tools/${conv.conv_id}` : null;

  const copy = (url, setter) => {
    navigator.clipboard.writeText(url).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        style={{ background: '#1E1E1E', border: '1px solid #333', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420, position: 'relative' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' }}>
          <X size={16} />
        </button>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 18px' }}>Copy link</h3>

        {/* WOK build link — always active */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 500 }}>WOK Build Link</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#2A2A2A', borderRadius: 10, padding: '10px 12px' }}>
            <span style={{ flex: 1, fontSize: 12, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{wokUrl}</span>
            <button onClick={() => copy(wokUrl, setCopiedWok)}
              style={{ flexShrink: 0, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#fff', background: copiedWok ? '#22c55e' : '#F95738', border: 'none', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              {copiedWok ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        </div>

        {/* Published app link */}
        <div>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 500 }}>Published App Link</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: pubUrl ? '#2A2A2A' : '#1A1A1A', borderRadius: 10, padding: '10px 12px', opacity: pubUrl ? 1 : 0.45 }}>
            <span style={{ flex: 1, fontSize: 12, color: pubUrl ? '#aaa' : '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pubUrl || 'App not published yet'}
            </span>
            <button onClick={() => pubUrl && copy(pubUrl, setCopiedPub)} disabled={!pubUrl}
              style={{ flexShrink: 0, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#fff', background: copiedPub ? '#22c55e' : '#444', border: 'none', borderRadius: 7, cursor: pubUrl ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 5 }}>
              {copiedPub ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Rename modal ──
function RenameModal({ conv, onClose, onSave }) {
  const [value, setValue] = useState(conv.ai_title || conv.title || '');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{ background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: 16, padding: 28, width: '100%', maxWidth: 460, position: 'relative' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#666' }}>
          <X size={16} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Rename project</h2>
        <p style={{ fontSize: 13, color: '#666', margin: '0 0 20px' }}>Update how this project appears in your workspace.</p>

        <label style={{ fontSize: 13, fontWeight: 600, color: '#ccc', display: 'block', marginBottom: 8 }}>Display name</label>
        <input value={value} onChange={e => setValue(e.target.value.slice(0, 100))}
          autoFocus onKeyDown={e => { if (e.key === 'Enter') onSave(value); if (e.key === 'Escape') onClose(); }}
          style={{ width: '100%', padding: '11px 14px', fontSize: 14, border: '1px solid #3A3A3A', background: '#2A2A2A', color: '#fff', borderRadius: 10, outline: 'none', boxSizing: 'border-box', marginBottom: 10, fontFamily: 'Inter, sans-serif' }} />
        <p style={{ fontSize: 12, color: '#555', margin: '0 0 14px' }}>Supports spaces and special characters, up to 100 characters. This name is only visible to you and members of your workspace.</p>

        <div style={{ background: '#2A2A2A', borderRadius: 10, padding: '12px 14px', marginBottom: 22 }}>
          <p style={{ fontSize: 12, color: '#888', margin: 0, lineHeight: 1.5 }}>Changing the display name does not change your project URL. You can change your URL in the publish dialog.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', fontSize: 14, fontWeight: 500, color: '#888', background: 'transparent', border: 'none', borderRadius: 9, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave(value)} style={{ padding: '9px 22px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#333', border: 'none', borderRadius: 9, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#444'}
            onMouseLeave={e => e.currentTarget.style.background = '#333'}>Save</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Kebab dropdown ──
function KebabMenu({ conv, onRename, onDelete, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const item = (icon, label, action, danger) => (
    <button key={label} onClick={e => { e.stopPropagation(); action(); onClose(); }}
      style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '9px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: danger ? '#EF4444' : '#ccc', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      {icon}{label}
    </button>
  );

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.94, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.1 }}
      style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#1E1E1E', border: '1px solid #333', borderRadius: 12, padding: '4px', minWidth: 190, boxShadow: '0 8px 28px rgba(0,0,0,0.5)', zIndex: 9999 }}
      onClick={e => e.stopPropagation()}>
      {item(<ExternalLink size={13} />, 'Open in new tab', () => window.open(`/chat?conversationId=${conv.id}`, '_blank'))}
      {item(<Pencil size={13} />, 'Rename', () => onRename())}
      <div style={{ height: 1, background: '#2A2A2A', margin: '4px 0' }} />
      {item(<Trash2 size={13} />, 'Delete', () => onDelete(), true)}
    </motion.div>
  );
}

// ── Main BuildCard ──
export default function BuildCard({ conv, user, onClick, onDelete, onRename }) {
  const [hovered, setHovered] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showKebab, setShowKebab] = useState(false);
  const [starred, setStarred] = useState(conv.starred || false);

  const previewUrl = conv.conv_id ? `https://wok.base44.app/tools/${conv.conv_id}` : null;
  const displayTitle = conv.ai_title || conv.title || 'Untitled build';

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Edited recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 2) return 'Edited just now';
    if (mins < 60) return `Edited ${mins}m ago`;
    if (hours < 24) return `Edited ${hours}h ago`;
    return `Edited ${days}d ago`;
  };

  const initial = user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';

  const handleRenameConfirm = (newTitle) => {
    setShowRename(false);
    onRename?.(conv.id, newTitle);
  };

  const handleToggleStar = (e) => {
    e.stopPropagation();
    setStarred(v => !v);
  };

  return (
    <>
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setShowKebab(false); }}
        style={{ borderRadius: 16, overflow: 'visible', border: '1px solid rgba(255,255,255,0.08)', background: '#1A1A1A', cursor: 'pointer', position: 'relative' }}
      >
        {/* Preview — 16:9 aspect ratio */}
        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#fff', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            {previewUrl && !previewError ? (
              <>
                {!previewLoaded && <CardSkeleton />}
                <iframe
                  src={previewUrl}
                  style={{ width: '300%', height: '300%', border: 'none', transform: 'scale(0.333)', transformOrigin: '0 0', pointerEvents: 'none', opacity: previewLoaded ? 1 : 0, transition: 'opacity 300ms' }}
                  onLoad={() => setPreviewLoaded(true)}
                  onError={() => setPreviewError(true)}
                  title={displayTitle}
                  sandbox="allow-scripts allow-same-origin"
                />
              </>
            ) : (
              <CardSkeleton />
            )}
          </div>

          {/* Hover overlay with action icons */}
          <AnimatePresence>
            {hovered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6, zIndex: 10 }}
                onClick={e => e.stopPropagation()}>
                {/* Star */}
                <button onClick={handleToggleStar}
                  style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(20,20,20,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: starred ? '#F59E0B' : '#aaa' }}>
                  <Star size={13} fill={starred ? '#F59E0B' : 'none'} />
                </button>
                {/* Link */}
                <button onClick={(e) => { e.stopPropagation(); setShowLink(true); }}
                  style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(20,20,20,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                  <Link size={13} />
                </button>
                {/* Kebab */}
                <div style={{ position: 'relative' }}>
                  <button onClick={(e) => { e.stopPropagation(); setShowKebab(v => !v); }}
                    style={{ width: 32, height: 32, borderRadius: 9, background: showKebab ? 'rgba(255,255,255,0.15)' : 'rgba(20,20,20,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                    <MoreHorizontal size={13} />
                  </button>
                  <AnimatePresence>
                    {showKebab && (
                      <KebabMenu conv={conv} onRename={() => setShowRename(true)} onDelete={() => onDelete?.(conv.id)} onClose={() => setShowKebab(false)} />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer — detached metadata */}
        <div style={{ padding: '12px 14px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #F95738, #7B4FE0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayTitle}
            </p>
            <p style={{ fontSize: 11, color: '#666', margin: '2px 0 0' }}>{timeAgo(conv.updatedAt || conv.updated_date)}</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showLink && <LinkModal conv={conv} onClose={() => setShowLink(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showRename && <RenameModal conv={conv} onClose={() => setShowRename(false)} onSave={handleRenameConfirm} />}
      </AnimatePresence>
    </>
  );
}