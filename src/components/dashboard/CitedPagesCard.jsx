import { useState } from 'react';
import DashCard from './DashCard';

const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const GREEN = '#22A87A';
const F = 'Inter, system-ui, sans-serif';

export default function CitedPagesCard({ pages }) {
  const [tab, setTab] = useState('top');
  const sorted = (pages || []).slice().sort((a, b) =>
    tab === 'top' ? (b.citations || 0) - (a.citations || 0) : (a.citations || 0) - (b.citations || 0));

  return (
    <DashCard title="Pages cited by AI" dot={GREEN}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: -40, marginBottom: 14 }}>
        <div style={{ display: 'inline-flex', background: '#F5F3EF', borderRadius: 8, padding: 3 }}>
          {[['top', 'MOST CITED'], ['least', 'LEAST CITED']].map(([k, lbl]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ padding: '5px 11px', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: F,
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
                background: tab === k ? '#fff' : 'transparent', color: tab === k ? INK : INK3,
                boxShadow: tab === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.6 }}>No page cited by AI engines yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sorted.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 8px', borderRadius: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: INK3, width: 12, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.url}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: GREEN, background: 'rgba(34,168,122,0.12)', borderRadius: 999, padding: '3px 9px', flexShrink: 0 }}>{p.citations || 0}×</span>
            </div>
          ))}
        </div>
      )}
    </DashCard>
  );
}