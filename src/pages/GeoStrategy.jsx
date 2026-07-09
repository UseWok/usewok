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
      toast.success('Plan de visibilité enregistré');
    } catch {
      toast.error("L'enregistrement a échoué");
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
        <p style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Ajoutez d'abord votre site</p>
        <p style={{ fontSize: 13, color: INK3, margin: '0 0 16px', maxWidth: 340 }}>Une fois votre site ajouté, vous pourrez définir votre plan de visibilité IA.</p>
        <button onClick={() => navigate('/app')} style={{ padding: '11px 22px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Aller à l'accueil</button>
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

  // ── Configuration des sections ──
  const SECTIONS = [
    {
      id: 'positioning',
      title: 'Positionnement souhaité',
      intro: "Le rôle que vous voudriez que l'IA vous donne quand elle parle de votre domaine.",
      fields: [
        { key: 'positioning_target', type: 'choice', label: 'Votre position idéale', options: POSITIONING_TARGETS },
        { key: 'positioning_note', type: 'text', label: 'Comment aimeriez-vous être présenté ?', rows: 3, placeholder: 'ex. la solution la plus simple pour être visible sur les IA…' },
      ],
    },
    {
      id: 'queries',
      title: 'Questions ciblées',
      intro: "Quand quelqu'un pose ces questions à ChatGPT, vous voulez être la réponse.",
      fields: [
        { key: 'target_queries', type: 'tags', label: 'Vos questions prioritaires (5 max)', placeholder: 'ex. quel est le meilleur outil pour la visibilité IA ?', chipOptions: TARGET_QUERY_CHIPS },
        { key: 'query_intents', type: 'pills', label: "Ce que vos clients cherchent", options: QUERY_INTENTS },
      ],
    },
    {
      id: 'tone',
      title: 'Tonalité',
      intro: "Comment vous voulez que l'IA parle de vous : le style, les mots, l'angle.",
      fields: [
        { key: 'query_philosophy', type: 'text', label: 'Vos directives', rows: 4, placeholder: 'ex. toujours nous présenter comme la solution simple et rapide, mettre en avant les résultats…' },
      ],
    },
    {
      id: 'sources',
      title: 'Sources d\'autorité',
      intro: "Sites et médias qui, s'ils parlent de vous, boostent votre crédibilité.",
      fields: [
        { key: 'known_sources', type: 'pills', label: 'Médias reconnus à cibler', options: KNOWN_SOURCES },
        { key: 'authority_sources', type: 'tags', label: 'Autres sites qui comptent pour vous (5 max)', placeholder: 'ex. nom d\'un blog ou média…', chipOptions: [] },
      ],
    },
    {
      id: 'content',
      title: 'Thèmes de contenu',
      intro: "Les grands axes de contenu à produire pour devenir une référence.",
      fields: [
        { key: 'content_pillars', type: 'tags', label: 'Vos piliers de contenu (5 max)', placeholder: 'ex. guides pratiques, comparatifs, témoignages…', chipOptions: CONTENT_PILLAR_CHIPS },
      ],
    },
    {
      id: 'competitors',
      title: 'Concurrents à battre',
      intro: "Les marques que vous voulez devancer dans les réponses IA.",
      fields: [
        { key: 'priority_competitors', type: 'tags', label: 'Vos concurrents prioritaires (5 max)', placeholder: 'ex. Semrush, Ahrefs…', chipOptions: COMPETITOR_CHIPS },
      ],
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      {/* ── En-tête ── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 3px', letterSpacing: '-0.02em' }}>Plan de visibilité IA</h1>
            <p style={{ fontSize: 12.5, color: INK3, margin: 0 }}>
              {editing ? "Modifiez vos réponses, puis enregistrez." : `${domainLabel} · Ce que UseWok doit optimiser pour vous`}
            </p>
          </div>
          {editing ? (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={cancelEdit} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 15px', border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600, color: INK3, cursor: 'pointer', fontFamily: F }}>
                <X size={14} /> Annuler
              </button>
              <button onClick={save} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', border: 'none', background: VIOLET, borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: F, opacity: saving ? 0.7 : 1 }}>
                <Check size={14} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          ) : (
            <button onClick={startEdit}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: 'none', background: VIOLET, borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
              <Pencil size={14} /> Modifier
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
            <p style={{ fontSize: 13.5, fontWeight: 600, color: BANNER_TEXT, margin: '0 0 3px' }}>Pourquoi cette page ?</p>
            <p style={{ fontSize: 12.5, color: BANNER_TEXT, margin: 0, lineHeight: 1.55, opacity: 0.85 }}>
              Ce plan indique à UseWok exactement quoi optimiser pour apparaître sur les bonnes questions. Plus il est précis, plus nos recommandations sont ciblées.
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