import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { getPlansConfig, getUserPlan } from '@/lib/plans-config';
import { Plus, Target, TrendingUp, Zap, ChevronRight, BarChart2, Flame, Star, Clock, CheckCircle2, Circle, Edit3, Trash2, X } from 'lucide-react';

const PROJECT_TYPES = [
  { id: 'entrepreneur', label: 'Become an entrepreneur', icon: '🚀', milestones: ['Define my idea', 'Validate the market', 'Create the MVP', 'First sales', 'Fundraise'] },
  { id: 'realestate', label: 'Buy a property', icon: '🏠', milestones: ['Save the down payment', 'Evaluate my capacity', 'Search for properties', 'Negotiate & sign', 'Move in'] },
  { id: 'investment', label: 'Investment portfolio', icon: '📈', milestones: ['Emergency fund', 'Open a brokerage account', 'First €1,000 invested', '€10k milestone', 'Passive income'] },
  { id: 'debt', label: 'Eliminate my debts', icon: '🎯', milestones: ['List all debts', 'Debt avalanche plan', 'First debt paid off', '50% reduction', 'Debt-free'] },
  { id: 'career', label: 'Career change', icon: '💼', milestones: ['Skills audit', 'Train in new field', 'Networking', 'First interviews', 'New position'] },
  { id: 'savings', label: 'Build savings', icon: '💰', milestones: ['Monthly budget', '1 month saved', '3 months saved', '6 months saved', '1 year saved'] },
];

const STORAGE_KEY = 'wok_cockpit_projects';

const getProjects = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
};
const saveProjects = (p) => localStorage.setItem(STORAGE_KEY, JSON.stringify(p));

