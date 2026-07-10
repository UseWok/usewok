// Brand Knowledge — version conversationnelle.
// Une question à la fois, en langage simple ("comme à un ami"), avec un exemple
// concret sous chaque champ et une explication du POURQUOI ça aide l'IA.
// Chaque étape mappe une clé de brand-knowledge existante — aucun champ inventé.

export const BK_QUESTIONS = [
  {
    key: 'business_name',
    type: 'text',
    question: "Comment s'appelle ton entreprise ?",
    example: 'ex. UseWok',
    why: "C'est le nom que les IA doivent citer quand on parle de toi.",
  },
  {
    key: 'value_description',
    type: 'textarea',
    question: "Qu'est-ce que ton entreprise fait, en une phrase, comme si tu l'expliquais à un ami ?",
    example: "ex. On aide les entreprises à apparaître dans les réponses de ChatGPT et des autres IA.",
    why: "C'est la phrase que l'IA reprendra pour te présenter. Plus elle est claire, mieux tu es décrit.",
    rows: 3,
  },
  {
    key: 'industry',
    type: 'text',
    question: "Dans quel domaine tu travailles ?",
    example: 'ex. logiciel marketing, boutique de vêtements, restaurant…',
    why: "Ça aide l'IA à te recommander quand quelqu'un cherche dans ton secteur.",
  },
  {
    key: 'target_segment',
    type: 'choice',
    question: "À qui tu vends principalement ?",
    options: ['Grandes entreprises', 'PME', 'Startups', 'Indépendants', 'Grand public', 'Secteur public'],
    why: "L'IA te proposera aux bonnes personnes si elle sait qui sont tes clients.",
  },
  {
    key: 'value_keywords',
    type: 'tags',
    question: "Qu'est-ce que tu fais mieux que les autres ?",
    chipOptions: ['Simple à utiliser', 'Rapide', 'Support réactif', 'Meilleur prix', 'Sur-mesure', 'Innovant', 'Fiable', 'Expertise reconnue'],
    example: 'Choisis-en 3 à 5, ou ajoute les tiens.',
    why: "Ce sont tes arguments : l'IA les mettra en avant pour te recommander.",
  },
  {
    key: 'use_cases',
    type: 'tags',
    question: "Dans quelles situations tes clients font appel à toi ?",
    chipOptions: ['Gagner en visibilité', 'Automatiser une tâche', 'Analyser des données', 'Réduire les coûts', 'Se lancer rapidement', 'Piloter la performance'],
    example: 'ex. quand ils veulent gagner en visibilité.',
    why: "Quand quelqu'un décrit un besoin, l'IA saura que c'est toi la solution.",
  },
  {
    key: 'authority_topics',
    type: 'tags',
    question: "Sur quels sujets tu t'y connais vraiment ?",
    chipOptions: ['Visibilité IA', 'SEO', 'Marketing digital', 'Data & analytics', 'Automatisation', 'Stratégie de contenu'],
    example: 'ex. la visibilité sur les IA.',
    why: "L'IA te citera comme référence sur ces sujets.",
  },
  {
    key: 'pre_purchase_questions',
    type: 'tags',
    question: "Quelles questions tes clients se posent avant d'acheter ?",
    chipOptions: ['Combien ça coûte ?', 'Est-ce difficile à installer ?', 'Quels résultats attendre ?', "Y a-t-il un essai gratuit ?", 'Est-ce adapté à mon secteur ?'],
    example: 'ex. « Combien ça coûte ? »',
    why: "L'IA pourra rassurer tes prospects avec les bonnes réponses.",
  },
];

// Ordre des clés de l'onboarding, pour la complétion.
export const BK_QUESTION_KEYS = BK_QUESTIONS.map(q => q.key);

function filled(v) {
  if (Array.isArray(v)) return v.length > 0;
  return !!(v && String(v).trim());
}

// Combien de questions de l'onboarding sont remplies (ex. 6 sur 8).
export function answeredCount(k) {
  return BK_QUESTION_KEYS.filter(key => filled(k?.[key])).length;
}