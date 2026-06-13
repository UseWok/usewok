import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flag, Save, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { PLAN_FEATURE_FLAGS, DEFAULT_PLANS } from '@/lib/plans-config';

// ── Global feature flags (platform-wide) ──────────────────────────
const DEFAULT_FLAGS = [
  { key: 'enable_analytics',      label: 'Analytics Dashboard',  description: 'Show analytics panel in user sidebar',              enabled: true,  category: 'UI' },
  { key: 'enable_version_history',label: 'Version History',       description: 'Cloud-backed version history & bookmarks',          enabled: true,  category: 'Core' },
  { key: 'enable_visual_edits',   label: 'Visual Edit Mode',      description: 'Allow users to toggle visual edit mode',            enabled: true,  category: 'Core' },
  { key: 'enable_mic_recording',  label: 'Mic Recording',         description: 'Voice input in chat bar',                          enabled: true,  category: 'UI' },
  { key: 'enable_mobile_preview', label: 'Mobile Preview',        description: 'Smartphone preview toggle in header',              enabled: true,  category: 'UI' },
  { key: 'enable_referral',       label: 'Referral Program',      description: 'Share WOK referral button in sidebar',             enabled: false, category: 'Growth' },
  { key: 'enable_connectors',     label: 'Connectors',            description: 'OAuth app connectors integration',                 enabled: false, category: 'Integrations' },
  { key: 'enable_team_workspace', label: 'Team Workspaces',       description: 'Multi-member workspace support',                   enabled: false, category: 'Growth' },
  { key: 'maintenance_mode',      label: 'Maintenance Mode',      description: 'Show maintenance banner to all users',             enabled: false, category: 'System' },
  { key: 'beta_features',         label: 'Beta Features',         description: 'Unlock experimental beta features for all users',  enabled: false, category: 'System' },
];

const PLAN_FLAG_DEFS = [
  { key: 'web_search',        label: 'Web Search',         description: 'Google Search capability in builds',          type: 'bool' },
  { key: 'max_model',         label: 'Max AI Model',        description: 'Access to Max/Pro AI models (vs Standard)',   type: 'bool' },
  { key: 'file_upload',       label: 'File Upload',         description: 'Attach files to prompts',                    type: 'bool' },
  { key: 'white_label',       label: 'White-label Badge',   description: 'Remove WOK badge from public links',         type: 'bool' },
  { key: 'concurrent_builds', label: 'Concurrent Builds',   description: 'Max simultaneous active builds',             type: 'number' },
  { key: 'daily_burn_cap',    label: 'Daily Burn Cap',      description: 'Max credits a user can spend per day',       type: 'number' },
];

const CATEGORY_COLORS = { UI: '#3B8BEB', Core: '#F95738', Growth: '#4ade80', Integrations: '#7B4FE0', System: '#E8184A' };
const PLAN_COLORS = { free: '#9CA3AF', starter: '#3B8BEB', creator: '#7B4FE0', pro: '#F95738' };

const DK = { bg: '#111', surface: '#1A1A1A', border: '#222', text: '#fff', muted: '#888' };

