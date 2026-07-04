import { RefreshCw } from 'lucide-react';

const CORAL = '#FF5A1F';
const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';

export default function ScanStatusIndicator({ lastScan, planId = 'free', onScan, scanning }) {
  if (scanning) return null;
  return (
    <button
      onClick={onScan}
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
      <RefreshCw size={10} />
      Analyser
    </button>
  );
}