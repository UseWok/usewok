import { useState } from 'react';
import { ArrowRight, Zap, Target, Clock, ChevronDown } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EFEFEF';
const SURFACE = '#F9F8F6';
const WHITE = '#FFFFFF';

const EFFORT_LABEL = { low: '⚡ Rapide', medium: '⏱ Moyen', high: '🔧 Complexe' };
const IMPACT_STYLE = {
  high: { label: 'Impact fort', color: '#059669', bg: '#ECFDF5' },
  medium: { label: 'Impact moyen', color: '#B45309', bg: '#FFFBEB' },
};

export default function ActionPlanView({ plan, onGenerate }) {
  const [expanded, setExpanded] = useState(0);
  const [done, setDone] = useState({});

  if (!plan?.length) return (
    <div style={{ textAlign: 'center', padding: '48px 20px', fontFamily: F }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
      <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Aucun plan disponible</p>
      <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Lancez un scan depuis l'accueil pour générer votre plan d'action personnalisé.</p>
    </div>
  );

  const remaining = plan.filter((_, i) => !done[i]).length;

  return (
    <div style={{ fontFamily: F }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Plan d'injection d'entité</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: INK3 }}>{remaining} action{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}</span>
          <div style={{ flex: 1, height: 4, background: SURFACE, borderRadius: 2, overflow: 'hidden', maxWidth: 120 }}>
            <div style={{ height: '100%', width: `${((plan.length - remaining) / plan.length) * 100}%`, background: INK, borderRadius: 2, transition: 'width 0.4s' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: INK }}>{plan.length - remaining}/{plan.length}</span>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {plan.map((item, i) => {
          const isOpen = expanded === i;
          const isDone = done[i];
          const imp = IMPACT_STYLE[item.impact] || IMPACT_STYLE.medium;

          return (
            <div key={i} style={{
              background: WHITE, border: `1px solid ${isDone ? '#D1FAE5' : BORDER}`,
              borderRadius: 14, overflow: 'hidden',
              opacity: isDone ? 0.6 : 1, transition: 'all 0.15s',
            }}>
              {/* Row */}
              <button onClick={() => setExpanded(isOpen ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F }}>
                {/* Number + done toggle */}
                <div
                  onClick={e => { e.stopPropagation(); setDone(prev => ({ ...prev, [i]: !prev[i] })); }}
                  style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: isDone ? '#ECFDF5' : INK,
                    border: `2px solid ${isDone ? '#34D399' : INK}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  {isDone
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <span style={{ fontSize: 11, fontWeight: 800, color: WHITE }}>{i + 1}</span>
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{item.action_title}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: imp.color, background: imp.bg, padding: '2px 7px', borderRadius: 20, flexShrink: 0 }}>
                      {imp.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#4338CA', background: '#EEF2FF', padding: '1px 6px', borderRadius: 4 }}>{item.engine}</span>
                    <span style={{ fontSize: 10, color: INK3 }}>{item.platform && `→ ${item.platform}`}</span>
                    <span style={{ fontSize: 10, color: INK3 }}>{EFFORT_LABEL[item.effort]}</span>
                  </div>
                </div>

                <ChevronDown size={14} color={INK3} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
              </button>

              {/* Expanded details */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                    {/* Gap */}
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 5px' }}>Lacune identifiée</p>
                      <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.6, padding: '10px 12px', background: '#FEF9EC', borderRadius: 9 }}>{item.gap}</p>
                    </div>

                    {/* Why competitors win */}
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 5px' }}>Pourquoi vos concurrents sont cités à votre place</p>
                      <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.6 }}>{item.competitor_advantage}</p>
                    </div>

                    {/* Action */}
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 5px' }}>Comment agir concrètement</p>
                      <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.6 }}>{item.action_detail}</p>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => onGenerate(item.action_title + ' — ' + item.action_detail, i)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                        width: '100%', padding: '12px', background: INK, color: WHITE,
                        border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', fontFamily: F, letterSpacing: '-0.01em',
                      }}>
                      <Zap size={13} fill={WHITE} stroke={WHITE} />
                      Générer le contenu d'injection
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}