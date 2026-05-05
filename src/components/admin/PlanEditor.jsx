import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap, Shield, Globe, Star, Crown } from 'lucide-react';
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
                  <FieldToggle plan={plan} fieldKey="can_choose_model" label="Choose AI model" onChange={onChange} />
                  <FieldToggle plan={plan} fieldKey="internet_access" label="Internet search" onChange={onChange} />
                  <FieldToggle plan={plan} fieldKey="ultimate_access" label="Ultimate mode" onChange={onChange} />
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
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 mt-3 text-muted-foreground">Limits</p>
                  <FieldNumber plan={plan} fieldKey="max_discussions" label="Max discussions (0=unlimited)" onChange={onChange} />
                  <FieldNumber plan={plan} fieldKey="daily_credits_limit" label="AI replies/day (0=unlimited)" onChange={onChange} />
                  <FieldNumber plan={plan} fieldKey="lessons_per_month" label="Lessons/month" onChange={onChange} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 mt-3 text-muted-foreground">Allowed AI modes</p>
                  {[{ id: 'thinking', label: 'Standard (1T)' }, { id: 'pro', label: 'Advanced (2T)' }, { id: 'ultimate', label: 'Expert (4T)' }].map(({ id: modeId, label: modeLabel }) => (
                    <div key={modeId} className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-xs text-muted-foreground">{modeLabel}</span>
                      <Toggle
                        value={plan.allowed_modes?.includes(modeId)}
                        onChange={v => {
                          const modes = plan.allowed_modes || [];
                          onChange({ ...plan, allowed_modes: v ? [...modes, modeId] : modes.filter(m => m !== modeId) });
                        }} />
                    </div>
                  ))}
                </div>
                <div className="md:col-span-2 mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] font-black uppercase tracking-wider mb-1 text-muted-foreground">Gammes déroulantes (tier options)</p>
                  <p className="text-[10px] text-muted-foreground/60 mb-2">Une option par ligne — format: "Label | Sous-label" (ex: 1.2k Crédits | /mois)</p>
                  <textarea
                    value={(plan.tier_options || []).map(o => `${o.label} | ${o.sublabel}`).join('\n')}
                    onChange={e => {
                      const opts = e.target.value.split('\n').filter(l => l.trim()).map(l => {
                        const [label = '', sublabel = '/mois'] = l.split('|').map(s => s.trim());
                        return { label, sublabel };
                      });
                      onChange({ ...plan, tier_options: opts });
                    }}
                    rows={3}
                    placeholder={"1.2k Crédits mensuels | /mois\n50k Crédits d'intégration | /mois"}
                    className="w-full px-3 py-2 text-xs border border-border rounded-sm bg-muted/30 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}