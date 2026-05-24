import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, MoreHorizontal, Edit2, Trash2, Check, Home, MessageSquare, Cpu, PanelLeftClose, ChevronDown } from 'lucide-react';
import { getUserColor } from '@/lib/user-color';

const getLocalDiscussions = (workspaceId) => {
  try { return JSON.parse(localStorage.getItem(`wok_discussions_${workspaceId}`)) || []; } catch { return []; }
};
const saveLocalDiscussions = (workspaceId, data) => {
  localStorage.setItem(`wok_discussions_${workspaceId}`, JSON.stringify(data));
};
const getWorkspaces = () => {
  try { return JSON.parse(localStorage.getItem('wok_workspaces')) || [{ id: 'default', name: 'My Workspace', current: true }]; } catch { return [{ id: 'default', name: 'My Workspace', current: true }]; }
};
const saveWorkspaces = (ws) => localStorage.setItem('wok_workspaces', JSON.stringify(ws));

export default function ChatWorkspaceSidebar({ open, setOpen, user, convId }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [workspaces, setWorkspaces] = useState(getWorkspaces);
  const [showWsDropdown, setShowWsDropdown] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const wsRef = useRef(null);

  const currentWs = workspaces.find(w => w.current) || workspaces[0];

  useEffect(() => {
    setDiscussions(getLocalDiscussions(currentWs.id));
  }, [currentWs.id]);

  useEffect(() => {
    const handler = (e) => {
      if (wsRef.current && !wsRef.current.contains(e.target)) setShowWsDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchWorkspace = (id) => {
    const updated = workspaces.map(w => ({ ...w, current: w.id === id }));
    setWorkspaces(updated);
    saveWorkspaces(updated);
    setDiscussions(getLocalDiscussions(id));
    setShowWsDropdown(false);
    navigate('/chat');
  };

  const createWorkspace = () => {
    const name = prompt('Workspace name:');
    if (!name?.trim() || workspaces.length >= 4) return;
    const newWs = { id: `ws_${Date.now()}`, name: name.trim(), current: true };
    const updated = workspaces.map(w => ({ ...w, current: false })).concat(newWs);
    setWorkspaces(updated);
    saveWorkspaces(updated);
    setDiscussions([]);
    navigate('/chat');
    setShowWsDropdown(false);
  };

  const deleteDiscussion = (e, id) => {
    e.stopPropagation();
    const updated = discussions.filter(d => d.id !== id);
    setDiscussions(updated);
    saveLocalDiscussions(currentWs.id, updated);
    if (convId === id) navigate('/chat');
  };

  const startEdit = (e, d) => {
    e.stopPropagation();
    setEditingId(d.id);
    setEditTitle(d.title || d.preview || 'New chat');
  };

  const saveEdit = (id) => {
    if (editTitle.trim()) {
      const updated = discussions.map(d => d.id === id ? { ...d, title: editTitle.trim() } : d);
      setDiscussions(updated);
      saveLocalDiscussions(currentWs.id, updated);
    }
    setEditingId(null);
  };

  const userInitial = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  const navItems = [
    { icon: Home, label: 'Home', path: '/app' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions' },
    { icon: Cpu, label: 'DNA Wok', path: '/ai-dna' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop on mobile */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />

          <motion.aside
            key="sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[260px] flex flex-col bg-[#111111] border-r border-[#2A2A2A] font-sans"
          >
            {/* Header + Workspace Switcher */}
            <div className="p-4 border-b border-[#2A2A2A] flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-[900] italic tracking-tighter text-white">WOK</h1>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-[#2A2A2A] rounded-md transition-colors"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* Workspace dropdown */}
              <div className="relative" ref={wsRef}>
                <button
                  onClick={() => setShowWsDropdown(v => !v)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[13px] text-white hover:border-[#3A3A3A] transition-colors"
                >
                  <span className="truncate font-medium">{currentWs.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform ${showWsDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showWsDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl shadow-2xl z-[999] py-1 overflow-hidden"
                    >
                      {workspaces.map(ws => (
                        <button
                          key={ws.id}
                          onClick={() => switchWorkspace(ws.id)}
                          className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between gap-2 transition-colors hover:bg-[#2A2A2A] ${ws.current ? 'text-white' : 'text-gray-400'}`}
                        >
                          <span className="truncate">{ws.name}</span>
                          {ws.current && <Check className="w-3.5 h-3.5 text-[#0055FF] flex-shrink-0" />}
                        </button>
                      ))}
                      {workspaces.length < 4 && (
                        <button
                          onClick={createWorkspace}
                          className="w-full text-left px-3 py-2 text-[12px] text-gray-500 hover:text-white hover:bg-[#2A2A2A] flex items-center gap-2 border-t border-[#2A2A2A] transition-colors"
                        >
                          <Plus className="w-3 h-3" /> New workspace
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* New chat button */}
            <div className="px-4 pt-4 pb-2 flex-shrink-0">
              <button
                onClick={() => navigate('/chat')}
                className="flex items-center justify-center gap-2 w-full py-2 bg-[#0055FF] text-white rounded-lg text-[13px] font-bold hover:bg-[#0044CC] transition-colors"
              >
                <Plus className="w-4 h-4" /> New chat
              </button>
            </div>

            {/* Discussions list */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {discussions.length > 0 && (
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-2 mb-2">Recents</p>
              )}
              {discussions.map((d) => (
                <div
                  key={d.id}
                  onClick={() => navigate(`/chat?conversationId=${d.id}`)}
                  className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors mb-0.5 ${d.id === convId ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'hover:bg-[#1A1A1A]'}`}
                >
                  {editingId === d.id ? (
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onBlur={() => saveEdit(d.id)}
                      onKeyDown={e => e.key === 'Enter' && saveEdit(d.id)}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 bg-[#2A2A2A] text-white text-[13px] rounded px-2 py-0.5 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className={`flex-1 text-[13px] truncate ${d.id === convId ? 'text-white font-medium' : 'text-gray-400'}`}>
                      {d.title || d.preview || 'New chat'}
                    </span>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={(e) => startEdit(e, d)} className="p-1 text-gray-500 hover:text-white rounded transition-colors">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={(e) => deleteDiscussion(e, d.id)} className="p-1 text-gray-500 hover:text-red-400 rounded transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Nav links */}
            <div className="px-3 py-3 border-t border-[#2A2A2A] space-y-0.5 flex-shrink-0">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${location.pathname === item.path ? 'text-white bg-[#1A1A1A]' : 'text-gray-500 hover:text-white hover:bg-[#1A1A1A]'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* User footer */}
            <div className="p-4 border-t border-[#2A2A2A] flex items-center gap-3 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                style={{ backgroundColor: getUserColor(user) }}
              >
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-white truncate">{user?.full_name || 'User'}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}