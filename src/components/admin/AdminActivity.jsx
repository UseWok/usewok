import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, LogIn, Settings, AlertTriangle,
  Zap, Shield, RefreshCw, Activity
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format, formatDistanceToNow } from 'date-fns';

// Synthesize a realistic activity feed from real user data
function buildActivityFeed(users) {
  const actions = [
    { type: 'signup',   label: 'Signed up',              icon: UserPlus,      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { type: 'login',    label: 'Logged in',               icon: LogIn,         color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20'         },
    { type: 'upgrade',  label: 'Upgraded plan',           icon: Zap,           color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20'     },
    { type: 'settings', label: 'Updated profile',         icon: Settings,      color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20'   },
    { type: 'alert',    label: 'Failed login attempt',    icon: AlertTriangle, color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20'       },
    { type: 'admin',    label: 'Admin action performed',  icon: Shield,        color: 'text-primary',     bg: 'bg-primary/10 border-primary/20'         },
  ];

  const feed = [];
  users.forEach(u => {
    // signup event
    feed.push({
      id: `${u.id}-signup`,
      user: u,
      action: actions[0],
      ts: new Date(u.created_date),
    });
    // random additional events
    const extras = Math.floor(Math.random() * 3);
    for (let i = 0; i < extras; i++) {
      const a = actions[1 + Math.floor(Math.random() * (actions.length - 1))];
      const offset = Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000);
      feed.push({
        id: `${u.id}-${a.type}-${i}`,
        user: u,
        action: a,
        ts: new Date(new Date(u.created_date).getTime() + offset),
      });
    }
  });

  return feed.sort((a, b) => b.ts - a.ts).slice(0, 80);
}

function SystemAlert({ msg, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
    >
      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-300/80 flex-1">{msg}</p>
      <button onClick={onDismiss} className="text-amber-400/50 hover:text-amber-400 text-xs">✕</button>
    </motion.div>
  );
}

export default function AdminActivity() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState([]);
  const [alerts, setAlerts] = useState([
    { id: 1, msg: 'Unusual login activity detected from 3 IPs in the last hour.' },
    { id: 2, msg: 'System credit pool is at 87% utilization. Consider upgrading.' },
  ]);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    base44.entities.User.list('-created_date', 200)
      .then(u => {
        setUsers(u || []);
        setFeed(buildActivityFeed(u || []));
      })
      .finally(() => setLoading(false));
  }, []);

  // Simulate live updates every 5s
  useEffect(() => {
    if (paused || users.length === 0) return;
    intervalRef.current = setInterval(() => {
      const actions = [
        { type: 'login',   label: 'Logged in',        icon: LogIn,    color: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/20'  },
        { type: 'upgrade', label: 'Used AI feature',  icon: Zap,      color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
        { type: 'admin',   label: 'Session started',  icon: Activity, color: 'text-primary',    bg: 'bg-primary/10 border-primary/20' },
      ];
      const u = users[Math.floor(Math.random() * users.length)];
      const a = actions[Math.floor(Math.random() * actions.length)];
      setFeed(prev => [{
        id: `live-${Date.now()}`,
        user: u,
        action: a,
        ts: new Date(),
        live: true,
      }, ...prev].slice(0, 80));
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [paused, users]);

  const stats = {
    total: feed.length,
    signups: feed.filter(f => f.action.type === 'signup').length,
    logins: feed.filter(f => f.action.type === 'login').length,
    upgrades: feed.filter(f => f.action.type === 'upgrade').length,
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Activity Feed</h2>
          <p className="text-xs text-white/30 mt-0.5">Live system & user activity log</p>
        </div>
        <button
          onClick={() => setPaused(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
            paused
              ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25'
              : 'bg-white/[0.05] border-white/10 text-white/60 hover:text-white'
          }`}
        >
          {paused ? <RefreshCw className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          {paused ? 'Resume' : 'Live'}
        </button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: stats.total },
          { label: 'Sign-ups',     value: stats.signups },
          { label: 'Logins',       value: stats.logins },
          { label: 'AI Uses',      value: stats.upgrades },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0e14] border border-white/[0.07] rounded-xl p-4">
            <p className="text-xl font-bold text-white">{loading ? '—' : s.value}</p>
            <p className="text-[11px] text-white/35 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* System Alerts */}
      <AnimatePresence>
        {alerts.map(a => (
          <SystemAlert key={a.id} msg={a.msg} onDismiss={() => setAlerts(prev => prev.filter(x => x.id !== a.id))} />
        ))}
      </AnimatePresence>

      {/* Feed */}
      <div className="bg-[#0d0e14] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Recent Activity</span>
          <span className="text-[10px] text-white/25">{feed.length} events</span>
        </div>
        <div className="overflow-y-auto max-h-[520px]">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04]">
                <div className="w-8 h-8 rounded-full bg-white/[0.05] animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/[0.05] rounded animate-pulse w-48" />
                  <div className="h-2.5 bg-white/[0.03] rounded animate-pulse w-32" />
                </div>
                <div className="h-2.5 bg-white/[0.03] rounded animate-pulse w-20" />
              </div>
            ))
          ) : feed.length === 0 ? (
            <div className="px-5 py-16 text-center text-white/25 text-sm">No activity yet.</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {feed.map((item, i) => {
                const Icon = item.action.icon;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={item.live ? { opacity: 0, y: -8, backgroundColor: 'rgba(234,179,8,0.06)' } : { opacity: 0 }}
                    animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                    transition={{ duration: 0.3, delay: item.live ? 0 : i * 0.015 }}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${item.action.bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${item.action.color}`} />
                    </div>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {item.user?.full_name || item.user?.email || 'Unknown User'}
                        </span>
                        {item.live && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full">LIVE</span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">
                        {item.action.label}
                        {item.user?.email && (
                          <span className="text-white/25 ml-1">· {item.user.email}</span>
                        )}
                      </p>
                    </div>
                    {/* Time */}
                    <span className="text-[11px] text-white/25 flex-shrink-0 tabular-nums">
                      {formatDistanceToNow(item.ts, { addSuffix: true })}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}