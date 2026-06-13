import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, getPlansConfig } from '@/lib/plans-config';
import { Check, X, Zap, Shield, Users, Headphones } from 'lucide-react';
import { PlanCardSkeleton } from '@/components/ui/Skeleton.jsx';

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
      <div style={{ background: '#111', border: '1px solid #2A2A2A', borderRadius: 16, padding: 32, width: '100%', maxWidth: 460, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={15} />
        </button>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: 48, margin: '0 auto 16px', lineHeight: 1 }}>🎉</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Message envoyé !</h3>
            <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.7 }}>Notre équipe vous répondra dans les 24 heures.</p>
            <button onClick={onClose} style={{ marginTop: 24, padding: '11px 32px', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Parfait, merci !</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>Nous contacter</h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px', lineHeight: 1.6 }}>Notre équipe vous répondra sous 24h.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[['first_name', 'Prénom'], ['last_name', 'Nom']].map(([k, l]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5, fontWeight: 500 }}>{l}</label>
                    <input required value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle} />
                  </div>
                ))}
              </div>
              {[['email', 'Email professionnel', 'email'], ['website', 'Site web', 'text'], ['role', 'Votre rôle', 'text']].map(([k, l, t]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5, fontWeight: 500 }}>{l}</label>
                  <input required type={t} value={form[k]} onChange={set(k)} placeholder={l} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 5, fontWeight: 500 }}>Message</label>
                <textarea required value={form.message} onChange={set('message')} placeholder="Décrivez votre cas d'usage..." rows={3} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '11px 0', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
                Envoyer
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const SECURITY_BADGES = [
  { id: 'iso', label: 'ISO 27001', sub: 'Gestion de la sécurité ISO', icon: '🔒' },
  { id: 'soc2', label: 'SOC 2 Type II', sub: 'SOC pour les organisations de services', icon: '🛡️' },
  { id: 'rgpd', label: 'RGPD', sub: 'Règlement sur la protection des données et la vie privée', icon: '🇪🇺' },
];

const ENTERPRISE_FEATURES = [
  { icon: Zap, title: 'Intégration et Formation', desc: "Plans d'intégration personnalisés avec formations en live." },
  { icon: Users, title: 'Équipe de Compte Dédiée', desc: 'Responsable de compte et ingénieur solution désignés.' },
  { icon: Headphones, title: 'Support prioritaire', desc: 'Assistance prioritaire garantie via un canal dédié.' },
  { icon: Shield, title: 'Niveau Entreprise', desc: 'Sécurité, conformité et surveillance à grande échelle.' },
];

function formatCredits(n) {
  if (!n && n !== 0) return null;
  if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, '')}k`;
  return String(n);
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    loadPlansFromDB()
      .then(dbPlans => { setPlans(dbPlans || getPlansConfig()); setPlansLoading(false); })
      .catch(() => { setPlans(getPlansConfig()); setPlansLoading(false); });
  }, []);

  const cardPlans = plans.filter(p => {
    const url = p.checkout_url_monthly || '';
    return !url.startsWith('mailto') && p.id !== 'free';
  });

  const handleUpgrade = (plan) => {
    if (plan.checkout_url_monthly?.startsWith('http')) {
      window.location.href = plan.checkout_url_monthly;
      return;
    }
    navigate(`/checkout?plan=${plan.id}&billing=monthly`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1F1F1F',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#fff',
      overflowX: 'hidden',
    }}>
      {showModal && <ContactModal onClose={() => setShowModal(false)} />}

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Header */}
        <div style={{ padding: '64px 0 56px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            Choisissez le forfait qui vous convient
          </h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0, lineHeight: 1.6 }}>
            Commencez gratuitement. Montez en gamme quand vous êtes prêt.
          </p>
        </div>

        {/* Plan Cards */}
        {plansLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
            {[0, 1, 2].map(i => <PlanCardSkeleton key={i} />)}
          </div>
        ) : (cardPlans.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(cardPlans.length, 4)}, 1fr)`,
            gap: 16,
            marginBottom: 40,
          }}>
            {cardPlans.map((plan) => {
              const isPopular = !!plan.badge;
              const price = plan.price_monthly ?? plan.price ?? 0;
              const creditsLabel = plan.credits_limit ? `${formatCredits(plan.credits_limit)} crédits/mois` : null;
              const integLabel = plan.integration_credits ? `${formatCredits(plan.integration_credits)} crédits intégration` : null;
              const features = (plan.features || []).map(f => f.text || f);

              return (
                <div
                  key={plan.id}
                  style={{
                    background: isPopular ? '#232323' : '#1A1A1A',
                    border: isPopular ? '1px solid rgba(249,87,56,0.4)' : '1px solid #2A2A2A',
                    borderRadius: 12,
                    padding: '22px 18px',
                    display: 'flex', flexDirection: 'column',
                    position: 'relative',
                    transition: 'border-color 150ms',
                  }}
                >
                  {isPopular && (
                    <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#F95738', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 999, letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {plan.badge}
                    </div>
                  )}

                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>{plan.name}</h3>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 14 }}>
                    <span style={{ fontSize: 34, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>${price}</span>
                    <span style={{ fontSize: 12, color: '#555' }}>/mois</span>
                  </div>

                  {(creditsLabel || integLabel) && (
                    <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 7, marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                      {creditsLabel && <div style={{ fontSize: 11, color: '#aaa', marginBottom: integLabel ? 3 : 0 }}>{creditsLabel}</div>}
                      {integLabel && <div style={{ fontSize: 11, color: '#aaa' }}>{integLabel}</div>}
                    </div>
                  )}

                  <button
                    onClick={() => handleUpgrade(plan)}
                    style={{
                      width: '100%', padding: '9px 0', borderRadius: 7,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', marginBottom: 16,
                      background: isPopular ? '#F95738' : 'transparent',
                      color: '#fff',
                      border: isPopular ? 'none' : '1px solid #333',
                      transition: 'opacity 150ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    {plan.badge_cta || (price === 0 ? 'Commencer gratuitement' : `Passer à ${plan.name}`)}
                  </button>

                  <div style={{ height: 1, background: '#2A2A2A', marginBottom: 14 }} />

                  {features.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                      {features.map((f, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                          <Check style={{ width: 11, height: 11, color: '#22c55e', flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Security Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 40 }}>
          {SECURITY_BADGES.map((badge) => (
            <div key={badge.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: 10,
            }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{badge.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{badge.label}</div>
                <div style={{ fontSize: 11, color: '#666', lineHeight: 1.4 }}>{badge.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Block */}
        <div style={{
          background: '#1A1A1A',
          border: '1px solid #2A2A2A',
          borderRadius: 14,
          padding: '36px 36px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          alignItems: 'start',
        }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              WOK pour les Entreprises
            </h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px', lineHeight: 1.7 }}>
              Permettez aux grandes organisations de créer des solutions parfaitement adaptées à leurs équipes, en toute sécurité et à grande échelle.
            </p>
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: '10px 22px', borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: 'transparent', color: '#fff',
                border: '1px solid #333',
                fontFamily: 'Inter, sans-serif', transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.background = 'transparent'; }}
            >
              Nous contacter
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
            {ENTERPRISE_FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                    <Icon style={{ width: 13, height: 13, color: '#F95738', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{feat.title}</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#666', margin: 0, lineHeight: 1.6 }}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}