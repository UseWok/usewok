import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import CodesTableEditor from './CodesTableEditor';

const FG = '#0A0A0A';

export default function PlanCodesSection({ planId, planName, billing = 'monthly' }) {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ActivationCode.filter({ plan_id: planId, billing });
      setCodes(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [planId, billing]);

  const usedCodes = codes.filter(c => c.used);
  const availCodes = codes.filter(c => !c.used);
  const billingLabel = billing === 'yearly' ? 'Annuels' : 'Mensuels';

  return (
    <div className="border rounded-sm overflow-hidden bg-white" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/2 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: FG }}>{planName} — Codes {billingLabel}</p>
          {!loading && (
            <p className="text-[11px] mt-0.5" style={{ color: '#999' }}>
              {availCodes.length} dispo · {usedCodes.length} utilisés · {codes.length} total
            </p>
          )}
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 flex-shrink-0"
          style={{ background: billing === 'yearly' ? 'rgba(58,0,136,0.08)' : 'rgba(0,0,0,0.05)', color: billing === 'yearly' ? '#3A0088' : '#666', borderRadius: '3px' }}>
          {billingLabel}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>
              <CodesTableEditor
                planId={planId}
                billing={billing}
                codes={codes}
                onCodesUpdate={setCodes}
                saving={loading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}