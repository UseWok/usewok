import { Zap, Brain, Star, Crown } from 'lucide-react';

export const ALL_MODES = [
  { id: 'ultimate', labelKey: 'mode_ultimate', descKey: 'mode_ultimate_desc', icon: Crown, model: 'claude_opus_4_6', label: 'Expert',   desc: 'Le plus puissant',  requiredPlan: 'expert',    credit_cost: 4, credit_max: 8 },
  { id: 'pro',      labelKey: 'mode_pro',      descKey: 'mode_pro_desc',      icon: Star,  model: 'gemini_3_1_pro',  label: 'Avancé',   desc: 'Analyse avancée',   requiredPlan: 'essential', credit_cost: 2, credit_max: 5 },
  { id: 'thinking', labelKey: 'mode_thinking', descKey: 'mode_thinking_desc', icon: Brain, model: 'gpt_5',           label: 'Standard', desc: 'Mode standard',     requiredPlan: null,        credit_cost: 2, credit_max: 3 },
  { id: 'fast',     labelKey: 'mode_fast',     descKey: 'mode_fast_desc',     icon: Zap,   model: 'gemini_3_flash',  label: 'Rapide',   desc: 'Mode rapide',       requiredPlan: null,        credit_cost: 1, credit_max: 1 },
];

export function getModeLabel(modeId, t) {
  const mode = ALL_MODES.find(m => m.id === modeId);
  if (!mode) return modeId;
  return t ? t(mode.labelKey) : (mode.label || mode.labelKey);
}