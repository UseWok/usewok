import { useState } from 'react';
import { Settings, ExternalLink } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0F0F10', margin: '0 0 2px' }}>Pages explorées</p>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>50 URLs découvertes</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: '#F5F4F1', borderRadius: 8, padding: 3 }}>
            {['pages', 'structure'].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{
                  padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: F,
                  fontSize: 12, fontWeight: view === v ? 600 : 400,
                  background: view === v ? '#fff' : 'transparent',
                  color: view === v ? '#0F0F10' : '#888',
                  boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 150ms',
                }}>
                {v === 'pages' ? 'Pages' : 'Structure du site'}
              </button>
            ))}
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #E5E4E0', borderRadius: 8, background: '#fff', fontSize: 12, color: '#555', cursor: 'pointer', fontFamily: F }}>
            <Settings size={12} /> Gérer les colonnes
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 12, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '32px 36px 1fr 90px 90px 130px 100px 70px', gap: 0, background: '#F8F7F4', borderBottom: '1px solid #EDECE9', padding: '9px 12px', alignItems: 'center' }}>
          <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ cursor: 'pointer', width: 14, height: 14 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>N°</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>URL, titre et page</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>Code statut</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>Fréquence</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>Robots IA bloqués</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>Profondeur</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>Signaler</span>
        </div>

        {/* Rows */}
        <div style={{ maxHeight: 520, overflowY: 'auto' }}>
          {SAMPLE_PAGES.map((page, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '32px 36px 1fr 90px 90px 130px 100px 70px',
              gap: 0, padding: '9px 12px', alignItems: 'center',
              borderBottom: '1px solid #F5F4F1',
              background: checked[i] ? '#F8F6FF' : 'transparent',
              transition: 'background 100ms',
            }}>
              <input type="checkbox" checked={!!checked[i]} onChange={() => toggleRow(i)} style={{ cursor: 'pointer', width: 14, height: 14 }} />
              <span style={{ fontSize: 11, color: '#aaa' }}>{i + 1}</span>
              <div style={{ minWidth: 0 }}>
                <a href={page.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: '#7C3AED', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontFamily: F }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{page.url}</span>
                  <ExternalLink size={10} color="#aaa" style={{ flexShrink: 0 }} />
                </a>
              </div>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
                  background: page.status === 200 ? '#ECFDF5' : '#FEF2F2',
                  color: page.status === 200 ? '#059669' : '#DC2626',
                }}>{page.status}</span>
              </div>
              <span style={{ fontSize: 11, color: '#555' }}>{page.freq}</span>
              <span style={{ fontSize: 12, color: '#aaa', textAlign: 'center' }}>–</span>
              <span style={{ fontSize: 11, color: '#555' }}>{page.depth}</span>
              <button style={{ fontSize: 11, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Signaler</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}