import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Download, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const FG = '#0A0A0A';

export default function InvoicesTab() {
  const { data: allTickets = [], refetch } = useQuery({
    queryKey: ['invoice_tickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date', 100),
  });

  const tickets = allTickets.filter(t => t.category === 'invoice');

  const markDone = async (id) => {
    await base44.entities.SupportTicket.update(id, { status: 'closed' });
    toast.success('Marqué comme traité');
    refetch();
  };

  const deleteTicket = async (id) => {
    await base44.entities.SupportTicket.delete(id);
    refetch();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{tickets.length} demande{tickets.length !== 1 ? 's' : ''} de facture</p>
      {tickets.length === 0 && (
        <p className="text-sm text-center py-12 text-muted-foreground">Aucune demande de facture</p>
      )}
      {tickets.map(ticket => (
        <div key={ticket.id} className="bg-white border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 bg-muted rounded-lg">
            <Download className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-fg">{ticket.user_name || ticket.user_email}</p>
            <p className="text-xs text-muted-foreground">{ticket.user_email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Plan: <strong>{ticket.user_plan}</strong> · Email paiement: <strong>{ticket.invoice_email || '—'}</strong>
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {new Date(ticket.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${ticket.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {ticket.status === 'closed' ? 'TRAITÉ' : 'EN ATTENTE'}
            </span>
            {ticket.status !== 'closed' && (
              <button onClick={() => markDone(ticket.id)} className="w-7 h-7 flex items-center justify-center bg-green-50 hover:bg-green-100 rounded transition-colors">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </button>
            )}
            <button onClick={() => deleteTicket(ticket.id)} className="w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded transition-colors">
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}