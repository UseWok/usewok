/**
 * GoogleDrivePickerModal — reliable Google Drive file picker
 * Handles: not-connected, token-expired, list errors, download errors, pagination
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Search, FileText, Image, File, Check, Loader2, HardDrive, RefreshCw, AlertCircle, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CONNECTOR_ID = '6a344ff39cf46d20611a4dba';

const DriveLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 87.3 78" style={{ flexShrink: 0 }}>
    <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0a15.92 15.92 0 001.55 7.27z" fill="#0066da"/>
    <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.55 48.75A15.96 15.96 0 000 56h27.5z" fill="#00ac47"/>
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c1-1.7 1.55-3.65 1.55-7.5H60.1l5.85 11.65z" fill="#ea4335"/>
    <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.85 0H34.45c-1.65 0-3.2.45-4.55 1.2z" fill="#00832d"/>
    <path d="M59.8 56H27.5L13.75 79.8c1.35.8 2.9 1.2 4.55 1.2h50.7c1.65 0 3.2-.45 4.55-1.2z" fill="#2684fc"/>
    <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 60.1 56h27.45a16.1 16.1 0 00-1.55-7.27z" fill="#ffba00"/>
  </svg>
);

function FileIcon({ mimeType }) {
  if (mimeType?.startsWith('image/')) return <Image size={14} style={{ color: '#4285F4' }} />;
  if (mimeType === 'application/pdf') return <FileText size={14} style={{ color: '#EA4335' }} />;
  return <File size={14} style={{ color: '#888' }} />;
}

function formatSize(bytes) {
  if (!bytes) return '';
  const n = parseInt(bytes);
  if (isNaN(n)) return '';
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)}KB`;
  return `${(n / (1024 * 1024)).toFixed(1)}MB`;
}

// ── States ──
const STATE = {
  LOADING: 'loading',
  NOT_CONNECTED: 'not_connected',
  ERROR: 'error',
  READY: 'ready',
  CONNECTING: 'connecting',
};

export default function GoogleDrivePickerModal({ onClose, onImport }) {
  const [state, setState] = useState(STATE.LOADING);
  const [errorMsg, setErrorMsg] = useState('');
  const [files, setFiles] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [importErrors, setImportErrors] = useState([]);

  const fetchFiles = useCallback(async (pageToken = null, append = false) => {
    if (!append) setState(STATE.LOADING);
    else setLoadingMore(true);

    try {
      const res = await base44.functions.invoke('googleDriveFiles', { action: 'list', pageToken });
      const data = res.data;

      if (data?.error === 'not_connected') {
        setState(STATE.NOT_CONNECTED);
        return;
      }
      if (data?.error) {
        setErrorMsg(data.error);
        setState(STATE.ERROR);
        return;
      }

      setFiles(prev => append ? [...prev, ...(data.files || [])] : (data.files || []));
      setNextPageToken(data.nextPageToken || null);
      setState(STATE.READY);
    } catch (err) {
      setErrorMsg(err?.message || 'Connection failed');
      setState(STATE.ERROR);
    } finally {
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleConnect = async () => {
    setState(STATE.CONNECTING);
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, '_blank', 'width=500,height=600');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          fetchFiles();
        }
      }, 600);
    } catch {
      setState(STATE.NOT_CONNECTED);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleImport = async () => {
    if (selected.size === 0 || importing) return;
    const selectedFiles = files.filter(f => selected.has(f.id));
    setImporting(true);
    setImportErrors([]);
    setImportProgress({ done: 0, total: selectedFiles.length });

    const imported = [];
    const errors = [];

    for (const file of selectedFiles) {
      try {
        const res = await base44.functions.invoke('googleDriveFiles', { action: 'download', fileId: file.id });
        const data = res.data;
        if (data?.file_url) {
          imported.push({ name: data.name || file.name, url: data.file_url, type: data.mimeType || file.mimeType });
        } else {
          errors.push(file.name);
        }
      } catch {
        errors.push(file.name);
      }
      setImportProgress(prev => ({ ...prev, done: prev.done + 1 }));
    }

    setImporting(false);

    if (imported.length > 0) {
      onImport(imported);
      if (errors.length === 0) {
        onClose();
      } else {
        setImportErrors(errors);
      }
    } else {
      setImportErrors(errors);
    }
  };

  const filtered = files.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));

  // ── Modal shell ──
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.15 }}
        style={{ width: '100%', maxWidth: 520, background: '#FFFFFF', border: '1.5px solid rgba(0,0,0,0.10)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.16)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <DriveLogo size={22} />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Import from Google Drive</span>
          </div>
          <button onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ minHeight: 340 }}>

          {/* LOADING */}
          {(state === STATE.LOADING || state === STATE.CONNECTING) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60 }}>
              <Loader2 size={22} style={{ color: '#888', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 13, color: '#888' }}>
                {state === STATE.CONNECTING ? 'Opening Google authorization…' : 'Loading your files…'}
              </span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* NOT CONNECTED */}
          {state === STATE.NOT_CONNECTED && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 48, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(66,133,244,0.08)', border: '1px solid rgba(66,133,244,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HardDrive size={24} style={{ color: '#4285F4' }} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 6px' }}>Connect Google Drive</p>
                <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.55 }}>Sign in to browse and import files directly from your Drive.</p>
              </div>
              <button onClick={handleConnect}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 20px', background: '#fff', border: '1.5px solid rgba(0,0,0,0.15)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#111', transition: 'background 120ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F3'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <DriveLogo size={18} />
                Connect Google Drive
              </button>
            </div>
          )}

          {/* ERROR */}
          {state === STATE.ERROR && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 48, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={22} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: '0 0 4px' }}>Something went wrong</p>
                <p style={{ fontSize: 12, color: '#888', margin: 0, maxWidth: 300 }}>{errorMsg}</p>
              </div>
              <button onClick={() => fetchFiles()}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#111', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                <RefreshCw size={13} />
                Try again
              </button>
            </div>
          )}

          {/* READY */}
          {state === STATE.READY && (
            <>
              {/* Search */}
              <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: '7px 10px' }}>
                  <Search size={13} style={{ color: '#888', flexShrink: 0 }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files…"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#111', fontFamily: 'Inter, sans-serif' }} />
                </div>
              </div>

              {/* Import errors */}
              {importErrors.length > 0 && (
                <div style={{ margin: '8px 14px 0', padding: '10px 12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', margin: '0 0 4px' }}>Failed to import:</p>
                  {importErrors.map(n => <p key={n} style={{ fontSize: 11, color: '#ef4444', margin: 0 }}>• {n}</p>)}
                </div>
              )}

              {/* File list */}
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {filtered.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                    <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>{search ? 'No files match your search' : 'No files found'}</p>
                  </div>
                ) : (
                  <>
                    {filtered.map(file => {
                      const isSel = selected.has(file.id);
                      return (
                        <div key={file.id} onClick={() => toggleSelect(file.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer', background: isSel ? 'rgba(66,133,244,0.05)' : 'transparent', borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background 100ms' }}
                          onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = isSel ? 'rgba(66,133,244,0.05)' : 'transparent'; }}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {file.thumbnailLink
                              ? <img src={file.thumbnailLink} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                              : <FileIcon mimeType={file.mimeType} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 400, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                            <p style={{ fontSize: 11, color: '#999', margin: 0 }}>
                              {formatSize(file.size)}{file.size ? ' · ' : ''}{new Date(file.modifiedTime).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{ width: 18, height: 18, borderRadius: 4, border: isSel ? 'none' : '1.5px solid #D1D1D1', background: isSel ? '#111' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 120ms' }}>
                            {isSel && <Check size={10} color="#fff" />}
                          </div>
                        </div>
                      );
                    })}

                    {/* Load more */}
                    {nextPageToken && !search && (
                      <div style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <button onClick={() => fetchFiles(nextPageToken, true)} disabled={loadingMore}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: '#F5F5F3', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#555' }}>
                          {loadingMore ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ChevronRight size={12} />}
                          {loadingMore ? 'Loading…' : 'Load more'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {state === STATE.READY && (
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#888' }}>
              {selected.size > 0 ? `${selected.size} file${selected.size > 1 ? 's' : ''} selected` : 'Select files to import'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => fetchFiles()}
                style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(0,0,0,0.12)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}
                title="Refresh"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <RefreshCw size={12} />
              </button>
              <button onClick={handleImport} disabled={selected.size === 0 || importing}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: selected.size > 0 && !importing ? '#111' : '#F0F0EE', border: 'none', borderRadius: 8, cursor: selected.size > 0 && !importing ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 600, color: selected.size > 0 && !importing ? '#fff' : '#aaa', transition: 'all 120ms' }}>
                {importing
                  ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> {importProgress.done}/{importProgress.total}</>
                  : `Import${selected.size > 0 ? ` ${selected.size}` : ''} file${selected.size !== 1 ? 's' : ''}`
                }
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}