import { motion } from 'framer-motion';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const SURFACE = '#F7F6F4';
const WHITE = '#FFFFFF';

const COUNTRY_FLAGS = {
  FR: '🇫🇷', US: '🇺🇸', GB: '🇬🇧', DE: '🇩🇪', ES: '🇪🇸', IT: '🇮🇹',
  CA: '🇨🇦', BE: '🇧🇪', CH: '🇨🇭', JP: '🇯🇵', BR: '🇧🇷', IN: '🇮🇳',
  AU: '🇦🇺', NL: '🇳🇱', PT: '🇵🇹', MX: '🇲🇽', SG: '🇸🇬', OTHER: '🌍',
};

const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function DonutChart({ data, size = 90 }) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 6, r = R - 14;
  let cumPct = 0;

  const arcs = data.map((d, i) => {
    const startAngle = cumPct * 3.6 - 90;
    cumPct += d.pct;
    const endAngle = cumPct * 3.6 - 90;
    const toRad = a => a * Math.PI / 180;
    const x1 = cx + R * Math.cos(toRad(startAngle));
    const y1 = cy + R * Math.sin(toRad(startAngle));
    const x2 = cx + R * Math.cos(toRad(endAngle));
    const y2 = cy + R * Math.sin(toRad(endAngle));
    const xi1 = cx + r * Math.cos(toRad(startAngle));
    const yi1 = cy + r * Math.sin(toRad(startAngle));
    const xi2 = cx + r * Math.cos(toRad(endAngle));
    const yi2 = cy + r * Math.sin(toRad(endAngle));
    const large = d.pct > 50 ? 1 : 0;
    return { d: `M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)} L${xi2.toFixed(2)},${yi2.toFixed(2)} A${r},${r} 0 ${large},0 ${xi1.toFixed(2)},${yi1.toFixed(2)} Z`, color: COLORS[i % COLORS.length] };
  });

  return (
    <svg width={size} height={size}>
      {arcs.map((arc, i) => (
        <motion.path key={i} d={arc.d} fill={arc.color} opacity={0.9}
          initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ delay: i * 0.1, duration: 0.5 }} />
      ))}
    </svg>
  );
}

export default function GeoScoreChart({ d }) {
  const geoTraffic = d?.geo_traffic || [];
  if (!geoTraffic.length) return null;

  const topGeo = geoTraffic.slice(0, 5);

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 14, fontFamily: F }}>
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${BORDER}` }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>Visibilité IA par pays</p>
        <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>Distribution du trafic organique estimé</p>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {topGeo.length >= 2 && <DonutChart data={topGeo} size={96} />}

        <div style={{ flex: 1, minWidth: 160 }}>
          {topGeo.map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < topGeo.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{COUNTRY_FLAGS[g.country] || '🌍'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: INK2 }}>{g.country_name || g.country}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: INK }}>{g.pct}%</span>
                </div>
                <div style={{ height: 3, background: SURFACE, borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${g.pct}%` }} transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                    style={{ height: '100%', background: COLORS[i % COLORS.length], borderRadius: 2 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}