import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { getLandingContent, saveLandingContent, DEFAULT_LANDING } from '@/lib/landing-content';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

function Field({ label, value, onChange, multiline = false, placeholder = '' }) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase tracking-wider mb-1 block" style={{ color: '#aaa' }}>{label}</label>
      {multiline ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
          style={{ border: '1px solid rgba(0,0,0,0.1)', background: '#fafafa' }} />
      ) : (
        <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm focus:outline-none"
          style={{ border: '1px solid rgba(0,0,0,0.1)', background: '#fafafa' }} />
      )}
    </div>
  );
}

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <span className="font-black text-sm" style={{ color: FG }}>{title}</span>
        {open ? <ChevronUp className="w-4 h-4" style={{ color: '#bbb' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#bbb' }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-2 space-y-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingEditor() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getLandingContent().then(setData); }, []);

  const set = (path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (keys[i].includes('[')) {
          const [k, idx] = keys[i].split('[');
          cur = cur[k][parseInt(idx)];
        } else {
          cur = cur[keys[i]];
        }
      }
      const last = keys[keys.length - 1];
      if (last.includes('[')) {
        const [k, idx] = last.split('[');
        cur[k][parseInt(idx)] = value;
      } else {
        cur[last] = value;
      }
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    await saveLandingContent(data);
    setSaving(false);
    toast.success('Landing page saved!');
  };

  const reset = async () => {
    setData(JSON.parse(JSON.stringify(DEFAULT_LANDING)));
    toast('Reset to defaults — click Save to apply.');
  };

  if (!data) return <div className="py-8 text-center text-sm" style={{ color: '#aaa' }}>Loading…</div>;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#666' }}>Edit every piece of text, image, and link on the landing page.</p>
        <div className="flex gap-2">
          <button onClick={reset} className="px-3 py-2 text-xs font-semibold" style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#888' }}>Reset defaults</button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-black"
            style={{ background: saving ? '#888' : FG, color: 'white' }}>
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {/* NAV */}
      <Section title="Navigation">
        <Field label="Logo URL" value={data.nav.logo_url} onChange={v => set('nav.logo_url', v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA Button Label" value={data.nav.cta_label} onChange={v => set('nav.cta_label', v)} />
          <Field label="Sign In Label" value={data.nav.login_label} onChange={v => set('nav.login_label', v)} />
          <Field label="Features URL" value={data.nav.features_url} onChange={v => set('nav.features_url', v)} />
          <Field label="Pricing URL" value={data.nav.pricing_url} onChange={v => set('nav.pricing_url', v)} />
          <Field label="Terms of Service URL" value={data.nav.tos_url} onChange={v => set('nav.tos_url', v)} />
        </div>
      </Section>

      {/* HERO */}
      <Section title="Hero Section">
        <Field label="Badge Text" value={data.hero.badge} onChange={v => set('hero.badge', v)} />
        <Field label="Main Title (use \\n for line breaks)" value={data.hero.title} onChange={v => set('hero.title', v)} multiline />
        <Field label="Subtitle" value={data.hero.subtitle} onChange={v => set('hero.subtitle', v)} multiline />
        <Field label="Input Placeholder" value={data.hero.placeholder} onChange={v => set('hero.placeholder', v)} />
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider mb-2 block" style={{ color: '#aaa' }}>Topic Chips</label>
          {data.hero.topics.map((t, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={t} onChange={e => {
                const topics = [...data.hero.topics];
                topics[i] = e.target.value;
                set('hero.topics', topics);
              }} className="flex-1 px-3 py-2 text-sm focus:outline-none" style={{ border: '1px solid rgba(0,0,0,0.1)' }} />
              <button onClick={() => {
                const topics = data.hero.topics.filter((_, j) => j !== i);
                set('hero.topics', topics);
              }} className="px-2 bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={() => set('hero.topics', [...data.hero.topics, ''])}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 mt-1"
            style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#666' }}>
            <Plus className="w-3 h-3" /> Add topic
          </button>
        </div>
      </Section>

      {/* SECTION TITLE */}
      <Section title="Section Title (between hero and cards)">
        <Field label="Title" value={data.section_title} onChange={v => set('section_title', v)} />
      </Section>

      {/* CARDS */}
      <Section title="Feature Cards (black stacking cards)">
        {data.cards.map((card, i) => (
          <div key={i} className="p-4 space-y-3" style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'white' }}>
            <p className="text-xs font-black" style={{ color: '#888' }}>Card {i + 1}</p>
            <Field label="Title" value={card.title} onChange={v => {
              const cards = JSON.parse(JSON.stringify(data.cards));
              cards[i].title = v;
              set('cards', cards);
            }} />
            <Field label="Description" value={card.desc} onChange={v => {
              const cards = JSON.parse(JSON.stringify(data.cards));
              cards[i].desc = v;
              set('cards', cards);
            }} multiline />
            <Field label="Image URL" value={card.image} onChange={v => {
              const cards = JSON.parse(JSON.stringify(data.cards));
              cards[i].image = v;
              set('cards', cards);
            }} />
            {card.image && <img src={card.image} alt="" className="h-20 w-auto object-cover opacity-60" />}
          </div>
        ))}
      </Section>

      {/* PRICING */}
      <Section title="Pricing Section">
        <Field label="Section Title" value={data.pricing.title} onChange={v => set('pricing.title', v)} />
        <Field label="Section Subtitle" value={data.pricing.subtitle} onChange={v => set('pricing.subtitle', v)} />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#aaa' }}>Free Card</p>
            <Field label="Title" value={data.pricing.free_title} onChange={v => set('pricing.free_title', v)} />
            <Field label="Price Label" value={data.pricing.free_price} onChange={v => set('pricing.free_price', v)} />
            <Field label="CTA Label" value={data.pricing.free_cta} onChange={v => set('pricing.free_cta', v)} />
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider mb-2 block" style={{ color: '#aaa' }}>Features</label>
              {data.pricing.free_features.map((f, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <input value={f} onChange={e => {
                    const arr = [...data.pricing.free_features]; arr[i] = e.target.value;
                    set('pricing.free_features', arr);
                  }} className="flex-1 px-2.5 py-1.5 text-xs focus:outline-none" style={{ border: '1px solid rgba(0,0,0,0.1)' }} />
                  <button onClick={() => set('pricing.free_features', data.pricing.free_features.filter((_, j) => j !== i))}
                    className="px-1.5 bg-red-50 text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <button onClick={() => set('pricing.free_features', [...data.pricing.free_features, ''])}
                className="text-xs px-2.5 py-1.5 mt-1" style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#888' }}>
                + Add
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#aaa' }}>Paid Card</p>
            <Field label="Title" value={data.pricing.paid_title} onChange={v => set('pricing.paid_title', v)} />
            <Field label="Price" value={data.pricing.paid_price} onChange={v => set('pricing.paid_price', v)} />
            <Field label="Currency label" value={data.pricing.paid_currency} onChange={v => set('pricing.paid_currency', v)} />
            <Field label="CTA Label" value={data.pricing.paid_cta} onChange={v => set('pricing.paid_cta', v)} />
            <Field label="CTA URL" value={data.pricing.paid_url} onChange={v => set('pricing.paid_url', v)} />
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider mb-2 block" style={{ color: '#aaa' }}>Features</label>
              {data.pricing.paid_features.map((f, i) => (
                <div key={i} className="flex gap-2 mb-1.5">
                  <input value={f} onChange={e => {
                    const arr = [...data.pricing.paid_features]; arr[i] = e.target.value;
                    set('pricing.paid_features', arr);
                  }} className="flex-1 px-2.5 py-1.5 text-xs focus:outline-none" style={{ border: '1px solid rgba(0,0,0,0.1)' }} />
                  <button onClick={() => set('pricing.paid_features', data.pricing.paid_features.filter((_, j) => j !== i))}
                    className="px-1.5 bg-red-50 text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
              ))}
              <button onClick={() => set('pricing.paid_features', [...data.pricing.paid_features, ''])}
                className="text-xs px-2.5 py-1.5 mt-1" style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#888' }}>
                + Add
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section title="FAQ">
        {data.faq.map((item, i) => (
          <div key={i} className="p-4 space-y-2" style={{ border: '1px solid rgba(0,0,0,0.08)', background: 'white' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-black" style={{ color: '#888' }}>Question {i + 1}</p>
              <button onClick={() => set('faq', data.faq.filter((_, j) => j !== i))}
                className="text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <Field label="Question" value={item.q} onChange={v => {
              const faq = JSON.parse(JSON.stringify(data.faq)); faq[i].q = v; set('faq', faq);
            }} />
            <Field label="Answer" value={item.a} onChange={v => {
              const faq = JSON.parse(JSON.stringify(data.faq)); faq[i].a = v; set('faq', faq);
            }} multiline />
          </div>
        ))}
        <button onClick={() => set('faq', [...data.faq, { q: '', a: '' }])}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2"
          style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#666' }}>
          <Plus className="w-3 h-3" /> Add FAQ
        </button>
      </Section>

      {/* CTA */}
      <Section title="Final CTA Section">
        <Field label="Title (use \\n for line breaks)" value={data.cta.title} onChange={v => set('cta.title', v)} multiline />
        <Field label="Button Label" value={data.cta.button} onChange={v => set('cta.button', v)} />
      </Section>

      {/* FOOTER */}
      <Section title="Footer">
        <Field label="Disclaimer text" value={data.footer.disclaimer} onChange={v => set('footer.disclaimer', v)} />
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider mb-2 block" style={{ color: '#aaa' }}>Links</label>
          {data.footer.links.map((link, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={link.label} onChange={e => {
                const links = JSON.parse(JSON.stringify(data.footer.links)); links[i].label = e.target.value;
                set('footer.links', links);
              }} placeholder="Label" className="flex-1 px-2.5 py-2 text-xs focus:outline-none" style={{ border: '1px solid rgba(0,0,0,0.1)' }} />
              <input value={link.url} onChange={e => {
                const links = JSON.parse(JSON.stringify(data.footer.links)); links[i].url = e.target.value;
                set('footer.links', links);
              }} placeholder="URL" className="flex-1 px-2.5 py-2 text-xs focus:outline-none" style={{ border: '1px solid rgba(0,0,0,0.1)' }} />
              <button onClick={() => set('footer.links', data.footer.links.filter((_, j) => j !== i))}
                className="px-2 bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={() => set('footer.links', [...data.footer.links, { label: '', url: '' }])}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 mt-1"
            style={{ border: '1px solid rgba(0,0,0,0.1)', color: '#666' }}>
            <Plus className="w-3 h-3" /> Add link
          </button>
        </div>
      </Section>

      {/* Save bottom */}
      <div className="flex justify-end pt-2">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 font-black text-sm"
          style={{ background: saving ? '#888' : FG, color: 'white' }}>
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save & Publish'}
        </button>
      </div>
    </div>
  );
}