import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, ChevronRight, X, Plus, RefreshCw, Loader, Upload, Send, Trash2, CheckCircle, FileText, Image as ImageIcon, Bug, DollarSign, HelpCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  closed:      { label: 'Resolved',    color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
};

const CATEGORY_CONFIG = {
  bug:   { label: 'Bug',   icon: Bug,         color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  money: { label: 'Money', icon: DollarSign,  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  other: { label: 'Other', icon: HelpCircle,  color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
};

function FileAttachment({ url, light = false }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
  const filename = url.split('/').pop().split('?')[0] || 'file';
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="block rounded-lg overflow-hidden mt-1"
        style={{ maxWidth: 160, border: '1px solid rgba(255,255,255,0.15)' }}>
        <img src={url} alt="attachment" className="w-full object-cover" style={{ maxHeight: 100 }} />
        <p className="text-[9px] px-1.5 py-0.5 truncate" style={{ background: 'rgba(0,0,0,0.35)', color: '#fff' }}>
          <ImageIcon className="inline w-2.5 h-2.5 mr-0.5" />{filename.slice(0, 20)}
        </p>
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg mt-1 text-xs font-medium hover:opacity-80 transition-opacity"
      style={{ background: light ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.07)', color: light ? 'white' : '#333', border: light ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)', maxWidth: 180 }}>
      <FileText className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate">{filename.slice(0, 24)}</span>
    </a>
  );
}

export default function SupportPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState('landing');
  const [activeTab, setActiveTab] = useState('my');
  const [user, setUser] = useState(null);
  const [myTickets, setMyTickets] = useState([]);
  const [adminTickets, setAdminTickets] = useState([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [chatTicket, setChatTicket] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  const loadMyTickets = (u) => {
    if (!u) return;
    setLoading(true);
    base44.entities.SupportTicket.filter({ user_email: u.email })
      .then(t => {
        // Filter out cancellation tickets from support view
        const support = t.filter(tk => tk.category !== 'cancellation');
        setMyTickets(support.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const loadAdminTickets = () => {
    base44.entities.SupportTicket.list('-created_date', 200)
      .then(t => {
        const support = t.filter(tk => tk.category !== 'cancellation' && tk.status !== 'closed');
        setAdminTickets(support.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (user) { loadMyTickets(user); if (user.role === 'admin') loadAdminTickets(); }
  }, [user]);

  // Listen for new ticket event
  useEffect(() => {
    const handler = (e) => { if (e.detail) setChatTicket(e.detail); };
    window.addEventListener('open-support-chat', handler);
    return () => window.removeEventListener('open-support-chat', handler);
  }, []);

  if (page === 'landing') return <LandingPage onNavigate={() => setPage('tickets')} />;

  if (chatTicket) {
    return (
      <ChatPanel
        ticket={chatTicket}
        user={user}
        onClose={() => { setChatTicket(null); loadMyTickets(user); if (isAdmin) loadAdminTickets(); }}
        onUpdate={() => { loadMyTickets(user); if (isAdmin) loadAdminTickets(); }}
      />
    );
  }

  const currentTickets = activeTab === 'admin' && isAdmin ? adminTickets : myTickets;
  const filteredTickets = ticketFilter === 'all'
    ? currentTickets
    : currentTickets.filter(t => ticketFilter === 'open' ? t.status !== 'closed' : t.status === 'closed');

  const refresh = () => { loadMyTickets(user); if (isAdmin) loadAdminTickets(); };

  return (
    <div className="min-h-screen font-be" style={{ background: '#fafafa' }}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setPage('landing')} className="w-9 h-9 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: FG }} />
          </button>
          <h1 className="text-lg font-black" style={{ color: FG }}>Support</h1>
          <div className="flex gap-2">
            <button onClick={refresh} className="w-9 h-9 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
              <RefreshCw className="w-4 h-4" style={{ color: FG }} />
            </button>
            {activeTab === 'my' && (
              <button onClick={() => setShowNewTicket(true)} className="px-3 h-9 flex items-center gap-1.5 text-xs font-black" style={{ background: FG, color: 'white', borderRadius: '8px' }}>
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2 mb-4">
            {[{ id: 'my', label: 'My Tickets' }, { id: 'admin', label: `Messages (${adminTickets.length})` }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1.5 text-xs font-black rounded-md transition-all"
                style={{ background: activeTab === tab.id ? FG : 'rgba(0,0,0,0.05)', color: activeTab === tab.id ? 'white' : '#666' }}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'my' && (
          <div className="flex gap-2 mb-4">
            {['all', 'open', 'closed'].map(f => (
              <button key={f} onClick={() => setTicketFilter(f)}
                className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all capitalize"
                style={{ background: ticketFilter === f ? FG : 'rgba(0,0,0,0.05)', color: ticketFilter === f ? 'white' : '#666' }}>
                {f}
              </button>
            ))}
          </div>
        )}

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
              const cat = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.other;
              const CatIcon = cat.icon;
              return (
                <motion.button key={ticket.id} whileHover={{ scale: 1.005 }}
                  onClick={() => setChatTicket(ticket)}
                  className="w-full p-4 text-left transition-all cursor-pointer"
                  style={{ background: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1" style={{ color: FG }}>
                        {ticket.title || ticket.user_name || ticket.user_email?.split('@')[0] || 'Ticket'}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-xs" style={{ color: '#aaa' }}>{new Date(ticket.created_date).toLocaleDateString()}</p>
                        {isAdmin && ticket.user_plan && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.06)', color: '#555' }}>
                            {ticket.user_plan}
                          </span>
                        )}
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ background: cat.bg, color: cat.color }}>
                          <CatIcon className="w-2.5 h-2.5" /> {cat.label}
                        </span>
                        {isAdmin && activeTab === 'admin' && (
                          <span className="text-[9px] text-zinc-400 truncate max-w-[120px]">{ticket.user_email}</span>
                        )}
                      </div>
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
          <NewTicketModal onClose={() => { setShowNewTicket(false); loadMyTickets(user); }} user={user} />
        )}
      </AnimatePresence>
    </div>
  );
}

function LandingPage({ onNavigate }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen font-be bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-12">
          <h1 className="text-5xl font-black mb-3" style={{ color: FG }}>Help & Support</h1>
          <p className="text-base" style={{ color: '#666' }}>Get the help you need</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="max-w-md mx-auto mb-10">
          <motion.button onClick={onNavigate} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full p-8 rounded-lg text-left text-white transition-all relative overflow-hidden group"
            style={{ background: '#2C3E50', minHeight: '220px' }}>
            <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-10" style={{ background: 'white' }} />
            <motion.div className="relative z-10">
              <motion.p className="text-5xl mb-4">🎧</motion.p>
              <h3 className="text-2xl font-black mb-3">Open a support ticket</h3>
              <p className="text-sm opacity-90 mb-6">Submit a detailed support ticket and get personalized assistance.</p>
              <motion.span className="text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                Get started <ChevronRight className="w-4 h-4" />
              </motion.span>
            </motion.div>
          </motion.button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="max-w-md mx-auto grid grid-cols-2 gap-4 mb-16">
          <motion.button onClick={onNavigate} whileHover={{ scale: 1.02 }}
            className="p-4 text-left rounded-lg transition-all"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)' }}>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" style={{ color: FG }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: FG }}>My tickets</p>
                <p className="text-xs" style={{ color: '#aaa' }}>View & manage</p>
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
                <p className="font-semibold text-sm" style={{ color: FG }}>Community</p>
                <p className="text-xs" style={{ color: '#aaa' }}>Reddit community</p>
              </div>
            </div>
          </motion.a>
        </motion.div>
      </div>
    </motion.div>
  );
}

function NewTicketModal({ onClose, user }) {
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setStep(1);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this support ticket. Reply with ONE word only: "bug" if technical/app issue, "money" if payment/billing/subscription, or "other". Ticket: ${description}`,
        model: 'gpt_5_mini',
      });
      const r = result.toLowerCase();
      const cat = r.includes('bug') ? 'bug' : (r.includes('money') || r.includes('payment') || r.includes('billing')) ? 'money' : 'other';
      setSuggestedCategory(cat);
      setSelectedCategory(cat);
    } catch {
      setSuggestedCategory('other');
      setSelectedCategory('other');
    }
    await new Promise(r => setTimeout(r, 600));
    setStep(2);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    // Upload files first
    let file_urls = [];
    for (const f of files) {
      try { const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); file_urls.push(file_url); } catch {}
    }

    // Build initial message with description + files
    const initialMsg = {
      author: 'user',
      text: description,
      file_urls,
      created_at: new Date().toISOString(),
    };

    let userPlan = '';
    try { userPlan = getUserPlan(user)?.name || ''; } catch {}

    // Create ticket with messages_json saved immediately
    const ticket = await base44.entities.SupportTicket.create({
      title: user?.full_name || user?.email?.split('@')[0] || 'User',
      description,
      category: selectedCategory || 'other',
      status: 'open',
      user_email: user?.email || '',
      user_name: user?.full_name || '',
      user_plan: userPlan,
      file_urls,
      messages_json: JSON.stringify([initialMsg]),
    });

    setSubmitting(false);
    onClose();
    setTimeout(() => window.dispatchEvent(new CustomEvent('open-support-chat', { detail: ticket })), 300);
  };

  const CATS = [
    { id: 'bug',   label: 'Bug',   icon: Bug,         color: '#ef4444' },
    { id: 'money', label: 'Money', icon: DollarSign,  color: '#f59e0b' },
    { id: 'other', label: 'Other', icon: HelpCircle,  color: '#6366f1' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget && step !== 1) onClose(); }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-white rounded-xl overflow-hidden shadow-xl"
        onClick={e => e.stopPropagation()}>

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
                  placeholder="Explain the problem in detail…"
                  rows={4} className="w-full px-4 py-3 text-sm focus:outline-none resize-none"
                  style={{ border: `1.5px solid ${description ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '8px', transition: 'border-color 0.2s' }} />
              </div>
              <div>
                <label className="text-xs font-black uppercase mb-2 block" style={{ color: '#aaa' }}>Attach files (optional)</label>
                <input ref={fileInputRef} type="file" multiple className="hidden"
                  onChange={e => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
                <motion.button onClick={() => fileInputRef.current?.click()} whileHover={{ scale: 1.01 }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm transition-all"
                  style={{ border: '1.5px dashed rgba(0,0,0,0.12)', borderRadius: '8px', color: '#999' }}>
                  <Upload className="w-4 h-4" /> Attach files
                </motion.button>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '6px' }}>
                        <FileText className="w-3 h-3" style={{ color: '#888' }} />
                        <span className="text-[11px] max-w-[80px] truncate" style={{ color: '#555' }}>{f.name}</span>
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}><X className="w-2.5 h-2.5" style={{ color: '#bbb' }} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <motion.button onClick={handleAnalyze} disabled={!description.trim()} whileHover={description.trim() ? { scale: 1.01 } : {}}
                className="w-full py-3.5 text-sm font-black transition-all disabled:opacity-30"
                style={{ background: FG, color: 'white', borderRadius: '8px' }}>
                Continue →
              </motion.button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9 }}
                className="w-10 h-10 rounded-full" style={{ border: '3px solid rgba(0,0,0,0.08)', borderTopColor: FG }} />
              <div className="text-center">
                <p className="font-black text-sm" style={{ color: FG }}>Analyzing…</p>
                <p className="text-xs mt-1" style={{ color: '#aaa' }}>Processing your request</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-black mb-3" style={{ color: FG }}>Select Category</p>
                <div className="grid grid-cols-3 gap-2">
                  {CATS.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    const isSuggested = suggestedCategory === cat.id;
                    return (
                      <motion.button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-all relative"
                        style={{ border: `2px solid ${isSelected ? cat.color : 'rgba(0,0,0,0.09)'}`, background: isSelected ? `${cat.color}12` : 'white' }}>
                        <Icon className="w-5 h-5" style={{ color: cat.color }} />
                        <span className="text-xs font-bold" style={{ color: isSelected ? cat.color : '#666' }}>{cat.label}</span>
                        {isSuggested && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap"
                            style={{ background: YUZU, color: FG }}>suggested</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              <motion.button onClick={handleSubmit} disabled={submitting || !selectedCategory}
                whileHover={!submitting ? { scale: 1.01 } : {}}
                className="w-full py-3 text-sm font-black transition-all disabled:opacity-60"
                style={{ background: FG, color: 'white', borderRadius: '8px' }}>
                {submitting ? 'Submitting…' : 'Submit Ticket →'}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ChatPanel({ ticket, user, onClose, onUpdate }) {
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const [messages, setMessages] = useState(() => { try { return JSON.parse(ticket.messages_json || '[]'); } catch { return []; } });
  const messagesRef = useRef(messages);
  const sendingRef = useRef(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const isAdmin = user?.role === 'admin';
  const isClosed = currentTicket.status === 'closed';
  const s = STATUS_CONFIG[currentTicket.status] || STATUS_CONFIG.open;
  const cat = CATEGORY_CONFIG[currentTicket.category] || CATEGORY_CONFIG.other;
  const CatIcon = cat.icon;

  useEffect(() => { messagesRef.current = messages; }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for updates — only update if server has MORE messages than local
  useEffect(() => {
    const id = currentTicket.id;
    const interval = setInterval(async () => {
      if (sendingRef.current) return;
      try {
        const all = await base44.entities.SupportTicket.list('-updated_date', 200);
        const updated = all.find(t => t.id === id);
        if (updated) {
          setCurrentTicket(prev => ({ ...prev, status: updated.status }));
          try {
            const serverMessages = JSON.parse(updated.messages_json || '[]');
            if (serverMessages.length > messagesRef.current.length) {
              setMessages(serverMessages);
            }
          } catch {}
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [currentTicket.id]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && files.length === 0) || isClosed || sending) return;
    sendingRef.current = true;
    setSending(true);
    let file_urls = [];
    for (const f of files) {
      try { const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); file_urls.push(file_url); } catch {}
    }
    const author = isAdmin ? 'admin' : 'user';
    const msg = { author, text: newMessage.trim(), file_urls, created_at: new Date().toISOString() };
    const updatedMessages = [...messagesRef.current, msg];
    setMessages(updatedMessages);
    setNewMessage('');
    setFiles([]);
    await base44.entities.SupportTicket.update(currentTicket.id, {
      messages_json: JSON.stringify(updatedMessages),
    });
    sendingRef.current = false;
    setSending(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'closed') {
      const closedMsg = { author: 'system', text: 'This ticket has been resolved. You can no longer send messages.', created_at: new Date().toISOString() };
      const updatedMessages = [...messagesRef.current, closedMsg];
      setMessages(updatedMessages);
      await base44.entities.SupportTicket.update(currentTicket.id, { status: 'closed', messages_json: JSON.stringify(updatedMessages) });
    } else {
      await base44.entities.SupportTicket.update(currentTicket.id, { status: newStatus });
    }
    setCurrentTicket(prev => ({ ...prev, status: newStatus }));
    onUpdate();
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this ticket?')) return;
    await base44.entities.SupportTicket.delete(currentTicket.id);
    onClose();
    onUpdate();
  };

  const handleUserResolve = async () => {
    if (!window.confirm("Mark this ticket as resolved? You won't be able to send more messages.")) return;
    await handleStatusChange('closed');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[400] flex"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="w-full max-w-md ml-auto h-full flex flex-col"
        style={{ background: 'white', boxShadow: '-4px 0 32px rgba(0,0,0,0.12)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', background: 'white' }}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <MessageSquare className="w-4 h-4" style={{ color: FG }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-black truncate" style={{ color: FG }}>
                  {isAdmin ? (currentTicket.user_name || currentTicket.user_email?.split('@')[0] || 'User') : 'Support Stensor'}
                </p>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 flex-shrink-0" style={{ background: cat.bg, color: cat.color }}>
                  <CatIcon className="w-2.5 h-2.5" />{cat.label}
                </span>
              </div>
              <p className="text-[10px] leading-none mt-0.5" style={{ color: '#aaa' }}>
                {isAdmin ? currentTicket.user_email : 'Reply within 24-48h'}
                {isAdmin && currentTicket.user_plan && (
                  <span className="ml-1.5 text-[9px] font-black px-1 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.06)', color: '#555' }}>
                    {currentTicket.user_plan}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-black px-2 py-1 rounded-md" style={{ background: s.bg, color: s.color }}>{s.label}</span>
            {!isAdmin && !isClosed && (
              <motion.button onClick={handleUserResolve} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                title="Mark as resolved"
                style={{ background: 'rgba(22,163,74,0.08)' }}>
                <CheckCircle className="w-4 h-4" style={{ color: '#16a34a' }} />
              </motion.button>
            )}
            {isAdmin && (
              <motion.button onClick={handleDelete} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                title="Delete ticket"
                style={{ background: 'rgba(239,68,68,0.07)' }}>
                <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
              </motion.button>
            )}
            <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <X className="w-4 h-4" style={{ color: FG }} />
            </motion.button>
          </div>
        </div>

        {isAdmin && (
          <div className="px-4 py-2 flex-shrink-0 flex gap-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', background: 'rgba(0,0,0,0.015)' }}>
            {Object.entries(STATUS_CONFIG).map(([st, cfg]) => (
              <motion.button key={st} onClick={() => handleStatusChange(st)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex-1 py-1.5 text-xs font-bold rounded-md capitalize transition-all"
                style={{ background: currentTicket.status === st ? FG : 'rgba(0,0,0,0.05)', color: currentTicket.status === st ? 'white' : '#666' }}>
                {cfg.label}
              </motion.button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#f9f9f9' }}>
          {messages.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: '#aaa' }}>No messages yet</p>
          ) : messages.map((msg, i) => {
          const isSystem = msg.author === 'system';
          // For regular users: their own messages (author='user') are on the right
          // For admins: their own messages (author='admin') are on the right
          const isMe = isAdmin ? msg.author === 'admin' : msg.author === 'user';

          if (isSystem) {
            return (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' }}>
                  <CheckCircle className="w-3.5 h-3.5" /> {msg.text}
                </div>
              </motion.div>
            );
          }

          // Avatar config
          const isStensor = msg.author === 'admin';
          const avatarLetter = isStensor
            ? 'S'
            : (currentTicket.user_name?.charAt(0)?.toUpperCase() || currentTicket.user_email?.charAt(0)?.toUpperCase() || 'U');
          const avatarBg = isStensor ? YUZU : '#6366f1';
          const avatarColor = isStensor ? FG : 'white';

          return (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>

              {/* Left avatar (other person) */}
              {!isMe && (
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-black shadow-sm"
                  style={{ background: avatarBg, color: avatarColor, border: '1.5px solid rgba(0,0,0,0.08)' }}>
                  {avatarLetter}
                </div>
              )}

              <div className="max-w-[72%]">
                <div className="px-4 py-3 shadow-sm"
                  style={{
                    background: isMe ? FG : 'white',
                    color: isMe ? 'white' : FG,
                    border: isMe ? 'none' : '1px solid rgba(0,0,0,0.07)',
                    borderRadius: isMe ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                  }}>
                  {msg.text && <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>}
                  {msg.file_urls?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.file_urls.map((url, j) => <FileAttachment key={j} url={url} light={isMe} />)}
                    </div>
                  )}
                  <p className="text-[10px] mt-1.5 select-none" style={{ opacity: 0.45 }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Right avatar (me) */}
              {isMe && (
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-black shadow-sm"
                  style={{
                    background: isAdmin ? YUZU : '#6366f1',
                    color: isAdmin ? FG : 'white',
                    border: '1.5px solid rgba(0,0,0,0.08)',
                  }}>
                  {isAdmin ? 'S' : (currentTicket.user_name?.charAt(0)?.toUpperCase() || currentTicket.user_email?.charAt(0)?.toUpperCase() || 'U')}
                </div>
              )}
            </motion.div>
          );
          })}
          <div ref={messagesEndRef} />
        </div>

        {isClosed ? (
          <div className="px-4 py-4 flex-shrink-0 text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.07)', background: 'white' }}>
            <p className="text-sm font-semibold" style={{ color: '#aaa' }}>
              <CheckCircle className="inline w-4 h-4 mr-1.5" style={{ color: '#16a34a' }} />
              This ticket is resolved
            </p>
          </div>
        ) : (
          <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,0.07)', background: 'white' }}>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <FileText className="w-3 h-3 flex-shrink-0" style={{ color: '#888' }} />
                    <span className="text-[11px] max-w-[80px] truncate font-medium" style={{ color: '#555' }}>{f.name}</span>
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
              <motion.button onClick={() => fileInputRef.current?.click()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-colors"
                style={{ background: 'rgba(0,0,0,0.05)' }}>
                <Upload className="w-4 h-4" style={{ color: FG }} />
              </motion.button>
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Type your message…"
                className="flex-1 px-4 py-2.5 text-sm focus:outline-none rounded-full"
                style={{ border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.02)' }} />
              <motion.button onClick={handleSendMessage}
                disabled={(!newMessage.trim() && files.length === 0) || sending}
                whileHover={newMessage.trim() && !sending ? { scale: 1.05 } : {}}
                whileTap={newMessage.trim() && !sending ? { scale: 0.95 } : {}}
                className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-all disabled:opacity-30"
                style={{ background: (newMessage.trim() || files.length > 0) && !sending ? FG : 'rgba(0,0,0,0.05)', color: (newMessage.trim() || files.length > 0) && !sending ? 'white' : '#999' }}>
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}