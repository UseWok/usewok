import { useState, useEffect, useRef } from 'react';
import { MessageSquare, ChevronRight, X, Plus, RefreshCw, Loader2, Upload, Send, Trash2, CheckCircle, FileText, Image as ImageIcon, Bug, DollarSign, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  closed:      { label: 'Resolved',    color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
};

const CATEGORY_CONFIG = {
  bug:   { label: 'Bug',   icon: Bug,        color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  money: { label: 'Billing', icon: DollarSign,  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  other: { label: 'Other', icon: HelpCircle,  color: '#0062FF', bg: 'rgba(0,98,255,0.1)' },
};

function FileAttachment({ url, light = false }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
  const filename = url.split('/').pop().split('?')[0] || 'file';
  
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden mt-2 border border-slate-200/20 shadow-sm transition-none" style={{ maxWidth: 180 }}>
        <img src={url} alt="attachment" className="w-full object-cover" style={{ maxHeight: 110 }} />
        <div className="bg-slate-900/80 px-2 py-1.5 flex items-center gap-1.5 backdrop-blur-sm">
          <ImageIcon className="w-3 h-3 text-white" />
          <span className="text-[10px] text-white truncate font-medium">{filename.slice(0, 20)}</span>
        </div>
      </a>
    );
  }
  
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg mt-2 text-[12px] font-semibold transition-none shadow-sm ${light ? 'bg-white/10 text-white border border-white/10' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`} style={{ maxWidth: 200 }}>
      <FileText className={`w-4 h-4 flex-shrink-0 ${light ? 'text-white' : 'text-slate-400'}`} />
      <span className="truncate">{filename.slice(0, 24)}</span>
    </a>
  );
}

export default function SupportPage({ open, onClose }) {
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
    if (open) {
      base44.auth.me().then(u => {
        setUser(u); loadMyTickets(u);
        if (u.role === 'admin') loadAdminTickets();
      }).catch(() => {});
    }
  }, [open]);

  const loadMyTickets = (u) => {
    if (!u) return;
    setLoading(true);
    base44.entities.SupportTicket.filter({ user_email: u.email }).then(t => {
      const support = t.filter(tk => tk.category !== 'cancellation');
      setMyTickets(support.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const loadAdminTickets = () => {
    base44.entities.SupportTicket.list('-created_date', 200).then(t => {
      const support = t.filter(tk => tk.category !== 'cancellation' && tk.status !== 'closed');
      setAdminTickets(support.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    }).catch(() => {});
  };

  if (!open) return null;

  const currentTickets = activeTab === 'admin' && isAdmin ? adminTickets : myTickets;
  const filteredTickets = ticketFilter === 'all' ? currentTickets : currentTickets.filter(t => ticketFilter === 'open' ? t.status !== 'closed' : t.status === 'closed');
  const refresh = () => { loadMyTickets(user); if (isAdmin) loadAdminTickets(); };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4 md:p-6 transition-none antialiased">
      <div className="w-[95vw] h-[95vh] bg-[#FAFAFA] rounded-[24px] overflow-hidden flex flex-col shadow-2xl relative transition-none">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full transition-none shadow-sm">
          <X className="w-5 h-5" />
        </button>

        {chatTicket ? (
          <ChatPanel ticket={chatTicket} user={user} onClose={() => { setChatTicket(null); refresh(); }} onUpdate={refresh} />
        ) : page === 'landing' ? (
          <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 transition-none">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight mb-4">How can we help?</h1>
              <p className="text-[15px] sm:text-[16px] text-slate-500 font-medium">Select an option below to get assistance with your account or architecture.</p>
            </div>

            <div className="w-full max-w-2xl space-y-4">
              <button onClick={() => setPage('tickets')} className="w-full bg-[#0062FF] hover:bg-[#0052CC] p-8 sm:p-10 rounded-3xl text-left transition-none shadow-lg relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-6">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Open a Support Ticket</h3>
                  <p className="text-[14px] text-white/80 font-medium mb-8 max-w-sm">Submit a detailed request securely.</p>
                  <span className="inline-flex items-center gap-2 text-[13px] font-bold text-[#0062FF] bg-white px-4 py-2 rounded-xl transition-none shadow-sm">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setPage('tickets')} className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-[#0062FF] transition-none text-left">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-6 text-[#0062FF] transition-none">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-[16px] font-bold text-black mb-1">My Tickets</p>
                  <p className="text-[13px] text-slate-500">View and manage active requests.</p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden transition-none">
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <button onClick={() => setPage('landing')} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-none shadow-sm">
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <h1 className="text-3xl font-black text-black tracking-tight">Support Tickets</h1>
                </div>
                <div className="flex items-center gap-3 pr-10">
                  <button onClick={refresh} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-none shadow-sm" title="Refresh">
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={() => setShowNewTicket(true)} className="px-5 h-10 flex items-center gap-2 text-[13px] font-bold bg-[#0062FF] text-white rounded-xl hover:bg-[#0052CC] shadow-sm transition-none">
                    <Plus className="w-4 h-4" /> Open Ticket
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#0062FF]" /></div>
              ) : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-300 rounded-3xl">
                  <MessageSquare className="w-8 h-8 text-slate-400 mb-4" />
                  <p className="text-[14px] font-bold text-slate-600">No tickets found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTickets.map(ticket => (
                    <button key={ticket.id} onClick={() => setChatTicket(ticket)} className="w-full p-5 text-left bg-white border border-slate-200 rounded-2xl hover:border-[#0062FF] transition-none">
                      <p className="text-[15px] font-bold text-black truncate">{ticket.title || 'Support Ticket'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* NEW TICKET OVERLAY */}
      {showNewTicket && (
        <NewTicketModal onClose={() => { setShowNewTicket(false); refresh(); }} user={user} />
      )}
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
    await new Promise(r => setTimeout(r, 1200));
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
    const initialMsg = { author: 'user', text: description, file_urls, created_at: new Date().toISOString() };
    let userPlan = '';
    try { userPlan = getUserPlan(user)?.name || ''; } catch {}

    const ticket = await base44.entities.SupportTicket.create({
      title: user?.full_name || user?.email?.split('@')[0] || 'User Request',
      description, category: selectedCategory || 'other', status: 'open',
      user_email: user?.email || '', user_name: user?.full_name || '', user_plan: userPlan,
      file_urls, messages_json: JSON.stringify([initialMsg]),
    });
    setSubmitting(false);
    onClose();
    setTimeout(() => window.dispatchEvent(new CustomEvent('open-support-chat', { detail: ticket })), 300);
  };

  const CATS = [
    { id: 'bug',   label: 'Bug Report', icon: Bug,        color: '#ef4444' },
    { id: 'money', label: 'Billing',    icon: DollarSign, color: '#f59e0b' },
    { id: 'other', label: 'General',    icon: HelpCircle, color: '#0062FF' },
  ];

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 transition-none">
       <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 relative transition-none">
          <button onClick={onClose} className="absolute top-5 right-6 z-50 p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-full transition-none">
            <X className="w-4 h-4" />
          </button>
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <p className="text-[15px] font-bold text-slate-900">Secure Support Channel</p>
          </div>
          <div className="p-6">
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <label className="text-[12px] font-bold block mb-2 text-slate-700">Detailed Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Please describe your issue, feedback, or request..." rows={5} className="w-full px-4 py-3 text-[13px] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] resize-none transition-none shadow-sm" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[12px] font-bold text-slate-700">Attachments</label>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Optional</span>
                  </div>
                  <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 text-[13px] font-semibold bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 transition-none">
                    <Upload className="w-4 h-4" /> Select Files
                  </button>
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-[11px] font-medium text-slate-700 max-w-[100px] truncate">{f.name}</span>
                          <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="ml-1"><X className="w-3 h-3 text-slate-400 hover:text-red-500" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleAnalyze} disabled={!description.trim()} className="w-full py-3.5 text-[13px] font-bold bg-[#0062FF] text-white rounded-xl transition-none disabled:opacity-40 hover:bg-[#0052CC] shadow-sm flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {step === 1 && (
              <div className="flex flex-col items-center justify-center py-16 gap-5">
                <Loader2 className="w-8 h-8 text-[#0062FF] animate-spin" />
                <div className="text-center">
                  <p className="font-bold text-[15px] text-slate-900">Encrypting Request...</p>
                  <p className="text-[13px] mt-1 text-slate-500">Preparing secure channel</p>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <p className="text-[13px] font-bold mb-3 text-slate-900 text-center">Classify your request to route to the correct team</p>
                  <div className="grid grid-cols-3 gap-3">
                    {CATS.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex flex-col items-center gap-2 py-4 px-2 rounded-xl transition-none border ${isSelected ? 'border-[#0062FF] bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                          <Icon className="w-5 h-5" style={{ color: isSelected ? cat.color : '#94a3b8' }} />
                          <span className={`text-[12px] font-bold ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={handleSubmit} disabled={submitting || !selectedCategory} className="w-full py-3.5 text-[13px] font-bold bg-[#0062FF] text-white rounded-xl transition-none disabled:opacity-40 hover:bg-[#0052CC] shadow-sm flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Submitting...' : 'Send to Wok Support'}
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
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
    await base44.entities.SupportTicket.update(currentTicket.id, { messages_json: JSON.stringify(updatedMessages) });
    sendingRef.current = false;
    setSending(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'closed') {
      const closedMsg = { author: 'system', text: 'This support channel has been officially closed.', created_at: new Date().toISOString() };
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
    if (!window.confirm('Are you sure you want to permanently delete this record?')) return;
    await base44.entities.SupportTicket.delete(currentTicket.id);
    onClose();
    onUpdate();
  };

  const handleUserResolve = async () => {
    if (!window.confirm("Mark this issue as completely resolved? You will not be able to reopen this specific thread.")) return;
    await handleStatusChange('closed');
  };

  return (
    <div className="fixed inset-0 z-[600] flex bg-black/60 transition-none" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-lg ml-auto h-full flex flex-col bg-white shadow-2xl border-l border-slate-200 transition-none" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-[#0062FF]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-bold text-slate-900 truncate">
                  {isAdmin ? (currentTicket.user_name || currentTicket.user_email?.split('@')[0] || 'User') : 'Wok Support'}
                </p>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 flex-shrink-0" style={{ background: cat.bg, color: cat.color }}>
                  <CatIcon className="w-3 h-3" />{cat.label}
                </span>
              </div>
              <p className="text-[12px] font-medium text-slate-500 mt-0.5">{isAdmin ? currentTicket.user_email : 'Active secure session'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: s.bg, color: s.color }}>{s.label}</span>
            {!isAdmin && !isClosed && (
              <button onClick={handleUserResolve} className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 hover:bg-emerald-100 transition-none" title="Mark as resolved">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </button>
            )}
            {isAdmin && (
              <button onClick={handleDelete} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 transition-none" title="Delete ticket">
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-none ml-1">
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="px-6 py-3 flex-shrink-0 flex gap-2 border-b border-slate-100 bg-slate-50">
            {Object.entries(STATUS_CONFIG).map(([st, cfg]) => (
              <button key={st} onClick={() => handleStatusChange(st)} className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg uppercase tracking-wider transition-none border ${currentTicket.status === st ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                {cfg.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[#FAFAFA]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <MessageSquare className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-[14px] font-bold text-slate-500">Secure connection established</p>
            </div>
          ) : messages.map((msg, i) => {
            const isSystem = msg.author === 'system';
            const isMe = isAdmin ? msg.author === 'admin' : msg.author === 'user';

            if (isSystem) {
              return (
                <div key={i} className="flex justify-center my-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                    <CheckCircle className="w-4 h-4" /> {msg.text}
                  </div>
                </div>
              );
            }

            const isAdminMsg = msg.author === 'admin';
            const avatarLetter = isAdminMsg ? 'W' : (currentTicket.user_name?.charAt(0)?.toUpperCase() || currentTicket.user_email?.charAt(0)?.toUpperCase() || 'U');
            
            return (
              <div key={i} className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-black shadow-sm ${isAdminMsg ? 'bg-[#0062FF] text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {avatarLetter}
                  </div>
                )}
                <div className={`max-w-[75%] px-5 py-3.5 shadow-sm ${isMe ? 'bg-[#0062FF] text-white rounded-[20px_20px_4px_20px]' : 'bg-white border border-slate-200 text-slate-800 rounded-[20px_20px_20px_4px]'}`}>
                  {msg.text && <p className="text-[14px] leading-relaxed whitespace-pre-line">{msg.text}</p>}
                  {msg.file_urls?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {msg.file_urls.map((url, j) => <FileAttachment key={j} url={url} light={isMe} />)}
                    </div>
                  )}
                  <p className={`text-[10px] font-medium mt-2 select-none text-right ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {isClosed ? (
          <div className="px-6 py-5 flex-shrink-0 text-center bg-slate-50 border-t border-slate-200">
            <p className="text-[13px] font-bold text-slate-500">
              <CheckCircle className="inline w-4 h-4 mr-1.5 text-emerald-500" />
              This communication channel is closed.
            </p>
          </div>
        ) : (
          <div className="px-6 py-4 flex-shrink-0 bg-white border-t border-slate-200">
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[12px] font-semibold text-slate-600 max-w-[120px] truncate">{f.name}</span>
                    <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-3">
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
              <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-none flex-shrink-0 text-slate-500 mb-1">
                <Upload className="w-4 h-4" />
              </button>
              <textarea 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 px-4 py-3 text-[14px] bg-slate-50 border border-slate-200 focus:border-[#0062FF] focus:bg-white outline-none rounded-2xl resize-none min-h-[46px] max-h-[120px] transition-none" 
              />
              <button onClick={handleSendMessage} disabled={(!newMessage.trim() && files.length === 0) || sending}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#0062FF] hover:bg-[#0052CC] text-white transition-none disabled:opacity-40 disabled:hover:bg-[#0062FF] shadow-sm flex-shrink-0 mb-1">
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}