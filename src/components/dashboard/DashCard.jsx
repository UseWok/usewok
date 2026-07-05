// Reusable dashboard card shell — header with title + optional right action.
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = '#E9E5DD';
const WHITE = '#FFFFFF';
const F = 'Inter, system-ui, sans-serif';

export default function DashCard({ title, dot, action, onAction, children, style }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px 18px', fontFamily: F, ...style }}>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />}
            <span style={{ fontSize: 11, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
          </div>
          {action && (
            <button onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#7C3AED', fontFamily: F, padding: 0 }}>
              {action}
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export { INK, INK3, BORDER, WHITE, F };