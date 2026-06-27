import { useState, useEffect } from 'react';

const CORAL = '#FF5A1F';
const WHITE = '#FFFFFF';

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

// Juste l'icône : un ring qui se remplit au fil du temps + pastille rouge si disponible
export default function ScanStatusIndicator({ lastScan, planId = 'free', onScan, scanning }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const available = isScanAvailable(lastScan, planId);

  const intervalMs = (PLAN_INTERVAL_DAYS[planId] || 30) * 24 * 60 * 60 * 1000;
  const elapsed = lastScan ? now - new Date(lastScan).getTime() : intervalMs;
  const progress = Math.min(elapsed / intervalMs, 1); // 0→1

  const size = 28;
  const sw = 2.5;
  const R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  // ring se remplit : progress=0 = vide, progress=1 = plein
  const dashOffset = circ * (1 - progress);
  const ringColor = available ? CORAL : 'rgba(255,255,255,0.35)';
  const trackColor = 'rgba(255,255,255,0.10)';

  return (
    <button
      onClick={available && !scanning ? onScan : undefined}
      title={available ? 'Lancer une analyse' : 'Prochain scan disponible bientôt'}
      style={{
        position: 'relative', width: size, height: size,
        background: 'none', border: 'none', cursor: available && !scanning ? 'pointer' : 'default',
        padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {scanning ? (
        // Spinner quand en cours
        <svg width={size} height={size} style={{ animation: 'scanSpin 1s linear infinite' }}>
          <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={sw} />
          <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={CORAL} strokeWidth={sw}
            strokeDasharray={`${circ * 0.25} ${circ * 0.75}`} strokeLinecap="round" />
        </svg>
      ) : (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={trackColor} strokeWidth={sw} />
          <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={ringColor} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={dashOffset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
      )}

      {/* Pastille rouge si disponible */}
      {available && !scanning && (
        <div style={{
          position: 'absolute', top: 1, right: 1,
          width: 7, height: 7, borderRadius: '50%',
          background: CORAL,
          border: `1.5px solid rgba(21,19,15,0.9)`,
        }} />
      )}

      <style>{`@keyframes scanSpin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}