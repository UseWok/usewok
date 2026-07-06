import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Check, Target } from 'lucide-react';
import { toast } from 'sonner';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import {
  loadGeoStrategy, saveGeoStrategy, emptyGeoStrategy,
  POSITIONING_TARGETS, QUERY_INTENTS, KNOWN_SOURCES,
} from '@/lib/geo-strategy';
import { Section, FieldLabel, TextArea, SelectInput } from '@/components/brand/BrandField';
import TagListEditor from '@/components/brand/TagListEditor';
import { PillToggles } from '@/components/brand/CheckPicker';

const INK = '#1A1A1A';
const INK3 = '#8A8A93';
const BORDER = '#E3DFD6';
const SURFACE = '#F5F0E8';
const VIOLET = '#7B4FE0';

export default function GeoStrategy() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [extra, setExtra] = useState({});
  const [s, setS] = useState(emptyGeoStrategy());
  const [phase, setPhase] = useState('loading'); // loading | ready | no_profile
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const set = (field, value) => { setS(prev => ({ ...prev, [field]: value })); setDirty(true); };

  const load = async () => {
    setPhase('loading');
    try {
      const active = getActiveDomain();
      const { profile: p, extra: ex, strategy } = await loadGeoStrategy(active?.url);
      if (!p) { setPhase('no_profile'); return; }
      setProfile(p); setExtra(ex); setS(strategy);
      setUpdatedAt(ex.geo_strategy_updated_at || null);
      setDirty(false);
      setPhase('ready');
    } catch { setPhase('no_profile'); }
  };

  useEffect(() => {
    load();
    const unsub = onActiveDomainChange(() => load());
    return unsub;
  }, []);

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const newExtra = await saveGeoStrategy(profile, extra, s);
      setExtra(newExtra);
      setUpdatedAt(newExtra.geo_strategy_updated_at);
      setDirty(false);
      toast.success('GEO Strategy enregistré');
    } catch {
      toast.error("Échec de l'enregistrement");
    } finally { setSaving(false); }
  };

  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: INK, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (phase === 'no_profile') {
    return (
      <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Target size={22} color={INK3} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Aucun site analysé</p>
        <p style={{ fontSize: 12, color: INK3, margin: '0 0 16px' }}>Analysez votre site depuis l'accueil pour définir votre GEO Strategy.</p>
        <button onClick={() => navigate('/app')} style={{ padding: '10px 20px', background: INK, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>← Accueil</button>
      </div>
    );
  }

  const domainLabel = (profile?.site_url || '').replace(/https?:\/\//, '').split('/')[0];

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: SURFACE, padding: '18px 24px 12px', paddingTop: 'max(18px, env(safe-area-inset-top))', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Votre plan de visibilité IA</h1>
          <p style={{ fontSize: 12, color: INK3, margin: '4px 0 0' }}>
            Dites à l'IA comment vous voulez être vu · {domainLabel}{updatedAt ? ` · maj ${new Date(updatedAt).toLocaleDateString('fr-FR')}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={load} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 9, fontSize: 12.5, fontWeight: 600, color: INK, cursor: 'pointer' }}>
            <RotateCcw size={12} /> Annuler
          </button>
          <button onClick={save} disabled={saving || !dirty}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: 'none', background: dirty ? VIOLET : '#C9C4B8', borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: dirty && !saving ? 'pointer' : 'default', transition: 'background 120ms' }}>
            {saving ? <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> : <Check size={13} />}
            Enregistrer
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ maxWidth: 1080, margin: '0 auto', padding: '8px 24px 120px' }}>

        {/* Comment vous voulez être vu */}
        <Section title="Comment vous voulez être vu" icon="⭐" hint="Le rôle que vous aimeriez que l'IA vous donne quand elle parle de votre domaine.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
            <div>
              <FieldLabel>Votre place idéale</FieldLabel>
              <SelectInput value={s.positioning_target} onChange={v => set('positioning_target', v)} options={POSITIONING_TARGETS} />
            </div>
            <div>
              <FieldLabel>En quelques mots, comment aimeriez-vous être présenté ?</FieldLabel>
              <TextArea value={s.positioning_note} onChange={v => set('positioning_note', v)} rows={3}
                placeholder="Ex : la solution française la plus simple pour être visible sur l'IA…" />
            </div>
          </div>
        </Section>

        {/* Les questions où vous voulez sortir */}
        <Section title="Les questions où vous voulez sortir" icon="🔍" hint="Quand quelqu'un pose ces questions à ChatGPT, vous voulez être la réponse. 5 max.">
          <FieldLabel>Vos questions prioritaires (5 max)</FieldLabel>
          <TagListEditor items={s.target_queries} onChange={v => set('target_queries', v)} placeholder="Ex : quel est le meilleur outil pour être visible sur l'IA ?" />
          <div style={{ height: 16 }} />
          <FieldLabel>Ce que cherchent vos clients</FieldLabel>
          <PillToggles options={QUERY_INTENTS.map(q => ({ code: q.code, label: q.label }))} selected={s.query_intents} onChange={v => set('query_intents', v)} />
        </Section>

        {/* Le ton à donner */}
        <Section title="Le ton à donner" icon="💬" hint="Comment vous voulez que l'IA parle de vous : le style, les mots, l'angle.">
          <FieldLabel>Vos consignes</FieldLabel>
          <TextArea value={s.query_philosophy} onChange={v => set('query_philosophy', v)} rows={4}
            placeholder="Ex : toujours nous présenter comme la solution simple et rapide, insister sur les résultats…" />
        </Section>

        {/* Où vous voulez apparaître */}
        <Section title="Où vous voulez apparaître" icon="📰" hint="Les sites et médias qui, s'ils parlent de vous, boostent votre crédibilité. 5 max.">
          <FieldLabel>Médias reconnus à viser</FieldLabel>
          <PillToggles options={KNOWN_SOURCES} selected={s.known_sources} onChange={v => set('known_sources', v)} />
          <div style={{ height: 16 }} />
          <FieldLabel>Autres sites qui comptent pour vous (5 max)</FieldLabel>
          <TagListEditor items={s.authority_sources} onChange={v => set('authority_sources', v)} placeholder="Ex : nom d'un blog ou média…" />
        </Section>

        {/* Les sujets à mettre en avant */}
        <Section title="Les sujets à mettre en avant" icon="📚" hint="Les grands thèmes de contenu à produire pour devenir une référence. 5 max.">
          <TagListEditor items={s.content_pillars} onChange={v => set('content_pillars', v)} placeholder="Ex : guides pratiques, comparatifs, témoignages…" />
        </Section>

        {/* Les concurrents à dépasser */}
        <Section title="Les concurrents à dépasser" icon="🏁" hint="Les marques que vous voulez battre dans les réponses de l'IA. 5 max.">
          <TagListEditor items={s.priority_competitors} onChange={v => set('priority_competitors', v)} placeholder="Ex : Semrush, Ahrefs…" />
        </Section>
      </motion.div>

      {/* Bottom save bar when dirty */}
      {dirty && (
        <motion.div initial={{ y: 60 }} animate={{ y: 0 }}
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: '#fff', borderTop: `1px solid ${BORDER}`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: 12.5, color: INK3, marginRight: 'auto' }}>Modifications non enregistrées</span>
          <button onClick={load} style={{ padding: '9px 16px', border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 9, fontSize: 12.5, fontWeight: 600, color: INK, cursor: 'pointer' }}>Annuler</button>
          <button onClick={save} disabled={saving} style={{ padding: '9px 20px', border: 'none', background: VIOLET, borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </motion.div>
      )}
    </div>
  );
}