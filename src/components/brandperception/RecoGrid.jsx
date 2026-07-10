// Temps 3 : "Comment améliorer ça" — actions triées par facilité (quick-wins d'abord).
import { Plus, Check, Zap } from 'lucide-react';

const F = "'Wix Madefor Text', 'Wix Madefor Display', system-ui, sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const VIOLET = '#7C3AED';
const GREEN = '#10B981';

const IMPACT_C = { High: GREEN, Fort: GREEN, Medium: '#F97316', Moyen: '#F97316', Low: INK3, Faible: INK3 };
const IMPACT_FR = { High: 'Fort', Fort: 'Fort', Medium: 'Moyen', Moyen: 'Moyen', Low: 'Faible', Faible: 'Faible' };
const EFFORT_FR = { High: 'Élevé', Fort: 'Élevé', Medium: 'Moyen', Moyen: 'Moyen', Low: 'Faible', Faible: 'Faible' };

// Score de priorité : impact élevé + effort faible = quick win prioritaire.
const impactRank = (v) => (v === 'High' || v === 'Fort') ? 3 : (v === 'Medium' || v === 'Moyen') ? 2 : 1;
const effortRank = (v) => (v === 'Low' || v === 'Faible') ? 3 : (v === 'Medium' || v === 'Moyen') ? 2 : 1;
const isQuickWin = (r) => impactRank(r.impact) >= 3 && effortRank(r.effort) >= 3;

export default function RecoGrid({ recommendations, onAddTask, addedKeys }) {
  // Tri : quick-wins (fort impact + faible effort) d'abord, puis par impact décroissant / effort croissant.
  const sorted = [...recommendations].sort((a, b) => {
    const sa = impactRank(a.impact) + effortRank(a.effort);
    const sb = impactRank(b.impact) + effortRank(b.effort);
    return sb - sa;
  });

  return (
    <div style={{ fontFamily: F }}>
      <p style={{ fontSize: 16, fontWeight: 800, color: INK, margin: '24px 0 4px', letterSpacing: '-0.01em' }}>Comment améliorer ça</p>
      <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 14px' }}>Classé par facilité : les actions rapides à fort impact sont en premier. Un clic crée une tâche à suivre.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {sorted.length === 0 && <p style={{ fontSize: 13, color: INK3 }}>Aucune recommandation pour l'instant.</p>}
        {sorted.map((r, i) => {
          const key = `reco_${r.title}`;
          const added = addedKeys.includes(key);
          const quick = isQuickWin(r);
          return (
            <div key={i} style={{ background: '#fff', border: `1px solid ${quick ? GREEN : BORDER}`, borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {quick && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start', padding: '2px 9px', borderRadius: 100, background: `${GREEN}18`, color: GREEN, fontSize: 10.5, fontWeight: 800, marginBottom: 8 }}>
                  <Zap size={10} strokeWidth={2.6} /> Action rapide
                </span>
              )}
              <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 6px' }}>{r.title}</p>
              <p style={{ fontSize: 12.5, color: '#666', margin: '0 0 12px', lineHeight: 1.6, flex: 1 }}>{r.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: IMPACT_C[r.impact] || INK3 }}>Impact {IMPACT_FR[r.impact] || r.impact}</span>
                  <span style={{ fontSize: 11, color: INK3 }}>· Effort {EFFORT_FR[r.effort] || r.effort}</span>
                </div>
                <button onClick={() => !added && onAddTask(r, key)} disabled={added}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: added ? '#EDE7F8' : VIOLET, border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 700, color: added ? VIOLET : '#fff', cursor: added ? 'default' : 'pointer', fontFamily: F }}>
                  {added ? <><Check size={11} /> Ajoutée</> : <><Plus size={11} /> Ajouter à mes tâches</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}