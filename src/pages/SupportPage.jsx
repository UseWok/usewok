import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, ChevronRight, X, Plus, RefreshCw, Clock, Check, Loader, Upload, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const STATUS_CONFIG = {
  open: { label: 'Open', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  closed: { label: 'Resolved', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
};

export default function SupportPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState('landing'); // landing | tickets | ticket-detail
  const [user, setUser] = useState(null);
  const [myTickets, setMyTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('all'); // all | open | closed
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const loadTickets = (u) => {
    if (!u) return;
    setLoading(true);
    base44.entities.SupportTicket.filter({ user_email: u.email })
      .then(t => {
        setMyTickets(t.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (user) loadTickets(user);
  }, [user]);

  if (page === 'landing') {
    return <LandingPage onNavigate={() => setPage('tickets')} />;
  }

  if (page === 'ticket-detail' && selectedTicket) {
    return (
      <TicketDetailPage
        ticket={selectedTicket}
        user={user}
        onBack={() => setPage('tickets')}
        onUpdate={() => loadTickets(user)}
      />
    );
  }

  // Tickets list page
  const filteredTickets = ticketFilter === 'all'
    ? myTickets
    : myTickets.filter(t => ticketFilter === 'open' ? t.status !== 'closed' : t.status === 'closed');

  return (
    <div className="min-h-screen font-be" style={{ background: '#fafafa' }}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setPage('landing')} className="w-9 h-9 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: FG }} />
          </button>
          <h1 className="text-lg font-black" style={{ color: FG }}>My Support Tickets</h1>
          <div className="flex gap-2">
            <button onClick={() => loadTickets(user)} className="w-9 h-9 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
              <RefreshCw className="w-4 h-4" style={{ color: FG }} />
            </button>
            <button onClick={() => setShowNewTicket(true)} className="px-3 h-9 flex items-center gap-1.5 text-xs font-black"
              style={{ background: FG, color: 'white', borderRadius: '8px' }}>
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {['all', 'open', 'closed'].map(f => (
            <button key={f} onClick={() => setTicketFilter(f)}
              className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize"
              style={{
                background: ticketFilter === f ? FG : 'rgba(0,0,0,0.05)',
                color: ticketFilter === f ? 'white' : '#666'
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Tickets list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-5 h-5 animate-spin" style={{ color: FG }} />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3" style={{ background: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)' }}>
            <MessageSquare className="w-8 h-8" style={{ color: '#ccc' }} />
            <p className="text-sm font-semibold" style={{ color: '#aaa' }}>No tickets</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTickets.map(ticket => {
              const s = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
              return (
                <button key={ticket.id} onClick={() => { setSelectedTicket(ticket); setPage('ticket-detail'); }}
                  className="w-full p-4 text-left transition-all hover:bg-opacity-50"
                  style={{ background: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1" style={{ color: FG }}>
                        {ticket.description?.slice(0, 80)}{ticket.description?.length > 80 ? '…' : ''}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#aaa' }}>
                        {new Date(ticket.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[10px] font-black px-2 py-1 flex-shrink-0" style={{ background: s.bg, color: s.color, borderRadius: '6px' }}>
                      {s.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showNewTicket && (
          <NewTicketModal onClose={() => { setShowNewTicket(false); loadTickets(user); }} user={user} />
        )}
      </AnimatePresence>
    </div>
  );
}

function LandingPage({ onNavigate }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen font-be bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-center mb-12">
          <h1 className="text-5xl font-black mb-3" style={{ color: FG }}>Aide & Support</h1>
          <p className="text-base" style={{ color: '#666' }}>
            Obtenez l'aide dont vous avez besoin pour créer des applications extraordinaires avec BASE44
          </p>
        </motion.div>

        {/* Card - Open ticket only */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          className="max-w-md mx-auto mb-16">
          <motion.button onClick={onNavigate}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full p-8 rounded-lg text-left text-white transition-all relative overflow-hidden group"
            style={{ background: '#2C3E50', minHeight: '260px' }}>
            <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-10" style={{ background: 'white' }} />
            <motion.div className="relative z-10">
              <motion.p className="text-5xl mb-4">🎧</motion.p>
              <h3 className="text-2xl font-black mb-3">Ouvrir un ticket de support</h3>
              <p className="text-sm opacity-90 mb-6">Soumettez un ticket de support détaillé et obtenez une assistance personnalisée.</p>
              <motion.span className="text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                Commencer <ChevronRight className="w-4 h-4" />
              </motion.span>
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Quick actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-xl font-black mb-6" style={{ color: FG }}>Actions rapides</h2>
          <p className="text-xs mb-4" style={{ color: '#aaa' }}>Gérez votre expérience de support</p>
          <div className="grid md:grid-cols-2 gap-4">
            <motion.button onClick={onNavigate}
              whileHover={{ scale: 1.02 }}
              className="p-4 text-left rounded-lg transition-all"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" style={{ color: FG }} />
                <div>
                  <p className="font-semibold" style={{ color: FG }}>Mes tickets de support</p>
                  <p className="text-xs" style={{ color: '#aaa' }}>Afficher et gérer vos tickets</p>
                </div>
              </div>
            </motion.button>
            <motion.a href="https://reddit.com/r/stensor" target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              className="p-4 text-left rounded-lg transition-all"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}>
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5" style={{ color: FG }} />
                <div>
                  <p className="font-semibold" style={{ color: FG }}>Forum communautaire</p>
                  <p className="text-xs" style={{ color: '#aaa' }}>Notre nouvelle communauté Reddit</p>
                </div>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function NewTicketModal({ onClose, user }) {
  const [step, setStep] = useState(0); // 0: description, 1: analyzing, 2: category
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setAnalyzing(true);
    setStep(1);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this support ticket and suggest a category. Respond with ONLY one word: "bug_report", "chat_issue", or "other". Ticket: ${description}`,
        model: 'gpt_5_mini',
      });
      setSuggestedCategory(result.toLowerCase().includes('bug') ? 'bug_report' : result.toLowerCase().includes('chat') ? 'chat_issue' : 'other');
    } catch (e) {
      setSuggestedCategory('other');
    }

    await new Promise(r => setTimeout(r, 800));
    setStep(2);
    setAnalyzing(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await base44.entities.SupportTicket.create({
      description,
      category: category || suggestedCategory || 'other',
      status: 'open',
      user_email: user?.email || '',
      file_urls: [],
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget && step !== 1) onClose(); }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-white rounded-lg overflow-hidden shadow-xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <p className="font-black" style={{ color: FG }}>New Support Ticket</p>
          {step !== 1 && (
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '6px' }}>
              <X className="w-4 h-4" style={{ color: '#999' }} />
            </button>
          )}
        </div>

        <div className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase mb-2 block" style={{ color: '#aaa' }}>Describe your issue</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Explain the problem in detail..."
                  rows={5} className="w-full px-3 py-3 text-sm focus:outline-none resize-none"
                  style={{ border: `1.5px solid ${description ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '8px', transition: 'border-color 0.15s' }} />
              </div>
              <button onClick={handleAnalyze} disabled={!description.trim()}
                className="w-full py-3 text-sm font-black transition-all disabled:opacity-30"
                style={{ background: FG, color: 'white', borderRadius: '8px' }}>
                Continue →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9 }}
                className="w-10 h-10 rounded-full" style={{ border: '3px solid rgba(0,0,0,0.08)', borderTopColor: FG }} />
              <div className="text-center">
                <p className="font-black text-sm" style={{ color: FG }}>Analyzing…</p>
                <p className="text-xs mt-1" style={{ color: '#aaa' }}>Using GPT 5 MINI to categorize</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-black mb-3" style={{ color: FG }}>Suggested Category</p>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(221,255,0,0.1)', border: `1px solid ${YUZU}` }}>
                  <p className="text-sm font-semibold" style={{ color: FG }}>
                    {suggestedCategory === 'bug_report' ? '🐛 Bug Report' : suggestedCategory === 'chat_issue' ? '💬 Chat Issue' : '❓ Other'}
                  </p>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-3 text-sm font-black transition-all disabled:opacity-60"
                style={{ background: FG, color: 'white', borderRadius: '8px' }}>
                {submitting ? 'Submitting…' : 'Submit Ticket →'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function TicketDetailPage({ ticket, user, onBack, onUpdate }) {
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(ticket.messages_json || '[]'); } catch { return []; }
  });
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [ticketStatus, setTicketStatus] = useState(ticket.status);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);

    const msg = { author: 'user', text: newMessage, created_at: new Date().toISOString() };
    const updatedMessages = [...messages, msg];
    setMessages(updatedMessages);
    setNewMessage('');

    await base44.entities.SupportTicket.update(ticket.id, {
      messages_json: JSON.stringify(updatedMessages),
    });
    setSending(false);
  };

  const handleStatusChange = async (newStatus) => {
    setTicketStatus(newStatus);
    await base44.entities.SupportTicket.update(ticket.id, { status: newStatus });
    onUpdate();
  };

  const s = STATUS_CONFIG[ticketStatus];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen font-be" style={{ background: '#f5f5f5' }}>
      <div className="max-w-2xl mx-auto px-4 py-4 pb-32">
        {/* Header */}
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-4 sticky top-0 z-20 bg-white/80 backdrop-blur-sm py-2"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <motion.button onClick={onBack} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="w-9 h-9 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: FG }} />
          </motion.button>
          <p className="text-sm font-black" style={{ color: FG }}>{ticket.id.slice(0, 8)}</p>
          <motion.button onClick={onBack} className="w-9 h-9 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <X className="w-4 h-4" style={{ color: FG }} />
          </motion.button>
        </motion.div>

        {/* Ticket info */}
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}
          className="mb-4 p-4 rounded-lg" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <p className="text-sm font-semibold line-clamp-2" style={{ color: FG }}>{ticket.description}</p>
              <p className="text-xs mt-2" style={{ color: '#aaa' }}>{new Date(ticket.created_date).toLocaleString()}</p>
            </div>
            <motion.span whileHover={{ scale: 1.05 }} className="text-[10px] font-black px-2.5 py-1 flex-shrink-0 rounded-md"
              style={{ background: s.bg, color: s.color }}>
              {s.label}
            </motion.span>
          </div>
          {user?.role === 'admin' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
              <p className="text-xs font-black uppercase mb-2" style={{ color: '#aaa' }}>Change status</p>
              <div className="flex gap-2 flex-wrap">
                {Object.keys(STATUS_CONFIG).map(st => (
                  <motion.button key={st} onClick={() => handleStatusChange(st)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize"
                    style={{
                      background: ticketStatus === st ? FG : 'rgba(0,0,0,0.05)',
                      color: ticketStatus === st ? 'white' : '#666'
                    }}>
                    {st}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        <p className="text-xs text-center mb-4" style={{ color: '#999' }}>Support hours online, response in 48h</p>

        {/* Messages */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-3 mb-6">
          {messages.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: '#aaa' }}>No messages yet</p>
          ) : (
            messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                <motion.div whileHover={{ scale: 1.02 }} className="max-w-xs px-4 py-3 rounded-lg shadow-sm"
                  style={{
                    background: msg.author === 'user' ? FG : 'white',
                    color: msg.author === 'user' ? 'white' : FG,
                    border: msg.author === 'user' ? 'none' : '1px solid rgba(0,0,0,0.07)',
                    borderRadius: msg.author === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px'
                  }}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className="text-xs mt-2" style={{ opacity: 0.5 }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </motion.div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </motion.div>

        {/* Message input */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="max-w-2xl mx-auto flex gap-2">
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder="Tapez votre message…"
              className="flex-1 px-4 py-3 text-sm focus:outline-none"
              style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '24px', background: 'rgba(0,0,0,0.02)' }} />
            <motion.button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}
              whileHover={newMessage.trim() && !sending ? { scale: 1.05 } : {}}
              whileTap={newMessage.trim() && !sending ? { scale: 0.95 } : {}}
              className="w-10 h-10 flex items-center justify-center flex-shrink-0 text-sm font-black transition-all disabled:opacity-30"
              style={{ background: newMessage.trim() && !sending ? FG : 'rgba(0,0,0,0.05)', color: newMessage.trim() && !sending ? 'white' : '#999', borderRadius: '50%' }}>
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}