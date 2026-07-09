import { Check, X, Clock } from 'lucide-react';

const F = '"Wix Madefor Text", "Wix Madefor Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const INK = '#1A1814';
const INK2 = '#857E6E';
const INK3 = '#A8A49F';
const WHITE = '#FFFFFF';
const BORDER = 'rgba(21,19,15,0.12)';
const GREEN = '#22A87A';
const AMBER = '#D97706';
const RED = '#EF4444';

// Status derived ONLY from real data. score > 0 → tested with a result.
// score === 0 but scan done → not appearing. Scanning → pending.
function engineStatus(score, scanning) {
  if (scanning) return 'pending';
  if (score === null || score === undefined) return 'untested';
  if (score >= 50) return 'recommended';
  if (score > 0) return 'weak';
  return 'absent';
}

const STATUS_UI = {
  recommended: { icon: Check, color: GREEN, bg: 'rgba(34,168,122,0.12)', label: 'Vous êtes recommandé' },
  weak:        { icon: Check, color: AMBER, bg: 'rgba(217,119,6,0.12)',  label: 'Cité, mais faiblement' },
  absent:      { icon: X,     color: RED,   bg: 'rgba(239,68,68,0.12)',  label: "Vous n'apparaissez pas" },
  pending:     { icon: Clock, color: INK2,  bg: 'rgba(21,19,15,0.06)',   label: 'En cours de test' },
  untested:    { icon: Clock, color: INK3,  bg: 'rgba(21,19,15,0.04)',   label: 'Pas encore testé' },
};

/**
 * Questions tested on the AI engines.
 * engines: [{ label, logoId, score (number|null) }]
 * Only Gemini has a real score today; ChatGPT/Claude come through as null → "Not tested yet".
 */
export default function TestedQuestions({ engines, scanning, AILogoImg }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 10 }}>
        Questions testées sur ChatGPT, Gemini &amp; Claude
      </div>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 13, overflow: 'hidden' }}>
        {engines.map((e, i) => {
          const status = engineStatus(e.score, scanning);
          const ui = STATUS_UI[status];
          const Icon = ui.icon;
          return (
            <div key={e.label} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
              borderBottom: i < engines.length - 1 ? `1px solid ${BORDER}` : 'none', fontFamily: F,
            }}>
              <div style={{ width: 22, height: 22, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AILogoImg id={e.logoId} size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{e.label}</div>
                <div style={{ fontSize: 12.5, color: INK2, marginTop: 2 }}>{e.question}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', background: ui.bg, borderRadius: 20, flexShrink: 0 }}>
                <Icon size={13} color={ui.color} strokeWidth={2.4} />
                <span style={{ fontSize: 12, fontWeight: 700, color: ui.color, whiteSpace: 'nowrap' }}>{ui.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}