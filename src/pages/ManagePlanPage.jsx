import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, TrendingUp, X, ChevronRight, Zap, Crown, Shield, Clock, Star, AlertTriangle, Lock, Wifi, MessageSquare, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { toast } from 'sonner';

const DK = {
  bg: '#1F1F1F', surface: '#1A1A1A', border: '#2A2A2A',
  text: '#fff', muted: '#888', faint: '#232323',
};

const PLAN_ICONS = { free: Zap, essential: Shield, advanced: TrendingUp, expert: TrendingUp, supreme: Crown };

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getRenewalDate(user) {
  const base = user?.subscription_date || user?.created_date;
  if (!base) return null;
  const d = new Date(base);
  const billing = user?.billing_cycle || 'monthly';
  const now = new Date();
  if (billing === 'yearly') {
    while (d <= now) d.setFullYear(d.getFullYear() + 1);
  } else {
    while (d <= now) d.setMonth(d.getMonth() + 1);
  }
  return d;
}

const RATING_ITEMS = [
  { key: 'quality', label: 'Qualité des réponses' },
  { key: 'speed', label: 'Vitesse de génération' },
  { key: 'value', label: 'Rapport qualité/prix' },
  { key: 'ux', label: "Facilité d'utilisation" },
];

function RatingStep({ ratings, setRatings, onNext }) {
  const allRated = RATING_ITEMS.every(i => ratings[i.key] > 0);
  return (
    <div style={{ padding: '24px 24px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: DK.text, margin: '0 0 4px' }}>Avant de partir…</p>
        <p style={{ fontSize: 12, color: DK.muted, margin: 0 }}>Vos retours nous aident à améliorer WOK.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {RATING_ITEMS.map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#ccc' }}>{item.label}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRatings(r => ({ ...r, [item.key]: star }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <Star style={{ width: 18, height: 18, color: ratings[item.key] >= star ? '#F95738' : '#333', fill: ratings[item.key] >= star ? '#F95738' : 'none', transition: 'color 100ms, fill 100ms' }} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={onNext} disabled={!allRated}
        style={{ width: '100%', marginTop: 20, padding: '11px 0', background: !allRated ? '#2A2A2A' : '#fff', color: !allRated ? '#555' : '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: allRated ? 'pointer' : 'not-allowed', transition: 'background 150ms' }}>
        Continuer →
      </button>
    </div>
  );
}

function LossStep({ userPlan, onNext, onBack }) {
  const losses = [
    userPlan?.credits_limit && { icon: Zap, label: `${userPlan.credits_limit} crédits/mois`, desc: 'Votre quota IA complet, perdu.' },
    userPlan?.internet_access && { icon: Wifi, label: 'Recherche web temps réel', desc: 'Données de marché en direct.' },
    userPlan?.file_upload && { icon: FileText, label: 'Analyse de documents', desc: 'Upload de fichiers désactivé.' },
    userPlan?.max_discussions === 0 && { icon: MessageSquare, label: 'Discussions illimitées', desc: 'Limité à 3 conversations.' },
    userPlan?.ultimate_access && { icon: Crown, label: 'Mode Expert (Claude Opus)', desc: "Accès au modèle IA le plus puissant." },
    { icon: Lock, label: 'Historique complet', desc: "L'accès aux chats passés sera limité." },
  ].filter(Boolean);

  return (
    <div style={{ padding: '24px 24px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <AlertTriangle style={{ width: 20, height: 20, color: '#ef4444' }} />
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: DK.text, margin: 0 }}>Vous perdrez immédiatement :</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {losses.map((loss, i) => {
          const Icon = loss.icon;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
              <Icon style={{ width: 14, height: 14, color: '#ef4444', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: DK.text, margin: 0 }}>{loss.label}</p>
                <p style={{ fontSize: 11, color: DK.muted, margin: 0 }}>{loss.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onBack} style={{ padding: '10px 16px', background: '#2A2A2A', color: '#888', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Retour</button>
        <button onClick={onNext} style={{ flex: 1, padding: '10px 0', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Je comprends, continuer →
        </button>
      </div>
    </div>
  );
}

function ReasonStep({ cancelNote, setCancelNote, cancelEmail, setCancelEmail, cancelLoading, onSubmit, onBack }) {
  const inputStyle = { width: '100%', background: '#141414', border: '1px solid #2A2A2A', borderRadius: 7, padding: '10px 12px', fontSize: 13, color: '#fff', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };
  return (
    <div style={{ padding: '24px 24px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: DK.text, margin: '0 0 4px' }}>Une dernière chose</p>
        <p style={{ fontSize: 12, color: DK.muted, margin: 0 }}>Pourquoi annulez-vous ? Cela nous aide vraiment.</p>
      </div>
      <div style={{ padding: '10px 12px', background: '#141414', borderRadius: 8, border: '1px solid #2A2A2A', marginBottom: 14, fontSize: 12, color: '#888', lineHeight: 1.6 }}>
        Votre demande sera traitée sous <strong style={{ color: '#ccc' }}>24 heures</strong>. Vous recevrez la date exacte d'annulation par email.
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>Raison *</label>
          <span style={{ fontSize: 10, color: cancelNote.length >= 450 ? '#ef4444' : '#555' }}>{cancelNote.length}/500</span>
        </div>
        <textarea value={cancelNote} onChange={e => setCancelNote(e.target.value.slice(0, 500))}
          placeholder="Dites-nous pourquoi vous annulez..."
          rows={3} style={{ ...inputStyle, resize: 'none' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 5 }}>Email de paiement *</label>
        <input value={cancelEmail} onChange={e => setCancelEmail(e.target.value)} placeholder="email@example.com" style={inputStyle} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onBack} style={{ padding: '10px 16px', background: '#2A2A2A', color: '#888', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>Retour</button>
        <button onClick={onSubmit} disabled={cancelLoading || !cancelNote.trim() || !cancelEmail.trim()}
          style={{ flex: 1, padding: '10px 0', background: cancelLoading || !cancelNote.trim() || !cancelEmail.trim() ? '#2A2A2A' : '#fff', color: cancelLoading || !cancelNote.trim() || !cancelEmail.trim() ? '#555' : '#000', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 150ms' }}>
          {cancelLoading ? 'Envoi...' : "Envoyer la demande d'annulation"}
        </button>
      </div>
    </div>
  );
}

export default function ManagePlanPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [showCancelFlow, setShowCancelFlow] = useState(false);
  const [cancelStep, setCancelStep] = useState(1);
  const [ratings, setRatings] = useState({});
  const [cancelNote, setCancelNote] = useState('');
  const [cancelEmail, setCancelEmail] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSent, setCancelSent] = useState(false);
  const [existingCancel, setExistingCancel] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setUserPlan(getUserPlan(u));
      setCancelEmail(u?.email || '');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.SupportTicket.filter({ category: 'cancellation', user_email: user.email })
      .then(res => {
        if (res.length > 0) {
          const sorted = res.sort((a, b) => {
            const rank = { approved: 0, pending: 1, rejected: 2 };
            return (rank[a.cancel_status] ?? 1) - (rank[b.cancel_status] ?? 1);
          });
          setExistingCancel(sorted[0]);
        }
      }).catch(() => {});
  }, [user?.email]);

  const Icon = PLAN_ICONS[userPlan?.id] || Zap;
  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan?.credits_limit || 10;
  const pct = Math.min((creditsUsed / creditsLimit) * 100, 100);
  const renewalDate = user ? getRenewalDate(user) : null;
  const billing = user?.billing_cycle || 'monthly';
  const isYearly = billing === 'yearly';

  const features = [
    userPlan?.credits_limit && `${userPlan.credits_limit} crédits/mois`,
    userPlan?.internet_access && 'Recherche web',
    userPlan?.ultimate_access && 'Mode Expert',
    userPlan?.file_upload && 'Fichiers',
    userPlan?.max_discussions === 0 && 'Discussions illimitées',
    userPlan?.premium_support && 'Support premium',
  ].filter(Boolean);

  const submitCancel = async () => {
    if (!cancelNote.trim() || !cancelEmail.trim()) return;
    setCancelLoading(true);
    const userName = user?.full_name || user?.email?.split('@')[0] || 'Unknown';
    const planPrice = isYearly
      ? `$${userPlan?.price_yearly || userPlan?.price_monthly * 12}/yr`
      : `$${userPlan?.price_monthly}/mo`;
    await base44.entities.SupportTicket.create({
      title: `Cancellation — ${userName}`,
      description: cancelNote,
      category: 'cancellation',
      status: 'open',
      cancel_status: 'pending',
      user_email: user?.email || cancelEmail,
      user_name: userName,
      user_plan: userPlan?.name || 'Free',
      user_plan_price: planPrice,
      invoice_email: cancelEmail,
      ratings_json: JSON.stringify(ratings),
      messages_json: JSON.stringify([{
        author: 'user',
        text: `Raison: ${cancelNote}\nEmail: ${cancelEmail}`,
        file_urls: [],
        created_at: new Date().toISOString(),
      }]),
    });
    setCancelLoading(false);
    setCancelSent(true);
    setShowCancelFlow(false);
    toast.success('Demande envoyée — traitée sous 24h');
  };

  const STEP_TITLES = { 1: 'Évaluation', 2: 'Ce que vous perdez', 3: 'Annuler' };

  return (
    <div style={{ minHeight: '100vh', background: DK.bg, fontFamily: 'Inter, system-ui, sans-serif', color: DK.text }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <button onClick={() => navigate('/settings')} style={{ width: 32, height: 32, borderRadius: 8, background: '#2A2A2A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', transition: 'background 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#333'}
            onMouseLeave={e => e.currentTarget.style.background = '#2A2A2A'}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: DK.text, margin: 0 }}>Gérer l'abonnement</h1>
        </div>

        {/* Current plan card */}
        <div style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(249,87,56,0.15)', border: '1px solid rgba(249,87,56,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon style={{ width: 18, height: 18, color: '#F95738' }} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: DK.text, margin: 0 }}>{userPlan?.name || 'Free'}</p>
              <p style={{ fontSize: 12, color: DK.muted, margin: 0 }}>
                {isYearly
                  ? `$${userPlan?.price_yearly || (userPlan?.price_monthly * 12)}/an`
                  : userPlan?.price_monthly > 0 ? `$${userPlan.price_monthly}/mois` : 'Gratuit'}
                {isYearly && <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(249,87,56,0.15)', color: '#F95738' }}>ANNUEL</span>}
              </p>
            </div>
          </div>

          {renewalDate && userPlan?.price_monthly > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', marginBottom: 14 }}>
              <Clock style={{ width: 12, height: 12, color: '#555', flexShrink: 0 }} />
              <p style={{ fontSize: 11, color: '#666', margin: 0 }}>
                {isYearly ? 'Renouvellement annuel le ' : 'Renouvellement mensuel le '}
                <span style={{ color: '#aaa' }}>{formatDate(renewalDate)}</span>
              </p>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: DK.muted }}>Crédits ce mois</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#ccc' }}>{Math.round(creditsUsed * 10) / 10} / {creditsLimit}</span>
            </div>
            <div style={{ width: '100%', height: 4, borderRadius: 999, background: '#2A2A2A', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: '#F95738', transition: 'width 600ms ease' }} />
            </div>
          </div>

          {features.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check style={{ width: 11, height: 11, color: '#22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#888' }}>{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade button */}
        <button onClick={() => navigate('/pricing')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', marginBottom: 12, background: '#F95738', border: 'none', borderRadius: 10, cursor: 'pointer', transition: 'opacity 150ms' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <TrendingUp style={{ width: 15, height: 15, color: '#fff' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Améliorer mon abonnement</span>
          </div>
          <ChevronRight style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.7)' }} />
        </button>

        {/* Billing history */}
        {userPlan?.price_monthly > 0 && (
          <div style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #2A2A2A' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Historique de facturation</p>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: DK.text, margin: '0 0 2px' }}>{userPlan.name}</p>
                <p style={{ fontSize: 11, color: DK.muted, margin: 0 }}>
                  Depuis {formatDate(user?.subscription_date || user?.created_date)}
                </p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>ACTIF</span>
            </div>
          </div>
        )}

        {/* Cancel */}
        {userPlan?.price_monthly > 0 && (
          <>
            {cancelSent || existingCancel ? (
              <div style={{ padding: '14px 16px', background: '#141414', border: '1px solid #2A2A2A', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Clock style={{ width: 13, height: 13, color: existingCancel?.cancel_status === 'approved' ? '#22c55e' : '#888', flexShrink: 0 }} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: DK.text, margin: 0 }}>
                    {existingCancel?.cancel_status === 'approved' ? 'Abonnement annulé' : "Demande d'annulation en attente"}
                  </p>
                </div>
                <p style={{ fontSize: 12, color: DK.muted, margin: 0, lineHeight: 1.6 }}>
                  {existingCancel?.cancel_status === 'approved' && existingCancel?.cancel_ends_at
                    ? `Votre abonnement reste actif jusqu'au ${new Date(existingCancel.cancel_ends_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.`
                    : "Votre demande a été reçue et sera traitée sous 24 heures."
                  }
                </p>
              </div>
            ) : (
              <button onClick={() => { setCancelStep(1); setRatings({}); setShowCancelFlow(true); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 0', background: 'transparent', color: '#555', border: '1px solid #2A2A2A', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'color 120ms, border-color 120ms' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#3A3A3A'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#2A2A2A'; }}>
                <X style={{ width: 12, height: 12 }} />
                Annuler mon abonnement
              </button>
            )}
          </>
        )}
      </div>

      {/* Cancel Flow Modal */}
      {showCancelFlow && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowCancelFlow(false); }}>
          <div style={{ width: '100%', maxWidth: 380, background: '#141414', border: '1px solid #2A2A2A', borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #2A2A2A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {[1, 2, 3].map(s => (
                  <div key={s} style={{ width: 7, height: 7, borderRadius: '50%', background: s <= cancelStep ? '#F95738' : '#2A2A2A', transition: 'background 200ms' }} />
                ))}
                <span style={{ fontSize: 12, color: DK.muted, marginLeft: 4 }}>{STEP_TITLES[cancelStep]}</span>
              </div>
              <button onClick={() => setShowCancelFlow(false)} style={{ width: 24, height: 24, borderRadius: 5, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            </div>
            {cancelStep === 1 && <RatingStep ratings={ratings} setRatings={setRatings} onNext={() => setCancelStep(2)} />}
            {cancelStep === 2 && <LossStep userPlan={userPlan} onNext={() => setCancelStep(3)} onBack={() => setCancelStep(1)} />}
            {cancelStep === 3 && (
              <ReasonStep
                cancelNote={cancelNote} setCancelNote={setCancelNote}
                cancelEmail={cancelEmail} setCancelEmail={setCancelEmail}
                cancelLoading={cancelLoading}
                onSubmit={submitCancel}
                onBack={() => setCancelStep(2)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}