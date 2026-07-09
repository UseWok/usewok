import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, BookOpen, ArrowLeft, ArrowRight, Wand2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { getCachedUser, peekCache, setCache } from '@/lib/data-cache';
import { loadBrandKnowledge, saveBrandKnowledge, emptyBrandKnowledge } from '@/lib/brand-knowledge';
import { BK_STEPS, completionPercent, isStepComplete } from '@/lib/brand-knowledge-steps';
import CompletionMeter from '@/components/brand/CompletionMeter';
import GuidedStep from '@/components/brand/GuidedStep';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#111827';
const INK3 = '#6B7280';
const BORDER = '#E5E7EB';
const BG = '#FBFAF7';
const VIOLET = '#7B4FE0';

// AI-suggestion pools by tag field. Filled after "Generate a draft".
const SUGGEST_KEYS = ['value_keywords', 'use_cases', 'authority_topics', 'pre_purchase_questions', 'objections', 'avoid_topics'];

export default function BrandKnowledge() {
  const navigate = useNavigate();
  const _active0 = getActiveDomain();
  const _seed = peekCache(`bk_${_active0?.url || 'all'}`);
  const [profile, setProfile] = useState(_seed?.profile || null);
  const [extra, setExtra] = useState(_seed?.extra || {});
  const [k, setK] = useState(_seed?.knowledge || emptyBrandKnowledge());
  const [phase, setPhase] = useState(_seed ? 'ready' : 'loading');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);   // -1 = intro/welcome screen
  const [suggestions, setSuggestions] = useState({}); // AI-suggested chips per field
  const [autofilled, setAutofilled] = useState(false);

  const set = (field, value) => setK(prev => ({ ...prev, [field]: value }));

  const load = async () => {
    const active = getActiveDomain();
    setPhase(prev => (peekCache(`bk_${active?.url || 'all'}`) ? 'ready' : 'loading'));
    try {
      const u = await getCachedUser();
      setUser(u);
      const { profile: p, extra: ex, knowledge } = await loadBrandKnowledge(active?.url);
      if (!p) { if (!peekCache(`bk_${active?.url || 'all'}`)) setPhase('no_profile'); return; }
      setProfile(p); setExtra(ex); setK(knowledge);
      const pct = completionPercent(knowledge);
      // If they already have data, drop them straight into the guided review; else the welcome screen.
      setStepIndex(pct > 0 ? 0 : -1);
      setPhase('ready');
      setCache(`bk_${active?.url || 'all'}`, { profile: p, extra: ex, knowledge });
    } catch { if (!peekCache(`bk_${active?.url || 'all'}`)) setPhase('no_profile'); }
  };

  useEffect(() => {
    load();
    const unsub = onActiveDomainChange(() => load());
    return unsub;
  }, []);

  // Persist silently (called on step change + explicit finish)
  const persist = async (silent = true) => {
    if (!profile) return;
    setSaving(true);
    try {
      const newExtra = await saveBrandKnowledge(profile, extra, k);
      setExtra(newExtra);
      setCache(`bk_${profile?.site_url || 'all'}`, { profile, extra: newExtra, knowledge: k });
      if (!silent) toast.success('Brand profile saved');
    } catch {
      if (!silent) toast.error('Failed to save');
    } finally { setSaving(false); }
  };

  // Pre-fill: write a first draft from the website so the user never starts blank.
  const generateDraft = async () => {
    if (!profile?.site_url) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateBrandKnowledge', {
        url: profile.site_url,
        business_name: k.business_name || profile.identity_name || '',
      });
      if (!res?.data || res.data.error) { toast.error(res?.data?.error || 'Could not write a draft right now'); setGenerating(false); return; }
      const gen = res.data.knowledge || {};
      // Fill empty fields with the draft; keep anything the user already typed.
      setK(prev => {
        const next = { ...prev };
        Object.keys(gen).forEach(key => {
          const cur = prev[key];
          const isEmpty = Array.isArray(cur) ? cur.length === 0 : !(cur && String(cur).trim());
          if (isEmpty && gen[key] != null) next[key] = gen[key];
        });
        next.site_url = prev.site_url || gen.site_url || profile.site_url;
        return next;
      });
      // Keep the AI arrays as clickable suggestions too.
      const sug = {};
      SUGGEST_KEYS.forEach(key => { if (Array.isArray(gen[key])) sug[key] = gen[key]; });
      setSuggestions(sug);
      setAutofilled(true);
      setStepIndex(0);
      toast.success('First draft ready — just review and tweak it');
    } catch {
      toast.error('Draft generation failed');
    } finally { setGenerating(false); }
  };

  // ── Loading / no-profile states ──
  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: VIOLET, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (phase === 'no_profile') {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: F, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <BookOpen size={22} color={INK3} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Add your website first</p>
        <p style={{ fontSize: 13, color: INK3, margin: '0 0 16px', maxWidth: 340 }}>Once your site is added, we'll write your brand profile for you — you just review it.</p>
        <button onClick={() => navigate('/app')} style={{ padding: '11px 22px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Go to Home</button>
      </div>
    );
  }

  const pct = completionPercent(k);
  const domainLabel = (profile?.site_url || '').replace(/https?:\/\//, '').split('/')[0];

  // ═══════════ WELCOME / INTRO SCREEN (stepIndex === -1) ═══════════
  if (stepIndex === -1) {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: 460, width: '100%', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 20, padding: '34px 30px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: '#F5F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Sparkles size={28} color={VIOLET} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: INK, margin: '0 0 10px', letterSpacing: '-0.02em' }}>Let's teach AI about your brand</h1>
          <p style={{ fontSize: 14.5, color: INK3, margin: '0 0 8px', lineHeight: 1.6 }}>
            No blank pages, no jargon. We'll write a first draft from <strong style={{ color: INK }}>{domainLabel}</strong>, then walk you through it one question at a time.
          </p>
          <p style={{ fontSize: 13, color: INK3, margin: '0 0 24px', lineHeight: 1.6 }}>
            The more complete your profile, the more precisely AI recommends you instead of a generic competitor.
          </p>
          <button onClick={generateDraft} disabled={generating}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 700, cursor: generating ? 'default' : 'pointer', opacity: generating ? 0.7 : 1, fontFamily: F, marginBottom: 10 }}>
            {generating
              ? <><span style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> Writing your draft…</>
              : <><Wand2 size={16} /> Write my draft automatically</>}
          </button>
          <button onClick={() => setStepIndex(0)}
            style={{ background: 'none', border: 'none', color: INK3, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
            I'd rather fill it in myself
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </motion.div>
      </div>
    );
  }

  // ═══════════ GUIDED STEPS ═══════════
  const step = BK_STEPS[stepIndex];
  const isLast = stepIndex === BK_STEPS.length - 1;
  const stepDone = isStepComplete(step, k);

  const goNext = async () => {
    await persist(true);
    if (isLast) { await persist(false); setStepIndex('done'); }
    else setStepIndex(i => i + 1);
  };
  const goBack = () => { if (stepIndex > 0) setStepIndex(i => i - 1); };

  // ═══════════ FINAL / DONE SCREEN ═══════════
  if (stepIndex === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: 440, width: '100%', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 20, padding: '34px 30px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
            <Check size={30} color={VIOLET} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 23, fontWeight: 800, color: INK, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Your brand profile is saved</h1>
          <p style={{ fontSize: 14, color: INK3, margin: '0 0 20px', lineHeight: 1.6 }}>
            AI now knows who you are. Your profile is <strong style={{ color: VIOLET }}>{pct}% complete</strong> — the more you add, the sharper your AI answers.
          </p>
          <div style={{ marginBottom: 22 }}><CompletionMeter percent={pct} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStepIndex(0)}
              style={{ flex: 1, padding: '12px', background: '#F5F3FF', color: VIOLET, border: `1px solid #EDE9FE`, borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              Review again
            </button>
            <button onClick={() => navigate('/app')}
              style={{ flex: 1, padding: '12px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              Done
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      {/* Top bar — progress dots + completion */}
      <div style={{ padding: '18px 24px 14px', borderBottom: `1px solid ${BORDER}`, background: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 620, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate('/app')} title="Back to Home"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: '#fff', cursor: 'pointer', flexShrink: 0, color: INK3 }}>
            <ArrowLeft size={15} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>Step {stepIndex + 1} of {BK_STEPS.length}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: VIOLET }}>{pct}% complete</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {BK_STEPS.map((s, i) => (
                <button key={s.id} onClick={() => setStepIndex(i)}
                  title={s.title}
                  style={{ flex: 1, height: 5, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer',
                    background: i < stepIndex ? VIOLET : i === stepIndex ? VIOLET : '#E9E5F5',
                    opacity: i <= stepIndex ? 1 : 0.5, transition: 'all 200ms' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '30px 24px 130px' }}>
        {/* Draft helper — only when nothing autofilled yet on step 0 */}
        {!autofilled && stepIndex === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F5F0FF', border: '1px solid #EDE4FF', borderRadius: 12, padding: '12px 14px', marginBottom: 22 }}>
            <Wand2 size={16} color={VIOLET} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 12.5, color: '#5B21B6', lineHeight: 1.5 }}>Don't want to type it all? Let us write a first draft from your site.</span>
            <button onClick={generateDraft} disabled={generating}
              style={{ flexShrink: 0, padding: '7px 13px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: generating ? 'default' : 'pointer', opacity: generating ? 0.7 : 1, fontFamily: F, whiteSpace: 'nowrap' }}>
              {generating ? 'Writing…' : 'Write draft'}
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <GuidedStep key={step.id} step={step} k={k} set={set} suggestions={suggestions} />
        </AnimatePresence>
      </div>

      {/* Bottom nav bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, background: '#fff', borderTop: `1px solid ${BORDER}`, padding: '14px 24px', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={goBack} disabled={stepIndex === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px', border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 11, fontSize: 13.5, fontWeight: 600, color: INK3, cursor: stepIndex === 0 ? 'default' : 'pointer', opacity: stepIndex === 0 ? 0.4 : 1, fontFamily: F }}>
            <ChevronLeft size={15} /> Back
          </button>
          <span style={{ flex: 1, fontSize: 12, color: INK3, textAlign: 'center' }}>
            {stepDone ? '✓ Looking good' : 'You can skip and come back anytime'}
          </span>
          <button onClick={goNext} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 20px', border: 'none', background: VIOLET, borderRadius: 11, fontSize: 13.5, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: F }}>
            {isLast ? (saving ? 'Saving…' : 'Finish') : 'Next'} <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}