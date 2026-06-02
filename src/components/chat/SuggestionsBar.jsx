// Suggestion chips shown above the input bar
const SUGGESTIONS = ['Add 3D Model Viewer', 'Interactive Part Highlighting', 'Build Customizable Options'];

export default function SuggestionsBar({ setInput }) {
  return (
    <div className="flex-shrink-0 px-4 py-3 bg-white">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <svg width="13" height="14" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span style={{ fontSize: 12, color: '#999999', fontWeight: 500 }}>Suggestions</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setInput(s)}
            style={{
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
  );
}