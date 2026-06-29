/**
 * SEO Configuration — pages publiques uniquement (pré-connexion)
 * Modifiez ici le titre et la description de chaque page.
 */
export const SEO_CONFIG = {
  '/': {
    title: 'Apparaître dans les réponses de ChatGPT, Gemini & co — même sans budget marketing | UseWok',
    description: "Vous n'apparaissez nulle part quand un client demande à une IA de recommander un pro ? UseWok vous montre exactement quoi corriger, étape par étape, sur 8 intelligences artificielles. Score, audit, plan d'action concret. Zéro jargon, zéro équipe marketing nécessaire.",
  },
  '/tarifs': {
    title: 'Pricing | UseWok - AI Visibility & GEO Platform',
    description: 'Start free. Paid plans from $49/month. Track AI search visibility, citations, crawler logs, and visitor analytics.',
  },
  '/blog': {
    title: 'AI Visibility Insights Blog | UseWok',
    description: "Optimize your brand's presence in AI-generated search results with actionable strategies and expert insights. Learn how to monitor, analyze, and improve your visibility in ChatGPT, Perplexity, Claude, Gemini and other AI platforms to drive customer engagement and gain competitive advantage.",
  },
  '/privacy': {
    title: 'Politique de confidentialité | UseWok',
    description: "Découvrez comment UseWok protège vos données personnelles. Conformité RGPD, hébergement européen, droit à l'effacement — une politique transparente pour les indépendants et PME.",
  },
  '/terms': {
    title: "Conditions Générales d'Utilisation | UseWok",
    description: "Lisez les CGU de UseWok, l'outil français de visibilité IA. Abonnements, données personnelles, résiliation — tout ce que vous devez savoir avant d'utiliser le service.",
  },
  '/legal': {
    title: 'Mentions légales | UseWok',
    description: 'Mentions légales de UseWok — éditeur, hébergeur IONOS, responsable de la publication et informations légales obligatoires.',
  },
};

/** Fallback pour les routes non listées (ex: /p/:id) */
export const SEO_DEFAULT = {
  title: 'Apparaître dans les réponses de ChatGPT, Gemini & co — même sans budget marketing | UseWok',
  description: "Vous n'apparaissez nulle part quand un client demande à une IA de recommander un pro ? UseWok vous montre exactement quoi corriger, étape par étape, sur 8 intelligences artificielles. Score, audit, plan d'action concret. Zéro jargon, zéro équipe marketing nécessaire.",
};