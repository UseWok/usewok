import { useState } from 'react';
import LogsPanel from '@/components/chat/LogsPanel';

// ── Dark palette ──
const DK = {
  bg: '#0F0F0F',
  surface: '#171717',
  surface2: '#1E1E1E',
  border: '#2A2A2A',
  text: '#E0DDD8',
  muted: '#666',
  faint: '#252525',
  active: '#2563EB',
};

// ── Syntax token colors ──
const TOKEN = {
  keyword:   '#CF8E6D',
  string:    '#6AAB73',
  comment:   '#7A7E85',
  tag:       '#E8BF6A',
  attr:      '#9876AA',
  number:    '#6897BB',
  punct:     '#CCCCCC',
  plain:     '#BCBEC4',
};

function tokenizeLine(line) {
  // Very lightweight tokenizer: keywords, strings, jsx tags, comments
  const tokens = [];

  // Comment
  if (/^\s*\/\//.test(line)) {
    tokens.push({ color: TOKEN.comment, text: line });
    return tokens;
  }

  let remaining = line;
  const push = (color, text) => { if (text) tokens.push({ color, text }); };

  // Walk through the line character by character via regex splits
  const pattern = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?[A-Za-z][A-Za-z0-9.]*)|(\b(?:const|let|var|function|return|import|export|default|from|if|else|for|while|class|extends|new|this|typeof|async|await|true|false|null|undefined|=>)\b)|(\b\d+\.?\d*\b)/g;

  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(remaining)) !== null) {
    const pre = remaining.slice(lastIndex, match.index);
    if (pre) push(TOKEN.plain, pre);

    if (match[1]) push(TOKEN.comment, match[1]);
    else if (match[2]) push(TOKEN.string, match[2]);
    else if (match[3]) push(TOKEN.tag, match[3]);
    else if (match[4]) push(TOKEN.keyword, match[4]);
    else if (match[5]) push(TOKEN.number, match[5]);

    lastIndex = match.index + match[0].length;
  }
  const tail = remaining.slice(lastIndex);
  if (tail) push(TOKEN.plain, tail);

  return tokens;
}

function CodeView({ content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: DK.muted, fontSize: 13 }}>
        No code generated yet.
      </div>
    );
  }

  const lines = content.split('\n');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: `1px solid ${DK.border}`,
        background: DK.surface, flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, color: DK.muted, fontFamily: 'ui-monospace, monospace' }}>App.jsx</span>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 6,
            background: copied ? 'rgba(34,197,94,0.12)' : DK.surface2,
            border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : DK.border}`,
            color: copied ? '#22C55E' : DK.muted,
            fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            transition: 'all 150ms',
          }}
        >
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          )}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code area */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'auto',
        background: DK.bg, padding: '16px 0',
        fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace',
        fontSize: 12.5, lineHeight: '1.7',
      }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 'max-content' }}>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} style={{ transition: 'background 80ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Line number */}
                <td style={{
                  width: 48, paddingRight: 16, paddingLeft: 16,
                  textAlign: 'right', color: '#444', userSelect: 'none',
                  verticalAlign: 'top', whiteSpace: 'nowrap',
                  fontSize: 11,
                }}>{i + 1}</td>
                {/* Code */}
                <td style={{ paddingRight: 24, verticalAlign: 'top', whiteSpace: 'pre' }}>
                  {line === '' ? <span>&nbsp;</span> : tokenizeLine(line).map((tok, j) => (
                    <span key={j} style={{ color: tok.color }}>{tok.text}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MorePanel({ content }) {
  const [tab, setTab] = useState('logs');

  const TABS = [
    { id: 'logs', label: 'Logs' },
    { id: 'code', label: 'Code' },
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: DK.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2,
        padding: '10px 16px 0',
        borderBottom: `1px solid ${DK.border}`,
        background: DK.surface, flexShrink: 0,
      }}>
        {TABS.map(({ id, label }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: '7px 16px',
                border: 'none', background: 'transparent',
                fontSize: 13, fontWeight: active ? 600 : 400,
                color: active ? DK.text : DK.muted,
                cursor: 'pointer', position: 'relative',
                borderBottom: active ? `2px solid ${DK.active}` : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 120ms, border-color 120ms',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#aaa'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = DK.muted; }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'logs' && <LogsPanel />}
        {tab === 'code' && <CodeView content={content} />}
      </div>
    </div>
  );
}