import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Shield, Globe, Star, Crown, Plus, X as XIcon } from 'lucide-react';
import CodesTab from '@/components/admin/CodesTab';

const PLAN_ICONS = { free: Zap, essential: Shield, advanced: Globe, expert: Star, supreme: Crown };

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-10 h-5 flex-shrink-0 rounded-full transition-colors ${value ? 'bg-fg' : 'bg-black/10'}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white shadow rounded-full transition-transform ${value ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

function FieldToggle({ plan, fieldKey, label, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Toggle value={!!plan[fieldKey]} onChange={v => onChange({ ...plan, [fieldKey]: v })} />
    </div>
  );
}

function FieldNumber({ plan, fieldKey, label, onChange, min = 0 }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input type="number" min={min} value={plan[fieldKey]}
        onChange={e => onChange({ ...plan, [fieldKey]: parseInt(e.target.value) || 0 })}
        className="w-20 text-right text-xs px-2 py-1 border border-border rounded-sm bg-muted/50 focus:outline-none" />
    </div>
  );
}

export default function PlanEditor({ plan, onChange, onActivate, isCurrentPlan }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = PLAN_ICONS[plan.id] || Zap;

  return (
    <div className="bg-white border border-border rounded-sm overflow-hidden">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-muted/30 transition-colors">
        <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-sm ${isCurrentPlan ? 'bg-yuzu' : 'bg-muted'}`}>
          <Icon className={`w-4 h-4 ${isCurrentPlan ? 'text-fg' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-fg">{plan.name}</p>
            {isCurrentPlan && <span className="text-[9px] font-black px-2 py-0.5 tracking-wider bg-yuzu text-fg rounded-sm">YOUR PLAN</span>}
          </div>
          <p className="text-xs text-muted-foreground">{plan.price_monthly}$/mo · {plan.credits_limit} credits</p>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentPlan && (
            <button onClick={(e) => { e.stopPropagation(); onActivate(); }}
              className="px-3 py-1.5 text-xs font-bold bg-fg text-white rounded-sm hover:opacity-90 transition-opacity">
              Activate (test)
            </button>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-2 border-t border-border">
              {/* Activation codes */}
              <div className="mb-4 pb-4 space-y-3 border-b border-border">
                <CodesTab planId={plan.id} planName={plan.name} billing="monthly" />
                <CodesTab planId={plan.id} planName={plan.name} billing="yearly" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <div className="md:col-span-2 mb-4 pb-4 border-b border-border">
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">Identity</p>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground mb-1 block">Plan name</label>
                      <input value={plan.name || ''} onChange={e => onChange({ ...plan, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-border rounded-sm focus:outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground mb-1 block">Short description (shown on card)</label>
                      <input value={plan.description || ''} onChange={e => onChange({ ...plan, description: e.target.value })}
                        placeholder="e.g. Perfect for beginners" className="w-full px-3 py-2 text-sm border border-border rounded-sm focus:outline-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">Pricing</p>
                  <FieldNumber plan={plan} fieldKey="price_monthly" label="Monthly price ($)" onChange={onChange} />
                  <FieldNumber plan={plan} fieldKey="price_yearly" label="Yearly price ($)" onChange={onChange} />
                  <FieldNumber plan={plan} fieldKey="credits_limit" label="Flash / month" onChange={onChange} min={1} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 text-muted-foreground">Features</p>
                  <FieldToggle plan={plan} fieldKey="internet_access" label="Internet search" onChange={onChange} />
                  <FieldToggle plan={plan} fieldKey="file_upload" label="File upload" onChange={onChange} />
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-xs text-muted-foreground">Upload type</span>
                    <div className="flex gap-1">
                      {['basic', 'extended'].map(opt => (
                        <button key={opt} onClick={() => onChange({ ...plan, file_upload_extended: opt === 'extended' })}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-sm transition-colors ${(opt === 'extended' ? plan.file_upload_extended : !plan.file_upload_extended) ? 'bg-fg text-white' : 'bg-muted text-muted-foreground'}`}>
                          {opt === 'basic' ? 'Basic (img/txt)' : 'Full (all formats)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <FieldToggle plan={plan} fieldKey="premium_support" label="Premium support" onChange={onChange} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 mt-3 text-muted-foreground">Consumption</p>
                  <FieldNumber plan={plan} fieldKey="credits_limit" label="Flash / month" onChange={onChange} min={1} />
                  <FieldNumber plan={plan} fieldKey="deep_credits_limit" label="Deep Syntheses / month (0=unlimited)" onChange={onChange} />
                  <FieldNumber plan={plan} fieldKey="flash_cost" label="Flash cost per message" onChange={onChange} min={1} />
                  <FieldNumber plan={plan} fieldKey="deep_cost" label="Deep Synthesis cost" onChange={onChange} min={1} />
                  <FieldNumber plan={plan} fieldKey="daily_credits_limit" label="Daily limit (0=unlimited)" onChange={onChange} />
                  <FieldNumber plan={plan} fieldKey="max_discussions" label="Max discussions (0=unlimited)" onChange={onChange} />
                </div>
                <div className="md:col-span-2 mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Tier options (prix custom)</p>
                    <button onClick={() => onChange({ ...plan, tier_options: [...(plan.tier_options || []), { label: '', price_monthly: null, price_yearly: null, checkout_url_monthly: '', checkout_url_yearly: '' }] })}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-fg text-white rounded-sm hover:opacity-90">
                      <Plus className="w-3 h-3" /> Ajouter
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mb-3">Chaque tier peut avoir son propre prix et lien checkout. Si vide, utilise le prix de base du plan.</p>
                  <div className="space-y-3">
                    {(plan.tier_options || []).map((opt, i) => {
                      const option = typeof opt === 'string' ? { label: opt } : (opt || {});
                      const update = (field, val) => { const opts = [...(plan.tier_options || [])]; opts[i] = { ...option, [field]: val }; onChange({ ...plan, tier_options: opts }); };
                      return (
                        <div key={i} className="p-3 border border-border rounded-sm bg-muted/20 space-y-2">
                          <div className="flex items-center gap-2">
                            <input value={option.label || ''} onChange={e => update('label', e.target.value)}
                              placeholder="Label (ex: 1.2k Flash/mois)" className="flex-1 px-2 py-1.5 text-xs border border-border rounded-sm focus:outline-none" />
                            <button onClick={() => { const opts = (plan.tier_options || []).filter((_, j) => j !== i); onChange({ ...plan, tier_options: opts }); }}
                              className="w-6 h-6 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded-sm flex-shrink-0">
                              <XIcon className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-muted-foreground mb-1 block">Prix mensuel ($)</label>
                              <input type="number" value={option.price_monthly || ''} onChange={e => update('price_monthly', parseFloat(e.target.value) || null)}
                                placeholder="ex: 200" className="w-full px-2 py-1.5 text-xs border border-border rounded-sm focus:outline-none" />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground mb-1 block">Prix annuel ($)</label>
                              <input type="number" value={option.price_yearly || ''} onChange={e => update('price_yearly', parseFloat(e.target.value) || null)}
                                placeholder="ex: 170" className="w-full px-2 py-1.5 text-xs border border-border rounded-sm focus:outline-none" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">Checkout URL (mensuel)</label>
                            <input value={option.checkout_url_monthly || ''} onChange={e => update('checkout_url_monthly', e.target.value)}
                              placeholder="https://buy.stripe.com/..." className="w-full px-2 py-1.5 text-xs border border-border rounded-sm focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground mb-1 block">Checkout URL (annuel)</label>
                            <input value={option.checkout_url_yearly || ''} onChange={e => update('checkout_url_yearly', e.target.value)}
                              placeholder="https://buy.stripe.com/..." className="w-full px-2 py-1.5 text-xs border border-border rounded-sm focus:outline-none" />
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/40 mt-1">
                            <div>
                              <label className="text-[10px] text-muted-foreground mb-1 block">Badge promo</label>
                              <input value={option.discount_badge || ''} onChange={e => update('discount_badge', e.target.value)}
                                placeholder="-10%" className="w-full px-2 py-1.5 text-xs border border-border rounded-sm focus:outline-none" />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground mb-1 block">Flash/mo (0=plan)</label>
                              <input type="number" value={option.credits_limit || ''} onChange={e => update('credits_limit', parseInt(e.target.value) || 0)}
                                placeholder="0" className="w-full px-2 py-1.5 text-xs border border-border rounded-sm focus:outline-none" />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground mb-1 block">Deep/mo (0=plan)</label>
                              <input type="number" value={option.deep_credits_limit || ''} onChange={e => update('deep_credits_limit', parseInt(e.target.value) || 0)}
                                placeholder="0" className="w-full px-2 py-1.5 text-xs border border-border rounded-sm focus:outline-none" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {(plan.tier_options || []).length === 0 && (
                      <p className="text-[10px] text-muted-foreground/50 italic">Aucun tier — le plan utilise son prix de base.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}