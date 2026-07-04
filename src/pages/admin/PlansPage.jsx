import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, savePlansConfig, getPlansConfig } from '@/lib/plans-config';
import { toast } from 'sonner';
import {
  Plus, Trash2, Users, Check, Save, RefreshCw, ChevronDown, ChevronUp,
  Eye, EyeOff, X, GripVertical, ExternalLink, AlertCircle, Info
} from 'lucide-react';

const EMPTY_PLAN = {
  name: '',
  description: '',
  badge: '',
  price_monthly: 0,
  price_yearly: 0,
  credits_limit: 150000,
  chatbot_messages: 5,
  scans_per_period: 1,
  scan_period: 'month',
  max_sites: 1,
  history_days: 30,
  stripe_price_id_monthly: '',
  stripe_price_id_yearly: '',
  checkout_url_monthly: '',
  checkout_url_yearly: '',
  features_header: 'Inclus :',
  features: [],
  visible: true,
};

const INK = '#1A1A1A';
const BORDER = '#E5E5E5';
const SURFACE = '#F8F7F5';
const WHITE = '#FFFFFF';
const CORAL = '#F95738';
const GREEN = '#10B981';
const F = "'Inter', system-ui, sans-serif";

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
        background: value ? INK : '#D1D1D1', position: 'relative', transition: 'background 150ms', flexShrink: 0
      }}>
      <div style={{
        position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16,
        borderRadius: '50%', background: WHITE, transition: 'left 150ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#666', marginBottom: 4, fontFamily: F }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: '#999', marginLeft: 6 }}>{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inp = {
  width: '100%', padding: '8px 11px', border: `1px solid ${BORDER}`, borderRadius: 7,
  fontSize: 13, color: INK, outline: 'none', fontFamily: F, boxSizing: 'border-box', background: WHITE
};

function PlanForm({ plan, onChange, onDelete, subscriberCount, isNew }) {
  const [open, setOpen] = useState(isNew);

  const setField = (k, v) => onChange({ ...plan, [k]: v });

  const addFeature = () => setField('features', [...(plan.features || []), { text: '' }]);
  const removeFeature = (i) => setField('features', plan.features.filter((_, j) => j !== i));
  const updateFeature = (i, text) => {
    const f = [...plan.features];
    f[i] = { text };
    setField('features', f);
  };

  const monthlyEquiv = plan.price_yearly > 0 ? (plan.price_yearly / 12).toFixed(2) : null;
  const discount = plan.price_monthly > 0 && plan.price_yearly > 0
    ? Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100) : 0;

  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, background: WHITE, overflow: 'hidden', marginBottom: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer', background: open ? SURFACE : WHITE }}
        onClick={() => setOpen(o => !o)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: INK, fontFamily: F }}>{plan.name || <span style={{ color: '#AAA' }}>Nouveau plan</span>}</span>
            {plan.badge && <span style={{ fontSize: 10, fontWeight: 700, background: CORAL, color: WHITE, borderRadius: 20, padding: '2px 8px' }}>{plan.badge}</span>}
            {!plan.visible && <span style={{ fontSize: 10, color: '#AAA', fontWeight: 600 }}>masqué</span>}
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2, fontFamily: F }}>
            {plan.price_monthly === 0 ? 'Gratuit' : `${plan.price_monthly}€/mois`}
            {plan.price_yearly > 0 && ` · ${plan.price_yearly}€/an`}
            {discount > 0 && <span style={{ color: GREEN, marginLeft: 6 }}>−{discount}%</span>}
            <span style={{ marginLeft: 10, color: '#AAA' }}>· <Users size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />{subscriberCount} abonnés</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={e => { e.stopPropagation(); if (confirm(`Supprimer le plan "${plan.name}" ?`)) onDelete(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 7, color: '#CCC' }}
            title="Supprimer">
            <Trash2 size={14} />
          </button>
          {open ? <ChevronUp size={15} color="#AAA" /> : <ChevronDown size={15} color="#AAA" />}
        </div>
      </div>

      {open && (
        <div style={{ padding: '20px 18px 24px', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Col gauche */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#AAA', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, fontFamily: F }}>Identité</p>
              <Field label="Nom du plan *">
                <input value={plan.name} onChange={e => setField('name', e.target.value)} placeholder="ex: Starter" style={inp} />
              </Field>
              <Field label="Description" hint="(sous le prix)">
                <input value={plan.description || ''} onChange={e => setField('description', e.target.value)} placeholder="Idéal pour les indépendants" style={inp} />
              </Field>
              <Field label="Badge" hint="(optionnel, ex: Populaire)">
                <input value={plan.badge || ''} onChange={e => setField('badge', e.target.value)} placeholder="Populaire" style={inp} />
              </Field>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#555', fontFamily: F }}>Visible sur la page tarifs</span>
                <Toggle value={!!plan.visible} onChange={v => setField('visible', v)} />
              </div>

              <p style={{ fontSize: 10, fontWeight: 700, color: '#AAA', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 12px', fontFamily: F }}>Prix</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Prix mensuel (€)">
                  <input type="number" min="0" value={plan.price_monthly} onChange={e => setField('price_monthly', parseFloat(e.target.value) || 0)} style={inp} />
                </Field>
                <Field label="Prix annuel (€)" hint={monthlyEquiv ? `≈ ${monthlyEquiv}€/mois` : ''}>
                  <input type="number" min="0" value={plan.price_yearly} onChange={e => setField('price_yearly', parseFloat(e.target.value) || 0)} style={inp} />
                </Field>
              </div>
              {discount > 0 && (
                <div style={{ fontSize: 11, color: GREEN, fontWeight: 600, marginTop: -8, marginBottom: 12, fontFamily: F }}>
                  ✓ Économie de {discount}% par rapport au mensuel
                </div>
              )}
              <Field label="Crédits / mois">
                <input type="number" min="0" value={plan.credits_limit} onChange={e => setField('credits_limit', parseInt(e.target.value) || 0)} style={inp} />
              </Field>

              <p style={{ fontSize: 10, fontWeight: 700, color: '#AAA', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 12px', fontFamily: F }}>
                Limites réellement appliquées
              </p>
              <div style={{ background: '#FFF8F6', border: '1px solid #FFD5CC', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 11, color: '#B24B30', lineHeight: 1.6, fontFamily: F }}>
                <AlertCircle size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Ces valeurs bloquent réellement les utilisateurs (chatbot, scans, sites, historique) — contrairement aux "fonctionnalités affichées" ci-dessous qui ne sont que du texte marketing.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Messages chatbot / mois">
                  <input type="number" min="0" value={plan.chatbot_messages ?? 0} onChange={e => setField('chatbot_messages', parseInt(e.target.value) || 0)} style={inp} />
                </Field>
                <Field label="Sites surveillés max">
                  <input type="number" min="1" value={plan.max_sites ?? 1} onChange={e => setField('max_sites', parseInt(e.target.value) || 1)} style={inp} />
                </Field>
                <Field label="Scans autorisés / période">
                  <input type="number" min="0" value={plan.scans_per_period ?? 1} onChange={e => setField('scans_per_period', parseInt(e.target.value) || 0)} style={inp} />
                </Field>
                <Field label="Période du quota scan">
                  <select value={plan.scan_period || 'month'} onChange={e => setField('scan_period', e.target.value)} style={inp}>
                    <option value="day">Jour</option>
                    <option value="week">Semaine</option>
                    <option value="month">Mois</option>
                  </select>
                </Field>
                <Field label="Historique conservé (jours)">
                  <input type="number" min="1" value={plan.history_days ?? 30} onChange={e => setField('history_days', parseInt(e.target.value) || 30)} style={inp} />
                </Field>
              </div>
            </div>

            {/* Col droite */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#AAA', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, fontFamily: F }}>
                Stripe
                <a href="https://dashboard.stripe.com/products" target="_blank" rel="noreferrer"
                  style={{ marginLeft: 8, color: '#3B8BEB', fontSize: 10, fontWeight: 500, textDecoration: 'none' }}>
                  Ouvrir Stripe <ExternalLink size={9} style={{ verticalAlign: 'middle' }} />
                </a>
              </p>
              <div style={{ background: '#FFF8F6', border: '1px solid #FFD5CC', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 11, color: '#B24B30', lineHeight: 1.6, fontFamily: F }}>
                <AlertCircle size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Les Price IDs permettent le checkout automatique via Stripe. Format : <code>price_xxx</code>
              </div>
              <Field label="Price ID mensuel Stripe" hint="(price_xxx)">
                <input value={plan.stripe_price_id_monthly || ''} onChange={e => setField('stripe_price_id_monthly', e.target.value.trim())}
                  placeholder="price_1ABC..." style={{ ...inp, fontFamily: 'monospace', fontSize: 12 }} />
              </Field>
              <Field label="Price ID annuel Stripe" hint="(price_xxx)">
                <input value={plan.stripe_price_id_yearly || ''} onChange={e => setField('stripe_price_id_yearly', e.target.value.trim())}
                  placeholder="price_1DEF..." style={{ ...inp, fontFamily: 'monospace', fontSize: 12 }} />
              </Field>

              <p style={{ fontSize: 10, fontWeight: 700, color: '#AAA', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 12px', fontFamily: F }}>
                URLs directes <span style={{ fontSize: 9, fontWeight: 400 }}>(optionnel, remplace le checkout auto)</span>
              </p>
              <Field label="Checkout URL mensuel">
                <input value={plan.checkout_url_monthly || ''} onChange={e => setField('checkout_url_monthly', e.target.value)}
                  placeholder="https://buy.stripe.com/..." style={inp} />
              </Field>
              <Field label="Checkout URL annuel">
                <input value={plan.checkout_url_yearly || ''} onChange={e => setField('checkout_url_yearly', e.target.value)}
                  placeholder="https://buy.stripe.com/..." style={inp} />
              </Field>
            </div>
          </div>

          {/* Features */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#AAA', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, fontFamily: F }}>Fonctionnalités affichées</p>
            <Field label="En-tête" hint="(ex: Tout ce qui est dans Free, plus :)">
              <input value={plan.features_header || ''} onChange={e => setField('features_header', e.target.value)} style={inp} placeholder="Inclus :" />
            </Field>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(plan.features || []).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={12} color={GREEN} style={{ flexShrink: 0 }} />
                  <input value={typeof f === 'string' ? f : f.text || ''} onChange={e => updateFeature(i, e.target.value)}
                    placeholder="Ex: 1 000 000 crédits / mois"
                    style={{ ...inp, flex: 1, marginBottom: 0 }} />
                  <button onClick={() => removeFeature(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#CCC' }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addFeature}
              style={{ marginTop: 8, padding: '7px 14px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: F }}>
              <Plus size={12} /> Ajouter une fonctionnalité
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Build the stripe_price_map for the webhook (price_id → plan_id)
function buildPriceMap(plans) {
  const map = {};
  for (const plan of plans) {
    if (plan.stripe_price_id_monthly) map[plan.stripe_price_id_monthly] = plan.id;
    if (plan.stripe_price_id_yearly) map[plan.stripe_price_id_yearly] = plan.id;
  }
  return map;
}

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, dbPlans] = await Promise.all([base44.entities.User.list(), loadPlansFromDB()]);
      setUsers(allUsers || []);
      setPlans(dbPlans || getPlansConfig());
    } catch {
      setPlans(getPlansConfig());
    }
    setLoading(false);
    setDirty(false);
  };

  const updatePlan = (idx, updated) => {
    setPlans(p => { const n = [...p]; n[idx] = updated; return n; });
    setDirty(true);
  };

  const deletePlan = (idx) => {
    setPlans(p => p.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const addPlan = () => {
    setPlans(p => [...p, { ...EMPTY_PLAN, id: `plan_${Date.now()}` }]);
    setDirty(true);
  };

  const handleSave = async () => {
    const invalid = plans.filter(p => !p.name?.trim());
    if (invalid.length > 0) { toast.error('Chaque plan doit avoir un nom'); return; }
    setSaving(true);
    try {
      await savePlansConfig(plans);
      // Also save the stripe_price_map for the billing webhook
      const priceMap = buildPriceMap(plans);
      const existing = await base44.entities.AppSettings.filter({ key: 'stripe_price_map' });
      const val = JSON.stringify(priceMap);
      if (existing.length > 0) await base44.entities.AppSettings.update(existing[0].id, { value: val });
      else await base44.entities.AppSettings.create({ key: 'stripe_price_map', value: val, description: 'Mapping Stripe price_id → plan_id pour le webhook billing' });
      toast.success('Plans sauvegardés et mapping Stripe mis à jour');
      setDirty(false);
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde : ' + e.message);
    }
    setSaving(false);
  };

  const getSubscriberCount = (planId) => users.filter(u => u.subscription_plan === planId).length;

  if (loading) return (
    <div style={{ padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: F }}>
      <div style={{ width: 22, height: 22, border: `2px solid ${BORDER}`, borderTopColor: INK, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // Compute stripe map preview
  const priceMapPreview = buildPriceMap(plans);
  const mappedCount = Object.keys(priceMapPreview).length;

  return (
    <div style={{ padding: '32px 40px 80px', fontFamily: F, maxWidth: 900 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Gestion des forfaits</h1>
          <p style={{ fontSize: 12, color: '#888', margin: '4px 0 0', lineHeight: 1.4 }}>
            {plans.length} plan{plans.length !== 1 ? 's' : ''} · {users.length} utilisateurs
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={loadData} title="Recharger"
            style={{ padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555' }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={addPlan}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: SURFACE, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: INK, fontFamily: F }}>
            <Plus size={14} /> Nouveau plan
          </button>
          <button onClick={handleSave} disabled={saving || !dirty}
            style={{ padding: '8px 18px', border: 'none', borderRadius: 8, background: dirty ? INK : '#CCC', color: WHITE, cursor: dirty ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7, fontFamily: F }}>
            {saving ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: WHITE, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <Save size={14} />}
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Stripe map info */}
      <div style={{ background: mappedCount > 0 ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${mappedCount > 0 ? '#BBF7D0' : '#FDE68A'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
        <Info size={14} color={mappedCount > 0 ? GREEN : '#D97706'} style={{ flexShrink: 0 }} />
        <span style={{ color: mappedCount > 0 ? '#166534' : '#92400E', lineHeight: 1.6 }}>
          {mappedCount > 0
            ? <><strong>{mappedCount} price ID{mappedCount > 1 ? 's' : ''}</strong> Stripe configuré{mappedCount > 1 ? 's' : ''} → le webhook billing reconnaîtra automatiquement les paiements.</>
            : <>Aucun Price ID Stripe configuré. Ajoutez les <code style={{ background: '#FEF3C7', padding: '1px 4px', borderRadius: 4 }}>stripe_price_id_monthly</code> / <code style={{ background: '#FEF3C7', padding: '1px 4px', borderRadius: 4 }}>stripe_price_id_yearly</code> pour activer le checkout automatique.</>
          }
        </span>
      </div>

      {/* Plans */}
      {plans.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#AAA', fontSize: 14 }}>
          Aucun plan. Cliquez sur "Nouveau plan" pour commencer.
        </div>
      )}

      {plans.map((plan, idx) => (
        <PlanForm
          key={plan.id || idx}
          plan={plan}
          onChange={(updated) => updatePlan(idx, updated)}
          onDelete={() => deletePlan(idx)}
          subscriberCount={getSubscriberCount(plan.id)}
          isNew={!plan.name}
        />
      ))}

      {dirty && (
        <div style={{ position: 'fixed', bottom: 24, right: 32, zIndex: 100 }}>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '12px 24px', borderRadius: 10, background: INK, color: WHITE, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontFamily: F }}>
            {saving ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: WHITE, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <Save size={15} />}
            Sauvegarder les modifications
          </button>
        </div>
      )}
    </div>
  );
}