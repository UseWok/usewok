import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Check, X, ChevronRight, AlertCircle } from 'lucide-react';

const F   = 'Inter, system-ui, sans-serif';
const INK  = '#111111';
const INK2 = '#555555';
const INK3 = '#999999';
const BORDER = '#E8E7E4';
const SURFACE = '#F7F6F3';
const WHITE = '#FFFFFF';

function Card({ children, style = {} }) {
  return <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '18px 20px', fontFamily: F, ...style }}>{children}</div>;
}

function Label({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>{children}</p>;
}

function SpeedRow({ label, pages, maxPages }) {
  const pct = maxPages > 0 ? Math.min((pages / maxPages) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: INK2, width: 72, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: SURFACE, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: INK, borderRadius: 3, transition: 'width 0.7s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: INK3, width: 54, textAlign: 'right', flexShrink: 0 }}>{pages > 0 ? `${pages} pages` : '0'}</span>
    </div>
  );
}

// ── Fix drawer ──────────────────────────────────────────────────────
function FixDrawer({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1 }} />
      <div onClick={e => e.stopPropagation()} style={{ width: 360, background: WHITE, borderLeft: `1px solid ${BORDER}`, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>Comment corriger</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0 }}>Taille totale des fichiers JS et CSS trop grande</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={13} color={INK2} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Activez la minification JS/CSS dans votre bundler (Vite, Webpack…)', 'Activez la compression gzip ou brotli côté serveur / CDN', 'Supprimez les dépendances inutilisées et lazy-loadez les scripts non critiques', 'Ciblez un budget total inférieur à 200 Ko compressé pour le CSS + JS critique'].map((step, i) => (
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

// ── Issue row ───────────────────────────────────────────────────────
function PerfIssueRow({ label, isAlert, count, onFix }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ flexShrink: 0 }}>
        {isAlert
          ? <AlertCircle size={13} color={INK} />
          : <Check size={13} color={INK3} />}
      </div>
      <span style={{ fontSize: 12, color: INK, flex: 1 }}>{label}</span>
      <div style={{ display: 'flex', align: 'center', gap: 10, flexShrink: 0 }}>
        {isAlert ? (
          <>
            <span style={{ fontSize: 11, color: INK3 }}>{count} problèmes</span>
            <button onClick={onFix}
              style={{ fontSize: 11, fontWeight: 600, color: WHITE, background: INK, border: 'none', borderRadius: 7, padding: '5px 11px', cursor: 'pointer', fontFamily: F }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Corriger
            </button>
          </>
        ) : (
          <span style={{ fontSize: 11, color: INK3 }}>Aucun problème</span>
        )}
      </div>
    </div>
  );
}

export default function AuditPerformance() {
  const [fixOpen, setFixOpen] = useState(false);

  const jsFilesData = [
    { range: '0-10', count: 3 }, { range: '10-20', count: 8 }, { range: '20-50', count: 28 },
    { range: '50-100', count: 9 }, { range: '100+', count: 2 },
  ];

  const jsSizeData = [
    { range: '0–0,2 Mo', count: 15 }, { range: '0,2–0,5', count: 20 },
    { range: '0,5–1 Mo', count: 8 }, { range: '1–2 Mo', count: 4 }, { range: '2+ Mo', count: 0 },
  ];

  return (
    <div style={{ fontFamily: F }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 22, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Performances</p>
        <p style={{ fontSize: 13, color: INK3, margin: 0 }}>Score global : <strong style={{ color: INK }}>94 / 100</strong></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>

        {/* ── Left ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Speed distribution */}
          <Card>
            <Label>Vitesse de chargement</Label>
            <SpeedRow label="0 – 0,5 s" pages={46} maxPages={50} />
            <SpeedRow label="0,5 – 1 s" pages={3} maxPages={50} />
            <SpeedRow label="1 – 3 s" pages={0} maxPages={50} />
            <SpeedRow label="> 3 s" pages={0} maxPages={50} />
          </Card>

          {/* Avg KPI */}
          <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '28px 20px' }}>
            <Label>Vitesse moy. de chargement</Label>
            <span style={{ fontSize: 52, fontWeight: 900, color: INK, letterSpacing: '-0.05em', lineHeight: 1 }}>0,19</span>
            <span style={{ fontSize: 14, color: INK3, fontWeight: 600 }}>secondes</span>
          </Card>

          {/* JS/CSS count histogram */}
          <Card>
            <Label>Nombre de fichiers JS et CSS</Label>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={jsFilesData} margin={{ top: 4, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fontSize: 9, fill: INK3 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: INK3 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE }} cursor={{ fill: SURFACE }} />
                <Bar dataKey="count" fill={INK} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* JS/CSS size distribution */}
          <Card>
            <Label>Taille des fichiers JS et CSS</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {jsSizeData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: INK2, width: 72, flexShrink: 0 }}>{d.range}</span>
                  <div style={{ flex: 1, height: 6, background: SURFACE, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((d.count / 20) * 100, 100)}%`, background: INK, borderRadius: 3, transition: 'width 0.7s ease' }} />
                  </div>
                  <span style={{ fontSize: 11, color: INK3, width: 20, textAlign: 'right' }}>{d.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Right ────────────────────────────────────────────────── */}
        <Card>
          <Label>Problèmes de performance</Label>

          <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Erreurs</p>
          <PerfIssueRow label="Grande taille de page HTML" />
          <PerfIssueRow label="Chaînes et boucles de redirection" />
          <PerfIssueRow label="Vitesse de chargement lente" />

          <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '20px 0 6px' }}>Avertissements</p>
          <PerfIssueRow label="Pages non compressées" />
          <PerfIssueRow label="Fichiers JS/CSS décompressés" />
          <PerfIssueRow label="Fichiers JS/CSS non mis en cache" />
          <PerfIssueRow label="Taille totale des fichiers JS/CSS trop grande" isAlert count={47} onFix={() => setFixOpen(true)} />
          <PerfIssueRow label="Trop de fichiers JS/CSS" />
          <PerfIssueRow label="Fichiers JS/CSS non minimisés" />
        </Card>
      </div>

      {fixOpen && <FixDrawer onClose={() => setFixOpen(false)} />}
    </div>
  );
}