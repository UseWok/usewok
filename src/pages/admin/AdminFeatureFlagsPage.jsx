import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flag, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_FLAGS = [
  { key: 'enable_analytics', label: 'Analytics Dashboard', description: 'Show analytics panel in user sidebar', enabled: true, category: 'UI' },
  { key: 'enable_version_history', label: 'Version History', description: 'Cloud-backed version history & bookmarks', enabled: true, category: 'Core' },
  { key: 'enable_visual_edits', label: 'Visual Edit Mode', description: 'Allow users to toggle visual edit mode', enabled: true, category: 'Core' },
  { key: 'enable_mic_recording', label: 'Mic Recording', description: 'Voice input in chat bar', enabled: true, category: 'UI' },
  { key: 'enable_mobile_preview', label: 'Mobile Preview', description: 'Smartphone preview toggle in header', enabled: true, category: 'UI' },
  { key: 'enable_referral', label: 'Referral Program', description: 'Share WOK referral button in sidebar', enabled: false, category: 'Growth' },
  { key: 'enable_connectors', label: 'Connectors', description: 'OAuth app connectors integration', enabled: false, category: 'Integrations' },
  { key: 'enable_team_workspace', label: 'Team Workspaces', description: 'Multi-member workspace support', enabled: false, category: 'Growth' },
  { key: 'maintenance_mode', label: 'Maintenance Mode', description: 'Show maintenance banner to all users', enabled: false, category: 'System' },
  { key: 'beta_features', label: 'Beta Features', description: 'Unlock experimental beta features for all users', enabled: false, category: 'System' },
];

const CATEGORY_COLORS = { UI: '#3B8BEB', Core: '#F95738', Growth: '#4ade80', Integrations: '#7B4FE0', System: '#E8184A' };

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    // Load saved flags from AppSettings
    base44.entities.AppSettings.filter({ key: 'feature_flags' }).then(results => {
      if (results.length > 0) {
        try {
          const saved = JSON.parse(results[0].value);
          setFlags(DEFAULT_FLAGS.map(f => ({ ...f, enabled: saved[f.key] !== undefined ? saved[f.key] : f.enabled })));
        } catch {}
      }
    }).catch(() => {});
  }, []);

  const toggle = (key) => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  const save = async () => {
    setSaving(true);
    const map = Object.fromEntries(flags.map(f => [f.key, f.enabled]));
    try {
      const existing = await base44.entities.AppSettings.filter({ key: 'feature_flags' });
      if (existing.length > 0) {
        await base44.entities.AppSettings.update(existing[0].id, { value: JSON.stringify(map) });
      } else {
        await base44.entities.AppSettings.create({ key: 'feature_flags', value: JSON.stringify(map), description: 'Platform feature flags' });
      }
      toast.success('Feature flags saved');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const categories = ['All', ...Array.from(new Set(DEFAULT_FLAGS.map(f => f.category)))];
  const filtered = filter === 'All' ? flags : flags.filter(f => f.category === filter);
  const enabledCount = flags.filter(f => f.enabled).length;

  return (
    <div style={{ padding: 32, color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>Feature Flags</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{enabledCount} of {flags.length} features enabled</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setFlags(prev => prev.map(f => ({ ...f, enabled: !f.enabled })))}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#1A1A1A', border: '1px solid #222', color: '#888', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
            <RefreshCw size={13} /> Toggle all
          </button>
          <button onClick={save} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
            <Save size={13} /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            style={{ padding: '5px 14px', borderRadius: 999, border: '1px solid', borderColor: filter === c ? CATEGORY_COLORS[c] || '#F95738' : '#222', background: filter === c ? (CATEGORY_COLORS[c] || '#F95738') + '22' : 'transparent', color: filter === c ? CATEGORY_COLORS[c] || '#F95738' : '#888', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 120ms' }}>
            {c}
          </button>
        ))}
      </div>

      {/* Flags list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(flag => (
          <div key={flag.key} style={{ background: '#1A1A1A', border: '1px solid #222', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Flag size={14} color={CATEGORY_COLORS[flag.category] || '#888'} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{flag.label}</span>
                <span style={{ fontSize: 11, color: CATEGORY_COLORS[flag.category] || '#888', background: (CATEGORY_COLORS[flag.category] || '#888') + '22', borderRadius: 4, padding: '2px 7px', fontWeight: 600 }}>{flag.category}</span>
              </div>
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{flag.description}</p>
              <code style={{ fontSize: 11, color: '#555', fontFamily: 'monospace', marginTop: 4, display: 'block' }}>{flag.key}</code>
            </div>
            {/* Toggle */}
            <button onClick={() => toggle(flag.key)} style={{
              width: 48, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0,
              background: flag.enabled ? '#F95738' : '#2A2A2A', position: 'relative', transition: 'background 200ms',
            }}>
              <div style={{ position: 'absolute', top: 3, left: flag.enabled ? 26 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 200ms', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}