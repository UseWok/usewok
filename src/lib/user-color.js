// Modern 2-color fluid gradient presets — each with a different angle/flow.
// First one is default. No letters or logos — just the gradient itself.
export const AVATAR_GRADIENTS = [
  { id: 'sunset',   value: 'linear-gradient(135deg, #FF9152 0%, #F95738 100%)' },
  { id: 'violet',   value: 'linear-gradient(225deg, #A78BFA 0%, #7B4FE0 100%)' },
  { id: 'ocean',    value: 'linear-gradient(180deg, #67E8F9 0%, #3B8BEB 100%)' },
  { id: 'mint',     value: 'linear-gradient(315deg, #6EE7B7 0%, #10B981 100%)' },
  { id: 'ink',      value: 'linear-gradient(90deg,  #6B6B72 0%, #15130F 100%)' },
];

export function getUserColor(user) {
  const found = AVATAR_GRADIENTS.find(c => c.id === user?.avatar_color);
  return (found || AVATAR_GRADIENTS[0]).value; // sunset gradient is default
}