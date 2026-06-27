import { useState, useEffect } from 'react';

const CORAL = '#FF5A1F';
const WHITE = '#FFFFFF';
const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';

const PLAN_INTERVAL_DAYS = { free: 30, starter: 2, pro: 1 };

function getNextScanTime(lastScan, planId) {
  if (!lastScan) return null;
  const intervalMs = (PLAN_INTERVAL_DAYS[planId] || 30) * 24 * 60 * 60 * 1000;
  return new Date(new Date(lastScan).getTime() + intervalMs);
}

function isScanAvailable(lastScan, planId) {
  if (!lastScan) return true;
  const next = getNextScanTime(lastScan, planId);
  return next <= new Date();
}

function formatCountdown(ms) {
  if (ms <= 0) return '0s';
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}j ${String(h).padStart(2,'0')}h`;
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m`;
  return `${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
}

// Ring chrono à gauche + pastille rouge cliquable à droite
export default function ScanStatusIndicator({ lastScan, planId = 'free', onScan, scanning }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const available = isScanAvailable(lastScan, planId);
  const intervalMs = (PLAN_INTERVAL_DAYS[planId] || 30) * 24 * 60 * 60 * 1000;
  const elapsed = lastScan ? now - new Date(lastScan).getTime() : intervalMs;
  const progress = Math.min(elapsed / intervalMs, 1);

  const nextScan = lastScan ? getNextScanTime(lastScan, planId) : null;
  const remaining = nextScan ? Math.max(nextScan.getTime() - now, 0) : 0;

  const size = 32;
  const sw = 2.2;
  const R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  const dashOffset = circ * (1 - progress);
  const ringColor = available ? CORAL : 'rgba(240,232,215,0.35)';
  const trackColor = 'rgba(240,232,215,0.12)';

  if (scanning) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width={size} height={size} style={{ animation: 'scanSpin 1s linear infinite', flexShrink: 0 }}>
          <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={trackColor} strokeWidth={sw} />
          <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={ringColor}  strokeWidth={sw}
            strokeDasharray={`${circ * 0.25} ${circ * 0.75}`} strokeLinecap="round" />
        </svg>
        <style>{`@keyframes scanSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {/* Ring chrono avec countdown jusqu'aux secondes */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={trackColor} strokeWidth={sw} />
          <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={ringColor} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={dashOffset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        {/* Countdown au centre — blanc cassé */}
        {!available && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{
              fontSize: 5.5, fontWeight: 600, color: 'rgba(240,232,215,0.45)',
              fontFamily: F, lineHeight: 1, textAlign: 'center',
              fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
            }}>
              {formatCountdown(remaining)}
            </span>
          </div>
        )}
      </div>

      {/* Pastille = bouton scan */}
      <button
        onClick={available ? onScan : undefined}
        title={available ? 'Lancer une analyse' : undefined}
        style={{
          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
          background: available ? CORAL : 'rgba(240,232,215,0.22)',
          border: 'none', padding: 0,
          cursor: available ? 'pointer' : 'default',
          boxShadow: available ? `0 0 0 2.5px rgba(255,90,31,0.25)` : 'none',
          transition: 'background 300ms',
        }}
      />

      <style>{`@keyframes scanSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}