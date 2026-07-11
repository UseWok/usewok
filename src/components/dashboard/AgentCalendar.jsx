import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, HeartPulse, Eye, Users, X, CalendarDays } from 'lucide-react';
import InfoTip from '@/components/ui/InfoTip';

const F = '"Wix Madefor Text", "Wix Madefor Display", system-ui, sans-serif';
const INK = '#1A1814';
const INK2 = '#857E6E';
const BORDER = 'rgba(21,19,15,0.12)';

const AGENT_STYLE = {
  scan:        { color: '#FF5A1F', bg: 'rgba(255,90,31,0.10)',  icon: Zap,        tip: 'Checks if ChatGPT, Gemini and Claude recommend you when prospects ask about your industry.' },
  health:      { color: '#3B8BEB', bg: 'rgba(59,139,235,0.10)', icon: HeartPulse, tip: 'Scans your website to see if AI engines can read and understand your pages.' },
  reputation:  { color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', icon: Eye,        tip: 'Monitors what AI engines say about your brand — positive, neutral, or negative mentions.' },
  competitors: { color: '#0B815A', bg: 'rgba(11,129,90,0.10)',  icon: Users,      tip: 'Tracks which competitors the AI recommends instead of you, and where you can catch up.' },
};

const DEFAULT_AGENTS = [
  { agent_key: 'scan',        agent_name: 'AI Visibility Scan', day_of_week: 1, time: '09:00' },
  { agent_key: 'health',      agent_name: 'Site Health Check',  day_of_week: 3, time: '10:00' },
  { agent_key: 'reputation',  agent_name: 'Reputation Watch',   day_of_week: 4, time: '14:00' },
  { agent_key: 'competitors', agent_name: 'Competitor Watch',   day_of_week: 5, time: '11:00' },
];

const DAYS = [
  { label: 'Mon', dow: 1 }, { label: 'Tue', dow: 2 }, { label: 'Wed', dow: 3 },
  { label: 'Thu', dow: 4 }, { label: 'Fri', dow: 5 }, { label: 'Sat', dow: 6 }, { label: 'Sun', dow: 0 },
];

export default function AgentCalendar({ userId, siteUrl }) {
  const [runs, setRuns] = useState([]);
  const [editing, setEditing] = useState(null); // run being edited
  const [editTime, setEditTime] = useState('09:00');
  const [editDay, setEditDay] = useState(1);

  useEffect(() => {
    if (!userId || !siteUrl) return;
    (async () => {
      try {
        const list = await base44.entities.AgentSchedule.filter({ user_id: userId, site_url: siteUrl });
        if (list.length > 0) { setRuns(list.filter(r => r.active !== false)); return; }
        const created = await base44.entities.AgentSchedule.bulkCreate(
          DEFAULT_AGENTS.map(a => ({ ...a, user_id: userId, site_url: siteUrl, active: true }))
        );
        setRuns(Array.isArray(created) ? created : DEFAULT_AGENTS.map(a => ({ ...a, user_id: userId, site_url: siteUrl, active: true })));
      } catch {}
    })();
  }, [userId, siteUrl]);

  const openEdit = (run) => { setEditing(run); setEditTime(run.time || '09:00'); setEditDay(run.day_of_week ?? 1); };

  const saveEdit = async () => {
    const r = editing;
    setRuns(prev => prev.map(x => x.id === r.id ? { ...x, time: editTime, day_of_week: editDay } : x));
    setEditing(null);
    try { await base44.entities.AgentSchedule.update(r.id, { time: editTime, day_of_week: editDay }); } catch {}
  };

  const cancelRun = async () => {
    const r = editing;
    setRuns(prev => prev.filter(x => x.id !== r.id));
    setEditing(null);
    try { await base44.entities.AgentSchedule.update(r.id, { active: false }); } catch {}
  };

  const todayDow = new Date().getDay();
  if (!siteUrl) return null;

  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px', marginTop: 20, fontFamily: F, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <CalendarDays size={16} color={INK2} />
        <span style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>Your AI agents this week</span>
        <InfoTip text="UseWok's agents automatically check your site, your reputation and your competitors — even while you sleep. Click a card to change the time or cancel a run." />
      </div>
      <p style={{ fontSize: 12, color: INK2, margin: '0 0 14px' }}>UseWok works for you in the background. Click any run to reschedule it.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {DAYS.map(d => {
          const isToday = d.dow === todayDow;
          const dayRuns = runs.filter(r => (r.day_of_week ?? 1) === d.dow).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
          return (
            <div key={d.dow} style={{ minHeight: 86, borderRadius: 11, padding: '8px 6px', background: isToday ? 'rgba(255,90,31,0.05)' : 'rgba(21,19,15,0.02)', border: `1px solid ${isToday ? 'rgba(255,90,31,0.3)' : 'rgba(21,19,15,0.05)'}` }}>
              <p style={{ fontSize: 10.5, fontWeight: 800, color: isToday ? '#C43E14' : INK2, textAlign: 'center', margin: '0 0 6px', letterSpacing: '0.04em' }}>{d.label}{isToday ? ' ·' : ''}</p>
              {dayRuns.map(r => {
                const st = AGENT_STYLE[r.agent_key] || AGENT_STYLE.scan;
                const Icon = st.icon;
                return (
                  <button key={r.id} onClick={() => openEdit(r)} title={r.agent_name}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: '100%', padding: '6px 7px', marginBottom: 5, border: 'none', borderRadius: 8, background: st.bg, cursor: 'pointer', fontFamily: F, textAlign: 'left' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: st.color }}>
                      <Icon size={10} /> {r.time}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: INK, lineHeight: 1.25, display: 'flex', alignItems: 'center', gap: 3 }}>
                      {r.agent_name}
                      <InfoTip text={st.tip} />
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Edit popover */}
      {editing && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 80 }} onClick={() => setEditing(null)} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 90, width: 260, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.18)', padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>{editing.agent_name}</span>
              <button onClick={() => setEditing(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}><X size={14} color={INK2} /></button>
            </div>
            <label style={{ fontSize: 11, fontWeight: 700, color: INK2, display: 'block', marginBottom: 4 }}>Day</label>
            <select value={editDay} onChange={e => setEditDay(Number(e.target.value))}
              style={{ width: '100%', padding: '7px 10px', fontSize: 12.5, border: `1px solid ${BORDER}`, borderRadius: 8, marginBottom: 10, fontFamily: F, background: '#fff' }}>
              {DAYS.map(d => <option key={d.dow} value={d.dow}>{d.label}</option>)}
            </select>
            <label style={{ fontSize: 11, fontWeight: 700, color: INK2, display: 'block', marginBottom: 4 }}>Time</label>
            <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', fontSize: 12.5, border: `1px solid ${BORDER}`, borderRadius: 8, marginBottom: 14, fontFamily: F, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={cancelRun} style={{ flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 700, color: '#DC2626', background: 'rgba(220,38,38,0.08)', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: F }}>Cancel run</button>
              <button onClick={saveEdit} style={{ flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 700, color: '#fff', background: INK, border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: F }}>Save</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}