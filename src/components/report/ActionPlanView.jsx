import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Zap, ChevronDown, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E8';
const SURFACE = '#F7F7F5';
const WHITE = '#FFFFFF';

const STATUS_CFG = {
  todo:        { label: 'À faire',    color: INK3,      bg: SURFACE,    border: BORDER,    icon: Circle },
  in_progress: { label: 'En cours',  color: '#B45309',  bg: '#FFFBEB',  border: '#FDE68A', icon: Clock },
  done:        { label: 'Terminé',   color: '#059669',  bg: '#ECFDF5',  border: '#BBF7D0', icon: CheckCircle },
};

function StatusPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[value] || STATUS_CFG.todo;
  const Icon = cfg.icon;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(!open); }}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px', borderRadius: 8, border: `1px solid ${cfg.border}`, background: cfg.bg, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: cfg.color, fontFamily: F, transition: 'all 0.15s' }}>
        <Icon size={11} />
        {cfg.label}
        <ChevronDown size={10} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 130 }}>
          {Object.entries(STATUS_CFG).map(([k, c]) => {
            const I = c.icon;
            return (
              <button key={k} onClick={e => { e.stopPropagation(); onChange(k); setOpen(false); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: value === k ? SURFACE : WHITE, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: c.color, fontFamily: F, textAlign: 'left' }}>
                <I size={12} />
                {c.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ActionPlanView({ plan, siteUrl, onGenerate }) {
  const [expanded, setExpanded] = useState(null);
  const [tasks, setTasks] = useState({}); // key: index → { id, status, note }
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) { setLoading(false); return; }
      setUser(u);
      loadTasks(u.id);
    }).catch(() => setLoading(false));
  }, [siteUrl]);

  const loadTasks = async (userId) => {
    try {
      const existing = await base44.entities.ActionTask.filter({ user_id: userId, site_url: siteUrl });
      const map = {};
      for (const t of existing) map[t.action_index] = t;
      setTasks(map);
    } catch {}
    setLoading(false);
  };

  const handleStatusChange = async (index, newStatus, item) => {
    if (!user) return;
    setSaving(prev => ({ ...prev, [index]: true }));
    const existing = tasks[index];
    try {
      if (existing?.id) {
        await base44.entities.ActionTask.update(existing.id, { status: newStatus });
        setTasks(prev => ({ ...prev, [index]: { ...prev[index], status: newStatus } }));
      } else {
        const created = await base44.entities.ActionTask.create({
          user_id: user.id,
          site_url: siteUrl || '',
          action_index: index,
          action_title: item.action_title || '',
          engine: item.engine || '',
          platform: item.platform || '',
          status: newStatus,
        });
        setTasks(prev => ({ ...prev, [index]: created }));
      }
    } catch {}
    setSaving(prev => ({ ...prev, [index]: false }));
  };

  if (!plan?.length) return (
    <div style={{ textAlign: 'center', padding: '48px 20px', fontFamily: F }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
      <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Plan d'action non disponible</p>
      <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Lancez un scan pour obtenir votre plan personnalisé.</p>
    </div>
  );

  const done = plan.filter((_, i) => tasks[i]?.status === 'done').length;
  const inProgress = plan.filter((_, i) => tasks[i]?.status === 'in_progress').length;
  const todo = plan.length - done - inProgress;

  return (
    <div style={{ fontFamily: F }}>
      {/* Progress dashboard */}
      <div style={{ background: INK, borderRadius: 16, padding: '20px', marginBottom: 14 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 14px' }}>Tableau de pilotage — Plan d'injection</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'À faire', count: todo, color: '#9CA3AF' },
            { label: 'En cours', count: inProgress, color: '#FBBF24' },
            { label: 'Terminé', count: done, color: '#34D399' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', display: 'flex' }}>
            <div style={{ width: `${(done / plan.length) * 100}%`, background: '#34D399', transition: 'width 0.5s' }} />
            <div style={{ width: `${(inProgress / plan.length) * 100}%`, background: '#FBBF24', transition: 'width 0.5s' }} />
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '8px 0 0' }}>
          {done}/{plan.length} actions terminées · {Math.round((done / plan.length) * 100)}% de votre plan réalisé
        </p>
      </div>

      {/* Action cards */}
      {plan.map((item, i) => {
        const task = tasks[i];
        const status = task?.status || 'todo';
        const isOpen = expanded === i;
        const isHigh = item.impact === 'high';
        const isSaving = saving[i];

        return (
          <div key={i} style={{
            background: WHITE, border: `1px solid ${status === 'done' ? '#BBF7D0' : status === 'in_progress' ? '#FDE68A' : BORDER}`,
            borderRadius: 14, overflow: 'hidden', marginBottom: 8,
            opacity: status === 'done' ? 0.7 : 1, transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
              {/* Index */}
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: INK3 }}>{i + 1}</span>
              </div>

              {/* Content */}
              <button onClick={() => setExpanded(isOpen ? null : i)}
                style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, minWidth: 0, fontFamily: F }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{item.action_title}</span>
                  {isHigh && <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '2px 6px', borderRadius: 20, flexShrink: 0 }}>↑ Impact élevé</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#4338CA', background: '#EEF2FF', padding: '1px 6px', borderRadius: 4 }}>{item.engine}</span>
                  {item.platform && <span style={{ fontSize: 10, color: INK3 }}>→ {item.platform}</span>}
                </div>
              </button>

              {/* Status picker */}
              <div style={{ flexShrink: 0, opacity: isSaving ? 0.5 : 1, transition: 'opacity 0.15s' }}>
                {loading ? (
                  <div style={{ width: 70, height: 28, background: SURFACE, borderRadius: 8 }} />
                ) : (
                  <StatusPicker value={status} onChange={(s) => handleStatusChange(i, s, item)} />
                )}
              </div>

              <button onClick={() => setExpanded(isOpen ? null : i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <ChevronDown size={14} color={INK3} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            </div>

            {/* Expanded */}
            {isOpen && (
              <div style={{ borderTop: `1px solid ${BORDER}`, padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Lacune identifiée</p>
                  <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 10, padding: '10px 12px' }}>
                    <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.gap}</p>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Pourquoi vos concurrents vous dépassent ici</p>
                  <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.competitor_advantage}</p>
                </div>
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>Action concrète</p>
                  <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.action_detail}</p>
                </div>

                {/* Effort + impact */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, padding: '10px 12px', background: SURFACE, borderRadius: 10, textAlign: 'center' }}>
                    <p style={{ fontSize: 9, color: INK3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>Effort</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>{item.effort === 'low' ? '⚡ Rapide' : item.effort === 'medium' ? '⏱ Moyen' : '🔧 Complexe'}</p>
                  </div>
                  <div style={{ flex: 1, padding: '10px 12px', background: isHigh ? '#ECFDF5' : SURFACE, borderRadius: 10, textAlign: 'center' }}>
                    <p style={{ fontSize: 9, color: INK3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px' }}>Impact LRS</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: isHigh ? '#059669' : INK, margin: 0 }}>{isHigh ? '↑ Élevé' : '→ Modéré'}</p>
                  </div>
                </div>

                <button onClick={() => onGenerate?.(item.action_title + ' — ' + item.action_detail, i)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px', background: INK, color: WHITE, border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F, letterSpacing: '-0.01em' }}>
                  <Zap size={13} fill={WHITE} stroke={WHITE} />
                  Générer le contenu d'injection
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}