import { useState } from 'react';
import { Plus, Check } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const VIOLET = '#7C3AED';

const IMPACT_C = { 'Fort': '#10B981', 'Moyen': '#F97316', 'Faible': '#9B9BA8' };

export default function RecoGrid({ recommendations, onAddTask, addedKeys }) {
  return (
    <div style={{ fontFamily: F }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '22px 0 4px' }}>Recommandations</p>
      <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 14px' }}>Basées sur cet audit · cliquez « Ajouter à mes tâches » pour les suivre.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {recommendations.length === 0 && <p style={{ fontSize: 13, color: INK3 }}>Aucune recommandation pour le moment.</p>}
        {recommendations.map((r, i) => {
          const key = `reco_${r.title}`;
          const added = addedKeys.includes(key);
          return (
            <div key={i} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 6px' }}>{r.title}</p>
              <p style={{ fontSize: 12.5, color: '#666', margin: '0 0 12px', lineHeight: 1.6, flex: 1 }}>{r.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: IMPACT_C[r.impact] || INK3 }}>Impact {r.impact}</span>
                  <span style={{ fontSize: 11, color: INK3 }}>· Effort {r.effort}</span>
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