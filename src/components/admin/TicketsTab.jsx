import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown, ChevronUp, Send, Bug, Zap, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const CAT_LABELS = {
  bug_report: { label: 'Bug Report', icon: Bug, color: '#ef4444' },
  chat_issue: { label: 'Problème Chat', icon: MessageSquare, color: '#f59e0b' },
  other: { label: 'Autre', icon: Zap, color: '#888' },
};

const STATUS_COLORS = {
  open: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
  in_progress: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b' },
  closed: { bg: 'rgba(22,163,74,0.1)', text: '#16a34a' },
};

function TicketRow({ ticket, onRefetch }) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const cat = CAT_LABELS[ticket.category] || CAT_LABELS.other;
  const Icon = cat.icon;
  const status = STATUS_COLORS[ticket.status] || STATUS_COLORS.open;

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: ticket.user_email,
      subject: `[Stensor Support] Réponse à votre ticket`,
      body: `Bonjour,\n\nVoici la réponse de l'équipe Stensor concernant votre ticket :\n\n${reply}\n\nCordialement,\nL'équipe Stensor`,
    });
    await base44.entities.Notification.create({
      title: `Réponse à votre ticket — ${ticket.category?.replace('_', ' ')}`,
      message: reply.slice(0, 200),
      link: '/support',
      link_label: 'Voir mes tickets',
    });
    await base44.entities.SupportTicket.update(ticket.id, { status: 'closed', admin_reply: reply });
    setReply('');
    setSending(false);
    onRefetch();
  };

  const changeStatus = async (s) => {
    await base44.entities.SupportTicket.update(ticket.id, { status: s });
    onRefetch();
  };

  return (
    <div className="bg-white rounded-sm overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-black/2 transition-colors">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
          style={{ background: `${cat.color}15`, borderRadius: '4px' }}>
          <Icon className="w-4 h-4" style={{ color: cat.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: FG }}>{ticket.description?.slice(0, 60)}…</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs" style={{ color: '#999' }}>{ticket.user_email}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase" style={{ background: 'rgba(0,0,0,0.05)', color: '#555', borderRadius: '2px' }}>{ticket.user_plan || 'free'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-bold px-2 py-0.5" style={{ background: status.bg, color: status.text, borderRadius: '3px' }}>
            {ticket.status?.toUpperCase() || 'OPEN'}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" style={{ color: '#bbb' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#bbb' }} />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-2 space-y-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#aaa' }}>Description complète</p>
                <p className="text-sm leading-relaxed" style={{ color: '#444' }}>{ticket.description}</p>
              </div>
              {ticket.discussion_id && (
                <p className="text-xs" style={{ color: '#888' }}>Discussion liée : <code>{ticket.discussion_id}</code></p>
              )}
              {ticket.file_urls?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#aaa' }}>Fichiers joints</p>
                  <div className="flex gap-2 flex-wrap">
                    {ticket.file_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 text-xs"
                        style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '3px', color: '#555' }}>
                        <ExternalLink className="w-3 h-3" /> Fichier {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#aaa' }}>Statut</p>
                <div className="flex gap-2">
                  {['open', 'in_progress', 'closed'].map(s => (
                    <button key={s} onClick={() => changeStatus(s)}
                      className="px-3 py-1.5 text-xs font-semibold transition-all"
                      style={{
                        background: ticket.status === s ? FG : 'rgba(0,0,0,0.05)',
                        color: ticket.status === s ? 'white' : '#555',
                        borderRadius: '3px',
                      }}>
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#aaa' }}>Répondre par email</p>
                <textarea value={reply} onChange={e => setReply(e.target.value)}
                  placeholder={`Réponse à ${ticket.user_email}...`}
                  rows={3} className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none mb-2"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                <button onClick={sendReply} disabled={!reply.trim() || sending}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold disabled:opacity-40"
                  style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                  <Send className="w-3.5 h-3.5" />
                  {sending ? 'Envoi...' : 'Envoyer & Clore'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

export default function TicketsTab() {
  const { data: allTickets = [], refetch } = useQuery({
    queryKey: ['support_tickets'],
    queryFn: async () => {
      const list = await base44.entities.SupportTicket.list('-created_date', 100);
      // Auto-delete tickets (non-cancellation) older than 15 days
      const now = new Date();
      for (const t of list) {
        if (t.category !== 'cancellation' && now - new Date(t.created_date) > FIFTEEN_DAYS_MS) {
          await base44.entities.SupportTicket.delete(t.id).catch(() => {});
        }
      }
      return base44.entities.SupportTicket.list('-created_date', 100);
    },
  });

  const tickets = allTickets.filter(t => t.category !== 'cancellation');
  const open = tickets.filter(t => t.status === 'open');
  const rest = tickets.filter(t => t.status !== 'open');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#666' }}>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} — <span style={{ color: '#ef4444' }}>{open.length} ouvert{open.length !== 1 ? 's' : ''}</span></p>
      </div>
      {tickets.length === 0 && (
        <p className="text-sm text-center py-12" style={{ color: '#aaa' }}>Aucun ticket pour l'instant</p>
      )}
      {[...open, ...rest].map(ticket => (
        <TicketRow key={ticket.id} ticket={ticket} onRefetch={refetch} />
      ))}
    </div>
  );
}