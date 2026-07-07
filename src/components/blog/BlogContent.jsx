import { useEffect, useRef } from 'react';

const INK    = '#1A1A1A';
const INK2   = '#6B6660';
const CORAL  = '#FF5A1F';
const BORDER = 'rgba(21,19,15,0.10)';

/**
 * Renders admin-authored HTML (from the ReactQuill editor) and normalizes any
 * pasted / code-block content into clean, styled code blocks — dark rounded
 * container, no visible tags, monospace, horizontal scroll on overflow.
 *
 * ReactQuill's code-block produces <pre class="ql-syntax">…</pre>. Pasted code
 * may also arrive as <pre> or inline <code>. We tag every <pre> with a class so
 * the CSS below gives it the black rounded treatment, and we make sure the text
 * inside is rendered as text (not interpreted), which is already the case since
 * the editor escapes it on save.
 */
export default function BlogContent({ html }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // Normalize every <pre> block: ensure it wraps a <code> element so styling
    // is consistent whether it came from Quill's code-block or a raw paste.
    root.querySelectorAll('pre').forEach((pre) => {
      pre.classList.add('bc-code');
      if (!pre.querySelector('code')) {
        const code = document.createElement('code');
        code.textContent = pre.textContent;
        pre.textContent = '';
        pre.appendChild(code);
      }
    });

    // External links open in a new tab safely.
    root.querySelectorAll('a[href^="http"]').forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
  }, [html]);

  return (
    <>
      <div ref={ref} className="blog-content" dangerouslySetInnerHTML={{ __html: html || '' }} />
      <style>{`
        .blog-content { font-size: 16.5px; line-height: 1.85; color: #2D2A26; }
        .blog-content p { margin: 0 0 1.3em; }
        .blog-content strong, .blog-content b { font-weight: 700; color: ${INK}; }
        .blog-content em, .blog-content i { font-style: italic; }
        .blog-content h1 { font-size: 1.85rem; font-weight: 800; margin: 2em 0 0.6em; color: ${INK}; letter-spacing: -0.03em; line-height: 1.2; }
        .blog-content h2 { font-size: 1.4rem; font-weight: 700; margin: 1.8em 0 0.5em; color: ${INK}; letter-spacing: -0.02em; line-height: 1.25; }
        .blog-content h3 { font-size: 1.15rem; font-weight: 700; margin: 1.4em 0 0.4em; color: ${INK}; }
        .blog-content ul { list-style: none; padding: 0; margin: 0.5em 0 1.2em; }
        .blog-content ul li { padding-left: 1.4em; position: relative; margin: 0.4em 0; }
        .blog-content ul li::before { content: ''; position: absolute; left: 0; top: 0.65em; width: 6px; height: 6px; border-radius: 50%; background: ${CORAL}; }
        .blog-content ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0 1.2em; }
        .blog-content li { margin: 0.35em 0; }
        .blog-content blockquote { border-left: 3px solid ${CORAL}; padding: 12px 20px; margin: 1.5em 0; color: ${INK2}; font-style: italic; background: rgba(255,90,31,0.04); border-radius: 0 10px 10px 0; }
        .blog-content img { max-width: 100%; border-radius: 14px; margin: 1.5em 0; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: block; }
        .blog-content a { color: ${CORAL}; text-decoration: underline; text-underline-offset: 3px; }
        .blog-content a:hover { opacity: 0.75; }
        .blog-content hr { border: none; border-top: 1px solid ${BORDER}; margin: 2.5em 0; }

        /* ── Inline code ── */
        .blog-content code {
          background: rgba(21,19,15,0.06);
          border-radius: 6px;
          padding: 2px 7px;
          font-size: 0.86em;
          font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
          color: #C43E14;
          word-break: break-word;
        }

        /* ── Code block: black rounded container ── */
        .blog-content pre,
        .blog-content pre.bc-code {
          background: #0D0C0A;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 20px 22px;
          margin: 1.8em 0;
          overflow-x: auto;
          box-shadow: 0 8px 28px rgba(0,0,0,0.14);
          -webkit-overflow-scrolling: touch;
        }
        .blog-content pre code,
        .blog-content pre.bc-code code {
          background: none !important;
          color: #E8E6E1;
          padding: 0;
          font-size: 13.5px;
          line-height: 1.7;
          font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
          white-space: pre;
          display: block;
          word-break: normal;
        }
        .blog-content pre::-webkit-scrollbar { height: 8px; }
        .blog-content pre::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 8px; }
        .blog-content pre::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </>
  );
}