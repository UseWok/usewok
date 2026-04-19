import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink, Copy, Check, Cpu } from 'lucide-react';
import { useState } from 'react';
import { AGENTS } from '@/components/Sidebar';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const FG = '#0A0A0A';

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

export default function AssistantMessage({ content, agent, meta }) {
  const [copied, setCopied] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const agentLabel = AGENTS.find(a => a.id === agent)?.label || agent || 'Global Agent';
  const sources = extractSources(content);
  const cleanContent = sources.length > 0 ? stripSourceUrls(content) : content;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-1 items-start w-full mb-2">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] font-black" style={{ color: FG }}>Stensor</span>
      </div>
      <div className="w-full break-words"
        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', borderTopLeftRadius: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '14px 16px' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p style={{ margin: '0 0 12px 0', lineHeight: '1.75', fontSize: '14px', color: '#1a1a1a' }}>{children}</p>,
            h1: ({ children }) => <h1 style={{ fontSize: '18px', fontWeight: 800, margin: '20px 0 8px', color: '#0A0A0A' }}>{children}</h1>,
            h2: ({ children }) => <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '18px 0 6px', color: '#0A0A0A' }}>{children}</h2>,
            h3: ({ children }) => <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '16px 0 6px', color: '#0A0A0A' }}>{children}</h3>,
            ul: ({ children }) => <ul style={{ margin: '8px 0 12px', paddingLeft: '20px', listStyleType: 'disc' }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ margin: '8px 0 12px', paddingLeft: '20px', listStyleType: 'decimal' }}>{children}</ol>,
            li: ({ children }) => <li style={{ margin: '4px 0', lineHeight: '1.65', fontSize: '14px', color: '#1a1a1a' }}>{children}</li>,
            strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#0A0A0A' }}>{children}</strong>,
            em: ({ children }) => <em style={{ fontStyle: 'italic', color: '#333' }}>{children}</em>,
            code: ({ inline, children }) => inline
              ? <code style={{ background: 'rgba(0,0,0,0.06)', borderRadius: '4px', padding: '1px 6px', fontSize: '12px', fontFamily: 'monospace', color: '#0A0A0A' }}>{children}</code>
              : <pre style={{ background: '#f4f4f4', borderRadius: '8px', padding: '12px', overflowX: 'auto', margin: '10px 0' }}><code style={{ fontSize: '12px', fontFamily: 'monospace', color: '#1a1a1a' }}>{children}</code></pre>,
            blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #DDFF00', paddingLeft: '12px', margin: '10px 0', color: '#555', fontStyle: 'italic' }}>{children}</blockquote>,
            hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(0,0,0,0.08)', margin: '16px 0' }} />,
            table: ({ children }) => (
              <div style={{ overflowX: 'auto', margin: '12px 0', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead style={{ background: FG }}>{children}</thead>,
            th: ({ children }) => <th style={{ textAlign: 'left', padding: '10px 14px', color: 'white', fontWeight: 700, fontSize: '12px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>{children}</th>,
            td: ({ children }) => <td style={{ padding: '9px 14px', fontSize: '13px', color: '#333', borderBottom: '1px solid rgba(0,0,0,0.06)', borderRight: '1px solid rgba(0,0,0,0.04)' }}>{children}</td>,
            tr: ({ children }) => <tr style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.02)'} onMouseLeave={e => e.currentTarget.style.background=''}>{children}</tr>,
            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'underline' }}>{children}</a>,
          }}>
          {cleanContent}
        </ReactMarkdown>
      </div>

      {/* Action row: copy + model info */}
      <div className="flex items-center gap-1.5 mt-2">
        <button onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-all hover:opacity-70"
          style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '4px', color: '#888', border: '1px solid rgba(0,0,0,0.06)' }}>
          {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        {meta?.modelName && !meta.modelName.toLowerCase().includes('opus') && (
          <div className="flex items-center gap-1 px-2 py-1"
            style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.05)' }}>
            <Cpu className="w-2.5 h-2.5" style={{ color: '#bbb' }} />
            <span className="text-[10px]" style={{ color: '#aaa' }}>{meta.modelName}</span>
          </div>
        )}
        {meta?.usedInternet && (
          <div className="px-2 py-1"
            style={{ background: 'rgba(22,163,74,0.08)', borderRadius: '4px', border: '1px solid rgba(22,163,74,0.2)' }}>
            <span className="text-[10px] font-semibold" style={{ color: '#16a34a' }}>🌐 Web</span>
          </div>
        )}
        {meta?.hasFiles && (
          <div className="px-2 py-1"
            style={{ background: 'rgba(59,130,246,0.08)', borderRadius: '4px', border: '1px solid rgba(59,130,246,0.2)' }}>
            <span className="text-[10px] font-semibold" style={{ color: '#3b82f6' }}>📎 File</span>
          </div>
        )}
      </div>

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
  );
}