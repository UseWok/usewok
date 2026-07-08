import { useState } from 'react';
import DashCard from './DashCard';

const INK = '#15130F';
const INK3 = 'rgba(21,19,15,0.5)';
const GREEN = '#1E7A4C';
const GREEN_PALE = '#EBF6F0';
const CREAM2 = '#F3EEE3';
const F = 'Inter, system-ui, sans-serif';

export default function CitedPagesCard({ pages }) {
  const [tab, setTab] = useState('top');
  const sorted = (pages || []).slice().sort((a, b) =>
    tab === 'top' ? (b.citations || 0) - (a.citations || 0) : (a.citations || 0) - (b.citations || 0));

  return (
    <DashCard title="Your popular pages" dot="#FFCB6B">
      <div style={{ display: 'flex', gap: 3, background: CREAM2, borderRadius: 8, padding: 3, marginBottom: 16 }}>
        {[['top', 'Most viewed'], ['least', 'Least viewed']].map(([k, lbl]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: '6px 11px', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: F,
              fontSize: 11, fontWeight: 700,
              background: tab === k ? '#fff' : 'transparent', color: tab === k ? INK : INK3,
              boxShadow: tab === k ? '0 1px 2px rgba(21,19,15,0.08)' : 'none' }}>
            {lbl}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.6 }}>None of your pages are referenced by AI engines yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sorted.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderTop: i === 0 ? 'none' : '1px solid rgba(21,19,15,0.09)' }}>
              <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12.5, color: INK, textDecoration: 'none', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0, marginRight: 8 }}>{p.url}</a>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: GREEN, background: GREEN_PALE, padding: '3px 9px', borderRadius: 100, flexShrink: 0 }}>{p.citations || 0}×</span>
            </div>
          ))}
        </div>
      )}
    </DashCard>
  );
}