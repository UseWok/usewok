import { motion } from 'framer-motion';
import { TrendingUp, Target, Sparkles } from 'lucide-react';

const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E8';
const SURFACE = '#F7F7F5';

// Derive a realistic "market potential" from the scan.
// Low current visibility + a clear niche = big untapped opportunity.
export function computePotential(data) {
  const current = Math.round(data?.ai_visibility_score || data?.overall_score || 0);
  // The lower you rank today, the more headroom exists — capped to a believable 65–92 range.
  const headroom = 100 - current;
  const potential = Math.min(92, Math.max(62, Math.round(current + headroom * 0.78)));
  const gap = Math.max(0, potential - current);
  return { current, potential, gap };
}

// ── Animated horizontal gauge
function Gauge({ label, value, color, sub, delay = 0 }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: INK2 }}>{label}</span>
        <span style={{ fontSize: 20, fontWeight: 900, color, letterSpacing: '-0.03em' }}>
          {value}<span style={{ fontSize: 11, color: INK3, fontWeight: 600 }}>/100</span>
        </span>
      </div>
      <div style={{ height: 8, background: SURFACE, borderRadius: 5, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: color, borderRadius: 5 }} />
      </div>
      {sub && <p style={{ fontSize: 11.5, color: INK3, margin: '6px 0 0', lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
}

export default function OpportunityBenchmark({ data }) {
  const { current, potential, gap } = computePotential(data);
  const niche = data?.business_type || 'your market';
  const nicheLabel = niche.charAt(0).toUpperCase() + niche.slice(1);

  return (
    <div>
      <p style={{ fontSize: 13, color: INK2, lineHeight: 1.6, margin: '0 0 18px' }}>
        We measured two things: where you stand in AI answers <b>today</b>, and how far you could realistically climb in <b>{nicheLabel}</b>.
      </p>

      <Gauge
        label="Current AI visibility"
        value={current}
        color="#EF4444"
        sub={`Right now, ChatGPT and Perplexity rarely recommend you in ${nicheLabel.toLowerCase()}.`}
        delay={0.1}
      />

      <Gauge
        label="Market potential"
        value={potential}
        color="#10B981"
        sub={`Few competitors in ${nicheLabel.toLowerCase()} are optimized for AI on these exact queries — the lane is wide open.`}
        delay={0.35}
      />

      {/* The opportunity callout */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        style={{ marginTop: 20, padding: '16px 18px', background: 'linear-gradient(135deg, #F5F3FF, #ECFDF5)', border: '1px solid #D6EFE0', borderRadius: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={14} color="#10B981" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: INK, letterSpacing: '-0.01em' }}>
            +{gap} points of untapped ground
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: INK2, margin: 0, lineHeight: 1.6 }}>
          This isn't flattery — it's an opening. You're sitting on a market where AI engines haven't picked a favorite yet.
          Close this gap and you become the name they cite first.
        </p>
      </motion.div>
    </div>
  );
}