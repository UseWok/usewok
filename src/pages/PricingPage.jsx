import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { Check, X, Zap, Shield, Users, Headphones, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

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
    width: '100%', background: '#1A1A1A', border: '1px solid #2A2A2A',
    borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#fff',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460, position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={15} />
        </button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0F2A1E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={20} color="#22C55E" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Request received</h3>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>Our team will contact you within 24 hours.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: '10px 28px', background: '#fff', color: '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Nous contacter</h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px', lineHeight: 1.6 }}>Notre équipe vous répondra sous 24h.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['first_name', 'Prénom'], ['last_name', 'Nom']].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 5, fontWeight: 500 }}>{l}</label>
                    <input required value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle} />
                  </div>
                ))}
              </div>
              {[['email', 'Email professionnel', 'email'], ['website', 'Site web', 'text'], ['role', 'Votre rôle', 'text']].map(([k, l, t]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 5, fontWeight: 500 }}>{l}</label>
                  <input required type={t} value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#888', marginBottom: 5, fontWeight: 500 }}>Message</label>
                <textarea required value={form.message} onChange={set('message')} placeholder="Décrivez votre cas d'usage..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '11px 0', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
                Envoyer
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

// Static plan definitions matching the reference image
const STATIC_PLANS = [
  {
    id: 'elite',
    name: 'Elite',
    price: 200,
    credits: '1.2k Crédits mensuels /mois',
    integrationCredits: '50k Crédits d\'intégration /mois',
    isPopular: false,
    ctaLabel: 'Passer à Elite',
    features: [
      'Applications et superagents illimités',
      'Collaborateurs illimités avec crédits partagés',
      'Domaine personnalisé',
      'Supprimer la marque WOK',
      'Intégrations incluses',
      'Automatisations',
      'Choisissez votre modèle IA',
      'Édition de code dans l\'app',
      'Synchronisation bidirectionnelle GitHub',
      'Modèles privés',
      'Accès anticipé aux nouvelles fonctionnalités',
      'Support prioritaire',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 100,
    credits: '500 Crédits mensuels /mois',
    integrationCredits: '20k Crédits d\'intégration /mois',
    isPopular: true,
    ctaLabel: 'Passer à Pro',
    features: [
      'Applications et superagents illimités',
      'Collaborateurs illimités avec crédits partagés',
      'Domaine personnalisé',
      'Supprimer la marque WOK',
      'Intégrations incluses',
      'Automatisations',
      'Choisissez votre modèle IA',
      'Édition de code dans l\'app',
      'Synchronisation bidirectionnelle GitHub',
      'Modèles privés',
      'Accès anticipé aux nouvelles fonctionnalités',
    ],
  },
  {
    id: 'builder',
    name: 'Builder',
    price: 50,
    credits: '250 Crédits mensuels /mois',
    integrationCredits: '10k Crédits d\'intégration /mois',
    isPopular: false,
    ctaLabel: 'Obtenir Builder',
    features: [
      'Applications et superagents illimités',
      'Collaborateurs illimités avec crédits partagés',
      'Domaine personnalisé',
      'Supprimer la marque WOK',
      'Intégrations incluses',
      'Automatisations',
      'Choisissez votre modèle IA',
      'Édition de code dans l\'app',
      'Synchronisation bidirectionnelle GitHub',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 20,
    credits: '100 Crédits mensuels /mois',
    integrationCredits: '2k Crédits d\'intégration /mois',
    isPopular: false,
    ctaLabel: 'Rétrograder vers Starter',
    features: [
      'Applications et superagents illimités',
      'Collaborateurs illimités avec crédits partagés',
    ],
  },
];

const SECURITY_BADGES = [
  {
    id: 'iso',
    label: 'ISO 27001',
    sub: 'Gestion de la sécurité ISO',
    icon: '🔒',
  },
  {
    id: 'soc2',
    label: 'SOC 2 Type II',
    sub: 'SOC pour les organisations de services',
    icon: '🛡️',
  },
  {
    id: 'rgpd',
    label: 'RGPD',
    sub: 'Règlement sur la protection des données et la vie privée',
    icon: '🇪🇺',
  },
];

const ENTERPRISE_FEATURES = [
  { icon: Zap, title: 'Intégration et Formation', desc: 'Des plans d\'intégration personnalisés combinés à des formations en direct et des ressources, conçus pour aider les administrateurs et les utilisateurs finaux à adopter rapidement la solution.' },
  { icon: Users, title: 'Équipe de Compte Dédiée', desc: 'Collaborez avec un responsable de compte et un ingénieur solution désignés, offrant des conseils directs, des escalades et un alignement sur la feuille de route.' },
  { icon: Headphones, title: 'Support prioritaire, garanti', desc: 'Bénéficiez d\'une assistance prioritaire garantie et de temps de réponse définis via un canal de support dédié.' },
  { icon: Shield, title: 'Fonctionnalités de Niveau Entreprise', desc: 'Des fonctionnalités de sécurité, de conformité, de gestion et de surveillance offrant le contrôle et la flexibilité nécessaires à grande échelle.' },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleUpgrade = (plan) => {
    if (plan.id === 'enterprise') { setShowModal(true); return; }
    navigate(`/checkout?plan=${plan.id}&billing=monthly`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 80% 50% at 50% 120%, rgba(255,140,0,0.45) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 140%, rgba(249,87,56,0.35) 0%, transparent 55%),
        #1F1F1F
      `,
      fontFamily: 'Inter, system-ui, sans-serif', color: '#fff',
      overflowX: 'hidden',
    }}>
      {showModal && <ContactModal onClose={() => setShowModal(false)} />}

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '72px 0 52px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 700, color: '#fff',
            margin: '0 0 14px', letterSpacing: '-0.025em', lineHeight: 1.15,
          }}>
            Choisissez le forfait qui vous convient
          </h1>
          <p style={{ fontSize: 15, color: '#fff', opacity: 0.6, margin: 0, lineHeight: 1.6 }}>
            Commencez gratuitement. Montez en gamme quand vous êtes prêt.
          </p>
        </div>

        {/* ── 4-column Plan Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 40 }}>
          {STATIC_PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07, ease: [0.4, 0, 0.2, 1] }}
              style={{
                background: '#1E1E1F',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 14,
                padding: '24px 20px',
                display: 'flex', flexDirection: 'column',
                position: 'relative',
              }}
            >
              {/* Plan name */}
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{plan.name}</h3>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 16 }}>
                <span style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>${plan.price}</span>
                <span style={{ fontSize: 12, color: '#fff', opacity: 0.5 }}>/mois</span>
              </div>

              {/* Credits info */}
              <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, marginBottom: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 12, color: '#fff', opacity: 0.8, marginBottom: 4 }}>{plan.credits}</div>
                <div style={{ fontSize: 12, color: '#fff', opacity: 0.8 }}>{plan.integrationCredits}</div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(plan)}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', marginBottom: 18,
                  transition: 'opacity 150ms',
                  // Only the popular plan gets solid orange CTA
                  background: plan.isPopular ? '#F95738' : 'transparent',
                  color: plan.isPopular ? '#fff' : '#fff',
                  border: plan.isPopular ? 'none' : '1px solid rgba(255,255,255,0.25)',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {plan.ctaLabel}
              </button>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 16 }} />

              {/* Features */}
              <p style={{ fontSize: 11, fontWeight: 600, color: '#fff', opacity: 0.5, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Points forts du plan :</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <Check style={{ width: 12, height: 12, color: '#F95738', flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 12, color: '#fff', opacity: 0.85, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Security Badges Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 40 }}>
          {SECURITY_BADGES.map((badge) => (
            <div key={badge.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{badge.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{badge.label}</div>
                <div style={{ fontSize: 12, color: '#fff', opacity: 0.6, lineHeight: 1.4 }}>{badge.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Enterprise Block ── */}
        <div style={{
          background: '#1A1A1B',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 16,
          padding: '40px 40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'start',
        }}>
          {/* Left: Title + description + CTA */}
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
              WOK pour les Entreprises
            </h2>
            <p style={{ fontSize: 14, color: '#fff', opacity: 0.7, margin: '0 0 28px', lineHeight: 1.7 }}>
              Permettez aux grandes organisations de créer des solutions parfaitement adaptées à leurs équipes, en toute sécurité et à grande échelle.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '11px 26px', borderRadius: 9,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: 'transparent', color: '#fff',
                border: '1px solid rgba(255,255,255,0.35)',
                fontFamily: 'Inter, sans-serif', transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent'; }}
            >
              Nous contacter
            </button>
          </div>

          {/* Right: 2×2 feature grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {ENTERPRISE_FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Icon style={{ width: 15, height: 15, color: '#F95738', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{feat.title}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#fff', opacity: 0.6, margin: 0, lineHeight: 1.6 }}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}