function PlanFlagsEditor({ planFlags, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {DEFAULT_PLANS.map(plan => {
        const flags = planFlags[plan.id] || PLAN_FEATURE_FLAGS[plan.id] || {};
        return (
          <div key={plan.id} style={{ background: DK.bg, border: `1px solid ${DK.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderBottom: `1px solid ${DK.border}`, background: DK.surface }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: PLAN_COLORS[plan.id] || '#888', display: 'inline-block' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: DK.text }}>{plan.name}</span>
              <span style={{ fontSize: 11, color: '#555' }}>({(plan.credits_limit || 0).toLocaleString()} credits/mo)</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: DK.border }}>
              {PLAN_FLAG_DEFS.map(def => {
                const val = flags[def.key];
                return (
                  <div key={def.key} style={{ background: DK.surface, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: DK.text, margin: 0 }}>{def.label}</p>
                      <p style={{ fontSize: 10, color: '#555', margin: '2px 0 0' }}>{def.description}</p>
                    </div>
                    {def.type === 'bool' ? (
                      <button
                        onClick={() => onChange(plan.id, def.key, !val)}
                        style={{
                          width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0,
                          background: val ? PLAN_COLORS[plan.id] || '#F95738' : '#2A2A2A', position: 'relative', transition: 'background 200ms',
                        }}
                      >
                        <div style={{ position: 'absolute', top: 2, left: val ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 200ms', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                      </button>
                    ) : (
                      <input
                        type="number"
                        value={val ?? 0}
                        onChange={e => onChange(plan.id, def.key, Number(e.target.value))}
                        style={{ width: 80, background: DK.bg, border: `1px solid ${DK.border}`, borderRadius: 6, color: DK.text, fontSize: 12, padding: '4px 8px', outline: 'none', textAlign: 'right' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [planFlags, setPlanFlags] = useState(PLAN_FEATURE_FLAGS);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');
  const [tab, setTab] = useState('global'); // 'global' | 'plans'

  useEffect(() => {
    // Load global flags
    base44.entities.AppSettings.filter({ key: 'feature_flags' }).then(results => {
      if (results.length > 0) {
        try {
          const saved = JSON.parse(results[0].value);
          setFlags(DEFAULT_FLAGS.map(f => ({ ...f, enabled: saved[f.key] !== undefined ? saved[f.key] : f.enabled })));
        } catch {}
      }
    }).catch(() => {});

    // Load plan-level feature flags
    base44.entities.AppSettings.filter({ key: 'plan_feature_flags' }).then(results => {
      if (results.length > 0) {
        try {
          const saved = JSON.parse(results[0].value);
          setPlanFlags(prev => {
            const merged = { ...prev };
            Object.keys(saved).forEach(planId => { merged[planId] = { ...(prev[planId] || {}), ...saved[planId] }; });
            return merged;
          });
        } catch {}
      }
    }).catch(() => {});
  }, []);

  const toggle = (key) => setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));

  const handlePlanFlagChange = (planId, flagKey, value) => {
    setPlanFlags(prev => ({ ...prev, [planId]: { ...(prev[planId] || {}), [flagKey]: value } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      // Save global flags
      const map = Object.fromEntries(flags.map(f => [f.key, f.enabled]));
      const existing = await base44.entities.AppSettings.filter({ key: 'feature_flags' });
      if (existing.length > 0) {
        await base44.entities.AppSettings.update(existing[0].id, { value: JSON.stringify(map) });
      } else {
        await base44.entities.AppSettings.create({ key: 'feature_flags', value: JSON.stringify(map), description: 'Platform feature flags' });
      }

      // Save plan-level flags
      const existingPlan = await base44.entities.AppSettings.filter({ key: 'plan_feature_flags' });
      if (existingPlan.length > 0) {
        await base44.entities.AppSettings.update(existingPlan[0].id, { value: JSON.stringify(planFlags) });
      } else {
        await base44.entities.AppSettings.create({ key: 'plan_feature_flags', value: JSON.stringify(planFlags), description: 'Per-plan feature flags' });
      }

      toast.success('Feature flags saved');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const categories = ['All', ...Array.from(new Set(DEFAULT_FLAGS.map(f => f.category)))];
  const filtered = filter === 'All' ? flags : flags.filter(f => f.category === filter);
  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <div style={{ padding: 32, color: DK.text, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: DK.text, margin: 0, letterSpacing: '-0.3px' }}>Feature Flags</h1>
          <p style={{ fontSize: 13, color: DK.muted, marginTop: 4 }}>{enabledCount} of {flags.length} global features enabled</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'global' && (
            <button onClick={() => setFlags(prev => prev.map(f => ({ ...f, enabled: !f.enabled })))}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: DK.surface, border: `1px solid ${DK.border}`, color: DK.muted, borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
              <RefreshCw size={13} /> Toggle all
            </button>
          )}
          <button onClick={save} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            <Save size={13} /> {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: DK.surface, borderRadius: 10, padding: 4, width: 'fit-content', border: `1px solid ${DK.border}` }}>
        {[{ id: 'global', label: 'Global Flags' }, { id: 'plans', label: 'Plan Feature Gates' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '7px 18px', borderRadius: 7, border: 'none', background: tab === t.id ? '#F95738' : 'transparent', color: tab === t.id ? '#fff' : DK.muted, fontSize: 13, fontWeight: tab === t.id ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {t.id === 'plans' && <Shield size={12} />}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'global' && (
        <>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                style={{ padding: '5px 14px', borderRadius: 999, border: '1px solid', borderColor: filter === c ? CATEGORY_COLORS[c] || '#F95738' : DK.border, background: filter === c ? (CATEGORY_COLORS[c] || '#F95738') + '22' : 'transparent', color: filter === c ? CATEGORY_COLORS[c] || '#F95738' : DK.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(flag => (
              <div key={flag.key} style={{ background: DK.surface, border: `1px solid ${DK.border}`, borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <Flag size={13} color={CATEGORY_COLORS[flag.category] || '#888'} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: DK.text }}>{flag.label}</span>
                    <span style={{ fontSize: 10, color: CATEGORY_COLORS[flag.category] || '#888', background: (CATEGORY_COLORS[flag.category] || '#888') + '22', borderRadius: 4, padding: '2px 6px', fontWeight: 700 }}>{flag.category}</span>
                  </div>
                  <p style={{ fontSize: 12, color: DK.muted, margin: 0 }}>{flag.description}</p>
                  <code style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', marginTop: 3, display: 'block' }}>{flag.key}</code>
                </div>
                <button onClick={() => toggle(flag.key)} style={{ width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, background: flag.enabled ? '#F95738' : '#2A2A2A', position: 'relative', transition: 'background 200ms' }}>
                  <div style={{ position: 'absolute', top: 3, left: flag.enabled ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 200ms' }} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'plans' && (
        <div>
          <p style={{ fontSize: 12, color: DK.muted, marginBottom: 16, lineHeight: 1.6 }}>
            These flags gate specific capabilities per subscription plan. Changes are saved to the database and enforced at runtime. <strong style={{ color: '#F95738' }}>Zero AI tokens used</strong> — pure backend logic.
          </p>
          <PlanFlagsEditor planFlags={planFlags} onChange={handlePlanFlagChange} />
        </div>
      )}
    </div>
  );
}