import { useState, useEffect } from 'react';
import { Zap, Clock } from 'lucide-react';

const CORAL = '#FF5A1F';
const INK = '#1A1814';
const INK3 = '#A8A49F';
const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';

// Plan scan quotas
const PLAN_SCANS = { free: 1, starter: 12, pro: 30 };

function formatCountdown(ms) {
  if (ms <= 0) return null;
  const totalSecs = Math.floor(ms / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hrs = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  if (days > 0) return `${days}j ${hrs}h`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function getNextScanWindow(lastScan, planId) {
  if (!lastScan) return null;
  const last = new Date(lastScan);
  const intervalDays = planId === 'pro' ? 1 : planId === 'starter' ? Math.floor(30 / 12) : 30;
  const next = new Date(last.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  // Best window: 6-8h FR (UTC+2)
  next.setHours(6, 0, 0, 0);
  return next;
}

function isScanAvailable(lastScan, planId) {
  if (!lastScan) return true;
  const next = getNextScanWindow(lastScan, planId);
  return next <= new Date();
}

export default function ScanStatusIndicator({ lastScan, planId = 'free', onScan, scanning }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 30000); // update every 30s
    return () => clearInterval(iv);
  }, []);

  const available = isScanAvailable(lastScan, planId);
  const nextScan = lastScan ? getNextScanWindow(lastScan, planId) : null;
  const remaining = nextScan ? nextScan.getTime() - now : 0;
  const countdown = formatCountdown(remaining);

  // Progress ring: how far through the interval we are
  const intervalMs = (planId === 'pro' ? 1 : planId === 'starter' ? Math.floor(30 / 12) : 30) * 24 * 60 * 60 * 1000;
  const elapsed = lastScan ? now - new Date(lastScan).getTime() : 0;
  const progress = Math.min(elapsed / intervalMs, 1);

  const size = 36;
  const sw = 2.5;
  const R = (size - sw) / 2;
  const circ = 2 * Math.PI * R;
  const ringColor = available ? CORAL : 'rgba(21,19,15,0.18)';

  const lastScanLabel = lastScan
    ? new Date(lastScan).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: F }}>
      {/* Ring chrono */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(21,19,15,0.07)" strokeWidth={sw} />
          <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={ringColor} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {available
            ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: CORAL, animation: 'scanPulse 2s ease-in-out infinite' }} />
            : <Clock size={11} color={INK3} strokeWidth={1.8} />
          }
        </div>
      </div>

      {/* Text info */}
      <div style={{ minWidth: 0 }}>
        {available ? (
          <p style={{ fontSize: 11, fontWeight: 600, color: CORAL, margin: 0 }}>Prêt à analyser</p>
        ) : (
          <p style={{ fontSize: 11, fontWeight: 500, color: INK3, margin: 0 }}>
            Prochain scan{countdown ? ` dans ${countdown}` : ''}
          </p>
        )}
        {lastScanLabel && (
          <p style={{ fontSize: 10, color: INK3, margin: '1px 0 0', opacity: 0.7 }}>
            Dernier · {lastScanLabel}
          </p>
        )}
      </div>

      {/* Scan button — toujours visible, disabled si pas dispo */}
      <button
        onClick={available && !scanning ? onScan : undefined}
        disabled={!available || scanning}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 12px', borderRadius: 8, border: 'none',
          background: available && !scanning ? CORAL : 'rgba(21,19,15,0.07)',
          color: available && !scanning ? '#fff' : INK3,
          fontSize: 11.5, fontWeight: 700, cursor: available && !scanning ? 'pointer' : 'not-allowed',
          fontFamily: F, flexShrink: 0, transition: 'background 150ms',
        }}
      >
        {scanning
          ? <><div style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />Analyse…</>
          : <><Zap size={10} strokeWidth={2.5} />Lancer</>
        }
      </button>

      <style>{`
        @keyframes scanPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}