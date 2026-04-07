import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LANG_KEY = 'stensor_lang';

export const TRANSLATIONS = {
  en: {
    // Nav
    home: 'Home', parcours: 'Learning Path', community: 'Community', administration: 'Administration',
    upgrade: 'Upgrade', tensors: 'Tensors', notifications: 'Notifications',
    // Hero
    hero_title: 'Your AI Financial Coach', hero_subtitle: 'Available 24/7 · Confidential · Faster than a human advisor',
    hero_badge: 'STENSOR — FINANCE AI', hero_placeholder: 'Ask your financial question… (@ for agents)',
    hero_start: 'Get Started →', hero_topics: 'Popular topics',
    topics: ['Budget & Expenses', 'Investment', 'Savings', 'Retirement', 'Tax Planning'],
    // Modes
    mode_fast: 'Fast', mode_thinking: 'Standard', mode_pro: 'Advanced', mode_ultimate: 'Expert',
    mode_fast_desc: 'Quick & efficient', mode_thinking_desc: 'Deep reasoning', mode_pro_desc: 'Advanced analysis', mode_ultimate_desc: 'Most powerful',
    // Agents
    global_agent: 'Global Agent', emotions_agent: 'Emotions & Expenses', wealth_agent: 'Wealth Strategy',
    // Chat
    send_message: 'Message… (@ for agents & modes)',
    tensors_used: '{used}/{total} tensors used', attach_file: 'Attach a file', agent: 'Agent', mode: 'Mode',
    internet: 'Internet', thinking: 'Processing…',
    // Upsell
    tensors_exhausted: 'Tensors exhausted this month',
    tensors_low: 'Running low on tensors',
    upgrade_to_continue: 'Upgrade to continue',
    free_delay_msg: '⏳ Free plan — Paid plans respond instantly',
    upgrade_banner_title: 'Switch to Advanced',
    upgrade_banner_sub: 'Unlock all modes and AI agents',
    velvet_wall: 'You\'ve used all {limit} tensors this month. Switch to {plan} for {credits} tensors and Internet search →',
    truncated_msg: 'Full response available with the Advanced plan.',
    see_more: 'See full response →',
    pro_comparison: '✨ With Advanced mode, this response would be 3× more detailed.',
    milestone_msg: '🎉 You love Stensor! {count} conversations done. Advanced gives you Internet search + exclusive lessons.',
    daily_limit_msg: 'Daily tensors used 🕐 Resets in {hours}h — or upgrade to {plan} for unlimited daily usage.',
    // Pricing
    pricing_title: 'Your AI Financial Coach, 24/7',
    pricing_sub: '1 tensor = 1 AI response · Renewed monthly · Cancel anytime',
    monthly: 'Monthly', yearly: 'Yearly -20%',
    recommended: 'RECOMMENDED', current_plan: '✓ Current plan',
    free_cta: 'Start for free', choose_plan: 'Choose {name}',
    secure_payment: 'Secure payment · Cancel anytime · Instant access',
    // Sidebar
    put_level_up: 'Level Up', more_tensors: 'Get more tensors',
    tensors_label: 'Tensors', low_tensors_warning: 'Only {remaining} tensors left!',
    feature_preview: 'Unlockable Features',
    locked_feature: '🔒 {plan}',
    // Admin
    administration_title: 'Administration', manage_platform: 'Manage your Stensor platform',
    plans_tab: 'Plans', agents_tab: 'AI Agents', notifs_tab: 'Notifications', users_tab: 'Users',
    your_plan: 'YOUR PLAN', activate_test: 'Activate (test)',
    // Discussions
    recent_discussions: 'Recent Discussions', see_all: 'See all',
    no_discussions: 'No discussions found', search_placeholder: 'Search…',
    // Parcours
    learning_path: 'Your Learning Path', learning_sub: 'Master Stensor to maximize your financial results',
    locked: 'Locked', completed: 'Completed', in_progress: 'In Progress', available: 'Available',
    upgrade_to_unlock: 'Upgrade to unlock',
    // Notifications
    no_notifications: 'No notifications',
  },
  fr: {
    home: 'Accueil', parcours: 'Parcours', community: 'Communauté', administration: 'Administration',
    upgrade: 'Mettre à niveau', tensors: 'Tensors', notifications: 'Notifications',
    hero_title: 'Votre coach financier IA', hero_subtitle: 'Disponible 24h/24 · Confidentiel · Plus rapide qu\'un conseiller humain',
    hero_badge: 'STENSOR — FINANCE IA', hero_placeholder: 'Posez votre question financière… (@ pour agents)',
    hero_start: 'Commencer →', hero_topics: 'Sujets populaires',
    topics: ['Budget & Dépenses', 'Investissement', 'Épargne', 'Retraite', 'Fiscalité'],
    mode_fast: 'Fast', mode_thinking: 'Standard', mode_pro: 'Avancé', mode_ultimate: 'Expert',
    mode_fast_desc: 'Rapide & efficace', mode_thinking_desc: 'Réflexion profonde', mode_pro_desc: 'Analyse avancée', mode_ultimate_desc: 'Le plus puissant',
    global_agent: 'Agent Global', emotions_agent: 'Émotions & Dépenses', wealth_agent: 'Stratégie Patrimoine',
    send_message: 'Message… (@ pour agents & modes)',
    tensors_used: '{used}/{total} tensors utilisés', attach_file: 'Joindre un fichier', agent: 'Agent', mode: 'Mode',
    internet: 'Internet', thinking: 'Réflexion en cours…',
    tensors_exhausted: 'Tensors épuisés ce mois', tensors_low: 'Tensors presque épuisés',
    upgrade_to_continue: 'Passer à niveau pour continuer',
    free_delay_msg: '⏳ Plan Free — Les plans payants répondent instantanément',
    upgrade_banner_title: 'Passer à Advanced', upgrade_banner_sub: 'Débloquez tous les modes et agents IA',
    velvet_wall: 'Vous avez utilisé vos {limit} tensors ce mois. Passez à {plan} pour {credits} tensors et la recherche Internet →',
    truncated_msg: 'La réponse complète est disponible avec le plan Advanced.',
    see_more: 'Voir la suite →',
    pro_comparison: '✨ Avec le mode Avancé, cette réponse aurait été 3× plus détaillée.',
    milestone_msg: '🎉 Vous adorez Stensor ! {count} conversations. Avec Advanced, accédez à la recherche Internet et aux leçons exclusives.',
    daily_limit_msg: 'Tensors du jour épuisés 🕐 Reset dans {hours}h — ou passez à {plan} sans quota journalier.',
    pricing_title: 'Votre coach financier IA, 24h/24',
    pricing_sub: '1 tensor = 1 réponse IA · Renouvelé chaque mois · Annulation à tout moment',
    monthly: 'Mensuel', yearly: 'Annuel -20%',
    recommended: 'RECOMMANDÉ', current_plan: '✓ Plan actuel',
    free_cta: 'Commencer gratuitement', choose_plan: 'Choisir {name}',
    secure_payment: 'Paiement sécurisé · Annulation à tout moment · Accès immédiat',
    put_level_up: 'Mettre à niveau', more_tensors: 'Plus de tensors',
    tensors_label: 'Tensors', low_tensors_warning: 'Il reste {remaining} tensors !',
    feature_preview: 'Fonctionnalités débloquables', locked_feature: '🔒 {plan}',
    administration_title: 'Administration', manage_platform: 'Gérez votre plateforme Stensor',
    plans_tab: 'Plans', agents_tab: 'Agents IA', notifs_tab: 'Notifications', users_tab: 'Utilisateurs',
    your_plan: 'VOTRE PLAN', activate_test: 'Activer (test)',
    recent_discussions: 'Discussions récentes', see_all: 'Voir tout',
    no_discussions: 'Aucune discussion trouvée', search_placeholder: 'Rechercher…',
    learning_path: 'Votre Parcours', learning_sub: 'Maîtrisez Stensor pour maximiser vos résultats financiers',
    locked: 'Verrouillé', completed: 'Complété', in_progress: 'En cours', available: 'Disponible',
    upgrade_to_unlock: 'Mettre à niveau pour débloquer',
    no_notifications: 'Aucune notification',
  },
  es: {
    home: 'Inicio', parcours: 'Ruta', community: 'Comunidad', administration: 'Administración',
    upgrade: 'Mejorar plan', tensors: 'Tensores', notifications: 'Notificaciones',
    hero_title: 'Tu coach financiero IA', hero_subtitle: 'Disponible 24/7 · Confidencial · Más rápido que un asesor humano',
    hero_badge: 'STENSOR — FINANZAS IA', hero_placeholder: 'Haz tu pregunta financiera… (@ para agentes)',
    hero_start: 'Comenzar →', hero_topics: 'Temas populares',
    topics: ['Presupuesto', 'Inversión', 'Ahorro', 'Jubilación', 'Impuestos'],
    mode_fast: 'Rápido', mode_thinking: 'Estándar', mode_pro: 'Avanzado', mode_ultimate: 'Experto',
    mode_fast_desc: 'Rápido y eficiente', mode_thinking_desc: 'Razonamiento profundo', mode_pro_desc: 'Análisis avanzado', mode_ultimate_desc: 'El más potente',
    global_agent: 'Agente Global', emotions_agent: 'Emociones & Gastos', wealth_agent: 'Estrategia Patrimonial',
    send_message: 'Mensaje… (@ para agentes y modos)',
    tensors_used: '{used}/{total} tensores usados', attach_file: 'Adjuntar archivo', agent: 'Agente', mode: 'Modo',
    internet: 'Internet', thinking: 'Procesando…',
    tensors_exhausted: 'Tensores agotados este mes', tensors_low: 'Pocos tensores restantes',
    upgrade_to_continue: 'Mejorar para continuar',
    free_delay_msg: '⏳ Plan Gratis — Los planes de pago responden al instante',
    upgrade_banner_title: 'Pasar a Advanced', upgrade_banner_sub: 'Desbloquea todos los modos y agentes IA',
    velvet_wall: 'Has usado tus {limit} tensores este mes. Pasa a {plan} para {credits} tensores y búsqueda en Internet →',
    truncated_msg: 'Respuesta completa disponible con el plan Advanced.',
    see_more: 'Ver respuesta completa →',
    pro_comparison: '✨ Con el modo Avanzado, esta respuesta sería 3× más detallada.',
    milestone_msg: '🎉 ¡Te encanta Stensor! {count} conversaciones. Con Advanced, accede a búsqueda en tiempo real y lecciones exclusivas.',
    daily_limit_msg: 'Tensores del día agotados 🕐 Reset en {hours}h — o mejora a {plan} sin límite diario.',
    pricing_title: 'Tu coach financiero IA, 24/7',
    pricing_sub: '1 tensor = 1 respuesta IA · Renovación mensual · Cancela cuando quieras',
    monthly: 'Mensual', yearly: 'Anual -20%',
    recommended: 'RECOMENDADO', current_plan: '✓ Plan actual',
    free_cta: 'Empezar gratis', choose_plan: 'Elegir {name}',
    secure_payment: 'Pago seguro · Cancela cuando quieras · Acceso inmediato',
    put_level_up: 'Mejorar', more_tensors: 'Más tensores',
    tensors_label: 'Tensores', low_tensors_warning: '¡Solo quedan {remaining} tensores!',
    feature_preview: 'Funciones desbloqueables', locked_feature: '🔒 {plan}',
    administration_title: 'Administración', manage_platform: 'Gestiona tu plataforma Stensor',
    plans_tab: 'Planes', agents_tab: 'Agentes IA', notifs_tab: 'Notificaciones', users_tab: 'Usuarios',
    your_plan: 'TU PLAN', activate_test: 'Activar (prueba)',
    recent_discussions: 'Discusiones recientes', see_all: 'Ver todo',
    no_discussions: 'No se encontraron discusiones', search_placeholder: 'Buscar…',
    learning_path: 'Tu Ruta de Aprendizaje', learning_sub: 'Domina Stensor para maximizar tus resultados financieros',
    locked: 'Bloqueado', completed: 'Completado', in_progress: 'En progreso', available: 'Disponible',
    upgrade_to_unlock: 'Mejorar para desbloquear',
    no_notifications: 'Sin notificaciones',
  },
  pt: {
    home: 'Início', parcours: 'Percurso', community: 'Comunidade', administration: 'Administração',
    upgrade: 'Melhorar', tensors: 'Tensores', notifications: 'Notificações',
    hero_title: 'Seu coach financeiro IA', hero_subtitle: 'Disponível 24/7 · Confidencial · Mais rápido que um consultor humano',
    hero_badge: 'STENSOR — FINANÇAS IA', hero_placeholder: 'Faça sua pergunta financeira… (@ para agentes)',
    hero_start: 'Começar →', hero_topics: 'Tópicos populares',
    topics: ['Orçamento', 'Investimento', 'Poupança', 'Aposentadoria', 'Impostos'],
    mode_fast: 'Rápido', mode_thinking: 'Padrão', mode_pro: 'Avançado', mode_ultimate: 'Especialista',
    mode_fast_desc: 'Rápido e eficiente', mode_thinking_desc: 'Raciocínio profundo', mode_pro_desc: 'Análise avançada', mode_ultimate_desc: 'O mais poderoso',
    global_agent: 'Agente Global', emotions_agent: 'Emoções & Despesas', wealth_agent: 'Estratégia Patrimonial',
    send_message: 'Mensagem… (@ para agentes & modos)',
    tensors_used: '{used}/{total} tensores usados', attach_file: 'Anexar arquivo', agent: 'Agente', mode: 'Modo',
    internet: 'Internet', thinking: 'Processando…',
    tensors_exhausted: 'Tensores esgotados este mês', tensors_low: 'Poucos tensores restantes',
    upgrade_to_continue: 'Melhorar para continuar',
    free_delay_msg: '⏳ Plano Free — Planos pagos respondem instantaneamente',
    upgrade_banner_title: 'Passar para Advanced', upgrade_banner_sub: 'Desbloqueie todos os modos e agentes IA',
    velvet_wall: 'Você usou todos os {limit} tensores deste mês. Passe para {plan} para {credits} tensores e busca na Internet →',
    truncated_msg: 'Resposta completa disponível com o plano Advanced.',
    see_more: 'Ver resposta completa →',
    pro_comparison: '✨ Com o modo Avançado, esta resposta seria 3× mais detalhada.',
    milestone_msg: '🎉 Você ama o Stensor! {count} conversas. Com Advanced, acesse busca em tempo real e lições exclusivas.',
    daily_limit_msg: 'Tensores do dia esgotados 🕐 Reset em {hours}h — ou melhore para {plan} sem limite diário.',
    pricing_title: 'Seu coach financeiro IA, 24/7',
    pricing_sub: '1 tensor = 1 resposta IA · Renovação mensal · Cancele quando quiser',
    monthly: 'Mensal', yearly: 'Anual -20%',
    recommended: 'RECOMENDADO', current_plan: '✓ Plano atual',
    free_cta: 'Começar grátis', choose_plan: 'Escolher {name}',
    secure_payment: 'Pagamento seguro · Cancele quando quiser · Acesso imediato',
    put_level_up: 'Melhorar', more_tensors: 'Mais tensores',
    tensors_label: 'Tensores', low_tensors_warning: 'Só restam {remaining} tensores!',
    feature_preview: 'Recursos desbloqueáveis', locked_feature: '🔒 {plan}',
    administration_title: 'Administração', manage_platform: 'Gerencie sua plataforma Stensor',
    plans_tab: 'Planos', agents_tab: 'Agentes IA', notifs_tab: 'Notificações', users_tab: 'Usuários',
    your_plan: 'SEU PLANO', activate_test: 'Ativar (teste)',
    recent_discussions: 'Discussões recentes', see_all: 'Ver tudo',
    no_discussions: 'Nenhuma discussão encontrada', search_placeholder: 'Pesquisar…',
    learning_path: 'Seu Percurso', learning_sub: 'Domine o Stensor para maximizar seus resultados financeiros',
    locked: 'Bloqueado', completed: 'Concluído', in_progress: 'Em andamento', available: 'Disponível',
    upgrade_to_unlock: 'Melhorar para desbloquear',
    no_notifications: 'Sem notificações',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem(LANG_KEY) || 'en');

  const setLang = (newLang) => {
    localStorage.setItem(LANG_KEY, newLang);
    setLangState(newLang);
  };

  const t = useCallback((key, vars = {}) => {
    const tr = TRANSLATIONS[lang] || TRANSLATIONS.en;
    let str = tr[key] ?? TRANSLATIONS.en[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{${k}}`, v); });
    return str;
  }, [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) return {
    lang: 'en',
    setLang: () => {},
    t: (key) => TRANSLATIONS.en[key] ?? key,
  };
  return ctx;
}