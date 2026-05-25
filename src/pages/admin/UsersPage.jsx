import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Filter, ChevronLeft, ChevronRight, Pencil, ToggleLeft, CircleSlash, X } from 'lucide-react';
import UserDetailDrawer from '@/components/admin/UserDetailDrawer';
import { getUserColor } from '@/lib/user-color';
import { getPlansConfig } from '@/lib/plans-config';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 25;

const STATUS_FILTERS = [
  { label: 'Tous', value: 'all' },
  { label: 'Actif', value: 'active' },
  { label: 'Suspendu', value: 'suspended' },
  { label: 'Banni', value: 'banned' },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await base44.entities.User.list('-created_date', 1000);
      setUsers(allUsers || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' ||
      (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !user.disabled && !user.banned) ||
      (statusFilter === 'suspended' && user.disabled && !user.banned) ||
      (statusFilter === 'banned' && user.banned);
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleUserUpdate = () => {
    loadUsers();
    setDrawerOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#E5E5E5] flex items-center justify-between">
        <h1 className="text-[20px] font-medium text-[#1A1A1A]">Utilisateurs</h1>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email…"
              className="w-[320px] pl-10 pr-4 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-[140px] pl-4 pr-10 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 bg-white cursor-pointer"
            >
              {STATUS_FILTERS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-[#E5E5E5]">
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Abonnement</th>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Date d'inscription</th>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-[11px] font-medium text-[#888888] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[13px] text-[#888888]">
                  Chargement...
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[13px] text-[#888888]">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user, index) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isEven={index % 2 === 1}
                  onClick={() => handleUserClick(user)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-8 py-4 border-t border-[#E5E5E5] flex items-center justify-between">
        <p className="text-[13px] text-[#888888]">
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} au total
        </p>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-[13px] text-[#1A1A1A] px-3">
            Page {currentPage} sur {totalPages || 1}
          </span>
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedUser && (
        <UserDetailDrawer
          user={selectedUser}
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedUser(null);
          }}
          onUserUpdated={handleUserUpdate}
        />
      )}
    </div>
  );
}

function UserRow({ user, isEven, onClick }) {
  const userInitial = user.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  const role = user.role || 'user';
  const isBanned = user.banned || false;
  const isSuspended = user.disabled && !isBanned;
  const isActive = !user.disabled && !isBanned;

  const plans = getPlansConfig();
  const userPlan = plans.find(p => p.id === user.subscription_plan) || plans.find(p => p.id === 'free');

  const status = isBanned ? 'banned' : isSuspended ? 'suspended' : 'active';

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition-colors hover:bg-[#F0F0F0] ${isEven ? 'bg-[#FAFAFA]' : 'bg-white'}`}
    >
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
            style={{ backgroundColor: getUserColor(user) }}
          >
            {userInitial}
          </div>
          <span className="text-[13px] text-[#1A1A1A] font-medium">
            {user.full_name || '—'}
          </span>
        </div>
      </td>
      <td className="px-6 py-3">
        <span className="text-[13px] text-[#444444]">{user.email}</span>
      </td>
      <td className="px-6 py-3">
        <span className={`text-[13px] ${role === 'admin' ? 'text-blue-600 font-medium' : 'text-[#444444]'}`}>
          {role === 'admin' ? 'Administrateur' : 'Utilisateur'}
        </span>
      </td>
      <td className="px-6 py-3">
        <PlanBadge plan={userPlan} />
      </td>
      <td className="px-6 py-3">
        <span className="text-[13px] text-[#888888]">
          {new Date(user.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </td>
      <td className="px-6 py-3">
        <StatusBadge status={status} />
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <ActionButton icon={Pencil} tooltip="Modifier" />
          <ActionButton icon={ToggleLeft} tooltip={isSuspended || isBanned ? "Réactiver" : "Suspendre"} />
          <ActionButton icon={CircleSlash} tooltip="Bannir" />
        </div>
      </td>
    </tr>
  );
}

function PlanBadge({ plan }) {
  const colors = {
    free: { bg: '#F0F0F0', text: '#666666' },
    starter: { bg: '#E8F4FD', text: '#0066CC' },
    pro: { bg: '#F0E8FD', text: '#6B21A8' },
    enterprise: { bg: '#E8FDF0', text: '#006633' },
  };

  const color = colors[plan?.id] || colors.free;

  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {plan?.name || 'Gratuit'}
    </span>
  );
}

function StatusBadge({ status }) {
  const colors = {
    active: { bg: '#DCFCE7', text: '#166534' },
    suspended: { bg: '#FEF3C7', text: '#92400E' },
    banned: { bg: '#FEE2E2', text: '#991B1B' },
  };

  const labels = {
    active: 'Actif',
    suspended: 'Suspendu',
    banned: 'Banni',
  };

  const color = colors[status] || colors.active;

  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {labels[status]}
    </span>
  );
}

function ActionButton({ icon: Icon, tooltip }) {
  return (
    <button
      className="p-1.5 text-[#888888] hover:text-[#1A1A1A] hover:bg-[#F0F0F0] rounded transition-colors relative group"
      title={tooltip}
    >
      <Icon className="w-4 h-4" />
      <span className="absolute top-full right-0 mt-1 px-2 py-1 bg-[#1A1A1A] text-white text-[11px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
        {tooltip}
      </span>
    </button>
  );
}