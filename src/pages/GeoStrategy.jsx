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
          <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>GEO Strategy</h1>
          <p style={{ fontSize: 12, color: INK3, margin: '4px 0 0' }}>
            {domainLabel}{updatedAt ? ` · mis à jour le ${new Date(updatedAt).toLocaleDateString('fr-FR')}` : ' · jamais enregistré'}
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

        {/* Positionnement cible */}
        <Section title="Positionnement cible" hint="Le rôle que vous voulez tenir dans les réponses des moteurs IA.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
            <div>
              <FieldLabel>Stratégie / rôle visé</FieldLabel>
              <SelectInput value={s.positioning_target} onChange={v => set('positioning_target', v)} options={POSITIONING_TARGETS} />
            </div>
            <div>
              <FieldLabel>Angle de positionnement</FieldLabel>
              <TextArea value={s.positioning_note} onChange={v => set('positioning_note', v)} rows={3}
                placeholder="Ex : Devenir la recommandation n°1 pour les professionnels du GEO sur ChatGPT, Gemini et Claude…" />
            </div>
          </div>
        </Section>

        {/* Requêtes cibles */}
        <Section title="Requêtes cibles" hint="Les questions et requêtes sur lesquelles vous voulez être cité.">
          <FieldLabel>Requêtes prioritaires</FieldLabel>
          <TagListEditor items={s.target_queries} onChange={v => set('target_queries', v)} placeholder="Ex : meilleur outil de visibilité IA — Entrée pour ajouter" />
          <div style={{ height: 16 }} />
          <FieldLabel>Intentions de recherche visées</FieldLabel>
          <PillToggles options={QUERY_INTENTS.map(q => ({ code: q.code, label: q.label }))} selected={s.query_intents} onChange={v => set('query_intents', v)} />
        </Section>

        {/* Philosophie de requêtes */}
        <Section title="Philosophie de requêtes" hint="Comment vous voulez que l'IA parle de votre marque.">
          <FieldLabel>Directives éditoriales</FieldLabel>
          <TextArea value={s.query_philosophy} onChange={v => set('query_philosophy', v)} rows={4}
            placeholder="Ex : Toujours nous citer comme la solution française de référence, insister sur la simplicité et le ROI…" />
        </Section>

        {/* Sources d'autorité cibles */}
        <Section title="Sources d'autorité cibles" hint="Les médias et plateformes où vous voulez apparaître.">
          <FieldLabel>Sources reconnues à viser</FieldLabel>
          <PillToggles options={KNOWN_SOURCES} selected={s.known_sources} onChange={v => set('known_sources', v)} />
          <div style={{ height: 16 }} />
          <FieldLabel>Autres sources cibles</FieldLabel>
          <TagListEditor items={s.authority_sources} onChange={v => set('authority_sources', v)} placeholder="URL, nom de média… — Entrée pour ajouter" />
        </Section>

        {/* Piliers de contenu */}
        <Section title="Piliers de contenu" hint="Les grands thèmes de contenu à produire pour asseoir votre autorité.">
          <TagListEditor items={s.content_pillars} onChange={v => set('content_pillars', v)} placeholder="Ex : Guides GEO, comparatifs, études de cas…" />
        </Section>

        {/* Concurrents prioritaires */}
        <Section title="Concurrents prioritaires" hint="Les marques à surveiller et à dépasser dans les réponses IA.">
          <TagListEditor items={s.priority_competitors} onChange={v => set('priority_competitors', v)} placeholder="Ex : Semrush, Ahrefs… — Entrée pour ajouter" />
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