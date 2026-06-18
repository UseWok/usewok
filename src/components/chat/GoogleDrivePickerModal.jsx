/**
 * GoogleDrivePickerModal
 * Lets the app user connect their Drive and pick files to import.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FileText, Image, File, Check, Loader2, HardDrive } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CONNECTOR_ID = '6a344ff39cf46d20611a4dba';

// Google Drive logo — official image asset
const DriveLogo = ({ size = 16 }) => (
  <img
    src="https://media.base44.com/images/public/6a2edc91082e534601118582/882b6af1a_image.png"
    width={size} height={size}
    style={{ objectFit: 'contain', mixBlendMode: 'multiply', flexShrink: 0 }}
    alt="Google Drive"
  />
);

function FileIcon({ mimeType }) {
  if (mimeType?.startsWith('image/')) return <Image size={15} style={{ color: '#4285F4' }} />;
  if (mimeType === 'application/pdf') return <FileText size={15} style={{ color: '#EA4335' }} />;
  return <File size={15} style={{ color: '#888' }} />;
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function GoogleDrivePickerModal({ onClose, onImport }) {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const fetchFiles = async () => {
    try {
      const res = await base44.functions.invoke('googleDriveFiles', { action: 'list' });
      setFiles(res.data?.files || []);
      setConnected(true);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleConnect = async () => {
    setLoading(true);
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, '_blank');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        fetchFiles();
      }
    }, 500);
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    const selectedFiles = files.filter(f => selected.has(f.id));
    const imported = [];
    let done = 0;
    for (const file of selectedFiles) {
      try {
        const res = await base44.functions.invoke('googleDriveFiles', { action: 'download', fileId: file.id });
        if (res.data?.file_url) {
          imported.push({ file: null, name: res.data.name, url: res.data.file_url, type: res.data.mimeType });
        }
      } catch {}
      done++;
      setImportProgress(Math.round((done / selectedFiles.length) * 100));
    }
    setImporting(false);
    onImport(imported);
    onClose();
  };

  const filtered = files.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15 }}
        style={{ width: '100%', maxWidth: 520, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.10)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.14)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DriveLogo size={20} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Import from Google Drive</span>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ minHeight: 360, display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 48 }}>
              <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite', color: '#888' }} />
              <span style={{ fontSize: 13, color: '#888' }}>Loading…</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : !connected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 48 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(66,133,244,0.08)', border: '1px solid rgba(66,133,244,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HardDrive size={24} style={{ color: '#4285F4' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 6px' }}>Connect Google Drive</p>
                <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.55 }}>Sign in to browse and import files directly from your Drive.</p>
              </div>
              <button onClick={handleConnect}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#111', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff', transition: 'opacity 120ms' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <DriveLogo size={15} />
                Connect Google Drive
              </button>
            </div>
          ) : (
            <>
              {/* Search */}
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: '7px 10px' }}>
                  <Search size={13} style={{ color: '#888', flexShrink: 0 }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#111', fontFamily: 'Inter, sans-serif' }} />
                </div>
              </div>

              {/* File list */}
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: 320 }}>
                {filtered.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                    <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>No files found</p>
                  </div>
                ) : filtered.map(file => {
                  const isSelected = selected.has(file.id);
                  return (
                    <div key={file.id} onClick={() => toggleSelect(file.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer', background: isSelected ? 'rgba(66,133,244,0.05)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background 100ms' }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'rgba(66,133,244,0.05)' : 'transparent'; }}
                    >
                      {/* Thumbnail or icon */}
                      <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {file.thumbnailLink
                          ? <img src={file.thumbnailLink} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          : <FileIcon mimeType={file.mimeType} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 400, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                        <p style={{ fontSize: 11, color: '#999', margin: 0 }}>{formatSize(parseInt(file.size))} · {new Date(file.modifiedTime).toLocaleDateString()}</p>
                      </div>
                      {/* Checkbox */}
                      <div style={{ width: 18, height: 18, borderRadius: 4, border: isSelected ? 'none' : '1.5px solid #D1D1D1', background: isSelected ? '#111' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 120ms' }}>
                        {isSelected && <Check size={10} color="#fff" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {connected && !loading && (
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#888' }}>{selected.size} file{selected.size !== 1 ? 's' : ''} selected</span>
            <button onClick={handleImport} disabled={selected.size === 0 || importing}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: selected.size > 0 ? '#111' : '#F0F0EE', border: 'none', borderRadius: 8, cursor: selected.size > 0 ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600, color: selected.size > 0 ? '#fff' : '#aaa', transition: 'all 120ms' }}>
              {importing ? (
                <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> {importProgress}%</>
              ) : (
                `Import ${selected.size > 0 ? selected.size : ''} file${selected.size !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}