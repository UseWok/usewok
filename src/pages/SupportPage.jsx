import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, Book, Headphones, ChevronRight, X, Plus, RefreshCw, Clock, Check, Loader } from 'lucide-react';
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
    <div className="min-h-screen font-be bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-3" style={{ color: FG }}>Aide & Support</h1>
          <p className="text-base" style={{ color: '#666' }}>
            Obtenez l'aide dont vous avez besoin pour créer des applications extraordinaires avec BASE44
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            { icon: '📖', title: 'Documentation', desc: 'Explorez des guides complets, des tutoriels, des FAQ et les meilleures pratiques pour developer avec Base44.', color: '#FF7A3D' },
            { icon: '👥', title: 'Communauté Discord', desc: 'Connectez-vous avec d\'autres développeurs et obtenez une aide instantanée de notre communauté active.', color: '#1ABC9C' },
            { icon: '🎧', title: 'Ouvrir un ticket de support', desc: 'Soumettez un ticket de support détaillé et obtenez une assistance personnalisée.', color: '#2C3E50' }
          ].map((item, i) => (
            <motion.button key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              onClick={() => i === 2 && onNavigate()}
              className="p-6 rounded-lg text-left text-white transition-all hover:scale-105 relative overflow-hidden group"
              style={{ background: item.color, minHeight: '240px' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10" style={{ background: 'white' }} />
              <div className="relative z-10">
                <p className="text-3xl mb-3">{item.icon}</p>
                <h3 className="text-lg font-black mb-2">{item.title}</h3>
                <p className="text-sm opacity-90 mb-4">{item.desc}</p>
                <span className="text-xs font-bold flex items-center gap-1">
                  Commencer <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Quick actions */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-xl font-black mb-6" style={{ color: FG }}>Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button onClick={onNavigate}
              className="p-4 text-left rounded-lg transition-all hover:bg-opacity-80"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" style={{ color: FG }} />
                <div>
                  <p className="font-semibold" style={{ color: FG }}>My support tickets</p>
                  <p className="text-xs" style={{ color: '#aaa' }}>View and manage your tickets</p>
                </div>
              </div>
            </button>
            <a href="https://reddit.com/r/stensor" target="_blank" rel="noopener noreferrer"
              className="p-4 text-left rounded-lg transition-all hover:bg-opacity-80"
              style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}>
              <div className="flex items-center gap-3">
                <ChevronRight className="w-5 h-5" style={{ color: FG }} />
                <div>
                  <p className="font-semibold" style={{ color: FG }}>Community Forum</p>
                  <p className="text-xs" style={{ color: '#aaa' }}>Our new Reddit community</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
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
    <div className="min-h-screen font-be" style={{ background: '#fafafa' }}>
      <div className="max-w-2xl mx-auto px-4 py-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '8px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: FG }} />
          </button>
          <h1 className="text-lg font-black flex-1 text-center" style={{ color: FG }}>Support Ticket</h1>
          <div className="w-9 h-9" />
        </div>

        {/* Ticket info */}
        <div className="mb-4 p-4 rounded-lg" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold line-clamp-2" style={{ color: FG }}>{ticket.description}</p>
            <span className="text-[10px] font-black px-2 py-1 flex-shrink-0" style={{ background: s.bg, color: s.color, borderRadius: '6px' }}>
              {s.label}
            </span>
          </div>
          <p className="text-xs" style={{ color: '#aaa' }}>{new Date(ticket.created_date).toLocaleDateString()}</p>
        </div>

        {/* Messages */}
        <div className="space-y-3 mb-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-xs p-3 rounded-lg"
                style={{
                  background: msg.author === 'user' ? FG : 'white',
                  color: msg.author === 'user' ? 'white' : FG,
                  border: msg.author === 'user' ? 'none' : '1px solid rgba(0,0,0,0.07)',
                  borderRadius: msg.author === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px'
                }}>
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs mt-1" style={{ opacity: 0.6 }}>
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Status selector (admin only) */}
        {user?.role === 'admin' && (
          <div className="mb-4 p-4 rounded-lg" style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}>
            <p className="text-xs font-black uppercase mb-2" style={{ color: '#aaa' }}>Admin: Change Status</p>
            <div className="flex gap-2">
              {Object.keys(STATUS_CONFIG).map(st => (
                <button key={st} onClick={() => handleStatusChange(st)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize"
                  style={{
                    background: ticketStatus === st ? FG : 'rgba(0,0,0,0.05)',
                    color: ticketStatus === st ? 'white' : '#666'
                  }}>
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message input */}
        <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="max-w-2xl mx-auto flex gap-2">
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder="Type your message…"
              className="flex-1 px-4 py-3 text-sm focus:outline-none"
              style={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: '8px' }} />
            <button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}
              className="px-4 py-3 text-sm font-black transition-all disabled:opacity-30"
              style={{ background: FG, color: 'white', borderRadius: '8px' }}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}