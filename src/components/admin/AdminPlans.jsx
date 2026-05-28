import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RefreshCw, Plus, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getPlansConfig, savePlansConfig } from '@/lib/plans-config';
import { toast } from 'sonner';

const FADE = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function FeatureEditor({ features = [], onChange }) {
  const addFeature = () => onChange([...features, { text: '' }]);
  const removeFeature = (i) => onChange(features.filter((_, idx) => idx !== i));
  const updateFeature = (i, val) => onChange(features.map((f, idx) => idx === i ? { ...f, text: val } : f));

  return (
    <div className="space-y-2">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-2">
          <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
          <input
            value={f.text}
            onChange={e => updateFeature(i, e.target.value)}
            placeholder="Feature description..."
            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button onClick={() => removeFeature(i)} className="text-white/30 hover:text-red-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={addFeature}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mt-1"
      >
        <Plus className="w-3 h-3" /> Add feature
      </button>
    </div>
  );
}

function PlanCard({ plan, index, onChange, onDelete }) {
  const [expanded, setExpanded] = useState(true);

  const set = (key, val) => onChange({ ...plan, [key]: val });

  return (
    <motion.div
      variants={FADE}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.97, y: -8 }}
      transition={{ delay: index * 0.07 }}
      className="bg-[#0d0e14] border border-white/[0.07] rounded-2xl overflow-hidden"
    >
      {/* Card Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{plan.name.charAt(0)}</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{plan.name}</span>
              {plan.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                  {plan.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-white/30 mt-0.5">
              {plan.price_monthly === 0 ? 'Free' : `€${plan.price_monthly}/mo · €${plan.price_yearly}/yr`}
              {plan.credits_limit ? ` · ${plan.credits_limit} credits` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-white/[0.05]">

              {/* Identity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
                <div>
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Plan Name</label>
                  <input
                    value={plan.name}
                    onChange={e => set('name', e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Badge (optional)</label>
                  <input
                    value={plan.badge || ''}
                    onChange={e => set('badge', e.target.value)}
                    placeholder="e.g. Popular"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Credits Limit / month</label>
                  <input
                    type="number"
                    value={plan.credits_limit ?? ''}
                    onChange={e => set('credits_limit', e.target.value === '' ? null : Number(e.target.value))}
                    placeholder="e.g. 500"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Monthly Price ($)</label>
                  <input
                    type="number"
                    value={plan.price_monthly ?? 0}
                    onChange={e => set('price_monthly', Number(e.target.value))}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Yearly Price ($)</label>
                  <input
                    type="number"
                    value={plan.price_yearly ?? 0}
                    onChange={e => set('price_yearly', Number(e.target.value))}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {/* Checkout URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Monthly Checkout URL</label>
                  <input
                    value={plan.checkout_url_monthly || ''}
                    onChange={e => set('checkout_url_monthly', e.target.value)}
                    placeholder={plan.price_monthly === 0 ? 'Free — no URL needed' : 'https://buy.stripe.com/...'}
                    disabled={plan.price_monthly === 0}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">Yearly Checkout URL</label>
                  <input
                    value={plan.checkout_url_yearly || ''}
                    onChange={e => set('checkout_url_yearly', e.target.value)}
                    placeholder={plan.price_yearly === 0 ? 'Free — no URL needed' : 'https://buy.stripe.com/...'}
                    disabled={plan.price_yearly === 0}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-30"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-3">Features</label>
                <FeatureEditor
                  features={plan.features || []}
                  onChange={feats => set('features', feats)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setPlans(getPlansConfig()); }, []);

  const updatePlan = (idx, updated) => {
    setPlans(prev => prev.map((p, i) => i === idx ? updated : p));
  };

  const deletePlan = (idx) => {
    setPlans(prev => prev.filter((_, i) => i !== idx));
    toast.success('Plan removed. Click "Save All Changes" to persist.');
  };

  const addPlan = () => {
    const newPlan = {
      id: `plan_${Date.now()}`,
      name: 'New Plan',
      price_monthly: 0,
      price_yearly: 0,
      checkout_url_monthly: '',
      checkout_url_yearly: '',
      features: [],
    };
    setPlans(prev => [...prev, newPlan]);
  };

  const handleSave = async () => {
    setSaving(true);
    savePlansConfig(plans);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success('Plans saved successfully.');
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Plans & Pricing</h2>
          <p className="text-xs text-white/30 mt-0.5">Edit plans, credits, features, and checkout URLs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addPlan}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.10] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Plan
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save All Changes
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {plans.map((plan, i) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            index={i}
            onChange={updated => updatePlan(i, updated)}
            onDelete={() => deletePlan(i)}
          />
        ))}
      </div>
    </div>
  );
}