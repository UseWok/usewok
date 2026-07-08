import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getActiveDomain } from '@/lib/active-domain';
import { ArrowLeft, RefreshCw, ChevronUp, ChevronDown, CheckCircle2, Clock, Wrench, X } from 'lucide-react';
import { StatusBadge, AgentChip, AGENT_ORDER } from '@/components/siteaudit/AuditBits';
import FixDrawer from '@/components/report/FixDrawer';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const MONO = '"JetBrains Mono", monospace';
const INK = '#18140F';
const INK2 = '#2C2820';
const INK3 = '#726A5C';
const INK_FAINT = '#A79E8C';
const BORDER = '#E8E0CD';
const BORDER_STRONG = '#DCD1B4';
const CREAM = '#F6F1E7';
const CREAM_DEEP = '#EDE5D2';
const SURFACE = '#FFFFFF';
const ORANGE = '#FF5A1F';
const ORANGE_DARK = '#B23E10';
const ORANGE_TINT = '#FFE6D6';

function parseJSON(s, fb) { try { return JSON.parse(s || '') || fb; } catch { return fb; } }

const TABS = [
  { id: 'freshness', label: 'Freshness' },
  { id: 'seo', label: 'Structural SEO' },
  { id: 'content', label: 'Content quality' },
];

function KPICard({ label, value, color, dash }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 18px' }}>
      <p style={{ fontSize: 12, color: INK3, margin: '0 0 8px' }}>{label}</p>
      {dash
        ? <div style={{ width: 26, height: 3, borderRadius: 2, background: color, marginTop: 10 }} />
        : <p style={{ fontSize: 24, fontWeight: 800, color, margin: 0, letterSpacing: '-0.02em' }}>{value}</p>}
    </div>
  );
}

const SEV = {
  high:   { label: 'Critical', bg: ORANGE_TINT, color: ORANGE_DARK, border: 'none' },
  medium: { label: 'Medium',   bg: CREAM_DEEP,  color: INK2,        border: 'none' },
  low:    { label: 'Minor',    bg: SURFACE,     color: INK_FAINT,   border: `1px solid ${BORDER_STRONG}` },
};

