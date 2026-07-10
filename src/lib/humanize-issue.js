// Turns technical scan issues into plain, non-scary human language.
// Used by the "action du jour" card on the dashboard.

// Ordered rules: first match wins. Each rule detects a technical pattern in the
// raw issue text and returns a friendly title + reassuring explanation, plus
// whether a 1-click auto-fix is available.
const RULES = [
  {
    match: /robots\.txt|disallow|bloqu|crawl.*block|block.*crawl|noindex/i,
    title: "Les robots des IA n'ont pas le droit de visiter ton site",
    explain: "C'est probablement une erreur de configuration — on peut la corriger en 1 clic pour que ChatGPT et Gemini puissent enfin te lire.",
    autoFix: true,
  },
  {
    match: /json-?ld|schema|structured data|softwareapplication|organization schema|microdata/i,
    title: "Aide les IA à comprendre automatiquement ce que fait ton site",
    explain: "Les IA lisent ta page mais ne savent pas résumer ton activité. On ajoute une petite fiche d'identité invisible qui leur explique tout.",
    autoFix: true,
  },
  {
    match: /meta ?desc|description manquante|missing description/i,
    title: "Ta page d'accueil n'a pas de description",
    explain: "Sans elle, Google et les IA voient une page sans contexte. On rédige une phrase claire qui dit qui tu es et ce que tu fais.",
    autoFix: true,
  },
  {
    match: /about|à propos|qui.sommes/i,
    title: "Les IA ne savent pas qui se cache derrière ton site",
    explain: "Une page « À propos » rassure les IA et leur donne les infos pour te recommander en confiance.",
    autoFix: false,
  },
  {
    match: /faq/i,
    title: "Tes réponses aux questions clients ne sont pas mises en avant",
    explain: "En structurant tes questions/réponses, les IA affichent TES réponses plutôt que celles de tes concurrents.",
    autoFix: false,
  },
  {
    match: /sitemap/i,
    title: "Les IA n'ont pas la carte de ton site",
    explain: "Un plan de site aide les IA à trouver toutes tes pages. On peut le générer automatiquement.",
    autoFix: true,
  },
  {
    match: /title|balise titre|h1/i,
    title: "Le titre de ta page n'est pas assez clair pour les IA",
    explain: "Un titre précis aide les IA à comprendre ta page en un coup d'œil. On le reformule pour toi.",
    autoFix: true,
  },
];

/**
 * Humanize a raw issue.
 * @param {object|string} issue — a scan issue ({problem, impact, page} or plain string)
 * @returns {{ title, explain, autoFix, page, raw }}
 */
export function humanizeIssue(issue) {
  const raw = typeof issue === 'string' ? issue : (issue?.problem || issue?.title || '');
  const page = typeof issue === 'object' ? (issue?.page || '') : '';
  const rule = RULES.find(r => r.match.test(raw));
  if (rule) {
    return { title: rule.title, explain: rule.explain, autoFix: rule.autoFix, page, raw };
  }
  // Fallback: use the original text but keep it action-oriented.
  return {
    title: raw || "Améliore ta visibilité auprès des IA",
    explain: "Un petit ajustement sur ton site pour que les IA te comprennent mieux et te recommandent plus souvent.",
    autoFix: false,
    page,
    raw,
  };
}