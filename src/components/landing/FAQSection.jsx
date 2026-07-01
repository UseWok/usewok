import { useState } from 'react';
import FadeIn from '@/components/landing/FadeIn';

const F = "'Inter', -apple-system, system-ui, sans-serif";
const BG = '#0A0A0B';
const T1 = '#F0F0EE';
const T2 = 'rgba(255,255,255,0.55)';
const BORDER = 'rgba(255,255,255,0.07)';

const FAQ = [
  { q: 'Dois-je être expert en IA ou en marketing pour utiliser UseWok ?', a: "Non. C'est exactement l'objectif de UseWok : multiplier facilement votre visibilité IA, sans expertise technique ni équipe marketing. Vous suivez le plan d'action fourni, UseWok s'occupe du reste." },
  { q: 'Pourquoi les IA comme ChatGPT ne recommandent pas mon entreprise ?', a: "Les moteurs IA ne fonctionnent pas comme Google. Ils synthétisent des informations publiques, structurées et cohérentes sur votre activité. Si vos données sont absentes, incomplètes ou contradictoires sur le web, l'IA recommande le concurrent qui, lui, a des données complètes." },
  { q: 'Qu\'est-ce que le Score de Visibilité IA ?', a: "C'est votre score sur 100, calculé à partir de l'analyse de 8 moteurs IA : ChatGPT, Gemini, Claude, Perplexity, Grok, Mistral, Copilot et Llama." },
  { q: "Mon entreprise n'a pas d'équipe marketing, UseWok me convient-il ?", a: "Oui, c'est le cœur de cible : les entreprises digitales qui ont les moyens d'investir mais pas ceux de monter une équipe marketing en interne. Pas de jargon, un plan d'action clair et actionnable dès la première connexion." },
  { q: "Comment fonctionne l'essai gratuit ?", a: "Vous démarrez gratuitement, sans carte bancaire, avec votre premier score de visibilité. Pour aller plus loin (audit complet, plan d'action, assistant IA), vous avez 7 jours d'essai gratuit sur les plans Starter et Pro avant d'être facturé." },
  { q: 'Je gère plusieurs sites, UseWok peut-il tous les suivre ?', a: "Oui, le plan Pro permet de suivre jusqu'à 10 sites en simultané, chacun avec son propre score et son propre plan d'action." },
  { q: 'UseWok remplace-t-il le SEO classique ?', a: "Non, c'est complémentaire. Le SEO optimise votre place dans les résultats Google. UseWok optimise votre présence dans les réponses générées par les IA — un canal de découverte distinct, en forte croissance." },
  { q: 'UseWok est-il conforme au RGPD ?', a: "Oui, solution française, données hébergées en Europe." },
];

function FAQItem({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 4px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F }}>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: T1 }}>{item.q}</span>
        <span style={{ fontSize: 18, color: T2, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 150ms' }}>+</span>
      </button>
      {open && (
        <p style={{ fontSize: 13.5, color: T2, lineHeight: 1.75, margin: '0 4px 20px', maxWidth: 680 }}>{item.a}</p>
      )}
    </div>
  );
}

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section id="faq" style={{ background: BG, borderTop: `1px solid ${BORDER}`, padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 120px)', fontFamily: F }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <FadeIn>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 800, color: T1, letterSpacing: '-0.04em', margin: '0 0 clamp(32px, 5vw, 48px)', textAlign: 'center' }}>
            FAQ
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div>
            {FAQ.map((item, i) => (
              <FAQItem key={i} item={item} open={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}