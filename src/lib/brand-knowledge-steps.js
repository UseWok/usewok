// Brand Knowledge — configuration des sections.
// Ton professionnel B2B, sans émoji. Chaque champ propose des réponses pré-faites
// à sélectionner (chips) pour minimiser la saisie.

export const BK_SECTIONS = [
  {
    id: 'identity',
    title: 'Identité',
    intro: "Les informations de base sur votre entreprise.",
    fields: [
      { key: 'business_name', type: 'text', label: "Nom de l'entreprise", placeholder: 'ex. UseWok' },
      { key: 'industry',      type: 'text', label: 'Secteur d\'activité', placeholder: 'ex. logiciel marketing' },
      { key: 'site_url',      type: 'text', label: 'Site web', placeholder: 'usewok.com' },
      { key: 'headquarters',  type: 'text', label: 'Siège / localisation', placeholder: 'ex. Paris, France' },
    ],
  },
  {
    id: 'market',
    title: 'Marché cible',
    intro: 'À qui vous vous adressez.',
    fields: [
      {
        key: 'business_model', type: 'choice', label: 'Modèle économique',
        options: ['B2B', 'B2C', 'B2B2C', 'Marketplace'],
      },
      {
        key: 'target_segment', type: 'choice', label: 'Type de clients',
        options: ['Grandes entreprises', 'PME', 'Startups', 'Indépendants', 'Grand public', 'Secteur public'],
      },
      {
        key: 'scope', type: 'choice', label: 'Zone de vente',
        options: ['Local', 'Régional', 'National', 'Continental', 'Mondial'],
      },
      { key: 'audience', type: 'textarea', label: 'Décrivez votre client type (optionnel)', placeholder: 'ex. dirigeants de PME cherchant plus de visibilité…', rows: 3 },
    ],
  },
  {
    id: 'value',
    title: 'Proposition de valeur',
    intro: 'Ce qui vous distingue de la concurrence.',
    fields: [
      { key: 'value_description', type: 'textarea', label: 'En une phrase, que faites-vous de mieux ?', placeholder: 'ex. nous aidons les entreprises à apparaître dans les réponses de ChatGPT…', rows: 3 },
      {
        key: 'value_keywords', type: 'tags', label: 'Vos points forts (max 5)',
        chipOptions: ['Simple à utiliser', 'Rapide', 'Support réactif', 'Meilleur prix', 'Sur-mesure', 'Innovant', 'Fiable', 'Expertise reconnue'],
      },
    ],
  },
  {
    id: 'use_cases',
    title: "Cas d'usage",
    intro: 'Les situations concrètes où vos clients font appel à vous.',
    fields: [
      {
        key: 'use_cases', type: 'tags', label: "Cas d'usage courants (max 5)",
        chipOptions: ['Gagner en visibilité', 'Automatiser une tâche', 'Analyser des données', 'Réduire les coûts', 'Se lancer rapidement', 'Piloter la performance'],
      },
    ],
  },
  {
    id: 'authority',
    title: 'Expertise',
    intro: 'Les sujets sur lesquels vous faites autorité.',
    fields: [
      {
        key: 'authority_topics', type: 'tags', label: "Vos domaines d'expertise (max 5)",
        chipOptions: ['Visibilité IA', 'SEO', 'Marketing digital', 'Data & analytics', 'Automatisation', 'Stratégie de contenu'],
      },
    ],
  },
  {
    id: 'questions',
    title: 'Questions clients',
    intro: 'Ce que vos prospects se demandent avant d\'acheter.',
    fields: [
      {
        key: 'pre_purchase_questions', type: 'tags', label: 'Questions fréquentes (max 5)',
        chipOptions: ['Combien ça coûte ?', 'Est-ce difficile à installer ?', 'Quels résultats attendre ?', 'Y a-t-il un essai gratuit ?', 'Est-ce adapté à mon secteur ?'],
      },
    ],
  },
  {
    id: 'objections',
    title: 'Objections',
    intro: 'Les freins que vous levez habituellement.',
    fields: [
      {
        key: 'objections', type: 'tags', label: 'Hésitations fréquentes (max 5)',
        chipOptions: ['Trop cher', 'Trop compliqué', 'Manque de temps', 'Pas sûr du résultat', 'Déjà un autre outil'],
      },
    ],
  },
  {
    id: 'avoid',
    title: 'À éviter (optionnel)',
    intro: "Les sujets auxquels vous préférez ne pas être associé.",
    fields: [
      {
        key: 'avoid_topics', type: 'tags', label: 'Sujets à éviter (optionnel)',
        chipOptions: ['Sujets politiques', 'Concurrents nommés', 'Promesses irréalistes', 'Sujets sensibles'],
      },
    ],
  },
];

// Compat : ancien nom encore importé ailleurs.
export const BK_STEPS = BK_SECTIONS;

// Toutes les clés qui comptent pour la complétion.
export const BK_COMPLETION_KEYS = [
  'business_name', 'industry', 'site_url', 'headquarters',
  'business_model', 'target_segment', 'scope',
  'value_description', 'value_keywords',
  'use_cases', 'authority_topics', 'pre_purchase_questions', 'objections',
  // avoid_topics et audience sont optionnels — non comptés
];

function filled(v) {
  if (Array.isArray(v)) return v.length > 0;
  return !!(v && String(v).trim());
}

// % de complétion sur les champs utiles (0–100).
export function completionPercent(k) {
  const total = BK_COMPLETION_KEYS.length;
  const done = BK_COMPLETION_KEYS.filter(key => filled(k?.[key])).length;
  return Math.round((done / total) * 100);
}

// Une section est-elle "complète" ? (tous ses champs non optionnels remplis)
export function isStepComplete(section, k) {
  if (!section || !Array.isArray(section.fields)) return false;
  const optional = ['avoid_topics', 'audience'];
  const keys = section.fields.map(f => f.key).filter(key => !optional.includes(key));
  if (keys.length === 0) return true;
  return keys.every(key => filled(k?.[key]));
}

// Libellé selon le taux de complétion.
export function completionMessage(pct) {
  if (pct >= 100) return "Profil complet — l'IA vous connaît parfaitement.";
  if (pct >= 75)  return "Presque terminé. Plus c'est complet, plus les réponses IA sont précises.";
  if (pct >= 40)  return "Bonne progression. Chaque détail aide l'IA à vous recommander.";
  return "À compléter. Plus vous ajoutez d'informations, mieux l'IA parle de vous.";
}