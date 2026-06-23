import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, getPlansConfig, getUserPlan, COMPARISON_FEATURES } from '@/lib/plans-config';
import { Check, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#F9F9F8';
const T1 = '#111111';
const T2 = 'rgba(0,0,0,0.5)';
const T3 = 'rgba(0,0,0,0.22)';
const BORDER = 'rgba(0,0,0,0.08)';
const ACCENT = '#111';

function Reveal({ children, delay = 0, y = 16, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}>
      {children}
    </motion.div>
  );
}

function Cell({ value }) {
  if (value === undefined || value === null || value === '-' || value === '') return <span style={{ color: T3, fontSize: 13 }}>—</span>;
  if (value === true || value === 'Yes') return <Check style={{ width: 14, height: 14, color: T1 }} />;
  if (value === false) return <span style={{ color: T3, fontSize: 13 }}>—</span>;
  return <span style={{ fontSize: 13, color: T2 }}>{value}</span>;
}

const ContactModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', website: '', role: '', message: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await base44.entities.ContactLead.create({ ...form, status: 'new' }); } catch {}
    setSubmitted(true);
  };
  const inp = { width: '100%', background: '#F5F5F3', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: T1, outline: 'none', boxSizing: 'border-box', fontFamily: F };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.97, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 20, padding: 36, width: '100%', maxWidth: 440, position: 'relative', fontFamily: F, boxShadow: '0 24px 64px rgba(0,0,0,0.10)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: T3, padding: 4 }}><X size={14} /></button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: T1, marginBottom: 10 }}>Message reçu</h3>
            <p style={{ fontSize: 13, color: T2, lineHeight: 1.7 }}>Notre équipe vous répondra sous 24h.</p>
            <button onClick={onClose} style={{ marginTop: 22, padding: '10px 28px', background: T1, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Fermer</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: T1, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Nous contacter</h2>
            <p style={{ fontSize: 13, color: T2, margin: '0 0 22px' }}>Réponse garantie sous 24h.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['first_name','Prénom'],['last_name','Nom']].map(([k,l]) => (
                  <div key={k}><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 4, fontWeight: 600 }}>{l}</label><input required value={form[k]} onChange={set(k)} placeholder={l} style={inp} /></div>
                ))}
              </div>
              {[['email','Email','email'],['website','Site web','text'],['role','Votre rôle','text']].map(([k,l,t]) => (
                <div key={k}><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 4, fontWeight: 600 }}>{l}</label><input required type={t} value={form[k]} onChange={set(k)} placeholder={l} style={inp} /></div>
              ))}
              <div><label style={{ display: 'block', fontSize: 11, color: T2, marginBottom: 4, fontWeight: 600 }}>Message</label><textarea required value={form.message} onChange={set('message')} rows={3} style={{ ...inp, resize: 'none' }} /></div>
              <button type="submit" style={{ padding: '12px 0', background: T1, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>Envoyer</button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default function PricingPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [userPlanId, setUserPlanId] = useState('free');
  const [billingYearly, setBillingYearly] = useState({});

  useEffect(() => {
    loadPlansFromDB()
      .then(dbPlans => {
        const all = dbPlans || getPlansConfig();
        const visible = all.filter(p => p.visible !== false);
        setPlans(visible);
        const init = {};
        visible.forEach(p => { if (p.price_monthly > 0) init[p.id] = true; });
        setBillingYearly(init);
        setPlansLoading(false);
      })
      .catch(() => {
        const all = getPlansConfig();
        const visible = all.filter(p => p.visible !== false);
        setPlans(visible);
        const init = {};
        visible.forEach(p => { if (p.price_monthly > 0) init[p.id] = true; });
        setBillingYearly(init);
        setPlansLoading(false);
      });
  }, []);

  useEffect(() => {
    const u = authUser;
    if (u) setUserPlanId(getUserPlan(u)?.id || 'free');
    else base44.auth.me().then(u => setUserPlanId(getUserPlan(u)?.id || 'free')).catch(() => {});
  }, [authUser]);

  const handleUpgrade = (plan) => {
    const yearly = billingYearly[plan.id];
    const url = yearly ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (url?.startsWith('http')) { window.location.href = url; return; }
    navigate(`/checkout?plan=${plan.id}&billing=${yearly ? 'yearly' : 'monthly'}`);
  };

  const isCurrentPlan = (plan) => plan.id === userPlanId;
  const highlightIdx = Math.min(1, plans.length - 1);

  const PlanBtn = ({ plan, large = false }) => {
    const current = isCurrentPlan(plan);
    const isFree = plan.price_monthly === 0 || !plan.checkout_url_monthly;
    const isHighlight = plans.indexOf(plan) === highlightIdx;
    const base = {
      width: '100%', padding: large ? '13px 0' : '9px 0',
      borderRadius: 9, fontSize: 13, fontWeight: 600,
      fontFamily: F, cursor: 'pointer', border: 'none', transition: 'opacity 150ms',
    };
    if (current) return (
      <button style={{ ...base, background: 'rgba(0,0,0,0.05)', color: T2, cursor: 'default', border: `1px solid ${BORDER}` }}>
        Plan actuel
      </button>
    );
    const bg = isHighlight ? T1 : '#F0F0EE';
    const col = isHighlight ? '#fff' : T1;
    return (
      <button onClick={isFree ? () => navigate('/app') : () => handleUpgrade(plan)}
        style={{ ...base, background: bg, color: col }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
        {isFree ? 'Commencer' : 'Choisir ce plan'}
      </button>
    );
  };

  if (plansLoading) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #E0E0DE', borderTopColor: T1, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F, color: T1, overflowX: 'hidden' }}>
      <AnimatePresence>{showContact && <ContactModal onClose={() => setShowContact(false)} />}</AnimatePresence>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 28px 0' }}>

        {/* ── Hero */}
        <Reveal>
          <div style={{ marginBottom: 60 }}>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 300, color: T1, margin: '0 0 14px', letterSpacing: '-0.04em', lineHeight: 1.06 }}>
              Simple,{' '}
              <span style={{ fontWeight: 800 }}>transparent.</span>
            </h1>
            <p style={{ fontSize: 16, color: T2, margin: 0, maxWidth: 480, lineHeight: 1.7 }}>
              Chaque plan inclut une vraie analyse IA — pas de données simulées. Résiliez à tout moment.
            </p>
          </div>
        </Reveal>

        {/* ── Plan cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${plans.length}, 1fr)`,
          gap: 14,
          marginBottom: 72,
          alignItems: 'start',
        }}>
          {plans.map((plan, idx) => {
            const isHighlight = idx === highlightIdx;
            const price = plan.price_monthly ?? plan.price ?? 0;
            const yearly = billingYearly[plan.id];
            const priceDisplay = yearly && plan.price_yearly ? plan.price_yearly : price;
            const isFree = price === 0;
            const features = (plan.features || []).map(f => f.text || f);

            return (
              <Reveal key={plan.id} delay={idx * 0.06}>
                <div style={{
                  background: isHighlight ? T1 : '#fff',
                  border: isHighlight ? 'none' : `1px solid ${BORDER}`,
                  borderRadius: 18,
                  padding: '28px 24px',
                  position: 'relative',
                  boxShadow: isHighlight ? '0 20px 50px -10px rgba(0,0,0,0.28)' : '0 2px 12px rgba(0,0,0,0.04)',
                  transition: 'transform 200ms, box-shadow 200ms',
                }}
                  onMouseEnter={e => { if (!isHighlight) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.09)'; } }}
                  onMouseLeave={e => { if (!isHighlight) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; } }}>

                  {isHighlight && (
                    <div style={{
                      position: 'absolute', top: -12, left: 20,
                      background: '#fff', color: T1,
                      borderRadius: 20, padding: '3px 12px',
                      fontSize: 10, fontWeight: 800,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>Populaire</div>
                  )}

                  {/* Plan name */}
                  <div style={{ fontSize: 12, fontWeight: 700, color: isHighlight ? 'rgba(255,255,255,0.45)' : T3, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                    {plan.name}
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 48, fontWeight: 800, color: isHighlight ? '#fff' : T1, letterSpacing: '-0.05em', lineHeight: 1 }}>
                      {isFree ? '0€' : `${priceDisplay}€`}
                    </span>
                    {!isFree && <span style={{ fontSize: 13, color: isHighlight ? 'rgba(255,255,255,0.4)' : T3, marginLeft: 5 }}>/mois</span>}
                  </div>

                  {/* Yearly toggle */}
                  {!isFree && plan.checkout_url_yearly && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 20, marginTop: 10 }}>
                      <button onClick={() => setBillingYearly(b => ({ ...b, [plan.id]: !b[plan.id] }))}
                        style={{
                          width: 36, height: 20, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
                          background: yearly ? (isHighlight ? 'rgba(255,255,255,0.3)' : '#111') : 'rgba(0,0,0,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: yearly ? 'flex-end' : 'flex-start',
                          transition: 'background 200ms', flexShrink: 0,
                        }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                      </button>
                      <span style={{ fontSize: 12, color: isHighlight ? 'rgba(255,255,255,0.5)' : T2 }}>Annuel</span>
                      {yearly && <span style={{ fontSize: 10, background: isHighlight ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)', color: isHighlight ? 'rgba(255,255,255,0.7)' : T2, borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>−20%</span>}
                    </div>
                  )}
                  {(isFree || !plan.checkout_url_yearly) && <div style={{ height: 36 }} />}

                  {/* CTA */}
                  <div style={{ marginBottom: 24 }}>
                    <PlanBtn plan={plan} large />
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: isHighlight ? 'rgba(255,255,255,0.1)' : BORDER, marginBottom: 20 }} />

                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                        <div style={{ width: 15, height: 15, borderRadius: '50%', background: isHighlight ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <Check style={{ width: 8, height: 8, color: isHighlight ? '#fff' : T1 }} />
                        </div>
                        <span style={{ fontSize: 13, color: isHighlight ? 'rgba(255,255,255,0.65)' : T2, lineHeight: 1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* ── Comparison table */}
        {plans.length > 0 && COMPARISON_FEATURES?.length > 0 && (
          <Reveal>
            <div style={{ marginBottom: 72, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: F, minWidth: plans.length * 140 + 200 }}>
                <thead>
                  <tr>
                    <th style={{ width: 220, padding: '0 0 24px', textAlign: 'left', verticalAlign: 'bottom' }} />
                    {plans.map(plan => (
                      <th key={plan.id} style={{ padding: '0 20px 24px', textAlign: 'left', verticalAlign: 'bottom', fontWeight: 700, fontSize: 13, color: T1 }}>
                        {plan.name}
                        <div style={{ fontSize: 12, fontWeight: 400, color: T3, marginTop: 2 }}>{plan.price_monthly ? `${plan.price_monthly}€/mo` : 'Gratuit'}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((group) => (
                    <React.Fragment key={group.category}>
                      <tr>
                        <td colSpan={plans.length + 1} style={{ padding: '18px 0 8px', fontSize: 11, fontWeight: 700, color: T1, borderTop: `1px solid ${BORDER}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {group.category}
                        </td>
                      </tr>
                      {group.items.map(item => (
                        <tr key={item.name}>
                          <td style={{ padding: '9px 0', fontSize: 13, color: T2, borderTop: `1px solid rgba(0,0,0,0.04)` }}>{item.name}</td>
                          {plans.map(plan => (
                            <td key={plan.id} style={{ padding: '9px 20px', borderTop: `1px solid rgba(0,0,0,0.04)` }}>
                              <Cell value={item[plan.id]} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr style={{ borderTop: `1px solid ${BORDER}` }}>
                    <td style={{ padding: '24px 0 0' }} />
                    {plans.map(plan => (
                      <td key={plan.id} style={{ padding: '24px 20px 0', verticalAlign: 'top' }}>
                        <PlanBtn plan={plan} />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        )}

        {/* ── Enterprise */}
        <Reveal>
          <div style={{
            marginBottom: 100, padding: '40px 44px',
            background: '#fff',
            border: `1px solid ${BORDER}`,
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
          }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: T1, marginBottom: 6, letterSpacing: '-0.02em' }}>Besoin d'un plan sur mesure ?</div>
              <div style={{ fontSize: 14, color: T2, lineHeight: 1.6 }}>Pour les agences, grandes équipes ou contrats personnalisés.</div>
            </div>
            <button onClick={() => setShowContact(true)} style={{
              padding: '11px 24px', borderRadius: 9, border: `1px solid ${BORDER}`,
              background: '#fff', color: T1, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F,
              transition: 'background 150ms',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F5F3'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              Contacter l'équipe →
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}