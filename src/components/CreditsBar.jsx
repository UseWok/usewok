/**
 * CreditsBar — real-time credit consumption display
 * variant="settings" → embedded panel in SettingsPage usage tab
 * The "home" floating chip has been removed per user request.
 */
import { useCredits } from '@/hooks/useCredits';

function formatNum(n) {
  if (typeof n !== 'number') return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toLocaleString('en-US');
}

function formatResetDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
}

export default function CreditsBar({ user, variant = 'settings' }) {
  const { used, limit, resetAt, pct, consumed, barColor, loading, isLow } = useCredits(user);

  // Don't render for admins or unauthenticated users
  if (!user || user.role === 'admin') return null;
  if (loading) return null;

  // home variant is removed — render nothing
  if (variant === 'home') return null;

  const resetLabel = formatResetDate(resetAt);

  // ── SETTINGS variant: full embedded card ──
  return (
    <div style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 10, padding: '14px 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Credit usage</span>
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
          {formatNum(consumed)} credits used this cycle
        </span>
        {resetLabel && (
          <span style={{ fontSize: 11, color: '#444' }}>Renews on {resetLabel}</span>
        )}
      </div>
      {isLow && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, fontSize: 12, color: '#ef4444', fontWeight: 500 }}>
          ⚠ Credits almost exhausted — consider upgrading your plan.
        </div>
      )}
    </div>
  );
}