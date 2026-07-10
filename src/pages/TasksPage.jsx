import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { getActiveDomain } from '@/lib/active-domain';
import { getCachedUser, peekCache, setCache } from '@/lib/data-cache';
import { Zap, Sparkles, ArrowRight } from 'lucide-react';
import TaskColumn from '@/components/tasks/TaskColumn';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const VIOLET = '#7C3AED';
const ORANGE = '#F97316';
const GREEN = '#10B981';
const BLUE = '#3B8BEB';

const COLUMNS = [
  { id: 'todo', title: 'À faire', hint: 'Ce qu\'il reste à traiter', dot: INK3 },
  { id: 'in_progress', title: 'En cours', hint: 'Ce sur quoi tu travailles', dot: BLUE },
  { id: 'done', title: 'Terminé', hint: 'Bravo, c\'est réglé 🎉', dot: GREEN },
];

const parseMeta = (t) => { try { return JSON.parse(t.note || '{}'); } catch { return {}; } };
const isQuickWin = (m) => (m.impact_label === 'High' || m.impact_label === 'Fort' || m.impact_score >= 60) && (m.effort === 'Low' || m.effort === 'Faible');

// ── État vide : opportunité de guider ──
function EmptyState({ onGo }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, padding: '48px 32px', textAlign: 'center', maxWidth: 560, margin: '20px auto 0' }}>
      <div style={{ width: 62, height: 62, borderRadius: 18, background: 'rgba(124,58,237,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
        <Sparkles size={28} color={VIOLET} />
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Tu n'as pas encore d'actions en cours</h2>
      <p style={{ fontSize: 14, color: INK3, margin: '0 0 22px', lineHeight: 1.55 }}>
        Découvre ce que les IA disent de toi et transforme chaque recommandation en action, d'un seul clic.
      </p>
      <button onClick={onGo}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
        Voir les recommandations <ArrowRight size={16} strokeWidth={2.4} />
      </button>
    </div>
  );
}

export default function TasksPage() {
  const navigate = useNavigate();
  const _active0 = getActiveDomain();
  const _seed = peekCache(`tasks_${_active0?.url || 'all'}`);
  const [tasks, setTasks] = useState(_seed || []);
  const [loading, setLoading] = useState(!_seed);

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

  const remove = async (t) => {
    try { await base44.entities.ActionTask.delete(t.id); setTasks(prev => prev.filter(x => x.id !== t.id)); } catch {}
  };

  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;
    if (!destination) return;
    const newStatus = destination.droppableId;
    const t = tasks.find(x => x.id === draggableId);
    if (!t || (t.status || 'todo') === newStatus) return;
    setTasks(prev => prev.map(x => x.id === draggableId ? { ...x, status: newStatus } : x));
    try { await base44.entities.ActionTask.update(draggableId, { status: newStatus }); } catch { load(); }
  };

  const byStatus = (s) => tasks.filter(t => (t.status || 'todo') === s);
  const total = tasks.length;
  const done = byStatus('done').length;
  const quickWins = tasks.filter(t => isQuickWin(parseMeta(t))).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F0', fontFamily: F }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: '0 0 3px', letterSpacing: '-0.03em' }}>Tes actions</h1>
        <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 20px' }}>Fais glisser tes cartes de « À faire » à « Terminé » au fur et à mesure que tu avances.</p>

        {loading ? (
          <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '40px 0' }}>Chargement…</p>
        ) : total === 0 ? (
          <EmptyState onGo={() => navigate('/recommendations')} />
        ) : (
          <>
            {/* Barre de progression — gamification légère */}
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>
                  {done} sur {total} action{total > 1 ? 's' : ''} terminée{done > 1 ? 's' : ''}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {quickWins > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: ORANGE }}>
                      <Zap size={13} /> {quickWins} action{quickWins > 1 ? 's' : ''} rapide{quickWins > 1 ? 's' : ''}
                    </span>
                  )}
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: GREEN }}>{pct}%</span>
                </div>
              </div>
              <div style={{ height: 8, borderRadius: 20, background: 'rgba(21,19,15,0.07)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 20, background: `linear-gradient(90deg, ${VIOLET}, ${GREEN})`, transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* Kanban */}
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'stretch' }}>
                {COLUMNS.map(col => (
                  <TaskColumn
                    key={col.id}
                    columnId={col.id}
                    title={col.title}
                    hint={col.hint}
                    dotColor={col.dot}
                    tasks={byStatus(col.id)}
                    parseMeta={parseMeta}
                    onRemove={remove}
                  />
                ))}
              </div>
            </DragDropContext>
          </>
        )}
      </div>
    </div>
  );
}