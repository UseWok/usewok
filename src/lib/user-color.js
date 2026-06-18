const PALETTE = [
  '#7B4FE0', '#7B4FE0', '#7B4FE0', '#7B4FE0',
  '#7B4FE0', '#7B4FE0', '#7B4FE0', '#7B4FE0',
  '#7B4FE0', '#7B4FE0',
];

export function getUserColor(user) {
  const str = user?.id || user?.email || 'default';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}