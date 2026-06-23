import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const SURFACE = '#F7F6F4';
const WHITE = '#FFFFFF';
const VIOLET = '#7C3AED';

const COMP_COLORS = ['#E0E0DE', '#D0D0CE', '#C0C0BE', '#B0B0AE'];

export default function SOVChart({ sov }) {
  const your = sov?.your_brand;
  const competitors = sov?.competitors || [];
  if (!your) return null;

  const allBrands = [
    { name: your.name || 'Vous', sov: your.voice_share_pct || 0, fav: your.favorable_pct || 0, isYou: true },
    ...competitors.map((c, i) => ({ name: c.name || c.domain || `Concurrent ${i + 1}`, sov: c.voice_share_pct || 0, fav: c.favorable_pct || 0, isYou: false })),
  ].sort((a, b) => b.sov - a.sov);

  const maxSov = Math.max(...allBrands.map(b => b.sov), 1);

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 14, fontFamily: F }}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <BarChart2 size={15} color={INK3} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Part de voix IA</p>
          <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>Sur les requêtes de votre secteur</p>
        </div>
      </div>

      <div style={{ padding: '16px 18px' }}>
        {allBrands.map((b, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 12, fontWeight: b.isYou ? 800 : 600, color: b.isYou ? INK : INK2 }}>{b.name}</span>
                {b.isYou && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: `${VIOLET}15`, color: VIOLET }}>Vous</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: INK3 }}>Part de voix</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: INK }}>{b.sov}%</span>
              </div>
            </div>
            {/* SOV bar */}
            <div style={{ height: 6, background: SURFACE, borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${(b.sov / maxSov) * 100}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                style={{ height: '100%', background: b.isYou ? VIOLET : COMP_COLORS[i] || '#D0D0CE', borderRadius: 3 }} />
            </div>
            {/* Fav bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, color: INK3, width: 100, flexShrink: 0 }}>Perception +</span>
              <div style={{ flex: 1, height: 3, background: SURFACE, borderRadius: 2, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${b.fav}%` }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.2, ease: 'easeOut' }}
                  style={{ height: '100%', background: b.isYou ? '#10B981' : '#D4D4D2', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: b.isYou ? '#10B981' : INK3, width: 28, textAlign: 'right' }}>{b.fav}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}