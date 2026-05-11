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

import { useState, useEffect } from 'react';
const CHAR_SPEED = 20;
export default function AssistantMessage({ content, agent, meta, onClick, discussMode }) {
  const [typedContent, setTypedContent] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (currentIdx < content.length) {
      const timeout = setTimeout(() => {
        setTypedContent((prev) => prev + content[currentIdx]);
        setCurrentIdx((prev) => prev + 1);
      }, CHAR_SPEED);
      return () => clearTimeout(timeout);
    }
  }, [content, currentIdx]);
  return (
    // items-start aligns the avatar to the top
    <div className="flex justify-start items-start gap-2.5 group w-full mb-3">
      
      <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 bg-slate-800 mt-1">
        S
      </div>
      <div className="relative flex flex-col w-full max-w-[85%]">
        <div className="flex items-center justify-between pl-1 mb-1 relative">
          <span className="text-[11px] font-bold text-slate-800">Stensor</span>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-gray-400 hover:text-gray-800 rounded-md transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 font-open">
                  <button onClick={() => { navigator.clipboard.writeText(content); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Copy message
                  </button>
                  <button className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Copy message link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div onClick={onClick} className="bg-white border border-gray-100 rounded-[12px] p-3 text-sm leading-relaxed text-slate-700 font-normal cursor-pointer">
          <p className="whitespace-pre-wrap break-words">{typedContent}</p>
        </div>
      </div>
    </div>
  );
}