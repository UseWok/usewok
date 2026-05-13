import React, { useState, useEffect } from 'react';
import { getPlansConfig, loadPlansFromDB, COMPARISON_FEATURES } from '@/lib/plans-config';
import { useNavigate } from 'react-router-dom';

export default function UpgradePlanModal({ open, onClose, currentPlanId }) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(() => getPlansConfig());
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    if (!open) return;
    loadPlansFromDB().then(p => { if (p) setPlans(p); }).catch(() => {});
  }, [open]);

  if (!open) return null;

  const handleChoose = (plan) => {
    if (plan.id === currentPlanId) { onClose(); return; }
    if (plan.id === 'free') return;
    if (plan.checkout_url) { window.location.href = plan.checkout_url; }
  };

  const currentPlanObj = plans?.find(p => p.id === currentPlanId) || plans?.[0] || {};

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm font-sans">
      <div className="relative w-[95vw] h-[95vh] bg-white rounded-2xl shadow-2xl overflow-y-auto border border-gray-200 flex flex-col antialiased">
        
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-md transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="pt-16 pb-8 px-6 max-w-[1200px] mx-auto w-full flex-shrink-0">
          <h2 className="text-[36px] font-bold tracking-tight mb-2 text-[#0A0A0A]">Discover plans</h2>
          <p className="text-[16px] text-gray-500 mb-10">Compare all Stensor plans</p>
          
          <div className="mb-10 border border-gray-200 rounded-[16px] p-8 flex flex-col md:flex-row items-start justify-between bg-[#fcfcfc] shadow-sm">
            <div className="mb-4 md:mb-0">
              <h2 className="text-[13px] font-semibold text-gray-500 mb-3">Your current plan</h2>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] font-bold bg-white border border-gray-200 px-2 py-1 rounded">USD</span>
                <h3 className="text-xl font-bold">{currentPlanObj?.name || 'Free'}</h3>
              </div>
            </div>
            <div className="flex flex-col items-start bg-blue-50/50 p-5 rounded-xl border border-blue-100 w-full md:w-[350px]">
              <div className="flex items-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2383E2" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span className="text-[15px] font-bold text-[#2383E2]">Stensor AI</span>
              </div>
              <p className="text-[13px] text-gray-700 mb-4 leading-relaxed">
                Upgrade to a higher plan to search anywhere, automate meeting notes and more.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 w-full pb-16 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {(plans || []).map((plan) => {
              const isMax = plan.id === 'max';
              return (
                <div key={plan.id} className="flex flex-col bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-[#0A0A0A] mb-4 flex justify-between items-center">
                    {plan.name}
                    {plan.badge && <span className="bg-blue-100 text-[#2383E2] text-[10px] font-bold px-1.5 py-0.5 rounded-md">{plan.badge}</span>}
                  </h3>
                  
                  <div className="mb-5 h-[65px]">
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-[26px] font-bold leading-none">${plan.price_yearly === 0 ? '0' : plan.price_yearly.toFixed(2)}</span>
                    </div>
                    {plan.price_monthly > 0 ? (
                      <div className="text-[12px] text-gray-500 leading-snug mt-1">
                        per user/month, billed annually<br/>${plan.price_monthly.toFixed(2)} billed monthly
                      </div>
                    ) : (
                      <div className="text-[12px] text-gray-500 leading-snug mt-1">per user/month</div>
                    )}
                  </div>

                  <div className="flex-1 mb-6">
                    <p className="text-[12px] font-bold text-gray-900 mb-3">{plan.features_header}</p>
                    <ul className="space-y-3">
                      {(plan.features || []).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-gray-700 leading-snug">
                          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => handleChoose(plan)} 
                    className={`w-full py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                      isMax ? 'bg-[#2383E2] text-white hover:bg-[#1E70C1]' : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Join Waitlist
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}