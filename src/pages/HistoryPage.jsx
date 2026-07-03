import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Trophy, CheckCircle2, Clock, Zap } from 'lucide-react';
import { getActiveDomain } from '@/lib/active-domain';
import TrophyCard from '@/components/history/TrophyCard';
import RangePills, { RANGES } from '@/components/history/RangePills';
import ScoreTimeline from '@/components/history/ScoreTimeline';
import ScanList from '@/components/history/ScanList';
import { computeAchievements } from '@/lib/achievements';
import { getHistoryWindow } from '@/lib/quota-enforcement';

const F = 'Inter, system-ui, sans-serif';
const INK = '#15130F';
const BORDER = 'rgba(21,19,15,0.10)';
const CORAL = '#FF5A1F';

function KPI({ label, value, sub }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 16px', flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(21,19,15,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'rgba(21,19,15,0.45)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [doneTasks, setDoneTasks] = useState([]);
  const [records, setRecords] = useState([]);
  const [historyDays, setHistoryDays] = useState(30);
  const [plan, setPlan] = useState('free');
  const [range, setRange] = useState('30d');

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!u) { setLoading(false); return; }
        setUser(u);
        const active = getActiveDomain();
        const [profiles, tasks, win] = await Promise.all([
          base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []),
          base44.entities.ActionTask.filter({ user_id: u.id, status: 'done' }).catch(() => []),
          getHistoryWindow(),
        ]);
        const matched = active ? profiles.find(p => p.site_url === active.url) || profiles[0] : profiles[0];
        setProfile(matched || null);
        setDoneTasks(tasks);
        setHistoryDays(win?.history_days ?? 30);
        setPlan(win?.plan || 'free');
        if (matched) {
          const recs = await base44.entities.ScanRecord.filter({ user_id: u.id, site_url: matched.site_url }, 'created_date', 500).catch(() => []);
          setRecords(recs || []);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(21,19,15,0.10)', borderTopColor: CORAL, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const rangeDef = RANGES.find(r => r.id === range) || RANGES[1];
  // Plan-gated window: never show data older than the plan's history limit
  const effectiveDays = Math.min(rangeDef.days, historyDays);
  const cutoff = Date.now() - effectiveDays * 86400000;
  const visible = records.filter(r => new Date(r.created_date).getTime() >= cutoff);

  const current = visible.length ? Math.round(visible[visible.length - 1].score_overall || 0) : Math.round(profile?.score_overall || 0);
  const first = visible.length ? Math.round(visible[0].score_overall || 0) : current;
  const delta = current - first;
  const best = visible.reduce((m, r) => Math.max(m, Math.round(r.score_overall || 0)), current);

  const trophies = computeAchievements({ profile, doneTasksCount: doneTasks.length, accountCreatedDate: user?.created_date });
  const unlockedCount = trophies.filter(t => t.unlocked).length;

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100%', fontFamily: F, padding: '32px 24px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header + range */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: INK, marginBottom: 4 }}>History & Rewards</div>
            <p style={{ fontSize: 13.5, color: 'rgba(21,19,15,0.55)', margin: 0 }}>
              Your score over time, scans, actions and unlocked trophies.
            </p>
          </div>
          <RangePills value={range} onChange={setRange} maxDays={historyDays} onLockedClick={() => navigate('/pricing')} />
        </div>

        {/* Plan history limit notice */}
        {historyDays < 365 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FFE7D6', border: '1px solid rgba(255,90,31,0.25)', borderRadius: 12, marginBottom: 18 }}>
            <Clock size={14} color="#C43E14" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: '#C43E14', flex: 1 }}>
              Your <b style={{ textTransform: 'capitalize' }}>{plan}</b> plan keeps <b>{historyDays} days</b> of history. Upgrade to unlock up to 12 months.
            </span>
            <button onClick={() => navigate('/pricing')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: CORAL, color: '#fff', border: 'none', borderRadius: 100, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
              <Zap size={11} /> Upgrade
            </button>
          </div>
        )}

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          <KPI label="Current score" value={`${current}/100`} />
          <KPI label="Change" value={delta > 0 ? `+${delta}` : `${delta}`} sub={`over ${rangeDef.label}`} />
          <KPI label="Best score" value={`${best}/100`} />
          <KPI label="Scans" value={visible.length} sub={`over ${rangeDef.label}`} />
        </div>

        {/* Score timeline */}
        <div style={{ marginBottom: 24 }}>
          <ScoreTimeline records={visible} />
        </div>

        {/* Scan timeline list */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Clock size={16} color={INK} />
            <span style={{ fontSize: 13, fontWeight: 700, color: INK, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Scan history ({visible.length})</span>
          </div>
          <ScanList records={visible} />
        </div>

        {/* Trophies */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={16} color={INK} />
              <span style={{ fontSize: 13, fontWeight: 700, color: INK, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Trophies</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(21,19,15,0.5)' }}>{unlockedCount}/6 unlocked</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {trophies.map((t, i) => <TrophyCard key={t.id} trophy={t} index={i} />)}
          </div>
        </div>

        {/* Completed actions */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CheckCircle2 size={16} color={INK} />
            <span style={{ fontSize: 13, fontWeight: 700, color: INK, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Completed actions ({doneTasks.length})</span>
          </div>
          <div style={{ background: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
            {doneTasks.length === 0 ? (
              <div style={{ padding: '28px 20px', textAlign: 'center', fontSize: 13, color: 'rgba(21,19,15,0.4)' }}>
                No completed actions yet.
              </div>
            ) : (
              doneTasks.map((t, i) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < doneTasks.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                  <CheckCircle2 size={15} color="#16A34A" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: INK, flex: 1 }}>{t.action_title}</span>
                  <span style={{ fontSize: 11.5, color: 'rgba(21,19,15,0.4)', flexShrink: 0 }}>
                    {t.updated_date ? new Date(t.updated_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}