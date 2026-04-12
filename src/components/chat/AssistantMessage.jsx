import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink, Bot, MoreHorizontal } from 'lucide-react';
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
  const [showAgent, setShowAgent] = useState(false);
  const agentLabel = AGENTS.find(a => a.id === agent)?.label || agent || 'Global Agent';
  const sources = extractSources(content);
  const cleanContent = sources.length > 0 ? stripSourceUrls(content) : content;

  return (
    <div className="flex flex-col gap-1 items-start w-full max-w-[95%] sm:max-w-[82%] mb-2 overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2">
        <img src={LOGO_URL} alt="Stensor" className="w-4 h-4 object-contain flex-shrink-0" style={{ opacity: 0.9 }} />
        <span className="text-[11px] font-black" style={{ color: FG }}>Stensor</span>
      </div>
      <div className="text-sm leading-7 px-4 py-3"
        style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', borderTopLeftRadius: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:my-2 prose-li:my-0.5"
          components={{
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 rounded-lg border border-black/10 shadow-sm">
                <table className="w-full border-collapse text-xs">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead style={{ background: FG }}>{children}</thead>,
            th: ({ children }) => (
              <th className="text-left px-4 py-3 text-white font-bold text-xs tracking-wide whitespace-nowrap"
                style={{ borderRight: '1px solid rgba(255,255,255,0.1)' }}>{children}</th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-2.5 text-xs"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', borderRight: '1px solid rgba(0,0,0,0.04)', color: '#333' }}>{children}</td>
            ),
            tr: ({ children, ...props }) => (
              <tr className="transition-colors hover:bg-black/[0.02]">{children}</tr>
            ),
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 font-medium underline hover:opacity-75 transition-opacity">
                {children}
              </a>
            ),
          }}>
          {cleanContent}
        </ReactMarkdown>
      </div>

      {/* Info button */}
      <div className="flex items-center gap-2 mt-2">
        <button onClick={() => setShowAgent(s => !s)}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-all"
          style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '4px', color: '#888', border: '1px solid rgba(0,0,0,0.06)' }}>
          <MoreHorizontal className="w-3 h-3" />
        </button>
        {showAgent && (
          <div className="flex items-center flex-wrap gap-1.5">
            <div className="flex items-center gap-1 px-2 py-1"
              style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <Bot className="w-3 h-3" style={{ color: '#888' }} />
              <span className="text-[10px] font-semibold" style={{ color: '#555' }}>{agentLabel}</span>
            </div>
            {meta?.modeName && (
              <div className="flex items-center gap-1 px-2 py-1"
                style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="text-[10px] font-semibold" style={{ color: '#555' }}>Mode: {meta.modeName}</span>
              </div>
            )}
            {meta?.modelName && (
              <div className="px-2 py-1"
                style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <span className="text-[10px]" style={{ color: '#888' }}>{meta.modelName}</span>
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
                <span className="text-[10px] font-semibold" style={{ color: '#3b82f6' }}>📎 File read</span>
              </div>
            )}
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