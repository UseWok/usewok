const INK = '#15130F';
const INK_SOFT = '#4A453B';
const INK3 = 'rgba(21,19,15,0.5)';
const BORDER = 'rgba(21,19,15,0.07)';
const WHITE = '#FFFFFF';
const F = '"Wix Madefor Text", "Wix Madefor Display", system-ui, sans-serif';

export default function DashCard({ title, dot, action, onAction, children, style }) {
  return (
    <div style={{
      background: WHITE,
      border: `1px solid ${BORDER}`,
      borderRadius: 20,
      padding: '24px 26px',
      fontFamily: F,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
      ...style,
    }}>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, boxShadow: `0 0 0 3px ${dot}22` }} />}
            <span style={{ fontSize: 12.5, fontWeight: 700, color: INK_SOFT, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</span>
          </div>
          {action && (
            <button onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: '#FF5A1F', fontFamily: F, padding: 0, transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.7}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}>
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