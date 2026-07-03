import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = '#E8E4DC';
const WHITE = '#FFFFFF';
const SURFACE = '#EDE8DF';
const CORAL = '#E8622A';

export default function SOVChart({ sov }) {
  const your = sov?.your_brand;
  const competitors = sov?.competitors || [];
  if (!your && !competitors.length) return null;

  const yourName = your?.name || 'UseWok';
  const yourSov = your?.voice_share_pct || 0;

  const compEntries = competitors
    .filter(c => (c.name || c.domain) !== yourName)
    .map(c => ({ name: c.name || c.domain || 'Competitor', sov: c.voice_share_pct || 0, isYou: false }));

  const allBrands = [
    ...compEntries,
    { name: yourName, sov: yourSov, isYou: true },
  ].sort((a, b) => b.sov - a.sov);

  const maxSov = Math.max(...allBrands.map(b => b.sov), 1);

  return (
    <div style={{ marginBottom: 12, fontFamily: F }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
        Share of voice in your industry
      </p>

      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '18px 20px' }}>
        {allBrands.map((b, i) => (
          <div key={i} style={{ marginBottom: i < allBrands.length - 1 ? 18 : 0 }}>
            {/* Name + badge + percentage on same row */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 7 }}>
              {/* Left: name + vous badge */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 90, flexShrink: 0 }}>
                <span style={{
                  fontSize: 13.5, fontWeight: b.isYou ? 700 : 500,
                  color: b.isYou ? CORAL : INK,
                  lineHeight: 1,
                }}>
                  {b.name}
                </span>
                {b.isYou && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: CORAL,
                    background: 'rgba(232,98,42,0.12)',
                    borderRadius: 20, padding: '2px 8px',
                    display: 'inline-block', width: 'fit-content',
                  }}>You</span>
                )}
              </div>

              {/* Bar */}
              <div style={{ flex: 1, height: 9, background: SURFACE, borderRadius: 999, overflow: 'hidden', margin: '0 12px' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.sov / maxSov) * 100}%` }}
                  transition={{ duration: 1.1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    height: '100%',
                    background: b.isYou ? CORAL : INK,
                    borderRadius: 999,
                  }}
                />
              </div>

              {/* Percentage */}
              <span style={{
                fontSize: 13.5, fontWeight: 700, minWidth: 36, textAlign: 'right',
                color: b.isYou ? CORAL : INK,
              }}>{b.sov}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}