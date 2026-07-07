import { useState } from 'react';
import BlogContent from '@/components/blog/BlogContent';
import { Code2, Eye } from 'lucide-react';

const BORDER = 'rgba(255,255,255,0.07)';
const TEXT   = '#E8E6E1';
const TEXT2  = '#8A8580';
const TEXT3  = '#5A5650';
const CORAL  = '#FF5A1F';
const F      = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';

/**
 * Lets the admin paste raw HTML and immediately see the RENDERED result
 * (identical to how it appears on the public blog) rather than the code.
 * Two tabs: "HTML" (edit source) and "Preview" (live render).
 */
export default function HtmlPreviewField({ value, onChange }) {
  const [tab, setTab] = useState('html');

  const TabBtn = ({ id, icon: Icon, label }) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
        fontSize: 12, fontWeight: 600, fontFamily: F, cursor: 'pointer',
        border: 'none', borderRadius: 8, transition: 'all 120ms',
        background: tab === id ? 'rgba(255,90,31,0.12)' : 'transparent',
        color: tab === id ? CORAL : TEXT2,
      }}>
      <Icon size={13} /> {label}
    </button>
  );

  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px', borderBottom: `1px solid ${BORDER}` }}>
        <TabBtn id="html" icon={Code2} label="HTML" />
        <TabBtn id="preview" icon={Eye} label="Preview" />
        <span style={{ marginLeft: 'auto', fontSize: 10.5, color: TEXT3 }}>
          {tab === 'html' ? 'Paste raw HTML — it renders in Preview' : 'Rendered result (as seen on the blog)'}
        </span>
      </div>

      {tab === 'html' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste your HTML here — <h2>Title</h2>, <p>…</p>, <img>, etc."
          spellCheck={false}
          style={{
            width: '100%', minHeight: 320, padding: '16px 18px', border: 'none', outline: 'none',
            background: '#0D0C0A', color: '#E8E6E1', fontFamily: "'SF Mono','Monaco','Menlo','Consolas',monospace",
            fontSize: 13, lineHeight: 1.7, resize: 'vertical', boxSizing: 'border-box',
          }}
        />
      ) : (
        <div style={{ background: '#fff', padding: '24px 26px', minHeight: 320, maxHeight: 560, overflowY: 'auto' }}>
          {value?.trim()
            ? <BlogContent html={value} />
            : <p style={{ color: '#A8A49F', fontSize: 14, fontFamily: F, margin: 0 }}>Nothing to preview yet. Add HTML in the HTML tab.</p>}
        </div>
      )}
    </div>
  );
}