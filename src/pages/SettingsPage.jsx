import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { X, Download, Check, Clock, Calendar, MessageCircle, Scan, Settings } from 'lucide-react';
import { writeAuditLog } from '@/lib/serverGuard';
import AISettingsModal from '@/components/settings/AISettingsModal';
import { getUserPlan, getPlansConfig } from '@/lib/plans-config';
import { getWokFeatures } from '@/lib/wok-plans';

import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

const inputStyle = {
  width: '100%',
  background: '#F5F5F3',
  border: '1px solid rgba(0,0,0,0.10)',
  borderRadius: 6,
  padding: '7px 10px',
  fontSize: 13,
  color: '#111',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
};

function SettingRow({ label, description, children, noBorder = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', gap: 24,
      borderBottom: noBorder ? 'none' : '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 400, color: '#111', margin: 0, lineHeight: 1.4 }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '2px 0 0', lineHeight: 1.4 }}>{description}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 15, fontWeight: 600, color: '#111', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
      {children}
    </h2>
  );
}

function Badge({ color = 'green', children }) {
  const colors = {
    green: { bg: 'rgba(34,197,94,0.1)', text: '#16a34a' },
    yellow: { bg: 'rgba(245,158,11,0.1)', text: '#d97706' },
    red: { bg: 'rgba(239,68,68,0.1)', text: '#dc2626' },
    blue: { bg: 'rgba(59,130,246,0.1)', text: '#2563eb' },
    coral: { bg: 'rgba(249,87,56,0.1)', text: '#F95738' },
  };
  const c = colors[color] || colors.green;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: c.bg, color: c.text, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {children}
    </span>
  );
}

