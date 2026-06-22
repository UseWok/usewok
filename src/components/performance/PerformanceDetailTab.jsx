import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const VIOLET = '#7C3AED';

function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 14, padding: '16px', ...style }}>
      {children}
    </div>
  );
}

function SLabel({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>{children}</p>;
}

// Left column charts
function LoadSpeedChart() {
  const data = [
    { range: '0–0.5s', pages: 46 },
    { range: '0.5–1s', pages: 3 },
    { range: '1–3s', pages: 0 },
    { range: '>3s', pages: 0 },
  ];
  return (
    <div style={{ marginBottom: 16 }}>
      <SLabel>Vitesse de chargement de page</SLabel>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EE" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 9, fill: '#aaa' }} />
          <YAxis type="category" dataKey="range" tick={{ fontSize: 9.5, fill: '#555' }} width={44} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E4E0' }} />
          <Bar dataKey="pages" fill={VIOLET} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AvgSpeedKPI() {
  return (
    <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: '16px 20px', marginBottom: 16, textAlign: 'center' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Vitesse moy. de chargement</p>
      <p style={{ fontSize: 40, fontWeight: 900, color: VIOLET, margin: 0, letterSpacing: '-0.03em' }}>0.19<span style={{ fontSize: 20 }}> sec</span></p>
    </div>
  );
}

function JSCSSFilesChart() {
  const data = [
    { range: '0–10', pages: 3 },
    { range: '10–20', pages: 44 },
    { range: '20–50', pages: 3 },
    { range: '50–100', pages: 0 },
    { range: '100+', pages: 0 },
  ];
  return (
    <div style={{ marginBottom: 16 }}>
      <SLabel>Fichiers JavaScript et CSS</SLabel>
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EE" vertical={false} />
          <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#aaa' }} />
          <YAxis tick={{ fontSize: 9, fill: '#aaa' }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E4E0' }} />
          <Bar dataKey="pages" fill="#3B82F6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function JSCSSSizeChart() {
  const data = [
    { range: '0–0.2 Mo', pages: 2 },
    { range: '0.2–0.5 Mo', pages: 5 },
    { range: '0.5–1 Mo', pages: 40 },
    { range: '1–2 Mo', pages: 3 },
    { range: '2+ Mo', pages: 0 },
  ];
  return (
    <div>
      <SLabel>Taille des fichiers JS et CSS</SLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, color: '#555', width: 70, flexShrink: 0 }}>{d.range}</span>
            <div style={{ flex: 1, height: 8, background: '#F1F0EE', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(d.pages / 50) * 100}%`, height: '100%', background: '#10B981', borderRadius: 4, transition: 'width 0.8s ease' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', width: 20, textAlign: 'right' }}>{d.pages}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Right column issues panel
const PERF_ERRORS = [
  { label: 'Grande taille de page HTML', status: 'ok' },
  { label: 'Chaînes et boucles de redirection', status: 'ok' },
  { label: 'Vitesse de chargement de la page lente', status: 'ok' },
];
const PERF_WARNINGS = [
  { label: 'Pages non compressées', status: 'ok' },
  { label: 'Fichiers JS et CSS décompressés', status: 'ok' },
  { label: 'Fichiers JS et CSS non mis en cache', status: 'ok' },
  { label: 'Taille totale des fichiers JS et CSS trop grande', status: 'issue', count: 47 },
  { label: 'Trop de fichiers JS et CSS', status: 'ok' },
  { label: 'Fichiers JS et CSS non minimisés', status: 'ok' },
];

function IssueRow({ item }) {
  const isIssue = item.status === 'issue';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 0', borderBottom: '1px solid #F8F7F4' }}>
      {isIssue
        ? <AlertTriangle size={13} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
        : <CheckCircle size={13} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 12, color: '#1a1a1a', lineHeight: 1.4 }}>{item.label}</span>
        <div style={{ marginTop: 4 }}>
          {isIssue ? (
            <button style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#F59E0B', border: 'none', borderRadius: 7, padding: '4px 10px', cursor: 'pointer' }}>
              Résolution du problème
            </button>
          ) : (
            <span style={{ fontSize: 11, color: '#aaa', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ cursor: 'pointer', color: VIOLET }}>En savoir plus</span> · Aucun problème
            </span>
          )}
          {isIssue && (
            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: '#D97706' }}>{item.count} problèmes</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PerformanceDetailTab({ onBack }) {
  return (
    <div>
      {/* Sub-header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', marginBottom: 12 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={13} /> Vue d'ensemble
        </button>
        <span style={{ color: '#ccc' }}>/</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>Performances</span>
        <div style={{ marginLeft: 'auto', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '4px 10px' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#D97706' }}>94%</span>
        </div>
      </div>

      {/* Two-column layout (stacked on mobile) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {/* Left column */}
        <Card>
          <LoadSpeedChart />
          <AvgSpeedKPI />
          <JSCSSFilesChart />
          <JSCSSSizeChart />
        </Card>

        {/* Right column */}
        <Card>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', margin: '0 0 14px' }}>Problèmes de performances</p>

          <p style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Erreurs</p>
          {PERF_ERRORS.map((item, i) => <IssueRow key={i} item={item} />)}

          <p style={{ fontSize: 11, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '14px 0 6px' }}>Avertissements</p>
          {PERF_WARNINGS.map((item, i) => <IssueRow key={i} item={item} />)}
        </Card>
      </div>
    </div>
  );
}