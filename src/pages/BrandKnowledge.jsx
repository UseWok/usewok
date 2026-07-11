import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Check, X, BookOpen, Sparkles, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { peekCache, setCache } from '@/lib/data-cache';
import { loadBrandKnowledge, saveBrandKnowledge, emptyBrandKnowledge } from '@/lib/brand-knowledge';
import { BK_SECTIONS, completionPercent } from '@/lib/brand-knowledge-steps';
import { answeredCount } from '@/lib/brand-knowledge-questions';
import { FieldLabel, FieldValue, TextInput, TextArea } from '@/components/brand/BrandField';
import TagListEditor, { PillList } from '@/components/brand/TagListEditor';
import ChoiceChips from '@/components/brand/ChoiceChips';
import BrandOnboarding from '@/components/brand/BrandOnboarding';
import BrandKnowledgeSkeleton from '@/components/skeletons/BrandKnowledgeSkeleton';
import InfoTip from '@/components/ui/InfoTip';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#111827';
const INK3 = '#6B7280';
const BORDER = '#E5E7EB';
const BG = '#FBFAF7';
const VIOLET = '#7B4FE0';

const isTags = (t) => t === 'tags';
const filled = (v) => Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim());

export default function BrandKnowledge() {
  const navigate = useNavigate();
  const _active0 = getActiveDomain();
  const _seed = peekCache(`bk_${_active0?.url || 'all'}`);
  const [profile, setProfile] = useState(_seed?.profile || null);
  const [extra, setExtra] = useState(_seed?.extra || {});
  const [k, setK] = useState(_seed?.knowledge || emptyBrandKnowledge());
  const [phase, setPhase] = useState(_seed ? 'ready' : 'loading');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(null); // snapshot while editing

  // ── Onboarding conversationnel ──
  const [mode, setMode] = useState(null);       // 'onboarding' | 'summary' (décidé au chargement)
  const [prefilling, setPrefilling] = useState(false);
  const [aiQuestionLoading, setAiQuestionLoading] = useState(false);
  const aiCacheRef = useRef({});
  const aiCacheFetchedRef = useRef(false);
  const prefilledRef = useRef({}); // évite de re-prefiller le même site

  const load = async () => {
    const active = getActiveDomain();
    setPhase(prev => (peekCache(`bk_${active?.url || 'all'}`) ? 'ready' : 'loading'));
    try {
      const { profile: p, extra: ex, knowledge } = await loadBrandKnowledge(active?.url);
      if (!p) { if (!peekCache(`bk_${active?.url || 'all'}`)) setPhase('no_profile'); return; }
      setProfile(p); setExtra(ex); setK(knowledge);
      setPhase('ready');
      setCache(`bk_${active?.url || 'all'}`, { profile: p, extra: ex, knowledge });

      // Décide du mode : profil peu rempli → onboarding conversationnel
      const answered = answeredCount(knowledge);
      const initialMode = answered >= 6 ? 'summary' : 'onboarding';
      setMode(initialMode);

      // Pré-remplissage IA une seule fois par site, quand c'est encore vide
      if (initialMode === 'onboarding' && answered <= 2 && !prefilledRef.current[p.site_url]) {
        prefilledRef.current[p.site_url] = true;
        prefill(p, knowledge, ex);
      }
    } catch { if (!peekCache(`bk_${active?.url || 'all'}`)) setPhase('no_profile'); }
  };

  // Analyse le site et pré-remplit les champs vides (l'utilisateur valide/corrige ensuite)
  const prefill = async (p, currentKnowledge, ex) => {
    setPrefilling(true);
    try {
      const res = await base44.functions.invoke('generateBrandKnowledge', {
        url: p.site_url, business_name: p.identity_name || '',
      });
      const ai = res?.data?.knowledge;
      if (ai && typeof ai === 'object') {
        setK(prev => {
          const merged = { ...prev };
          for (const [key, aiVal] of Object.entries(ai)) {
            // ne remplit que les champs encore vides — on ne touche pas à ce que l'utilisateur a déjà mis
            if (!filled(merged[key]) && filled(aiVal)) merged[key] = aiVal;
          }
          return merged;
        });
      }
    } catch { /* silencieux : l'onboarding fonctionne même sans pré-remplissage */ }
    finally { setPrefilling(false); }
  };

  useEffect(() => {
    load();
    const unsub = onActiveDomainChange(() => { setEditing(false); setMode(null); load(); });
    return unsub;
  }, []);

  const startEdit = () => { setDraft({ ...k }); setEditing(true); };
  const cancelEdit = () => { setDraft(null); setEditing(false); };
  const setField = (field, value) => setDraft(prev => ({ ...prev, [field]: value }));

  // Onboarding : met à jour directement k (pas de brouillon)
  const setOnboardingField = (field, value) => setK(prev => ({ ...prev, [field]: value }));

  // L'IA répond à une seule question (cache le résultat complet pour éviter les appels multiples)
  const aiFillQuestion = async (questionKey) => {
    if (!profile) return;
    setAiQuestionLoading(true);
    try {
      if (!aiCacheFetchedRef.current) {
        const res = await base44.functions.invoke('generateBrandKnowledge', {
          url: profile.site_url, business_name: profile.identity_name || '',
        });
        aiCacheRef.current = res?.data?.knowledge || {};
        aiCacheFetchedRef.current = true;
      }
      const aiVal = aiCacheRef.current[questionKey];
      if (aiVal !== undefined && aiVal !== null && aiVal !== '') {
        setK(prev => ({ ...prev, [questionKey]: aiVal }));
        toast.success("Réponse de l'IA ajoutée");
      } else {
        toast.error("L'IA n'a pas pu répondre à cette question");
      }
    } catch {
      toast.error("L'IA n'a pas pu analyser ton site");
    } finally { setAiQuestionLoading(false); }
  };

  const persist = async (knowledge) => {
    if (!profile) return;
    const newExtra = await saveBrandKnowledge(profile, extra, knowledge);
    setExtra(newExtra);
    setK(knowledge);
    setCache(`bk_${profile?.site_url || 'all'}`, { profile, extra: newExtra, knowledge });
  };

  const save = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await persist(draft);
      setEditing(false);
      setDraft(null);
      toast.success('Profil de marque enregistré');
    } catch {
      toast.error("L'enregistrement a échoué");
    } finally { setSaving(false); }
  };

  const finishOnboarding = async () => {
    setSaving(true);
    try {
      await persist(k);
      setMode('summary');
      toast.success('Profil de marque enregistré');
    } catch {
      toast.error("L'enregistrement a échoué");
    } finally { setSaving(false); }
  };

  // ── Chargement ──
  if (phase === 'loading') return <BrandKnowledgeSkeleton />;

  if (phase === 'no_profile') {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: F, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <BookOpen size={22} color={INK3} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Ajoutez d'abord votre site</p>
        <p style={{ fontSize: 13, color: INK3, margin: '0 0 16px', maxWidth: 340 }}>Une fois votre site ajouté, vous pourrez renseigner le profil de marque de votre entreprise.</p>
        <button onClick={() => navigate('/app')} style={{ padding: '11px 22px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Aller à l'accueil</button>
      </div>
    );
  }

  // ═══════════ MODE ONBOARDING CONVERSATIONNEL ═══════════
  if (mode === 'onboarding' && !editing) {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
        <BrandOnboarding
          values={k}
          setValue={setOnboardingField}
          prefilling={prefilling}
          saving={saving}
          onFinish={finishOnboarding}
          onAIFillQuestion={aiFillQuestion}
          aiQuestionLoading={aiQuestionLoading}
        />
      </div>
    );
  }

  // ═══════════ MODE RÉCAPITULATIF / ÉDITION ═══════════
  const pct = completionPercent(k);
  const answered = answeredCount(k);
  const source = editing ? draft : k;

  const renderValue = (f) => {
    if (isTags(f.type)) return <PillList items={source[f.key] || []} />;
    return <FieldValue value={source[f.key]} />;
  };

  const renderEditor = (f) => {
    if (f.type === 'text')     return <TextInput value={draft[f.key] || ''} onChange={v => setField(f.key, v)} placeholder={f.placeholder} />;
    if (f.type === 'textarea') return <TextArea value={draft[f.key] || ''} onChange={v => setField(f.key, v)} rows={f.rows || 3} placeholder={f.placeholder} />;
    if (f.type === 'choice')   return <ChoiceChips value={draft[f.key]} onChange={v => setField(f.key, v)} options={f.options} />;
    if (f.type === 'tags')     return <TagListEditor items={draft[f.key] || []} onChange={v => setField(f.key, v)} placeholder={f.placeholder} chipOptions={f.chipOptions} />;
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      {/* ── En-tête ── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 3px', letterSpacing: '-0.02em' }}>Profil de marque</h1>
            <p style={{ fontSize: 12.5, color: INK3, margin: 0 }}>
              {editing ? "Modifiez les réponses, puis enregistrez." : `Plus ton profil est complet, plus les IA peuvent te citer avec précision · ${pct}% complété`}
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
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => { setEditing(false); setMode('onboarding'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 15px', border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600, color: INK, cursor: 'pointer', fontFamily: F }}>
                <MessageCircle size={14} color={VIOLET} /> Compléter en dialogue
              </button>
              <button onClick={startEdit}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', border: 'none', background: VIOLET, borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: F }}>
                <Pencil size={14} /> Modifier
              </button>
            </div>
          )}
        </div>
        {/* Barre de progression fine */}
        <div style={{ height: 3, background: '#F0EDE6' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: VIOLET, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* ── Contenu ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px 80px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {BK_SECTIONS.map((section) => (
          <section key={section.id} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0, letterSpacing: '-0.01em' }}>{section.title}</h2>
              <p style={{ fontSize: 12.5, color: INK3, margin: '3px 0 0', lineHeight: 1.5 }}>{section.intro}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {section.fields.map((f) => (
                <div key={f.key}>
                  <FieldLabel>{f.label}{f.impact && <InfoTip text={f.impact} />}</FieldLabel>
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
  );
}