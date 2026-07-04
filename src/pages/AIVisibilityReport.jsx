import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, Zap, Lock,
  ArrowUpRight, ArrowDownRight, Minus,
  Download
} from 'lucide-react';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { getProfileData } from '@/lib/profile-storage';
import { getWokPlanId } from '@/lib/wok-plans';
import UpgradeModal from '@/components/upsell/UpgradeModal';
import FadeUp from '@/components/report/FadeUp';
import ScoreRing from '@/components/report/ScoreRing';
import FixDrawer from '@/components/report/FixDrawer';
import ReportLoading, { ScanInProgress, ReportEmpty } from '@/components/report/ReportLoading';
import {
  F, INK, INK2, INK3, BORDER, SURFACE, WHITE, CORAL, CARD_DARK,
  GREEN, GREEN_SOFT, CREAM_DEEP, ORANGE_DEEP, ORANGE_SOFT,
  ALL_ENGINES, ENGINE_NAMES,
  fmt, getSentiment
} from '@/lib/report-constants';
import GrowthTimeline from '@/components/report/GrowthTimeline';
import PriorityActions from '@/components/report/PriorityActions';

export default function AIVisibilityReport() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [tasks, setTasks] = useState({});
  const [user, setUser] = useState(null);
  const [savingTask, setSavingTask] = useState({});
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [planId, setPlanId] = useState('free');
  const [gscData, setGscData] = useState(null);

  const isFree = planId === 'free';
  const isStarter = planId === 'starter';

  const PLAN_ENGINES_ACTIVE = isFree
    ? ['gemini']
    : isStarter
    ? ['gemini', 'chatgpt', 'claude', 'llama', 'perplexity']
    : ['gemini', 'chatgpt', 'claude', 'mistral', 'llama', 'perplexity', 'copilot', 'grok'];
  const PLAN_ENGINES_LOCKED = isStarter ? ['mistral', 'copilot', 'grok'] : [];
  const PLAN_ENGINES_BLURRED = isFree ? ['chatgpt', 'claude', 'mistral', 'llama', 'perplexity', 'grok', 'copilot'] : [];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const u = await base44.auth.me();
      if (!u) { navigate('/'); return; }
      setUser(u);
      setPlanId(getWokPlanId(u));
      const active = getActiveDomain();
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const matched = active ? profiles.find((p) => p.site_url === active.url) || null : profiles[0] || null;
      if (matched) {
        const extra = await getProfileData(matched);
        setData({ ...matched, ...extra });
        const existing = await base44.entities.ActionTask.filter({ user_id: u.id, site_url: matched.site_url }).catch(() => []);
        const map = {};
        for (const t of existing) map[t.action_index] = t;
        setTasks(map);
      }
    } catch {}
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    const unsub = onActiveDomainChange(() => loadData());
    return unsub;
  }, [loadData]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    base44.functions.invoke('getSearchConsoleData', {}).then((res) => {
      if (res?.data?.connected) setGscData(res.data);
    }).catch(() => {});
  }, []);

  const handleRescan = async () => {
    if (!data?.site_url) return;
    setScanning(true);
    try {
      const u = await base44.auth.me().catch(() => null);
      if (u) {
        const caches = await base44.entities.UserFixCache.filter({ user_id: u.id, site_url: data.site_url }).catch(() => []);
        await Promise.all(caches.map(c => base44.entities.UserFixCache.delete(c.id).catch(() => {})));
      }
      const fnName = isFree ? 'analyzeWebsiteLite' : 'analyzeWebsite';
      const res = await base44.functions.invoke(fnName, { url: data.site_url });
      if (res?.data && !res.data.error) {
        const u2 = await base44.auth.me();
        if (u2) {
          const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u2.id });
          const matched = profiles.find((p) => p.site_url === data.site_url);
          if (matched) {
            const extra = await getProfileData(matched);
            setData({ ...matched, ...extra });
          } else {
            setData(res.data);
          }
        }
      }
    } catch {}
    setScanning(false);
  };

  const handleTaskStatus = async (index, newStatus, item) => {
    if (!user) return;
    setSavingTask((prev) => ({ ...prev, [index]: true }));
    const existing = tasks[index];
    try {
      if (existing?.id) {
        await base44.entities.ActionTask.update(existing.id, { status: newStatus });
        setTasks((prev) => ({ ...prev, [index]: { ...prev[index], status: newStatus } }));
      } else {
        const created = await base44.entities.ActionTask.create({
          user_id: user.id, site_url: data?.site_url || '',
          action_index: index, action_title: item.action_title || '',
          engine: item.engine || '', platform: item.platform || '', status: newStatus
        });
        setTasks((prev) => ({ ...prev, [index]: created }));
      }
    } catch {}
    setSavingTask((prev) => ({ ...prev, [index]: false }));
  };

  // ── Loading / empty states ──
  if (loading) return <ReportLoading />;
  if (data?.scan_in_progress && !data?.score_overall) return <ScanInProgress />;
  if (!data) return <ReportEmpty onBack={() => navigate('/app')} />;

  // ── Derived data ──
  const domainLabel = (data.site_url || '').replace(/https?:\/\//, '').split('/')[0];
  const score = Math.round(data.lrs_score || data.overall_score || data.score_overall || 0);
  const scoreVis = Math.round(data.ai_visibility_score || data.score_ai_visibility || 0);
  const scoreClarity = Math.round(data.message_clarity_score || data.score_message_clarity || 0);
  const scoreCommerce = Math.round(data.commercial_presence_score || data.score_commercial_signal || 0);
  const scorePrev = Math.round(data.score_previous || 0);
  const scoreDelta = score - scorePrev;
  const issues = data.issues || [];
  const plan = data.injection_plan || [];
  const businessName = data.identity_name || domainLabel;

  const freqLabel = scoreVis >= 60 ? 'High' : scoreVis >= 30 ? 'Moderate' : 'Low';
  const sentimentLabel = scoreClarity >= 60 ? 'Good' : scoreClarity >= 30 ? 'Average' : 'Needs work';
  const precisionLabel = scoreCommerce >= 60 ? 'Good' : scoreCommerce >= 30 ? 'Average' : 'Needs work';

  const engineScores = {};
  ALL_ENGINES.forEach(e => { engineScores[e] = data[`${e}_score`] || 0; });

  const hasTrend = scorePrev > 0;

  const technical = [
    { id: 'schema', label: 'AI knows who you are', desc: 'AI understands your business and what you offer', ok: data.has_schema_markup, fix: 'AI doesn\'t know who you are. When a customer asks "recommend a X", you\'re not in their response.', urgency: 'high' },
    { id: 'gmb', label: 'You show up on Google Maps', desc: 'Local customers can find you', ok: data.has_google_business, fix: 'Your Google profile is incomplete or missing. You\'re losing local customers searching for your type of service.', urgency: 'high' },
    { id: 'ssl', label: 'Your site is secure', desc: 'AI trusts secure sites', ok: data.has_ssl, fix: 'Your site isn\'t secure. AI avoids recommending unsecured sites.', urgency: 'medium' },
    { id: 'mobile', label: 'Your site works on mobile', desc: '80% of AI searches happen on mobile', ok: data.has_mobile_friendly, fix: 'Your site isn\'t mobile-friendly. Most of your potential customers have a poor experience.', urgency: 'medium' },
    { id: 'sitemap', label: 'AI can read your site', desc: 'All your pages are visible to AI', ok: data.has_sitemap, fix: 'AI doesn\'t see all your pages. Part of your content is invisible to ChatGPT and Gemini.', urgency: 'low' },
  ].filter((t) => t.ok !== null && t.ok !== undefined);
  const technicalBad = technical.filter((t) => t.ok === false);

  const allActions = [];
  technicalBad.forEach((t) => {
    allActions.push({ key: `tech_${t.id}`, action_title: t.label, impact: t.desc, gap: t.fix, urgency: 'Urgent', type: 'fix', text: t.fix });
  });
  issues.forEach((issue, i) => {
    allActions.push({ key: `issue_${i}`, action_title: issue.problem || issue.text, impact: issue.impact || '', urgency: 'This week', type: 'fix', text: issue.problem || issue.text });
  });
  plan.forEach((item, i) => {
    allActions.push({ key: `plan_${i}`, action_title: item.action_title, impact: item.gap || `${item.engine} · ${item.platform || ''}`, urgency: item.effort === 'low' ? 'Short term' : 'Medium term', type: 'plan', text: item.action_title + (item.action_detail ? ' — ' + item.action_detail : ''), planIndex: i, item });
  });

  const doneTasks = plan.filter((_, i) => tasks[i]?.status === 'done').length;

  return (
    <div className="lrs-mock" style={{ background: SURFACE, minHeight: '100vh', fontFamily: F, color: INK, padding: 24 }}>
      <style>{`
        .lrs-mock *{box-sizing:border-box;font-family:${F};}
        .lrs-card{background:#fff;border:0.5px solid ${BORDER};border-radius:12px;}
        .lrs-row:hover{background:${CREAM_DEEP};}
        .lrs-icon-btn{background:none;border:none;color:${INK2};cursor:pointer;padding:4px;display:flex;align-items:center;gap:5px;font-size:12px;font-family:${F};}
        .lrs-icon-btn:hover{color:${INK};}
        .lrs-back:hover{color:${INK};}
        .lrs-action:hover{border-color:${INK};}
        .lrs-launch:hover{opacity:.7;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes lrsmSpin{to{transform:rotate(360deg);}}
        @keyframes lrsmPulse{0%,100%{opacity:1;}50%{opacity:.45;}}
        .lrsm-skel{animation:lrsmPulse 1.4s ease-in-out infinite;}
        .lrsm-close:hover{background:${CREAM_DEEP};}
        .lrsm-step:hover{border-color:${INK};}
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* ── Top bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button className="lrs-icon-btn lrs-back" onClick={() => navigate('/app')}>
            <ArrowLeft size={13} /> Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isFree && (
              <button onClick={() => setShowUpgrade(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', background: ORANGE_SOFT, border: 'none', borderRadius: 999, fontSize: 11, fontWeight: 700, color: ORANGE_DEEP, cursor: 'pointer', fontFamily: F }}>
                <Zap size={10} /> Upgrade
              </button>
            )}
            <button onClick={handleRescan} disabled={scanning} className="lrs-icon-btn" style={{ opacity: scanning ? 0.5 : 1 }}>
              <motion.span animate={{ rotate: scanning ? 360 : 0 }} transition={{ duration: 0.8, repeat: scanning ? Infinity : 0, ease: 'linear' }}>
                <RefreshCw size={13} />
              </motion.span>
              {scanning ? 'Analyzing…' : 'Refresh'}
            </button>
            <button className="lrs-icon-btn" onClick={() => window.print()}>
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        {/* ── Title ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 21, fontWeight: 500, color: INK }}>Your AI Visibility</div>
          <div style={{ fontSize: 13, color: INK2, marginTop: 3 }}>{domainLabel} · Updated {data.last_scan ? new Date(data.last_scan).toLocaleDateString('en-US') : "today"}</div>
        </div>

        {/* ── Dark hero: score ring + mentions ── */}
        <FadeUp delay={0}>
          <div style={{ background: CARD_DARK, borderRadius: 12, padding: 20, marginBottom: 14, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <ScoreRing value={score} size={72} />
              {scoreDelta !== 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 8, color: GREEN, fontSize: 12, fontWeight: 500 }}>
                  {scoreDelta > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {scoreDelta > 0 ? '+' : ''}{scoreDelta} pts
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'rgba(247,242,233,0.55)', marginBottom: 10 }}>What AI says about you</div>
              {[
                { label: 'How often AI mentions you', val: freqLabel },
                { label: 'How AI talks about you', val: sentimentLabel },
                { label: 'AI trust in you', val: precisionLabel },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '0.5px solid rgba(247,242,233,0.1)' }}>
                  <span style={{ fontSize: 13, color: 'rgba(247,242,233,0.75)' }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: CORAL, background: 'rgba(255,90,31,0.16)', padding: '3px 9px', borderRadius: 999 }}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>



        {/* ── 3 stat cards ── */}
        <FadeUp delay={0.10}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 24 }}>
            <div className="lrs-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 12, color: INK2, marginBottom: 6 }}>Your visibility</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: INK }}>{scoreVis}%</div>
              <div style={{ fontSize: 11, color: hasTrend ? GREEN : INK3, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                {hasTrend ? <ArrowUpRight size={12} /> : null} {hasTrend ? `${scoreDelta >= 0 ? '+' : ''}${scoreDelta} pts vs last scan` : 'No previous scan'}
              </div>
            </div>
            <div className="lrs-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 12, color: INK2, marginBottom: 6 }}>How AI talks about you</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: INK }}>{scoreClarity}%</div>
              <div style={{ fontSize: 11, color: hasTrend ? GREEN : INK3, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                {hasTrend ? `${scoreDelta >= 0 ? '+' : ''}${scoreDelta} pts vs last scan` : 'No previous scan'}
              </div>
            </div>
            <div className="lrs-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 12, color: INK2, marginBottom: 6 }}>AI mentions / month</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: INK }}>{data.organic_traffic ? `~${fmt(data.organic_traffic)}` : '—'}</div>
              <div style={{ fontSize: 11, color: hasTrend ? GREEN : INK3, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                {hasTrend ? `${scoreDelta >= 0 ? '+' : ''}${scoreDelta} pts vs last scan` : 'No previous scan'}
              </div>
            </div>
          </div>
        </FadeUp>

        {/* ── Growth Timeline (replaces radar) ── */}
        <FadeUp delay={0.14}>
          <div style={{ marginBottom: 20 }}>
            <GrowthTimeline
              currentScore={score}
              previousScore={scorePrev}
              lastScanDate={data.last_scan}
              prevScanDate={data.previous_scan_date}
            />
          </div>
        </FadeUp>

        {/* ── Scores table ── */}
        <FadeUp delay={0.18}>
          <div style={{ fontSize: 11, fontWeight: 500, color: INK2, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>How each AI sees you</div>
          <div className="lrs-card" style={{ marginBottom: 24, position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto auto', gap: 8, padding: '10px 16px', fontSize: 11, color: INK2, borderBottom: `0.5px solid ${BORDER}` }}>
              <span>AI Assistant</span><span>Score</span><span>Trend</span><span>Trust</span>
            </div>
            {ALL_ENGINES.map((e) => {
              const val = engineScores[e];
              const blurred = PLAN_ENGINES_BLURRED.includes(e);
              const locked = PLAN_ENGINES_LOCKED.includes(e);
              const sent = getSentiment(val);

              if (blurred) {
                return (
                  <div key={e} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto auto', gap: 8, alignItems: 'center', padding: '11px 16px', borderBottom: `0.5px solid ${BORDER}`, filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: INK }}>{ENGINE_NAMES[e]}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 999, background: CREAM_DEEP }}>
                        <div style={{ width: '0%', height: 4, borderRadius: 999, background: 'rgba(21,19,15,0.2)' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: INK, width: 20 }}>—</span>
                    </div>
                    <span style={{ fontSize: 12, color: INK2 }}>—</span>
                    <span style={{ fontSize: 11, fontWeight: 500, color: INK2, background: CREAM_DEEP, padding: '2px 8px', borderRadius: 999, width: 'fit-content' }}>—</span>
                  </div>
                );
              }

              if (locked) {
                return (
                  <div key={e} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto auto', gap: 8, alignItems: 'center', padding: '11px 16px', borderBottom: `0.5px solid ${BORDER}`, opacity: 0.4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: INK }}>{ENGINE_NAMES[e]}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 999, background: CREAM_DEEP }}>
                        <div style={{ width: '25%', height: 4, borderRadius: 999, background: 'rgba(21,19,15,0.12)' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: INK, width: 20 }}>—</span>
                    </div>
                    <span style={{ fontSize: 12, color: INK2 }}>—</span>
                    <Lock size={11} color={INK3} />
                  </div>
                );
              }

              return (
                <div key={e} className="lrs-row" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto auto', gap: 8, alignItems: 'center', padding: '11px 16px', borderBottom: `0.5px solid ${BORDER}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: INK }}>{ENGINE_NAMES[e]}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 999, background: CREAM_DEEP }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ delay: 0.2, duration: 0.7 }}
                        style={{ height: 4, borderRadius: 999, background: CORAL }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: INK, width: 20 }}>{val}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: GREEN, display: 'flex', alignItems: 'center', gap: 2 }}><ArrowUpRight size={11} />+{val}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: sent.color, background: sent.bg, padding: '2px 8px', borderRadius: 999, width: 'fit-content' }}>{sent.label}</span>
                </div>
              );
            })}
            {(isFree || isStarter) && (
              <div style={{ padding: '12px 16px' }}>
                <button onClick={() => setShowUpgrade(true)}
                  style={{ width: '100%', padding: '10px', border: `1px solid ${BORDER}`, borderRadius: 9, background: SURFACE, fontSize: 12, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Lock size={11} /> {isFree ? 'Unlock 7 more engines — Starter' : 'Unlock Mistral, Copilot, Grok — Pro'}
                </button>
              </div>
            )}
          </div>
        </FadeUp>

        {/* ── Part de voix sectorielle ── */}
        {data.competitors && Array.isArray(data.competitors) && data.competitors.length > 0 && (
          <FadeUp delay={0.22}>
            <div style={{ fontSize: 11, fontWeight: 500, color: INK2, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>Your place vs competitors</div>
            <div className="lrs-card" style={{ padding: 16, marginBottom: 24 }}>
              {data.competitors.map((comp, i) => {
                const isYou = comp.name === businessName || comp.is_you;
                const pct = comp.share || comp.percentage || 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < data.competitors.length - 1 ? 12 : 0 }}>
                    <span style={{ width: 84, fontSize: 13, color: isYou ? ORANGE_DEEP : INK, fontWeight: isYou ? 600 : 400 }}>
                      {comp.name}{isYou && <span style={{ fontSize: 10, fontWeight: 500, background: ORANGE_SOFT, padding: '1px 6px', borderRadius: 999, marginLeft: 4 }}>You</span>}
                    </span>
                    <div style={{ flex: 1, height: 8, borderRadius: 999, background: CREAM_DEEP }}>
                      <div style={{ width: `${pct}%`, height: 8, borderRadius: 999, background: isYou ? CORAL : INK }} />
                    </div>
                    <span style={{ width: 32, textAlign: 'right', fontSize: 13, fontWeight: 500, color: isYou ? ORANGE_DEEP : INK }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </FadeUp>
        )}

        {/* ── Top 3 priority moves (replaces recommended actions) ── */}
        <FadeUp delay={0.26}>
          <PriorityActions
            actions={allActions}
            tasks={tasks}
            onTaskStatus={handleTaskStatus}
            onActionClick={(action) => setActiveDrawer({ id: action.key, text: action.text, type: action.type })}
            savingTask={savingTask}
            isFree={isFree}
            onUpgrade={() => setShowUpgrade(true)}
            doneCount={doneTasks}
            totalCount={plan.length}
          />
        </FadeUp>

      </div>

      {activeDrawer && (
        <FixDrawer issue={activeDrawer} profile={data} user={user} isFree={isFree}
          onClose={() => setActiveDrawer(null)} onUpgrade={() => setShowUpgrade(true)}
          onVerified={() => {
            if (activeDrawer.id?.startsWith('plan_')) {
              const idx = parseInt(activeDrawer.id.replace('plan_', ''));
              if (plan[idx]) handleTaskStatus(idx, 'done', plan[idx]);
            }
            setActiveDrawer(null);
          }} />
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)}
        feature="the full analysis" requiredPlan="starter"
        description="Unlock the 7 missing AI engines, the personalized action plan and fix guides." />
    </div>
  );
}