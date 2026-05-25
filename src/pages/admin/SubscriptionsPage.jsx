import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Filter, Calendar, Download, ChevronLeft, ChevronRight, ExternalLink, X, Ban, Calendar as CalendarIcon } from 'lucide-react';
import UserDetailDrawer from '@/components/admin/UserDetailDrawer';
import { getPlansConfig } from '@/lib/plans-config';
import { toast } from 'sonner';
import { getUserColor } from '@/lib/user-color';

const ITEMS_PER_PAGE = 25;

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    plan: 'all',
    status: 'all',
    source: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [extendDate, setExtendDate] = useState({ subId: null, date: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allUsers, allSubs] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Conversation.list('-created_date', 1000),
      ]);
      setUsers(allUsers || []);
      
      // Simuler les abonnements à partir des utilisateurs
      const subs = (allUsers || [])
        .filter(u => u.subscription_plan)
        .map(u => ({
          id: u.id,
          user: u,
          plan: u.subscription_plan,
          start_date: u.subscription_date || u.created_date,
          expiry_date: calculateExpiryDate(u),
          source: getSource(u),
          status: getStatus(u),
        }));
      
      setSubscriptions(subs);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const calculateExpiryDate = (user) => {
    if (!user.subscription_date) return null;
    const date = new Date(user.subscription_date);
    const billing = user.billing_cycle || 'monthly';
    if (billing === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().slice(0, 10);
  };

  const getSource = (user) => {
    if (user.subscription_source === 'manual') return 'manuel';
    if (user.subscription_source === 'code') return 'code';
    return 'paiement';
  };

  const getStatus = (user) => {
    if (user.disabled || user.banned) return 'annulé';
    const expiry = calculateExpiryDate(user);
    if (expiry && new Date(expiry) < new Date()) return 'expiré';
    return 'actif';
  };

  const filteredSubs = subscriptions.filter(sub => {
    if (filters.plan !== 'all' && sub.plan !== filters.plan) return false;
    if (filters.status !== 'all' && sub.status !== filters.status) return false;
    if (filters.source !== 'all' && sub.source !== filters.source) return false;
    if (filters.dateFrom && sub.expiry_date < filters.dateFrom) return false;
    if (filters.dateTo && sub.expiry_date > filters.dateTo) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredSubs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSubs = filteredSubs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleExport = () => {
    const headers = ['Utilisateur', 'Email', 'Plan', 'Date début', 'Date expiration', 'Source', 'Statut'];
    const rows = filteredSubs.map(sub => [
      sub.user.full_name || '—',
      sub.user.email,
      sub.plan,
      sub.start_date,
      sub.expiry_date || '—',
      sub.source,
      sub.status,
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'abonnements.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé');
  };

  const handleExtend = async (subId, newDate) => {
    if (!newDate) return;
    try {
      await base44.entities.User.update(subId, {
        subscription_date: newDate,
      });
      toast.success('Abonnement prolongé');
      setExtendDate({ subId: null, date: '' });
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la prolongation');
    }
  };

  const handleRevoke = async (subId) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer cet abonnement ?')) return;
    try {
      await base44.entities.User.update(subId, {
        subscription_plan: 'free',
        credits_limit: 10,
      });
      toast.success('Abonnement révoqué');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la révocation');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const plans = getPlansConfig();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#E5E5E5] flex items-center justify-between">
        <h1 className="text-[20px] font-medium text-[#1A1A1A]">Abonnements actifs</h1>
        
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F8] transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="px-8 py-4 border-b border-[#E5E5E5] flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#888888]">Plan:</span>
          <select
            value={filters.plan}
            onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
            className="px-3 py-1.5 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
          >
            <option value="all">Tous</option>
            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#888888]">Statut:</span>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-1.5 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
          >
            <option value="all">Tous</option>
            <option value="actif">Actif</option>
            <option value="expiré">Expiré</option>
            <option value="annulé">Annulé</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#888888]">Source:</span>
          <select
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            className="px-3 py-1.5 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
          >
            <option value="all">Toutes</option>
            <option value="manuel">Manuel</option>
            <option value="code">Code</option>
            <option value="paiement">Paiement</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#888888]">Expiration:</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="px-3 py-1.5 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
          />
          <span className="text-[#888888]">à</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="px-3 py-1.5 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-[#E5E5E5]">
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Date de début</th>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Date d'expiration</th>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Source</th>
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
            ) : paginatedSubs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[13px] text-[#888888]">
                  Aucun abonnement trouvé
                </td>
              </tr>
            ) : (
              paginatedSubs.map((sub, index) => (
                <SubscriptionRow
                  key={sub.id}
                  sub={sub}
                  isEven={index % 2 === 1}
                  onExtend={handleExtend}
                  onRevoke={handleRevoke}
                  onViewUser={handleViewUser}
                  extendDate={extendDate}
                  setExtendDate={setExtendDate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-8 py-4 border-t border-[#E5E5E5] flex items-center justify-between">
        <p className="text-[13px] text-[#888888]">
          {filteredSubs.length} abonnement{filteredSubs.length > 1 ? 's' : ''} au total
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

      {/* User Detail Drawer */}
      {selectedUser && (
        <UserDetailDrawer
          user={selectedUser}
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedUser(null);
          }}
          onUserUpdated={loadData}
        />
      )}
    </div>
  );
}

function SubscriptionRow({ sub, isEven, onExtend, onRevoke, onViewUser, extendDate, setExtendDate }) {
  const userInitial = sub.user.full_name
    ? sub.user.full_name.charAt(0).toUpperCase()
    : sub.user.email.charAt(0).toUpperCase();

  const plans = getPlansConfig();
  const plan = plans.find(p => p.id === sub.plan);
  const isExpired = sub.status === 'expiré';

  return (
    <tr className={`transition-colors hover:bg-[#F0F0F0] ${isEven ? 'bg-[#FAFAFA]' : 'bg-white'} ${isExpired ? 'opacity-60' : ''}`}>
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
            style={{ backgroundColor: getUserColor(sub.user) }}
          >
            {userInitial}
          </div>
          <div>
            <p className={`text-[13px] font-medium ${isExpired ? 'text-[#AAAAAA]' : 'text-[#1A1A1A]'}`}>
              {sub.user.full_name || '—'}
            </p>
            <p className={`text-[12px] ${isExpired ? 'text-[#CCCCCC]' : 'text-[#888888]'}`}>
              {sub.user.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-3">
        <PlanBadge plan={plan} />
      </td>
      <td className="px-6 py-3">
        <span className={`text-[13px] ${isExpired ? 'text-[#AAAAAA]' : 'text-[#444444]'}`}>
          {new Date(sub.start_date).toLocaleDateString('fr-FR')}
        </span>
      </td>
      <td className="px-6 py-3">
        <span className={`text-[13px] ${isExpired ? 'text-[#AAAAAA]' : 'text-[#444444]'}`}>
          {sub.expiry_date ? new Date(sub.expiry_date).toLocaleDateString('fr-FR') : '—'}
        </span>
      </td>
      <td className="px-6 py-3">
        <SourceBadge source={sub.source} />
      </td>
      <td className="px-6 py-3">
        <StatusBadge status={sub.status} />
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center justify-end gap-1">
          {extendDate.subId === sub.id ? (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={extendDate.date}
                onChange={(e) => setExtendDate({ ...extendDate, date: e.target.value })}
                className="px-2 py-1 text-[12px] border border-[#E5E5E5] rounded focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                autoFocus
              />
              <button
                onClick={() => onExtend(sub.id, extendDate.date)}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setExtendDate({ subId: null, date: '' })}
                className="p-1.5 text-[#888888] hover:bg-[#F0F0F0] rounded transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <ActionButton icon={CalendarIcon} tooltip="Prolonger" onClick={() => setExtendDate({ subId: sub.id, date: sub.expiry_date || '' })} />
              <ActionButton icon={Ban} tooltip="Révoquer" onClick={() => onRevoke(sub.id)} />
              <ActionButton icon={ExternalLink} tooltip="Voir utilisateur" onClick={() => onViewUser(sub.user)} />
            </>
          )}
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

function SourceBadge({ source }) {
  const colors = {
    manuel: { bg: '#FEF3C7', text: '#92400E' },
    code: { bg: '#F3E8FF', text: '#6B21A8' },
    paiement: { bg: '#DBEAFE', text: '#1E40AF' },
  };

  const color = colors[source] || colors.manuel;

  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {source.charAt(0).toUpperCase() + source.slice(1)}
    </span>
  );
}

function StatusBadge({ status }) {
  const colors = {
    actif: { bg: '#DCFCE7', text: '#166534' },
    expiré: { bg: '#F0F0F0', text: '#666666' },
    annulé: { bg: '#FEE2E2', text: '#991B1B' },
  };

  const color = colors[status] || colors.actif;

  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ActionButton({ icon: Icon, tooltip, onClick }) {
  return (
    <button
      onClick={onClick}
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

function Check({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}