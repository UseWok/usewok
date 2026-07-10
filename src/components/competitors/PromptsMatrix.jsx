import { Check, X, ArrowRight } from 'lucide-react';

const F = "'Wix Madefor Text','Wix Madefor Display',system-ui,sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const GREEN = '#0B815A';
const GREEN_BG = 'rgba(11,129,90,0.10)';
const RED = '#DC2626';
const RED_BG = 'rgba(220,38,38,0.08)';

function parseJSON(s, fb) { try { return JSON.parse(s || '') || fb; } catch { return fb; } }

// Pastille verte (cité) / rouge (absent) — plus lisible qu'un "cited"/"—".
function Dot({ cited }) {
  if (cited) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: GREEN_BG }}>
        <Check size={13} color={GREEN} strokeWidth={3} />
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: RED_BG }}>
      <X size={12} color={RED} strokeWidth={3} />
    </span>
  );
}

export default function PromptsMatrix({ you, competitors, type, onCatchUp }) {
  const youPrompts = parseJSON(you?.prompts_json, []).map((p, i) => ({ ...p, _i: i }));
  const rows = youPrompts.filter(p => p.type === type);

  if (rows.length === 0) {
    return (
      <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '32px 0', fontFamily: F }}>
        Lance une analyse pour voir, question par question, qui est recommandé par les IA.
      </p>
    );
  }

  const cols = [
    { comp: you, isYou: true },
    ...competitors.map(c => ({ comp: c, isYou: false })),
  ];
  const promptsByComp = cols.map(c => parseJSON(c.comp?.prompts_json, []));

  const isCited = (compIdx, promptIdx) => !!promptsByComp[compIdx]?.[promptIdx]?.cited;

  // Pour une ligne, trouve un concurrent cité alors que toi non → cible de rattrapage.
  const catchUpTarget = (promptIdx) => {
    if (isCited(0, promptIdx)) return null;
    for (let ci = 1; ci < cols.length; ci++) {
      if (isCited(ci, promptIdx)) return cols[ci].comp;
    }
    return null;
  };

  const footerLabel = type === 'referral' ? 'RECOMMANDÉ SUR' : 'PRÉSENT SUR';
  const total = rows.length;
  const counts = cols.map((c, ci) => rows.filter(r => promptsByComp[ci]?.[r._i]?.cited).length);

  return (
    <div style={{ overflowX: 'auto', fontFamily: F }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.05em', borderBottom: `1px solid ${BORDER}` }}>QUESTION POSÉE À L'IA</th>
            {cols.map((c, i) => (
              <th key={i} style={{ textAlign: 'center', padding: '10px 14px', fontSize: 11.5, fontWeight: 700, color: INK, borderBottom: `1px solid ${BORDER}`, background: c.isYou ? GREEN_BG : 'transparent', whiteSpace: 'nowrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <img src={`https://www.google.com/s2/favicons?domain=${c.comp?.domain}&sz=64`} width={15} height={15} style={{ borderRadius: 4 }} alt="" />
                  {c.isYou ? 'Toi' : c.comp?.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const target = catchUpTarget(row._i);
            return (
              <tr key={row._i}>
                <td style={{ padding: '13px 14px', fontSize: 12.5, color: INK, lineHeight: 1.5, borderBottom: `1px solid ${BORDER}`, maxWidth: 400 }}>
                  {row.text}
                  {target && onCatchUp && (
                    <button onClick={() => onCatchUp(target, row.text)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '5px 10px', background: '#FFF3ED', border: '1px solid #FFD9C4', borderRadius: 8, fontSize: 11, fontWeight: 700, color: '#C2410C', cursor: 'pointer', fontFamily: F }}>
                      Rattraper {target.name} sur cette question <ArrowRight size={11} />
                    </button>
                  )}
                </td>
                {cols.map((c, i) => (
                  <td key={i} style={{ textAlign: 'center', padding: '13px 14px', borderBottom: `1px solid ${BORDER}`, background: c.isYou ? GREEN_BG : 'transparent' }}>
                    <span style={{ display: 'inline-flex', justifyContent: 'center' }}><Dot cited={isCited(i, row._i)} /></span>
                  </td>
                ))}
              </tr>
            );
          })}
          <tr>
            <td style={{ padding: '14px 14px', fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.05em' }}>{footerLabel}</td>
            {cols.map((c, i) => (
              <td key={i} style={{ textAlign: 'center', padding: '14px 14px', background: c.isYou ? GREEN_BG : 'transparent' }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: c.isYou ? GREEN : INK }}>{counts[i]}/{total}</span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}