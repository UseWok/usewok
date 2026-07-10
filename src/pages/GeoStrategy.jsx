import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Check, X, Compass, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
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

const filled = (v) => Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim());

// Le plan est-il quasi vide ? (rien de significatif rempli)
function isEmptyStrategy(s) {
  const keys = ['positioning_note', 'target_queries', 'query_philosophy', 'authority_sources', 'content_pillars', 'priority_competitors'];
  return keys.filter(k => filled(s?.[k])).length <= 1;
}

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
  const [generating, setGenerating] = useState(false);
  const generatedRef = useRef({}); // évite de re-générer le même site

  const load = async () => {
    const active = getActiveDomain();
    setPhase(prev => (peekCache(`geo_${active?.url || 'all'}`) ? 'ready' : 'loading'));
    try {
      const { profile: p, extra: ex, strategy } = await loadGeoStrategy(active?.url);
      if (!p) { if (!peekCache(`geo_${active?.url || 'all'}`)) setPhase('no_profile'); return; }
      setProfile(p); setExtra(ex); setS(strategy);
      setPhase('ready');
      setCache(`geo_${active?.url || 'all'}`, { profile: p, extra: ex, strategy });

      // Génération auto quand le plan est encore vide — l'IA propose, l'utilisateur ajuste ensuite
      if (isEmptyStrategy(strategy) && !generatedRef.current[p.site_url]) {
        generatedRef.current[p.site_url] = true;
        generate(p, strategy, ex, false);
      }
    } catch { if (!peekCache(`geo_${active?.url || 'all'}`)) setPhase('no_profile'); }
  };

  // Génère le plan via l'IA à partir du Brand Knowledge. force=true → régénération manuelle (écrase).
  const generate = async (p, currentStrategy, ex, force) => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateGeoStrategy', {
        url: p.site_url,
        business_name: p.identity_name || '',
        brand_knowledge: ex.brand_knowledge || {},
      });
      const ai = res?.data?.strategy;
      if (ai && typeof ai === 'object') {
        const merged = { ...currentStrategy };
        for (const [key, aiVal] of Object.entries(ai)) {
          if ((force || !filled(merged[key])) && filled(aiVal)) merged[key] = aiVal;
        }
        setS(merged);
        const newExtra = await saveGeoStrategy(p, ex, merged);
        setExtra(newExtra);
        setCache(`geo_${p.site_url || 'all'}`, { profile: p, extra: newExtra, strategy: merged });
        if (force) toast.success('Plan régénéré par UseWok');
      } else if (force) {
        toast.error('La génération a échoué — réessayez');
      }
    } catch { if (force) toast.error('La génération a échoué — réessayez'); }
    finally { setGenerating(false); }
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
      toast.error("L'enregistrement a échoué — réessayez");
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
        <p style={{ fontSize: 13, color: INK3, margin: '0 0 16px', maxWidth: 340 }}>Une fois votre site ajouté, UseWok pourra générer votre plan de visibilité IA.</p>
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

  // ── Sections renommées en questions humaines ──
  const SECTIONS = [
    {
      id: 'positioning',
      title: 'Comment veux-tu que les IA te décrivent ?',
      intro: "Le rôle que tu aimerais que ChatGPT & co. te donnent quand ils parlent de ton domaine.",
      fields: [
        { key: 'positioning_target', type: 'choice', label: 'Ta position idéale', options: POSITIONING_TARGETS },
        { key: 'positioning_note', type: 'text', label: 'En une phrase, comment aimerais-tu être présenté ?', rows: 3, placeholder: 'ex. la façon la plus simple d\'être vu par les IA…' },
      ],
    },
    {
      id: 'queries',
      title: "Sur quelles questions veux-tu être LA réponse ?",
      intro: "Quand quelqu'un pose ces questions à une IA, tu veux que ce soit ton nom qui sorte.",
      fields: [
        { key: 'target_queries', type: 'tags', label: 'Tes questions prioritaires (5 max)', placeholder: 'ex. quel est le meilleur outil pour la visibilité IA ?', chipOptions: TARGET_QUERY_CHIPS },
        { key: 'query_intents', type: 'pills', label: 'Ce que cherchent tes clients', options: QUERY_INTENTS },
      ],
    },
    {
      id: 'tone',
      title: 'Sur quel ton veux-tu que les IA parlent de toi ?',
      intro: "Le style, les mots, l'angle à privilégier quand une IA te mentionne.",
      fields: [
        { key: 'query_philosophy', type: 'text', label: 'Tes consignes', rows: 4, placeholder: 'ex. toujours nous présenter comme l\'option simple et rapide ; mettre les résultats en avant…' },
      ],
    },
    {
      id: 'sources',
      title: "Quels sites, s'ils parlent de toi, feraient le plus grand bien à ta crédibilité ?",
      intro: "Les médias et sites de référence qui te rendent plus crédible aux yeux des IA quand ils te citent.",
      fields: [
        { key: 'known_sources', type: 'pills', label: 'Médias de confiance à viser', options: KNOWN_SOURCES },
        { key: 'authority_sources', type: 'tags', label: 'Autres sites qui comptent pour toi (5 max)', placeholder: 'ex. nom d\'un blog ou d\'un média…', chipOptions: [] },
      ],
    },
    {
      id: 'content',
      title: 'Quels contenus veux-tu créer pour devenir une référence ?',
      intro: "Les grands types de contenu à publier pour que les IA te reconnaissent comme un expert.",
      fields: [
        { key: 'content_pillars', type: 'tags', label: 'Tes piliers de contenu (5 max)', placeholder: 'ex. guides pratiques, comparatifs, études de cas…', chipOptions: CONTENT_PILLAR_CHIPS },
      ],
    },
    {
      id: 'competitors',
      title: 'Qui veux-tu dépasser dans les réponses des IA ?',
      intro: "Les marques que tu veux devancer quand une IA fait des recommandations.",
      fields: [
        { key: 'priority_competitors', type: 'tags', label: 'Tes concurrents prioritaires (5 max)', placeholder: 'ex. Semrush, Ahrefs…', chipOptions: COMPETITOR_CHIPS },
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
              {editing ? "Ajuste les réponses, puis enregistre." : `${domainLabel} · Généré par UseWok, à toi de l'ajuster`}
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
              <Pencil size={14} /> Ajuster
            </button>
          )}
        </div>
      </div>

      {/* ── Contenu ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '20px 24px 80px' }}>
        {/* Bandeau : plan généré par l'IA + régénérer */}
        <div style={{ background: BANNER_BG, border: `1px solid ${BANNER_BORDER}`, borderRadius: 12, padding: '16px 18px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={16} color={VIOLET} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: BANNER_TEXT, margin: '0 0 3px' }}>UseWok a préparé ce plan pour toi</p>
            <p style={{ fontSize: 12.5, color: BANNER_TEXT, margin: 0, lineHeight: 1.55, opacity: 0.85 }}>
              À partir de ton profil de marque et de l'analyse de ton site. Tu n'as plus qu'à vérifier et ajuster ce qui ne te ressemble pas.
            </p>
          </div>
          {!editing && (
            <button onClick={() => generate(profile, s, extra, true)} disabled={generating}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 13px', border: `1px solid ${BANNER_BORDER}`, background: '#fff', borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: VIOLET, cursor: generating ? 'default' : 'pointer', fontFamily: F, flexShrink: 0, opacity: generating ? 0.6 : 1 }}>
              <RefreshCw size={13} style={{ animation: generating ? 'spin 0.8s linear infinite' : 'none' }} /> {generating ? 'Génération…' : 'Régénérer'}
            </button>
          )}
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
          {generating && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: 'rgba(251,250,247,0.72)', backdropFilter: 'blur(1px)', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 80, gap: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: VIOLET, animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 13.5, fontWeight: 600, color: VIOLET, margin: 0 }}>UseWok construit ton plan…</p>
            </div>
          )}
          {SECTIONS.map((section) => (
            <section key={section.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.35 }}>{section.title}</h2>
                <p style={{ fontSize: 12.5, color: INK3, margin: '4px 0 0', lineHeight: 1.5 }}>{section.intro}</p>
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}