import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getActiveDomain } from '@/lib/active-domain';
import { RefreshCw, Zap, Loader } from 'lucide-react';
import { StatusBadge, AgentDots } from '@/components/siteaudit/AuditBits';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const GREEN = '#10B981';

function parseJSON(s, fb) { try { return JSON.parse(s || '') || fb; } catch { return fb; } }

export default function SiteAuditPage() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');

  const load = async () => {
    try {
      const u = await base44.auth.me();
      if (!u) return;
      const active = getActiveDomain();
      setSiteUrl(active?.url || '');
      const q = { user_id: u.id };
      if (active?.url) q.site_url = active.url;
      const list = await base44.entities.SiteAudit.filter(q, '-created_date', 50);
      setAudits(list);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runAudit = async () => {
    if (!siteUrl || running) return;
    setRunning(true);
    try {
      await base44.functions.invoke('siteAudit', { url: siteUrl });
      await load();
    } catch {}
    setRunning(false);
  };

  const last = audits[0];
  const nextDate = last ? new Date(new Date(last.created_date).getTime() + 30 * 24 * 3600 * 1000) : null;
  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F0', fontFamily: F }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.03em' }}>Site Audit</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {nextDate && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 20, background: 'rgba(16,185,129,0.06)', fontSize: 12, color: '#0B815A' }}>
                <RefreshCw size={11} />
                Next automatic audit <strong>{nextDate.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
              </span>
            )}
            <button onClick={runAudit} disabled={running || !siteUrl}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: running ? '#999' : INK, border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: running ? 'default' : 'pointer', fontFamily: F }}>
              {running ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={12} />}
              {running ? 'Auditing…' : 'Run an audit'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.9fr 0.9fr 0.9fr', padding: '13px 20px', borderBottom: `1px solid ${BORDER}` }}>
            {['Date', 'Pages analyzed', 'Status', 'Agents', 'Website Score'].map(h => (
              <span key={h} style={{ fontSize: 12, fontWeight: 700, color: INK }}>{h}</span>
            ))}
          </div>

          {loading && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '28px 0' }}>Loading…</p>}
          {!loading && audits.length === 0 && !running && (
            <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '32px 0' }}>No audits yet. Run your first site audit.</p>
          )}
          {running && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.9fr 0.9fr 0.9fr', padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: INK }}>{fmtDate(new Date())}</span>
              <span style={{ fontSize: 13, color: INK3 }}>—</span>
              <span><StatusBadge status="running" /></span>
              <AgentDots agents={{}} />
              <span style={{ fontSize: 13, color: INK3 }}>—</span>
            </div>
          )}
          {audits.map(a => (
            <div key={a.id} onClick={() => navigate(`/site-audit/${a.id}`)}
              style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.9fr 0.9fr 0.9fr', padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, alignItems: 'center', cursor: 'pointer', transition: 'background 100ms' }}
              onMouseEnter={e => e.currentTarget.style.background = '#FAF9F6'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 13, color: INK }}>{fmtDate(a.created_date)}</span>
              <span style={{ fontSize: 13, color: INK }}>{a.pages_analyzed ?? 0}</span>
              <span><StatusBadge status={a.status} /></span>
              <AgentDots agents={parseJSON(a.agents_json, {})} />
              <span style={{ fontSize: 14, fontWeight: 800, color: INK }}>{a.score_website ?? 0}/100</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}