import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Zap, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';

// Only show real signup events from actual user data
function buildActivityFeed(users) {
  const signupAction = { type: 'signup', label: 'Signed up', icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  const upgradeAction = { type: 'upgrade', label: 'Upgraded plan', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };

  return users
    .map(u => {
      const events = [{ id: `${u.id}-signup`, user: u, action: signupAction, ts: new Date(u.created_date) }];
      // Only show upgrade if user actually has a non-free plan
      if (u.plan_id && u.plan_id !== 'free') {
        events.push({ id: `${u.id}-upgrade`, user: u, action: upgradeAction, ts: new Date(u.updated_date || u.created_date) });
      }
      return events;
    })
    .flat()
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 50);
}


export default function AdminActivity() {
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    base44.entities.User.list('-created_date', 200)
      .then(u => setFeed(buildActivityFeed(u || [])))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    signups: feed.filter(f => f.action.type === 'signup').length,
    upgrades: feed.filter(f => f.action.type === 'upgrade').length,
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Real User Activity</h2>
          <p className="text-xs text-white/30 mt-0.5">Signups & upgrades from your actual users</p>
        </div>
        <button onClick={() => { setLoading(true); base44.entities.User.list('-created_date', 200).then(u => setFeed(buildActivityFeed(u || []))).finally(() => setLoading(false)); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border bg-white/[0.05] border-white/10 text-white/60 hover:text-white transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Sign-ups', value: stats.signups, color: 'text-emerald-400' },
          { label: 'Paid Upgrades',  value: stats.upgrades, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0e14] border border-white/[0.07] rounded-xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            <p className="text-[11px] text-white/35 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

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