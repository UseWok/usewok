import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink, Copy, Check, Cpu } from 'lucide-react';
import { useState } from 'react';
import { AGENTS } from '@/components/Sidebar';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const FG = '#0A0A0A';
const YUZU = '#DDFF00';

function extractSources(content) {
  const mdLinks = [...content.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g)].map(m => ({ label: m[1], url: m[2] }));
  const seen = new Set(mdLinks.map(l => l.url));
  const rawUrls = [...content.matchAll(/(?<!\()(https?:\/\/[^\s\)\]"'>,]+)/g)]
    .map(m => m[1])
    .filter(url => !seen.has(url) && url.length > 20 && !url.endsWith('.'));
  rawUrls.forEach(url => { seen.add(url); mdLinks.push({ label: new URL(url).hostname.replace('www.', ''), url }); });
  return mdLinks.slice(0, 6);
}

function stripSourceUrls(content) {
  return content
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '$1')
    .replace(/(?<!\()(https?:\/\/[^\s\)\]"'>,]+)/g, '');
}

export default function AssistantMessage({ content, agent, meta, onClick, discussMode }) {
  const [copied, setCopied] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const agentLabel = AGENTS.find(a => a.id === agent)?.label || agent || 'Global Agent';
  const sources = extractSources(content);
  // Clean markdown artifacts and format headings
  const cleanContent = content
    .replace(/%###%/g, '')
    .replace(/^###\s+/gm, '**')
    .replace(/\s+###$/gm, '**')
    .replace(/###/g, '**');

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setShowCopy(false);
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <div className="flex gap-3 items-start w-full mb-2">
      <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain flex-shrink-0 mt-1" style={{ opacity: 0.75 }} />
      <div className="flex flex-col gap-1 flex-1 min-w-0">
      <span className="text-[11px] font-light" style={{ color: 'rgba(0,0,0,0.35)' }}>Stensor</span>
      <div className="w-full break-words rounded-lg cursor-pointer transition-colors hover:bg-black/[0.025]"
        style={{ padding: '8px 10px', margin: '-8px -10px' }}
        onClick={() => { setShowCopy(true); setTimeout(() => setShowCopy(false), 5000); if (onClick) onClick(); }}>
        <div style={{ maxHeight: discussMode ? 'none' : '160px', overflow: discussMode ? 'visible' : 'hidden', position: 'relative' }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p style={{ margin: '0 0 12px 0', lineHeight: '1.75', fontSize: '13px', color: '#333', fontWeight: 300 }}>{children}</p>,
              h1: ({ children }) => <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '20px 0 8px', color: '#0A0A0A' }}>{children}</h1>,
              h2: ({ children }) => <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '18px 0 6px', color: '#0A0A0A' }}>{children}</h2>,
              h3: ({ children }) => <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '16px 0 6px', color: '#0A0A0A' }}>{children}</h3>,
              ul: ({ children }) => <ul style={{ margin: '8px 0 12px', paddingLeft: '20px', listStyleType: 'disc' }}>{children}</ul>,
              ol: ({ children }) => <ol style={{ margin: '8px 0 12px', paddingLeft: '20px', listStyleType: 'decimal' }}>{children}</ol>,
              li: ({ children }) => <li style={{ margin: '4px 0', lineHeight: '1.65', fontSize: '15px', color: '#1a1a1a' }}>{children}</li>,
              strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#0A0A0A' }}>{children}</strong>,
              em: ({ children }) => <em style={{ fontStyle: 'italic', color: '#333' }}>{children}</em>,
              code: ({ inline, children }) => inline
                ? <code style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '4px', padding: '1px 6px', fontSize: '13px', fontFamily: 'monospace', color: '#0A0A0A' }}>{children}</code>
                : <pre style={{ background: '#f4f4f4', borderRadius: '8px', padding: '12px', overflowX: 'auto', margin: '10px 0' }}><code style={{ fontSize: '13px', fontFamily: 'monospace', color: '#1a1a1a' }}>{children}</code></pre>,
              blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #DDFF00', paddingLeft: '12px', margin: '10px 0', color: '#555', fontStyle: 'italic' }}>{children}</blockquote>,
              hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)', margin: '16px 0' }} />,
              table: ({ children }) => (
                <div style={{ overflowX: 'auto', margin: '12px 0', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead style={{ background: FG }}>{children}</thead>,
              th: ({ children }) => <th style={{ textAlign: 'left', padding: '10px 14px', color: 'white', fontWeight: 700, fontSize: '13px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>{children}</th>,
              td: ({ children }) => <td style={{ padding: '9px 14px', fontSize: '14px', color: '#333', borderBottom: '1px solid rgba(0,0,0,0.06)', borderRight: '1px solid rgba(0,0,0,0.04)' }}>{children}</td>,
              tr: ({ children }) => <tr style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.02)'} onMouseLeave={e => e.currentTarget.style.background=''}>{children}</tr>,
              a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'underline' }}>{children}</a>,
            }}>
            {cleanContent}
          </ReactMarkdown>
          {!discussMode && content && content.length > 600 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(transparent, white)', pointerEvents: 'none' }} />
          )}
        </div>

        {/* Copy button - appears on click, disappears after 5s */}
        {(showCopy || copied) && (
          <div className="flex items-center gap-1.5 mt-2">
            <button onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-all"
              style={{ background: copied ? 'rgba(22,163,74,0.1)' : 'rgba(0,0,0,0.04)', borderRadius: '4px', color: copied ? '#16a34a' : '#888', border: '1px solid rgba(0,0,0,0.06)' }}>
              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        )}


        {sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1 max-w-full">
            {sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-all hover:opacity-80"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', color: '#555', maxWidth: '180px' }}>
                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#888' }} />
                <span className="truncate">{s.label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}