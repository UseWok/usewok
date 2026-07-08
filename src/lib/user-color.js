export const AVATAR_COLORS = [
  { id: 'red', value: '#F95738' },
  { id: 'violet', value: '#7B4FE0' },
  { id: 'blue', value: '#3B8BEB' },
  { id: 'green', value: '#10B981' },
  { id: 'ink', value: '#15130F' },
];

export function getUserColor(user) {
  const found = AVATAR_COLORS.find(c => c.id === user?.avatar_color);
  return (found || AVATAR_COLORS[0]).value; // red is default
}