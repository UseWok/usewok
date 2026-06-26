import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import UserDetailDrawer from '@/components/admin/UserDetailDrawer';
import { getUserColor } from '@/lib/user-color';
import { getPlansConfig } from '@/lib/plans-config';

const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';
const BG = '#F8F7F4';
const CARD = '#FFFFFF';
const BORDER = 'rgba(21,19,15,0.09)';
const INK = '#1A1A1A';
const INK2 = '#6B6660';
const INK3 = '#A8A49F';
const CORAL = '#FF5A1F';
const ITEMS = 30;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try { setUsers(await base44.entities.User.list('-created_date', 2000) || []); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    !search || (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS);
  const page_users = filtered.slice((page - 1) * ITEMS, page * ITEMS);
  const plans = getPlansConfig();

  const th = { fontSize: 10.5, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 16px', background: BG, borderBottom: `1px solid ${BORDER}`, textAlign: 'left', whiteSpace: 'nowrap' };
  const td = { fontSize: 13, color: INK, padding: '10px 16px', borderBottom: `1px solid ${BORDER}` };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG, fontFamily: F }}>
      <div style={{ padding: '24px 32px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.03em' }}>Utilisateurs</h1>
          <p style={{ fontSize: 12.5, color: INK3, margin: '3px 0 0' }}>{users.length} inscrits</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={14} color={INK3} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Nom, email…"
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 9, outline: 'none', background: CARD, color: INK, fontFamily: F, width: 260 }}
            onFocus={e => e.target.style.borderColor = 'rgba(21,19,15,0.25)'}
            onBlur={e => e.target.style.borderColor = BORDER} />
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Utilisateur', 'Email', 'Rôle', 'Plan', 'Inscription', 'Statut'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: INK3, padding: '48px' }}>Chargement…</td></tr>
            ) : page_users.length === 0 ? (
              <tr><td colSpan={6} style={{ ...td, textAlign: 'center', color: INK3, padding: '48px' }}>Aucun utilisateur trouvé</td></tr>
            ) : page_users.map(u => {
              const plan = plans.find(p => p.id === u.subscription_plan) || plans.find(p => p.id === 'free');
              const isPaid = u.subscription_plan && u.subscription_plan !== 'free';
              const init = (u.full_name || u.email || '?').slice(0, 1).toUpperCase();
              return (
                <tr key={u.id} onClick={() => setSelected(u)} style={{ cursor: 'pointer', background: CARD, transition: 'background 80ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F2EBD9'}
                  onMouseLeave={e => e.currentTarget.style.background = CARD}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: getUserColor(u), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{init}</div>
                      <span style={{ fontWeight: 500 }}>{u.full_name || '—'}</span>
                    </div>
                  </td>
                  <td style={{ ...td, color: INK2 }}>{u.email}</td>
                  <td style={td}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: u.role === 'admin' ? '#3B8BEB15' : 'rgba(21,19,15,0.05)', color: u.role === 'admin' ? '#3B8BEB' : INK3 }}>
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: isPaid ? '#7B4FE015' : 'rgba(21,19,15,0.05)', color: isPaid ? '#7B4FE0' : INK3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {plan?.name || 'Free'}
                    </span>
                  </td>
                  <td style={{ ...td, color: INK3, fontSize: 12 }}>
                    {new Date(u.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={td}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#22C55E12', color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Actif
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '12px 24px', borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: BG, flexShrink: 0 }}>
        <span style={{ fontSize: 12.5, color: INK3 }}>{filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ width: 30, height: 30, border: `1px solid ${BORDER}`, borderRadius: 7, background: CARD, cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.35 : 1 }}>
            <ChevronLeft size={14} color={INK} />
          </button>
          <span style={{ fontSize: 12.5, color: INK2 }}>{page} / {totalPages || 1}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            style={{ width: 30, height: 30, border: `1px solid ${BORDER}`, borderRadius: 7, background: CARD, cursor: page >= totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page >= totalPages ? 0.35 : 1 }}>
            <ChevronRight size={14} color={INK} />
          </button>
        </div>
      </div>

      {selected && (
        <UserDetailDrawer user={selected} open={!!selected} onClose={() => setSelected(null)} onUserUpdated={() => { load(); setSelected(null); }} />
      )}
    </div>
  );
}