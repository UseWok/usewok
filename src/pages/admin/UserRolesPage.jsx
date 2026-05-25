import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function UserRolesPage() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingRole, setAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [editingRoleId, setEditingRoleId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allUsers = await base44.entities.User.list();
      setUsers(allUsers || []);
      
      // Récupérer les rôles uniques
      const roleMap = {};
      allUsers.forEach(user => {
        const role = user.role || 'user';
        if (!roleMap[role]) {
          roleMap[role] = { name: role, count: 0, description: getRoleDescription(role) };
        }
        roleMap[role].count++;
      });
      
      setRoles(Object.values(roleMap));
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      admin: 'Administrateur avec accès complet au panneau d\'administration',
      user: 'Utilisateur standard avec accès aux fonctionnalités de base',
    };
    return descriptions[role] || 'Rôle personnalisé';
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      toast.error('Le nom du rôle est requis');
      return;
    }
    
    try {
      // Dans une vraie implémentation, on créerait le rôle dans une entité dédiée
      // Ici on simule l'ajout
      setRoles([...roles, { name: newRoleName, description: newRoleDescription, count: 0 }]);
      setNewRoleName('');
      setNewRoleDescription('');
      setAddingRole(false);
      toast.success('Rôle ajouté');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleDeleteRole = async (roleName) => {
    if (roleName === 'admin' || roleName === 'user') {
      toast.error('Impossible de supprimer les rôles système');
      return;
    }
    
    try {
      setRoles(roles.filter(r => r.name !== roleName));
      toast.success('Rôle supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-medium text-[#1A1A1A]">Gestion des rôles</h1>
        <button
          onClick={() => setAddingRole(true)}
          className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Ajouter un rôle
        </button>
      </div>

      <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Nom du rôle</th>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-[11px] font-medium text-[#888888] uppercase tracking-wider">Nombre d'utilisateurs</th>
              <th className="px-6 py-3 text-right text-[11px] font-medium text-[#888888] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {addingRole && (
              <tr className="bg-[#F0F9FF] border-b border-[#E5E5E5]">
                <td className="px-6 py-3">
                  <input
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Nom du rôle"
                    className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                    autoFocus
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                  />
                </td>
                <td className="px-6 py-3">
                  <span className="text-[13px] text-[#888888]">0</span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleAddRole}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setAddingRole(false);
                        setNewRoleName('');
                        setNewRoleDescription('');
                      }}
                      className="p-1.5 text-[#888888] hover:bg-[#F0F0F0] rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[13px] text-[#888888]">
                  Chargement...
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[13px] text-[#888888]">
                  Aucun rôle trouvé
                </td>
              </tr>
            ) : (
              roles.map((role, index) => (
                <tr key={role.name} className={index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'}>
                  <td className="px-6 py-3">
                    <span className="text-[13px] font-medium text-[#1A1A1A]">{role.name}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-[13px] text-[#888888]">{role.description}</span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#888888]" />
                      <span className="text-[13px] text-[#1A1A1A] font-medium">{role.count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingRoleId(role.name)}
                        className="p-1.5 text-[#888888] hover:bg-[#F0F0F0] rounded transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function X({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}