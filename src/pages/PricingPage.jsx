import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getPlansConfig, loadPlansFromDB, COMPARISON_FEATURES } from '@/lib/plans-config';

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState(() => getPlansConfig());
  const [purchased, setPurchased] = useState('free');
  const [showTable, setShowTable] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setPurchased(u?.subscription_plan || 'free'); }).catch(() => {});
    loadPlansFromDB().then(p => { if (p) setPlans(p); }).catch(() => {});
  }, []);

  const handleChoose = (plan) => {
    if (purchased === plan.id) { navigate('/app'); return; }
    if (plan.id === 'free') return;
    if (plan.checkout_url) { window.location.href = plan.checkout_url; }
  };

  const currentPlanObj = plans?.find(p => p.id === purchased) || plans?.[0] || {};

  return (
    <div className="min-h-screen bg-white font-sans text-[#0d0d0d] flex flex-col pb-24 antialiased">
      
      {/* HEADER & CURRENT PLAN BANNER */}
      <div className="pt-24 pb-8 px-6 max-w-[1200px] mx-auto w-full">
        <h1 className="text-[40px] font-bold tracking-tight mb-2">Discover plans</h1>
        <p className="text-[17px] text-gray-500 mb-12">Compare all Stensor plans</p>

        <div className="mb-12 border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row items-start justify-between bg-[#fcfcfc] shadow-sm">
          <div className="mb-6 md:mb-0 max-w-md">
            <h2 className="text-[13px] font-semibold text-gray-500 mb-4">Your current plan</h2>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[12px] font-bold bg-white border border-gray-200 px-2 py-0.5 rounded">USD</span>
              <h3 className="text-2xl font-bold">{currentPlanObj?.name || 'Free'}</h3>
            </div>
            <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">
              Basic AI personal finance tool for organizing personal finances, personal projects and much more.
            </p>
            <button className="text-[14px] font-medium text-gray-900 border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
              Manage plan
            </button>
          </div>
          
          <div className="flex flex-col items-start bg-blue-50/50 p-6 rounded-xl border border-blue-100 w-full md:w-[420px]">
            <div className="flex items-center gap-2 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2383E2" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span className="text-[16px] font-bold text-[#2383E2]">Stensor AI</span>
            </div>
            <p className="text-[14px] text-gray-700 mb-6 leading-relaxed">
              Upgrade to a higher plan to search anywhere, automate meeting notes and more.
            </p>
            <button onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })} className="px-5 py-2.5 bg-[#2383E2] text-white text-[14px] font-medium rounded-lg hover:bg-[#1E70C1] transition-colors w-full md:w-auto text-center shadow-sm">
              Upgrade to higher plan
            </button>
          </div>
        </div>
      </div>

      {/* PLANS GRID */}
      <div className="max-w-[1200px] mx-auto px-6 w-full">
        <h2 className="text-2xl font-bold mb-6">Compare all plans</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {(plans || []).map((plan) => {
            const isMax = plan.id === 'max';
            return (
              <div key={plan.id} className="flex flex-col bg-white border border-gray-200 rounded-[20px] p-6 shadow-sm">
                
                <h3 className="text-2xl font-bold text-[#0A0A0A] mb-6 flex justify-between items-center">
                  {plan.name}
                  {plan.badge && <span className="bg-blue-100 text-[#2383E2] text-[11px] font-bold px-2 py-0.5 rounded-md">{plan.badge}</span>}
                </h3>
                
                <div className="mb-6 h-[70px]">
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-[28px] font-bold leading-none">
                      ${plan.price_yearly === 0 ? '0' : plan.price_yearly.toFixed(2)}
                    </span>
                  </div>
                  {plan.price_monthly > 0 ? (
                    <div className="text-[12.5px] text-gray-500 leading-snug mt-2">
                      per user/month, billed annually<br/>
                      ${plan.price_monthly.toFixed(2)} billed monthly
                    </div>
                  ) : (
                    <div className="text-[12.5px] text-gray-500 leading-snug mt-2">
                      per user/month
                    </div>
                  )}
                </div>

                <div className="flex-1 mb-8">
                  <p className="text-[13px] font-bold text-gray-900 mb-4">{plan.features_header}</p>
                  <ul className="space-y-3.5">
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-700 leading-snug">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => handleChoose(plan)} 
                  className={`w-full py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                    isMax 
                      ? 'bg-[#2383E2] text-white hover:bg-[#1E70C1]' 
                      : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Join Waitlist
                </button>

              </div>
            );
          })}
        </div>

        {/* COMPARISON TABLE */}
        <div className="flex justify-start mt-12 mb-6 border-t border-gray-200 pt-8">
          <button onClick={() => setShowTable(!showTable)} className="text-[15px] font-semibold text-gray-800 hover:text-gray-900 flex items-center gap-2">
            Compare all features
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showTable ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        {showTable && (
          <div className="w-full overflow-x-auto pb-10">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <tbody>
                {(COMPARISON_FEATURES || []).map((section, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <tr><td colSpan={5} className="py-4 px-4 text-[13px] font-bold text-gray-900 bg-gray-50 border-y border-gray-200">{section.category}</td></tr>
                    {(section.items || []).map((item, iIdx) => (
                      <tr key={iIdx} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 text-[13.5px] font-medium text-gray-900 border-b border-gray-100">{item.name}</td>
                        <td className="py-3.5 px-4 text-[13.5px] text-gray-600 border-b border-gray-100">{item.free}</td>
                        <td className="py-3.5 px-4 text-[13.5px] text-gray-600 border-b border-gray-100">{item.pro}</td>
                        <td className="py-3.5 px-4 text-[13.5px] text-gray-600 border-b border-gray-100">{item.max}</td>
                        <td className="py-3.5 px-4 text-[13.5px] text-gray-600 border-b border-gray-100">{item.unlimited}</td>
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
  );
}