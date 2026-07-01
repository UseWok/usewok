import FadeIn from '@/components/landing/FadeIn';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG2 = '#111113';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.55)';
const T3 = 'rgba(255,255,255,0.3)';
const BORDER = 'rgba(255,255,255,0.07)';

const QUOTES = [
  { emoji: '🍽️', name: 'Sofiane B.', role: 'Gérant restaurant, Marseille', quote: "franchement j'étais sceptique au début, mais j'ai suivi le plan sans rien comprendre à l'IA, et en genre 10 jours mon score avait déjà bougé, ChatGPT me cite maintenant sur des recherches locales" },
  { emoji: '🏋️', name: 'Amel K.', role: 'Coach sportive freelance, Lyon', quote: "super simple à utiliser, j'ai pas d'équipe marketing donc ça tombait bien, résultat visible en à peine 2 semaines sans prise de tête" },
  { emoji: '🔌', name: 'Moussa D.', role: 'Artisan électricien, Paris', quote: "je m'attendais à un truc compliqué mais non, j'ai juste coché les étapes une par une, ma visibilité sur les IA a clairement augmenté en quelques semaines" },
  { emoji: '💼', name: 'Julien P.', role: 'Consultant indépendant, Nantes', quote: "outil hyper simple, aucune connaissance technique demandée, en une dizaine de jours j'ai vu un vrai changement sur mes scores IA" },
  { emoji: '🛋️', name: 'Camille R.', role: 'Gérante boutique déco, Bordeaux', quote: "j'ai testé sans trop y croire, mais le plan d'action est tellement simple à suivre que j'ai vu des résultats en 2 semaines, aucune prise de tête" },
];

export default function TestimonialsSection() {
  return (
    <section id="temoignages" style={{ background: BG2, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', margin: '0 0 clamp(32px, 5vw, 56px)', textAlign: 'center' }}>
            Témoignages clients
          </h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {QUOTES.map((q, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{ padding: '26px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: 16, height: '100%' }}>
                <p style={{ fontSize: 14, color: T1, lineHeight: 1.7, margin: '0 0 20px' }}>"{q.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{q.emoji}</div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: T1 }}>{q.name}</div>
                    <div style={{ fontSize: 11, color: T3 }}>{q.role}</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}