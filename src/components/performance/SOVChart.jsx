import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1C1C1E';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EBEBEB';
const WHITE = '#FFFFFF';
const SURFACE = '#F8F8F8';

export default function SOVChart({ sov }) {
  const your = sov?.your_brand;
  const competitors = sov?.competitors || [];
  if (!your && !competitors.length) return null;

  // Build sorted list: competitors by sov desc, then you at your position
  const yourEntry = { name: your?.name || 'UseWok', sov: your?.voice_share_pct || 0, isYou: true };
  const compEntries = competitors.map(c => ({ name: c.name || c.domain || 'Concurrent', sov: c.voice_share_pct || 0, isYou: false }));
  const allBrands = [...compEntries, yourEntry].sort((a, b) => b.sov - a.sov);
  const maxSov = Math.max(...allBrands.map(b => b.sov), 1);

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12, fontFamily: F }}>
      <div style={{ padding: '13px 16px', borderBottom: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>PART DE VOIX DANS VOTRE SECTEUR</p>
      </div>

      <div style={{ padding: '12px 16px' }}>
        {allBrands.map((b, i) => (
          <div key={i} style={{ marginBottom: i < allBrands.length - 1 ? 12 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: b.isYou ? 700 : 500, color: INK }}>{b.name}</span>
                {b.isYou && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#E8622A', background: 'rgba(232,98,42,0.10)', borderRadius: 4, padding: '1px 5px' }}>Vous</span>
                )}
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{b.sov}%</span>
            </div>
            <div style={{ height: 6, background: SURFACE, borderRadius: 3, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(b.sov / maxSov) * 100}%` }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: 'easeOut' }}
                style={{ height: '100%', background: b.isYou ? '#1C1C1E' : '#D0D0CE', borderRadius: 3 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}