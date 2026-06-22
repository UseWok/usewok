import { useState } from 'react';
import { Search, X } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111111'; const INK2 = '#555555'; const INK3 = '#999999';
const BORDER = '#E8E7E4'; const SURFACE = '#F7F6F3'; const WHITE = '#FFFFFF';

const CATEGORIES = ['Toutes', 'Meta balises', 'Contenu', 'Explorabilité', 'CSS', 'Sécurité', 'Liens', 'IA'];
const SEVERITIES = [
  { id: 'all', label: 'Tout' }, { id: 'error', label: 'Erreurs' },
  { id: 'warning', label: 'Avertissements' }, { id: 'notice', label: 'Avis' },
];
const SEV_LABEL = { error: 'Erreur', warning: 'Avertissement', notice: 'Avis' };

function FixDrawer({ issue, onClose }) {
  if (!issue) return null;
  const steps = issue.fix_steps || [];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1 }} />
      <div onClick={e => e.stopPropagation()} style={{ width: 380, background: WHITE, borderLeft: `1px solid ${BORDER}`, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>Comment corriger</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0, lineHeight: 1.4 }}>{issue.title}</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={13} color={INK2} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {issue.description && <p style={{ fontSize: 13, color: INK2, lineHeight: 1.6, margin: '0 0 20px' }}>{issue.description}</p>}
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {steps.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: INK, color: WHITE, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.55 }}>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function AuditIssues({ data = {} }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [severity, setSeverity] = useState('all');
  const [fixIssue, setFixIssue] = useState(null);

  const allIssues = data.issues || [];

  const filtered = allIssues.filter(issue => {
    const matchSearch = issue.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Toutes' || issue.category === category;
    const matchSev = severity === 'all' || issue.severity === severity;
    return matchSearch && matchCat && matchSev;
  });

  const usedCategories = ['Toutes', ...Array.from(new Set(allIssues.map(i => i.category).filter(Boolean)))];

  return (
    <div style={{ fontFamily: F, display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div>
        <p style={{ fontSize: 22, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Problèmes</p>
        <p style={{ fontSize: 13, color: INK3, margin: 0 }}>{allIssues.length} problème{allIssues.length !== 1 ? 's' : ''} détecté{allIssues.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '8px 14px' }}>
          <Search size={13} color={INK3} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un problème…"
            style={{ border: 'none', outline: 'none', fontSize: 13, color: INK, background: 'transparent', flex: 1, fontFamily: F }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK3, display: 'flex' }}><X size={13} /></button>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {usedCategories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                style={{ padding: '5px 12px', borderRadius: 99, border: `1px solid ${category === cat ? INK : BORDER}`, background: category === cat ? INK : WHITE, color: category === cat ? WHITE : INK2, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: F, transition: 'all 150ms' }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 2, background: SURFACE, borderRadius: 8, padding: 3, marginLeft: 'auto' }}>
            {SEVERITIES.map(s => (
              <button key={s.id} onClick={() => setSeverity(s.id)}
                style={{ padding: '5px 11px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: severity === s.id ? 600 : 400, background: severity === s.id ? WHITE : 'transparent', color: severity === s.id ? INK : INK3, boxShadow: severity === s.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 150ms', whiteSpace: 'nowrap' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {allIssues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: INK, margin: '0 0 6px' }}>Aucun problème détecté !</p>
          <p style={{ fontSize: 13, color: INK3 }}>Votre site semble en bonne santé technique.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '48px 20px', color: INK3, fontSize: 13 }}>Aucun problème pour ces filtres</div>}
          {filtered.map((issue, i) => (
            <div key={i}
              style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, transition: 'background 100ms' }}
              onMouseEnter={e => e.currentTarget.style.background = SURFACE}
              onMouseLeave={e => e.currentTarget.style.background = WHITE}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: issue.severity === 'error' ? INK : INK3, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: INK, margin: '0 0 3px', lineHeight: 1.4 }}>{issue.title}</p>
                <span style={{ fontSize: 11, color: INK3 }}>{issue.category} · {SEV_LABEL[issue.severity] || issue.severity}</span>
              </div>
              {issue.count > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: INK2, background: SURFACE, border: `1px solid ${BORDER}`, padding: '3px 9px', borderRadius: 99, flexShrink: 0 }}>{issue.count} pages</span>}
              <button onClick={() => setFixIssue(issue)}
                style={{ fontSize: 12, fontWeight: 600, color: WHITE, background: INK, border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontFamily: F, flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Corriger
              </button>
            </div>
          ))}
        </div>
      )}

      <FixDrawer issue={fixIssue} onClose={() => setFixIssue(null)} />
    </div>
  );
}