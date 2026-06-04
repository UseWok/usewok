import { useState, useRef } from 'react';
import { Bookmark, RotateCcw, MoreHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// ── Revert confirmation modal (image 3 style) ──
function RevertModal({ open, onClose, onConfirm, version }) {
  if (!open) return null;
  const date = version?.date ? new Date(version.date) : new Date();
  const formatted = date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.30)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 14, padding: '22px 24px 18px',
        width: 340, boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: '0 0 10px 0' }}>
          Revert to this version?
        </h3>
        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: '0 0 18px 0' }}>
          This will revert your project to how it looked on {formatted}. Recent changes after this point stay in the chat and can be reapplied anytime.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '7px 16px', border: 'none', background: 'transparent',
            fontSize: 13, color: '#888', cursor: 'pointer', borderRadius: 7,
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            padding: '7px 16px', border: 'none', background: '#111',
            fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', borderRadius: 7,
          }}>Revert</button>
        </div>
      </div>
    </div>
  );
}

// ── Single version row ──
function VersionRow({ version, isActive, isBookmarked, onPreview, onBookmark, onRevert }) {
  const [hovered, setHovered] = useState(false);

  const date = new Date(version.date);
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
        padding: '14px 20px', cursor: 'pointer',
        background: isActive ? 'rgba(37,99,235,0.06)' : 'transparent',
        borderLeft: isActive ? '2px solid #2563EB' : '2px solid transparent',
        transition: 'background 100ms',
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
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {hovered ? (
          <>
            <button onClick={e => { e.stopPropagation(); onBookmark(version); }}
              title="Bookmark"
              style={{
                width: 28, height: 28, borderRadius: 6, border: '1px solid #E0E0E0',
                background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <Bookmark style={{ width: 13, height: 13, color: isBookmarked ? '#8F41FD' : '#888', fill: isBookmarked ? '#8F41FD' : 'none' }} />
            </button>
            <button onClick={e => { e.stopPropagation(); onRevert(version); }}
              title="Revert to this version"
              style={{
                width: 28, height: 28, borderRadius: 6, border: '1px solid #E0E0E0',
                background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <RotateCcw style={{ width: 13, height: 13, color: '#555' }} />
            </button>
          </>
        ) : (
          <span style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap' }}>{dateStr}</span>
        )}
      </div>
    </div>
  );
}

export default function HistoryPanel({ messages, ficheContent, setFicheContent }) {
  const [tab, setTab] = useState('history'); // 'history' | 'bookmarks'
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wok_bookmarks') || '[]'); } catch { return []; }
  });
  const [activeVersionId, setActiveVersionId] = useState(null);
  const [revertTarget, setRevertTarget] = useState(null);

  // Build versions from messages that have rawContent
  const versions = (messages || [])
    .map((msg, idx) => ({
      id: idx,
      label: messages[idx - 1]?.content?.slice(0, 60) || `Version ${idx}`,
      rawContent: msg.rawContent,
      date: msg.date || new Date().toISOString(),
      role: msg.role,
    }))
    .filter(v => v.role === 'assistant' && v.rawContent)
    .reverse();

  const toggleBookmark = (version) => {
    const already = bookmarks.find(b => b.id === version.id);
    const updated = already
      ? bookmarks.filter(b => b.id !== version.id)
      : [...bookmarks, version];
    setBookmarks(updated);
    localStorage.setItem('wok_bookmarks', JSON.stringify(updated));
  };

  const handlePreview = (version) => {
    setActiveVersionId(version.id);
    if (version.rawContent) setFicheContent(version.rawContent);
  };

  const handleRevert = (version) => {
    setRevertTarget(version);
  };

  const confirmRevert = () => {
    if (revertTarget?.rawContent) setFicheContent(revertTarget.rawContent);
    setRevertTarget(null);
  };

  const displayList = tab === 'bookmarks' ? bookmarks : versions;

  const tabBtn = (id, icon, label) => (
    <button
      onClick={() => setTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 999, border: '1px solid',
        borderColor: tab === id ? '#D0D0D0' : 'transparent',
        background: tab === id ? '#fff' : 'transparent',
        fontSize: 13, fontWeight: tab === id ? 600 : 400,
        color: tab === id ? '#111' : '#888', cursor: 'pointer',
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#FAF9F5', display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Tabs */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', gap: 6, borderBottom: '1px solid #EDEAE4' }}>
        {tabBtn('history',
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>,
          'History'
        )}
        {tabBtn('bookmarks',
          <Bookmark style={{ width: 13, height: 13 }} />,
          'Bookmarks'
        )}
      </div>

      {/* Version list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {displayList.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#BBB', fontSize: 13 }}>
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
              onRevert={handleRevert}
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