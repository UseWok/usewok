import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ExternalLink, Check, RefreshCw } from 'lucide-react';
import { getPlansConfig, savePlansConfig } from '@/lib/plans-config';
import { toast } from 'sonner';

const FADE = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPlans(getPlansConfig());
  }, []);

  const updateUrl = (planId, field, value) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, [field]: value } : p));
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
          <p className="text-xs text-white/30 mt-0.5">Configure checkout redirect URLs for each plan</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Changes
        </button>
      </div>

      <div className="space-y-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            variants={FADE}
            initial="hidden"
            animate="show"
            transition={{ delay: i * 0.07 }}
            className="bg-[#0d0e14] border border-white/[0.07] rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{plan.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{plan.name}</h3>
                    {plan.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/30 mt-0.5">
                    {plan.price_monthly === 0 ? 'Free' : `€${plan.price_monthly}/mo · €${plan.price_yearly}/yr`}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">
                  Monthly Checkout URL
                </label>
                <div className="flex gap-2">
                  <input
                    value={plan.checkout_url_monthly || ''}
                    onChange={e => updateUrl(plan.id, 'checkout_url_monthly', e.target.value)}
                    placeholder={plan.price_monthly === 0 ? 'Free plan — no URL needed' : 'https://buy.stripe.com/...'}
                    disabled={plan.price_monthly === 0}
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-30"
                  />
                  {plan.checkout_url_monthly && (
                    <a href={plan.checkout_url_monthly} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-colors flex-shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block mb-2">
                  Yearly Checkout URL
                </label>
                <div className="flex gap-2">
                  <input
                    value={plan.checkout_url_yearly || ''}
                    onChange={e => updateUrl(plan.id, 'checkout_url_yearly', e.target.value)}
                    placeholder={plan.price_yearly === 0 ? 'Free plan — no URL needed' : 'https://buy.stripe.com/...'}
                    disabled={plan.price_yearly === 0}
                    className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-30"
                  />
                  {plan.checkout_url_yearly && (
                    <a href={plan.checkout_url_yearly} target="_blank" rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-colors flex-shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Features preview */}
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              <p className="text-[11px] font-semibold text-white/25 uppercase tracking-wider mb-2">Features</p>
              <div className="flex flex-wrap gap-2">
                {plan.features?.slice(0, 6).map((f, j) => (
                  <span key={j} className="flex items-center gap-1 text-[11px] text-white/40 bg-white/[0.03] border border-white/[0.05] rounded-full px-2.5 py-1">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                    {f.text}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}