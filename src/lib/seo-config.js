/**
 * SEO Configuration — pages publiques uniquement (pré-connexion)
 * Modifiez ici le titre et la description de chaque page.
 */
export const SEO_CONFIG = {
  '/': {
    title: 'Apparaître dans les réponses de ChatGPT, Gemini & co — même sans budget marketing | UseWok',
    description: "UseWok — Agence SEO & Visibilité IA : apparaissez dans les réponses des assistants (ChatGPT, Gemini) grâce à l'AEO, JSON-LD optimisé, contenus stratégiques.",
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
    description: 'Découvrez comment UseWok protège vos données et respecte votre vie privée.',
  },
  '/terms': {
    title: "Conditions d'utilisation | UseWok",
    description: "Découvrez les règles d'utilisation de UseWok. Consultez nos conditions d'utilisation transparentes pour comprendre comment nous opérons.",
  },
  '/legal': {
    title: 'Mentions légales | UseWok',
    description: 'Mentions légales de UseWok — éditeur, hébergeur IONOS, responsable de la publication et informations légales obligatoires.',
  },
};

/** Fallback pour les routes non listées (ex: /p/:id) */
export const SEO_DEFAULT = {
  title: 'Apparaître dans les réponses de ChatGPT, Gemini & co — même sans budget marketing | UseWok',
  description: "UseWok — Agence SEO & Visibilité IA : apparaissez dans les réponses des assistants (ChatGPT, Gemini) grâce à l'AEO, JSON-LD optimisé, contenus stratégiques.",
};