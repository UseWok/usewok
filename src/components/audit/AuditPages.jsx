import { useState } from 'react';
import { Settings, ExternalLink } from 'lucide-react';

const F       = 'Inter, system-ui, sans-serif';
const INK     = '#111111';
const INK2    = '#555555';
const INK3    = '#999999';
const BORDER  = '#E8E7E4';
const SURFACE = '#F7F6F3';
const WHITE   = '#FFFFFF';

const SAMPLE_PAGES = [
  { url: 'https://wok-co.base44.app/', status: 200, freq: 'Quotidien', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/app', status: 200, freq: 'Quotidien', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/pricing', status: 200, freq: 'Hebdomadaire', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog', status: 200, freq: 'Hebdomadaire', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/support', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/settings', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin', status: 200, freq: 'Quotidien', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/products', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/blog', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/checkout', status: 200, freq: 'Quotidien', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/manage-plan', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/performance', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/ai-report', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/tarifs', status: 200, freq: 'Hebdomadaire', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/privacy', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/terms', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/workspace-settings', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/projects', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/chat', status: 200, freq: 'Quotidien', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/dashboard', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/users', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/settings', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/ai-visibility', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/seo-tips', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/register', status: 200, freq: 'Quotidien', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/forgot-password', status: 200, freq: 'Hebdomadaire', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/reset-password', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/analytics', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/inbox', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/codes', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/logs', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/messaging', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/user-roles', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/feature-flags', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/plans', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/subscriptions', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/admin/overview', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/ui-showcase', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/audit', status: 200, freq: 'Quotidien', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/performance', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/chatgpt-visibility', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/google-ai', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/perplexity-ranking', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/seo-ai', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/brand-visibility', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/schema-markup', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/google-business', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/ai-search', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/site-audit', status: 200, freq: 'Mensuel', depth: '1 clic' },
  { url: 'https://wok-co.base44.app/blog/backlinks', status: 404, freq: '–', depth: '1 clic' },
];

export default function AuditPages() {
  const [view, setView] = useState('pages');
  const [allChecked, setAllChecked] = useState(false);
  const [checked, setChecked] = useState({});

  const toggleAll = () => {
    if (allChecked) { setChecked({}); setAllChecked(false); }
    else {
      const all = {};
      SAMPLE_PAGES.forEach((_, i) => { all[i] = true; });
      setChecked(all); setAllChecked(true);
    }
  };

  const toggleRow = idx => {
    setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div style={{ fontFamily: F }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 22, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Pages explorées</p>
          <p style={{ fontSize: 13, color: INK3, margin: 0 }}>50 URLs découvertes</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: SURFACE, borderRadius: 8, padding: 3 }}>
            {['pages', 'structure'].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: view === v ? 600 : 400, background: view === v ? WHITE : 'transparent', color: view === v ? INK : INK3, boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 150ms' }}>
                {v === 'pages' ? 'Pages' : 'Structure du site'}
              </button>
            ))}
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 12, color: INK2, cursor: 'pointer', fontFamily: F }}>
            <Settings size={12} /> Colonnes
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '32px 36px 1fr 90px 90px 120px 90px 70px', background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: '9px 14px', alignItems: 'center', gap: 0 }}>
          <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ cursor: 'pointer', width: 14, height: 14 }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>N°</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>URL</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fréquence</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Robots IA</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profondeur</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</span>
        </div>

        {/* Rows */}
        <div style={{ maxHeight: 520, overflowY: 'auto' }}>
          {SAMPLE_PAGES.map((page, i) => (
            <div key={i}
              style={{ display: 'grid', gridTemplateColumns: '32px 36px 1fr 90px 90px 120px 90px 70px', padding: '9px 14px', alignItems: 'center', borderBottom: `1px solid ${BORDER}`, background: checked[i] ? SURFACE : 'transparent', transition: 'background 100ms', gap: 0 }}
              onMouseEnter={e => { if (!checked[i]) e.currentTarget.style.background = '#FAFAF8'; }}
              onMouseLeave={e => { e.currentTarget.style.background = checked[i] ? SURFACE : 'transparent'; }}>
              <input type="checkbox" checked={!!checked[i]} onChange={() => toggleRow(i)} style={{ cursor: 'pointer', width: 14, height: 14 }} />
              <span style={{ fontSize: 11, color: INK3 }}>{i + 1}</span>
              <div style={{ minWidth: 0 }}>
                <a href={page.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: INK, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontFamily: F }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{page.url}</span>
                  <ExternalLink size={10} color={INK3} style={{ flexShrink: 0 }} />
                </a>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: page.status === 200 ? INK : '#fff', background: page.status === 200 ? SURFACE : INK, padding: '2px 8px', borderRadius: 5, width: 'fit-content' }}>{page.status}</span>
              <span style={{ fontSize: 11, color: INK2 }}>{page.freq}</span>
              <span style={{ fontSize: 11, color: INK3 }}>–</span>
              <span style={{ fontSize: 11, color: INK2 }}>{page.depth}</span>
              <button style={{ fontSize: 11, fontWeight: 500, color: INK3, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: F, textDecoration: 'underline' }}>Signaler</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}