// A smooth SVG progress curve
function ProgressCurve({ progress = 0, milestones = [], projectType }) {
  const w = 340, h = 120;
  const pad = 24;
  const steps = milestones.length;
  const pts = milestones.map((_, i) => {
    const x = pad + (i / (steps - 1)) * (w - pad * 2);
    // S-curve: slow start, accelerate, slow end
    const t = i / (steps - 1);
    const y = h - pad - (h - pad * 2) * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    return { x, y };
  });

  // Build smooth path
  const path = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  // Progress line (clip to completed steps)
  const completedIdx = Math.round((progress / 100) * (steps - 1));
  const ppts = pts.slice(0, completedIdx + 1);
  const progPath = ppts.length > 1
    ? ppts.reduce((acc, pt, i) => {
        if (i === 0) return `M ${pt.x},${pt.y}`;
        const prev = ppts[i - 1];
        const cx = (prev.x + pt.x) / 2;
        return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
      }, '')
    : null;

  const colors = { entrepreneur: '#6366f1', realestate: '#0055FF', investment: '#10b981', debt: '#ef4444', career: '#f59e0b', savings: '#8b5cf6' };
  const color = colors[projectType] || '#0055FF';

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      {/* Background track */}
      <path d={path} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" strokeLinecap="round" />
      {/* Progress track */}
      {progPath && <path d={progPath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.9" />}
      {/* Milestone dots */}
      {pts.map((pt, i) => {
        const done = i <= completedIdx;
        return (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={done ? 6 : 4} fill={done ? color : 'rgba(255,255,255,0.12)'} stroke={done ? color : 'rgba(255,255,255,0.2)'} strokeWidth="2" />
            {done && <circle cx={pt.x} cy={pt.y} r={9} fill="none" stroke={color} strokeWidth="1" opacity="0.3" />}
          </g>
        );
      })}
      {/* Current position glow */}
      {ppts.length > 0 && (() => {
        const last = ppts[ppts.length - 1];
        return <circle cx={last.x} cy={last.y} r={12} fill={color} opacity="0.15" />;
      })()}
    </svg>
  );
}

function ProjectCard({ project, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const type = PROJECT_TYPES.find(t => t.id === project.type) || PROJECT_TYPES[0];
  const completedCount = (project.completedMilestones || []).length;
  const total = type.milestones.length;
  const progress = Math.round((completedCount / total) * 100);

  const toggleMilestone = (idx) => {
    const current = project.completedMilestones || [];
    const updated = current.includes(idx)
      ? current.filter(i => i !== idx)
      : [...current, idx];
    onUpdate({ ...project, completedMilestones: updated });
  };

  const colors = { entrepreneur: 'from-violet-500/10', realestate: 'from-blue-500/10', investment: 'from-emerald-500/10', debt: 'from-red-500/10', career: 'from-amber-500/10', savings: 'from-purple-500/10' };
  const accentMap = { entrepreneur: '#818cf8', realestate: '#3b82f6', investment: '#34d399', debt: '#f87171', career: '#fbbf24', savings: '#a78bfa' };
  const accent = accentMap[project.type] || '#3b82f6';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`rounded-2xl border border-white/8 bg-gradient-to-br ${colors[project.type] || ''} to-transparent overflow-hidden`}
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="text-2xl flex-shrink-0 mt-0.5">{type.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[15px] font-bold text-white truncate">{project.name}</h3>
            {progress === 100 && <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
          </div>
          <p className="text-[12px] text-white/40 mb-3">{type.label}</p>
          {/* Mini progress bar */}
          <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: accent }} />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[11px] text-white/30">{completedCount}/{total} steps</span>
            <span className="text-[11px] font-bold" style={{ color: accent }}>{progress}%</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
          className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </button>

      {/* Expanded: curve + milestones */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="px-5 py-4">
              <div className="mb-4">
                <ProgressCurve progress={progress} milestones={type.milestones} projectType={project.type} />
              </div>
              <div className="space-y-2">
                {type.milestones.map((milestone, idx) => {
                  const done = (project.completedMilestones || []).includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleMilestone(idx)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      {done
                        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
                        : <Circle className="w-4 h-4 flex-shrink-0 text-white/20" />
                      }
                      <span className={`text-[13px] ${done ? 'line-through text-white/30' : 'text-white/70'}`}>{milestone}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CreateProjectModal({ onClose, onCreate }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!selected || !name.trim()) return;
    onCreate({ id: `proj_${Date.now()}`, type: selected, name: name.trim(), completedMilestones: [], createdAt: Date.now() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#111111] border border-white/8 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-white">New Objective</h2>
          <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white hover:bg-white/8 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {step === 0 ? (
            <>
              <p className="text-[13px] text-white/40 mb-4">What type of project are you working on?</p>
              <div className="grid grid-cols-2 gap-2.5">
                {PROJECT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelected(type.id)}
                    className={`flex flex-col items-start gap-2 p-3.5 rounded-xl border transition-all text-left ${selected === type.id ? 'border-blue-500/60 bg-blue-500/8' : 'border-white/6 bg-white/[0.02] hover:bg-white/5 hover:border-white/12'}`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-[12px] font-semibold text-white/70 leading-tight">{type.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => selected && setStep(1)}
                disabled={!selected}
                className="mt-4 w-full py-3 bg-white text-black text-[14px] font-bold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </>
          ) : (
            <>
              <p className="text-[13px] text-white/40 mb-3">Give your project a name</p>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder={`e.g. "Start my SaaS in 2025"`}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/40 mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => setStep(0)} className="flex-1 py-3 border border-white/8 text-white/60 text-[13px] font-semibold rounded-xl hover:bg-white/5 transition-colors">← Back</button>
                <button onClick={handleCreate} disabled={!name.trim()} className="flex-1 py-3 bg-white text-black text-[14px] font-bold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-30">Create</button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function CockpitPage() {
  const [projects, setProjects] = useState(getProjects);
  const [showCreate, setShowCreate] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const totalProgress = projects.length
    ? Math.round(projects.reduce((sum, p) => {
        const type = PROJECT_TYPES.find(t => t.id === p.type);
        if (!type) return sum;
        return sum + ((p.completedMilestones || []).length / type.milestones.length) * 100;
      }, 0) / projects.length)
    : 0;

  const activeCount = projects.filter(p => {
    const type = PROJECT_TYPES.find(t => t.id === p.type);
    if (!type) return false;
    return (p.completedMilestones || []).length < type.milestones.length;
  }).length;

  const handleCreate = (proj) => {
    const updated = [proj, ...projects];
    setProjects(updated);
    saveProjects(updated);
  };

  const handleUpdate = (updated) => {
    const all = projects.map(p => p.id === updated.id ? updated : p);
    setProjects(all);
    saveProjects(all);
  };

  const handleDelete = (id) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
  };

  return (
    <div className="min-h-screen bg-[#08090c] font-sans pb-20">
      <AnimatePresence>
        {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
      </AnimatePresence>

      {/* Header */}
      <div className="px-4 sm:px-8 pt-8 pb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-1">Cockpit</p>
              <h1 className="text-[28px] sm:text-[34px] font-black text-white tracking-tight leading-none">Visual Dashboard</h1>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-[13px] font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Objective</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </motion.div>

        {/* KPI strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mt-6"
        >
          {[
            { label: 'Projects', value: projects.length, icon: Target, color: '#6366f1' },
            { label: 'In progress', value: activeCount, icon: Flame, color: '#f59e0b' },
            { label: 'Avg. progress', value: `${totalProgress}%`, icon: TrendingUp, color: '#10b981' },
          ].map((kpi, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/6 px-4 py-3.5"
              style={{ background: 'rgba(255,255,255,0.025)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
                <span className="text-[11px] text-white/30 font-semibold">{kpi.label}</span>
              </div>
              <p className="text-[22px] font-black text-white leading-none">{kpi.value}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Projects grid */}
      <div className="px-4 sm:px-8">
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-[20px] font-bold text-white mb-2">No objectives yet</h2>
            <p className="text-[14px] text-white/30 mb-6 max-w-xs">Create your first project and track your progress visually on a personalized curve.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[14px] font-bold rounded-xl hover:bg-white/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Create my first objective
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {projects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}