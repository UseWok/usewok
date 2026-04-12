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
  "Je ne comprends pas ce message — pourriez-vous reformuler votre question de façon plus claire ? 😊",
  "Ce message ne me dit rien, mais je suis là pour vous aider : posez-moi votre vraie question !",
  "Hmm, je n'arrive pas à interpréter ça — essayez de formuler autrement et je ferai de mon mieux.",
];

export function isGibberish(text) {
  const t = text.trim();
  if (t.length === 0) return false;
  const letters = t.toLowerCase().replace(/[^a-záàâäéèêëíìîïóòôöúùûü]/g, '');
  if (letters.length === 0) return false;
  if (letters.length < 2) return true;
  const vowels = (letters.match(/[aeiouáàâäéèêëíìîïóòôöúùûü]/g) || []).length;
  const vowelRatio = vowels / letters.length;
  const parts = letters.split(/[aeiouáàâäéèêëíìîïóòôöúùûü]/);
  const maxRun = Math.max(...parts.map(s => s.length));
  if (letters.length >= 4 && vowelRatio < 0.05) return true;
  if (maxRun >= 5) return true;
  if (/^(.{1,3})\1{3,}$/.test(letters)) return true;
  return false;
}