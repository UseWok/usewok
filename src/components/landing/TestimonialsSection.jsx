import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import FadeIn from '@/components/landing/FadeIn';
import { AVATAR_GRADIENTS } from '@/lib/user-color';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG2 = '#111113';
const T1 = '#F0F0EE';
const T3 = 'rgba(255,255,255,0.3)';
const BORDER = 'rgba(255,255,255,0.07)';

// Fallback if DB is empty — keeps landing page working offline
const FALLBACK = [
  { author_name: 'Sofiane B.', author_role: 'Post at Stensor', text: "franchement j'étais sceptique au début, mais j'ai suivi le plan sans rien comprendre à l'IA, et en genre 10 jours mon score avait déjà bougé, ChatGPT me cite maintenant sur des recherches locales", avatar_color: 'mint', verified: true, order: 0 },
  { author_name: 'Amel K.', author_role: 'Founder of Dh-hd', text: "super simple à utiliser, j'ai pas d'équipe marketing donc ça tombait bien, résultat visible en à peine 2 semaines sans prise de tête", avatar_color: 'violet', verified: true, order: 1 },
  { author_name: 'Moussa D.', author_role: 'Founder of Varileo', text: "je m'attendais à un truc compliqué mais non, j'ai juste coché les étapes une par une, ma visibilité sur les IA a clairement augmenté en quelques semaines", avatar_color: 'ink', verified: true, order: 2 },
  { author_name: 'Julien P.', author_role: 'Consultant indépendant, Nantes', text: "outil hyper simple, aucune connaissance technique demandée, en une dizaine de jours j'ai vu un vrai changement sur mes scores IA", avatar_color: 'sunset', verified: false, order: 3 },
  { author_name: 'Camille R.', author_role: 'Gérante boutique déco, Bordeaux', text: "j'ai testé sans trop y croire, mais le plan d'action est tellement simple à suivre que j'ai vu des résultats en 2 semaines, aucune prise de tête", avatar_color: 'ocean', verified: false, order: 4 },
];

function getGradient(colorId) {
  const found = AVATAR_GRADIENTS.find(c => c.id === colorId);
  return (found || AVATAR_GRADIENTS[0]).value;
}

function initials(name) {
  const p = (name || '').trim().split(/[\s\-\.]+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return (name || '??').slice(0, 2).toUpperCase();
}

function VerifiedBadge() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="#3B8BEB" />
      <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TestimonialsSection() {
  const [quotes, setQuotes] = useState(FALLBACK);

  useEffect(() => {
    base44.entities.Testimonial.filter({ visible: true }, 'order', 20)
      .then(items => { if (items && items.length > 0) setQuotes(items); })
      .catch(() => {});
  }, []);

  return (
    <section id="temoignages" style={{ background: BG2, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', margin: '0 0 clamp(32px, 5vw, 56px)', textAlign: 'center' }}>
            Témoignages clients
          </h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {quotes.map((q, i) => {
            const grad = getGradient(q.avatar_color);
            const hasPhoto = !!q.avatar_url;
            return (
              <FadeIn key={i} delay={i * 0.08}>
                <div style={{ padding: '26px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 16, height: '100%' }}>
                  <p style={{ fontSize: 14, color: T1, lineHeight: 1.7, margin: '0 0 20px' }}>"{q.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {hasPhoto ? (
                      <img src={q.avatar_url} alt={q.author_name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials(q.author_name)}</div>
                    )}
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: T1, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {q.author_name}
                        {q.verified && <VerifiedBadge />}
                      </div>
                      <div style={{ fontSize: 11, color: T3 }}>{q.author_role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}