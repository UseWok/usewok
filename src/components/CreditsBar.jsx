/**
 * CreditsBar — real-time credit consumption display
 * variant="home"     → floating widget at bottom of Home page
 * variant="settings" → embedded panel in SettingsPage usage tab
 */
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';

function formatNum(n) {
  if (typeof n !== 'number') return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toLocaleString('fr-FR');
}

function formatResetDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

export default function CreditsBar({ user, variant = 'home' }) {
  const navigate = useNavigate();
  const { used, limit, resetAt, pct, consumed, barColor, loading, isLow } = useCredits(user);

  // Don't render for admins or unauthenticated users
  if (!user || user.role === 'admin') return null;
  if (loading) return null;

  const resetLabel = formatResetDate(resetAt);

  // ── HOME variant: compact floating chip at bottom-center ──
  if (variant === 'home') {
    return (
      <div
        onClick={() => navigate('/settings?tab=usage')}
        style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.09)', borderRadius: 999,
          padding: '6px 14px 6px 10px',
          boxShadow: '0 4px 18px rgba(0,0,0,0.4)',
          fontFamily: 'Inter, sans-serif',
          transition: 'border-color 150ms',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}
      >
        {/* Bar */}
        <div style={{ width: 56, height: 4, background: '#2A2A2A', borderRadius: 999, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, transition: 'width 0.4s ease' }} />
        </div>
        {/* Label */}
        <span style={{ fontSize: 12, color: isLow ? '#ef4444' : '#888', fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ color: '#fff', fontWeight: 600 }}>{formatNum(consumed)}</span>
          <span style={{ color: '#555', margin: '0 3px' }}>/</span>
          <span>{formatNum(limit)}</span>
          <span style={{ marginLeft: 6, color: '#555' }}>consumed</span>
        </span>
        {resetLabel && (
          <span style={{ fontSize: 10, color: '#444', borderLeft: '1px solid #2A2A2A', paddingLeft: 10 }}>
            resets {resetLabel}
          </span>
        )}
      </div>
    );
  }

  // ── SETTINGS variant: full embedded card ──
  return (
    <div style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 10, padding: '14px 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Consommation de crédits</span>
        <span style={{ fontSize: 11, color: isLow ? '#ef4444' : '#888', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
          {formatNum(consumed)} / {formatNum(limit)}
        </span>
      </div>
      {/* Progress bar */}
      <div style={{ height: 6, background: '#2A2A2A', borderRadius: 999, marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#555' }}>
          {formatNum(consumed)} crédits consommés ce cycle
        </span>
        {resetLabel && (
          <span style={{ fontSize: 11, color: '#444' }}>Renouvellement le {resetLabel}</span>
        )}
      </div>
      {isLow && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, fontSize: 12, color: '#ef4444', fontWeight: 500 }}>
          ⚠ Crédits presque épuisés — pensez à upgrader votre plan.
        </div>
      )}
    </div>
  );
}