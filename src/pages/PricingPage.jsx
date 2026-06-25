import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, getPlansConfig, getUserPlan, COMPARISON_FEATURES } from '@/lib/plans-config';
import { Check, X, Minus, Zap, Star, ArrowRight, Shield, TrendingUp, Eye } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const SURFACE = '#F8F7F5';
const WHITE = '#FFFFFF';
const CORAL = '#F95738';
const CREAM = '#FDF8F0';

// ── Contact Modal ──────────────────────────────────────────────────────────────
const ContactModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', website: '', role: '', message: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await base44.entities.ContactLead.create({ ...form, status: 'new' }); } catch {}
    setSubmitted(true);
  };
  const inp = { width: '100%', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, color: INK, outline: 'none', boxSizing: 'border-box', fontFamily: F };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 30, width: '100%', maxWidth: 400, position: 'relative', fontFamily: F }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer' }}><X size={12} color={INK3} /></button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Check size={22} color="#10B981" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 8 }}>Message reçu</h3>
            <p style={{ fontSize: 13, color: INK3, lineHeight: 1.6 }}>Notre équipe vous répondra sous 24h.</p>
            <button onClick={onClose} style={{ marginTop: 18, padding: '9px 24px', background: INK, color: WHITE, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Nous contacter</h2>
            <p style={{ fontSize: 13, color: INK3, margin: '0 0 18px' }}>Réponse garantie sous 24h.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {[['first_name', 'Prénom'], ['last_name', 'Nom']].map(([k, l]) => (
                  <div key={k}><label style={{ display: 'block', fontSize: 11, color: INK3, marginBottom: 3, fontWeight: 600 }}>{l}</label><input required value={form[k]} onChange={set(k)} style={inp} /></div>
                ))}
              </div>
              {[['email', 'Email', 'email'], ['website', 'Site web', 'text'], ['role', 'Votre rôle', 'text']].map(([k, l, t]) => (
                <div key={k}><label style={{ display: 'block', fontSize: 11, color: INK3, marginBottom: 3, fontWeight: 600 }}>{l}</label><input required type={t} value={form[k]} onChange={set(k)} style={inp} /></div>
              ))}
              <div><label style={{ display: 'block', fontSize: 11, color: INK3, marginBottom: 3, fontWeight: 600 }}>Message</label><textarea required value={form.message} onChange={set('message')} rows={3} style={{ ...inp, resize: 'none' }} /></div>
              <button type="submit" style={{ padding: '10px 0', background: INK, color: WHITE, border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 2 }}>Envoyer</button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

function Cell({ value }) {
  if (value === true || value === 'Yes') return <Check size={14} style={{ color: INK, flexShrink: 0 }} strokeWidth={2.5} />;
  if (value === false || value === undefined || value === null || value === '' || value === '-') return <Minus size={13} style={{ color: '#D0D0CE', flexShrink: 0 }} strokeWidth={2} />;
  return <span style={{ fontSize: 12, color: INK2 }}>{value}</span>;
}

// ── Value props strip ──────────────────────────────────────────────────────────
const VALUE_PROPS = [
  { icon: Eye, label: '8 moteurs IA analysés', sub: 'ChatGPT, Claude, Gemini, Perplexity…' },
  { icon: TrendingUp, label: 'Analyse concurrents', sub: 'Part de voix & positionnement' },
  { icon: Shield, label: 'Plan d\'action détaillé', sub: 'Corrections guidées, étape par étape' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPlanId, setUserPlanId] = useState('free');
  const [yearlyPerPlan, setYearlyPerPlan] = useState({});

  useEffect(() => {
    loadPlansFromDB()
      .then(db => { setPlans((db || getPlansConfig()).filter(p => p.visible !== false)); setLoading(false); })
      .catch(() => { setPlans(getPlansConfig().filter(p => p.visible !== false)); setLoading(false); });
  }, []);

  useEffect(() => {
    const u = authUser;
    if (u) setUserPlanId(getUserPlan(u)?.id || 'free');
    else base44.auth.me().then(u => setUserPlanId(getUserPlan(u)?.id || 'free')).catch(() => {});
  }, [authUser]);

  const isYearly = (planId) => !!yearlyPerPlan[planId];
  const toggleYearly = (planId) => setYearlyPerPlan(prev => ({ ...prev, [planId]: !prev[planId] }));

  const handleUpgrade = (plan) => {
    const y = isYearly(plan.id);
    const url = y ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (url?.startsWith('http')) { window.location.href = url; return; }
    navigate(`/checkout?plan=${plan.id}&billing=${y ? 'yearly' : 'monthly'}`);
  };

  const isCurrent = (plan) => plan.id === userPlanId;
  const isFree = (plan) => !plan.price_monthly || plan.price_monthly === 0;

  const sortedPlans = [...plans].sort((a, b) => (b.price_monthly || 0) - (a.price_monthly || 0));
  const highlightId = sortedPlans.find(p => !isFree(p) && p.id !== sortedPlans[0]?.id)?.id || sortedPlans[Math.min(1, sortedPlans.length - 1)]?.id;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: INK, animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const COL_W = 148;
  const LABEL_W = 220;

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F, color: INK }}>
      <AnimatePresence>{showContact && <ContactModal onClose={() => setShowContact(false)} />}</AnimatePresence>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: INK, margin: '0 0 6px', letterSpacing: '-0.04em' }}>Choisir votre plan</h1>
          <p style={{ fontSize: 13, color: INK3, margin: 0, lineHeight: 1.6 }}>
            Vous êtes sur le plan <strong style={{ color: INK }}>{userPlanId}</strong>.{' '}
            <button onClick={() => setShowContact(true)} style={{ background: 'none', border: 'none', color: CORAL, textDecoration: 'underline', cursor: 'pointer', fontSize: 13, fontFamily: F, padding: 0 }}>
              Des questions ? Contactez-nous →
            </button>
          </p>
        </div>

        {/* ── Value props ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 36 }}>
          {VALUE_PROPS.map((vp, i) => (
            <div key={i} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: `${CORAL}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <vp.icon size={14} color={CORAL} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: INK, lineHeight: 1.3 }}>{vp.label}</div>
                <div style={{ fontSize: 11, color: INK3, marginTop: 1 }}>{vp.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Comparison table ── */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: F, minWidth: LABEL_W + sortedPlans.length * COL_W }}>
            <thead>
              <tr>
                <th style={{ width: LABEL_W, padding: '0 0 24px', textAlign: 'left', verticalAlign: 'bottom' }} />
                {sortedPlans.map((plan) => {
                  const isHL = plan.id === highlightId;
                  const curr = isCurrent(plan);
                  const free = isFree(plan);
                  const y = isYearly(plan.id);
                  const monthlyPrice = y && plan.price_yearly ? Math.round(plan.price_yearly / 12) : plan.price_monthly;
                  const discount = plan.price_yearly && plan.price_monthly
                    ? Math.round((1 - (plan.price_yearly / (plan.price_monthly * 12))) * 100) : 0;
                  return (
                    <th key={plan.id} style={{ width: COL_W, padding: '0 12px 24px', textAlign: 'left', verticalAlign: 'bottom', fontWeight: 400, position: 'relative' }}>
                      {isHL && !curr && (
                        <div style={{ position: 'absolute', top: -8, left: 12, right: 12, height: 3, background: CORAL, borderRadius: 3 }} />
                      )}
                      <div style={{ fontSize: 13, fontWeight: 800, color: INK, marginBottom: 6, letterSpacing: '-0.01em' }}>{plan.name}</div>
                      <div style={{ marginBottom: 10 }}>
                        {free ? (
                          <span style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: '-0.04em' }}>Gratuit</span>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                              <span style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: '-0.04em' }}>{monthlyPrice}€</span>
                              <span style={{ fontSize: 11, color: INK3 }}>/mois</span>
                            </div>
                            {y && discount > 0 && (
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', marginTop: 2 }}>−{discount}% · facturé annuellement</div>
                            )}
                          </div>
                        )}
                      </div>
                      {!free && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <button onClick={() => toggleYearly(plan.id)} style={{
                            width: 28, height: 16, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
                            background: y ? INK : '#D0D0CE',
                            display: 'flex', alignItems: 'center', justifyContent: y ? 'flex-end' : 'flex-start',
                            transition: 'background 180ms', flexShrink: 0,
                          }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: WHITE }} />
                          </button>
                          <span style={{ fontSize: 11, color: INK3 }}>Annuel{discount > 0 ? ` (−${discount}%)` : ''}</span>
                        </div>
                      )}
                      {curr ? (
                        <div style={{ padding: '7px 12px', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 12, color: INK3, textAlign: 'center', background: WHITE }}>
                          Plan actuel
                        </div>
                      ) : free ? (
                        <button onClick={() => navigate('/app')}
                          style={{ width: '100%', padding: '8px 0', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: INK, background: WHITE, cursor: 'pointer', fontFamily: F }}
                          onMouseEnter={e => e.currentTarget.style.background = SURFACE}
                          onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                          Commencer gratuitement
                        </button>
                      ) : (
                        <button onClick={() => handleUpgrade(plan)}
                          style={{ width: '100%', padding: '8px 0', border: isHL ? 'none' : `1.5px solid ${INK}`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: isHL ? WHITE : INK, background: isHL ? CORAL : WHITE, cursor: 'pointer', fontFamily: F, transition: 'opacity 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                          {isHL && <Zap size={11} fill={WHITE} stroke="none" />}
                          Passer à {plan.name}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_FEATURES.map((group, gi) => (
                <React.Fragment key={group.category}>
                  <tr>
                    <td colSpan={sortedPlans.length + 1} style={{ padding: gi === 0 ? '20px 0 8px' : '26px 0 8px', fontSize: 10, fontWeight: 700, color: INK3, borderTop: `1px solid ${BORDER}`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map((item) => (
                    <tr key={item.name}
                      style={{ transition: 'background 100ms' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.016)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '8px 0', fontSize: 13, color: INK2, borderTop: `1px solid rgba(0,0,0,0.04)`, paddingRight: 16 }}>{item.name}</td>
                      {sortedPlans.map(plan => (
                        <td key={plan.id} style={{ padding: '8px 12px', borderTop: `1px solid rgba(0,0,0,0.04)` }}>
                          <Cell value={item[plan.id]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              <tr style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: '24px 0 0' }} />
                {sortedPlans.map(plan => {
                  const curr = isCurrent(plan);
                  const free = isFree(plan);
                  const isHL = plan.id === highlightId;
                  return (
                    <td key={plan.id} style={{ padding: '24px 12px 0', verticalAlign: 'top' }}>
                      {curr ? (
                        <div style={{ padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 12, color: INK3, textAlign: 'center', background: WHITE }}>Plan actuel</div>
                      ) : free ? (
                        <button onClick={() => navigate('/app')}
                          style={{ width: '100%', padding: '8px 0', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: INK, background: WHITE, cursor: 'pointer', fontFamily: F }}
                          onMouseEnter={e => e.currentTarget.style.background = SURFACE}
                          onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                          Commencer gratuitement
                        </button>
                      ) : (
                        <button onClick={() => handleUpgrade(plan)}
                          style={{ width: '100%', padding: '8px 0', border: isHL ? 'none' : `1.5px solid ${INK}`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: isHL ? WHITE : INK, background: isHL ? CORAL : WHITE, cursor: 'pointer', fontFamily: F, transition: 'opacity 150ms' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                          Passer à {plan.name}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Reassurance strip ── */}
        <div style={{ marginTop: 48, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Annulation en 1 clic', 'Sans engagement', 'Support 24h', 'Données sécurisées'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 20 }}>
              <Check size={11} color="#10B981" strokeWidth={2.5} />
              <span style={{ fontSize: 12, color: INK2, fontWeight: 500 }}>{t}</span>
            </div>
          ))}
        </div>

        {/* ── Enterprise strip ── */}
        <div style={{ marginTop: 32, padding: '24px 28px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: INK, marginBottom: 2 }}>Besoin d'un plan sur mesure ?</div>
            <div style={{ fontSize: 13, color: INK3 }}>Pour les agences, grandes équipes ou contrats personnalisés.</div>
          </div>
          <button onClick={() => setShowContact(true)}
            style={{ padding: '9px 20px', border: `1px solid ${BORDER}`, borderRadius: 9, background: WHITE, color: INK, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = SURFACE}
            onMouseLeave={e => e.currentTarget.style.background = WHITE}>
            Contacter l'équipe <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}