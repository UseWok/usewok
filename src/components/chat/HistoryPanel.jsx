import { useState, useEffect } from 'react';
import { Bookmark, RotateCcw, Cloud, CloudOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// ── Revert confirmation modal ──
function RevertModal({ open, onClose, onConfirm, version }) {
  if (!open) return null;
  const formatted = version?.created_date
    ? new Date(version.created_date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
    : 'unknown time';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: 16, padding: '28px', width: 380, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E8184A22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <RotateCcw size={18} color="#E8184A" />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Revert to this version?</h3>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.65, margin: '0 0 6px' }}>
          You are about to restore the version from <strong style={{ color: '#fff' }}>{formatted}</strong>.
        </p>
        <p style={{ fontSize: 13, color: '#E8184A', lineHeight: 1.65, margin: '0 0 22px', fontWeight: 600 }}>
          ⚠ All versions created after this point will be permanently deleted from the cloud. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', border: '1px solid #333', borderRadius: 9, background: 'transparent', fontSize: 13, fontWeight: 500, color: '#888', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 2, padding: '10px 0', border: 'none', borderRadius: 9, background: '#E8184A', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Revert & delete later versions</button>
        </div>
      </div>
    </div>
  );
}

function VersionRow({ version, isActive, isBookmarked, onPreview, onBookmark, onRevert }) {
  const [hovered, setHovered] = useState(false);
  const formatted = version.created_date
    ? new Date(version.created_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
    : '—';

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => onPreview(version)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', background: isActive ? 'rgba(249,87,56,0.08)' : hovered ? '#1A1A1A' : 'transparent', borderLeft: isActive ? '2px solid #F95738' : '2px solid transparent', transition: 'background 80ms', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {version.label || version.prompt || `Version ${version.version_index || '?'}`}
        </span>
        <span style={{ fontSize: 11, color: '#555', marginTop: 2, display: 'block' }}>{formatted}</span>
      </div>
      {hovered && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onBookmark(version); }}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #333', background: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark size={13} color={isBookmarked ? '#7B4FE0' : '#666'} fill={isBookmarked ? '#7B4FE0' : 'none'} />
          </button>
          <button onClick={e => { e.stopPropagation(); onRevert(version); }}
            title="Revert to this version"
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #333', background: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RotateCcw size={13} color="#888" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function HistoryPanel({ messages, ficheContent, setFicheContent, convId }) {
  const [tab, setTab] = useState('history');
  const [cloudVersions, setCloudVersions] = useState([]);
  const [activeVersionId, setActiveVersionId] = useState(null);
  const [revertTarget, setRevertTarget] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [cloudOk, setCloudOk] = useState(null);

  // Load cloud versions for this conversation
  const loadCloudVersions = async () => {
    if (!convId) return;
    setSyncing(true);
    try {
      const versions = await base44.entities.AppVersion.filter({ conv_id: convId }, 'version_index', 200);
      setCloudVersions(versions);
      setCloudOk(true);
    } catch { setCloudOk(false); }
    setSyncing(false);
  };

  // Sync new messages to cloud as versions
  const syncVersionsToCloud = async () => {
    if (!convId) return;
    const localVersions = (messages || [])
      .map((msg, idx) => ({ ...msg, idx }))
      .filter(m => m.role === 'assistant' && m.rawContent);

    for (const v of localVersions) {
      const existing = cloudVersions.find(cv => cv.version_index === v.idx);
      if (!existing) {
        await base44.entities.AppVersion.create({
          conv_id: convId,
          version_index: v.idx,
          label: (messages[v.idx - 1]?.content || '').slice(0, 80) || `Version ${v.idx}`,
          prompt: (messages[v.idx - 1]?.content || '').slice(0, 300),
          raw_content: v.rawContent,
          bookmarked: false,
        }).catch(() => {});
      }
    }
    loadCloudVersions();
  };

  useEffect(() => { loadCloudVersions(); }, [convId]);
  useEffect(() => { syncVersionsToCloud(); }, [messages?.length]);

  const toggleBookmark = async (version) => {
    await base44.entities.AppVersion.update(version.id, { bookmarked: !version.bookmarked }).catch(() => {});
    loadCloudVersions();
  };

  const handlePreview = (version) => {
    setActiveVersionId(version.id);
    const content = version.raw_content || version.rawContent;
    if (content) setFicheContent(content);
  };

  // Hard-delete all versions after the target, then restore
  const confirmRevert = async () => {
    if (!revertTarget) return;
    const targetIdx = revertTarget.version_index;
    const content = revertTarget.raw_content;

    // Hard-delete all cloud versions with version_index > targetIdx
    const toDelete = cloudVersions.filter(v => v.version_index > targetIdx);
    for (const v of toDelete) {
      await base44.entities.AppVersion.delete(v.id).catch(() => {});
    }

    if (content) setFicheContent(content);
    setRevertTarget(null);
    await loadCloudVersions();
    toast.success(`Reverted — ${toDelete.length} later version${toDelete.length !== 1 ? 's' : ''} permanently deleted.`);
  };

  const displayList = tab === 'bookmarks' ? cloudVersions.filter(v => v.bookmarked) : [...cloudVersions].reverse();

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: '6px 14px', borderRadius: 999, border: 'none',
      background: tab === id ? '#F95738' : 'transparent',
      fontSize: 12, fontWeight: 600,
      color: tab === id ? '#fff' : '#888', cursor: 'pointer',
      transition: 'background 100ms',
    }}>
      {label}
    </button>
  );

  return (
    <div style={{ width: '100%', height: '100%', background: '#0D0D0D', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #1E1E1E' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Version history</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {cloudOk === true && <Cloud size={13} color="#4ade80" title="Cloud synced" />}
            {cloudOk === false && <CloudOff size={13} color="#E8184A" title="Cloud sync failed" />}
            <button onClick={loadCloudVersions} style={{ width: 24, height: 24, borderRadius: 6, background: '#1A1A1A', border: '1px solid #222', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={11} color={syncing ? '#F95738' : '#555'} style={{ animation: syncing ? 'spin 0.8s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, background: '#1A1A1A', borderRadius: 999, padding: 3, width: 'fit-content' }}>
          {tabBtn('history', 'History')}
          {tabBtn('bookmarks', `Bookmarks${cloudVersions.filter(v => v.bookmarked).length > 0 ? ` (${cloudVersions.filter(v => v.bookmarked).length})` : ''}`)}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {displayList.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#444', fontSize: 13 }}>
            {tab === 'bookmarks' ? 'No bookmarks yet. Hover a version and click the bookmark icon.' : syncing ? 'Syncing with cloud…' : 'No versions generated yet.'}
          </div>
        ) : displayList.map((v) => (
          <VersionRow key={v.id} version={v}
            isActive={activeVersionId === v.id}
            isBookmarked={v.bookmarked}
            onPreview={handlePreview}
            onBookmark={toggleBookmark}
            onRevert={setRevertTarget}
          />
        ))}
      </div>

      <RevertModal open={!!revertTarget} onClose={() => setRevertTarget(null)} onConfirm={confirmRevert} version={revertTarget} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}