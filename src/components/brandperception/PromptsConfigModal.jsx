import { useState } from 'react';
import { X, Sparkles, Plus, Pencil, Trash2 } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const VIOLET = '#7C3AED';

function EditModal({ prompt, onSave, onClose }) {
  const [text, setText] = useState(prompt?.text || '');
  const [lang, setLang] = useState(prompt?.lang || 'FR');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, padding: '22px 24px', fontFamily: F }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 16px' }}>Edit prompt</p>
        <label style={{ fontSize: 11, fontWeight: 600, color: INK3, display: 'block', marginBottom: 6 }}>Prompt text</label>
        <textarea value={text} onChange={e => setText(e.target.value.slice(0, 300))} maxLength={300} rows={3}
          style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 9, outline: 'none', fontFamily: F, boxSizing: 'border-box', resize: 'none', color: INK }} />
        <p style={{ fontSize: 10.5, color: INK3, margin: '4px 0 12px' }}>{text.length} / 300</p>
        <select value={lang} onChange={e => setLang(e.target.value)}
          style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 9, outline: 'none', fontFamily: F, marginBottom: 8, color: INK }}>
          {['FR', 'EN', 'ES', 'DE', 'IT'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <p style={{ fontSize: 10.5, color: INK3, margin: '0 0 16px' }}>The text will be rewritten in the selected language before saving.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: INK3, fontFamily: F }}>Cancel</button>
          <button onClick={() => text.trim() && onSave({ ...prompt, text: text.trim(), lang })}
            style={{ padding: '8px 16px', background: VIOLET, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: F }}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function PromptsConfigModal({ prompts, onChange, onClose, onRegenerate, regenerating }) {
  const [editing, setEditing] = useState(null); // {index, prompt} | 'new'
  const narrative = prompts.filter(p => p.type === 'narrative');
  const used = prompts.length;

  const savePrompt = (data) => {
    if (editing === 'new') onChange([...prompts, { ...data, type: 'narrative', cited: false, answer: '' }]);
    else onChange(prompts.map((p, i) => i === editing.index ? { ...p, ...data } : p));
    setEditing(null);
  };
  const del = (i) => onChange(prompts.filter((_, j) => j !== i));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', padding: 16, fontFamily: F }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 560, maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: INK, margin: 0 }}>Configure prompts — Brand image</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK3 }}><X size={17} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <span style={{ fontSize: 11.5, color: INK3 }}>Prompts used (all brands & axes)</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: INK }}>{used} / 30</span>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: '#F0EDE8', marginTop: 6 }}>
            <div style={{ width: `${(used / 30) * 100}%`, height: '100%', background: VIOLET, borderRadius: 999 }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: INK }}>Narrative prompts ({narrative.length})</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onRegenerate} disabled={regenerating}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: INK, cursor: 'pointer', fontFamily: F }}>
                <Sparkles size={12} color={VIOLET} /> {regenerating ? 'Generating…' : 'Generate with AI'}
              </button>
              <button onClick={() => setEditing('new')}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: VIOLET, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: F }}>
                <Plus size={12} /> Add
              </button>
            </div>
          </div>

          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px', padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, background: '#FAF9F6' }}>
              {['Prompt', 'Language', 'Source', ''].map((h, i) => <span key={i} style={{ fontSize: 10.5, fontWeight: 700, color: INK3 }}>{h}</span>)}
            </div>
            {prompts.map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px', padding: '11px 14px', borderBottom: `1px solid ${BORDER}`, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: INK, lineHeight: 1.5 }}>{p.text}</span>
                <span><span style={{ padding: '2px 9px', border: `1px solid ${BORDER}`, borderRadius: 12, fontSize: 10.5, fontWeight: 600, color: INK }}>{p.lang || 'FR'}</span></span>
                <span><span style={{ padding: '2px 9px', border: `1px solid ${BORDER}`, borderRadius: 12, fontSize: 10.5, fontWeight: 600, color: INK }}>GEO</span></span>
                <span style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditing({ index: i, prompt: p })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK3 }}><Pencil size={13} /></button>
                  <button onClick={() => del(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK3 }}><Trash2 size={13} /></button>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 24px', borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: VIOLET, fontFamily: F }}>Close</button>
        </div>
      </div>

      {editing && <EditModal prompt={editing === 'new' ? null : editing.prompt} onSave={savePrompt} onClose={() => setEditing(null)} />}
    </div>
  );
}