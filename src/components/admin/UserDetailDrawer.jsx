import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Mail, Shield, Calendar, CreditCard, Key, Ban, UserX, Trash2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getPlansConfig } from '@/lib/plans-config';
import { toast } from 'sonner';
import { getUserColor } from '@/lib/user-color';

export default function UserDetailDrawer({ user, open, onClose, onUserUpdated }) {
  const [editedUser, setEditedUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(user.subscription_plan);
  const [planExpiry, setPlanExpiry] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditedUser(user);
    setSelectedPlan(user.subscription_plan);
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await base44.entities.User.update(user.id, editedUser);
      toast.success('Utilisateur mis à jour');
      setIsEditing(false);
      onUserUpdated();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error('Veuillez indiquer un motif');
      return;
    }
    setLoading(true);
    try {
      await base44.entities.User.update(user.id, { disabled: true, suspension_reason: suspendReason });
      toast.success('Utilisateur suspendu');
      setSuspendReason('');
      onUserUpdated();
    } catch (error) {
      toast.error('Erreur lors de la suspension');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      await base44.entities.User.update(user.id, { disabled: false });
      toast.success('Utilisateur réactivé');
      onUserUpdated();
    } catch (error) {
      toast.error('Erreur lors de la réactivation');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      toast.error('Veuillez indiquer un motif');
      return;
    }
    setLoading(true);
    try {
      await base44.entities.User.update(user.id, { banned: true, ban_reason: banReason });
      toast.success('Utilisateur banni');
      setBanReason('');
      onUserUpdated();
    } catch (error) {
      toast.error('Erreur lors du bannissement');
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    setLoading(true);
    try {
      await base44.entities.User.update(user.id, { banned: false });
      toast.success('Utilisateur débanni');
      onUserUpdated();
    } catch (error) {
      toast.error('Erreur lors du débannissement');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlan = async () => {
    setLoading(true);
    try {
      const plans = getPlansConfig();
      const plan = plans.find(p => p.id === selectedPlan);
      await base44.entities.User.update(user.id, {
        subscription_plan: selectedPlan,
        credits_limit: plan?.credits_limit || 10,
        subscription_date: new Date().toISOString(),
      });
      toast.success('Abonnement assigné');
      onUserUpdated();
    } catch (error) {
      toast.error('Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      // Simuler l'envoi d'un email de reset
      await base44.entities.User.update(user.id, { password_reset_requested: true });
      toast.success('Email de réinitialisation envoyé');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'CONFIRMER') {
      toast.error('Veuillez taper "CONFIRMER" pour supprimer');
      return;
    }
    setLoading(true);
    try {
      await base44.entities.User.delete(user.id);
      toast.success('Utilisateur supprimé');
      onClose();
      onUserUpdated();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const plans = getPlansConfig();
  const userInitial = user.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  const isBanned = user.banned || false;
  const isSuspended = user.disabled && !isBanned;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-[1000]"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-[1001] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
              <h2 className="text-[16px] font-medium text-[#1A1A1A]">Profil utilisateur</h2>
              <button onClick={onClose} className="p-2 hover:bg-[#F7F7F8] rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#888888]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Avatar & Basic Info */}
              <div className="flex items-center gap-4 pb-6 border-b border-[#E5E5E5]">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0"
                  style={{ backgroundColor: getUserColor(user) }}
                >
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        value={editedUser.full_name || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, full_name: e.target.value })}
                        className="w-full px-3 py-1.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                        placeholder="Nom complet"
                      />
                      <input
                        value={editedUser.email || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                        className="w-full px-3 py-1.5 text-[14px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                        placeholder="Email"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-[16px] font-medium text-[#1A1A1A] truncate">{user.full_name || '—'}</p>
                      <p className="text-[13px] text-[#888888] truncate">{user.email}</p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={loading}
                  className="p-2 hover:bg-[#F7F7F8] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isEditing ? <Save className="w-4 h-4 text-[#1A1A1A]" /> : <Pencil className="w-4 h-4 text-[#888888]" />}
                </button>
              </div>

              {/* Account Info */}
              <div className="space-y-3">
                <h3 className="text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider">Informations du compte</h3>
                
                <InfoRow label="Rôle" value={user.role === 'admin' ? 'Administrateur' : 'Utilisateur'} />
                <InfoRow label="Statut" value={isBanned ? 'Banni' : isSuspended ? 'Suspendu' : 'Actif'} />
                <InfoRow label="Date d'inscription" value={new Date(user.created_date).toLocaleDateString('fr-FR')} />
                <InfoRow label="Dernière connexion" value={user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR') : '—'} />
                <InfoRow label="IP actuelle" value={user.current_ip || '—'} />
              </div>

              {/* Subscription */}
              <div className="space-y-3 pt-4 border-t border-[#E5E5E5]">
                <h3 className="text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider">Abonnement</h3>
                
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="flex-1 px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignPlan}
                    disabled={loading}
                    className="px-3 py-2 text-[13px] font-medium bg-[#1A1A1A] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    Assigner
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={planExpiry}
                    onChange={(e) => setPlanExpiry(e.target.value)}
                    className="flex-1 px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-[#E5E5E5]">
                <h3 className="text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider">Actions</h3>
                
                <button
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border border-[#E5E5E5] rounded-lg hover:bg-[#F7F7F8] disabled:opacity-50 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Envoyer email de réinitialisation
                </button>

                {!isSuspended && !isBanned ? (
                  <button
                    onClick={() => handleSuspend()}
                    disabled={loading}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 disabled:opacity-50 transition-colors"
                  >
                    <UserX className="w-4 h-4" />
                    Suspendre le compte
                  </button>
                ) : (
                  <button
                    onClick={handleReactivate}
                    disabled={loading}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Réactiver le compte
                  </button>
                )}

                {!isBanned ? (
                  <button
                    onClick={() => handleBan()}
                    disabled={loading}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                    Bannir le compte
                  </button>
                ) : (
                  <button
                    onClick={handleUnban}
                    disabled={loading}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Débannir le compte
                  </button>
                )}

                <div className="pt-3 border-t border-[#E5E5E5]">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[13px] font-medium">Zone de danger</span>
                  </div>
                  <input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="Tapez CONFIRMER"
                    className="w-full px-3 py-2 text-[13px] border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 mb-2"
                  />
                  <button
                    onClick={handleDelete}
                    disabled={loading || deleteConfirm !== 'CONFIRMER'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer définitivement
                  </button>
                </div>
              </div>

              {/* Reason inputs */}
              {(isSuspended || isBanned) && (
                <div className="pt-3 border-t border-[#E5E5E5]">
                  <p className="text-[12px] text-[#888888] mb-2">
                    Motif : {isSuspended ? user.suspension_reason : user.ban_reason}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[#888888]">{label}</span>
      <span className="text-[13px] text-[#1A1A1A] font-medium">{value}</span>
    </div>
  );
}

function Pencil({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}