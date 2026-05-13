import { useState, useEffect } from 'react';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { useNavigate } from 'react-router-dom';

export default function UpgradePlanModal({ open, onClose, currentPlanId }) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(() => getPlansConfig());
  const [billing, setBilling] = useState('monthly');

  useEffect(() => {
    if (!open) return;
    loadPlansFromDB().then(p => { if (p) setPlans(p); }).catch(() => {});
  }, [open]);

  if (!open) return null;

  const handleChoose = (plan) => {
    if (plan.id === currentPlanId) { onClose(); return; }
    if (plan.id === 'enterprise') { window.location.href = 'mailto:contact@yoursite.com'; return; }
    
    // REDIRECTION DIRECTE VERS STRIPE
    const checkoutUrl = billing === 'yearly' ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (checkoutUrl) { window.location.href = checkoutUrl; }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm font-sans">
      <div className="relative w-[95vw] h-[95vh] bg-white rounded-xl shadow-2xl overflow-y-auto border border-gray-200 flex flex-col">
        
        {/* Sticky Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-md transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="pt-16 pb-8 px-6 text-center max-w-4xl mx-auto flex-shrink-0">
          <h2 className="text-3xl font-bold tracking-tight mb-3 text-[#0A0A0A]">Upgrade your plan</h2>
          <p className="text-[15px] text-gray-500 max-w-2xl mx-auto mb-8">Unlock the full power of Stensor for your workflow.</p>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`text-[14px] font-medium cursor-pointer ${billing === 'monthly' ? 'text-black' : 'text-gray-400'}`} onClick={() => setBilling('monthly')}>Monthly</span>
            <button className="w-10 h-5 rounded-full bg-gray-200 relative" onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${billing === 'yearly' ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`flex items-center gap-2 text-[14px] font-medium cursor-pointer ${billing === 'yearly' ? 'text-black' : 'text-gray-400'}`} onClick={() => setBilling('yearly')}>
              Annually <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">SAVE 20%</span>
            </span>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto px-6 w-full pb-16 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-l border-gray-200">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlanId === plan.id;
              const price = plan.price_monthly === 'Custom' ? 'Custom' : (billing === 'yearly' ? plan.price_yearly : plan.price_monthly);

              return (
                <div key={plan.id} className="flex flex-col p-6 border-b border-r border-gray-200 bg-white">
                  <h3 className="text-lg font-bold mb-2 text-[#0A0A0A]">{plan.name}</h3>
                  <p className="text-[13px] text-gray-500 mb-6 h-10">{plan.description}</p>
                  
                  <div className="mb-6 h-12">
                    {price === 'Custom' ? (
                      <span className="text-2xl font-bold">Contact us</span>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-bold">${price}</span>
                        {price !== 0 && <span className="text-gray-500 text-[12px] mb-1">/ user / mo</span>}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleChoose(plan)}
                    className={`w-full py-2 rounded-md text-[13px] font-medium mb-6 transition-colors ${
                      isCurrentPlan ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                      plan.id === 'pro' || plan.id === 'max' ? 'bg-[#0A0A0A] text-white hover:bg-black/80' : 
                      'bg-white border border-gray-300 hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    {isCurrentPlan ? 'Current Plan' : (plan.id === 'enterprise' ? 'Contact sales' : 'Upgrade')}
                  </button>

                  <div className="flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">
                      {plan.id === 'free' ? 'Features include:' : `Everything in ${plans[plans.findIndex(p => p.id === plan.id)-1].name}, plus:`}
                    </p>
                    <ul className="space-y-2.5">
                      {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                          <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}