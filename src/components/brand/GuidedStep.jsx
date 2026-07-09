import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { FieldLabel, TextInput, TextArea, SelectInput } from '@/components/brand/BrandField';
import TagListEditor from '@/components/brand/TagListEditor';
import SuggestedTags from '@/components/brand/SuggestedTags';

const VIOLET = '#7B4FE0';
const INK = '#111827';
const INK3 = '#6B7280';

// Renders a single guided step: emoji + title + intro, a "why it matters" note,
// then that step's fields. Tag fields get AI suggestions to click.
export default function GuidedStep({ step, k, set, suggestions = {} }) {
  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Question header */}
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{step.emoji}</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{step.title}</h2>
        <p style={{ fontSize: 14, color: INK3, margin: 0 }}>{step.intro}</p>
      </div>

      {/* Why it matters */}
      <div style={{ display: 'flex', gap: 9, background: '#F5F0FF', border: '1px solid #EDE4FF', borderRadius: 12, padding: '12px 14px', marginBottom: 22 }}>
        <Lightbulb size={16} color={VIOLET} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12.5, color: '#5B21B6', margin: 0, lineHeight: 1.55 }}>
          <strong style={{ fontWeight: 700 }}>Why this matters:</strong> {step.why}
        </p>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {step.fields.map(f => (
          <div key={f.key}>
            <FieldLabel>{f.label}</FieldLabel>
            {f.type === 'text' && (
              <TextInput value={k[f.key] || ''} onChange={v => set(f.key, v)} placeholder={f.placeholder} />
            )}
            {f.type === 'textarea' && (
              <TextArea value={k[f.key] || ''} onChange={v => set(f.key, v)} rows={f.rows || 3} placeholder={f.placeholder} />
            )}
            {f.type === 'select' && (
              <SelectInput value={k[f.key]} onChange={v => set(f.key, v)} options={f.options.map(o => ({ value: o, label: o }))} />
            )}
            {f.type === 'tags' && (
              <>
                <TagListEditor items={k[f.key] || []} onChange={v => set(f.key, v)} placeholder={f.placeholder} />
                <SuggestedTags
                  suggestions={suggestions[f.suggestKey] || []}
                  current={k[f.key] || []}
                  onAdd={(s) => set(f.key, [...(k[f.key] || []), s])}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}