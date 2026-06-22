import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const VIOLET = '#7C3AED';

function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 14, padding: 18, ...style }}>{children}</div>;
}

function SectionTitle({ children }) {
  return <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 14px' }}>{children}</p>;
}

// ── Horizontal stacked bar ─────────────────────────────────────────
function SpeedRow({ label, pages, maxPages, color }) {
  const pct = maxPages > 0 ? Math.min((pages / maxPages) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: '#555', width: 70, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 10, background: '#F1F0EE', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: '#888', width: 60, textAlign: 'right', flexShrink: 0 }}>{pages > 0 ? `${pages} pages` : '0'}</span>
    </div>
  );
}

// ── Issue row ──────────────────────────────────────────────────────
function PerfIssueRow({ label, status, count, isAlert }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #F5F4F1', gap: 10 }}>
      <span style={{ fontSize: 12, color: '#1a1a1a', flex: 1, minWidth: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {isAlert ? (
          <button style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#EF4444', border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer' }}>
            Résolution du problème
          </button>
        ) : (
          <button style={{ fontSize: 11, fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>En savoir plus</button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {isAlert ? (
            <>
              <AlertTriangle size={12} color="#EF4444" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444' }}>{count} problèmes</span>
            </>
          ) : (
            <>
              <CheckCircle size={12} color="#10B981" />
              <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Aucun problème</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuditPerformance() {
  const jsFilesData = [
    { range: '0-10', count: 3 },
    { range: '10-20', count: 8 },
    { range: '20-50', count: 28 },
    { range: '50-100', count: 9 },
    { range: '100+', count: 2 },
  ];

  const jsSizeData = [
    { range: '0-0,2 Mo', count: 15 },
    { range: '0,2-0,5 Mo', count: 20 },
    { range: '0,5-1 Mo', count: 8 },
    { range: '1-2 Mo', count: 4 },
    { range: '2+ Mo', count: 0 },
  ];

  return (
    <div style={{ fontFamily: F }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F0F10', margin: '0 0 2px' }}>Performances</p>
        <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Score : <strong style={{ color: '#F59E0B' }}>94%</strong></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* ── Left column ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Page load speed */}
          <Card>
            <SectionTitle>Vitesse de chargement de page</SectionTitle>
            <SpeedRow label="0 - 0,5 s" pages={46} maxPages={50} color="#10B981" />
            <SpeedRow label="0,5 - 1 s" pages={3} maxPages={50} color="#F59E0B" />
            <SpeedRow label="1 - 3 s" pages={0} maxPages={50} color="#EF4444" />
            <SpeedRow label="> 3 s" pages={0} maxPages={50} color="#EF4444" />
          </Card>

          {/* Avg load speed KPI */}
          <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '24px 18px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Vitesse moy. de chargement</p>
            <span style={{ fontSize: 44, fontWeight: 900, color: '#10B981', letterSpacing: '-0.03em', lineHeight: 1 }}>0,19</span>
            <span style={{ fontSize: 14, color: '#555', fontWeight: 600 }}>sec.</span>
          </Card>

          {/* JS/CSS files histogram */}
          <Card>
            <SectionTitle>Fichiers JavaScript et CSS</SectionTitle>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={jsFilesData} margin={{ top: 5, bottom: 5 }}>
                <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#aaa' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#aaa' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E4E0' }} />
                <Bar dataKey="count" fill={VIOLET} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* JS/CSS size histogram */}
          <Card>
            <SectionTitle>Taille des fichiers JavaScript et CSS</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {jsSizeData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#555', width: 80, flexShrink: 0 }}>{d.range}</span>
                  <div style={{ flex: 1, height: 8, background: '#F1F0EE', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((d.count / 20) * 100, 100)}%`, background: '#3B82F6', borderRadius: 2, transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#888', width: 24, textAlign: 'right' }}>{d.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Right column ─────────────────────────────────────────── */}
        <Card>
          <SectionTitle>Problèmes de performances</SectionTitle>

          {/* Errors */}
          <p style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Erreurs</p>
          <PerfIssueRow label="Grande taille de page HTML" />
          <PerfIssueRow label="Chaînes et boucles de redirection" />
          <PerfIssueRow label="Vitesse de chargement de la page lente" />

          {/* Warnings */}
          <p style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '16px 0 4px' }}>Avertissements</p>
          <PerfIssueRow label="Pages non compressées" />
          <PerfIssueRow label="Fichiers JavaScript et CSS décompressés" />
          <PerfIssueRow label="Fichiers JavaScript et CSS non mis en cache" />
          <PerfIssueRow label="Taille totale des fichiers JavaScript et CSS trop grande" isAlert count={47} />
          <PerfIssueRow label="Trop de fichiers JavaScript et CSS" />
          <PerfIssueRow label="Fichiers JavaScript et CSS non minimisés" />
        </Card>
      </div>
    </div>
  );
}