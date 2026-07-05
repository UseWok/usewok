import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Check, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import {
  loadBrandKnowledge, saveBrandKnowledge, emptyBrandKnowledge,
  BUSINESS_MODELS, SCOPES, COUNTRIES, LANGUAGES,
} from '@/lib/brand-knowledge';
import { Section, FieldLabel, TextInput, TextArea, SelectInput } from '@/components/brand/BrandField';
import TagListEditor from '@/components/brand/TagListEditor';
import { CheckGrid, PillToggles } from '@/components/brand/CheckPicker';

const INK = '#1A1A1A';
const INK3 = '#8A8A93';
const BORDER = '#E3DFD6';
const SURFACE = '#F5F0E8';
const VIOLET = '#7B4FE0';

export default function BrandKnowledge() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [extra, setExtra] = useState({});
  const [k, setK] = useState(emptyBrandKnowledge());
  const [phase, setPhase] = useState('loading'); // loading | ready | no_profile
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const set = (field, value) => { setK(prev => ({ ...prev, [field]: value })); setDirty(true); };

  const load = async () => {
    setPhase('loading');
    try {
      const active = getActiveDomain();
      const { profile: p, extra: ex, knowledge } = await loadBrandKnowledge(active?.url);
      if (!p) { setPhase('no_profile'); return; }
      setProfile(p); setExtra(ex); setK(knowledge);
      setUpdatedAt(ex.brand_knowledge_updated_at || null);
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
      const newExtra = await saveBrandKnowledge(profile, extra, k);
      setExtra(newExtra);
      setUpdatedAt(newExtra.brand_knowledge_updated_at);
      setDirty(false);
      toast.success('Brand Knowledge enregistré');
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
          <BookOpen size={22} color={INK3} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Aucun site analysé</p>
        <p style={{ fontSize: 12, color: INK3, margin: '0 0 16px' }}>Analysez votre site depuis l'accueil pour renseigner votre Brand Knowledge.</p>
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
          <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Brand Knowledge</h1>
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

        {/* Identité */}
        <Section title="Identité" hint="Extrait par : scan initial · Brand Knowledge · Web">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <FieldLabel>Nom de la marque</FieldLabel>
              <TextInput value={k.business_name} onChange={v => set('business_name', v)} placeholder="UseWok" />
              <div style={{ height: 12 }} />
              <FieldLabel>Secteur d'activité</FieldLabel>
              <TextInput value={k.industry} onChange={v => set('industry', v)} placeholder="SaaS / GEO" />
            </div>
            <div>
              <FieldLabel>Site web</FieldLabel>
              <TextInput value={k.site_url} onChange={v => set('site_url', v)} placeholder="usewok.com" />
              <div style={{ height: 12 }} />
              <FieldLabel>Ville / Siège social</FieldLabel>
              <TextInput value={k.headquarters} onChange={v => set('headquarters', v)} placeholder="Paris, France" />
            </div>
          </div>
        </Section>

        {/* Marché cible */}
        <Section title="Marché cible" hint="Décrit à qui vous vous adressez.">
          <FieldLabel>Personas / clients</FieldLabel>
          <TextArea value={k.audience} onChange={v => set('audience', v)} rows={3}
            placeholder="Dirigeants, responsables marketing, e-commerçants…" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
            <div>
              <FieldLabel>Modèle business</FieldLabel>
              <SelectInput value={k.business_model} onChange={v => set('business_model', v)} options={BUSINESS_MODELS} />
            </div>
            <div>
              <FieldLabel>Focus géographique</FieldLabel>
              <TextInput value={k.target_segment} onChange={v => set('target_segment', v)} placeholder="Marché entier" />
            </div>
          </div>
        </Section>

        {/* Proposition de valeur */}
        <Section title="Proposition de valeur" hint="Ce qui vous rend unique aux yeux des moteurs IA.">
          <FieldLabel>Description</FieldLabel>
          <TextArea value={k.value_description} onChange={v => set('value_description', v)} rows={3}
            placeholder="UseWok aide les professionnels à apparaître dans les réponses des IA comme ChatGPT…" />
          <div style={{ height: 14 }} />
          <FieldLabel>Mots-clés / différenciateurs</FieldLabel>
          <TagListEditor items={k.value_keywords} onChange={v => set('value_keywords', v)} placeholder="Ex : visibilité IA…" />
        </Section>

        {/* Cas d'usage */}
        <Section title="Cas d'usage / Sales Plays" hint="Les situations concrètes où vous êtes la solution.">
          <TagListEditor items={k.use_cases} onChange={v => set('use_cases', v)} placeholder="Ex : Migration vers un pure PMB — Leader Cours en ligne" />
        </Section>

        {/* Sujets d'autorité */}
        <Section title="Sujets d'autorité" hint="Les thèmes sur lesquels les IA doivent vous citer.">
          <TagListEditor items={k.authority_topics} onChange={v => set('authority_topics', v)} placeholder="Ex : GEO, optimisation IA…" />
        </Section>

        {/* Questions avant achat */}
        <Section title="Questions avant achat" hint="Ce que vos prospects demandent aux IA avant de choisir.">
          <TagListEditor items={k.pre_purchase_questions} onChange={v => set('pre_purchase_questions', v)} placeholder="Ex : Quelle solution pour être cité par les IA ?" />
        </Section>

        {/* Objections des prospects */}
        <Section title="Objections des prospects" hint="Les blocages à lever pour convertir.">
          <TagListEditor items={k.objections} onChange={v => set('objections', v)} placeholder="Ex : Est-ce difficile à mettre en place ?" />
        </Section>

        {/* Sujets à éviter */}
        <Section title="Sujets à éviter" hint="Ce que l'IA ne doit pas associer à votre marque.">
          <TagListEditor items={k.avoid_topics} onChange={v => set('avoid_topics', v)} placeholder="Ex : sujets polémiques, concurrents à ne pas mentionner…" />
        </Section>

        {/* Envergure */}
        <Section title="Envergure" hint="La portée géographique de votre marque.">
          <FieldLabel>Envergure de la marque</FieldLabel>
          <SelectInput value={k.scope} onChange={v => set('scope', v)} options={SCOPES.map(s => ({ value: s, label: s === 'Worldwide' ? 'Mondiale' : s === 'National' ? 'Nationale' : s === 'Continental' ? 'Continentale' : s === 'Regional' ? 'Régionale' : 'Locale' }))} />
        </Section>

        {/* Actifs de notoriété */}
        <Section title="Actifs de notoriété existants" hint="Sources externes qui renforcent votre crédibilité.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <FieldLabel>Page Wikipedia (URL)</FieldLabel>
              <TextInput value={k.wikipedia_url} onChange={v => set('wikipedia_url', v)} placeholder="https://fr.wikipedia.org/…" />
            </div>
            <div>
              <FieldLabel>Crunchbase (URL)</FieldLabel>
              <TextInput value={k.crunchbase_url} onChange={v => set('crunchbase_url', v)} placeholder="https://crunchbase.com/…" />
            </div>
          </div>
          <div style={{ height: 14 }} />
          <FieldLabel>Autres sources reconnues</FieldLabel>
          <TagListEditor items={k.other_sources} onChange={v => set('other_sources', v)} placeholder="URL, nom de média… — Entrée pour ajouter" />
        </Section>

        {/* Langues & localisations */}
        <Section title="Langues & localisations" hint="Où et dans quelles langues vous voulez être cité.">
          <FieldLabel>Zones / pays prioritaires</FieldLabel>
          <CheckGrid options={COUNTRIES} selected={k.priority_countries} onChange={v => set('priority_countries', v)} columns={2} />
          <div style={{ height: 18 }} />
          <FieldLabel>Langues des réponses</FieldLabel>
          <PillToggles options={LANGUAGES} selected={k.languages} onChange={v => set('languages', v)} />
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