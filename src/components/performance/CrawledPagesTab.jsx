import { useState } from 'react';
import { Columns, SlidersHorizontal, ExternalLink } from 'lucide-react';

const PAGES = [
  { url: 'https://wok-co.base44.app/', status: 200 },
  { url: 'https://wok-co.base44.app/app', status: 200 },
  { url: 'https://wok-co.base44.app/pricing', status: 200 },
  { url: 'https://wok-co.base44.app/blog', status: 200 },
  { url: 'https://wok-co.base44.app/settings', status: 200 },
  { url: 'https://wok-co.base44.app/support', status: 200 },
  { url: 'https://wok-co.base44.app/tarifs', status: 200 },
  { url: 'https://wok-co.base44.app/privacy', status: 200 },
  { url: 'https://wok-co.base44.app/terms', status: 200 },
  { url: 'https://wok-co.base44.app/manage-plan', status: 200 },
  { url: 'https://wok-co.base44.app/ai-report', status: 200 },
  { url: 'https://wok-co.base44.app/performance', status: 200 },
  { url: 'https://wok-co.base44.app/admin/dashboard', status: 200 },
  { url: 'https://wok-co.base44.app/admin/users', status: 200 },
  { url: 'https://wok-co.base44.app/admin/products', status: 200 },
  { url: 'https://wok-co.base44.app/admin/analytics', status: 200 },
  { url: 'https://wok-co.base44.app/admin/inbox', status: 200 },
  { url: 'https://wok-co.base44.app/admin/codes', status: 200 },
  { url: 'https://wok-co.base44.app/admin/blog', status: 200 },
  { url: 'https://wok-co.base44.app/admin/logs', status: 200 },
  { url: 'https://wok-co.base44.app/admin/settings', status: 200 },
  { url: 'https://wok-co.base44.app/chat', status: 200 },
  { url: 'https://wok-co.base44.app/projects', status: 200 },
  { url: 'https://wok-co.base44.app/checkout', status: 200 },
  { url: 'https://wok-co.base44.app/workspace-settings', status: 200 },
  { url: 'https://wok-co.base44.app/admin/plans', status: 200 },
  { url: 'https://wok-co.base44.app/admin/subscriptions', status: 200 },
  { url: 'https://wok-co.base44.app/admin/messages', status: 200 },
  { url: 'https://wok-co.base44.app/admin/feature-flags', status: 200 },
  { url: 'https://wok-co.base44.app/admin/roles', status: 200 },
  { url: 'https://wok-co.base44.app/admin/activity', status: 200 },
  { url: 'https://wok-co.base44.app/admin/cancellations', status: 200 },
  { url: 'https://wok-co.base44.app/admin/invoices', status: 200 },
  { url: 'https://wok-co.base44.app/admin/messaging', status: 200 },
  { url: 'https://wok-co.base44.app/admin/overview', status: 200 },
  { url: 'https://wok-co.base44.app/admin/leads', status: 200 },
  { url: 'https://wok-co.base44.app/admin/access-codes', status: 200 },
  { url: 'https://wok-co.base44.app/admin/plans-page', status: 200 },
  { url: 'https://wok-co.base44.app/admin/subscriptions-page', status: 200 },
  { url: 'https://wok-co.base44.app/admin/user-roles', status: 200 },
  { url: 'https://wok-co.base44.app/admin/feature-flags-page', status: 200 },
  { url: 'https://wok-co.base44.app/admin/analytics-page', status: 200 },
  { url: 'https://wok-co.base44.app/register', status: 200 },
  { url: 'https://wok-co.base44.app/forgot-password', status: 200 },
  { url: 'https://wok-co.base44.app/reset-password', status: 200 },
  { url: 'https://wok-co.base44.app/blog/getting-started', status: 200 },
  { url: 'https://wok-co.base44.app/blog/ai-visibility', status: 200 },
  { url: 'https://wok-co.base44.app/blog/seo-tips', status: 200 },
  { url: 'https://wok-co.base44.app/ui-showcase', status: 200 },
  { url: 'https://wok-co.base44.app/unknown-page', status: 404 },
];

export default function CrawledPagesTab() {
  const [viewMode, setViewMode] = useState('pages');
  const [selected, setSelected] = useState(new Set());

  const toggleAll = () => {
    if (selected.size === PAGES.length) setSelected(new Set());
    else setSelected(new Set(PAGES.map((_, i) => i)));
  };

  const toggle = (i) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelected(next);
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 2, background: '#F8F7F4', borderRadius: 10, padding: 3, flexShrink: 0 }}>
          {['pages', 'structure'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: '6px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
              background: viewMode === m ? '#fff' : 'transparent',
              fontSize: 11, fontWeight: 600,
              color: viewMode === m ? '#1a1a1a' : '#888',
              boxShadow: viewMode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              textTransform: 'capitalize',
            }}>
              {m === 'pages' ? 'Pages' : 'Structure du site'}
            </button>
          ))}
        </div>
        <button style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #E5E4E0', borderRadius: 8, background: '#fff', fontSize: 11, fontWeight: 600, color: '#555', cursor: 'pointer' }}>
          <Columns size={12} /> Gérer les colonnes
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 14, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '32px 32px 1fr 64px 60px 80px 64px 56px', gap: 0, padding: '10px 12px', borderBottom: '1px solid #F5F4F1', background: '#F8F7F4' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" checked={selected.size === PAGES.length} onChange={toggleAll} style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase' }}>N°</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase' }}>URL</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', textAlign: 'center' }}>Statut</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', textAlign: 'center' }}>Fréq.</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', textAlign: 'center' }}>Robots IA</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', textAlign: 'center' }}>Prof.</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', textAlign: 'center' }}>Sig.</div>
        </div>
        {/* Rows */}
        {PAGES.map((page, i) => {
          const shortUrl = page.url.replace('https://wok-co.base44.app', '');
          const is4xx = page.status >= 400;
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 32px 1fr 64px 60px 80px 64px 56px', gap: 0, padding: '9px 12px', borderBottom: '1px solid #F8F7F4', background: selected.has(i) ? '#F5F3FF' : '#fff', alignItems: 'center' }}>
              <div>
                <input type="checkbox" checked={selected.has(i)} onChange={() => toggle(i)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>{i + 1}</div>
              <div style={{ fontSize: 11, color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                <a href={page.url} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortUrl || '/'}</a>
                <ExternalLink size={9} color="#3B82F6" style={{ flexShrink: 0 }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: is4xx ? '#FEE2E2' : '#F0FDF4', color: is4xx ? '#DC2626' : '#059669' }}>
                  {page.status}
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>—</div>
              <div style={{ fontSize: 11, color: '#10B981', textAlign: 'center' }}>—</div>
              <div style={{ fontSize: 11, color: '#555', textAlign: 'center', fontWeight: 600 }}>1 clic</div>
              <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>—</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}