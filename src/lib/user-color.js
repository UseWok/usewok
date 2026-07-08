// Modern gradient presets for the profile avatar — first one (sunset) is default.
export const AVATAR_GRADIENTS = [
  { id: 'sunset', value: 'linear-gradient(135deg, #FF9152 0%, #F95738 55%, #C81E4A 100%)' },
  { id: 'violet', value: 'linear-gradient(135deg, #A78BFA 0%, #7B4FE0 60%, #4C1D95 100%)' },
  { id: 'ocean',  value: 'linear-gradient(135deg, #67E8F9 0%, #3B8BEB 60%, #1E3A8A 100%)' },
  { id: 'mint',   value: 'linear-gradient(135deg, #6EE7B7 0%, #10B981 60%, #065F46 100%)' },
  { id: 'ink',    value: 'linear-gradient(135deg, #4B4B52 0%, #15130F 100%)' },
];

export function getUserColor(user) {
  const found = AVATAR_GRADIENTS.find(c => c.id === user?.avatar_color);
  return (found || AVATAR_GRADIENTS[0]).value; // sunset gradient is default
}