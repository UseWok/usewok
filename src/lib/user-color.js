const PALETTE = [
  '#3A0088', '#FF4F00', '#0066CC', '#16a34a',
  '#7C3AED', '#DB2777', '#0891B2', '#D97706',
  '#059669', '#DC2626',
];

export function getUserColor(user) {
  const str = user?.id || user?.email || 'default';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}