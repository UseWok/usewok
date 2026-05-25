import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, MessageSquare, X, Plus, Upload, Send, Trash2, CheckCircle, FileText, Image as ImageIcon, Bug, DollarSign, HelpCircle, ChevronRight } from 'lucide-react';
import { getUserPlan } from '@/lib/plans-config';

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  in_progress: { label: 'In progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
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
        style={{ maxWidth: 160, border: '1px solid #E5E5E5' }}>
        <img src={url} alt="attachment" className="w-full object-cover" style={{ maxHeight: 100 }} />
        <p className="text-[9px] px-1.5 py-0.5 truncate" style={{ background: light ? 'rgba(0,0,0,0.1)' : '#F7F7F8', color: '#666' }}>
          <ImageIcon className="inline w-2.5 h-2.5 mr-0.5" />{filename.slice(0, 20)}
        </p>
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg mt-1 text-xs font-medium hover:bg-[#F7F7F8] transition-colors"
      style={{ color: '#666', border: '1px solid #E5E5E5', maxWidth: 180 }}>
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
    <div className="min-h-screen font-sans" style={{ background: '#FFFFFF' }}>
      <div className="max-w-3xl mx-auto px-6 py-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setPage('landing')} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F7F7F8] transition-colors">
            <ArrowLeft className="w-4 h-4 text-[#666666]" />
          </button>
          <h1 className="text-xl font-medium text-[#1A1A1A]">Support</h1>
          <div className="flex gap-2">
            <button onClick={refresh} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F7F7F8] transition-colors">
              <MessageSquare className="w-4 h-4 text-[#666666]" />
            </button>
            {activeTab === 'my' && (
              <button onClick={() => setShowNewTicket(true)} className="px-4 h-9 flex items-center gap-2 text-xs font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F8] transition-colors">
                <Plus className="w-3.5 h-3.5" /> New ticket
              </button>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2 mb-4">
            {[{ id: 'my', label: 'My tickets' }, { id: 'admin', label: `All (${adminTickets.length})` }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'bg-[#1A1A1A] text-white' : 'bg-[#F7F7F8] text-[#666666] hover:bg-[#F0F0F0]'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'my' && (
          <div className="flex gap-2 mb-4">
            {['all', 'open', 'closed'].map(f => (
              <button key={f} onClick={() => setTicketFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${ticketFilter === f ? 'bg-[#1A1A1A] text-white' : 'bg-[#F7F7F8] text-[#666666] hover:bg-[#F0F0F0]'}`}>
                {f}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#E5E5E5] border-t-[#1A1A1A] rounded-full animate-spin" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 border border-[#E5E5E5] rounded-lg bg-white">
            <MessageSquare className="w-8 h-8 text-[#CCCCCC]" />
            <p className="text-sm font-medium text-[#666666]">No tickets</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTickets.map(ticket => {
              const s = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
              const cat = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.other;
              const CatIcon = cat.icon;
              return (
                <button key={ticket.id}
                  onClick={() => setChatTicket(ticket)}
                  className="w-full p-4 text-left transition-colors hover:bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-[#1A1A1A]">
                        {ticket.title || ticket.user_name || ticket.user_email?.split('@')[0] || 'Ticket'}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-xs text-[#999999]">{new Date(ticket.created_date).toLocaleDateString()}</p>
                        {isAdmin && ticket.user_plan && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#F7F7F8] text-[#666666]">
                            {ticket.user_plan}
                          </span>
                        )}
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ background: cat.bg, color: cat.color }}>
                          <CatIcon className="w-2.5 h-2.5" /> {cat.label}
                        </span>
                        {isAdmin && activeTab === 'admin' && (
                          <span className="text-[9px] text-[#999999] truncate max-w-[120px]">{ticket.user_email}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-1 rounded" style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {showNewTicket && (
        <NewTicketModal onClose={() => { setShowNewTicket(false); loadMyTickets(user); }} user={user} />
      )}
    </div>
  );
}

function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen font-sans bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-medium mb-3 text-[#1A1A1A]">Help & Support</h1>
          <p className="text-base text-[#666666]">Get the help you need</p>
        </div>
        <div className="max-w-md mx-auto mb-10">
          <button onClick={onNavigate}
            className="w-full p-8 rounded-lg text-left text-white transition-opacity hover:opacity-90 relative overflow-hidden"
            style={{ background: '#2C3E50', minHeight: '220px' }}>
            <div className="relative z-10">
              <p className="text-5xl mb-4">🎧</p>
              <h3 className="text-2xl font-medium mb-3">Open a support ticket</h3>
              <p className="text-sm opacity-90 mb-6">Submit a detailed support ticket and get personalized assistance.</p>
              <span className="text-xs font-medium flex items-center gap-1">
                Get started <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </button>
        </div>
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4 mb-16">
          <button onClick={onNavigate}
            className="p-4 text-left rounded-lg transition-colors hover:bg-[#F7F7F8] border border-[#E5E5E5] bg-white">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#1A1A1A]" />
              <div>
                <p className="font-medium text-sm text-[#1A1A1A]">My tickets</p>
                <p className="text-xs text-[#999999]">View & manage</p>
              </div>
            </div>
          </button>
          <a href="https://reddit.com/r/stensor" target="_blank" rel="noopener noreferrer"
            className="p-4 text-left rounded-lg transition-colors hover:bg-[#F7F7F8] border border-[#E5E5E5] bg-white">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#1A1A1A]" />
              <div>
                <p className="font-medium text-sm text-[#1A1A1A]">Community</p>
                <p className="text-xs text-[#999999]">Reddit community</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

function NewTicketModal({ onClose, user }) {
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setStep(1);
    await new Promise(r => setTimeout(r, 800));
    setSelectedCategory('other');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    let file_urls = [];
    for (const f of files) {
      try { const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); file_urls.push(file_url); } catch {}
    }

    const initialMsg = {
      author: 'user',
      text: description,
      file_urls,
      created_at: new Date().toISOString(),
    };

    let userPlan = '';
    try { userPlan = getUserPlan(user)?.name || ''; } catch {}

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
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50"
      onClick={e => { if (e.target === e.currentTarget && step !== 1) onClose(); }}>
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E5E5]">
          <p className="font-medium text-[#1A1A1A]">New support ticket</p>
          {step !== 1 && (
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F7F7F8] transition-colors">
              <X className="w-4 h-4 text-[#999999]" />
            </button>
          )}
        </div>

        <div className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-2 block text-[#666666]">Describe your issue</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Explain the problem in detail…"
                  rows={4} className="w-full px-4 py-3 text-sm focus:outline-none resize-none border border-[#E5E5E5] rounded-lg focus:ring-2 focus:ring-[#1A1A1A]/20 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium mb-2 block text-[#666666]">Attach files (optional)</label>
                <input ref={fileInputRef} type="file" multiple className="hidden"
                  onChange={e => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm transition-colors border border-dashed border-[#E5E5E5] rounded-lg text-[#999999] hover:bg-[#F7F7F8]">
                  <Upload className="w-4 h-4" /> Attach files
                </button>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F7F7F8] rounded-lg">
                        <FileText className="w-3 h-3 text-[#999999]" />
                        <span className="text-[11px] max-w-[80px] truncate text-[#666666]">{f.name}</span>
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}><X className="w-2.5 h-2.5 text-[#CCCCCC]" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleAnalyze} disabled={!description.trim()}
                className="w-full py-3 text-sm font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                Continue
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 rounded-full border-3 border-[#E5E5E5] border-t-[#1A1A1A] animate-spin" />
              <div className="text-center">
                <p className="font-medium text-sm text-[#1A1A1A]">Processing…</p>
                <p className="text-xs mt-1 text-[#999999]">Please wait</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-3 text-[#1A1A1A]">Select category</p>
                <div className="grid grid-cols-3 gap-2">
                  {CATS.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                        className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-colors relative border"
                        style={{ borderColor: isSelected ? cat.color : '#E5E5E5', background: isSelected ? `${cat.color}12` : 'white' }}>
                        <Icon className="w-5 h-5" style={{ color: cat.color }} />
                        <span className="text-xs font-medium" style={{ color: isSelected ? cat.color : '#666666' }}>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleSubmit} disabled={submitting || !selectedCategory}
                className="w-full py-3 text-sm font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit ticket'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
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
    <div className="fixed inset-0 z-[400] flex"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md ml-auto h-full flex flex-col bg-white shadow-lg"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#F7F7F8]">
              <MessageSquare className="w-4 h-4 text-[#1A1A1A]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium truncate text-[#1A1A1A]">
                  {isAdmin ? (currentTicket.user_name || currentTicket.user_email?.split('@')[0] || 'User') : 'Support'}
                </p>
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5 flex-shrink-0" style={{ background: cat.bg, color: cat.color }}>
                  <CatIcon className="w-2.5 h-2.5" />{cat.label}
                </span>
              </div>
              <p className="text-[10px] leading-none mt-0.5 text-[#999999]">
                {isAdmin ? currentTicket.user_email : 'Reply within 24-48h'}
                {isAdmin && currentTicket.user_plan && (
                  <span className="ml-1.5 text-[9px] font-medium px-1 py-0.5 rounded bg-[#F7F7F8] text-[#666666]">
                    {currentTicket.user_plan}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-medium px-2 py-1 rounded" style={{ background: s.bg, color: s.color }}>{s.label}</span>
            {!isAdmin && !isClosed && (
              <button onClick={handleUserResolve}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-green-50"
                title="Mark as resolved">
                <CheckCircle className="w-4 h-4 text-[#16a34a]" />
              </button>
            )}
            {isAdmin && (
              <button onClick={handleDelete}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-red-50"
                title="Delete ticket">
                <Trash2 className="w-4 h-4 text-[#ef4444]" />
              </button>
            )}
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[#F7F7F8]">
              <X className="w-4 h-4 text-[#1A1A1A]" />
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="px-4 py-2 flex-shrink-0 flex gap-2 border-b border-[#E5E5E5] bg-[#FAFAFA]">
            {Object.entries(STATUS_CONFIG).map(([st, cfg]) => (
              <button key={st} onClick={() => handleStatusChange(st)}
                className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${currentTicket.status === st ? 'bg-[#1A1A1A] text-white' : 'bg-[#F7F7F8] text-[#666666] hover:bg-[#F0F0F0]'}`}>
                {cfg.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FAFAFA]">
          {messages.length === 0 ? (
            <p className="text-center text-sm py-8 text-[#999999]">No messages yet</p>
          ) : messages.map((msg, i) => {
            const isSystem = msg.author === 'system';
            const isMe = isAdmin ? msg.author === 'admin' : msg.author === 'user';

            if (isSystem) {
              return (
                <div className="flex justify-center">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-[#16a34a] border border-green-200">
                    <CheckCircle className="w-3.5 h-3.5" /> {msg.text}
                  </div>
                </div>
              );
            }

            const isStensor = msg.author === 'admin';
            const avatarLetter = isStensor ? 'S' : (currentTicket.user_name?.charAt(0)?.toUpperCase() || currentTicket.user_email?.charAt(0)?.toUpperCase() || 'U');
            const avatarBg = isStensor ? '#DDFF00' : '#6366f1';
            const avatarColor = isStensor ? '#1A1A1A' : 'white';

            return (
              <div key={i} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-medium shadow-sm"
                    style={{ background: avatarBg, color: avatarColor, border: '1.5px solid #E5E5E5' }}>
                    {avatarLetter}
                  </div>
                )}

                <div className="max-w-[72%]">
                  <div className="px-4 py-3 shadow-sm"
                    style={{
                      background: isMe ? '#1A1A1A' : 'white',
                      color: isMe ? 'white' : '#1A1A1A',
                      border: isMe ? 'none' : '1px solid #E5E5E5',
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

                {isMe && (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-medium shadow-sm"
                    style={{
                      background: isAdmin ? '#DDFF00' : '#6366f1',
                      color: isAdmin ? '#1A1A1A' : 'white',
                      border: '1.5px solid #E5E5E5',
                    }}>
                    {isAdmin ? 'S' : (currentTicket.user_name?.charAt(0)?.toUpperCase() || currentTicket.user_email?.charAt(0)?.toUpperCase() || 'U')}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {isClosed ? (
          <div className="px-4 py-4 flex-shrink-0 text-center border-t border-[#E5E5E5] bg-white">
            <p className="text-sm font-medium text-[#999999]">
              <CheckCircle className="inline w-4 h-4 mr-1.5 text-[#16a34a]" />
              This ticket is resolved
            </p>
          </div>
        ) : (
          <div className="px-4 py-3 flex-shrink-0 border-t border-[#E5E5E5] bg-white">
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F7F8] border border-[#E5E5E5]">
                    <FileText className="w-3 h-3 flex-shrink-0 text-[#999999]" />
                    <span className="text-[11px] max-w-[80px] truncate font-medium text-[#666666]">{f.name}</span>
                    <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}>
                      <X className="w-2.5 h-2.5 text-[#CCCCCC]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" multiple className="hidden"
                onChange={e => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
              <button onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-colors hover:bg-[#F7F7F8]">
                <Upload className="w-4 h-4 text-[#1A1A1A]" />
              </button>
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Type your message…"
                className="flex-1 px-4 py-2.5 text-sm focus:outline-none rounded-lg bg-[#F7F7F8] border border-[#E5E5E5] focus:border-[#1A1A1A] transition-colors" />
              <button onClick={handleSendMessage}
                disabled={(!newMessage.trim() && files.length === 0) || sending}
                className={`w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-colors disabled:opacity-30 ${newMessage.trim() || files.length > 0 ? 'bg-[#1A1A1A] text-white' : 'bg-[#F7F7F8] text-[#999999]'}`}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}