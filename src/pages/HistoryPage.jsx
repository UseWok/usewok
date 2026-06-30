import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getWokFeatures, getWokPlanId, PLAN_LABELS } from '@/lib/wok-plans';
import { useAuth } from '@/lib/AuthContext';
import { Scan, MessageSquare, ListChecks, Lock, ChevronRight } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK2 = '#5A5A5A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(0,0,0,0.08)';
const BG = '#F8F7F4';
const WHITE = '#FFFFFF';
const CORAL = '#FF5A1F';

function fmtDate(ts) {
  if (!ts) return '—';
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function QuotaBar({ label, used, limit, periodLabel }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const isBlocked = used >= limit;
  const barColor = isBlocked ? '#ef4444' : pct >= 80 ? '#f97316' : INK;

  return (
    <div style={{ flex: 1, minWidth: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: INK2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        {isBlocked && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 4, padding: '1px 6px' }}>
            <Lock size={9} /> BLOQUÉ
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: INK, letterSpacing: '-0.03em' }}>{used}</span>
        <span style={{ fontSize: 14, color: INK3, fontWeight: 500 }}>/ {limit}{periodLabel ? ` ${periodLabel}` : ''}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, transition: 'width 0.3s ease' }} />
      </div>
      <p style={{ fontSize: 11, color: INK3, margin: '8px 0 0' }}>{isBlocked ? 'Quota atteint — fonctionnalité coupée' : `${limit - used} restants`}</p>
    </div>
  );
}

