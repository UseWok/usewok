// Résumé visuel simple : "Toi vs tes concurrents" en barres horizontales.
// Remplace la lecture d'un tableau technique par un coup d'œil immédiat.

const F = "'Wix Madefor Text','Wix Madefor Display',system-ui,sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const GREEN = '#0B815A';
const GREEN_BG = 'rgba(11,129,90,0.10)';
const GREY_BAR = '#E7E3DC';

function Row({ rank, name, domain, pct, isYou, max }) {
  const width = max > 0 ? Math.max((pct / max) * 100, 4) : 4;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
      <span style={{ width: 22, fontSize: 12, fontWeight: 800, color: isYou ? GREEN : INK3, flexShrink: 0 }}>#{rank}</span>
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} width={24} height={24} style={{ borderRadius: 6, flexShrink: 0 }} alt="" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}{isYou && <span style={{ marginLeft: 7, padding: '1px 7px', background: GREEN_BG, color: GREEN, borderRadius: 20, fontSize: 10, fontWeight: 800 }}>TOI</span>}
          </span>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: isYou ? GREEN : INK, flexShrink: 0, marginLeft: 8 }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: GREY_BAR, borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${width}%`, background: isYou ? GREEN : '#F97316', borderRadius: 20, transition: 'width 0.5s ease' }} />
        </div>
      </div>
    </div>
  );
}

export default function HeadToHead({ you, competitors }) {
  const rows = [
    ...(you ? [{ name: you.name || 'Ta marque', domain: you.domain, pct: Math.round(you.referral_pct || 0), isYou: true }] : []),
    ...competitors.map(c => ({ name: c.name, domain: c.domain, pct: Math.round(c.referral_pct || 0), isYou: false })),
  ].sort((a, b) => b.pct - a.pct);

  if (rows.length === 0) return null;
  const max = Math.max(...rows.map(r => r.pct), 1);
  const youRank = rows.findIndex(r => r.isYou) + 1;
  const leader = rows[0];

  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 22px', marginBottom: 18, fontFamily: F }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: INK, margin: '0 0 3px', letterSpacing: '-0.01em' }}>Toi vs tes concurrents</h2>
      <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 14px', lineHeight: 1.5 }}>
        {you
          ? (youRank === 1
              ? `Bonne nouvelle : c'est toi que les IA recommandent le plus souvent 🏆`
              : `Les IA recommandent ${leader.name} le plus souvent (${leader.pct}%). Tu es ${youRank}${youRank === 2 ? 'e' : 'e'} avec ${rows[youRank - 1].pct}%.`)
          : 'À quelle fréquence les IA recommandent chaque marque.'}
      </p>
      <div>
        {rows.map((r, i) => <Row key={i} rank={i + 1} {...r} max={max} />)}
      </div>
    </div>
  );
}