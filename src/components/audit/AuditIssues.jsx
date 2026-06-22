import { useState } from 'react';
import { Search, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
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
  { id: 'with_issues', label: 'Avec des problèmes' },
];

function SeverityIcon({ severity }) {
  if (severity === 'error') return <AlertCircle size={14} color="#EF4444" />;
  if (severity === 'warning') return <AlertTriangle size={14} color="#F59E0B" />;
  return <Info size={14} color="#3B82F6" />;
}

function BadgeColor(severity) {
  if (severity === 'error') return { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' };
  if (severity === 'warning') return { bg: '#FFFBEB', color: '#F59E0B', border: '#FDE68A' };
  return { bg: '#EFF6FF', color: '#3B82F6', border: '#BFDBFE' };
}

export default function AuditIssues() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [severity, setSeverity] = useState('all');

  const filtered = ALL_ISSUES.filter(issue => {
    const matchSearch = issue.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Toutes' || issue.category === category;
    const matchSev = severity === 'all' || severity === 'with_issues' || issue.severity === severity;
    return matchSearch && matchCat && matchSev;
  });

  return (
    <div style={{ fontFamily: F, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F0F10', margin: '0 0 4px' }}>Problèmes</p>
        <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Toutes les anomalies détectées sur le site</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E5E4E0', borderRadius: 10, padding: '8px 12px' }}>
          <Search size={14} color="#aaa" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Recherche de..."
            style={{ border: 'none', outline: 'none', fontSize: 13, color: '#1a1a1a', background: 'transparent', flex: 1, fontFamily: F }} />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{
                padding: '5px 12px', borderRadius: 99, border: `1px solid ${category === cat ? VIOLET : '#E5E4E0'}`,
                background: category === cat ? VIOLET : '#fff', color: category === cat ? '#fff' : '#555',
                fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: F, transition: 'all 150ms',
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Severity tabs */}
        <div style={{ display: 'flex', gap: 2, background: '#F5F4F1', borderRadius: 8, padding: 3, width: 'fit-content' }}>
          {SEVERITIES.map(s => (
            <button key={s.id} onClick={() => setSeverity(s.id)}
              style={{
                padding: '5px 11px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: F,
                fontSize: 12, fontWeight: severity === s.id ? 600 : 400,
                background: severity === s.id ? '#fff' : 'transparent',
                color: severity === s.id ? '#0F0F10' : '#888',
                boxShadow: severity === s.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 150ms', whiteSpace: 'nowrap',
              }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issues list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa', fontSize: 13 }}>Aucun problème trouvé</div>
        )}
        {filtered.map(issue => {
          const bc = BadgeColor(issue.severity);
          return (
            <div key={issue.id} style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <SeverityIcon severity={issue.severity} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: '#1a1a1a', margin: '0 0 4px', lineHeight: 1.45 }}>{issue.title}</p>
                <button style={{ fontSize: 11, fontWeight: 600, color: VIOLET, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Résolution du problème →</button>
              </div>
              <div style={{
                flexShrink: 0, padding: '4px 10px', borderRadius: 99,
                background: bc.bg, color: bc.color, border: `1px solid ${bc.border}`,
                fontSize: 11, fontWeight: 700,
              }}>
                {issue.count} nouveau{issue.count > 1 ? 'x' : ''} {issue.count > 1 ? 'problèmes' : 'problème'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}