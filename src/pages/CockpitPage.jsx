import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Plus, Target, TrendingUp, Flame, Star, CheckCircle2, Circle, Trash2, X, GripVertical, Search, LayoutGrid, List, ChevronDown, ChevronRight } from 'lucide-react';

const PROJECT_TYPES = [
  { id: 'entrepreneur', label: 'Entrepreneur', emoji: '🚀', color: '#6366f1', bg: 'from-violet-500/15', milestones: ['Define my idea', 'Validate the market', 'Create the MVP', 'First sales', 'Fundraise'] },
  { id: 'realestate',   label: 'Real Estate',  emoji: '🏠', color: '#3b82f6', bg: 'from-blue-500/15',   milestones: ['Save down payment', 'Evaluate capacity', 'Search properties', 'Negotiate & sign', 'Move in'] },
  { id: 'investment',   label: 'Investment',   emoji: '📈', color: '#10b981', bg: 'from-emerald-500/15',milestones: ['Emergency fund', 'Open brokerage', 'First €1k invested', '€10k milestone', 'Passive income'] },
  { id: 'debt',         label: 'Debt-Free',    emoji: '🎯', color: '#ef4444', bg: 'from-red-500/15',    milestones: ['List all debts', 'Avalanche plan', 'First debt paid', '50% reduction', 'Debt-free!'] },
  { id: 'career',       label: 'Career',       emoji: '💼', color: '#f59e0b', bg: 'from-amber-500/15',  milestones: ['Skills audit', 'Train in field', 'Networking', 'Interviews', 'New position'] },
  { id: 'savings',      label: 'Savings',      emoji: '💰', color: '#8b5cf6', bg: 'from-purple-500/15', milestones: ['Monthly budget', '1 month saved', '3 months saved', '6 months saved', '1 year saved'] },
];

const STORAGE_KEY = 'wok_cockpit_v2';
const getProjects = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };
const saveProjects = (p) => localStorage.setItem(STORAGE_KEY, JSON.stringify(p));

// ── SVG S-Curve progress chart ─────────────────────────────────────────────
function ProgressCurve({ progress = 0, milestones = [], color = '#6366f1' }) {
  const w = 300, h = 90, pad = 20;
  const steps = milestones.length;
  const pts = milestones.map((_, i) => {
    const x = pad + (i / (steps - 1)) * (w - pad * 2);
    const t = i / (steps - 1);
    const y = h - pad - (h - pad * 2) * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    return { x, y };
  });
  const buildPath = (points) => points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = points[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
  }, '');
  const completedIdx = Math.round((progress / 100) * (steps - 1));
  const fullPath = buildPath(pts);
  const progPath = pts.slice(0, completedIdx + 1).length > 1 ? buildPath(pts.slice(0, completedIdx + 1)) : null;
  const last = pts[Math.min(completedIdx, pts.length - 1)];

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={fullPath} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" strokeLinecap="round" />
      {progPath && <path d={progPath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />}
      {pts.map((pt, i) => {
        const done = i <= completedIdx;
        return (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={done ? 5 : 3.5} fill={done ? color : 'rgba(255,255,255,0.1)'} stroke={done ? color : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" />
          </g>
        );
      })}
      {progPath && <circle cx={last.x} cy={last.y} r={10} fill={color} opacity="0.18" />}
    </svg>
  );
}

// ── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onUpdate, onDelete, view }) {
  const [expanded, setExpanded] = useState(false);
  const type = PROJECT_TYPES.find(t => t.id === project.type) || PROJECT_TYPES[0];
  const done = (project.completedMilestones || []).length;
  const total = type.milestones.length;
  const progress = Math.round((done / total) * 100);

  const toggleMilestone = (idx) => {
    const cur = project.completedMilestones || [];
    onUpdate({ ...project, completedMilestones: cur.includes(idx) ? cur.filter(i => i !== idx) : [...cur, idx] });
  };

  if (view === 'list') {
    return (
      <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
        className="group flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="text-xl flex-shrink-0">{type.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white truncate">{project.name}</p>
          <p className="text-[11px] text-white/30">{type.label}</p>
        </div>
        <div className="w-24 h-1.5 bg-white/8 rounded-full overflow-hidden flex-shrink-0">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: type.color }} />
        </div>
        <span className="text-[12px] font-bold w-10 text-right flex-shrink-0" style={{ color: type.color }}>{progress}%</span>
        {progress === 100 && <Star className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
        <button onClick={e => { e.stopPropagation(); onDelete(project.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-400 rounded transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <ChevronRight className={`w-3.5 h-3.5 text-white/20 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </motion.div>
    );
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className={`rounded-2xl border border-white/6 bg-gradient-to-br ${type.bg} to-transparent overflow-hidden`}
      style={{ background: 'rgba(255,255,255,0.025)' }}
    >
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 mt-0.5" style={{ background: `${type.color}18` }}>
          {type.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[14px] font-bold text-white truncate">{project.name}</h3>
            {progress === 100 && <Star className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
          </div>
          <p className="text-[11px] text-white/35 mb-3">{type.label} · {done}/{total} steps</p>
          <div className="h-1 w-full bg-white/6 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: type.color }} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-white/25">Progress</span>
            <span className="text-[11px] font-bold" style={{ color: type.color }}>{progress}%</span>
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onDelete(project.id); }} className="p-1.5 text-white/15 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-white/5">
            <div className="px-4 pb-4 pt-3">
              <div className="mb-3">
                <ProgressCurve progress={progress} milestones={type.milestones} color={type.color} />
              </div>
              <div className="space-y-1">
                {type.milestones.map((m, idx) => {
                  const isDone = (project.completedMilestones || []).includes(idx);
                  return (
                    <button key={idx} onClick={() => toggleMilestone(idx)} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                      {isDone
                        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: type.color }} />
                        : <Circle className="w-4 h-4 flex-shrink-0 text-white/20" />}
                      <span className={`text-[12px] ${isDone ? 'line-through text-white/25' : 'text-white/60'}`}>{m}</span>
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

// ── Create Modal ──────────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');
  const type = PROJECT_TYPES.find(t => t.id === selected);

  const handleCreate = () => {
    if (!selected || !name.trim()) return;
    onCreate({ id: `proj_${Date.now()}`, type: selected, name: name.trim(), completedMilestones: [], createdAt: Date.now() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#111] border border-white/8 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-5 border-b border-white/6 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-white">New Objective</h2>
            <p className="text-[11px] text-white/30 mt-0.5">{step === 0 ? 'Choose a project type' : 'Name your project'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/30 hover:text-white hover:bg-white/8 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5">
          {step === 0 ? (
            <>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {PROJECT_TYPES.map(t => (
                  <button key={t.id} onClick={() => setSelected(t.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${selected === t.id ? 'border-white/20 bg-white/8' : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'}`}
                  >
                    <span className="text-lg">{t.emoji}</span>
                    <div>
                      <p className="text-[12px] font-semibold text-white/80">{t.label}</p>
                      <p className="text-[10px] text-white/30">{t.milestones.length} steps</p>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => selected && setStep(1)} disabled={!selected} className="w-full py-3 bg-white text-black text-[13px] font-bold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-30">
                Continue →
              </button>
            </>
          ) : (
            <>
              {type && (
                <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ background: `${type.color}12`, border: `1px solid ${type.color}25` }}>
                  <span className="text-xl">{type.emoji}</span>
                  <div>
                    <p className="text-[12px] font-semibold text-white">{type.label}</p>
                    <p className="text-[11px] text-white/40">{type.milestones.join(' → ')}</p>
                  </div>
                </div>
              )}
              <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder={`e.g. "My SaaS by end of 2025"`}
                className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/20 mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => setStep(0)} className="flex-1 py-3 border border-white/8 text-white/50 text-[12px] font-semibold rounded-xl hover:bg-white/5 transition-colors">← Back</button>
                <button onClick={handleCreate} disabled={!name.trim()} className="flex-1 py-3 bg-white text-black text-[13px] font-bold rounded-xl hover:bg-white/90 transition-colors disabled:opacity-30">Create</button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CockpitPage() {
  const [projects, setProjects] = useState(getProjects);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  const totalProgress = projects.length
    ? Math.round(projects.reduce((sum, p) => {
        const t = PROJECT_TYPES.find(x => x.id === p.type);
        return sum + ((p.completedMilestones || []).length / (t?.milestones.length || 1)) * 100;
      }, 0) / projects.length)
    : 0;

  const activeCount = projects.filter(p => {
    const t = PROJECT_TYPES.find(x => x.id === p.type);
    return (p.completedMilestones || []).length < (t?.milestones.length || 1);
  }).length;

  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (PROJECT_TYPES.find(t => t.id === p.type)?.label || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (proj) => { const u = [proj, ...projects]; setProjects(u); saveProjects(u); };
  const handleUpdate = (upd) => { const u = projects.map(p => p.id === upd.id ? upd : p); setProjects(u); saveProjects(u); };
  const handleDelete = (id) => { const u = projects.filter(p => p.id !== id); setProjects(u); saveProjects(u); };
  const handleReorder = (newOrder) => { setProjects(newOrder); saveProjects(newOrder); };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans pb-24">
      <AnimatePresence>{showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}</AnimatePresence>

      {/* Header */}
      <div className="px-6 sm:px-8 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1">Visual Cockpit</p>
              <h1 className="text-[30px] font-black text-white tracking-tight leading-none">My Projects</h1>
              <p className="text-[13px] text-white/35 mt-1.5">Track your objectives. Drag to reorder.</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-[13px] font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95 shadow-lg flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> New
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Total', value: projects.length, color: '#6366f1', icon: Target },
              { label: 'Active', value: activeCount, color: '#f59e0b', icon: Flame },
              { label: 'Progress', value: `${totalProgress}%`, color: '#10b981', icon: TrendingUp },
            ].map((k, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-white/5 px-4 py-3.5" style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <k.icon className="w-3.5 h-3.5 mb-2" style={{ color: k.color }} />
                <p className="text-[24px] font-black text-white leading-none">{k.value}</p>
                <p className="text-[10px] text-white/30 mt-1 font-semibold uppercase tracking-wider">{k.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Search + View toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"
                className="w-full bg-white/[0.04] border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/15 transition-colors"
              />
            </div>
            <div className="flex bg-white/[0.04] border border-white/8 rounded-xl p-1 gap-0.5">
              <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
              <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><List className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-6 sm:px-8">
        {projects.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            {/* Visual placeholder */}
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-500/20 to-blue-500/10 border border-white/8 flex items-center justify-center text-5xl">
                🎯
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-white/8 flex items-center justify-center text-lg">
                🚀
              </div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-white/8 flex items-center justify-center text-sm">
                📈
              </div>
            </div>
            <h2 className="text-[22px] font-black text-white mb-2">No projects yet</h2>
            <p className="text-[13px] text-white/35 mb-6 max-w-xs leading-relaxed">Create your first objective and visualize your progress step by step.</p>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[13px] font-bold rounded-xl hover:bg-white/90 transition-all">
              <Plus className="w-4 h-4" /> Create my first project
            </button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/25 text-[13px]">No project matches "{search}"</div>
        ) : view === 'list' ? (
          <Reorder.Group axis="y" values={projects} onReorder={handleReorder} className="space-y-1.5">
            {filtered.map(p => (
              <Reorder.Item key={p.id} value={p} className="flex items-center gap-2 group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 flex-shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <ProjectCard project={p} onUpdate={handleUpdate} onDelete={handleDelete} view="list" />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <Reorder.Group axis="y" values={projects} onReorder={handleReorder} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(p => (
              <Reorder.Item key={p.id} value={p} className="group relative">
                <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40">
                  <GripVertical className="w-4 h-4" />
                </div>
                <ProjectCard project={p} onUpdate={handleUpdate} onDelete={handleDelete} view="grid" />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}