function PreferencesPanel({ user, profile, onSave }) {
  const [prefs, setPrefs] = useState(() => {
    if (!profile?.user_preferences) return { tech_level: 'no_code', main_goal: 'more_clients', trade: '', maturity: '' };
    try {
      return JSON.parse(profile.user_preferences);
    } catch {
      return { tech_level: 'no_code', main_goal: 'more_clients', trade: '', maturity: '' };
    }
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      await base44.entities.BusinessProfile.update(profile.id, {
        user_preferences: JSON.stringify(prefs),
      });
      toast.success('Préférences sauvegardées');
      if (onSave) onSave(); // Trigger reload in parent
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const techLevels = [
    { key: 'no_code', label: 'Sans code (Wix, WordPress, Squarespace)', desc: 'Interface cliquable simple' },
    { key: 'ai_nocode', label: 'Avec ChatGPT/Claude', desc: 'Prompts prêts à copier-coller' },
    { key: 'developer', label: 'Développeur', desc: 'Code exact, JSON-LD, API' },
  ];

  const goals = [
    { key: 'more_clients', label: 'Plus de clients' },
    { key: 'local_visibility', label: 'Visibilité locale' },
    { key: 'brand_authority', label: 'Autorité secteur' },
  ];

  if (!profile) return null;

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <SectionTitle>Préférences Personnalisées</SectionTitle>
      <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px', lineHeight: 1.5 }}>
        Ces préférences personnalisent les corrections UseWok et les prompts IA pour s'adapter à votre profil.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8, color: '#111' }}>Profil technique</label>
        <select
          value={prefs.tech_level}
          onChange={(e) => setPrefs({ ...prefs, tech_level: e.target.value })}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {techLevels.map(t => (
            <option key={t.key} value={t.key}>{t.label} • {t.desc}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8, color: '#111' }}>Objectif principal</label>
        <select
          value={prefs.main_goal}
          onChange={(e) => setPrefs({ ...prefs, main_goal: e.target.value })}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {goals.map(g => (
            <option key={g.key} value={g.key}>{g.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8, color: '#111' }}>Secteur d'activité</label>
        <input
          type="text"
          placeholder="Ex: Plomberie, Graphisme, Fitness..."
          value={prefs.trade || ''}
          onChange={(e) => setPrefs({ ...prefs, trade: e.target.value })}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 8, color: '#111' }}>Maturité business</label>
        <select
          value={prefs.maturity || ''}
          onChange={(e) => setPrefs({ ...prefs, maturity: e.target.value })}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="">--</option>
          <option value="solo">Solo/Freelance</option>
          <option value="startup">Startup (1-5 personnes)</option>
          <option value="pme">PME (5-50 personnes)</option>
          <option value="enterprise">Entreprise (50+)</option>
        </select>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          padding: '8px 14px',
          background: saving ? '#ccc' : '#111',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          cursor: saving ? 'default' : 'pointer',
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
      </button>
    </div>
  );
}

function CodeRedeemer({ user, setUser }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRedeem = async () => {
    setError(''); setSuccess('');
    if (!code.trim()) { setError('Entrez un code.'); return; }
    setLoading(true);
    try {
      const results = await base44.entities.AccessCode.filter({ code: code.trim().toUpperCase(), visible: true });
      const usable = results.filter(r => !r.used || r.unlimited || (r.max_uses && (r.use_count || 0) < r.max_uses));
      if (usable.length === 0) {
        const any = await base44.entities.AccessCode.filter({ code: code.trim().toUpperCase() });
        setError(any.length > 0 ? 'Ce code a déjà été utilisé.' : 'Code invalide.');
        setLoading(false); return;
      }
      const rec = usable[0];
      if (rec.plan_id) {
        const plans = getPlansConfig();
        const newPlan = plans.find(p => p.id === rec.plan_id);
        const billing = rec.billing || 'monthly';
        if (newPlan) {
          await base44.auth.updateMe({
            subscription_plan: newPlan.id, credits_limit: newPlan.credits_limit || 150_000,
            credits_used: 0, billing_cycle: billing, subscription_date: new Date().toISOString(),
            credits_reset_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
          });
          setSuccess(`Plan ${newPlan.name} activated!`);
          toast.success(`Plan ${newPlan.name} activated`);
        }
      } else if (rec.credits > 0) {
        await base44.auth.updateMe({ credits_bonus: (user?.credits_bonus || 0) + rec.credits });
        setSuccess(`+${rec.credits} credits added!`);
        toast.success(`+${rec.credits} credits`);
      }
      const historyEntry = { email: user?.email, userId: user?.id, at: new Date().toISOString() };
      const existingHistory = (() => { try { return JSON.parse(rec.used_by_history || '[]'); } catch { return []; } })();
      existingHistory.push(historyEntry);
      if (rec.unlimited) {
        await base44.entities.AccessCode.update(rec.id, { use_count: (rec.use_count || 0) + 1, used_by: user?.email, used_by_history: JSON.stringify(existingHistory) });
      } else {
        await base44.entities.AccessCode.update(rec.id, { used: true, used_by: user?.email, use_count: (rec.use_count || 0) + 1, used_by_history: JSON.stringify(existingHistory) });
      }
      writeAuditLog(user?.id, { action: 'save', resource_type: 'AccessCode', resource_id: rec.id, status: 'success', metadata: { code: rec.code, plan_id: rec.plan_id, credits: rec.credits, email: user?.email } }).catch(() => {});
      if (!rec.unlimited && (!rec.max_uses || (rec.use_count || 0) + 1 >= rec.max_uses)) {
        base44.entities.AccessCode.delete(rec.id).catch(() => {});
      }
      const updated = await base44.auth.me();
      if (setUser) setUser(updated);
      setCode('');
    } catch (e) {
      writeAuditLog(user?.id || 'anonymous', { action: 'save', resource_type: 'AccessCode', resource_id: 'failed_redemption', status: 'failed', error_message: e?.message || 'Validation error', metadata: { attempted_code: code.trim(), email: user?.email } }).catch(() => {});
      setError('Erreur de validation.');
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={code} onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); setSuccess(''); }}
          placeholder="XXXX-XXXX-XXXX" maxLength={24}
          onKeyDown={e => { if (e.key === 'Enter') handleRedeem(); }}
          style={{ ...inputStyle, flex: 1, border: `1px solid ${error ? '#ef4444' : 'rgba(0,0,0,0.10)'}` }} />
        <button onClick={handleRedeem} disabled={loading || !code.trim()}
          style={{ padding: '7px 14px', background: code.trim() ? '#111' : '#F0F0EE', color: code.trim() ? '#fff' : '#aaa', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: code.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
          {loading ? '…' : 'Activer'}
        </button>
      </div>
      {error && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 5 }}>{error}</p>}
      {success && <p style={{ fontSize: 11, color: '#16a34a', marginTop: 5, display: 'flex', alignItems: 'center', gap: 3 }}><Check style={{ width: 10, height: 10 }} />{success}</p>}
    </div>
  );
}