export default function SiteAuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('freshness');
  const [pagesOpen, setPagesOpen] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [fixIssue, setFixIssue] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.SiteAudit.filter({ id });
      setAudit(list[0] || null);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  // Load audit history + business profile (for the Fix drawer)
  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const active = getActiveDomain();
        const q = { user_id: u.id };
        if (active?.url) q.site_url = active.url;
        const list = await base44.entities.SiteAudit.filter(q, '-created_date', 30);
        setHistory(list);
        if (active?.url) {
          const profs = await base44.entities.BusinessProfile.filter({ site_url: active.url });
          setProfile(profs.find(p => p.created_by_id === u.id) || profs[0] || null);
        }
      } catch {}
    })();
  }, [id]);

  if (loading) return <div style={{ minHeight: '100vh', background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 26, height: 26, borderRadius: '50%', border: `3px solid ${BORDER_STRONG}`, borderTopColor: ORANGE, animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if (!audit) return <div style={{ minHeight: '100vh', background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}><p style={{ color: INK3 }}>Audit not found.</p></div>;

  const agents = parseJSON(audit.agents_json, {});
  const pages = parseJSON(audit.pages_json, {});
  const results = parseJSON(audit.results_json, {});
  const dateLabel = new Date(audit.created_date).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const activeResult = results[tab];
  const items = activeResult?.items || [];

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: F }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '22px 28px 80px' }}>

        {/* Back */}
        <button onClick={() => navigate('/site-audit')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: INK3, fontFamily: F, padding: 0, marginBottom: 18 }}>
          <ArrowLeft size={13} /> Back to audits
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 14 }}>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Audit on {dateLabel}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            <StatusBadge status={audit.status} />
            <button onClick={load} title="Refresh"
              style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${BORDER_STRONG}`, background: SURFACE, cursor: 'pointer', display: 'grid', placeItems: 'center', color: INK3 }}>
              <RefreshCw size={15} />
            </button>
            <button onClick={() => setShowHistory(v => !v)} title="Audit history"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 13px', borderRadius: 10, border: `1px solid ${BORDER_STRONG}`, background: showHistory ? CREAM_DEEP : SURFACE, cursor: 'pointer', color: INK2, fontSize: 12.5, fontWeight: 600, fontFamily: F }}>
              <Clock size={14} /> History
              {history.length > 0 && <span style={{ fontSize: 10.5, fontWeight: 700, background: INK, color: '#fff', borderRadius: 10, padding: '1px 6px' }}>{history.length}</span>}
            </button>

            {showHistory && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 60 }} onClick={() => setShowHistory(false)} />
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 70, width: 320, maxHeight: 360, overflowY: 'auto', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.14)', padding: 6 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '8px 12px 6px' }}>Previous audits</p>
                  {history.length === 0 && <p style={{ fontSize: 12.5, color: INK3, padding: '10px 12px' }}>No other audits.</p>}
                  {history.map(h => {
                    const isCur = h.id === id;
                    return (
                      <button key={h.id} onClick={() => { setShowHistory(false); navigate(`/site-audit/${h.id}`); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '9px 12px', border: 'none', borderRadius: 9, background: isCur ? CREAM_DEEP : 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: F, marginBottom: 2 }}
                        onMouseEnter={e => { if (!isCur) e.currentTarget.style.background = CREAM; }}
                        onMouseLeave={e => { if (!isCur) e.currentTarget.style.background = 'transparent'; }}>
                        <span style={{ fontSize: 12.5, fontWeight: isCur ? 700 : 500, color: INK }}>
                          {new Date(h.created_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: ORANGE_DARK }}>{h.score_website ?? 0}/100</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Agent chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 34 }}>
          {AGENT_ORDER.map(k => <AgentChip key={k} agentKey={k} status={agents[k]} />)}
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
          <KPICard label="Website score" value={`${audit.score_website ?? 0}/100`} color={ORANGE_DARK} />
          <KPICard label="Freshness" value={results.freshness ? `${Math.round(results.freshness.score || 0)}` : null} color={ORANGE} dash={!results.freshness} />
          <KPICard label="Structural SEO" value={results.seo ? `${Math.round(results.seo.score || 0)}` : null} color={ORANGE_DARK} dash={!results.seo} />
          <KPICard label="Content quality" value={results.content ? `${Math.round(results.content.score || 0)}` : '0'} color={ORANGE} />
          <KPICard label="Pages analyzed" value={audit.pages_analyzed ?? 0} color={INK} />
        </div>

        {/* Page selection */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 22px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setPagesOpen(v => !v)}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 4px' }}>
                Page selection — {(pages.selected || []).length} selected, {(pages.filtered || []).length} filtered
              </p>
              <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.6 }}>
                {pages.discovered ?? 0} discovered → {(pages.selected || []).length} selected → {pages.fetched ?? 0} fetched. Pages with no GEO value (utility pages, language duplicates, excess legal pages) are excluded; selected pages that are inaccessible (403/timeout) are not analyzed.
              </p>
            </div>
            {pagesOpen ? <ChevronUp size={16} color={INK3} /> : <ChevronDown size={16} color={INK3} />}
          </div>

          {pagesOpen && (
            <div style={{ marginTop: 16 }}>
              {(pages.category_limit_hits || 0) > 0 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Category limit reached
                    <span style={{ padding: '1px 8px', background: '#F0EDE8', borderRadius: 10, fontSize: 11, fontWeight: 700, color: INK }}>{pages.category_limit_hits}</span>
                  </p>
                  <p style={{ fontSize: 11.5, color: INK3, margin: '0 0 14px' }}>Legal, careers and contact pages are limited to 1 each (no need to audit 3 terms pages).</p>
                </>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.4fr', padding: '9px 4px', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: INK }}>URL</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: INK }}>Category</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: INK, textAlign: 'right' }}>Status</span>
              </div>
              {(pages.selected || []).map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.4fr', padding: '10px 4px', borderBottom: `1px solid ${BORDER}`, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: INK, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.url}</span>
                  <span><span style={{ padding: '3px 10px', border: `1px solid ${BORDER}`, borderRadius: 12, fontSize: 11, color: INK }}>{p.category}</span></span>
                  <span style={{ textAlign: 'right' }}>
                    <CheckCircle2 size={16} color={p.fetched ? ORANGE_DARK : '#C9C6BF'} fill={p.fetched ? ORANGE_TINT : 'none'} style={{ display: 'inline-block' }} />
                  </span>
                </div>
              ))}
              {(pages.filtered || []).map((p, i) => (
                <div key={`f${i}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.4fr', padding: '10px 4px', borderBottom: `1px solid ${BORDER}`, alignItems: 'center', opacity: 0.55 }}>
                  <span style={{ fontSize: 12, color: INK3, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.url}</span>
                  <span style={{ fontSize: 11, color: INK3 }}>{p.reason}</span>
                  <span style={{ textAlign: 'right', fontSize: 12, color: INK3 }}>—</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent tabs */}
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: `1px solid ${BORDER}` }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ background: 'none', border: 'none', borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderBottom: tab === t.id ? `2px solid ${ORANGE}` : '2px solid transparent', cursor: 'pointer', padding: '10px 4px', marginRight: 22, fontSize: 13.5, fontWeight: 500, fontFamily: F, color: tab === t.id ? INK : INK_FAINT }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.length === 0 && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '18px 0', margin: 0 }}>No results for this agent.</p>}
            {items.map((it, i) => {
              const sev = SEV[it.severity] || SEV.low;
              return (
                <div key={i} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, letterSpacing: '0.02em', background: sev.bg, color: sev.color, border: sev.border }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                      {sev.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: INK, marginBottom: 6 }}>{it.title}</div>
                  {it.detail && <p style={{ fontSize: 13.5, color: INK3, margin: '0 0 10px', lineHeight: 1.5 }}>{it.detail}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    {it.page ? (
                      <div style={{ fontSize: 12, color: INK_FAINT, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <span style={{ fontFamily: MONO }}>{it.page}</span>
                      </div>
                    ) : <span />}
                    <button onClick={() => setFixIssue({ text: it.title + (it.detail ? ` — ${it.detail}` : '') })}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: 'none', borderRadius: 9, background: INK, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
                      <Wrench size={13} /> Fix
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {fixIssue && (
        <FixDrawer
          issue={fixIssue}
          profile={profile}
          user={user}
          isFree={false}
          onClose={() => setFixIssue(null)}
          onUpgrade={() => navigate('/pricing')}
        />
      )}
    </div>
  );
}