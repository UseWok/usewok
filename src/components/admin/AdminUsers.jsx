import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Shield, User, MoreHorizontal, Ban, Trash2, Edit,
  ChevronLeft, ChevronRight, X, Check, ShieldOff
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

const TIER_BADGE = {
  admin:  { label: 'Admin',  bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/20' },
  user:   { label: 'User',   bg: 'bg-sky-500/15',    text: 'text-sky-400',    border: 'border-sky-500/20'    },
  pro:    { label: 'Pro',    bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/20'  },
};

function TierBadge({ role }) {
  const t = TIER_BADGE[role] || TIER_BADGE.user;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${t.bg} ${t.text} ${t.border}`}>
      {t.label}
    </span>
  );
}

function StatusDot({ disabled, banned }) {
  const label = banned ? 'Banned' : disabled ? 'Suspended' : 'Active';
  const color = banned ? 'bg-amber-400' : disabled ? 'bg-rose-400' : 'bg-emerald-400';
  const textColor = banned ? 'text-amber-400' : disabled ? 'text-rose-400' : 'text-emerald-400';
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className={`text-xs ${textColor}`}>{label}</span>
    </div>
  );
}

function SortIcon({ field, sort }) {
  if (sort.field !== field) return <ChevronsUpDown className="w-3 h-3 text-white/20" />;
  return sort.dir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-primary" />
    : <ChevronDown className="w-3 h-3 text-primary" />;
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ field: 'created_date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    base44.entities.User.list('-created_date', 500)
      .then(u => setUsers(u || []))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (field) => {
    setSort(s => s.field === field
      ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { field, dir: 'asc' }
    );
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.full_name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
    if (statusFilter === 'active') list = list.filter(u => !u.disabled);
    if (statusFilter === 'suspended') list = list.filter(u => u.disabled);

    list.sort((a, b) => {
      let va = a[sort.field] ?? '';
      let vb = b[sort.field] ?? '';
      if (sort.field === 'created_date') { va = new Date(va); vb = new Date(vb); }
      else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, search, sort, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSuspend = async (userId, currentDisabled) => {
    await base44.entities.User.update(userId, { disabled: !currentDisabled });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, disabled: !currentDisabled } : u));
    setOpenMenuId(null);
  };

  const handleBan = async (userId, currentBanned) => {
    const action = currentBanned ? 'unban' : 'ban';
    if (!confirm(`Are you sure you want to ${action} this user? This will ${currentBanned ? 'restore' : 'permanently block'} their access.`)) return;
    await base44.entities.User.update(userId, {
      banned: !currentBanned,
      disabled: !currentBanned,
      ban_date: !currentBanned ? new Date().toISOString() : null,
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: !currentBanned, disabled: !currentBanned } : u));
    setOpenMenuId(null);
    toast.success(currentBanned ? 'User unbanned' : 'User permanently banned');
  };

  const handleDelete = async (userId) => {
    await base44.entities.User.delete(userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    setConfirmDelete(null);
  };

  const COLS = [
    { key: 'full_name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'created_date', label: 'Joined', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: false },
    { key: 'actions', label: '', sortable: false },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">All Users</h2>
          <p className="text-xs text-white/30 mt-0.5">{filtered.length} users found</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search users…"
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 w-56 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-white/30 hover:text-white/60" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-primary/50 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d0e14] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {COLS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={`px-5 py-4 text-left text-[11px] font-semibold text-white/35 uppercase tracking-wider ${col.sortable ? 'cursor-pointer hover:text-white/60 select-none' : ''}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && <SortIcon field={col.key} sort={sort} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {COLS.map(c => (
                      <td key={c.key} className="px-5 py-4">
                        <div className="h-4 bg-white/[0.05] rounded animate-pulse w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-white/25 text-sm">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {pageData.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {(user.full_name || user.email || '?')[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-white">{user.full_name || 'Unnamed'}</span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-white/50">{user.email}</span>
                      </td>
                      {/* Joined */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-white/40">
                          {user.created_date ? format(new Date(user.created_date), 'MMM d, yyyy') : '—'}
                        </span>
                      </td>
                      {/* Role */}
                      <td className="px-5 py-4">
                        <TierBadge role={user.role} />
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusDot disabled={user.disabled} banned={user.banned} />
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4 relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {openMenuId === user.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.92, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.92, y: -4 }}
                              transition={{ duration: 0.12 }}
                              className="absolute right-4 top-12 z-50 bg-[#1a1b24] border border-white/10 rounded-xl shadow-xl py-1 w-44"
                            >
                              <button
                               onClick={() => handleSuspend(user.id, user.disabled)}
                               className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                              >
                               <Ban className="w-3.5 h-3.5" />
                               {user.disabled ? 'Reactivate' : 'Suspend'}
                              </button>
                              <button
                               onClick={() => handleBan(user.id, user.banned)}
                               className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-400 hover:bg-amber-500/10 transition-colors"
                              >
                               <ShieldOff className="w-3.5 h-3.5" />
                               {user.banned ? 'Unban User' : 'Permanent Ban'}
                              </button>
                              <button
                               onClick={() => { setConfirmDelete(user); setOpenMenuId(null); }}
                               className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                               <Trash2 className="w-3.5 h-3.5" />
                               Delete User
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
            <span className="text-xs text-white/30">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`e${i}`} className="text-white/20 text-xs px-1">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                        p === page
                          ? 'bg-primary text-black'
                          : 'text-white/40 hover:text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#16172080] backdrop-blur border border-white/10 rounded-2xl p-6 w-80 shadow-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/20 flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Delete User?</h3>
              <p className="text-xs text-white/40 mb-5">
                This will permanently remove <span className="text-white/70">{confirmDelete.email}</span>. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete.id)}
                  className="flex-1 py-2 rounded-lg bg-rose-500/20 border border-rose-500/30 text-sm text-rose-400 hover:bg-rose-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}