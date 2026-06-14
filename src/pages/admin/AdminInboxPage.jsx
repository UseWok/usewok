/**
 * Admin Unified Inbox
 * Centralizes: Support Tickets, Enterprise Leads, Invoice Requests, Cancellation Requests
 * All data is real — fetched from DB. All actions mutate DB.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Star, FileText, XCircle, Send, Check, X, RefreshCw,
  ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle, Filter, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const TAB_CONFIG = [
  { key: 'tickets',      label: 'Support',       icon: MessageSquare, color: '#F95738' },
  { key: 'leads',        label: 'Enterprise',     icon: Star,          color: '#7B4FE0' },
  { key: 'invoices',     label: 'Invoices',       icon: FileText,      color: '#3B8BEB' },
  { key: 'cancellations',label: 'Cancellations',  icon: XCircle,       color: '#E8184A' },
];

const STATUS_STYLE = {
  open:        { bg: 'rgba(239,68,68,0.12)',   text: '#ef4444',  label: 'Open' },
  in_progress: { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b',  label: 'In Progress' },
  closed:      { bg: 'rgba(34,197,94,0.12)',   text: '#22c55e',  label: 'Closed' },
  new:         { bg: 'rgba(59,139,235,0.12)',  text: '#3B8BEB',  label: 'New' },
  contacted:   { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b',  label: 'Contacted' },
  pending:     { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b',  label: 'Pending' },
  approved:    { bg: 'rgba(34,197,94,0.12)',   text: '#22c55e',  label: 'Approved' },
  rejected:    { bg: 'rgba(239,68,68,0.12)',   text: '#ef4444',  label: 'Rejected' },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.open;
  return (
    <span style={{ background: s.bg, color: s.text, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {s.label}
    </span>
  );
}

function ItemCard({ item, type, onRefetch }) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Permanently delete this item?')) return;
    try {
      if (type === 'tickets' || type === 'cancellations' || type === 'invoices') {
        await base44.entities.SupportTicket.delete(item.id);
      } else if (type === 'leads') {
        await base44.entities.ContactLead.delete(item.id);
      }
      toast.success('Deleted');
      onRefetch();
    } catch { toast.error('Error deleting'); }
  };

  const handleReplyTicket = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: item.user_email,
        subject: `[WOK Support] Response to your ticket`,
        body: `Hello,\n\nHere is our team's response regarding your support request:\n\n${reply}\n\nBest regards,\nThe WOK Team`,
      });
      await base44.entities.SupportTicket.update(item.id, { status: 'closed' });
      toast.success('Reply sent & ticket closed');
      setReply('');
      onRefetch();
    } finally { setSending(false); }
  };

  const handleReplyLead = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: item.email,
        subject: `WOK Enterprise — Response to your inquiry`,
        body: `Hello ${item.first_name || ''},\n\n${reply}\n\nBest regards,\nWOK Enterprise Team`,
      });
      await base44.entities.ContactLead.update(item.id, { status: 'contacted' });
      toast.success('Lead replied & marked as contacted');
      setReply('');
      onRefetch();
    } finally { setSending(false); }
  };

  const handleApproveCancellation = async () => {
    if (!confirm('Approve this cancellation request?')) return;
    try {
      await base44.entities.SupportTicket.update(item.id, {
        cancel_status: 'approved',
        cancel_approved_at: new Date().toISOString(),
        status: 'closed',
      });
      toast.success('Cancellation approved');
      onRefetch();
    } catch { toast.error('Error'); }
  };

  const handleRejectCancellation = async () => {
    try {
      await base44.entities.SupportTicket.update(item.id, {
        cancel_status: 'rejected',
        status: 'closed',
      });
      toast.success('Cancellation rejected');
      onRefetch();
    } catch { toast.error('Error'); }
  };

  const handleChangeTicketStatus = async (status) => {
    try {
      if (type === 'tickets' || type === 'cancellations') {
        await base44.entities.SupportTicket.update(item.id, { status });
      } else if (type === 'leads') {
        await base44.entities.ContactLead.update(item.id, { status });
      }
      toast.success('Status updated');
      onRefetch();
    } catch { toast.error('Error updating status'); }
  };

  const title = type === 'tickets' || type === 'cancellations'
    ? (item.title || item.description?.slice(0, 60) || 'Ticket')
    : type === 'leads'
    ? `${item.first_name || ''} ${item.last_name || ''} — ${item.role || ''}`
    : `Invoice request — ${item.invoice_email || item.user_email}`;

  const subtitle = type === 'tickets' || type === 'cancellations'
    ? item.user_email
    : type === 'leads'
    ? item.email
    : item.user_email;

  const status = type === 'leads' ? item.status : (type === 'cancellations' ? (item.cancel_status || item.status) : item.status);

  const date = item.created_date ? new Date(item.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div style={{ background: '#111', border: '1px solid #222', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
            <StatusBadge status={status} />
            {type === 'tickets' && item.category && (
              <span style={{ fontSize: 10, background: '#1A1A1A', color: '#888', padding: '2px 6px', borderRadius: 4 }}>{item.category}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#666' }}>
            <span>{subtitle}</span>
            <span>·</span>
            <span>{date}</span>
          </div>
        </div>
          <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          style={{ width: 28, height: 28, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', flexShrink: 0, marginLeft: 4 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555'; }}
          title="Delete permanently"
        >
          <Trash2 size={13} />
        </button>
        {expanded ? <ChevronUp size={14} color="#555" /> : <ChevronDown size={14} color="#555" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid #1E1E1E' }}>
              {/* Full description */}
              {(item.description || item.message) && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Message</p>
                  <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>{item.description || item.message}</p>
                </div>
              )}

              {/* Lead extras */}
              {type === 'leads' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                  {item.website && <div><p style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>Website</p><p style={{ fontSize: 12, color: '#aaa' }}>{item.website}</p></div>}
                  {item.role && <div><p style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>Role</p><p style={{ fontSize: 12, color: '#aaa' }}>{item.role}</p></div>}
                </div>
              )}

              {/* Cancellation extras */}
              {type === 'cancellations' && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  {item.cancel_status !== 'approved' && item.cancel_status !== 'rejected' && (
                    <>
                      <button onClick={handleApproveCancellation} style={{ padding: '7px 16px', background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Approve Cancellation
                      </button>
                      <button onClick={handleRejectCancellation} style={{ padding: '7px 16px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Status controls */}
              {type !== 'cancellations' && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Update Status</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(type === 'leads'
                      ? ['new', 'contacted', 'closed']
                      : ['open', 'in_progress', 'closed']
                    ).map(s => (
                      <button key={s} onClick={() => handleChangeTicketStatus(s)}
                        style={{
                          padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 5, cursor: 'pointer', border: 'none',
                          background: status === s ? '#fff' : '#1A1A1A',
                          color: status === s ? '#000' : '#888',
                          transition: 'all 120ms',
                        }}>
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply box */}
              {(type === 'tickets' || type === 'leads') && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Reply by Email</p>
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder={`Reply to ${subtitle}…`}
                    rows={3}
                    style={{ width: '100%', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 7, padding: '10px 12px', fontSize: 13, color: '#fff', resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                  />
                  <button
                    onClick={type === 'tickets' ? handleReplyTicket : handleReplyLead}
                    disabled={!reply.trim() || sending}
                    style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#F95738', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: (!reply.trim() || sending) ? 0.5 : 1 }}
                  >
                    <Send size={12} />
                    {sending ? 'Sending…' : 'Send & Close'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminInboxPage() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [data, setData] = useState({ tickets: [], leads: [], invoices: [], cancellations: [] });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const [allTickets, leads] = await Promise.all([
        base44.entities.SupportTicket.list('-created_date', 200),
        base44.entities.ContactLead.list('-created_date', 100).catch(() => []),
      ]);
      const tickets = (allTickets || []).filter(t => t.category !== 'cancellation' && t.category !== 'invoice');
      const invoices = (allTickets || []).filter(t => t.category === 'invoice');
      const cancellations = (allTickets || []).filter(t => t.category === 'cancellation');
      setData({ tickets, leads: leads || [], invoices, cancellations });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const counts = {
    tickets: data.tickets.filter(t => t.status === 'open').length,
    leads: data.leads.filter(l => l.status === 'new').length,
    invoices: data.invoices.filter(i => i.status === 'open').length,
    cancellations: data.cancellations.filter(c => !c.cancel_status || c.cancel_status === 'pending').length,
  };

  const activeData = data[activeTab] || [];
  const filtered = statusFilter === 'all' ? activeData : activeData.filter(item => {
    const s = activeTab === 'cancellations' ? (item.cancel_status || item.status) : item.status;
    return s === statusFilter;
  });

  return (
    <div style={{ padding: 32, color: '#fff', minHeight: '100%', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>Unified Inbox</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>All inbound requests in one place — real data only</p>
        </div>
        <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, color: '#888', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#111', borderRadius: 10, padding: 4, border: '1px solid #1E1E1E', width: 'fit-content' }}>
        {TAB_CONFIG.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          const cnt = counts[t.key];
          return (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setStatusFilter('all'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
                borderRadius: 7, border: 'none', cursor: 'pointer',
                background: isActive ? t.color : 'transparent',
                color: isActive ? '#fff' : '#666',
                fontSize: 13, fontWeight: isActive ? 700 : 500,
                transition: 'all 120ms', position: 'relative',
              }}>
              <Icon size={14} />
              {t.label}
              {cnt > 0 && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#E8184A',
                  color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 800,
                  padding: '1px 6px', minWidth: 18, textAlign: 'center',
                }}>{cnt}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Filter size={13} color="#555" />
        {['all', 'open', 'in_progress', 'closed', 'new', 'contacted', 'pending', 'approved', 'rejected']
          .filter(s => {
            if (activeTab === 'leads') return ['all', 'new', 'contacted', 'closed'].includes(s);
            if (activeTab === 'cancellations') return ['all', 'pending', 'approved', 'rejected', 'open', 'closed'].includes(s);
            return ['all', 'open', 'in_progress', 'closed'].includes(s);
          })
          .map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{
                padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: statusFilter === s ? '#fff' : '#1A1A1A',
                color: statusFilter === s ? '#000' : '#666',
                textTransform: 'capitalize',
              }}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#555' }}>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #333', borderTopColor: '#F95738', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555', fontSize: 14 }}>
          <CheckCircle size={32} style={{ margin: '0 auto 12px', color: '#2A2A2A' }} />
          No items found
        </div>
      ) : (
        filtered.map(item => (
          <ItemCard key={item.id} item={item} type={activeTab} onRefetch={load} />
        ))
      )}
    </div>
  );
}