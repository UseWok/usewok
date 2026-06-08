import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { Check, X, Shield, Zap, Rocket, Diamond, Building2, Plus, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────
   Contact / Demo modal
───────────────────────────────────────────── */
const ContactModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', website: '', role: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await base44.entities.ContactLead.create({ ...form, status: 'new' }); } catch {}
    setSubmitted(true);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const inputStyle = {
    width: '100%',
    background: '#0D0D0D',
    border: '1px solid #2A2A2A',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    color: '#E5E5E5',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 150ms',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460, position: 'relative' }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 120ms' }}
          onMouseEnter={e => e.currentTarget.style.color = '#888'}
          onMouseLeave={e => e.currentTarget.style.color = '#444'}
        >
          <X size={15} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0F2A1E', border: '1px solid #1A4A32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={20} color="#22C55E" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Request received</h3>
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>Our team will contact you within 24 hours.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: '10px 28px', background: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Book a demo</h2>
              <p style={{ fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6 }}>Connect with our team to see WOK in action.</p>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['first_name', 'First name'], ['last_name', 'Last name']].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 5, fontWeight: 500 }}>{l}</label>
                    <input required value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                  </div>
                ))}
              </div>
              {[['email', 'Work email', 'email'], ['website', 'Company website', 'text'], ['role', 'Your role', 'text']].map(([k, l, t]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 5, fontWeight: 500 }}>{l}</label>
                  <input required type={t} value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#555', marginBottom: 5, fontWeight: 500 }}>What would you like to discuss?</label>
                <textarea required value={form.message} onChange={set('message')} placeholder="Describe your use case..." rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#444'} onBlur={e => e.target.style.borderColor = '#2A2A2A'} />
              </div>
              <button
                type="submit"
                style={{ width: '100%', padding: '11px 0', background: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4, transition: 'opacity 150ms' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Send message
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   FAQ data & accordion
───────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "What is WOK and how does it work?",
    a: "WOK est une plateforme alimentée par l'IA qui vous permet de créer des applications logicielles personnalisées sans programmation. Elle utilise le traitement du langage naturel pour comprendre vos besoins et générer des logiciels fonctionnels basés sur vos descriptions. Notre plateforme est conçue pour être conviviale et accessible aux utilisateurs non techniques.",
  },
  {
    q: "What's included in the free Starter plan?",
    a: "Le plan gratuit vous offre une allocation quotidienne de 5 messages et un plafond mensuel de 25 messages. Vous obtenez également 100 crédits d'intégration et l'accès à tous les types d'intégration principaux — authentification, base de données, analyses — vous permettant de créer des applications entièrement fonctionnelles gratuitement.",
  },
  {
    q: "What are integration credits and how are they used?",
    a: "Les crédits d'intégration permettent d'accéder aux diverses intégrations au sein de votre application : LLMs, téléchargement de fichiers, compréhension et génération d'images, envoi d'e-mails, SMS, requêtes de base de données, et bien plus encore. Les crédits non utilisés expirent à la fin de votre cycle de facturation mensuel.",
  },
  {
    q: "What kind of applications can I build?",
    a: "WOK est polyvalent : produits SaaS entièrement fonctionnels, outils de back-office, applications de productivité personnelle, portails clients, outils d'automatisation des processus métier. Vous pouvez également l'utiliser pour le prototypage rapide et la création de MVPs afin de valider vos idées sans investir dans des ressources de développement coûteuses.",
  },
  {
    q: "Who owns the applications I create?",
    a: "Toutes les applications et tous les contenus générés via notre plateforme sont considérés comme votre propriété. Nous ne revendiquons aucun droit de propriété sur ce que vous créez. Vous êtes libre d'utiliser, de modifier, de distribuer ou de vendre les applications générées dans les limites autorisées par la loi.",
  },
  {
    q: "How does deployment work?",
    a: "Le déploiement est incroyablement simple. Vos applications sont instantanément utilisables et partageables dès que vous les créez — partagez simplement l'URL. Il n'est pas nécessaire d'effectuer des étapes d'hébergement ou de déploiement séparées.",
  },
  {
    q: "What happens when I reach my message limit?",
    a: "Lorsque vous atteignez votre limite quotidienne, vous devrez attendre le lendemain. Si vous atteignez votre limite mensuelle, vous ne pourrez pas envoyer de messages supplémentaires jusqu'au début de votre prochain cycle. Pour éviter les interruptions, vous pouvez passer à un plan supérieur à tout moment depuis votre tableau de bord de facturation.",
  },
];

const FaqItem = ({ item, isOpen, onToggle }) => (
  <div style={{ borderBottom: '1px solid #1A1A1A' }}>
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer',
        textAlign: 'left', fontFamily: 'Inter, sans-serif',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, color: '#E5E5E5', lineHeight: 1.5 }}>{item.q}</span>
      <div style={{
        width: 24, height: 24, borderRadius: 6, border: '1px solid #2A2A2A',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: isOpen ? '#1A1A1A' : 'transparent', transition: 'background 150ms',
      }}>
        <Plus size={13} color={isOpen ? '#fff' : '#555'} style={{ transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform 200ms' }} />
      </div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.75, paddingBottom: 18, margin: 0 }}>{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ─────────────────────────────────────────────
   Plan icon map (non-enterprise plans only)
───────────────────────────────────────────── */
const PLAN_ICONS = { 0: Zap, 1: Rocket, 2: Diamond };

/* ─────────────────────────────────────────────
   Enterprise features (4 left + 4 right)
───────────────────────────────────────────── */
const ENT_FEATURES = [
  "Unlimited seats & messages",
  "Dedicated cloud infrastructure",
  "SSO & advanced permissions",
  "Custom integrations & API access",
  "SOC 2 · GDPR · ISO 27001",
  "99.9% uptime SLA",
  "Onboarding & team training",
  "Dedicated customer success manager",
];

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function PricingPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [configPlans, setConfigPlans] = useState(getPlansConfig());
  const [user, setUser] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    loadPlansFromDB().then(dbPlans => { if (dbPlans) setConfigPlans(dbPlans); }).catch(() => {});
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Filter out enterprise from the main 3-column grid
  const plans = configPlans
    .map((p) => {
      const isEnterprise = !p.price_monthly || p.checkout_url_monthly?.startsWith('mailto');
      return {
        id: p.id,
        name: p.name,
        price: isEnterprise ? null : (p.price_monthly || 0),
        badge: p.badge || null,
        desc: p.features_header || '',
        isEnterprise,
        features: (p.features || []).map(f => f.text || f),
        checkout_url_monthly: p.checkout_url_monthly,
      };
    })
    .filter(p => !p.isEnterprise);

  const handleUpgrade = (plan) => {
    if (plan.checkout_url_monthly?.startsWith('mailto')) { setShowModal(true); return; }
    if (plan.checkout_url_monthly?.startsWith('http')) { window.location.href = plan.checkout_url_monthly; return; }
    navigate(`/checkout?plan=${plan.id}&billing=monthly`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: 'Inter, system-ui, sans-serif', color: '#fff' }}>
      {showModal && <ContactModal onClose={() => setShowModal(false)} />}

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 100px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '64px 0 52px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999,
            border: '1px solid #2A2A2A', background: '#111',
            fontSize: 11, fontWeight: 600, color: '#888',
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20,
          }}>
            Pricing
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Simple, transparent pricing
          </h1>
          <p style={{ fontSize: 15, color: '#555', margin: 0, lineHeight: 1.6 }}>
            Start free. Scale when you're ready. No hidden fees.
          </p>
        </div>

        {/* ── Plan cards — always 3 columns: Starter | Creator | Pro ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {plans.map((plan, i) => {
            const isPopular = !!plan.badge;
            const PlanIcon = PLAN_ICONS[i] || Zap;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  background: isPopular ? '#111' : '#0D0D0D',
                  border: isPopular ? '1px solid #3A3A3A' : '1px solid #1E1E1E',
                  borderRadius: 16,
                  padding: '28px 24px',
                  display: 'flex', flexDirection: 'column',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: isPopular ? '0 0 0 1px #333, 0 24px 64px rgba(0,0,0,0.5)' : 'none',
                }}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div style={{
                    position: 'absolute', top: 0, right: 24,
                    background: '#fff', color: '#000',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: '0 0 8px 8px',
                  }}>
                    Popular
                  </div>
                )}

                {/* Icon */}
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: '#161616', border: '1px solid #2A2A2A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>
                  <PlanIcon size={15} color={isPopular ? '#a78bfa' : '#555'} />
                </div>

                {/* Name */}
                <p style={{ fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  {plan.name}
                </p>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    €{plan.price}
                  </span>
                  <span style={{ fontSize: 13, color: '#444' }}>/month</span>
                </div>

                {/* Desc */}
                {plan.desc && (
                  <p style={{ fontSize: 12, color: '#555', lineHeight: 1.55, margin: '0 0 20px', minHeight: 32 }}>{plan.desc}</p>
                )}

                {/* CTA */}
                <button
                  onClick={() => handleUpgrade(plan)}
                  style={{
                    width: '100%', padding: '11px 0', borderRadius: 9,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: isPopular ? '#fff' : 'transparent',
                    color: isPopular ? '#000' : '#ccc',
                    border: isPopular ? 'none' : '1px solid #2A2A2A',
                    fontFamily: 'Inter, sans-serif', transition: 'opacity 150ms',
                    marginBottom: 24,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {plan.price === 0 ? 'Get started free' : 'Get started'}
                </button>

                {/* Divider */}
                <div style={{ height: 1, background: '#1A1A1A', marginBottom: 20 }} />

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                      <Check size={13} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 12.5, color: '#D1D1D1', lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Enterprise block ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
          style={{
            background: '#0D0D0D',
            border: '1px solid #1E1E1E',
            borderRadius: 16,
            padding: '32px 32px 28px',
            marginBottom: 20,
          }}
        >
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: '#161616', border: '1px solid #2A2A2A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 size={15} color="#555" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Enterprise
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.65, margin: 0, maxWidth: 360 }}>
                Contracts sur-mesure, infrastructure dédiée et sécurité de niveau entreprise pour les organisations qui ont besoin d'un contrôle total.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '11px 24px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: '#fff', color: '#000', border: 'none',
                fontFamily: 'Inter, sans-serif', transition: 'opacity 150ms', whiteSpace: 'nowrap', flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Book a demo →
            </button>
          </div>

          {/* 4 + 4 features grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 32px' }}>
            {ENT_FEATURES.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <Check size={13} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12.5, color: '#D1D1D1', lineHeight: 1.5 }}>{feat}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Security strip ── */}
        <div style={{
          background: '#0D0D0D', border: '1px solid #1E1E1E',
          borderRadius: 12, padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, marginBottom: 80,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Shield size={16} color="#444" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#888', display: 'block' }}>Enterprise-grade security</span>
              <span style={{ fontSize: 11, color: '#444' }}>SOC 2 · GDPR · ISO 27001</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['SOC 2', 'GDPR', 'ISO 27001'].map(badge => (
              <div key={badge} style={{ padding: '4px 10px', border: '1px solid #1E1E1E', borderRadius: 6, fontSize: 10, fontWeight: 600, color: '#444' }}>
                {badge}
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
              Frequently asked questions
            </h2>
            <p style={{ fontSize: 14, color: '#555', margin: 0 }}>Everything you need to know about WOK.</p>
          </div>

          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={i}
                item={item}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
