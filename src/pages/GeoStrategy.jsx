import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Check, X, Compass, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { peekCache, setCache } from '@/lib/data-cache';
import {
  loadGeoStrategy, saveGeoStrategy, emptyGeoStrategy,
  POSITIONING_TARGETS, QUERY_INTENTS, KNOWN_SOURCES,
  TARGET_QUERY_CHIPS, CONTENT_PILLAR_CHIPS, COMPETITOR_CHIPS,
} from '@/lib/geo-strategy';
import { FieldLabel, FieldValue, TextArea } from '@/components/brand/BrandField';
import TagListEditor, { PillList } from '@/components/brand/TagListEditor';
import ChoiceChips, { MultiChoiceChips } from '@/components/brand/ChoiceChips';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#111827';
const INK3 = '#6B7280';
const BORDER = '#E5E7EB';
const BG = '#FBFAF7';
const VIOLET = '#7B4FE0';
const BANNER_BG = '#F3F0FB';
const BANNER_BORDER = '#E0D9F5';
const BANNER_TEXT = '#4C1D95';

export default function GeoStrategy() {
  const navigate = useNavigate();
  const _active0 = getActiveDomain();
  const _seed = peekCache(`geo_${_active0?.url || 'all'}`);
  const [profile, setProfile] = useState(_seed?.profile || null);
  const [extra, setExtra] = useState(_seed?.extra || {});
  const [s, setS] = useState(_seed?.strategy || emptyGeoStrategy());
  const [phase, setPhase] = useState(_seed ? 'ready' : 'loading');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null);

  const load = async () => {
    const active = getActiveDomain();
    setPhase(prev => (peekCache(`geo_${active?.url || 'all'}`) ? 'ready' : 'loading'));
    try {
      const { profile: p, extra: ex, strategy } = await loadGeoStrategy(active?.url);
      if (!p) { if (!peekCache(`geo_${active?.url || 'all'}`)) setPhase('no_profile'); return; }
      setProfile(p); setExtra(ex); setS(strategy);
      setPhase('ready');
      setCache(`geo_${active?.url || 'all'}`, { profile: p, extra: ex, strategy });
    } catch { if (!peekCache(`geo_${active?.url || 'all'}`)) setPhase('no_profile'); }
  };

  useEffect(() => {
    load();
    const unsub = onActiveDomainChange(() => { setEditing(false); load(); });
    return unsub;
  }, []);

  const startEdit = () => { setDraft({ ...s }); setEditing(true); };
  const cancelEdit = () => { setDraft(null); setEditing(false); };
  const setField = (field, value) => setDraft(prev => ({ ...prev, [field]: value }));

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const newExtra = await saveGeoStrategy(profile, extra, draft);
      setExtra(newExtra);
      setS(draft);
      setCache(`geo_${profile?.site_url || 'all'}`, { profile, extra: newExtra, strategy: draft });
      setEditing(false);
      setDraft(null);
      toast.success('Visibility plan saved');
    } catch {
      toast.error("Couldn't save — please try again");
    } finally { setSaving(false); }
  };

  // ── États : chargement / pas de profil ──
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: VIOLET, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (phase === 'no_profile') {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: F, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Compass size={22} color={INK3} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Add your website first</p>
        <p style={{ fontSize: 13, color: INK3, margin: '0 0 16px', maxWidth: 340 }}>Once your site is added, you can set up your AI visibility plan.</p>
        <button onClick={() => navigate('/app')} style={{ padding: '11px 22px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Go to home</button>
      </div>
    );
  }

  const source = editing ? draft : s;
  const domainLabel = (profile?.site_url || '').replace(/https?:\/\//, '').split('/')[0];

  const renderValue = (f) => {
    if (f.type === 'tags')   return <PillList items={source[f.key] || []} />;
    if (f.type === 'choice') return <FieldValue value={source[f.key] || '—'} />;
    if (f.type === 'pills')  return <PillList items={(source[f.key] || []).map(code => { const found = f.options.find(o => o.code === code); return found ? found.label : code; })} />;
    return <FieldValue value={source[f.key]} />;
  };

  const renderEditor = (f) => {
    if (f.type === 'text')     return <TextArea value={draft[f.key] || ''} onChange={v => setField(f.key, v)} rows={f.rows || 3} placeholder={f.placeholder} />;
    if (f.type === 'choice')   return <ChoiceChips value={draft[f.key]} onChange={v => setField(f.key, v)} options={f.options} />;
    if (f.type === 'tags')     return <TagListEditor items={draft[f.key] || []} onChange={v => setField(f.key, v)} placeholder={f.placeholder} chipOptions={f.chipOptions} />;
    if (f.type === 'pills')    return <MultiChoiceChips selected={draft[f.key] || []} onChange={v => setField(f.key, v)} options={f.options} />;
    return null;
  };

  // ── Section configuration ──
  const SECTIONS = [
    {
      id: 'positioning',
      title: 'Desired positioning',
      intro: "The role you'd like AI to give you when it talks about your space.",
      fields: [
        { key: 'positioning_target', type: 'choice', label: 'Your ideal position', options: POSITIONING_TARGETS },
        { key: 'positioning_note', type: 'text', label: 'How would you like to be introduced?', rows: 3, placeholder: 'e.g. the simplest way to get seen by AI engines…' },
      ],
    },
    {
      id: 'queries',
      title: 'Target questions',
      intro: "When someone asks ChatGPT these questions, you want to be the answer.",
      fields: [
        { key: 'target_queries', type: 'tags', label: 'Your priority questions (up to 5)', placeholder: 'e.g. what is the best tool for AI visibility?', chipOptions: TARGET_QUERY_CHIPS },
        { key: 'query_intents', type: 'pills', label: "What your customers are looking for", options: QUERY_INTENTS },
      ],
    },
    {
      id: 'tone',
      title: 'Tone of voice',
      intro: "How you want AI to talk about you — the style, the words, the angle.",
      fields: [
        { key: 'query_philosophy', type: 'text', label: 'Your guidelines', rows: 4, placeholder: 'e.g. always present us as the simple, fast option; lead with results…' },
      ],
    },
    {
      id: 'sources',
      title: 'Authority sources',
      intro: "Sites and media that boost your credibility when they mention you.",
      fields: [
        { key: 'known_sources', type: 'pills', label: 'Trusted media to target', options: KNOWN_SOURCES },
        { key: 'authority_sources', type: 'tags', label: 'Other sites that matter to you (up to 5)', placeholder: 'e.g. name of a blog or outlet…', chipOptions: [] },
      ],
    },
    {
      id: 'content',
      title: 'Content themes',
      intro: "The main content areas to build so you become a go-to reference.",
      fields: [
        { key: 'content_pillars', type: 'tags', label: 'Your content pillars (up to 5)', placeholder: 'e.g. how-to guides, comparisons, case studies…', chipOptions: CONTENT_PILLAR_CHIPS },
      ],
    },
    {
      id: 'competitors',
      title: 'Competitors to beat',
      intro: "The brands you want to outrank in AI answers.",
      fields: [
        { key: 'priority_competitors', type: 'tags', label: 'Your priority competitors (up to 5)', placeholder: 'e.g. Semrush, Ahrefs…', chipOptions: COMPETITOR_CHIPS },
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      {/* ── En-tête ── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 3px', letterSpacing: '-0.02em' }}>AI Visibility Plan</h1>
            <p style={{ fontSize: 12.5, color: INK3, margin: 0 }}>
              {editing ? "Edit your answers, then save." : `${domainLabel} · What UseWok should optimize for you`}
            </p>
          </div>
          {editing ? (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={cancelEdit} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 15px', border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600, color: INK3, cursor: 'pointer', fontFamily: F }}>
                <X size={14} /> Cancel
              </button>
              <button onClick={save} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', background: VIOLET, borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: F, opacity: saving ? 0.7 : 1 }}>
                <Check size={14} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          ) : (
            <button onClick={startEdit}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: 'none', background: VIOLET, borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 24px 80px' }}>
        {/* Bandeau explicatif */}
        <div style={{ background: BANNER_BG, border: `1px solid ${BANNER_BORDER}`, borderRadius: 12, padding: '16px 18px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Info size={16} color={VIOLET} />
          </div>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: BANNER_TEXT, margin: '0 0 3px' }}>Why this page matters</p>
            <p style={{ fontSize: 12.5, color: BANNER_TEXT, margin: 0, lineHeight: 1.55, opacity: 0.85 }}>
              This plan tells UseWok exactly what to optimize so you show up for the right questions. The more precise it is, the sharper our recommendations get.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {SECTIONS.map((section) => (
            <section key={section.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0, letterSpacing: '-0.01em' }}>{section.title}</h2>
                <p style={{ fontSize: 12.5, color: INK3, margin: '3px 0 0', lineHeight: 1.5 }}>{section.intro}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {section.fields.map((f) => (
                  <div key={f.key}>
                    <FieldLabel>{f.label}</FieldLabel>
                    <div style={{ marginTop: 4 }}>
                      {editing ? renderEditor(f) : renderValue(f)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}