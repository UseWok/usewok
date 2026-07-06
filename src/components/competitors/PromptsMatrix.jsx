const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const GREEN = '#0B815A';
const GREEN_BG = 'rgba(16,185,129,0.08)';
const CITED_BG = 'rgba(99,102,241,0.10)';
const CITED_FG = '#6366F1';

function parseJSON(s, fb) { try { return JSON.parse(s || '') || fb; } catch { return fb; } }

export default function PromptsMatrix({ you, competitors, type }) {
  const youPrompts = parseJSON(you?.prompts_json, []).map((p, i) => ({ ...p, _i: i }));
  const rows = youPrompts.filter(p => p.type === type);

  if (rows.length === 0) {
    return (
      <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '32px 0', fontFamily: F }}>
        Lancez le renouvellement du scan pour générer vos prompts actifs et évaluer chaque marque.
      </p>
    );
  }

  const cols = [
    { comp: you, isYou: true },
    ...competitors.map(c => ({ comp: c, isYou: false })),
  ];
  const promptsByComp = cols.map(c => parseJSON(c.comp?.prompts_json, []));

  const cell = (compIdx, promptIdx) => {
    const p = promptsByComp[compIdx]?.[promptIdx];
    if (!p) return <span style={{ color: INK3 }}>—</span>;
    return p.cited
      ? <span style={{ padding: '3px 11px', background: CITED_BG, color: CITED_FG, borderRadius: 20, fontSize: 11, fontWeight: 700 }}>cité</span>
      : <span style={{ color: INK3 }}>—</span>;
  };

  // Footer counts per column
  const footerLabel = type === 'referral' ? 'RECOMMANDÉ SUR' : 'PRÉSENT SUR';
  const total = rows.length;
  const counts = cols.map((c, ci) => {
    const pj = promptsByComp[ci];
    return rows.filter(r => pj?.[r._i]?.cited).length;
  });
  // Rank among competitor columns (index 1+) for the "moy #x" note on best competitor
  const bestNonYou = counts.slice(1).reduce((best, v, i) => (v > best.v ? { v, i: i + 1 } : best), { v: -1, i: -1 });

  const LOGO_UP = you?.logo_url;

  return (
    <div style={{ overflowX: 'auto', fontFamily: F }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.05em', borderBottom: `1px solid ${BORDER}` }}>PROMPT ACTIF</th>
            {cols.map((c, i) => (
              <th key={i} style={{ textAlign: 'center', padding: '10px 14px', fontSize: 11.5, fontWeight: 700, color: INK, borderBottom: `1px solid ${BORDER}`, background: c.isYou ? GREEN_BG : 'transparent', whiteSpace: 'nowrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <img src={`https://www.google.com/s2/favicons?domain=${c.comp?.domain}&sz=64`} width={15} height={15} style={{ borderRadius: 4 }} alt="" />
                  {c.comp?.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row._i}>
              <td style={{ padding: '13px 14px', fontSize: 12.5, color: INK, lineHeight: 1.5, borderBottom: `1px solid ${BORDER}`, maxWidth: 400 }}>
                {row.text}
                {row.tags?.length > 0 && (
                  <span style={{ display: 'flex', gap: 5, marginTop: 6 }}>
                    {row.tags.map((t, j) => (
                      <span key={j} style={{ padding: '2px 7px', background: '#EEEAFB', color: '#7C7C9C', borderRadius: 5, fontSize: 9.5, fontWeight: 700 }}>{t}</span>
                    ))}
                  </span>
                )}
              </td>
              {cols.map((c, i) => (
                <td key={i} style={{ textAlign: 'center', padding: '13px 14px', borderBottom: `1px solid ${BORDER}`, background: c.isYou ? GREEN_BG : 'transparent', fontSize: 12 }}>
                  {cell(i, row._i)}
                </td>
              ))}
            </tr>
          ))}
          {/* Footer summary row */}
          <tr>
            <td style={{ padding: '14px 14px', fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.05em' }}>{footerLabel}</td>
            {cols.map((c, i) => (
              <td key={i} style={{ textAlign: 'center', padding: '14px 14px', background: c.isYou ? GREEN_BG : 'transparent' }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: c.isYou ? GREEN : INK }}>{counts[i]}/{total}</span>
                {!c.isYou && i === bestNonYou.i && bestNonYou.v > 0 && (
                  <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#F97316', marginTop: 2 }}>moy #1</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}