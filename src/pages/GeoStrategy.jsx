import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCcw, Check, Target } from 'lucide-react';
import { toast } from 'sonner';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { peekCache, setCache } from '@/lib/data-cache';
import {
  loadGeoStrategy, saveGeoStrategy, emptyGeoStrategy,
  POSITIONING_TARGETS, QUERY_INTENTS, KNOWN_SOURCES,
} from '@/lib/geo-strategy';
import { Section, FieldLabel, TextArea, SelectInput } from '@/components/brand/BrandField';
import TagListEditor from '@/components/brand/TagListEditor';
import { PillToggles } from '@/components/brand/CheckPicker';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#1A1A1A';
const INK3 = '#8A8A93';
const BORDER = '#E3DFD6';
const SURFACE = '#F5F0E8';
const VIOLET = '#7B4FE0';

export default function GeoStrategy() {
  const navigate = useNavigate();
  const _active0 = getActiveDomain();
  const _seed = peekCache(`geo_${_active0?.url || 'all'}`);
  const [profile, setProfile] = useState(_seed?.profile || null);
  const [extra, setExtra] = useState(_seed?.extra || {});
  const [s, setS] = useState(_seed?.strategy || emptyGeoStrategy());
  const [phase, setPhase] = useState(_seed ? 'ready' : 'loading');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const set = (field, value) => { setS(prev => ({ ...prev, [field]: value })); setDirty(true); };

  const load = async () => {
    const active = getActiveDomain();
    setPhase(prev => (peekCache(`geo_${active?.url || 'all'}`) ? 'ready' : 'loading'));
    try {
      const { profile: p, extra: ex, strategy } = await loadGeoStrategy(active?.url);
      if (!p) { if (!peekCache(`geo_${active?.url || 'all'}`)) setPhase('no_profile'); return; }
      setProfile(p); setExtra(ex); setS(strategy);
      setUpdatedAt(ex.geo_strategy_updated_at || null);
      setDirty(false);
      setPhase('ready');
      setCache(`geo_${active?.url || 'all'}`, { profile: p, extra: ex, strategy });
    } catch { if (!peekCache(`geo_${active?.url || 'all'}`)) setPhase('no_profile'); }
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
      setCache(`geo_${profile?.site_url || 'all'}`, { profile, extra: newExtra, strategy: s });
      toast.success('GEO Strategy saved');
    } catch {
      toast.error('Failed to save');
    } finally { setSaving(false); }
  };

  if (phase === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: INK, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (phase === 'no_profile') {
    return (
      <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Target size={22} color={INK3} />
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>No site analyzed</p>
        <p style={{ fontSize: 12, color: INK3, margin: '0 0 16px' }}>Analyze your site from the home page to define your GEO Strategy.</p>
        <button onClick={() => navigate('/app')} style={{ padding: '10px 20px', background: INK, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Home</button>
      </div>
    );
  }

  const domainLabel = (profile?.site_url || '').replace(/https?:\/\//, '').split('/')[0];

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>
      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: SURFACE, padding: '18px 24px 12px', paddingTop: 'max(18px, env(safe-area-inset-top))', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Your AI visibility plan</h1>
          <p style={{ fontSize: 12, color: INK3, margin: '4px 0 0' }}>
            Tell the AI how you want to be seen · {domainLabel}{updatedAt ? ` · updated ${new Date(updatedAt).toLocaleDateString('en-US')}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={load} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 9, fontSize: 12.5, fontWeight: 600, color: INK, cursor: 'pointer', fontFamily: F }}>
            <RotateCcw size={12} /> Cancel
          </button>
          <button onClick={save} disabled={saving || !dirty}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: 'none', background: dirty ? VIOLET : '#C9C4B8', borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: dirty && !saving ? 'pointer' : 'default', transition: 'background 120ms', fontFamily: F }}>
            {saving ? <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> : <Check size={13} />}
            Save
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ maxWidth: 1080, margin: '0 auto', padding: '8px 24px 120px' }}>

        {/* How you want to be seen */}
        <Section title="How you want to be seen" icon="⭐" hint="The role you'd like AI to give you when it talks about your field.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
            <div>
              <FieldLabel>Your ideal position</FieldLabel>
              <SelectInput value={s.positioning_target} onChange={v => set('positioning_target', v)} options={POSITIONING_TARGETS} />
            </div>
            <div>
              <FieldLabel>In a few words, how would you like to be presented?</FieldLabel>
              <TextArea value={s.positioning_note} onChange={v => set('positioning_note', v)} rows={3}
                placeholder="e.g. the simplest French solution to be visible on AI…" />
            </div>
          </div>
        </Section>

        {/* Questions where you want to appear */}
        <Section title="Questions where you want to appear" icon="🔍" hint="When someone asks these questions to ChatGPT, you want to be the answer. 5 max.">
          <FieldLabel>Your priority questions (5 max)</FieldLabel>
          <TagListEditor items={s.target_queries} onChange={v => set('target_queries', v)} placeholder="e.g. what's the best tool for AI visibility?" />
          <div style={{ height: 16 }} />
          <FieldLabel>What your customers are looking for</FieldLabel>
          <PillToggles options={QUERY_INTENTS.map(q => ({ code: q.code, label: q.label }))} selected={s.query_intents} onChange={v => set('query_intents', v)} />
        </Section>

        {/* The tone to set */}
        <Section title="The tone to set" icon="💬" hint="How you want AI to talk about you: the style, the words, the angle.">
          <FieldLabel>Your guidelines</FieldLabel>
          <TextArea value={s.query_philosophy} onChange={v => set('query_philosophy', v)} rows={4}
            placeholder="e.g. always present us as the simple and fast solution, emphasize results…" />
        </Section>

        {/* Where you want to appear */}
        <Section title="Where you want to appear" icon="📰" hint="Sites and media that, if they talk about you, boost your credibility. 5 max.">
          <FieldLabel>Recognized media to target</FieldLabel>
          <PillToggles options={KNOWN_SOURCES} selected={s.known_sources} onChange={v => set('known_sources', v)} />
          <div style={{ height: 16 }} />
          <FieldLabel>Other sites that matter to you (5 max)</FieldLabel>
          <TagListEditor items={s.authority_sources} onChange={v => set('authority_sources', v)} placeholder="e.g. name of a blog or media…" />
        </Section>

        {/* Topics to highlight */}
        <Section title="Topics to highlight" icon="📚" hint="The main content themes to produce to become a reference. 5 max.">
          <TagListEditor items={s.content_pillars} onChange={v => set('content_pillars', v)} placeholder="e.g. practical guides, comparisons, testimonials…" />
        </Section>

        {/* Competitors to beat */}
        <Section title="Competitors to beat" icon="🏁" hint="Brands you want to beat in AI answers. 5 max.">
          <TagListEditor items={s.priority_competitors} onChange={v => set('priority_competitors', v)} placeholder="e.g. Semrush, Ahrefs…" />
        </Section>
      </motion.div>

      {/* Bottom save bar when dirty */}
      {dirty && (
        <motion.div initial={{ y: 60 }} animate={{ y: 0 }}
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: '#fff', borderTop: `1px solid ${BORDER}`, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
          <span style={{ fontSize: 12.5, color: INK3, marginRight: 'auto' }}>Unsaved changes</span>
          <button onClick={load} style={{ padding: '9px 16px', border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 9, fontSize: 12.5, fontWeight: 600, color: INK, cursor: 'pointer', fontFamily: F }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ padding: '9px 20px', border: 'none', background: VIOLET, borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: F }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </motion.div>
      )}
    </div>
  );
}