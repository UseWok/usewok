const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#18140F';
const INK2 = '#2C2820';
const INK_FAINT = '#A79E8C';
const CREAM = '#F6F1E7';
const SURFACE = '#FFFFFF';
const BORDER_STRONG = '#DCD1B4';
const ORANGE = '#FF5A1F';
const ORANGE_DARK = '#B23E10';
const ORANGE_TINT = '#FFE6D6';

export function StatusBadge({ status }) {
  const map = {
    done:    { label: 'Done',      bg: INK,           color: CREAM,      dot: ORANGE },
    running: { label: 'Running',   bg: ORANGE_TINT,   color: ORANGE_DARK, dot: ORANGE },
    failed:  { label: 'Failed',    bg: '#FEE2E2',     color: '#DC2626',   dot: '#DC2626' },
  };
  const s = map[status] || map.done;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, padding: '5px 11px', borderRadius: 100, border: `1px solid ${s.bg === INK ? INK : BORDER_STRONG}`, color: s.color, background: s.bg, fontFamily: F }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

export const AGENT_ORDER = ['crawl', 'freshness', 'seo', 'content'];
export const AGENT_LABELS = { crawl: 'Crawl', freshness: 'Freshness', seo: 'Structural SEO', content: 'Content quality' };

export function AgentDots({ agents }) {
  const a = agents || {};
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {AGENT_ORDER.map(k => (
        <div key={k} title={`${AGENT_LABELS[k]}: ${a[k] === 'done' ? 'Done' : 'Running'}`}
          style={{ width: 8, height: 8, borderRadius: '50%', background: a[k] === 'done' ? ORANGE : BORDER_STRONG }} />
      ))}
    </div>
  );
}

export function AgentChip({ agentKey, status }) {
  const done = status === 'done';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 100, fontSize: 12.5, fontWeight: 500, fontFamily: F,
      background: SURFACE, border: `1px solid ${done ? ORANGE_TINT : BORDER_STRONG}`,
      color: done ? ORANGE_DARK : INK_FAINT,
    }}>
      {done && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke={ORANGE_DARK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {AGENT_LABELS[agentKey]} {done ? '✓' : ''}
    </span>
  );
}