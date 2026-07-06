import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pencil, Check, X, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import {
  loadBrandKnowledge, saveBrandKnowledge, emptyBrandKnowledge,
  SCOPES,
} from '@/lib/brand-knowledge';
import { Section, FieldLabel, FieldValue, TextInput, TextArea, SelectInput, FieldDivider } from '@/components/brand/BrandField';
import TagListEditor, { PillList } from '@/components/brand/TagListEditor';

const INK = '#111827';
const INK3 = '#6B7280';
const BORDER = '#E5E7EB';
const BG = '#FFFFFF';
const VIOLET = '#7B4FE0';
const GREEN = '#059669';
const GREEN_BG = '#D1FAE5';

export default function BrandKnowledge() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [extra, setExtra] = useState({});
  const [k, setK] = useState(emptyBrandKnowledge());
  const [phase, setPhase] = useState('loading');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [user, setUser] = useState(null);

  const set = (field, value) => { setK(prev => ({ ...prev, [field]: value })); setDirty(true); };

  const load = async () => {
    setPhase('loading');
    try {
      const u = await base44.auth.me();
      setUser(u);
      const active = getActiveDomain();
      const { profile: p, extra: ex, knowledge } = await loadBrandKnowledge(active?.url);
      if (!p) { setPhase('no_profile'); return; }
      setProfile(p); setExtra(ex); setK(knowledge);
      setUpdatedAt(ex.brand_knowledge_updated_at || null);
      setDirty(false);
      setEditMode(false);
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
      setEditMode(false);
      toast.success('Brand Knowledge enregistré');
    } catch {
      toast.error("Échec de l'enregistrement");
    } finally { setSaving(false); }
  };

  const cancelEdit = () => {
    load();
  };

  const generate = async () => {
    if (!profile?.site_url) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateBrandKnowledge', {
        url: profile.site_url,
        business_name: k.business_name || profile.identity_name || '',
      });
      if (!res?.data || res.data.error) { toast.error(res?.data?.error || 'Échec de la génération'); setGenerating(false); return; }
      const gen = res.data.knowledge || {};
      setK(prev => ({
        ...prev,
        ...gen,
        business_name: gen.business_name || prev.business_name,
        site_url: prev.site_url,
      }));
      setDirty(true);
      setEditMode(true);
      toast.success('Brand Knowledge généré par l\'IA — vérifiez et enregistrez');
    } catch {
      toast.error('Échec de la génération IA');
    } finally { setGenerating(false); }
  };

  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: VIOLET, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (phase === 'no_profile') {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F9FAFB', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <BookOpen size={22} color={INK3} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Aucun site analysé</p>
        <p style={{ fontSize: 12, color: INK3, margin: '0 0 16px' }}>Analysez votre site depuis l'accueil pour renseigner votre Brand Knowledge.</p>
        <button onClick={() => navigate('/app')} style={{ padding: '10px 20px', background: INK, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>← Accueil</button>
      </div>
    );
  }

  const domainLabel = (profile?.site_url || '').replace(/https?:\/\//, '').split('/')[0];
  const userName = user?.full_name || user?.email?.split('@')[0] || '—';
  const userRole = user?.role === 'admin' ? 'Admin' : 'Utilisateur';
  const meta = updatedAt
    ? `Mis à jour par : ${userName} | ${userRole} · ${new Date(updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : `Généré par l'IA · ${domainLabel}`;
  const isSaved = !dirty && updatedAt;

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '24px 32px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${BORDER}` }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Brand Knowledge</h1>
            {isSaved && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: GREEN_BG, color: GREEN, borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                <Check size={11} /> Validée
              </span>
            )}
            {dirty && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: '#FEF3C7', color: '#D97706', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                Brouillon
              </span>
            )}
          </div>
          <p style={{ fontSize: 12.5, color: INK3, margin: '4px 0 0' }}>Racontez qui vous êtes à l'IA — plus c'est clair, mieux elle parle de vous.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {!editMode ? (
            <>
              <button onClick={generate} disabled={generating}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: VIOLET, cursor: generating ? 'default' : 'pointer', opacity: generating ? 0.6 : 1 }}>
                {generating
                  ? <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(123,79,224,0.3)', borderTopColor: VIOLET, animation: 'spin 0.7s linear infinite' }} />
                  : <Sparkles size={13} />}
                {generating ? 'Génération…' : 'Générer avec l\'IA'}
              </button>
              <button onClick={() => setEditMode(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: `1px solid ${BORDER}`, background: '#F9FAFB', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: INK, cursor: 'pointer' }}>
                <Pencil size={13} color={VIOLET} /> Modifier
              </button>
            </>
          ) : (
            <>
              <button onClick={cancelEdit} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: INK3, cursor: 'pointer' }}>
                <X size={13} /> Annuler
              </button>
              <button onClick={save} disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: 'none', background: VIOLET, borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                {saving ? <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> : <Check size={13} />}
                Enregistrer
              </button>
            </>
          )}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ maxWidth: 820, margin: '0 auto', padding: '20px 32px 120px' }}>

        {/* Qui vous êtes */}
        <Section title="Qui vous êtes" icon="🏷️" hint="Les infos de base sur votre entreprise. C'est ce que l'IA doit savoir en premier.">
          {editMode ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <FieldLabel>Nom de votre entreprise</FieldLabel>
                <TextInput value={k.business_name} onChange={v => set('business_name', v)} placeholder="Ex : UseWok" />
              </div>
              <div>
                <FieldLabel>Votre domaine d'activité</FieldLabel>
                <TextInput value={k.industry} onChange={v => set('industry', v)} placeholder="Ex : logiciel marketing" />
              </div>
              <div>
                <FieldLabel>Adresse de votre site</FieldLabel>
                <TextInput value={k.site_url} onChange={v => set('site_url', v)} placeholder="usewok.com" />
              </div>
              <div>
                <FieldLabel>Où êtes-vous basé ?</FieldLabel>
                <TextInput value={k.headquarters} onChange={v => set('headquarters', v)} placeholder="Ex : Paris, France" />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><FieldLabel>Nom de votre entreprise</FieldLabel><FieldValue value={k.business_name} /></div>
              <div><FieldLabel>Votre domaine d'activité</FieldLabel><FieldValue value={k.industry} /></div>
              <div><FieldLabel>Adresse de votre site</FieldLabel><FieldValue value={k.site_url} /></div>
              <div><FieldLabel>Où êtes-vous basé ?</FieldLabel><FieldValue value={k.headquarters} /></div>
            </div>
          )}
        </Section>

        {/* À qui vous vendez */}
        <Section title="À qui vous vendez" icon="🎯" hint="Décrivez vos clients : qui sont-ils et où se trouvent-ils ?">
          {editMode ? (
            <>
              <FieldLabel>Vos clients types</FieldLabel>
              <TextArea value={k.audience} onChange={v => set('audience', v)} rows={2} placeholder="Ex : dirigeants de PME, responsables marketing…" />
              <FieldDivider />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <FieldLabel>Quel type de clients ?</FieldLabel>
                  <TextInput value={k.target_segment} onChange={v => set('target_segment', v)} placeholder="Ex : petites entreprises" />
                </div>
                <div>
                  <FieldLabel>Où vendez-vous ?</FieldLabel>
                  <SelectInput value={k.scope} onChange={v => set('scope', v)} options={SCOPES.map(s => ({ value: s, label: s === 'Worldwide' ? 'Dans le monde entier' : s === 'National' ? 'Dans tout le pays' : s === 'Continental' ? 'Sur le continent' : s === 'Regional' ? 'Dans ma région' : 'Autour de moi' }))} />
                </div>
              </div>
            </>
          ) : (
            <>
              <FieldLabel>Vos clients types</FieldLabel>
              <FieldValue value={k.audience} />
              <FieldDivider />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><FieldLabel>Quel type de clients ?</FieldLabel><FieldValue value={k.target_segment} /></div>
                <div><FieldLabel>Où vendez-vous ?</FieldLabel><FieldValue value={k.scope === 'Worldwide' ? 'Dans le monde entier' : k.scope} /></div>
              </div>
            </>
          )}
        </Section>

        {/* Ce qui vous rend unique */}
        <Section title="Ce qui vous rend unique" icon="💎" hint="Pourquoi un client vous choisirait vous plutôt qu'un concurrent. Ajoutez jusqu'à 5 points forts.">
          {editMode ? (
            <>
              <FieldLabel>En une phrase, qu'est-ce que vous faites de mieux ?</FieldLabel>
              <TextArea value={k.value_description} onChange={v => set('value_description', v)} rows={3} placeholder="Ex : on aide les entreprises à apparaître dans les réponses de ChatGPT…" />
              <FieldDivider />
              <FieldLabel>Vos points forts (5 max)</FieldLabel>
              <TagListEditor items={k.value_keywords} onChange={v => set('value_keywords', v)} placeholder="Ex : simple à utiliser, résultats rapides…" />
            </>
          ) : (
            <>
              <FieldLabel>En une phrase, qu'est-ce que vous faites de mieux ?</FieldLabel>
              <FieldValue value={k.value_description} />
              <FieldDivider />
              <FieldLabel>Vos points forts</FieldLabel>
              <PillList items={k.value_keywords} />
            </>
          )}
        </Section>

        {/* Comment on vous utilise */}
        <Section title="Comment on vous utilise" icon="🛠️" hint="Les situations concrètes où vos clients font appel à vous. 5 max.">
          {editMode ? (
            <TagListEditor items={k.use_cases} onChange={v => set('use_cases', v)} placeholder="Ex : vérifier sa présence sur l'IA…" />
          ) : (
            <PillList items={k.use_cases} />
          )}
        </Section>

        {/* Vos sujets d'expertise */}
        <Section title="Vos sujets d'expertise" icon="🧠" hint="Les thèmes sur lesquels vous êtes reconnu comme un expert. 5 max.">
          {editMode ? (
            <TagListEditor items={k.authority_topics} onChange={v => set('authority_topics', v)} placeholder="Ex : visibilité sur l'IA, référencement…" />
          ) : (
            <PillList items={k.authority_topics} />
          )}
        </Section>

        {/* Ce que vos clients se demandent */}
        <Section title="Ce que vos clients se demandent" icon="❓" hint="Les questions que se posent les gens avant d'acheter chez vous. 5 max.">
          {editMode ? (
            <TagListEditor items={k.pre_purchase_questions} onChange={v => set('pre_purchase_questions', v)} placeholder="Ex : comment être cité par les IA ?" />
          ) : (
            <PillList items={k.pre_purchase_questions} />
          )}
        </Section>

        {/* Les freins à l'achat */}
        <Section title="Les freins à l'achat" icon="🚧" hint="Les hésitations ou objections courantes que vous devez lever. 5 max.">
          {editMode ? (
            <TagListEditor items={k.objections} onChange={v => set('objections', v)} placeholder="Ex : est-ce compliqué à mettre en place ?" />
          ) : (
            <PillList items={k.objections} />
          )}
        </Section>

        {/* À ne pas associer à vous */}
        <Section title="À ne pas associer à vous" icon="🙅" hint="Les sujets dont vous ne voulez surtout pas qu'on parle à votre propos.">
          {editMode ? (
            <>
              <FieldLabel>Sujets à éviter</FieldLabel>
              <TextArea value={k.avoid_topics?.join(', ')} onChange={v => set('avoid_topics', v.split(',').map(s => s.trim()).filter(Boolean))} rows={2} placeholder="Ex : sujets sensibles, concurrents…" />
            </>
          ) : (
            <>
              <FieldLabel>Sujets à éviter</FieldLabel>
              {k.avoid_topics?.length > 0
                ? <PillList items={k.avoid_topics} />
                : <FieldValue value={null} />}
            </>
          )}
        </Section>
      </motion.div>

      {/* Bottom save bar when dirty and in edit mode */}
      {dirty && editMode && (
        <motion.div initial={{ y: 60 }} animate={{ y: 0 }}
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: '#fff', borderTop: `1px solid ${BORDER}`, padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: 12.5, color: INK3, marginRight: 'auto' }}>Modifications non enregistrées</span>
          <button onClick={cancelEdit} style={{ padding: '8px 16px', border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: INK3, cursor: 'pointer' }}>Annuler</button>
          <button onClick={save} disabled={saving} style={{ padding: '8px 20px', border: 'none', background: VIOLET, borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </motion.div>
      )}
    </div>
  );
}