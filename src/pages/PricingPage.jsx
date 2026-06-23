import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, getPlansConfig, getUserPlan, COMPARISON_FEATURES } from '@/lib/plans-config';
import { Check, X, Minus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const T1 = '#111111';
const T2 = '#666';
const T3 = '#aaa';
const BORDER = '#E8E8E6';
const BG = '#FAFAF8';

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
  const inp = {
    width: '100%', background: '#F5F5F3', border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: 7, padding: '9px 11px', fontSize: 13, color: T1, outline: 'none',
    boxSizing: 'border-box', fontFamily: F,
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: 32, width: '100%', maxWidth: 420, position: 'relative', fontFamily: F }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: T3, padding: 4 }}><X size={14} /></button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: T1, marginBottom: 10 }}>Message reçu</h3>
            <p style={{ fontSize: 13, color: T2, lineHeight: 1.7 }}>Notre équipe vous répondra sous 24h.</p>
            <button onClick={onClose} style={{ marginTop: 20, padding: '9px 26px', background: T1, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: T1, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Nous contacter</h2>
            <p style={{ fontSize: 13, color: T2, margin: '0 0 20px' }}>Réponse garantie sous 24h.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                {[['first_name', 'Prénom'], ['last_name', 'Nom']].map(([k, l]) => (
                  <div key={k}><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 3, fontWeight: 600 }}>{l}</label><input required value={form[k]} onChange={set(k)} style={inp} /></div>
                ))}
              </div>
              {[['email', 'Email', 'email'], ['website', 'Site web', 'text'], ['role', 'Votre rôle', 'text']].map(([k, l, t]) => (
                <div key={k}><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 3, fontWeight: 600 }}>{l}</label><input required type={t} value={form[k]} onChange={set(k)} style={inp} /></div>
              ))}
              <div><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 3, fontWeight: 600 }}>Message</label><textarea required value={form.message} onChange={set('message')} rows={3} style={{ ...inp, resize: 'none' }} /></div>
              <button type="submit" style={{ padding: '10px 0', background: T1, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 2 }}>Envoyer</button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

