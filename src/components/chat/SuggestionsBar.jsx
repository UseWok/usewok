// Suggestion chips shown above the input bar — horizontal scroll, clipped left, blur right
const SUGGESTIONS = ['Add 3D Model Viewer', 'Interactive Part Highlighting', 'Build Customizable Options', 'Dark mode toggle', 'Animated hero section', 'Sales dashboard'];

export default function SuggestionsBar({ setInput }) {
  return (
    <div className="flex-shrink-0 bg-white" style={{ paddingTop: 10, paddingBottom: 8 }}>
      <div style={{ position: 'relative' }}>
        {/* Blur fade on the right */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 40,
          background: 'linear-gradient(to right, transparent, white)',
          zIndex: 2, pointerEvents: 'none',
        }} />
        {/* Horizontal scroll — chips overflow cut hard on the left at px-4 boundary */}
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', overflowY: 'hidden',
          paddingLeft: 16, paddingRight: 48,
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          whiteSpace: 'nowrap',
        }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              style={{
                flexShrink: 0,
                fontSize: 12, color: '#555555', background: '#F8F8F8',
                border: '1px solid #E8E8E8', borderRadius: 999,
                padding: '6px 12px', cursor: 'pointer', lineHeight: 1.4,
                transition: 'all 150ms'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F0F0'; e.currentTarget.style.borderColor = '#D0D0D0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F8F8F8'; e.currentTarget.style.borderColor = '#E8E8E8'; }}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}