// ── Auto-scan toggle ──────────────────────────────────────────────────────────
function AutoScanToggle({ user }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (user?.auto_scan_enabled !== undefined) setEnabled(!!user.auto_scan_enabled);
  }, [user?.auto_scan_enabled]);

  const planId = user?.subscription_plan || 'free';
  const planLabel = planId === 'pro' ? 'Pro (30/mois)' : planId === 'starter' ? 'Starter (12/mois)' : 'Free (1/mois)';

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    try { await base44.auth.updateMe({ auto_scan_enabled: next }); } catch {}
  };

  return (
    <SettingRow
      label="Lancement automatique des scans"
      description={`Les scans seront planifiés automatiquement selon votre forfait · ${planLabel}`}
      noBorder
    >
      <button
        onClick={toggle}
        style={{
          width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
          background: enabled ? '#111' : 'rgba(0,0,0,0.12)',
          transition: 'background 200ms', position: 'relative', flexShrink: 0,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          position: 'absolute', top: 3, left: enabled ? 21 : 3,
          transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        }} />
      </button>
    </SettingRow>
  );
}

function getRenewalDate(user) {
  const base = user?.subscription_date || user?.created_date;
  if (!base) return null;
  const d = new Date(base);
  const now = new Date();
  const yearly = user?.billing_cycle === 'yearly';
  if (yearly) { while (d <= now) d.setFullYear(d.getFullYear() + 1); }
  else { while (d <= now) d.setMonth(d.getMonth() + 1); }
  return d;
}

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const formatK = n => n >= 1000 ? `${Math.round(n / 1000)}k` : String(n ?? 0);

