export default function SkeletonBlock({ w = '100%', h = 16, r = 6, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #F3F4F6 25%, #E9EAEC 50%, #F3F4F6 75%)',
      backgroundSize: '400% 100%',
      animation: 'skshimmer 1.4s ease-in-out infinite',
      flexShrink: 0,
      ...style,
    }} />
  );
}

// Inject animation once globally
const styleTag = document.getElementById('sk-shimmer-style');
if (!styleTag) {
  const s = document.createElement('style');
  s.id = 'sk-shimmer-style';
  s.textContent = `@keyframes skshimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }`;
  document.head.appendChild(s);
}