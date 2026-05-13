import { useState, useEffect } from 'react';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';
import { useNavigate } from 'react-router-dom';

export default function UpgradePlanModal({ open, onClose, currentPlanId }) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(() => getPlansConfig());
  const [billing, setBilling] = useState('yearly');

  useEffect(() => {
    if (!open) return;
    loadPlansFromDB().then(p => { if (p) setPlans(p); }).catch(() => {});
  }, [open]);

  if (!open) return null;

  const handleChoose = (plan) => {
    if (plan.id === currentPlanId) { onClose(); return; }
    if (plan.id === 'free') return;
    const checkoutUrl = billing === 'yearly' ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (checkoutUrl) { window.location.href = checkoutUrl; }
  };

  const getButtonState = (planId) => {
    const planIndex = plans.findIndex(p => p.id === planId);
    const currentIndex = plans.findIndex(p => p.id === currentPlanId);
    if (planId === currentPlanId) return { text: "Forfait actuel", class: "bg-gray-100 text-gray-500 cursor-default" };
    if (planIndex > currentIndex) return { text: "Passer à un forfait supérieur", class: "bg-[#2383E2] text-white hover:bg-[#1E70C1]" };
    return { text: "Passer à un forfait inférieur", class: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50" };
  };

  const currentPlanObj = plans.find(p => p.id === currentPlanId) || plans[0];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm font-sans">
      <div className="relative w-[95vw] h-[95vh] bg-white rounded-xl shadow-2xl overflow-y-auto border border-gray-200 flex flex-col">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-md transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="pt-16 pb-8 px-6 max-w-[1200px] mx-auto w-full flex-shrink-0">
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-[#0A0A0A]">Découvrir les forfaits</h2>
          <p className="text-[15px] text-gray-500 mb-10">Comparez tous les forfaits Stensor</p>
          
          {/* BANNER IN MODAL */}
          <div className="mb-10 border border-gray-200 rounded-[12px] p-6 flex flex-col md:flex-row items-start justify-between bg-white shadow-sm">
            <div className="mb-4 md:mb-0">
              <h2 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Votre forfait actuel</h2>
              <h3 className="text-xl font-bold mb-2">{currentPlanObj.name}</h3>
              <p className="text-[14px] text-gray-600 mb-2">Pour organiser tous les aspects de votre vie</p>
            </div>
            <div className="flex flex-col items-start bg-gray-50 p-4 rounded-xl border border-gray-200 w-full md:w-[350px]">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2383E2" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span className="text-[14px] font-bold">IA de Stensor</span>
              </div>
              <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">
                Passez à un forfait supérieur pour automatiser et chercher plus vite.
              </p>
            </div>
          </div>

          {/* TOGGLE */}
          <div className="flex items-center justify-end gap-3 mb-6">
            <span className={`text-[14px] font-medium ${billing === 'monthly' ? 'text-black' : 'text-gray-500'}`} onClick={() => setBilling('monthly')}>Mensuel</span>
            <button className="w-11 h-6 rounded-full bg-gray-200 relative" onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${billing === 'yearly' ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`text-[14px] font-medium ${billing === 'yearly' ? 'text-black' : 'text-gray-500'}`} onClick={() => setBilling('yearly')}>Annuel</span>
          </div>
        </div>

        {/* GRID IN MODAL (NO BORDERS) */}
        <div className="max-w-[1200px] mx-auto px-6 w-full pb-16 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {plans.map((plan) => {
              const btnState = getButtonState(plan.id);
              const mainPrice = billing === 'yearly' ? plan.price_yearly : plan.price_monthly;
              const subPrice = billing === 'yearly' ? plan.price_monthly : plan.price_yearly;

              return (
                <div key={plan.id} className="flex flex-col bg-white">
                  <div className="flex items-center gap-2 mb-4 h-[24px]">
                    <h3 className="text-[20px] font-bold text-[#0A0A0A]">{plan.name}</h3>
                    {plan.badge === 'Populaire' && <span className="bg-[#EBF5FF] text-[#2383E2] text-[10px] font-bold px-1.5 py-0.5 rounded-sm">Populaire</span>}
                    {plan.badge === 'Limited' && <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">Limited</span>}
                  </div>
                  
                  <div className="mb-5 h-[90px]">
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-[32px] font-bold leading-none">{mainPrice} €</span>
                    </div>
                    <p className="text-[12px] text-gray-500 leading-tight mb-2">par membre et par mois</p>
                    {plan.price_monthly > 0 && (
                      <div className="text-[11px] text-gray-500 leading-tight">
                        {billing === 'yearly' ? <>{subPrice} € facturation mensuelle</> : <>{subPrice} € facturation annuelle</>}
                      </div>
                    )}
                  </div>

                  <button onClick={() => handleChoose(plan)} className={`w-full py-2 rounded-[8px] text-[13px] font-medium mb-6 transition-colors ${btnState.class}`}>
                    {btnState.text}
                  </button>

                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-gray-900 mb-3 whitespace-pre-line leading-snug">{plan.features_header}</p>
                    <ul className="space-y-3">
                      {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-gray-700">
                          {f.prefix ? (
                            <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-1 py-0.5 rounded flex-shrink-0">{f.prefix}</span>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                          <span className="leading-snug">
                            {f.text}
                            {f.tag && <span className="ml-1.5 bg-[#E6F4EA] text-[#16A34A] text-[9px] font-bold px-1 py-0.5 rounded-sm">{f.tag}</span>}
                          </span>
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