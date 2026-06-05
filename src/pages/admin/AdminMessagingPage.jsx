import { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, Inbox, User, RefreshCw } from 'lucide-react';

function ThreadList({ threads, selected, onSelect }) {
  return (
    <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid #1E1E1E', overflowY: 'auto', background: '#111' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #1E1E1E' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Inbox</h3>
        <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{threads.length} conversations</p>
      </div>
      {threads.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', color: '#555', fontSize: 13 }}>No messages yet.</div>
      )}
      {threads.map(t => (
        <div key={t.userId} onClick={() => onSelect(t)}
          style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #1A1A1A', background: selected?.userId === t.userId ? '#1A1A1A' : 'transparent', borderLeft: selected?.userId === t.userId ? '2px solid #F95738' : '2px solid transparent', transition: 'background 100ms' }}
          onMouseEnter={e => { if (selected?.userId !== t.userId) e.currentTarget.style.background = '#161616'; }}
          onMouseLeave={e => { if (selected?.userId !== t.userId) e.currentTarget.style.background = 'transparent'; }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.email}</span>
            {t.unread > 0 && <span style={{ background: '#E8184A', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '1px 6px', flexShrink: 0 }}>{t.unread}</span>}
          </div>
          <p style={{ fontSize: 12, color: '#555', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.lastMessage}</p>
        </div>
      ))}
    </div>
  );
}

export default function AdminMessagingPage() {
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [newThreadEmail, setNewThreadEmail] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const bottomRef = useRef(null);

  const loadThreads = async () => {
    const all = await base44.entities.AdminMessage.list('-created_date', 200);
    // Group by user (non-admin side)
    const byUser = {};
    for (const m of all) {
      const userId = m.is_from_admin ? m.to_user_id : m.from_user_id;
      const email = m.is_from_admin ? m.to_email : m.from_email;
      if (!byUser[userId]) byUser[userId] = { userId, email, msgs: [], unread: 0 };
      byUser[userId].msgs.push(m);
      if (!m.is_from_admin && !m.read) byUser[userId].unread++;
    }
    const result = Object.values(byUser).map(t => ({ ...t, lastMessage: t.msgs[t.msgs.length - 1]?.body?.slice(0, 60) || '' }));
    setThreads(result);
  };

  useEffect(() => {
    base44.auth.me().then(setAdminUser).catch(() => {});
    loadThreads();
  }, []);

  const loadThread = async (thread) => {
    setSelected(thread);
    const msgs = await base44.entities.AdminMessage.filter({ $or: [{ from_user_id: thread.userId }, { to_user_id: thread.userId }] }, '-created_date', 100);
    const sorted = [...msgs].reverse();
    setMessages(sorted);
    // Mark unread as read
    for (const m of msgs.filter(m => !m.is_from_admin && !m.read)) {
      base44.entities.AdminMessage.update(m.id, { read: true }).catch(() => {});
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const send = async () => {
    if (!body.trim() || !selected) return;
    setSending(true);
    await base44.entities.AdminMessage.create({
      from_user_id: adminUser?.id, from_email: adminUser?.email,
      to_user_id: selected.userId, to_email: selected.email,
      subject: subject || 'Message from WOK team',
      body: body.trim(), is_from_admin: true, read: false,
    });
    setBody(''); setSending(false);
    loadThread(selected);
  };

  const sendNewThread = async () => {
    if (!newThreadEmail.trim() || !body.trim()) return;
    setSending(true);
    // Try to find user by email
    const users = await base44.entities.User.filter({ email: newThreadEmail.trim() });
    const targetUser = users[0];
    await base44.entities.AdminMessage.create({
      from_user_id: adminUser?.id, from_email: adminUser?.email,
      to_user_id: targetUser?.id || 'unknown', to_email: newThreadEmail.trim(),
      subject: subject || 'Message from WOK team',
      body: body.trim(), is_from_admin: true, read: false,
    });
    setBody(''); setNewThreadEmail(''); setShowNewThread(false); setSending(false);
    loadThreads();
  };

  return (
    <div style={{ display: 'flex', height: '100%', color: '#fff' }}>
      {/* Thread list */}
      <ThreadList threads={threads} selected={selected} onSelect={loadThread} />

      {/* Conversation panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0D0D0D' }}>
        {/* Toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>
            {selected ? selected.email : 'Select a conversation'}
          </h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setShowNewThread(v => !v); setSelected(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Send size={13} /> New message
            </button>
            <button onClick={loadThreads} style={{ width: 32, height: 32, borderRadius: 8, background: '#1A1A1A', border: '1px solid #222', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {showNewThread && (
          <div style={{ padding: '20px', borderBottom: '1px solid #1E1E1E', background: '#111' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>Compose new message</p>
            <input value={newThreadEmail} onChange={e => setNewThreadEmail(e.target.value)} placeholder="Recipient email address"
              style={{ width: '100%', background: '#0D0D0D', border: '1px solid #222', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#fff', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#F95738'} onBlur={e => e.target.style.borderColor = '#222'} />
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject"
              style={{ width: '100%', background: '#0D0D0D', border: '1px solid #222', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#fff', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#F95738'} onBlur={e => e.target.style.borderColor = '#222'} />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." rows={4}
              style={{ width: '100%', background: '#0D0D0D', border: '1px solid #222', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 8 }}
              onFocus={e => e.target.style.borderColor = '#F95738'} onBlur={e => e.target.style.borderColor = '#222'} />
            <button onClick={sendNewThread} disabled={sending}
              style={{ padding: '9px 20px', background: '#F95738', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {!selected && !showNewThread && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#555' }}>
              <Inbox size={40} color="#333" style={{ marginBottom: 12 }} />
              <p style={{ fontSize: 14 }}>Select a conversation or compose a new message</p>
            </div>
          )}
          {selected && messages.map((m) => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.is_from_admin ? 'flex-end' : 'flex-start', marginBottom: 14 }}>
              {!m.is_from_admin && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 }}>
                  <User size={13} color="#888" />
                </div>
              )}
              <div style={{ maxWidth: '65%' }}>
                <div style={{ background: m.is_from_admin ? '#F95738' : '#1A1A1A', borderRadius: m.is_from_admin ? '12px 12px 4px 12px' : '12px 12px 12px 4px', padding: '10px 14px', fontSize: 13, color: '#fff', lineHeight: 1.5 }}>
                  {m.body}
                </div>
                <p style={{ fontSize: 11, color: '#444', margin: '4px 0 0', textAlign: m.is_from_admin ? 'right' : 'left' }}>
                  {new Date(m.created_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Reply box */}
        {selected && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #1E1E1E', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Type a reply…" rows={2}
              style={{ flex: 1, background: '#1A1A1A', border: '1px solid #222', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#F95738'} onBlur={e => e.target.style.borderColor = '#222'}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button onClick={send} disabled={sending || !body.trim()}
              style={{ width: 38, height: 38, borderRadius: '50%', background: body.trim() ? '#F95738' : '#222', border: 'none', cursor: body.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 120ms' }}>
              <Send size={15} color="#fff" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}