function HistoryRow({ icon: Icon, title, subtitle, date, score, onClick, accentColor }) {
  return (
    <button onClick={onClick} disabled={!onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, width: '100%',
        padding: '14px 16px', background: WHITE, border: `1px solid ${BORDER}`,
        borderRadius: 10, cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left', fontFamily: F, transition: 'background 80ms',
        opacity: onClick ? 1 : 0.85,
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = '#FAFAF8'; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.background = WHITE; }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color={accentColor || INK2} strokeWidth={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: INK, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{title}</p>
        {subtitle && <p style={{ fontSize: 11.5, color: INK3, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</p>}
      </div>
      {score != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: score >= 70 ? '#10B981' : score >= 40 ? '#f97316' : '#ef4444', letterSpacing: '-0.02em' }}>{score}</span>
          <span style={{ fontSize: 10, color: INK3, fontWeight: 600 }}>/100</span>
        </div>
      )}
      {onClick && <ChevronRight size={14} color={INK3} strokeWidth={1.8} style={{ flexShrink: 0 }} />}
    </button>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [scans, setScans] = useState([]);
  const [convs, setConvs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [quota, setQuota] = useState({ scans: null, chat: null, sites: null });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const u = authUser;
    if (u?.id) {
      setUser(u);
      loadAll(u);
    } else {
      base44.auth.me().then(me => { if (me?.id) { setUser(me); loadAll(me); } else setLoading(false); }).catch(() => setLoading(false));
    }
  }, [authUser?.id]);

  const loadAll = async (u) => {
    setLoading(true);
    const features = getWokFeatures(u);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const periodStart = features.scan_period === 'day'
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      : monthStart;

    const [profiles, conversations, tasksList, scanLedger] = await Promise.all([
      base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []),
      base44.entities.Conversation.list('-updated_at', 50).catch(() => []),
      base44.entities.ActionTask.filter({ user_id: u.id }).catch(() => []),
      base44.entities.CreditLedger.filter({ user_id: u.id, action: 'SCAN' }).catch(() => []),
    ]);

    // ── Scans: merge BusinessProfile + CreditLedger ──
    const scanRows = (profiles || []).filter(p => p.last_scan).map(p => ({
      type: 'scan',
      date: new Date(p.last_scan).getTime(),
      title: (p.site_url || '').replace(/https?:\/\//, '').split('/')[0] || 'Scan',
      subtitle: `${p.identity_name || 'Site'} · ${p.identity_industry || ''}`.trim(),
      score: p.score_overall || 0,
      onClick: () => navigate('/ai-report'),
    }));
    const ledgerScans = (scanLedger || []).filter(l => l.timestamp).map(l => ({
      type: 'scan',
      date: new Date(l.timestamp).getTime(),
      title: (l.description || 'Scan').slice(0, 60),
      subtitle: l.site_url ? l.site_url.replace(/https?:\/\//, '').split('/')[0] : '',
      score: null,
      onClick: null,
    }));
    const allScans = [...scanRows, ...ledgerScans].sort((a, b) => b.date - a.date);
    setScans(allScans);

    // ── Conversations ──
    const convRows = (conversations || []).map(c => {
      let msgCount = 0;
      try { msgCount = JSON.parse(c.messages_json || '[]').length; } catch {}
      return {
        type: 'chat',
        date: c.updated_at || new Date(c.updated_date).getTime(),
        title: c.title || 'Conversation',
        subtitle: `${msgCount} message${msgCount > 1 ? 's' : ''}`,
        score: null,
        onClick: () => navigate(`/wok-ai?conv=${c.id}`),
      };
    }).sort((a, b) => b.date - a.date);
    setConvs(convRows);

    // ── Tasks ──
    const taskRows = (tasksList || []).map(t => ({
      type: 'task',
      date: new Date(t.updated_date || t.created_date).getTime(),
      title: t.action_title || 'Tâche',
      subtitle: `${t.engine || ''} · ${t.platform || ''}`.replace(/^·\s|·\s$/, '').trim() || (t.site_url || ''),
      score: null,
      status: t.status,
      onClick: () => navigate('/ai-report'),
    })).sort((a, b) => b.date - a.date);
    setTasks(taskRows);

    // ── Quotas ──
    const scansUsed = (scanLedger || []).filter(l => {
      const ts = l.timestamp ? new Date(l.timestamp).getTime() : 0;
      return ts >= periodStart;
    }).length;
    const chatUsed = (conversations || []).reduce((acc, conv) => {
      let msgs = [];
      try { msgs = JSON.parse(conv.messages_json || '[]'); } catch {}
      return acc + msgs.filter(m => m.role === 'user' && (m.ts || 0) >= monthStart).length;
    }, 0);
    setQuota({
      scans: { used: scansUsed, limit: features.scans_per_period || 1, period: features.scan_period },
      chat: { used: chatUsed, limit: features.chatbot_messages || 5 },
      sites: { used: (profiles || []).length, limit: features.max_sites || 1 },
    });

    setLoading(false);
  };

  const merged = useMemo(() => {
    if (tab === 'scans') return scans;
    if (tab === 'chat') return convs;
    if (tab === 'tasks') return tasks;
    return [...scans, ...convs, ...tasks].sort((a, b) => b.date - a.date);
  }, [tab, scans, convs, tasks]);

  const planId = user ? getWokPlanId(user) : 'free';
  const planLabel = PLAN_LABELS[planId] || 'Gratuit';

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, fontFamily: F }}>
      <div style={{ width: 24, height: 24, border: '3px solid #E5E5E0', borderTopColor: INK, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: BG, fontFamily: F, padding: '32px 40px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.03em' }}>Historique</h1>
            <p style={{ fontSize: 13, color: INK3, margin: '4px 0 0' }}>Toute votre activité — scans, conversations et tâches</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: planId === 'pro' ? CORAL : INK2, background: planId === 'pro' ? 'rgba(255,90,31,0.08)' : 'rgba(0,0,0,0.04)', border: `1px solid ${planId === 'pro' ? 'rgba(255,90,31,0.2)' : BORDER}`, borderRadius: 6, padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {planLabel}
          </span>
        </div>

        {/* ── Quota Cards ── */}
        {quota.scans && quota.chat && quota.sites && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
            <QuotaBar label="Scans" used={quota.scans.used} limit={quota.scans.limit} periodLabel={quota.scans.period === 'day' ? '/jour' : '/mois'} />
            <QuotaBar label="Messages IA" used={quota.chat.used} limit={quota.chat.limit} periodLabel="/mois" />
            <QuotaBar label="Sites" used={quota.sites.used} limit={quota.sites.limit} />
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: `1px solid ${BORDER}` }}>
          {[
            { id: 'all', label: 'Tout', count: scans.length + convs.length + tasks.length },
            { id: 'scans', label: 'Scans', count: scans.length },
            { id: 'chat', label: 'Conversations', count: convs.length },
            { id: 'tasks', label: 'Tâches', count: tasks.length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '8px 14px', border: 'none', borderBottom: tab === t.id ? `2px solid ${INK}` : '2px solid transparent',
                background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? INK : INK3, fontFamily: F, display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: -1, transition: 'color 80ms',
              }}>
              {t.label}
              <span style={{ fontSize: 10, fontWeight: 600, color: INK3, background: 'rgba(0,0,0,0.04)', borderRadius: 4, padding: '1px 5px' }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── Timeline ── */}
        {merged.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,0,0,0.04)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <ListChecks size={20} color={INK3} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: INK2, margin: '0 0 4px' }}>Aucune activité</p>
            <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.5 }}>Lancez un scan ou démarrez une conversation pour voir l'historique ici.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {merged.map((row, i) => (
              <HistoryRow
                key={i}
                icon={row.type === 'scan' ? Scan : row.type === 'chat' ? MessageSquare : ListChecks}
                title={row.title}
                subtitle={`${fmtDate(row.date)}${row.subtitle ? ' · ' + row.subtitle : ''}`}
                score={row.score}
                status={row.status}
                onClick={row.onClick}
                accentColor={row.type === 'scan' ? CORAL : row.type === 'chat' ? '#4B83DB' : '#22A87A'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}