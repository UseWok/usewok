import { useState } from 'react';
import { Settings, ExternalLink } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111111'; const INK2 = '#555555'; const INK3 = '#999999';
const BORDER = '#E8E7E4'; const SURFACE = '#F7F6F3'; const WHITE = '#FFFFFF';

export default function AuditPages({ data = {} }) {
  const pages = data.top_pages || [];
  const [view, setView] = useState('pages');
  const [checked, setChecked] = useState({});
  const allChecked = pages.length > 0 && pages.every((_, i) => checked[i]);

  const toggleAll = () => {
    if (allChecked) setChecked({});
    else setChecked(Object.fromEntries(pages.map((_, i) => [i, true])));
  };
  const toggleRow = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div style={{ fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 22, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Pages explorées</p>
          <p style={{ fontSize: 13, color: INK3, margin: 0 }}>{pages.length} URL{pages.length !== 1 ? 's' : ''} analysée{pages.length !== 1 ? 's' : ''}</p>
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

      {pages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: INK3, fontSize: 13 }}>Aucune page analysée disponible.</div>
      ) : (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 36px 1fr 90px 90px 90px 70px', background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: '9px 14px', alignItems: 'center', gap: 0 }}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ cursor: 'pointer', width: 14, height: 14 }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>N°</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>URL</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fréquence</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profondeur</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Problèmes</span>
          </div>
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {pages.map((page, i) => (
              <div key={i}
                style={{ display: 'grid', gridTemplateColumns: '32px 36px 1fr 90px 90px 90px 70px', padding: '9px 14px', alignItems: 'center', borderBottom: `1px solid ${BORDER}`, background: checked[i] ? SURFACE : 'transparent', transition: 'background 100ms', gap: 0 }}
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
                  {!page.indexable && <span style={{ fontSize: 10, color: INK3 }}>Non indexable</span>}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: page.status_code === 200 ? INK : WHITE, background: page.status_code === 200 ? SURFACE : INK, padding: '2px 8px', borderRadius: 5, width: 'fit-content' }}>{page.status_code}</span>
                <span style={{ fontSize: 11, color: INK2 }}>{page.update_frequency || '–'}</span>
                <span style={{ fontSize: 11, color: INK2 }}>{page.crawl_depth ? `${page.crawl_depth} clic${page.crawl_depth > 1 ? 's' : ''}` : '–'}</span>
                <span style={{ fontSize: 11, fontWeight: page.issues_count > 0 ? 700 : 400, color: page.issues_count > 0 ? INK : INK3 }}>{page.issues_count > 0 ? page.issues_count : '–'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}