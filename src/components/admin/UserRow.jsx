import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Gift, Save, Ban } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getPlansConfig } from '@/lib/plans-config';

export default function UserRow({ u, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [editCredits, setEditCredits] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [saved, setSaved] = useState(false);

  const isBanned = u.is_banned && (!u.ban_until || u.ban_until === 'permanent' || new Date(u.ban_until) > new Date());
  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };
  const pct = Math.min(((u.credits_used || 0) / (u.credits_limit || 10)) * 100, 100);

  const applyCreditsUpdate = async () => {
    const updates = {};
    if (editCredits !== '') updates.credits_used = parseInt(editCredits);
    if (editLimit !== '') updates.credits_limit = parseInt(editLimit);
    if (Object.keys(updates).length === 0) return;
    await base44.entities.User.update(u.id, updates);
    showSaved(); onUpdate(); setEditCredits(''); setEditLimit('');
  };

  const giftCredits = async (amount) => {
    await base44.entities.User.update(u.id, { credits_bonus: (u.credits_bonus || 0) + amount });
    showSaved(); onUpdate();
  };

  const changePlan = async (planId) => {
    const plan = getPlansConfig().find(p => p.id === planId);
    if (!plan) return;
    await base44.entities.User.update(u.id, { subscription_plan: planId, credits_limit: plan.credits_limit, credits_used: 0, credits_bonus: 0 });
    showSaved(); onUpdate();
  };

  const setBan = async (val) => {
    const ban_until = val === 'permanent' ? 'permanent' : new Date(Date.now() + val * 86400000).toISOString();
    await base44.entities.User.update(u.id, { is_banned: true, ban_until });
    showSaved(); onUpdate();
  };

  const removeBan = async () => {
    await base44.entities.User.update(u.id, { is_banned: false, ban_until: null });
    showSaved(); onUpdate();
  };

  return (
    <div className="bg-white border border-border rounded-sm overflow-hidden">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors">
        <div className="w-9 h-9 flex items-center justify-center font-bold text-sm flex-shrink-0 bg-muted text-fg rounded-sm">
          {u.full_name?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate text-fg">{u.full_name || u.email}</p>
            {isBanned && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-100 text-red-600 rounded-sm">BANNED</span>}
            {u.role === 'admin' && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-yuzu text-fg rounded-sm">ADMIN</span>}
            {u.subscription_plan && u.subscription_plan !== 'free' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-muted text-muted-foreground rounded-sm">{u.subscription_plan.toUpperCase()}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-xs truncate text-muted-foreground">{u.email}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-16 h-0.5 bg-black/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : 'bg-fg'}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{u.credits_used || 0}/{u.credits_limit || 10}</span>
            </div>
          </div>
        </div>
        {saved && <span className="text-[10px] font-bold text-green-600 flex-shrink-0">✓</span>}
        {expanded ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-2 space-y-4 border-t border-border">
              {/* Plans */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">Subscription</p>
                <div className="flex gap-2 flex-wrap">
                  {getPlansConfig().map(plan => (
                    <button key={plan.id} onClick={() => changePlan(plan.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-colors ${u.subscription_plan === plan.id ? 'bg-fg text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                      {plan.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Credits */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">Credits</p>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex-1 min-w-[90px]">
                    <label className="text-[10px] mb-1 block text-muted-foreground">Used</label>
                    <input type="number" value={editCredits} onChange={e => setEditCredits(e.target.value)} placeholder={String(u.credits_used || 0)}
                      className="w-full px-2.5 py-2 text-sm border border-border rounded-sm focus:outline-none" />
                  </div>
                  <div className="flex-1 min-w-[90px]">
                    <label className="text-[10px] mb-1 block text-muted-foreground">Limit</label>
                    <input type="number" value={editLimit} onChange={e => setEditLimit(e.target.value)} placeholder={String(u.credits_limit || 10)}
                      className="w-full px-2.5 py-2 text-sm border border-border rounded-sm focus:outline-none" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={applyCreditsUpdate} className="px-3 py-2 text-xs font-bold bg-fg text-white rounded-sm hover:opacity-90">
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Gift */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">Gift bonus credits</p>
                <div className="flex gap-2 flex-wrap">
                  {[10, 25, 50, 100, 500].map(amt => (
                    <button key={amt} onClick={() => giftCredits(amt)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-yuzu text-fg rounded-sm hover:opacity-90">
                      <Gift className="w-3 h-3" /> +{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ban */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">Access</p>
                {isBanned ? (
                  <button onClick={removeBan} className="px-3 py-1.5 text-xs font-semibold bg-muted text-fg rounded-sm hover:bg-muted/80">Unban</button>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {[{ label: '1 day', val: 1 }, { label: '7 days', val: 7 }, { label: '30 days', val: 30 }, { label: 'Permanent', val: 'permanent' }].map(opt => (
                      <button key={opt.label} onClick={() => setBan(opt.val)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-sm ${opt.val === 'permanent' ? 'bg-red-100 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                        <Ban className="w-3 h-3" /> {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}