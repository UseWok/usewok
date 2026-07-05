const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';

function parseJSON(s, fb) { try { return JSON.parse(s || '') || fb; } catch { return fb; } }

export default function PromptsMatrix({ you, competitors, type }) {
  const youPrompts = parseJSON(you?.prompts_json, []).map((p, i) => ({ ...p, _i: i }));
  const rows = youPrompts.filter(p => p.type === type);
  if (rows.length === 0) {
    return <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '28px 0', fontFamily: F }}>Ajoutez un premier concurrent pour générer vos prompts actifs.</p>;
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
      ? <span style={{ padding: '2px 9px', background: 'rgba(59,139,235,0.12)', color: '#2563EB', borderRadius: 12, fontSize: 10.5, fontWeight: 700 }}>cité</span>
      : <span style={{ color: INK3 }}>—</span>;
  };

  return (
    <div style={{ overflowX: 'auto', fontFamily: F }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.05em', borderBottom: `1px solid ${BORDER}` }}>PROMPT ACTIF</th>
            {cols.map((c, i) => (
              <th key={i} style={{ textAlign: 'center', padding: '10px 12px', fontSize: 11.5, fontWeight: 700, color: INK, borderBottom: `1px solid ${BORDER}`, background: c.isYou ? 'rgba(16,185,129,0.08)' : 'transparent', whiteSpace: 'nowrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <img src={`https://www.google.com/s2/favicons?domain=${c.comp?.domain}&sz=32`} width={13} height={13} style={{ borderRadius: 3 }} alt="" />
                  {c.comp?.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row._i}>
              <td style={{ padding: '11px 12px', fontSize: 12, color: INK, lineHeight: 1.5, borderBottom: `1px solid ${BORDER}`, maxWidth: 380 }}>
                {row.text}
                {row.tags?.length > 0 && (
                  <span style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {row.tags.map((t, j) => (
                      <span key={j} style={{ padding: '1px 5px', background: '#F0EDE8', color: INK3, borderRadius: 4, fontSize: 9, fontWeight: 700 }}>{t}</span>
                    ))}
                  </span>
                )}
              </td>
              {cols.map((c, i) => (
                <td key={i} style={{ textAlign: 'center', padding: '11px 12px', borderBottom: `1px solid ${BORDER}`, background: c.isYou ? 'rgba(16,185,129,0.08)' : 'transparent', fontSize: 12 }}>
                  {cell(i, row._i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}