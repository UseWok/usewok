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
  const [page, setPage] = useState('landing');
  const [user, setUser] = useState(null);
  const [myTickets, setMyTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatTicket, setChatTicket] = useState(null);

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

  // Poll for new messages on open tickets
  useEffect(() => {
    if (!user || !showChatPanel || !chatTicket) return;
    const interval = setInterval(() => {
      base44.entities.SupportTicket.filter({ id: chatTicket.id }).then(t => {
        if (t.length > 0) {
          const updated = t[0];
          if (updated.messages_json !== chatTicket.messages_json) {
            setChatTicket(updated);
          }
          if (updated.status === 'closed' && chatTicket.status !== 'closed') {
            setShowChatPanel(false);
            setChatTicket(null);
            loadTickets(user);
          }
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [user, showChatPanel, chatTicket]);

  if (page === 'landing') {
    return <LandingPage onNavigate={() => setPage('tickets')} />;
  }

  if (showChatPanel && chatTicket) {
    return (
      <ChatPanel
        ticket={chatTicket}
        user={user}
        onClose={() => { setShowChatPanel(false); setChatTicket(null); loadTickets(user); }}
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
              const isClosed = ticket.status === 'closed';
              return (
                <motion.button key={ticket.id} whileHover={{ scale: 1.01 }}
                  onClick={() => { if (!isClosed) { setChatTicket(ticket); setShowChatPanel(true); } }}
                  className={`w-full p-4 text-left transition-all ${isClosed ? 'opacity-50 cursor-default' : 'hover:bg-opacity-50 cursor-pointer'}`}
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
                </motion.button>
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

function ChatPanel({ ticket, user, onClose, onUpdate }) {
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(ticket.messages_json || '[]'); } catch { return []; }
  });
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [ticketStatus, setTicketStatus] = useState(ticket.status);
  const [files, setFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      base44.entities.SupportTicket.filter({ id: ticket.id }).then(t => {
        if (t.length > 0) {
          const updated = t[0];
          if (updated.messages_json !== ticket.messages_json) {
            setMessages(JSON.parse(updated.messages_json || '[]'));
            setTicketStatus(updated.status);
            if (updated.status === 'closed') {
              onClose();
            }
          }
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [ticket, onClose]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() && files.length === 0) return;
    setSending(true);

    let file_urls = [];
    for (const f of files) {
      try { const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); file_urls.push(file_url); } catch {}
    }

    const msg = { author: 'user', text: newMessage, file_urls, created_at: new Date().toISOString() };
    const updatedMessages = [...messages, msg];
    setMessages(updatedMessages);
    setNewMessage('');
    setFiles([]);

    await base44.entities.SupportTicket.update(ticket.id, {
      messages_json: JSON.stringify(updatedMessages),
      file_urls: [...(ticket.file_urls || []), ...file_urls],
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[400] flex" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md ml-auto h-full flex flex-col"
        style={{ background: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <MessageSquare className="w-4 h-4" style={{ color: FG }} />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: FG }}>Support</p>
              <p className="text-[10px]" style={{ color: '#aaa' }}>{ticket.id.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.span className="text-[10px] font-black px-2 py-1 rounded-md" style={{ background: s.bg, color: s.color }}>
              {s.label}
            </motion.span>
            <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <X className="w-4 h-4" style={{ color: FG }} />
            </motion.button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: '#aaa' }}>No messages yet</p>
          ) : (
            messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                <motion.div whileHover={{ scale: 1.02 }} className="max-w-[80%] px-4 py-3 rounded-2xl shadow-sm"
                  style={{
                    background: msg.author === 'user' ? FG : 'white',
                    color: msg.author === 'user' ? 'white' : FG,
                    border: msg.author === 'user' ? 'none' : '1px solid rgba(0,0,0,0.07)',
                    borderRadius: msg.author === 'user' ? '20px 4px 20px 20px' : '4px 20px 20px 20px'
                  }}>
                  {msg.file_urls && msg.file_urls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.file_urls.map((url, j) => (
                        <a key={j} href={url} target="_blank" rel="noopener noreferrer"
                          className="text-xs underline" style={{ color: msg.author === 'user' ? 'white' : '#2563eb' }}>
                          📎 File {j + 1}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className="text-xs mt-1.5" style={{ opacity: 0.5 }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </motion.div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Admin status controls */}
        {user?.role === 'admin' && (
          <div className="px-4 py-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,0.07)', background: 'rgba(0,0,0,0.02)' }}>
            <p className="text-[10px] font-black uppercase mb-2" style={{ color: '#aaa' }}>Change status</p>
            <div className="flex gap-2">
              {Object.keys(STATUS_CONFIG).map(st => (
                <motion.button key={st} onClick={() => handleStatusChange(st)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-md capitalize"
                  style={{
                    background: ticketStatus === st ? FG : 'rgba(0,0,0,0.05)',
                    color: ticketStatus === st ? 'white' : '#666'
                  }}>
                  {st}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Message input */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,0.07)', background: 'white' }}>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1" style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '6px' }}>
                  <span className="text-[10px] max-w-[60px] truncate" style={{ color: '#555' }}>{f.name}</span>
                  <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}>
                    <X className="w-2.5 h-2.5" style={{ color: '#bbb' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" multiple className="hidden"
              onChange={e => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
            <motion.button onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(0,0,0,0.05)' }}>
              <Upload className="w-4 h-4" style={{ color: FG }} />
            </motion.button>
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder="Tapez votre message…"
              className="flex-1 px-4 py-2.5 text-sm focus:outline-none rounded-full"
              style={{ border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.02)' }} />
            <motion.button onClick={handleSendMessage} disabled={(!newMessage.trim() && files.length === 0) || sending}
              whileHover={newMessage.trim() && !sending ? { scale: 1.05 } : {}}
              whileTap={newMessage.trim() && !sending ? { scale: 0.95 } : {}}
              className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 text-sm font-black transition-all disabled:opacity-30"
              style={{ background: newMessage.trim() && !sending ? FG : 'rgba(0,0,0,0.05)', color: newMessage.trim() && !sending ? 'white' : '#999' }}>
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}