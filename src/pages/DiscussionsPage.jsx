import { useState } from 'react';
import { User, CreditCard, Zap, ArrowLeft, Save, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const FG = '#0A0A0A';

function ProfileSection({ user, onSave }) {
  const [fullName, setFullName] = useState(user?.name || '');
  const [isDirty, setIsDirty] = useState(false);

  const handleNameChange = (value) => {
    setFullName(value);
    setIsDirty(value !== user?.name);
  };

  const handleSave = () => {
    onSave({ fullName });
    setIsDirty(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black mb-1" style={{ color: FG }}>Profile</h2>
        <p className="text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>Manage your account information</p>
      </div>

      <div className="space-y-5">
        {/* Email field */}
        <div>
          <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(0,0,0,0.5)' }}>
            Email <span className="font-normal" style={{ color: 'rgba(0,0,0,0.3)' }}>(read-only)</span>
          </label>
          <div className="px-4 py-3 rounded-xl border"
            style={{ 
              background: 'rgba(0,0,0,0.02)', 
              borderColor: 'rgba(0,0,0,0.07)',
              cursor: 'not-allowed'
            }}>
            <p className="text-sm" style={{ color: 'rgba(0,0,0,0.4)' }}>
              {user?.email || 'antoinevalton954@gmail.com'}
            </p>
          </div>
        </div>

        {/* Full name field */}
        <div>
          <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(0,0,0,0.5)' }}>
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border transition-all focus:outline-none focus:border-opacity-30"
            style={{ 
              background: 'white', 
              borderColor: 'rgba(0,0,0,0.1)',
              color: FG
            }}
            placeholder="Enter your full name"
          />
        </div>

        {/* Save button */}
        {isDirty && (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-xl transition-all hover:opacity-90"
            style={{ background: FG, color: 'white' }}>
            <Save className="w-3.5 h-3.5" />
            Save changes
          </motion.button>
        )}
      </div>
    </div>
  );
}

function PlanSection({ userPlan }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black mb-1" style={{ color: FG }}>Plan & Billing</h2>
        <p className="text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>Manage your subscription and billing</p>
      </div>

      <div className="p-5 rounded-xl border" 
        style={{ 
          background: 'rgba(0,0,0,0.02)', 
          borderColor: 'rgba(0,0,0,0.07)' 
        }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider mb-1" 
              style={{ color: 'rgba(0,0,0,0.4)' }}>Current plan</p>
            <p className="text-lg font-black" style={{ color: FG }}>
              {userPlan?.name || 'Free'}
            </p>
          </div>
          <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
            style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: '#10b981' 
            }}>
            Active
          </div>
        </div>
        
        <button className="w-full px-4 py-2.5 text-sm font-black rounded-xl transition-all"
          style={{ 
            background: 'rgba(0,0,0,0.05)', 
            color: FG 
          }}>
          Upgrade plan
        </button>
      </div>
    </div>
  );
}

function UsageSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black mb-1" style={{ color: FG }}>Usage</h2>
        <p className="text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>Track your API and conversation usage</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border"
          style={{ 
            background: 'white', 
            borderColor: 'rgba(0,0,0,0.07)' 
          }}>
          <p className="text-[10px] font-black uppercase tracking-wider mb-2"
            style={{ color: 'rgba(0,0,0,0.4)' }}>Conversations</p>
          <p className="text-2xl font-black" style={{ color: FG }}>24</p>
          <p className="text-[10px] mt-1" style={{ color: 'rgba(0,0,0,0.3)' }}>this month</p>
        </div>

        <div className="p-4 rounded-xl border"
          style={{ 
            background: 'white', 
            borderColor: 'rgba(0,0,0,0.07)' 
          }}>
          <p className="text-[10px] font-black uppercase tracking-wider mb-2"
            style={{ color: 'rgba(0,0,0,0.4)' }}>API calls</p>
          <p className="text-2xl font-black" style={{ color: FG }}>1.2k</p>
          <p className="text-[10px] mt-1" style={{ color: 'rgba(0,0,0,0.3)' }}>this month</p>
        </div>
      </div>
    </div>
  );
}

function DangerZone({ onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black mb-1" style={{ color: '#ef4444' }}>Danger zone</h2>
        <p className="text-xs" style={{ color: 'rgba(0,0,0,0.35)' }}>
          Irreversible actions - proceed with caution
        </p>
      </div>

      <div className="p-5 rounded-xl border" 
        style={{ 
          background: 'rgba(239, 68, 68, 0.03)', 
          borderColor: 'rgba(239, 68, 68, 0.2)' 
        }}>
        <p className="text-sm font-bold mb-2" style={{ color: FG }}>Delete account</p>
        <p className="text-xs mb-4" style={{ color: 'rgba(0,0,0,0.5)' }}>
          This action is irreversible. All your data will be permanently deleted.
        </p>
        
        {!showConfirm ? (
          <button 
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-black rounded-xl transition-all hover:opacity-90"
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444' 
            }}>
            <Trash2 className="w-3.5 h-3.5" />
            Delete account
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3">
            <p className="text-xs font-bold" style={{ color: '#ef4444' }}>
              Are you absolutely sure?
            </p>
            <div className="flex gap-2">
              <button 
                onClick={onDelete}
                className="flex-1 px-4 py-2.5 text-sm font-black rounded-xl transition-all hover:opacity-90"
                style={{ background: '#ef4444', color: 'white' }}>
                Yes, delete my account
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 text-sm font-black rounded-xl transition-all"
                style={{ 
                  background: 'rgba(0,0,0,0.05)', 
                  color: FG 
                }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, userPlan } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'plan', label: 'Plan & Billing', icon: CreditCard },
    { id: 'usage', label: 'Usage', icon: Zap },
  ];

  const handleSave = (data) => {
    console.log('Saving:', data);
    // Add your save logic here
  };

  const handleDelete = () => {
    console.log('Deleting account...');
    // Add your delete logic here
  };

  return (
    <div className="min-h-screen font-open" style={{ background: 'white' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-60"
            style={{ color: 'rgba(0,0,0,0.5)' }}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-3xl font-black mb-2" style={{ color: FG }}>Settings</h1>
          <p className="text-sm" style={{ color: 'rgba(0,0,0,0.35)' }}>
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="col-span-3">
            <nav className="sticky top-6 space-y-1">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all text-left"
                  style={{
                    background: activeSection === id ? 'rgba(0,0,0,0.04)' : 'transparent',
                    color: activeSection === id ? FG : 'rgba(0,0,0,0.4)',
                  }}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="col-span-9">
            <div className="max-w-2xl space-y-12">
              {activeSection === 'profile' && (
                <ProfileSection user={user} onSave={handleSave} />
              )}
              
              {activeSection === 'plan' && (
                <PlanSection userPlan={userPlan} />
              )}
              
              {activeSection === 'usage' && (
                <UsageSection />
              )}

              {/* Danger zone always at bottom */}
              {activeSection === 'profile' && (
                <div className="pt-8 border-t" style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
                  <DangerZone onDelete={handleDelete} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