function CreditsGauge({ used, limit }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f97316' : '#111';
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#555' }}>{formatK(used)} utilisés</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{formatK(limit)} total</span>
      </div>
      <div style={{ height: 10, background: '#EBEBEA', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>{pct}% consommés</span>
        <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>{formatK(Math.max(0, limit - used))} restants</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div style={{
      background: accent ? '#111' : '#F9F9F8',
      border: `1px solid ${accent ? '#111' : 'rgba(0,0,0,0.07)'}`,
      borderRadius: 10, padding: '14px 16px',
    }}>
      <p style={{ fontSize: 11, fontWeight: 500, color: accent ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: accent ? '#fff' : '#111', margin: '0 0 2px', letterSpacing: '-0.02em' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: accent ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)', margin: 0 }}>{sub}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, refreshUser: refreshAuthUser } = useAuth();
  const activeSection = new URLSearchParams(location.search).get('section') || 'profile';

  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState(null);
  const [fullName, setFullName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [invoiceRequested, setInvoiceRequested] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAIDNAModal, setShowAIDNAModal] = useState(false);
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [cancelTicket, setCancelTicket] = useState(null);
  const [chatMsgsUsed, setChatMsgsUsed] = useState(0);
  const [scansUsed, setScansUsed] = useState(0);
  const [profiles, setProfiles] = useState([]);

  const loadUser = (u) => {
    if (!u) return;
    setUser(u); setFullName(u?.full_name || ''); setInvoiceEmail(u?.email || '');
    setUserPlan(getUserPlan(u));
    if (u?.email) {
      base44.entities.SupportTicket.filter({ category: 'cancellation', user_email: u.email }).then(ts => {
        if (ts.length > 0) setCancelTicket(ts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0]);
      }).catch(() => {});
    }
    // Usage counts loaded from cloud in separate useEffect
  };

  const handleSetUser = async (u) => {
    if (u) loadUser(u);
    if (refreshAuthUser) { const freshUser = await refreshAuthUser(); if (freshUser) loadUser(freshUser); }
  };

  useEffect(() => {
    if (authUser?.id) loadUser(authUser);
    else base44.auth.me().then(loadUser).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load BusinessProfiles for preferences panel
  useEffect(() => {
    if (!user?.id) return;
    base44.entities.BusinessProfile.filter({ created_by_id: user.id }).then(setProfiles).catch(() => setProfiles([]));
  }, [user?.id]);

  // Load usage counts from cloud (replaces localStorage)
  useEffect(() => {
    if (!user?.id) return;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    (async () => {
      try {
        const convs = await base44.entities.Conversation.list('-updated_at', 100);
        const used = convs.reduce((acc, conv) => {
          let msgs = [];
          try { msgs = JSON.parse(conv.messages_json || '[]'); } catch {}
          return acc + msgs.filter(m => m.role === 'user' && m.ts >= monthStart).length;
        }, 0);
        setChatMsgsUsed(used);
      } catch { setChatMsgsUsed(0); }
      try {
        const ledger = await base44.entities.CreditLedger.filter({ user_id: user.id, action: 'SCAN' });
        setScansUsed(ledger.filter(l => new Date(l.timestamp).getTime() >= monthStart).length);
      } catch { setScansUsed(0); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isYearly = user?.billing_cycle === 'yearly';
  const planFeatures = getWokFeatures(user);
  const chatLimit = planFeatures?.chatbot_messages || 5;
  const scanLimit = planFeatures?.scans_per_period || 1;
  const scansRemaining = Math.max(0, scanLimit - scansUsed);
  const scanPct = scanLimit > 0 ? Math.min(100, Math.round((scansUsed / scanLimit) * 100)) : 0;
  const chatRemaining = Math.max(0, chatLimit - chatMsgsUsed);
  const chatPct = chatLimit > 0 ? Math.min(100, Math.round((chatMsgsUsed / chatLimit) * 100)) : 0;

  const saveProfile = async () => {
    setProfileError('');
    if (!fullName.trim() || fullName.trim().length < 2) { setProfileError('Name must be at least 2 characters.'); return; }
    if (!user) return;
    setSavingProfile(true);
    await base44.auth.updateMe({ full_name: fullName.trim() });
    setSavingProfile(false);
    toast.success('Profile updated');
  };

  const requestInvoice = async () => {
    if (!user || !invoiceEmail.trim()) return;
    setInvoiceLoading(true);
    await base44.entities.SupportTicket.create({
      title: `Invoice request — ${user.full_name || user.email}`,
      description: `Invoice request for plan ${userPlan?.name}. Email: ${invoiceEmail.trim()}`,
      category: 'invoice', status: 'open', user_email: user.email,
      user_name: user.full_name || user.email, user_plan: userPlan?.name,
      invoice_email: invoiceEmail.trim(), messages_json: JSON.stringify([]),
    });
    setInvoiceLoading(false); setShowInvoiceModal(false);
    setInvoiceRequested(p => ({ ...p, [userPlan?.name]: true }));
    toast.success('Invoice request sent');
  };

  const deleteAccount = async () => {
    if (!user) return;
    await base44.entities.User.delete(user.id);
    base44.auth.logout();
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 20, height: 20, border: '2px solid #E5E5E0', borderTopColor: '#999', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const sectionTitles = { profile: 'Profil', usage: 'Utilisation', plan: 'Facturation', integrations: 'Intégrations' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px 80px', background: '#F8F7F5', fontFamily: 'Inter, system-ui, sans-serif', scrollbarWidth: 'none' }}>
      <div style={{ maxWidth: 620 }}>

        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111', margin: '0 0 28px', letterSpacing: '-0.02em' }}>
          {sectionTitles[activeSection] || 'Settings'}
        </h1>

        {/* ── PROFILE ── */}
        {activeSection === 'profile' && (
          <div>
            {/* Primary domain preferences */}
            {profiles && profiles.length > 0 && (
              <PreferencesPanel 
                user={user} 
                profile={profiles[0]} 
                onSave={() => base44.entities.BusinessProfile.filter({ created_by_id: user.id }).then(setProfiles).catch(() => {})}
              />
            )}

            <SectionTitle>Général</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <SettingRow label="Email" description="Votre adresse email de connexion — non modifiable.">
                <input value={user?.email || ''} disabled style={{ ...inputStyle, width: 220, opacity: 0.5, cursor: 'not-allowed', background: '#F0F0EE' }} />
              </SettingRow>
              <SettingRow label="Nom complet" description="Votre nom d'affichage dans l'application." noBorder>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input value={fullName} onChange={e => setFullName(e.target.value)}
                      style={{ ...inputStyle, width: 200, border: `1px solid ${profileError ? '#ef4444' : 'rgba(0,0,0,0.10)'}` }} />
                    <button onClick={saveProfile} disabled={savingProfile}
                      style={{ padding: '7px 13px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', opacity: savingProfile ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                      {savingProfile ? 'Enregistrement…' : 'Sauvegarder'}
                    </button>
                  </div>
                  {profileError && <p style={{ fontSize: 11, color: '#ef4444', margin: 0 }}>{profileError}</p>}
                </div>
              </SettingRow>
            </div>

            <div style={{ height: 28 }} />
            <SectionTitle>Intégrations</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <SettingRow label="Google Drive" description="Importez vos documents depuis Drive pour enrichir le contexte de WOK AI." noBorder>
                <button onClick={() => { window.location.href = '/wok-ai'; }}
                  style={{ padding: '7px 13px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  Ouvrir WOK AI
                </button>
              </SettingRow>
            </div>

            <div style={{ height: 28 }} />
            <SectionTitle>Notifications</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <SettingRow label="Emails marketing" description="Rapports, conseils et séquences d'onboarding par email." noBorder>
                <button
                  onClick={async () => {
                    const next = !user?.email_unsubscribed;
                    await base44.auth.updateMe({ email_unsubscribed: next });
                    setUser(u => ({ ...u, email_unsubscribed: next }));
                    toast.success(next ? 'Emails désactivés' : 'Emails réactivés');
                  }}
                  style={{
                    width: 42, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', padding: 2,
                    background: user?.email_unsubscribed ? 'rgba(0,0,0,0.12)' : '#111',
                    transition: 'background 200ms', position: 'relative', flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3, left: user?.email_unsubscribed ? 3 : 21,
                    transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                  }} />
                </button>
              </SettingRow>
            </div>

            <div style={{ height: 28 }} />
            <SectionTitle>Zone dangereuse</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <SettingRow label="Supprimer le compte" description="Supprime définitivement votre compte et toutes les données associées. Irréversible." noBorder>
                <button onClick={() => setShowDeleteModal(true)}
                  style={{ padding: '7px 14px', background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  Supprimer le compte
                </button>
              </SettingRow>
            </div>
          </div>
        )}

        {/* ── USAGE ── */}
        {activeSection === 'usage' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              <StatCard label="Plan actuel" value={userPlan?.name || 'Free'} sub={isYearly ? 'Annuel' : 'Mensuel'} accent />
              <StatCard label="Sites surveillés" value={`${planFeatures?.max_sites || 1}`} sub="max simultanément" />
            </div>

            <SectionTitle>Analyses de site ce mois</SectionTitle>
            <div style={{ marginTop: 8, background: '#F9F9F8', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '16px 18px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Scan style={{ width: 16, height: 16, color: '#555' }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>{scansUsed} <span style={{ fontWeight: 400, color: '#888', fontSize: 13 }}>/ {scanLimit} {planFeatures?.scan_period === 'day' ? 'analyses par jour' : 'analyses ce mois'}</span></p>
                  <p style={{ fontSize: 12, color: scansRemaining === 0 ? '#ef4444' : '#888', margin: '2px 0 0' }}>
                    {scansRemaining === 0 ? 'Quota atteint — passez à un plan supérieur' : `${scansRemaining} restante${scansRemaining > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              <div style={{ height: 8, background: '#EBEBEA', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${scanPct}%`, background: scanPct >= 90 ? '#ef4444' : scanPct >= 70 ? '#f97316' : '#111', borderRadius: 999, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>{scanPct}% utilisé</span>
                <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>{planFeatures?.scan_type === 'lite' ? 'Analyse rapide' : 'Analyse complète'} · {planFeatures?.engines_count || 1} moteur{(planFeatures?.engines_count || 1) > 1 ? 's' : ''}</span>
              </div>
            </div>

            <SectionTitle>Messages WOK AI ce mois</SectionTitle>
            <div style={{ marginTop: 8, background: '#F9F9F8', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageCircle style={{ width: 16, height: 16, color: '#555' }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>{chatMsgsUsed} <span style={{ fontWeight: 400, color: '#888', fontSize: 13 }}>/ {chatLimit} messages</span></p>
                  <p style={{ fontSize: 12, color: chatRemaining === 0 ? '#ef4444' : '#888', margin: '2px 0 0' }}>
                    {chatRemaining === 0 ? 'Quota épuisé — passez à un plan supérieur' : `${chatRemaining} restants ce mois`}
                  </p>
                </div>
              </div>
              <div style={{ height: 8, background: '#EBEBEA', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${chatPct}%`, background: chatPct >= 90 ? '#ef4444' : chatPct >= 70 ? '#f97316' : '#111', borderRadius: 999, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>{chatPct}% utilisé</span>
                <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>Reset le 1er du mois</span>
              </div>
            </div>

            <div style={{ height: 28 }} />
            <SectionTitle>Scans automatiques</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <AutoScanToggle user={user} />
            </div>

            <div style={{ height: 28 }} />
            <SectionTitle>Cycle de facturation</SectionTitle>
            <div style={{ marginTop: 8 }}>
              {getRenewalDate(user) && (
                <SettingRow label="Prochain renouvellement" description="Le quota de messages se réinitialise à cette date.">
                  <span style={{ fontSize: 13, color: '#444', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar style={{ width: 12, height: 12, color: '#999' }} />
                    {formatDate(getRenewalDate(user))}
                  </span>
                </SettingRow>
              )}
              <SettingRow label="Début du cycle" description="Date de début de votre abonnement actuel." noBorder>
                <span style={{ fontSize: 13, color: '#444' }}>{formatDate(user?.subscription_date || user?.created_date)}</span>
              </SettingRow>
            </div>
          </div>
        )}

        {/* ── INTEGRATIONS ── */}
        {activeSection === 'integrations' && (
          <div>
            <SectionTitle>Google Drive</SectionTitle>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', margin: '4px 0 16px', lineHeight: 1.5 }}>
              Importez vos documents Google Drive directement dans WOK AI pour enrichir l'analyse et le contexte de l'IA.
            </p>
            <div style={{ background: '#F9F9F8', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 3px' }}>Connecter Google Drive</p>
                <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: 0 }}>
                  Sélectionnez vos fichiers depuis WOK AI via le bouton "+" dans la barre de saisie.
                </p>
              </div>
              <button onClick={() => { window.location.href = '/wok-ai'; }}
                style={{ padding: '8px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Ouvrir WOK AI →
              </button>
            </div>
            <div style={{ marginTop: 12, padding: '12px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#16a34a', margin: 0 }}>
                ✓ Pour importer : ouvrez WOK AI, cliquez sur <strong>"+"</strong> dans la barre de saisie, puis choisissez <strong>"Google Drive"</strong>.
              </p>
            </div>
          </div>
        )}

        {/* ── BILLING ── */}
        {activeSection === 'plan' && (
          <div>
            <SectionTitle>Abonnement</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <SettingRow label="Plan actuel" description={isYearly ? 'Facturé annuellement' : userPlan?.price_monthly > 0 ? 'Facturé mensuellement' : 'Gratuit pour toujours'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{userPlan?.name || 'Free'}</span>
                  {isYearly && <Badge color="coral">Yearly</Badge>}
                  {!isYearly && userPlan?.price_monthly > 0 && <Badge color="blue">Monthly</Badge>}
                </div>
              </SettingRow>

              {getRenewalDate(user) && userPlan?.price_monthly > 0 && (
                <SettingRow label="Prochain renouvellement" description="Votre plan se renouvelle automatiquement à cette date.">
                  <span style={{ fontSize: 13, color: '#444', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock style={{ width: 12, height: 12, color: '#999' }} />
                    {formatDate(getRenewalDate(user))}
                  </span>
                </SettingRow>
              )}
              <SettingRow label="Gérer le plan" description="Passer à un plan supérieur, inférieur ou annuler votre abonnement." noBorder>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => navigate('/manage-plan')}
                    style={{ padding: '7px 13px', background: '#F5F5F3', color: '#555', border: '1px solid rgba(0,0,0,0.10)', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    Gérer
                  </button>
                  <button onClick={() => navigate('/pricing')}
                    style={{ padding: '7px 14px', background: '#111', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Passer Pro
                  </button>
                </div>
              </SettingRow>
            </div>

            <div style={{ height: 28 }} />
            <SectionTitle>Code d'accès</SectionTitle>
            <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', margin: '4px 0 12px', lineHeight: 1.5 }}>Activez un code pour débloquer un plan ou ajouter des crédits.</p>
            <CodeRedeemer user={user} setUser={handleSetUser} />

            {userPlan?.price_monthly > 0 && (
              <>
                <div style={{ height: 28 }} />
                <SectionTitle>Historique de facturation</SectionTitle>
                <div style={{ marginTop: 8 }}>
                  <SettingRow
                    label={userPlan.name}
                    description={`Since ${formatDate(user?.subscription_date || user?.created_date)}`}
                    noBorder
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {cancelTicket?.cancel_status === 'pending' && <Badge color="yellow">Annulation en cours</Badge>}
                      {cancelTicket?.cancel_status === 'approved' && <Badge color="red">Annulé</Badge>}
                      {!cancelTicket && <Badge color="green">Actif</Badge>}
                      <button onClick={() => setShowInvoiceModal(true)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#F5F5F3', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 5, fontSize: 12, fontWeight: 500, color: invoiceRequested[userPlan.name] ? '#16a34a' : '#555', cursor: 'pointer' }}>
                        <Download style={{ width: 11, height: 11 }} />
                        {invoiceRequested[userPlan.name] ? 'Envoyé' : 'Facture'}
                      </button>
                    </div>
                  </SettingRow>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      <AISettingsModal open={showAIDNAModal} onClose={() => setShowAIDNAModal(false)} />

      {showInvoiceModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowInvoiceModal(false); }}>
          <div style={{ width: '100%', maxWidth: 380, background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>Demander une facture</p>
              <button onClick={() => setShowInvoiceModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X style={{ width: 14, height: 14 }} /></button>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: '0 0 12px', lineHeight: 1.5 }}>Entrez l'email utilisé pour votre paiement.</p>
              <input value={invoiceEmail} onChange={e => setInvoiceEmail(e.target.value)} placeholder="email@example.com" style={{ ...inputStyle, marginBottom: 12 }} />
              <button onClick={requestInvoice} disabled={invoiceLoading || !invoiceEmail.trim()}
                style={{ width: '100%', padding: '9px 0', background: '#111', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: invoiceLoading || !invoiceEmail.trim() ? 0.5 : 1 }}>
                {invoiceLoading ? 'Envoi…' : 'Envoyer la demande'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
          <div style={{ width: '100%', maxWidth: 380, background: '#fff', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.05)', borderBottom: '1px solid rgba(239,68,68,0.12)' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', margin: 0 }}>Supprimer le compte</p>
            </div>
            <div style={{ padding: 18 }}>
              <p style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)', margin: '0 0 12px', lineHeight: 1.5 }}>Cette action est irréversible. Toutes vos données seront définitivement supprimées.</p>
              <div style={{ background: '#F9F9F8', borderRadius: 6, padding: '8px 11px', marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: '#666', margin: 0 }}>Account: <strong style={{ color: '#111' }}>{user?.email}</strong></p>
              </div>
              <button onClick={deleteAccount} style={{ width: '100%', padding: '9px 0', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 8 }}>
                Confirmer la suppression
              </button>
              <button onClick={() => setShowDeleteModal(false)} style={{ width: '100%', padding: '9px 0', background: 'transparent', color: '#666', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}