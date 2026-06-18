import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, MessageSquare, X, Plus, Upload, Send, Trash2, CheckCircle, FileText, Image as ImageIcon, Bug, DollarSign, HelpCircle, ChevronRight } from 'lucide-react';
import { getUserPlan } from '@/lib/plans-config';

const DK = {
  bg: '#F9F9F8', surface: '#FFFFFF', border: 'rgba(0,0,0,0.09)',
  text: '#111', muted: '#666', faint: '#F5F5F3',
};

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  in_progress: { label: 'In progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  closed:      { label: 'Resolved',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
};

const CATEGORY_CONFIG = {
  bug:   { label: 'Bug',     icon: Bug,        color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  money: { label: 'Payment', icon: DollarSign, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  other: { label: 'Other',   icon: HelpCircle, color: '#7B4FE0', bg: 'rgba(123,79,224,0.1)' },
};

function FileAttachment({ url }) {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
  const filename = url.split('/').pop().split('?')[0] || 'file';
  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: 8, overflow: 'hidden', maxWidth: 140, border: '1px solid #2A2A2A', marginTop: 6 }}>
        <img src={url} alt="attachment" style={{ width: '100%', objectFit: 'cover', maxHeight: 90 }} />
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 7, marginTop: 6, fontSize: 11, color: '#888', border: '1px solid #2A2A2A', maxWidth: 180, textDecoration: 'none', background: '#141414' }}>
      <FileText style={{ width: 12, height: 12, flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{filename.slice(0, 24)}</span>
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
      }).catch(() => {});
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

  if (!user && loading) return (
    <div style={{ minHeight: '100vh', background: DK.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2A2A2A' }} />
            <div style={{ width: 90, height: 20, borderRadius: 6, background: '#2A2A2A' }} />
          </div>
          <div style={{ width: 120, height: 34, borderRadius: 8, background: '#2A2A2A' }} />
        </div>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: 70, borderRadius: 10, background: '#EBEBEA', border: '1px solid rgba(0,0,0,0.08)', marginBottom: 8, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)', backgroundSize: '200% 100%', animation: `sk 1.4s ease-in-out ${i*0.12}s infinite` }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );

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
    <div style={{ minHeight: '100vh', background: DK.bg, fontFamily: 'Inter, system-ui, sans-serif', color: DK.text }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setPage('landing')} style={{ width: 32, height: 32, borderRadius: 8, background: '#EBEBEA', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
              <ArrowLeft style={{ width: 14, height: 14 }} />
            </button>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: DK.text, margin: 0 }}>Support</h1>
          </div>
          {activeTab === 'my' && (
            <button onClick={() => setShowNewTicket(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#F95738', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#fff', transition: 'opacity 150ms' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <Plus style={{ width: 12, height: 12 }} />
              New ticket
            </button>
          )}
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[{ id: 'my', label: 'My tickets' }, { id: 'admin', label: `All (${adminTickets.length})` }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, borderRadius: 7, border: 'none', cursor: 'pointer', background: activeTab === tab.id ? '#fff' : '#2A2A2A', color: activeTab === tab.id ? '#000' : '#888', transition: 'background 120ms, color 120ms' }}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'my' && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {[['all', 'All'], ['open', 'Open'], ['closed', 'Resolved']].map(([f, l]) => (
              <button key={f} onClick={() => setTicketFilter(f)}
                style={{ padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 6, border: `1px solid ${ticketFilter === f ? '#444' : '#2A2A2A'}`, cursor: 'pointer', background: ticketFilter === f ? '#2A2A2A' : 'transparent', color: ticketFilter === f ? '#fff' : '#666', transition: 'all 120ms' }}>
                {l}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
            <div style={{ width: 20, height: 20, border: '2px solid #2A2A2A', borderTopColor: '#F95738', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 48, gap: 12, border: `1px solid ${DK.border}`, borderRadius: 12, background: DK.surface }}>
            <MessageSquare style={{ width: 28, height: 28, color: '#CCC' }} />
            <p style={{ fontSize: 13, color: DK.muted, margin: 0 }}>No tickets</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredTickets.map(ticket => {
              const s = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
              const cat = CATEGORY_CONFIG[ticket.category] || CATEGORY_CONFIG.other;
              const CatIcon = cat.icon;
              return (
                <button key={ticket.id} onClick={() => setChatTicket(ticket)}
                  style={{ width: '100%', padding: '14px 16px', textAlign: 'left', background: DK.surface, border: `1px solid ${DK.border}`, borderRadius: 10, cursor: 'pointer', transition: 'border-color 120ms', display: 'block' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = DK.border}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: DK.text, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.title || ticket.user_name || ticket.user_email?.split('@')[0] || 'Ticket'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#555' }}>{new Date(ticket.created_date).toLocaleDateString('en-US')}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: cat.bg, color: cat.color }}>
                          <CatIcon style={{ width: 9, height: 9 }} />{cat.label}
                        </span>
                        {isAdmin && ticket.user_plan && (
                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#2A2A2A', color: '#666' }}>{ticket.user_plan}</span>
                        )}
                        {isAdmin && activeTab === 'admin' && (
                          <span style={{ fontSize: 10, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{ticket.user_email}</span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '4px 9px', borderRadius: 5, background: s.bg, color: s.color, flexShrink: 0 }}>
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
    <div style={{ minHeight: '100vh', background: '#F9F9F8', fontFamily: 'Inter, system-ui, sans-serif', color: '#111' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#111', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Help & Support</h1>
          <p style={{ fontSize: 14, color: '#666', margin: 0 }}>Our team is here to help you</p>
        </div>

        <button onClick={onNavigate}
          style={{ width: '100%', padding: '28px 28px', background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 14, cursor: 'pointer', textAlign: 'left', marginBottom: 16, transition: 'border-color 150ms' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#F95738'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎧</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>Open a support ticket</h3>
          <p style={{ fontSize: 13, color: '#666', margin: '0 0 20px', lineHeight: 1.6 }}>Submit a detailed ticket and receive personalized assistance.</p>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#F95738' }}>
            Get started <ChevronRight style={{ width: 14, height: 14 }} />
          </span>
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={onNavigate}
            style={{ padding: '18px 16px', textAlign: 'left', background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 10, cursor: 'pointer', transition: 'border-color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(249,87,56,0.08)', border: '1px solid rgba(249,87,56,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageSquare style={{ width: 15, height: 15, color: '#F95738' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>My tickets</p>
                <p style={{ fontSize: 11, color: '#888', margin: 0 }}>View & manage</p>
              </div>
            </div>
          </button>
          <a href="https://discord.gg/wok" target="_blank" rel="noopener noreferrer"
            style={{ padding: '18px 16px', textAlign: 'left', background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 10, cursor: 'pointer', textDecoration: 'none', transition: 'border-color 150ms', display: 'block' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(123,79,224,0.08)', border: '1px solid rgba(123,79,224,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageSquare style={{ width: 15, height: 15, color: '#7B4FE0' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>Community</p>
                <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Discord</p>
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
    const initialMsg = { author: 'user', text: description, file_urls, created_at: new Date().toISOString() };
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
    { id: 'bug', label: 'Bug', icon: Bug, color: '#ef4444' },
    { id: 'money', label: 'Payment', icon: DollarSign, color: '#f59e0b' },
    { id: 'other', label: 'Other', icon: HelpCircle, color: '#7B4FE0' },
  ];

  const inputStyle = { width: '100%', background: '#F5F5F3', border: '1px solid rgba(0,0,0,0.10)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#111', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget && step !== 1) onClose(); }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>New ticket</p>
          {step !== 1 && (
            <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
              <X style={{ width: 13, height: 13 }} />
            </button>
          )}
        </div>

        <div style={{ padding: 20 }}>
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 6 }}>Describe your issue</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Explain the problem in detail…"
                  rows={4} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 6 }}>Attachments (optional)</label>
                <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }}
                  onChange={e => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
                <button onClick={() => fileInputRef.current?.click()}
                  style={{ width: '100%', padding: '11px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 12, color: '#555', background: 'transparent', border: '1px dashed #2A2A2A', borderRadius: 8, cursor: 'pointer', transition: 'border-color 120ms' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3A3A3A'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A2A'}>
                  <Upload style={{ width: 13, height: 13 }} /> Attach files
                </button>
                {files.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {files.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 9px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 6 }}>
                        <FileText style={{ width: 10, height: 10, color: '#666' }} />
                        <span style={{ fontSize: 10, color: '#888', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#444' }}>
                          <X style={{ width: 9, height: 9 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleAnalyze} disabled={!description.trim()}
                style={{ padding: '11px 0', background: !description.trim() ? '#EBEBEA' : '#111', color: !description.trim() ? '#888' : '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: description.trim() ? 'pointer' : 'not-allowed' }}>
                Continue
              </button>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 0', gap: 14 }}>
              <div style={{ width: 28, height: 28, border: '2px solid #2A2A2A', borderTopColor: '#F95738', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '0 0 3px' }}>Processing…</p>
                <p style={{ fontSize: 11, color: '#555', margin: 0 }}>Please wait</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>Select a category</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {CATS.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 8px', borderRadius: 9, border: `1px solid ${isSelected ? cat.color : '#2A2A2A'}`, background: isSelected ? `${cat.color}18` : '#1A1A1A', cursor: 'pointer', transition: 'all 120ms' }}>
                      <Icon style={{ width: 18, height: 18, color: cat.color }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: isSelected ? cat.color : '#888' }}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={handleSubmit} disabled={submitting || !selectedCategory}
                style={{ padding: '11px 0', background: submitting || !selectedCategory ? '#EBEBEA' : '#111', color: submitting || !selectedCategory ? '#888' : '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: selectedCategory ? 'pointer' : 'not-allowed' }}>
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
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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
            if (serverMessages.length > messagesRef.current.length) setMessages(serverMessages);
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
    const msg = { author: isAdmin ? 'admin' : 'user', text: newMessage.trim(), file_urls, created_at: new Date().toISOString() };
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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex', background: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: '100%', maxWidth: 440, marginLeft: 'auto', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', borderLeft: '1px solid rgba(0,0,0,0.09)' }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.09)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F5F3', border: '1px solid rgba(0,0,0,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageSquare style={{ width: 14, height: 14, color: '#888' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {isAdmin ? (currentTicket.user_name || currentTicket.user_email?.split('@')[0] || 'User') : 'WOK Support'}
                </p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: cat.bg, color: cat.color, flexShrink: 0 }}>
                  <CatIcon style={{ width: 8, height: 8 }} />{cat.label}
                </span>
              </div>
              <p style={{ fontSize: 10, color: '#555', margin: 0 }}>
                {isAdmin ? currentTicket.user_email : 'Reply within 24-48h'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: s.bg, color: s.color }}>{s.label}</span>
            {!isAdmin && !isClosed && (
              <button onClick={async () => { if (window.confirm('Mark as resolved?')) await handleStatusChange('closed'); }}
                style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle style={{ width: 14, height: 14, color: '#22c55e' }} />
              </button>
            )}
            {isAdmin && (
              <button onClick={handleDelete} style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 style={{ width: 14, height: 14, color: '#ef4444' }} />
              </button>
            )}
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        {isAdmin && (
          <div style={{ padding: '8px 16px', display: 'flex', gap: 6, borderBottom: '1px solid rgba(0,0,0,0.09)', background: '#F5F5F3', flexShrink: 0 }}>
            {Object.entries(STATUS_CONFIG).map(([st, cfg]) => (
              <button key={st} onClick={() => handleStatusChange(st)}
                style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer', background: currentTicket.status === st ? '#111' : '#EBEBEA', color: currentTicket.status === st ? '#fff' : '#666', transition: 'all 120ms' }}>
                {cfg.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, background: '#1A1A1A' }}>
          {messages.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: 13, color: '#555', padding: '32px 0' }}>No messages</p>
          ) : messages.map((msg, i) => {
            const isSystem = msg.author === 'system';
            const isMe = isAdmin ? msg.author === 'admin' : msg.author === 'user';

            if (isSystem) {
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <CheckCircle style={{ width: 11, height: 11 }} /> {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                {!isMe && (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F95738', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', border: '1px solid #333' }}>
                    W
                  </div>
                )}
                <div style={{ maxWidth: '72%' }}>
                  <div style={{
                    padding: '10px 13px',
                    background: isMe ? '#fff' : '#141414',
                    color: isMe ? '#000' : '#ccc',
                    border: isMe ? 'none' : '1px solid #2A2A2A',
                    borderRadius: isMe ? '14px 3px 14px 14px' : '3px 14px 14px 14px',
                  }}>
                    {msg.text && <p style={{ fontSize: 13, lineHeight: 1.55, margin: 0, whiteSpace: 'pre-line' }}>{msg.text}</p>}
                    {msg.file_urls?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                        {msg.file_urls.map((url, j) => <FileAttachment key={j} url={url} />)}
                      </div>
                    )}
                    <p style={{ fontSize: 9, marginTop: 6, margin: '6px 0 0', opacity: 0.4 }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {isMe && (
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#2A2A2A', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#888', border: '1px solid #333' }}>
                    {(currentTicket.user_name?.charAt(0) || 'U').toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {isClosed ? (
          <div style={{ padding: '14px 16px', textAlign: 'center', borderTop: '1px solid #2A2A2A', background: '#141414', flexShrink: 0 }}>
            <p style={{ fontSize: 12, color: '#555', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <CheckCircle style={{ width: 13, height: 13, color: '#22c55e' }} />
              This ticket is resolved
            </p>
          </div>
        ) : (
          <div style={{ padding: '10px 14px', borderTop: '1px solid #2A2A2A', background: '#141414', flexShrink: 0 }}>
            {files.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 6 }}>
                    <FileText style={{ width: 10, height: 10, color: '#666', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: '#888', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#444' }}>
                      <X style={{ width: 8, height: 8 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }}
                onChange={e => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
              <button onClick={() => fileInputRef.current?.click()}
                style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A1A1A', border: '1px solid #2A2A2A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexShrink: 0 }}>
                <Upload style={{ width: 13, height: 13 }} />
              </button>
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Type your message…"
                style={{ flex: 1, padding: '9px 12px', fontSize: 13, color: '#ccc', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, outline: 'none', fontFamily: 'Inter, sans-serif' }} />
              <button onClick={handleSendMessage}
                disabled={(!newMessage.trim() && files.length === 0) || sending}
                style={{ width: 32, height: 32, borderRadius: '50%', background: (newMessage.trim() || files.length > 0) ? '#F95738' : '#2A2A2A', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, transition: 'background 120ms' }}>
                <Send style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}