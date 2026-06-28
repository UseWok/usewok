import { useState, useEffect } from 'react';

const CORAL = '#FF5A1F';
const CREAM = 'rgba(248, 240, 220, 0.80)';
const CREAM_DIM = 'rgba(248, 240, 220, 0.20)';
const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';

const PLAN_INTERVAL_DAYS = { free: 30, starter: 2, pro: 1 };

function getNextScanTime(lastScan, planId) {
  if (!lastScan) return null;
  const intervalMs = (PLAN_INTERVAL_DAYS[planId] || 30) * 24 * 60 * 60 * 1000;
  return new Date(new Date(lastScan).getTime() + intervalMs);
}

function isScanAvailable(lastScan, planId) {
  if (!lastScan) return true;
  return getNextScanTime(lastScan, planId) <= new Date();
}

// Retourne { d, h, m, s } réels à partir des ms restantes
function parseCountdown(ms) {
  const total = Math.max(Math.floor(ms / 1000), 0);
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

function pad(n) { return String(n).padStart(2, '0'); }

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
  const { d, h, m, s } = parseCountdown(remaining);

  // Ring
  const size = 38;
  const sw = 2;
  const R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  const dashOffset = circ * (1 - progress);
  const ringColor = available ? CORAL : CREAM;

  // Chrono label compact mais lisible
  let chronoLabel = '';
  if (!available) {
    if (d > 0)      chronoLabel = `${d}j ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
    else if (h > 0) chronoLabel = `${h}h ${pad(m)}m ${pad(s)}s`;
    else            chronoLabel = `${pad(m)}m ${pad(s)}s`;
  }

  if (scanning) return null;

  // Pastille discrète orange si cooldown, bouton scan si disponible
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {!available && chronoLabel ? (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 600, color: CORAL,
          background: 'rgba(255,90,31,0.15)',
          border: '1px solid rgba(255,90,31,0.28)',
          borderRadius: 20, padding: '4px 10px',
          fontFamily: F, lineHeight: 1, whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6" cy="6" r="5" stroke={CORAL} strokeWidth="1.5"/>
            <path d="M6 3.5V6l1.5 1.5" stroke={CORAL} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {chronoLabel}
        </span>
      ) : (
        <button
          onClick={available ? onScan : undefined}
          title={available ? 'Lancer une analyse' : undefined}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 600, color: CORAL,
            background: 'rgba(255,90,31,0.15)',
            border: '1px solid rgba(255,90,31,0.28)',
            borderRadius: 20, padding: '4px 10px',
            fontFamily: F, lineHeight: 1, whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          Analyser
        </button>
      )}
    </div>
  );
}