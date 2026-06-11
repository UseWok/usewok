import { useState, useEffect } from 'react';
import { Download, Copy, RefreshCw, ChevronRight, ChevronDown, Search } from 'lucide-react';

// ── Rotating log storage (3 files × 1MB max in localStorage) ──
const LOG_KEYS = ['wok_log_0', 'wok_log_1', 'wok_log_2'];
const MAX_SIZE = 1024 * 1024;
const PAGE_SIZE = 20;

export function appendLog(level, message) {
  try {
    const entry = `${new Date().toISOString()}|${level}|${message}\n`;
    let slotIdx = parseInt(localStorage.getItem('wok_log_slot') || '0', 10);
    let slot = localStorage.getItem(LOG_KEYS[slotIdx]) || '';
    if ((slot.length + entry.length) > MAX_SIZE) {
      slotIdx = (slotIdx + 1) % 3;
      localStorage.setItem('wok_log_slot', String(slotIdx));
      slot = '';
    }
    localStorage.setItem(LOG_KEYS[slotIdx], slot + entry);
  } catch {}
}

function readAllLogs() {
  const all = [];
  const slotIdx = parseInt(localStorage.getItem('wok_log_slot') || '0', 10);
  for (let i = 1; i <= 3; i++) {
    const key = LOG_KEYS[(slotIdx + i) % 3];
    const raw = localStorage.getItem(key) || '';
    raw.split('\n').filter(Boolean).forEach(line => {
      const [ts, level, ...rest] = line.split('|');
      all.push({ ts, level, message: rest.join('|') });
    });
  }
  return all.reverse(); // newest first
}

const LEVEL_COLORS = { INFO: '#2563EB', ERROR: '#EF4444', WARN: '#F59E0B', DEBUG: '#888' };
const LEVEL_BG = { INFO: 'rgba(37,99,235,0.10)', ERROR: 'rgba(239,68,68,0.10)', WARN: 'rgba(245,158,11,0.10)', DEBUG: '#F0F0EE' };

function LogRow({ log, expanded, onToggle }) {
  const d = log.ts ? new Date(log.ts) : new Date();
  const time = `${String(d.getDate()).padStart(2,'0')} ${d.toLocaleString('en-US',{month:'short'})} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;

  return (
    <div style={{ borderBottom: '1px solid #EDEAE4' }}>
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', cursor: 'pointer', background: expanded ? '#F8F6F2' : 'transparent' }}
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = '#F8F6F2'; }}
        onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ color: '#AAA', flexShrink: 0 }}>
          {expanded ? <ChevronDown style={{ width: 12, height: 12 }} /> : <ChevronRight style={{ width: 12, height: 12 }} />}
        </span>
        <span style={{ fontSize: 12, color: '#888', fontVariantNumeric: 'tabular-nums', fontFamily: 'ui-monospace, monospace', flexShrink: 0 }}>{time}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
          color: LEVEL_COLORS[log.level] || '#555',
          background: LEVEL_BG[log.level] || '#F0F0EE',
          flexShrink: 0,
        }}>{log.level || 'INFO'}</span>
        <span style={{ fontSize: 12, color: '#333', fontFamily: 'ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {log.message}
        </span>
      </div>
      {expanded && (
        <div style={{ padding: '8px 44px 12px', background: '#F8F6F2', fontSize: 12, color: '#555', fontFamily: 'ui-monospace, monospace', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {log.message}
        </div>
      )}
    </div>
  );
}

export default function LogsPanel() {
  const [allLogs, setAllLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1); // how many pages of PAGE_SIZE to show

  const refresh = () => { setAllLogs(readAllLogs()); setPage(1); };

  useEffect(() => {
    refresh();
    const t = setInterval(() => setAllLogs(readAllLogs()), 3000);
    return () => clearInterval(t);
  }, []);

  // Reset pagination on filter change
  useEffect(() => { setPage(1); setExpandedIdx(null); }, [search, levelFilter]);

  const filtered = allLogs.filter(l => {
    const matchLevel = levelFilter === 'All' || l.level === levelFilter;
    const matchSearch = !search || l.message?.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;
  const allText = filtered.map(l => `${l.ts} [${l.level}] ${l.message}`).join('\n');

  const handleDownload = () => {
    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `wok-logs-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(allText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#FAF9F5', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 0' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: '0 0 4px 0' }}>Logs</h2>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 16px 0' }}>Debug errors and track activity in your app.</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: '#AAA' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events"
              style={{ width: '100%', padding: '7px 12px 7px 30px', border: '1px solid #E0E0DC', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif', background: '#fff', boxSizing: 'border-box' }} />
          </div>
          {['All', 'INFO', 'WARN', 'ERROR'].map(l => (
            <button key={l} onClick={() => setLevelFilter(l)} style={{
              padding: '6px 12px', border: '1px solid #E0E0DC', borderRadius: 8, cursor: 'pointer',
              background: levelFilter === l ? '#111' : '#fff', color: levelFilter === l ? '#fff' : '#555',
              fontSize: 12, fontWeight: 500,
            }}>{l}</button>
          ))}
          <button onClick={refresh} style={{ padding: '6px 10px', border: '1px solid #E0E0DC', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <RefreshCw style={{ width: 13, height: 13, color: '#666' }} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 12, borderBottom: '1px solid #EDEAE4' }}>
          <button onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#333', fontWeight: 500 }}>
            <Download style={{ width: 14, height: 14 }} /> Download
          </button>
          <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: copied ? '#22C55E' : '#333', fontWeight: 500 }}>
            <Copy style={{ width: 14, height: 14 }} /> {copied ? 'Copied!' : 'Copy'}
          </button>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>
            Showing {visible.length} / {filtered.length} logs
          </span>
        </div>
      </div>

      {/* Log rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {visible.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#CCC', fontSize: 13 }}>No logs found.</div>
        ) : (
          visible.map((log, i) => (
            <LogRow key={i} log={log} expanded={expandedIdx === i} onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)} />
          ))
        )}

        {/* Load more button */}
        {hasMore && (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <button
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '8px 24px', borderRadius: 8,
                background: '#fff', border: '1px solid #E0E0DC',
                fontSize: 13, fontWeight: 600, color: '#333',
                cursor: 'pointer', transition: 'background 120ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              Charger plus ({filtered.length - visible.length} restants)
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid #EDEAE4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#888' }}>{filtered.length} log{filtered.length !== 1 ? 's' : ''} total</span>
      </div>
    </div>
  );
}