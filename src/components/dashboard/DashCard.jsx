// Reusable dashboard card shell — header with title + optional right action.
const INK = '#15130F';
const INK_SOFT = '#4A453B';
const INK3 = 'rgba(21,19,15,0.5)';
const BORDER = 'rgba(21,19,15,0.09)';
const WHITE = '#FFFFFF';
const F = 'Inter, system-ui, sans-serif';

export default function DashCard({ title, dot, action, onAction, children, style }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '22px 24px', fontFamily: F, display: 'flex', flexDirection: 'column', ...style }}>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />}
            <span style={{ fontSize: 13, fontWeight: 700, color: INK_SOFT, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</span>
          </div>
          {action && (
            <button onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#C43E14', fontFamily: F, padding: 0 }}>
              {action}
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export { INK, INK_SOFT, INK3, BORDER, WHITE, F };