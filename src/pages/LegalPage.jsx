import { motion } from 'framer-motion';

const SECTIONS = [
  {
    title: 'Éditeur du site',
    content: `Stensor est édité par Jason Hanch, entrepreneur individuel.
    
Contact : contact@stensor.app`
  },
  {
    title: 'Hébergement',
    content: `L'application Stensor est hébergée par Base44, Inc.
Site : https://base44.com`
  },
  {
    title: 'Données personnelles (RGPD)',
    content: `Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.

Les données collectées (email, historique de conversations) sont utilisées uniquement pour le fonctionnement du service et ne sont jamais vendues à des tiers.

Pour exercer vos droits : contact@stensor.app`
  },
  {
    title: 'Cookies',
    content: `Stensor utilise des cookies de session nécessaires au fonctionnement de l'application. Aucun cookie publicitaire ou de tracking tiers n'est utilisé.`
  },
  {
    title: 'Propriété intellectuelle',
    content: `L'ensemble des contenus présents sur Stensor (textes, logos, illustrations) sont protégés par le droit d'auteur. Toute reproduction sans autorisation est interdite.`
  },
  {
    title: 'Limitation de responsabilité',
    content: `Les conseils fournis par Stensor via son IA sont à titre informatif uniquement et ne constituent pas des conseils financiers professionnels réglementés. Stensor ne peut être tenu responsable de décisions financières prises sur la base de ses suggestions.

Pour des décisions importantes, consultez un conseiller financier agréé.`
  },
  {
    title: 'Droit applicable',
    content: `Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.`
  }
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-fg mb-1">Mentions légales</h1>
          <p className="text-xs text-zinc-400 mb-10">Dernière mise à jour : avril 2026</p>

          <div className="space-y-8">
            {SECTIONS.map((section, i) => (
              <motion.section key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                aria-labelledby={`section-${i}`}>
                <h2 id={`section-${i}`} className="text-sm font-black text-fg mb-2 pb-2 border-b border-black/8">
                  {section.title}
                </h2>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </motion.section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}