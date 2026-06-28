import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = '#E8E4DC';
const WHITE = '#FFFFFF';
const SURFACE = '#EDE8DF'; // beige crème pour la piste vide
const CORAL = '#E8622A';
const BLACK_BAR = '#1A1A1A'; // barres concurrents = noir/très sombre

export default function SOVChart({ sov }) {
  const your = sov?.your_brand;
  const competitors = sov?.competitors || [];
  if (!your && !competitors.length) return null;

  const yourName = your?.name || 'UseWok';
  const yourSov = your?.voice_share_pct || 0;

  const compEntries = competitors
    .filter(c => (c.name || c.domain) !== yourName)
    .map(c => ({ name: c.name || c.domain || 'Concurrent', sov: c.voice_share_pct || 0, isYou: false }));

  // Insert "vous" at its sorted position
  const allBrands = [
    ...compEntries,
    { name: yourName, sov: yourSov, isYou: true },
  ].sort((a, b) => b.sov - a.sov);

  const maxSov = Math.max(...allBrands.map(b => b.sov), 1);

  return (
    <div style={{ marginBottom: 12, fontFamily: F }}>
      {/* Section label */}
      <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
        Part de voix dans votre secteur
      </p>

      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 18px' }}>
        {allBrands.map((b, i) => (
          <div key={i} style={{ marginBottom: i < allBrands.length - 1 ? 14 : 0 }}>
            {/* Name row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 13, fontWeight: b.isYou ? 700 : 500,
                  color: b.isYou ? CORAL : INK,
                }}>
                  {b.name}
                </span>
                {b.isYou && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: CORAL,
                    background: 'rgba(232,98,42,0.10)', borderRadius: 5,
                    padding: '1px 6px',
                  }}>Vous</span>
                )}
              </div>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: b.isYou ? CORAL : INK,
              }}>{b.sov}%</span>
            </div>

            {/* Bar */}
            <div style={{ height: 7, background: SURFACE, borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(b.sov / maxSov) * 100}%` }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: b.isYou ? CORAL : BLACK_BAR,
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}