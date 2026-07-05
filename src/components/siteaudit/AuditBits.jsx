const F = 'Inter, system-ui, sans-serif';
const GREEN = '#10B981';
const GRAY = '#C9C6BF';

export function StatusBadge({ status }) {
  const map = {
    done: { label: 'Done', bg: '#10B981', color: '#fff' },
    running: { label: 'Running', bg: 'rgba(249,115,22,0.14)', color: '#F97316' },
    failed: { label: 'Failed', bg: 'rgba(239,68,68,0.12)', color: '#EF4444' },
  };
  const s = map[status] || map.done;
  return (
    <span style={{ padding: '4px 12px', background: s.bg, color: s.color, borderRadius: 20, fontSize: 11.5, fontWeight: 700, fontFamily: F, display: 'inline-block' }}>
      {s.label}
    </span>
  );
}

export const AGENT_ORDER = ['crawl', 'freshness', 'seo', 'content'];
export const AGENT_LABELS = { crawl: 'Crawl', freshness: 'Freshness', seo: 'Structural SEO', content: 'Content Quality' };

export function AgentDots({ agents }) {
  const a = agents || {};
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {AGENT_ORDER.map(k => (
        <div key={k} title={`${AGENT_LABELS[k]} : ${a[k] === 'done' ? 'Done' : 'Pending'}`}
          style={{ width: 8, height: 8, borderRadius: '50%', background: a[k] === 'done' ? GREEN : GRAY }} />
      ))}
    </div>
  );
}

export function AgentChip({ agentKey, status }) {
  const done = status === 'done';
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 600, fontFamily: F,
      background: done ? 'rgba(16,185,129,0.12)' : 'rgba(21,19,15,0.06)',
      color: done ? '#0B815A' : '#8A877F',
    }}>
      {AGENT_LABELS[agentKey]}: {done ? 'Done' : 'Pending'}
    </span>
  );
}