import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import FadeIn from '@/components/landing/FadeIn';
import { AVATAR_GRADIENTS } from '@/lib/user-color';
import { LinkedinIcon, TrustpilotIcon } from '@/components/landing/LandingTestimonials';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG2 = '#111113';
const T1 = '#F0F0EE';
const T3 = 'rgba(255,255,255,0.3)';
const BORDER = 'rgba(255,255,255,0.07)';

const FALLBACK = [
  { author_name: 'Sofiane B.', author_role: 'Post at Stensor', text: "franchement j'étais sceptique au début, mais j'ai suivi le plan sans rien comprendre à l'IA, et en genre 10 jours mon score avait déjà bougé, ChatGPT me cite maintenant sur des recherches locales", avatar_color: 'mint', linkedin_url: '', trustpilot_url: '', order: 0 },
  { author_name: 'Amel K.', author_role: 'Founder of Dh-hd', text: "super simple à utiliser, j'ai pas d'équipe marketing donc ça tombait bien, résultat visible en à peine 2 semaines sans prise de tête", avatar_color: 'violet', linkedin_url: '', trustpilot_url: '', order: 1 },
  { author_name: 'Moussa D.', author_role: 'Founder of Varileo', text: "je m'attendais à un truc compliqué mais non, j'ai juste coché les étapes une par une, ma visibilité sur les IA a clairement augmenté en quelques semaines", avatar_color: 'ink', linkedin_url: '', trustpilot_url: '', order: 2 },
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
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: T1 }}>{q.author_name}</div>
                      <div style={{ fontSize: 11, color: T3 }}>{q.author_role}</div>
                    </div>
                    {q.linkedin_url && (
                      <a href={q.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, color: 'rgba(255,255,255,0.3)', transition: 'color 150ms', flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#0A66C2'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                        <LinkedinIcon size={15} />
                      </a>
                    )}
                    {q.trustpilot_url && (
                      <a href={q.trustpilot_url} target="_blank" rel="noopener noreferrer" title="Trustpilot"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, color: 'rgba(255,255,255,0.3)', transition: 'color 150ms', flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#00B67A'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                        <TrustpilotIcon size={15} />
                      </a>
                    )}
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