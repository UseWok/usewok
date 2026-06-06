/**
 * VisualEditorToolbar — context-aware floating toolbar for visual editing.
 * Appears when an element is selected in the preview iframe.
 * Dark theme, minimal, strictly the tools listed in the spec.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Sparkles, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

// ── AI edit mini-prompt ──
function AIPromptInput({ onSubmit, onClose }) {
  const [val, setVal] = useState('');
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#1A1A1A', borderRadius: 8, border: '1px solid #333', minWidth: 260 }}>
      <input
        ref={ref}
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && val.trim()) onSubmit(val); if (e.key === 'Escape') onClose(); }}
        placeholder="Describe the change…"
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#fff', fontFamily: 'Inter, sans-serif' }}
        className="placeholder:text-[#444]"
      />
      <button onClick={() => val.trim() && onSubmit(val)}
        style={{ padding: '4px 10px', borderRadius: 6, background: '#fff', border: 'none', fontSize: 12, fontWeight: 700, color: '#000', cursor: 'pointer' }}>
        Apply
      </button>
    </div>
  );
}

// ── Text content editor ──
function ContentInput({ value, onChange, onClose }) {
  const [val, setVal] = useState(value || '');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#1A1A1A', borderRadius: 8, border: '1px solid #333', minWidth: 260 }}>
      <input
        autoFocus
        value={val}
        onChange={e => { setVal(e.target.value); onChange(e.target.value); }}
        onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
        placeholder="Edit text content…"
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#fff', fontFamily: 'Inter, sans-serif' }}
        className="placeholder:text-[#444]"
      />
      <button onClick={onClose}
        style={{ width: 22, height: 22, borderRadius: 5, background: 'transparent', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X style={{ width: 11, height: 11 }} />
      </button>
    </div>
  );
}

// ── Typography options ──
function TypoPanel({ onApply, onClose }) {
  const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];
  const weights = [{ label: 'Regular', val: '400' }, { label: 'Medium', val: '500' }, { label: 'Bold', val: '700' }, { label: 'Black', val: '900' }];
  const decorations = [{ label: 'U', style: 'underline' }, { label: 'S', style: 'line-through' }];

  return (
    <div style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 10, padding: '12px 14px', minWidth: 220, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Size</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {sizes.map(s => (
            <button key={s} onClick={() => onApply('size', s)}
              style={{ padding: '3px 8px', borderRadius: 5, background: '#1E1E1E', border: '1px solid #2A2A2A', fontSize: 11, color: '#aaa', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E1E1E'; e.currentTarget.style.color = '#aaa'; }}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weight</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {weights.map(w => (
            <button key={w.val} onClick={() => onApply('weight', w.val)}
              style={{ padding: '3px 8px', borderRadius: 5, background: '#1E1E1E', border: '1px solid #2A2A2A', fontSize: 11, color: '#aaa', cursor: 'pointer', fontWeight: w.val, fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E1E1E'; e.currentTarget.style.color = '#aaa'; }}>
              {w.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Decoration</span>
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {decorations.map(d => (
            <button key={d.style} onClick={() => onApply('decoration', d.style)}
              style={{ padding: '3px 10px', borderRadius: 5, background: '#1E1E1E', border: '1px solid #2A2A2A', fontSize: 12, color: '#aaa', cursor: 'pointer', textDecoration: d.style }}
              onMouseEnter={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E1E1E'; e.currentTarget.style.color = '#aaa'; }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alignment</span>
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {[
            { icon: AlignLeft, val: 'left' },
            { icon: AlignCenter, val: 'center' },
            { icon: AlignRight, val: 'right' },
          ].map(({ icon: Icon, val }) => (
            <button key={val} onClick={() => onApply('align', val)}
              style={{ width: 30, height: 30, borderRadius: 6, background: '#1E1E1E', border: '1px solid #2A2A2A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#333'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E1E1E'; e.currentTarget.style.color = '#888'; }}>
              <Icon style={{ width: 12, height: 12 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Opacity slider ──
function OpacityPanel({ onApply }) {
  const [val, setVal] = useState(100);
  return (
    <div style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 10, padding: '12px 14px', minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Opacity</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <input type="range" min={0} max={100} value={val}
          onChange={e => { setVal(+e.target.value); onApply(+e.target.value / 100); }}
          style={{ flex: 1, accentColor: '#fff' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', minWidth: 32, textAlign: 'right' }}>{val}%</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Toolbar
// ─────────────────────────────────────────
export default function VisualEditorToolbar({
  selectedElement, // { tag, text, isTextNode, rect }
  onAIEdit,
  onContentChange,
  onStyleChange,
  onDelete,
  onClose, // also triggers version save
}) {
  const [openPanel, setOpenPanel] = useState(null); // 'ai' | 'content' | 'typo' | 'opacity'

  const togglePanel = (id) => setOpenPanel(p => p === id ? null : id);

  const isText = selectedElement?.isTextNode ||
    ['h1','h2','h3','h4','h5','h6','p','span','a','li','label','button'].includes(selectedElement?.tag?.toLowerCase());

  const btnStyle = (active) => ({
    width: 30, height: 30, borderRadius: 7,
    background: active ? '#2A2A2A' : 'transparent',
    border: active ? '1px solid #444' : '1px solid transparent',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: active ? '#fff' : '#888', transition: 'all 100ms', flexShrink: 0,
  });

  const divider = <div style={{ width: 1, height: 18, background: '#2A2A2A', flexShrink: 0 }} />;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, fontFamily: 'Inter, sans-serif' }}>

      {/* ── Sub-panels ── */}
      <AnimatePresence>
        {openPanel === 'ai' && (
          <motion.div key="ai" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.12 }}
            style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0 }}>
            <AIPromptInput onSubmit={(prompt) => { onAIEdit?.(prompt); setOpenPanel(null); }} onClose={() => setOpenPanel(null)} />
          </motion.div>
        )}
        {openPanel === 'content' && (
          <motion.div key="content" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.12 }}
            style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0 }}>
            <ContentInput value={selectedElement?.text} onChange={(v) => onContentChange?.(v)} onClose={() => setOpenPanel(null)} />
          </motion.div>
        )}
        {openPanel === 'typo' && (
          <motion.div key="typo" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.12 }}
            style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0 }}>
            <TypoPanel onApply={(prop, val) => { onStyleChange?.(prop, val); }} onClose={() => setOpenPanel(null)} />
          </motion.div>
        )}
        {openPanel === 'opacity' && (
          <motion.div key="opacity" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.12 }}
            style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0 }}>
            <OpacityPanel onApply={(val) => onStyleChange?.('opacity', val)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main pill ── */}
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.96 }}
        transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: '#141414',
          border: '1px solid #2A2A2A',
          borderRadius: 10,
          padding: '5px 8px',
          boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
        }}
      >
        {/* AI Edit */}
        <button
          onClick={() => togglePanel('ai')}
          title="Edit with AI"
          style={{ ...btnStyle(openPanel === 'ai'), width: 'auto', padding: '0 10px', gap: 5, fontSize: 12, fontWeight: 600, color: openPanel === 'ai' ? '#fff' : '#888' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#2A2A2A'; }}
          onMouseLeave={e => { if (openPanel !== 'ai') { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent'; } }}
        >
          <Sparkles style={{ width: 12, height: 12 }} />
          Edit with AI
        </button>

        {divider}

        {/* Big T — text content (text elements only) */}
        {isText && (
          <button onClick={() => togglePanel('content')} title="Edit content" style={btnStyle(openPanel === 'content')}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#2A2A2A'; }}
            onMouseLeave={e => { if (openPanel !== 'content') { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent'; } }}>
            <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1, fontFamily: 'serif' }}>T</span>
          </button>
        )}

        {/* Small T underlined — typography (text elements only) */}
        {isText && (
          <button onClick={() => togglePanel('typo')} title="Typography" style={btnStyle(openPanel === 'typo')}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#2A2A2A'; }}
            onMouseLeave={e => { if (openPanel !== 'typo') { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent'; } }}>
            <span style={{ fontSize: 12, fontWeight: 600, textDecoration: 'underline', lineHeight: 1 }}>T</span>
          </button>
        )}

        {/* Opacity — two interlocked circles */}
        <button onClick={() => togglePanel('opacity')} title="Opacity" style={btnStyle(openPanel === 'opacity')}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#2A2A2A'; }}
          onMouseLeave={e => { if (openPanel !== 'opacity') { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent'; } }}>
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
            <circle cx="5.5" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" fillOpacity="0" />
            <circle cx="10.5" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" fillOpacity="0" />
          </svg>
        </button>

        {divider}

        {/* Delete */}
        <button onClick={onDelete} title="Delete element"
          style={{ ...btnStyle(false), color: '#555' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'transparent'; }}>
          <Trash2 style={{ width: 13, height: 13 }} />
        </button>

        {/* Close — also saves a version */}
        <button onClick={onClose} title="Done (saves version)"
          style={btnStyle(false)}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#2A2A2A'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'transparent'; }}>
          <X style={{ width: 13, height: 13 }} />
        </button>
      </motion.div>
    </div>
  );
}