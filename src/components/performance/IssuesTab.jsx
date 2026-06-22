import { useState } from 'react';
import { Search, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const VIOLET = '#7C3AED';

const ALL_ISSUES = [
  { id: 1, title: '46 pages ont des descriptions Meta en double.', category: 'Meta balises', severity: 'error', count: 46 },
  { id: 2, title: '17 problèmes de balises de titre en double.', category: 'Meta balises', severity: 'error', count: 17 },
  { id: 3, title: '17 pages posent des problèmes de contenu en double.', category: 'Contenu', severity: 'error', count: 17 },
  { id: 4, title: '1 page a renvoyé le code de statut 4xx.', category: 'Explorabilité', severity: 'error', count: 1 },
  { id: 5, title: '47 pages font une taille totale de fichiers JavaScript et CSS trop grande.', category: 'CSS', severity: 'warning', count: 47 },
];

const CATEGORIES = ['Toutes', 'Explorabilité', 'Contenu', 'Meta balises', 'CSS'];
const SEVERITIES = [
  { id: 'all', label: 'Tout' },
  { id: 'error', label: 'Erreurs' },
  { id: 'warning', label: 'Avertissements' },
  { id: 'notice', label: 'Avis' },
  { id: 'has_issues', label: 'Avec des problèmes' },
];

function SeverityIcon({ sev }) {
  if (sev === 'error') return <AlertTriangle size={14} color="#EF4444" />;
  if (sev === 'warning') return <AlertCircle size={14} color="#F59E0B" />;
  return <Info size={14} color="#3B82F6" />;
}

function BadgeColor(sev) {
  if (sev === 'error') return { bg: '#FEE2E2', color: '#DC2626' };
  if (sev === 'warning') return { bg: '#FEF3C7', color: '#D97706' };
  return { bg: '#DBEAFE', color: '#2563EB' };
}

export default function IssuesTab() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [severity, setSeverity] = useState('all');

  const filtered = ALL_ISSUES.filter(issue => {
    const matchSearch = issue.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Toutes' || issue.category === category;
    const matchSev = severity === 'all'
      || (severity === 'has_issues' && issue.count > 0)
      || issue.severity === severity;
    return matchSearch && matchCat && matchSev;
  });

  return (
    <div>
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <Search size={14} color="#aaa" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Recherche de..."
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 12px 10px 34px',
            border: '1.5px solid #E5E4E0', borderRadius: 10, fontSize: 13,
            fontFamily: 'Inter, sans-serif', color: '#1a1a1a', background: '#fff', outline: 'none',
          }}
        />
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, marginBottom: 10 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '5px 12px', borderRadius: 20, border: '1.5px solid',
            borderColor: category === cat ? VIOLET : '#E5E4E0',
            background: category === cat ? '#F5F3FF' : '#fff',
            fontSize: 12, fontWeight: 600,
            color: category === cat ? VIOLET : '#555',
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Severity tabs */}
      <div style={{ display: 'flex', gap: 2, background: '#F8F7F4', borderRadius: 10, padding: 3, marginBottom: 14 }}>
        {SEVERITIES.map(s => (
          <button key={s.id} onClick={() => setSeverity(s.id)} style={{
            flex: 1, padding: '6px 4px', border: 'none', borderRadius: 8, cursor: 'pointer',
            background: severity === s.id ? '#fff' : 'transparent',
            fontSize: 10, fontWeight: 700,
            color: severity === s.id ? '#1a1a1a' : '#888',
            boxShadow: severity === s.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            whiteSpace: 'nowrap',
          }}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Issue cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', fontSize: 13, color: '#aaa', padding: '32px 0' }}>Aucun problème trouvé</p>
        )}
        {filtered.map(issue => {
          const bc = BadgeColor(issue.severity);
          return (
            <div key={issue.id} style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 12, padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <SeverityIcon sev={issue.severity} />
                <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0, lineHeight: 1.45 }}>
                  {issue.title}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button style={{ fontSize: 12, color: VIOLET, fontWeight: 700, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  Résolution du problème
                </button>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: bc.bg, color: bc.color }}>
                  {issue.count} nouveau{issue.count > 1 ? 'x' : ''} problème{issue.count > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}