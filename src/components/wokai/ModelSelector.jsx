import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const F = '"Anthropic Sans","Anthropic Sans Variable",Inter,system-ui,sans-serif';
const INK = '#111110';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const SURFACE = '#EEE5D2';

const LOGOS = {
  openai: 'https://media.base44.com/images/public/6a2edc91082e534601118582/67cb277ed_image.png',
  google: 'https://media.base44.com/images/public/6a2edc91082e534601118582/f37dc5b5a_image.png',
  anthropic: 'https://media.base44.com/images/public/6a2edc91082e534601118582/d67c08a4b_image.png',
};

export const AI_MODELS = [
  { id: 'gpt_5_mini', label: 'GPT-5 Mini', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'gpt_5_5', label: 'GPT-5.5', provider: 'openai', providerLabel: 'OpenAI' },
  { id: 'gemini_3_flash', label: 'Gemini 3 Flash', provider: 'google', providerLabel: 'Google' },
  { id: 'gemini_3_1_pro', label: 'Gemini 3.1 Pro', provider: 'google', providerLabel: 'Google' },
  { id: 'claude_sonnet_4_6', label: 'Claude Sonnet', provider: 'anthropic', providerLabel: 'Anthropic' },
  { id: 'claude_opus_4_6', label: 'Claude Opus', provider: 'anthropic', providerLabel: 'Anthropic' },
];

export default function ModelSelector({ model, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = AI_MODELS.find(m => m.id === model) || AI_MODELS[0];

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const providers = ['openai', 'google', 'anthropic'];

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(v => !v)} title="Modèle IA"
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', border: 'none', background: open ? SURFACE : 'transparent', borderRadius: 6, cursor: 'pointer', fontFamily: F }}
        onMouseEnter={e => e.currentTarget.style.background = SURFACE}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}>
        <img src={LOGOS[active.provider]} width={14} height={14} style={{ objectFit: 'contain', display: 'block' }} alt={active.providerLabel} />
        <span style={{ fontSize: 12, fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>{active.label}</span>
        <ChevronDown size={11} color={INK} strokeWidth={2} />
      </button>

      {open && (
        <div style={{ position: 'absolute', bottom: 'calc(100% + 10px)', right: 0, zIndex: 9000, background: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 6, minWidth: 200, boxShadow: '0 4px 24px rgba(21,19,15,0.10)' }}>
          {providers.map(prov => (
            <div key={prov}>
              <p style={{ fontSize: 9.5, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '8px 10px 3px', fontFamily: F }}>
                {AI_MODELS.find(m => m.provider === prov)?.providerLabel}
              </p>
              {AI_MODELS.filter(m => m.provider === prov).map(m => {
                const sel = m.id === model;
                return (
                  <div key={m.id} onClick={() => { onChange(m.id); setOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', background: sel ? '#F3F4F6' : 'transparent' }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#F9FAFB'; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}>
                    <img src={LOGOS[m.provider]} width={14} height={14} style={{ objectFit: 'contain' }} alt="" />
                    <span style={{ fontSize: 12.5, fontWeight: sel ? 600 : 450, color: INK, flex: 1, fontFamily: F }}>{m.label}</span>
                    {sel && <Check size={13} color={INK} strokeWidth={2.5} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}