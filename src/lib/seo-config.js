/**
 * SEO Configuration — pages publiques uniquement (pré-connexion)
 * Modifiez ici le titre et la description de chaque page.
 */
export const SEO_CONFIG = {
  '/': {
    title: 'Stensor — Your AI Financial Coach',
    description: 'Get clear answers on savings, investing, debt, and wealth building. Your personal AI financial coach, available 24/7.',
  },
  '/tarifs': {
    title: 'Stensor — Pricing & Plans',
    description: 'Choose the plan that fits your financial goals. From free to expert-level AI coaching.',
  },
  '/fonctionnalites': {
    title: 'Stensor — Features',
    description: 'Discover all the features of Stensor: deep financial analysis, smart projections, and personalized coaching.',
  },
  '/privacy': {
    title: 'Stensor — Privacy Policy',
    description: 'Read our privacy policy and learn how we protect your data.',
  },
  '/terms': {
    title: 'Stensor — Terms of Service',
    description: 'Read the terms of service for using Stensor.',
  },
};

/** Fallback pour les routes non listées (ex: /p/:id) */
export const SEO_DEFAULT = {
  title: 'Stensor — Your AI Financial Coach',
  description: 'Get clear answers on savings, investing, debt, and wealth building.',
};