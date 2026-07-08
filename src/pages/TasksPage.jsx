import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getActiveDomain } from '@/lib/active-domain';
import { getCachedUser, peekCache, setCache } from '@/lib/data-cache';
import { Search, Zap, Play, Check, Ban, Trash2, ChevronDown } from 'lucide-react';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const VIOLET = '#7C3AED';
const ORANGE = '#F97316';
const GREEN = '#10B981';
const BLUE = '#3B8BEB';

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 12, color: INK3 }}>{label}</span>
      </div>
      <p style={{ fontSize: 26, fontWeight: 800, color: color || INK, margin: 0, letterSpacing: '-0.02em' }}>{value}</p>
    </div>
  );
}

function ImpactRing({ value }) {
  const r = 13, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 34, height: 34 }}>
      <svg width={34} height={34} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={17} cy={17} r={r} fill="none" stroke="#F0EDE8" strokeWidth={3} />
        <circle cx={17} cy={17} r={r} fill="none" stroke={ORANGE} strokeWidth={3} strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round" />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: INK }}>{value}</span>
    </div>
  );
}

function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.id === value)?.label || label;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: '#fff', border: `1px solid ${open ? VIOLET : BORDER}`, borderRadius: 10, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: INK, fontFamily: F, whiteSpace: 'nowrap' }}>
        {current} <ChevronDown size={12} color={INK3} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 51, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 6, minWidth: 160, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}>
            {options.map(o => (
              <div key={o.id} onClick={() => { onChange(o.id); setOpen(false); }}
                style={{ padding: '8px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12.5, color: INK, background: value === o.id ? '#F3EEFB' : 'transparent' }}
                onMouseEnter={e => { if (value !== o.id) e.currentTarget.style.background = '#FAF9F6'; }}
                onMouseLeave={e => { if (value !== o.id) e.currentTarget.style.background = 'transparent'; }}>
                {o.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const TYPE_COLORS = { 'Technical': { bg: 'rgba(59,139,235,0.12)', c: BLUE }, 'Technique': { bg: 'rgba(59,139,235,0.12)', c: BLUE }, 'Content': { bg: 'rgba(16,185,129,0.12)', c: GREEN }, 'Contenu': { bg: 'rgba(16,185,129,0.12)', c: GREEN }, 'Off-site': { bg: 'rgba(124,58,237,0.12)', c: VIOLET }, 'Hors-site': { bg: 'rgba(124,58,237,0.12)', c: VIOLET } };
const EFFORT_C = { 'Low': GREEN, 'Faible': GREEN, 'Medium': ORANGE, 'Moyen': ORANGE, 'High': '#EF4444', 'Élevé': '#EF4444' };
const STATUS_CFG = {
  todo: { label: 'To do', c: INK3, icon: null },
  in_progress: { label: 'In progress', c: BLUE, icon: Play },
  done: { label: 'Done', c: GREEN, icon: Check },
};

export default function TasksPage() {
  const _active0 = getActiveDomain();
  const _tkey0 = `tasks_${_active0?.url || 'all'}`;
  const _seed = peekCache(_tkey0);
  const [tasks, setTasks] = useState(_seed || []);
  const [loading, setLoading] = useState(!_seed);
  const [q, setQ] = useState('');
  const [fStatus, setFStatus] = useState('all');
  const [fType, setFType] = useState('all');
  const [fSource, setFSource] = useState('all');
  const [fPriority, setFPriority] = useState('all');

  const load = async () => {
    try {
      const u = await getCachedUser();
      if (!u) return;
      const active = getActiveDomain();
      const query = { user_id: u.id };
      if (active?.url) query.site_url = active.url;
      const list = await base44.entities.ActionTask.filter(query, '-created_date', 200);
      setTasks(list);
      setCache(`tasks_${active?.url || 'all'}`, list);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (t, status) => {
    try { await base44.entities.ActionTask.update(t.id, { status }); setTasks(prev => prev.map(x => x.id === t.id ? { ...x, status } : x)); } catch {}
  };
  const remove = async (t) => {
    try { await base44.entities.ActionTask.delete(t.id); setTasks(prev => prev.filter(x => x.id !== t.id)); } catch {}
  };

  const parseMeta = (t) => { try { return JSON.parse(t.note || '{}'); } catch { return {}; } };

  const filtered = tasks.filter(t => {
    const m = parseMeta(t);
    if (q && !(t.action_title || '').toLowerCase().includes(q.toLowerCase())) return false;
    if (fStatus !== 'all' && (t.status || 'todo') !== fStatus) return false;
    if (fType !== 'all' && (m.type || '') !== fType) return false;
    if (fSource !== 'all' && (m.source || '') !== fSource) return false;
    if (fPriority !== 'all' && (m.impact_label || '') !== fPriority) return false;
    return true;
  });

  const total = tasks.length;
  const quickWins = tasks.filter(t => { const m = parseMeta(t); return (m.impact_label === 'High' || m.impact_label === 'Fort' || m.impact_score >= 60) && (m.effort === 'Low' || m.effort === 'Faible'); }).length;
  const pending = tasks.filter(t => !t.status || t.status === 'todo').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const completed = tasks.filter(t => t.status === 'done').length;

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F0', fontFamily: F }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: '0 0 3px', letterSpacing: '-0.03em' }}>Tasks</h1>
        <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 20px' }}>Action center — recommendations from your audits, ranked by impact.</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
          <StatCard label="Total Actions" value={total} />
          <StatCard label="Quick Wins" value={quickWins} color={ORANGE} icon={<Zap size={13} color={ORANGE} />} />
          <StatCard label="Pending" value={pending} color="#EF4444" />
          <StatCard label="In Progress" value={inProgress} color={BLUE} />
          <StatCard label="Completed" value={completed} color={GREEN} />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '9px 14px', flex: 1, minWidth: 200 }}>
            <Search size={14} color={INK3} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: INK, fontFamily: F, width: '100%' }} />
          </div>
          <Dropdown label="All statuses" value={fStatus} onChange={setFStatus} options={[{ id: 'all', label: 'All statuses' }, { id: 'todo', label: 'To do' }, { id: 'in_progress', label: 'In progress' }, { id: 'done', label: 'Done' }]} />
          <Dropdown label="All types" value={fType} onChange={setFType} options={[{ id: 'all', label: 'All types' }, { id: 'Technical', label: 'Technical' }, { id: 'Content', label: 'Content' }, { id: 'Off-site', label: 'Off-site' }]} />
          <Dropdown label="All sources" value={fSource} onChange={setFSource} options={[{ id: 'all', label: 'All sources' }, { id: 'Audit', label: 'Audit' }, { id: 'Brand image', label: 'Brand image' }, { id: 'Recommendations', label: 'Recommendations' }]} />
          <Dropdown label="All priorities" value={fPriority} onChange={setFPriority} options={[{ id: 'all', label: 'All priorities' }, { id: 'High', label: 'High' }, { id: 'Medium', label: 'Medium' }, { id: 'Low', label: 'Low' }]} />
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 130px 90px', padding: '12px 20px', borderBottom: `1px solid ${BORDER}` }}>
            {['RECOMMENDATION', 'IMPACT', 'EFFORT', 'STATUS', ''].map((h, i) => (
              <span key={i} style={{ fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.05em', textAlign: i === 0 ? 'left' : 'center' }}>{h}</span>
            ))}
          </div>
          {loading && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '28px 0' }}>Loading…</p>}
          {!loading && filtered.length === 0 && (
            <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '40px 0' }}>No tasks yet. Add recommendations from Brand image or Recommendations.</p>
          )}
          {filtered.map(t => {
            const m = parseMeta(t);
            const typeC = TYPE_COLORS[m.type] || { bg: '#F0EDE8', c: INK3 };
            const st = STATUS_CFG[t.status || 'todo'];
            const StIcon = st.icon;
            return (
              <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 130px 90px', padding: '14px 20px', borderBottom: `1px solid ${BORDER}`, alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 6px' }}>{t.action_title}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {m.type && <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10.5, fontWeight: 700, background: typeC.bg, color: typeC.c }}>{m.type}</span>}
                    {m.source && <span style={{ padding: '2px 8px', borderRadius: 5, fontSize: 10.5, fontWeight: 600, background: 'rgba(232,24,74,0.10)', color: '#E8184A' }}>{m.source}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}><ImpactRing value={m.impact_score || 55} /></div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: EFFORT_C[m.effort] || ORANGE }}>{m.effort || 'Medium'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 16, background: `${st.c}15`, color: st.c, fontSize: 11.5, fontWeight: 700 }}>
                    {StIcon && <StIcon size={11} />} {st.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                  <button onClick={() => setStatus(t, 'done')} title="Mark done" style={{ width: 24, height: 24, borderRadius: '50%', background: GREEN, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="#fff" /></button>
                  <button onClick={() => setStatus(t, t.status === 'in_progress' ? 'todo' : 'in_progress')} title="In progress" style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK3 }}><Ban size={15} /></button>
                  <button onClick={() => remove(t)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}