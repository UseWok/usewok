import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Globe, Briefcase, MessageSquare, Check, X, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_STYLES = {
  new: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20', label: 'New' },
  contacted: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/20', label: 'Contacted' },
  closed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Closed' },
};

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    base44.entities.ContactLead.list('-created_date', 100)
      .then(l => setLeads(l || []))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.ContactLead.update(id, { status });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    toast.success('Status updated.');
  };

  const deleteLead = async (id) => {
    await base44.entities.ContactLead.delete(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    toast.success('Lead deleted.');
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white">Enterprise Leads</h2>
        <p className="text-xs text-white/30 mt-0.5">{leads.length} contact request{leads.length !== 1 ? 's' : ''} received</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-[#0d0e14] border border-white/[0.07] rounded-2xl p-16 text-center">
          <Mail className="w-8 h-8 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-white/25">No enterprise contact requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {leads.map((lead, i) => {
              const s = STATUS_STYLES[lead.status] || STATUS_STYLES.new;
              const isOpen = expanded === lead.id;
              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-[#0d0e14] border border-white/[0.07] rounded-2xl overflow-hidden"
                >
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                    onClick={() => setExpanded(isOpen ? null : lead.id)}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {(lead.first_name || lead.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {lead.first_name || ''} {lead.last_name || ''}
                        {!lead.first_name && !lead.last_name && <span className="text-white/50">{lead.email}</span>}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5 truncate">{lead.email}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                      {s.label}
                    </span>
                    <span className="text-[11px] text-white/25 flex-shrink-0">
                      {lead.created_date ? format(new Date(lead.created_date), 'MMM d') : '—'}
                    </span>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-1 border-t border-white/[0.05] space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                            {lead.email && (
                              <div className="flex items-center gap-2 text-xs text-white/50">
                                <Mail className="w-3.5 h-3.5 text-white/25" />
                                {lead.email}
                              </div>
                            )}
                            {lead.website && (
                              <div className="flex items-center gap-2 text-xs text-white/50">
                                <Globe className="w-3.5 h-3.5 text-white/25" />
                                {lead.website}
                              </div>
                            )}
                            {lead.role && (
                              <div className="flex items-center gap-2 text-xs text-white/50">
                                <Briefcase className="w-3.5 h-3.5 text-white/25" />
                                {lead.role}
                              </div>
                            )}
                          </div>
                          {lead.message && (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="w-3.5 h-3.5 text-white/25" />
                                <span className="text-[11px] font-semibold text-white/30 uppercase tracking-wider">Message</span>
                              </div>
                              <p className="text-sm text-white/60 leading-relaxed">{lead.message}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-1">
                            {['new', 'contacted', 'closed'].map(st => (
                              <button key={st} onClick={() => updateStatus(lead.id, st)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${lead.status === st ? `${STATUS_STYLES[st].bg} ${STATUS_STYLES[st].text} ${STATUS_STYLES[st].border}` : 'bg-white/[0.03] text-white/40 border-white/[0.07] hover:text-white'}`}>
                                {lead.status === st && <Check className="w-3 h-3" />}
                                {STATUS_STYLES[st].label}
                              </button>
                            ))}
                            <button onClick={() => deleteLead(lead.id)}
                              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 transition-all">
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}