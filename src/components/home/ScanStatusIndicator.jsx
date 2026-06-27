import { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';

const CORAL = '#FF5A1F';
const INK = '#1A1814';
const INK3 = '#A8A49F';
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
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const total = Math.floor(ms / 1000);
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

// Compact inline version: chrono + label + bouton sur une ligne
export default function ScanStatusIndicator({ lastScan, planId = 'free', onScan, scanning, compact = false }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const available = isScanAvailable(lastScan, planId);
  const nextScan = lastScan ? getNextScanTime(lastScan, planId) : null;
  const remaining = nextScan ? Math.max(nextScan.getTime() - now, 0) : 0;
  const { d, h, m, s } = formatCountdown(remaining);

  const intervalMs = (PLAN_INTERVAL_DAYS[planId] || 30) * 24 * 60 * 60 * 1000;
  const elapsed = lastScan ? now - new Date(lastScan).getTime() : 0;
  const progress = Math.min(elapsed / intervalMs, 1);

  const ringSize = 28;
  const sw = 2.5;
  const R = (ringSize - sw) / 2;
  const circ = 2 * Math.PI * R;
  const ringColor = available ? CORAL : 'rgba(255,255,255,0.25)';
  const trackColor = 'rgba(255,255,255,0.10)';

  // Chrono display
  const chronoParts = [];
  if (d > 0) chronoParts.push(`${d}j`);
  chronoParts.push(`${String(h).padStart(2,'0')}h`);
  chronoParts.push(`${String(m).padStart(2,'0')}m`);
  chronoParts.push(`${String(s).padStart(2,'0')}s`);
  const chronoStr = chronoParts.join(' ');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: F }}>
      {/* Ring */}
      <div style={{ position: 'relative', width: ringSize, height: ringSize, flexShrink: 0 }}>
        <svg width={ringSize} height={ringSize} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={ringSize/2} cy={ringSize/2} r={R} fill="none" stroke={trackColor} strokeWidth={sw} />
          <circle cx={ringSize/2} cy={ringSize/2} r={R} fill="none" stroke={ringColor} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {available
            ? <div style={{ width: 7, height: 7, borderRadius: '50%', background: CORAL, animation: 'scanPulse 2s ease-in-out infinite' }} />
            : <Clock size={10} color="rgba(255,255,255,0.4)" strokeWidth={1.8} />
          }
        </div>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {available ? (
          <p style={{ fontSize: 11, fontWeight: 600, color: CORAL, margin: 0 }}>Prêt à analyser</p>
        ) : (
          <p style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Prochain scan dans <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.65)', fontVariantNumeric: 'tabular-nums' }}>{chronoStr}</span>
          </p>
        )}
      </div>

      {/* Button */}
      <button
        onClick={available && !scanning ? onScan : undefined}
        disabled={!available || scanning}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 7, border: 'none',
          background: available && !scanning ? CORAL : 'rgba(255,255,255,0.08)',
          color: available && !scanning ? WHITE : 'rgba(255,255,255,0.25)',
          fontSize: 11.5, fontWeight: 700,
          cursor: available && !scanning ? 'pointer' : 'not-allowed',
          fontFamily: F, flexShrink: 0, transition: 'background 150ms',
        }}
      >
        {scanning
          ? <><div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> Analyse…</>
          : <><Zap size={10} strokeWidth={2.5} /> Lancer</>
        }
      </button>

      <style>{`
        @keyframes scanPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}