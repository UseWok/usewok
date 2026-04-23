import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trash2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { getPlansConfig } from '@/lib/plans-config';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

// Compute the next renewal date from subscription_date and billing_cycle
function getNextRenewalDate(subscriptionDate, billingCycle) {
  if (!subscriptionDate) return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const d = new Date(subscriptionDate);
  const now = new Date();
  if (billingCycle === 'yearly') {
    while (d <= now) d.setFullYear(d.getFullYear() + 1);
  } else {
    while (d <= now) d.setMonth(d.getMonth() + 1);
  }
  return d;
}

function CancellationCard({ ticket, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const isApproved = ticket.cancel_status === 'approved';
  const isRejected = ticket.cancel_status === 'rejected';
  const isPending = !ticket.cancel_status || ticket.cancel_status === 'pending';

  const handleApprove = async () => {
    setLoading(true);

    // Fetch the actual user to get subscription_date and billing_cycle
    let endsAt;
    try {
      const users = await base44.entities.User.filter({ email: ticket.user_email });
      if (users.length > 0) {
        const u = users[0];
        const renewalDate = getNextRenewalDate(u.subscription_date || u.created_date, u.billing_cycle);
        endsAt = renewalDate.toISOString();
        // Mark user subscription as cancelled (will auto-downgrade when ends_at passes)
        await base44.entities.User.update(u.id, { subscription_cancelled: true, subscription_ends_at: endsAt });
      } else {
        endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
    } catch {
      endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    await base44.entities.SupportTicket.update(ticket.id, {
      cancel_status: 'approved',
      cancel_approved_at: new Date().toISOString(),
      cancel_ends_at: endsAt,
      status: 'closed',
    });
    toast.success(`Cancellation approved — subscription ends on ${new Date(endsAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    setLoading(false);
    onUpdate();
  };

  const handleReject = async () => {
    setLoading(true);
    await base44.entities.SupportTicket.update(ticket.id, {
      cancel_status: 'rejected',
      status: 'closed',
    });
    toast.success('Cancellation rejected');
    setLoading(false);
    onUpdate();
  };

  const handleDelete = async () => {
    setLoading(true);
    await base44.entities.SupportTicket.delete(ticket.id);
    onUpdate();
  };

  const statusColor = isApproved ? '#16a34a' : isRejected ? '#ef4444' : '#f59e0b';
  const statusLabel = isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending';

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black" style={{ color: FG }}>{ticket.user_name || ticket.user_email?.split('@')[0]}</p>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded" style={{ background: `${statusColor}15`, color: statusColor }}>{statusLabel}</span>
            {ticket.user_plan && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.06)', color: '#555' }}>
                {ticket.user_plan} · {ticket.user_plan_price}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>{ticket.user_email}</p>
          <p className="text-xs mt-1 line-clamp-2" style={{ color: '#666' }}>{ticket.description}</p>
          <span className="text-[10px]" style={{ color: '#aaa' }}>{new Date(ticket.created_date).toLocaleDateString('en-US')}</span>
          {isApproved && ticket.cancel_ends_at && (
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" style={{ color: '#16a34a' }} />
              <span className="text-[10px] font-semibold" style={{ color: '#16a34a' }}>
                Ends {new Date(ticket.cancel_ends_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={handleDelete} disabled={loading}
            className="w-7 h-7 flex items-center justify-center hover:bg-red-50 transition-colors"
            style={{ borderRadius: '4px' }}>
            <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="w-7 h-7 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '6px' }}>
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="pt-3">
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#aaa' }}>Reason</p>
                <p className="text-xs leading-relaxed p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.03)', color: '#444' }}>{ticket.description}</p>
              </div>
              {ticket.invoice_email && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#aaa' }}>Payment email</p>
                  <p className="text-xs" style={{ color: '#444' }}>{ticket.invoice_email}</p>
                </div>
              )}
              {isApproved && ticket.cancel_ends_at && (
                <div className="px-3 py-2 rounded-md text-xs font-semibold" style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a' }}>
                  Subscription ends on {new Date(ticket.cancel_ends_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                {isPending && (
                  <>
                    <button onClick={handleApprove} disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-lg transition-all disabled:opacity-40"
                      style={{ background: '#16a34a', color: 'white' }}>
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={handleReject} disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-lg transition-all disabled:opacity-40"
                      style={{ background: '#ef4444', color: 'white' }}>
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CancellationsTab() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | approved | rejected

  const load = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.SupportTicket.list('-created_date', 200);
      setTickets(all.filter(t => t.category === 'cancellation'));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = tickets.filter(t => {
    if (filter === 'pending') return !t.cancel_status || t.cancel_status === 'pending';
    if (filter === 'approved') return t.cancel_status === 'approved';
    if (filter === 'rejected') return t.cancel_status === 'rejected';
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-black" style={{ color: FG }}>Cancellations ({tickets.length})</p>
        <div className="flex gap-1.5">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2.5 py-1 text-[11px] font-bold rounded-md capitalize transition-all"
              style={{ background: filter === f ? FG : 'rgba(0,0,0,0.05)', color: filter === f ? 'white' : '#666' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(0,0,0,0.1)', borderTopColor: FG }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10" style={{ color: '#ccc' }}>
          <p className="text-sm font-semibold">No cancellation requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => <CancellationCard key={t.id} ticket={t} onUpdate={load} />)}
        </div>
      )}
    </div>
  );
}