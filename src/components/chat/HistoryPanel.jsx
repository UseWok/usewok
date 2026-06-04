import { useState } from 'react';
import { Bookmark, RotateCcw } from 'lucide-react';

// ── Revert confirmation modal — strict destructive warning ──
function RevertModal({ open, onClose, onConfirm, version }) {
  if (!open) return null;
  const date = version?.date ? new Date(version.date) : new Date();
  const formatted = date.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.45)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, padding: '28px 28px 22px',
        width: 380, boxShadow: '0 16px 50px rgba(0,0,0,0.20)', fontFamily: 'Inter, sans-serif',
      }}>
        {/* Warning icon */}
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <RotateCcw style={{ width: 18, height: 18, color: '#DC2626' }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: '0 0 8px 0', letterSpacing: '-0.2px' }}>
          Revert to this version?
        </h3>
        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.65, margin: '0 0 6px 0' }}>
          You are about to restore the version from <strong style={{ color: '#111' }}>{formatted}</strong>.
        </p>
        <p style={{ fontSize: 13, color: '#DC2626', lineHeight: 1.65, margin: '0 0 22px 0', fontWeight: 500 }}>
          ⚠ All versions generated after this point will be permanently deleted. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px 0', border: '1.5px solid #E0E0E0', borderRadius: 9,
            background: '#fff', fontSize: 13, fontWeight: 500, color: '#555', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 2, padding: '10px 0', border: 'none', borderRadius: 9,
            background: '#DC2626', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
          }}>Revert and delete later versions</button>
        </div>
      </div>
    </div>
  );
}

// ── Single version row ──
function VersionRow({ version, isActive, isBookmarked, onPreview, onBookmark, onRevert }) {
  const [hovered, setHovered] = useState(false);

  const date = version.date ? new Date(version.date) : new Date();
  const dateStr = date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPreview(version)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 18px', cursor: 'pointer',
        background: isActive ? 'rgba(37,99,235,0.05)' : hovered ? '#F5F3EF' : 'transparent',
        borderLeft: isActive ? '2px solid #2563EB' : '2px solid transparent',
        transition: 'background 80ms',
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: 13, fontWeight: isActive ? 600 : 400,
          color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          display: 'block',
        }}>
          {version.label}
        </span>
        <span style={{ fontSize: 11, color: '#AAA', marginTop: 2, display: 'block' }}>{dateStr}</span>
      </div>
      {hovered && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onBookmark(version); }}
            title="Bookmark"
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E0E0E0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark style={{ width: 13, height: 13, color: isBookmarked ? '#8F41FD' : '#888', fill: isBookmarked ? '#8F41FD' : 'none' }} />
          </button>
          <button onClick={e => { e.stopPropagation(); onRevert(version); }}
            title="Revert to this version"
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E0E0E0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RotateCcw style={{ width: 13, height: 13, color: '#555' }} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function HistoryPanel({ messages, ficheContent, setFicheContent }) {
  const [tab, setTab] = useState('history');
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wok_bookmarks') || '[]'); } catch { return []; }
  });
  const [activeVersionId, setActiveVersionId] = useState(null);
  const [revertTarget, setRevertTarget] = useState(null);

  // Build versions from messages that have rawContent
  const versions = (messages || [])
    .map((msg, idx) => ({
      id: idx,
      label: (messages[idx - 1]?.content || '').slice(0, 60) || `Version ${idx}`,
      rawContent: msg.rawContent,
      date: msg.date || new Date(Date.now() - (messages.length - idx) * 60000).toISOString(),
      role: msg.role,
    }))
    .filter(v => v.role === 'assistant' && v.rawContent)
    .reverse();

  const toggleBookmark = (version) => {
    const already = bookmarks.find(b => b.id === version.id);
    const updated = already ? bookmarks.filter(b => b.id !== version.id) : [...bookmarks, version];
    setBookmarks(updated);
    localStorage.setItem('wok_bookmarks', JSON.stringify(updated));
  };

  const handlePreview = (version) => {
    setActiveVersionId(version.id);
    if (version.rawContent) setFicheContent(version.rawContent);
  };

  // Destructive revert: restores version AND closes panel (caller sets showHistory=false via setFicheContent override)
  const confirmRevert = () => {
    if (revertTarget?.rawContent) {
      setFicheContent(revertTarget.rawContent);
    }
    setRevertTarget(null);
  };

  const displayList = tab === 'bookmarks' ? bookmarks : versions;

  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: '6px 14px', borderRadius: 999, border: 'none',
        background: tab === id ? '#111' : 'transparent',
        fontSize: 12, fontWeight: 600,
        color: tab === id ? '#fff' : '#888', cursor: 'pointer',
        transition: 'background 100ms',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ width: '100%', height: '100%', background: '#FAF9F5', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #EDEAE4' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 10px 0' }}>Version history</h3>
        <div style={{ display: 'flex', gap: 2, background: '#EDEAE4', borderRadius: 999, padding: 3, width: 'fit-content' }}>
          {tabBtn('history', 'History')}
          {tabBtn('bookmarks', 'Bookmarks')}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {displayList.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#CCC', fontSize: 13 }}>
            {tab === 'bookmarks' ? 'No bookmarks yet.' : 'No versions generated yet.'}
          </div>
        ) : (
          displayList.map((v) => (
            <VersionRow
              key={v.id}
              version={v}
              isActive={activeVersionId === v.id}
              isBookmarked={bookmarks.some(b => b.id === v.id)}
              onPreview={handlePreview}
              onBookmark={toggleBookmark}
              onRevert={setRevertTarget}
            />
          ))
        )}
      </div>

      <RevertModal
        open={!!revertTarget}
        onClose={() => setRevertTarget(null)}
        onConfirm={confirmRevert}
        version={revertTarget}
      />
    </div>
  );
}