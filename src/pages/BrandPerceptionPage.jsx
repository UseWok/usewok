import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getActiveDomain } from '@/lib/active-domain';
import { getCachedUser, peekCache, setCache } from '@/lib/data-cache';
import { Settings, RefreshCw, Zap } from 'lucide-react';
import BrandStatsRow from '@/components/brandperception/BrandStatsRow';
import BrandPromptTable from '@/components/brandperception/BrandPromptTable';
import RecoGrid from '@/components/brandperception/RecoGrid';
import PromptsConfigModal from '@/components/brandperception/PromptsConfigModal';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const VIOLET = '#7C3AED';

function parseJSON(s, fb) { try { return JSON.parse(s || '') || fb; } catch { return fb; } }

/**
 * Shared page for "Image de marque" (kind=brand) and "Recommandations" (kind=reco).
 * Both share the same backend (brandPerception) and layout; only the title differs.
 */
export default function BrandPerceptionPage({ kind = 'brand' }) {
  const isReco = kind === 'reco';
  const title = isReco ? 'What to do to get recommended 🎯' : 'What AI really says about you 💬';
  const subtitle = isReco
    ? "The exact moves to get named more often by AI — sorted so the biggest wins come first. Add any of them to your to-do list in one click."
    : "We ask ChatGPT, Gemini and Claude about your brand and show you their real answers: how they describe you, how much they trust you, and the overall vibe.";

  const _active0 = getActiveDomain();
  const _seed = peekCache(`bp_${kind}_${_active0?.url || 'all'}`);
  const [record, setRecord] = useState(_seed?.record || null);
  const [loading, setLoading] = useState(!_seed);
  const [running, setRunning] = useState(false);
  const [siteUrl, setSiteUrl] = useState(_active0?.url || '');
  const [showConfig, setShowConfig] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [addedKeys, setAddedKeys] = useState(_seed?.addedKeys || []);
  const [userId, setUserId] = useState('');

  const load = async () => {
    try {
      const u = await getCachedUser();
      if (!u) return;
      setUserId(u.id);
      const active = getActiveDomain();
      setSiteUrl(active?.url || '');
      if (!active?.url) { setLoading(false); return; }
      const list = await base44.entities.BrandPerception.filter({ user_id: u.id, site_url: active.url, kind });
      const rec = list[0] || null;
      setRecord(rec);
      // which recos already added as tasks
      const tasks = await base44.entities.ActionTask.filter({ user_id: u.id, site_url: active.url }).catch(() => []);
      const keys = tasks.map(t => { try { return JSON.parse(t.note || '{}').reco_key; } catch { return null; } }).filter(Boolean);
      setAddedKeys(keys);
      setCache(`bp_${kind}_${active.url}`, { record: rec, addedKeys: keys });
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [kind]);

  const run = async () => {
    if (!siteUrl || running) return;
    setRunning(true);
    try {
      const res = await base44.functions.invoke('brandPerception', { url: siteUrl, kind });
      if (res?.data && !res.data.error) setRecord(res.data);
    } catch {}
    setRunning(false);
  };

  const savePrompts = async (prompts) => {
    if (!record) return;
    setRecord(prev => ({ ...prev, prompts_json: JSON.stringify(prompts) }));
    try { await base44.entities.BrandPerception.update(record.id, { prompts_json: JSON.stringify(prompts) }); } catch {}
  };

  const addTask = async (reco, key) => {
    try {
      await base44.entities.ActionTask.create({
        user_id: userId, site_url: siteUrl,
        action_title: reco.title,
        status: 'todo',
        note: JSON.stringify({ type: reco.type, source: title, impact_label: reco.impact, effort: reco.effort, impact_score: (reco.impact === 'High' || reco.impact === 'Fort') ? 80 : (reco.impact === 'Medium' || reco.impact === 'Moyen') ? 55 : 30, reco_key: key, description: reco.description }),
      });
      setAddedKeys(prev => [...prev, key]);
    } catch {}
  };

  const prompts = parseJSON(record?.prompts_json, []);
  const recos = parseJSON(record?.recommendations_json, []);

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F0', fontFamily: F }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 10 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.03em' }}>{title}</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            {!isReco && (
              <button onClick={() => setShowConfig(true)} disabled={!record}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', border: `1px solid ${VIOLET}`, borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: VIOLET, cursor: record ? 'pointer' : 'not-allowed', fontFamily: F, opacity: record ? 1 : 0.5 }}>
                <Settings size={13} /> Configure prompts
              </button>
            )}
            <button onClick={run} disabled={running || !siteUrl}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: running ? '#999' : INK, border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: running ? 'default' : 'pointer', fontFamily: F }}>
              {running ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={12} />}
              {running ? 'Analyzing…' : record ? 'Re-run audit' : 'Run audit'}
            </button>
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 20px' }}>{subtitle}{record?.analyzed_at ? ` · Last audit ${new Date(record.analyzed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</p>

        {loading ? (
          <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '40px 0' }}>Loading…</p>
        ) : !record ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '45vh', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Zap size={22} color={INK3} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>No analysis for this domain</p>
            <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 16px' }}>Run the audit to see how AI engines perceive your brand.</p>
            <button onClick={run} disabled={running || !siteUrl}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: INK, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              <Zap size={13} /> {running ? 'Analyzing…' : 'Run audit'}
            </button>
          </div>
        ) : (
          <>
            <BrandStatsRow scoreNarrative={record.score_narrative} scoreAuthority={record.score_authority}
              sentiment={{ positive: record.sentiment_positive, neutral: record.sentiment_neutral, negative: record.sentiment_negative }} />
            <BrandPromptTable prompts={prompts} />
            <RecoGrid recommendations={recos} onAddTask={addTask} addedKeys={addedKeys} />
          </>
        )}
      </div>

      {showConfig && record && (
        <PromptsConfigModal prompts={prompts} onChange={savePrompts} onClose={() => setShowConfig(false)}
          regenerating={regenerating}
          onRegenerate={async () => { setRegenerating(true); await run(); const list = await base44.entities.BrandPerception.filter({ user_id: userId, site_url: siteUrl, kind }); setRecord(list[0] || record); setRegenerating(false); }} />
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}