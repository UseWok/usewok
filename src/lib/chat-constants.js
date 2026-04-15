import { Crown, Star, Brain } from 'lucide-react';

// Brand tokens (also in tailwind.config.js as `fg`, `yuzu`, `coral`)
export const FG = '#0A0A0A';
export const YUZU = '#DDFF00';
export const CORAL = '#FF4F00';

export const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

export const ALL_MODES = [
  { id: 'ultimate', label: 'Expert',   icon: Crown, model: 'claude_opus_4_6',  desc: 'Le plus puissant',  requiredPlan: 'expert',    credit_cost: 4, credit_max: 8 },
  { id: 'pro',      label: 'Avancé',   icon: Star,  model: 'gemini_3_1_pro',   desc: 'Analyse avancée',   requiredPlan: 'essential', credit_cost: 2, credit_max: 5 },
  { id: 'thinking', label: 'Standard', icon: Brain, model: 'gpt_5',            desc: 'Mode standard',     requiredPlan: null,        credit_cost: 1, credit_max: 3 },
];

export const CHAR_SPEED = 15;

export const GIBBERISH_RESPONSES = [
  "I don't understand this message — could you rephrase your question more clearly? 😊",
  "This message doesn't tell me anything, but I'm here to help you: ask me your real question!",
  "Hmm, I can't interpret that — try phrasing it differently and I'll do my best."
];

// Filtre ultra-souple : bloque UNIQUEMENT le vrai spam abusé (pas d'espaces, lettres répétées)
export function isGibberish(text) {
  if (!text || text.trim().length === 0) return false;
  
  const clean = text.trim();
  
  // Règle 1 : S'il y a plus de 25 caractères sans AUCUN espace
  if (clean.length > 25 && !clean.includes(' ')) return true;
  
  // Règle 2 : Si c'est juste la même lettre répétée en boucle (ex: "aaaaaaaaaaaaa")
  if (/^(.)\1{10,}$/.test(clean)) return true;
  
  // Pour TOUT le reste, on abaisse la garde et on laisse l'IA gérer !
  return false;
}