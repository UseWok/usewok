/**
 * SEO Configuration — pages publiques uniquement (pré-connexion)
 * Modifiez ici le titre et la description de chaque page.
 */
export const SEO_CONFIG = {
  '/': {
    title: 'AI-powered personal finance & goal coach.',
  description: 'Stensor is an AI personal finance coach that turns financial confusion into real-time, step-by-step action plans. Equip your autonomous agent with 1,000+ custom AI skills to optimize debt and visualize your exact progress. Always know your next move to hit your financial goals—without rigid budgets or sacrificing your daily pleasures.',
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
  title: 'AI-powered personal finance & goal coach.',
  description: 'Stensor is an AI personal finance coach that turns financial confusion into real-time, step-by-step action plans. Equip your autonomous agent with 1,000+ custom AI skills to optimize debt and visualize your exact progress. Always know your next move to hit your financial goals—without rigid budgets or sacrificing your daily pleasures.',
};