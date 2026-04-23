import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

function CancellationCard({ ticket, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const isApproved = ticket.cancel_status === 'approved';
  const isRejected = ticket.cancel_status === 'rejected';
  const isPending = !ticket.cancel_status || ticket.cancel_status === 'pending';

  // Check if approved more than 24h ago → show countdown or already deleted
  const approvedAt = ticket.cancel_approved_at ? new Date(ticket.cancel_approved_at) : null;
  const deleteAt = approvedAt ? new Date(approvedAt.getTime() + 24 * 60 * 60 * 1000) : null;
  const now = new Date();
  const msLeft = deleteAt ? deleteAt - now : null;
  const hoursLeft = msLeft ? Math.max(0, Math.ceil(msLeft / 3600000)) : null;

  const handleApprove = async () => {
    setLoading(true);
    // Calculate end date = today + remaining days in current period (approx 30 days from now)
    const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await base44.entities.SupportTicket.update(ticket.id, {
      cancel_status: 'approved',
      cancel_approved_at: new Date().toISOString(),
      cancel_ends_at: endsAt,
      status: 'closed',
    });
    toast.success(`Annulation approuvée — abonnement se termine le ${new Date(endsAt).toLocaleDateString('fr-FR')}`);
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
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px]" style={{ color: '#aaa' }}>{new Date(ticket.created_date).toLocaleDateString('fr-FR')}</span>
          </div>
          {isApproved && hoursLeft !== null && hoursLeft > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" style={{ color: '#f59e0b' }} />
              <span className="text-[10px] font-semibold" style={{ color: '#f59e0b' }}>Auto-delete in {hoursLeft}h</span>
            </div>
          )}
        </div>
        <button onClick={() => setExpanded(e => !e)} className="w-7 h-7 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '6px' }}>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              {/* Full message */}
              <div className="pt-3">
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#aaa' }}>Raison</p>
                <p className="text-xs leading-relaxed p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.03)', color: '#444' }}>{ticket.description}</p>
              </div>
              {ticket.invoice_email && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#aaa' }}>Email paiement</p>
                  <p className="text-xs" style={{ color: '#444' }}>{ticket.invoice_email}</p>
                </div>
              )}
              {isApproved && ticket.cancel_ends_at && (
                <div className="px-3 py-2 rounded-md text-xs font-semibold" style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a' }}>
                  Abonnement se termine le {new Date(ticket.cancel_ends_at).toLocaleDateString('fr-FR')}
                </div>
              )}

              {/* Actions */}
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
                {(isApproved || isRejected) && (
                  <button onClick={handleDelete} disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete now
                  </button>
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
      const cancellations = all.filter(t => t.category === 'cancellation');

      // Auto-delete all cancellation tickets older than 15 days
      const now = new Date();
      const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
      for (const t of cancellations) {
        const createdAt = new Date(t.created_date);
        if (now - createdAt > FIFTEEN_DAYS_MS) {
          await base44.entities.SupportTicket.delete(t.id).catch(() => {});
        }
      }

      // Reload after potential deletions
      const fresh = await base44.entities.SupportTicket.list('-created_date', 200);
      setTickets(fresh.filter(t => t.category === 'cancellation'));
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