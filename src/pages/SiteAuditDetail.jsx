import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, RefreshCw, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { StatusBadge, AgentChip, AGENT_ORDER } from '@/components/siteaudit/AuditBits';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const VIOLET = '#7C3AED';
const GREEN = '#10B981';
const ORANGE = '#F97316';
const BLUE = '#3B8BEB';

function parseJSON(s, fb) { try { return JSON.parse(s || '') || fb; } catch { return fb; } }

const TABS = [
  { id: 'freshness', label: 'FRAÎCHEUR' },
  { id: 'seo', label: 'SEO STRUCTUREL' },
  { id: 'content', label: 'QUALITÉ CONTENU' },
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

const SEV = { high: { label: 'Critique', c: '#EF4444' }, medium: { label: 'Moyen', c: ORANGE }, low: { label: 'Mineur', c: BLUE } };

export default function SiteAuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('freshness');
  const [pagesOpen, setPagesOpen] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.SiteAudit.filter({ id });
      setAudit(list[0] || null);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  if (loading) return <div style={{ minHeight: '100vh', background: '#F7F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid rgba(21,19,15,0.10)', borderTopColor: VIOLET, animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if (!audit) return <div style={{ minHeight: '100vh', background: '#F7F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}><p style={{ color: INK3 }}>Audit introuvable.</p></div>;

  const agents = parseJSON(audit.agents_json, {});
  const pages = parseJSON(audit.pages_json, {});
  const results = parseJSON(audit.results_json, {});
  const dateLabel = new Date(audit.created_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const activeResult = results[tab];
  const items = activeResult?.items || [];

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F0', fontFamily: F }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}>

        {/* Back */}
        <button onClick={() => navigate('/site-audit')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: VIOLET, fontFamily: F, padding: 0, marginBottom: 12 }}>
          <ArrowLeft size={14} /> Retour aux audits
        </button>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.03em' }}>Audit du {dateLabel}</h1>
          <StatusBadge status={audit.status} />
          <button onClick={load} title="Rafraîchir"
            style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${BORDER}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={13} color={INK} />
          </button>
        </div>

        {/* Agent chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          {AGENT_ORDER.map(k => <AgentChip key={k} agentKey={k} status={agents[k]} />)}
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
          <KPICard label="Score Website" value={`${audit.score_website ?? 0}/100`} color={VIOLET} />
          <KPICard label="Fraîcheur" value={results.freshness ? `${Math.round(results.freshness.score || 0)}` : null} color={GREEN} dash={!results.freshness} />
          <KPICard label="SEO Structurel" value={results.seo ? `${Math.round(results.seo.score || 0)}` : null} color={VIOLET} dash={!results.seo} />
          <KPICard label="Qualité Contenu" value={results.content ? `${Math.round(results.content.score || 0)}` : '0'} color={ORANGE} />
          <KPICard label="Pages analysées" value={audit.pages_analyzed ?? 0} color={BLUE} />
        </div>

        {/* Page selection */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 22px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setPagesOpen(v => !v)}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 4px' }}>
                Sélection des pages — {(pages.selected || []).length} sélectionnées, {(pages.filtered || []).length} filtrées
              </p>
              <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.6 }}>
                {pages.discovered ?? 0} découvertes → {(pages.selected || []).length} sélectionnées → {pages.fetched ?? 0} récupérées. Les pages sans valeur GEO (utilitaires, doublons de langue, légales en trop) sont écartées ; les pages sélectionnées mais inaccessibles (403/timeout) ne sont pas analysées.
              </p>
            </div>
            {pagesOpen ? <ChevronUp size={16} color={INK3} /> : <ChevronDown size={16} color={INK3} />}
          </div>

          {pagesOpen && (
            <div style={{ marginTop: 16 }}>
              {(pages.category_limit_hits || 0) > 0 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Limite de catégorie atteinte
                    <span style={{ padding: '1px 8px', background: '#F0EDE8', borderRadius: 10, fontSize: 11, fontWeight: 700, color: INK }}>{pages.category_limit_hits}</span>
                  </p>
                  <p style={{ fontSize: 11.5, color: INK3, margin: '0 0 14px' }}>Les pages légales, carrières et contact sont limitées à 1 exemplaire chacune (pas besoin d'auditer 3 pages de conditions).</p>
                </>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.4fr', padding: '9px 4px', borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: INK }}>URL</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: INK }}>Catégorie</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: INK, textAlign: 'right' }}>Action</span>
              </div>
              {(pages.selected || []).map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.4fr', padding: '10px 4px', borderBottom: `1px solid ${BORDER}`, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: INK, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.url}</span>
                  <span><span style={{ padding: '3px 10px', border: `1px solid ${BORDER}`, borderRadius: 12, fontSize: 11, color: INK }}>{p.category}</span></span>
                  <span style={{ textAlign: 'right' }}>
                    <CheckCircle2 size={16} color={p.fetched ? GREEN : '#C9C6BF'} fill={p.fetched ? 'rgba(16,185,129,0.15)' : 'none'} style={{ display: 'inline-block' }} />
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
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 24, padding: '0 22px', borderBottom: `1px solid ${BORDER}` }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '14px 0 12px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em', fontFamily: F, color: tab === t.id ? VIOLET : INK3, borderBottom: tab === t.id ? `2px solid ${VIOLET}` : '2px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ padding: '18px 22px' }}>
            {items.length === 0 && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '18px 0', margin: 0 }}>Aucun résultat pour cet agent.</p>}
            {items.map((it, i) => {
              const sev = SEV[it.severity] || SEV.low;
              return (
                <div key={i} style={{ borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : 'none', padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ padding: '2px 8px', background: `${sev.c}15`, color: sev.c, borderRadius: 5, fontSize: 10.5, fontWeight: 700 }}>{sev.label}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{it.title}</span>
                  </div>
                  {it.detail && <p style={{ fontSize: 12.5, color: '#666', margin: '0 0 4px', lineHeight: 1.6 }}>{it.detail}</p>}
                  {it.page && <span style={{ fontSize: 11, color: INK3, fontFamily: 'monospace' }}>{it.page}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}