// ── Cell value renderer ────────────────────────────────────────────────────────
function Cell({ value }) {
  if (value === true || value === 'Yes')
    return <Check size={14} style={{ color: T1, flexShrink: 0 }} strokeWidth={2.5} />;
  if (value === false || value === undefined || value === null || value === '' || value === '-')
    return <Minus size={13} style={{ color: '#CCC', flexShrink: 0 }} strokeWidth={2} />;
  return <span style={{ fontSize: 12, color: T2 }}>{value}</span>;
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPlanId, setUserPlanId] = useState('free');
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    loadPlansFromDB()
      .then(db => {
        const all = (db || getPlansConfig()).filter(p => p.visible !== false);
        setPlans(all);
        setLoading(false);
      })
      .catch(() => {
        setPlans(getPlansConfig().filter(p => p.visible !== false));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const u = authUser;
    if (u) setUserPlanId(getUserPlan(u)?.id || 'free');
    else base44.auth.me().then(u => setUserPlanId(getUserPlan(u)?.id || 'free')).catch(() => {});
  }, [authUser]);

  const handleUpgrade = (plan) => {
    const url = yearly ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (url?.startsWith('http')) { window.location.href = url; return; }
    navigate(`/checkout?plan=${plan.id}&billing=${yearly ? 'yearly' : 'monthly'}`);
  };

  const isCurrent = (plan) => plan.id === userPlanId;
  const isFree = (plan) => !plan.price_monthly || plan.price_monthly === 0;
  const price = (plan) => {
    if (isFree(plan)) return '0';
    const p = yearly && plan.price_yearly ? plan.price_yearly : plan.price_monthly;
    return String(p ?? 0);
  };

  const highlightId = plans[Math.min(1, plans.length - 1)]?.id;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #DDD', borderTopColor: T1, animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const COL_W = 148; // px per plan column
  const LABEL_W = 220;

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F, color: T1 }}>
      <AnimatePresence>{showContact && <ContactModal onClose={() => setShowContact(false)} />}</AnimatePresence>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 80px' }}>

        {/* ── Header ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: T1, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Plans</h1>
          <p style={{ fontSize: 13, color: T2, margin: 0, lineHeight: 1.6 }}>
            Vous êtes sur le plan <strong style={{ color: T1 }}>{userPlanId}</strong>.{' '}
            Si vous avez des questions,{' '}
            <button onClick={() => setShowContact(true)} style={{ background: 'none', border: 'none', color: T1, textDecoration: 'underline', cursor: 'pointer', fontSize: 13, fontFamily: F, padding: 0 }}>
              contactez-nous →
            </button>
          </p>
        </div>

        {/* ── Comparison table ─────────────────────────────────────── */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: F, minWidth: LABEL_W + plans.length * COL_W }}>

            {/* ── THEAD : plan names + prices + CTAs ── */}
            <thead>
              <tr>
                {/* Empty label col */}
                <th style={{ width: LABEL_W, padding: '0 0 20px', textAlign: 'left', verticalAlign: 'bottom' }} />

                {plans.map((plan) => {
                  const isHL = plan.id === highlightId;
                  const curr = isCurrent(plan);
                  const free = isFree(plan);
                  return (
                    <th key={plan.id} style={{ width: COL_W, padding: '0 12px 20px', textAlign: 'left', verticalAlign: 'bottom', fontWeight: 400 }}>
                      {/* Plan name */}
                      <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 2 }}>{plan.name}</div>
                      {/* Price */}
                      <div style={{ fontSize: 12, color: T2, marginBottom: 10 }}>
                        {free ? 'Gratuit' : `${price(plan)}€ / utilisateur / mois`}
                      </div>

                      {/* Yearly toggle — only for paid plans */}
                      {!free && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                          <button onClick={() => setYearly(v => !v)} style={{
                            width: 30, height: 17, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
                            background: yearly ? '#4B48D6' : '#DDD',
                            display: 'flex', alignItems: 'center', justifyContent: yearly ? 'flex-end' : 'flex-start',
                            transition: 'background 180ms', flexShrink: 0,
                          }}>
                            <div style={{ width: 13, height: 13, borderRadius: '50%', background: '#fff' }} />
                          </button>
                          <span style={{ fontSize: 11, color: T2 }}>Annuel</span>
                        </div>
                      )}

                      {/* CTA */}
                      {curr ? (
                        <div style={{ padding: '7px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 12, color: T2, textAlign: 'center', background: '#fff' }}>
                          Plan actuel
                        </div>
                      ) : free ? (
                        <button onClick={() => navigate('/app')}
                          style={{ width: '100%', padding: '7px 0', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 12, fontWeight: 600, color: T1, background: '#fff', cursor: 'pointer', fontFamily: F }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F5F5F3'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                          Commencer
                        </button>
                      ) : (
                        <button onClick={() => handleUpgrade(plan)}
                          style={{
                            width: '100%', padding: '7px 0', border: 'none', borderRadius: 6,
                            fontSize: 12, fontWeight: 600, color: '#fff',
                            background: '#4B48D6',
                            cursor: 'pointer', fontFamily: F,
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                          Passer à {plan.name}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* ── TBODY : feature rows ── */}
            <tbody>
              {COMPARISON_FEATURES.map((group, gi) => (
                <React.Fragment key={group.category}>
                  {/* Category header */}
                  <tr>
                    <td colSpan={plans.length + 1} style={{
                      padding: gi === 0 ? '20px 0 8px' : '28px 0 8px',
                      fontSize: 11, fontWeight: 700, color: T1,
                      borderTop: `1px solid ${BORDER}`,
                      letterSpacing: '0.02em',
                    }}>
                      {group.category}
                    </td>
                  </tr>

                  {/* Feature rows */}
                  {group.items.map((item, ii) => (
                    <tr key={item.name}
                      style={{ transition: 'background 120ms' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.018)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '8px 0', fontSize: 13, color: T2, borderTop: `1px solid rgba(0,0,0,0.04)`, paddingRight: 16 }}>
                        {item.name}
                      </td>
                      {plans.map(plan => (
                        <td key={plan.id} style={{ padding: '8px 12px', borderTop: `1px solid rgba(0,0,0,0.04)` }}>
                          <Cell value={item[plan.id]} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {/* Bottom CTA row */}
              <tr style={{ borderTop: `1px solid ${BORDER}` }}>
                <td style={{ padding: '24px 0 0' }} />
                {plans.map(plan => {
                  const curr = isCurrent(plan);
                  const free = isFree(plan);
                  return (
                    <td key={plan.id} style={{ padding: '24px 12px 0', verticalAlign: 'top' }}>
                      {curr ? (
                        <div style={{ padding: '7px 12px', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 12, color: T2, textAlign: 'center', background: '#fff' }}>
                          Plan actuel
                        </div>
                      ) : free ? (
                        <button onClick={() => navigate('/app')}
                          style={{ width: '100%', padding: '7px 0', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 12, fontWeight: 600, color: T1, background: '#fff', cursor: 'pointer', fontFamily: F }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F5F5F3'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                          Commencer
                        </button>
                      ) : (
                        <button onClick={() => handleUpgrade(plan)}
                          style={{ width: '100%', padding: '7px 0', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#fff', background: '#4B48D6', cursor: 'pointer', fontFamily: F }}
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

        {/* ── Enterprise strip ─────────────────────────────────────── */}
        <div style={{ marginTop: 60, padding: '28px 32px', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 3 }}>Besoin d'un plan sur mesure ?</div>
            <div style={{ fontSize: 13, color: T2 }}>Pour les agences, grandes équipes ou contrats personnalisés.</div>
          </div>
          <button onClick={() => setShowContact(true)}
            style={{ padding: '9px 20px', border: `1px solid ${BORDER}`, borderRadius: 7, background: '#fff', color: T1, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F3'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
            Contacter l'équipe →
          </button>
        </div>

      </div>
    </div>
  );
}