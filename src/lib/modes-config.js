import { Zap, Brain, Star, Crown } from 'lucide-react';

export const ALL_MODES = [
  { id: 'fast', labelKey: 'mode_fast', descKey: 'mode_fast_desc', icon: Zap, model: 'gemini_3_flash' },
  { id: 'thinking', labelKey: 'mode_thinking', descKey: 'mode_thinking_desc', icon: Brain, model: 'gemini_3_1_pro' },
  { id: 'pro', labelKey: 'mode_pro', descKey: 'mode_pro_desc', icon: Star, model: 'gemini_3_1_pro' },
  { id: 'ultimate', labelKey: 'mode_ultimate', descKey: 'mode_ultimate_desc', icon: Crown, model: 'claude_opus_4_6' },
];

export function getModeLabel(modeId, t) {
  const mode = ALL_MODES.find(m => m.id === modeId);
  if (!mode) return modeId;
  return t ? t(mode.labelKey) : mode.labelKey;
}