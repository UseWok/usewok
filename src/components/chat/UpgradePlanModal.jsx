import { useState, useEffect } from 'react';
import React from 'react';
import { getPlansConfig, loadPlansFromDB, COMPARISON_FEATURES } from '@/lib/plans-config';
import { useNavigate } from 'react-router-dom';

export default function UpgradePlanModal({ open, onClose, currentPlanId }) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState(() => getPlansConfig());
  const [billing, setBilling] = useState('yearly');
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    if (!open) return;
    loadPlansFromDB().then(p => { if (p) setPlans(p); }).catch(() => {});
  }, [open]);

  if (!open) return null;

  const handleChoose = (plan) => {
    if (plan.id === currentPlanId) { onClose(); return; }
    if (plan.id === 'free') return;
    if (plan.id === 'unlimited') { window.location.href = plan.checkout_url_yearly; return; }
    const checkoutUrl = billing === 'yearly' ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (checkoutUrl) { window.location.href = checkoutUrl; }
  };

  const getButtonState = (planId) => {
    const planIndex = plans.findIndex(p => p.id === planId);
    const currentIndex = plans.findIndex(p => p.id === currentPlanId);
    if (planId === currentPlanId) return { text: "Current plan", class: "bg-gray-100 text-gray-500 cursor-default border border-gray-200" };
    if (planId === 'unlimited') return { text: "Contact sales", class: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50" };
    if (planIndex > currentIndex) return { text: "Upgrade", class: "bg-[#2383E2] text-white hover:bg-[#1E70C1] border border-transparent" };
    return { text: "Downgrade", class: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50" };
  };

  const currentPlanObj = plans.find(p => p.id === currentPlanId) || plans[0];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm font-sans">
      <div className="relative w-[95vw] h-[95vh] bg-white rounded-xl shadow-2xl overflow-y-auto border border-gray-200 flex flex-col">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-md transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="pt-12 pb-6 px-6 text-center max-w-6xl mx-auto w-full">
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-[#0A0A0A]">Discover plans</h2>
          <p className="text-[14px] text-gray-500 mb-8">Compare all Stensor plans</p>
          
          <div className="mb-8 text-left">
            <h2 className="text-[13px] font-semibold text-gray-900 mb-2">Your current plan</h2>
            <div className="border border-gray-200 rounded-lg p-5 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{currentPlanObj.name}</h3>
                <p className="text-[12px] text-gray-500">To organize all aspects of your financial life.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 w-full pb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 border-t border-l border-gray-200">
            {plans.map((plan) => {
              const price = plan.price_monthly === 'Custom' ? 'Custom' : (billing === 'yearly' ? plan.price_yearly : plan.price_monthly);
              const btnState = getButtonState(plan.id);

              return (
                <div key={plan.id} className="flex flex-col p-5 border-b border-r border-gray-200 bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[#0A0A0A]">{plan.name}</h3>
                    {plan.badge && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">{plan.badge}</span>}
                  </div>
                  
                  <div className="mb-5 h-[60px]">
                    {price === 'Custom' ? (
                      <div className="mt-3"><span className="text-[13px] text-gray-600">Contact us for pricing</span></div>
                    ) : (
                      <div className="mt-1">
                        <div className="flex items-end gap-1 mb-0.5">
                          <span className="text-[12px] text-gray-500 mb-1">$</span>
                          <span className="text-xl font-bold leading-none">{price}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-tight">per user/month</p>
                      </div>
                    )}
                  </div>

                  <button onClick={() => handleChoose(plan)} className={`w-full py-2 rounded-md text-[12px] font-medium mb-6 transition-colors ${btnState.class}`}>
                    {btnState.text}
                  </button>

                  <div className="flex-1">
                    <p className="text-[12px] font-bold text-gray-900 mb-2.5">{plan.features_header}</p>
                    <ul className="space-y-2">
                      {plan.features?.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[12px] text-gray-600">
                          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-6">
            <button onClick={() => setShowTable(!showTable)} className="text-[13px] font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5">
              Compare all features
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={showTable ? 'rotate-180' : ''}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>

          {showTable && (
            <div className="mt-8 w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <tbody>
                  {COMPARISON_FEATURES.map((section, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <tr><td colSpan={5} className="py-3 px-4 text-[12px] font-semibold text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">{section.category}</td></tr>
                      {section.items.map((item, iIdx) => (
                        <tr key={iIdx}>
                          <td className="py-2.5 px-4 text-[12px] font-medium text-gray-900 border-b border-gray-100">{item.name}</td>
                          <td className="py-2.5 px-4 text-[12px] text-gray-600 border-b border-gray-100">{item.free}</td>
                          <td className="py-2.5 px-4 text-[12px] text-gray-600 border-b border-gray-100">{item.pro}</td>
                          <td className="py-2.5 px-4 text-[12px] text-gray-600 border-b border-gray-100">{item.max}</td>
                          <td className="py-2.5 px-4 text-[12px] text-gray-600 border-b border-gray-100">{item.unlimited}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}