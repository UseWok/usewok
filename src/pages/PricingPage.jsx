import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getPlansConfig, loadPlansFromDB, COMPARISON_FEATURES } from '@/lib/plans-config';

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState(() => getPlansConfig());
  const [billing, setBilling] = useState('yearly');
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
    if (plan.id === 'unlimited') { window.location.href = plan.checkout_url_yearly; return; }
    const checkoutUrl = billing === 'yearly' ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (checkoutUrl) { window.location.href = checkoutUrl; }
  };

  const getButtonState = (planId) => {
    const planIndex = plans.findIndex(p => p.id === planId);
    const currentIndex = plans.findIndex(p => p.id === purchased);
    
    if (planId === purchased) return { text: "Current plan", class: "bg-gray-100 text-gray-500 cursor-default border border-gray-200" };
    if (planId === 'unlimited') return { text: "Contact sales", class: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50" };
    if (planIndex > currentIndex) return { text: "Upgrade", class: "bg-[#2383E2] text-white hover:bg-[#1E70C1] border border-transparent" };
    return { text: "Downgrade", class: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50" };
  };

  const currentPlanObj = plans.find(p => p.id === purchased) || plans[0];

  return (
    <div className="min-h-screen bg-white font-sans text-[#111827] flex flex-col pb-24">
      
      {/* HEADER */}
      <div className="pt-16 pb-8 px-6 max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-[#0A0A0A]">Discover plans</h1>
        <p className="text-[15px] text-gray-500 mb-12">Compare all Stensor plans</p>

        {/* YOUR CURRENT PLAN BANNER */}
        <div className="mb-12">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-3">Your current plan</h2>
          <div className="border border-gray-200 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between bg-white shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{currentPlanObj.name}</h3>
              <p className="text-[13px] text-gray-500">To organize all aspects of your financial life.</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 w-full md:w-auto">
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-gray-900 mb-0.5 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Stensor AI
                </p>
                <p className="text-[12px] text-gray-500 max-w-[200px] leading-tight">Upgrade to search anywhere, automate notes and more.</p>
              </div>
              <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="px-4 py-2 bg-[#2383E2] text-white text-[13px] font-medium rounded-md hover:bg-[#1E70C1] transition-colors whitespace-nowrap">
                Upgrade plan
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-[14px] font-semibold text-gray-900">Compare all plans</h2>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </div>
      </div>

      {/* PLANS GRID (4 COLUMNS) */}
      <div className="max-w-7xl mx-auto px-6 w-full relative">
        <div className="grid grid-cols-1 md:grid-cols-4 border-t border-l border-gray-200">
          
          {plans.map((plan) => {
            const price = plan.price_monthly === 'Custom' ? 'Custom' : (billing === 'yearly' ? plan.price_yearly : plan.price_monthly);
            const btnState = getButtonState(plan.id);

            return (
              <div key={plan.id} className="flex flex-col p-6 border-b border-r border-gray-200 bg-white relative">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-[#0A0A0A]">{plan.name}</h3>
                  {plan.badge && <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{plan.badge}</span>}
                </div>
                
                <div className="mb-6 h-[80px]">
                  {price === 'Custom' ? (
                    <div className="mt-4"><span className="text-sm text-gray-600">Contact us for pricing</span></div>
                  ) : (
                    <div className="mt-2">
                      <div className="flex items-end gap-1 mb-0.5">
                        <span className="text-[13px] text-gray-500 mb-1">$</span>
                        <span className="text-2xl font-bold leading-none">{price}</span>
                      </div>
                      <p className="text-[12px] text-gray-500 leading-tight">
                        per user/month<br/>
                        {billing === 'yearly' ? `billed annually` : 'billed monthly'}
                      </p>
                    </div>
                  )}
                </div>

                <button onClick={() => handleChoose(plan)} className={`w-full py-2 rounded-md text-[13px] font-medium mb-8 transition-colors ${btnState.class}`}>
                  {btnState.text}
                </button>

                <div className="flex-1">
                  <p className="text-[13px] font-bold text-gray-900 mb-3">{plan.features_header}</p>
                  <ul className="space-y-2.5">
                    {plan.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOGGLE TABLE BUTTON */}
        <div className="flex justify-center mt-8">
          <button onClick={() => setShowTable(!showTable)} className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5">
            Compare all features
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showTable ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        {/* DETAILED COMPARISON TABLE */}
        {showTable && (
          <div className="mt-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="w-1/5"></th>
                    {plans.map(plan => (
                      <th key={plan.id} className="w-1/5 py-4 px-4 font-bold text-[15px] text-gray-900 border-b border-gray-200">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((section, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <tr>
                        <td colSpan={5} className="py-4 px-4 text-[13px] font-semibold text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
                          {section.category}
                        </td>
                      </tr>
                      {section.items.map((item, iIdx) => (
                        <tr key={iIdx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-4 text-[13px] font-medium text-gray-900 border-b border-gray-100">{item.name}</td>
                          <td className="py-3.5 px-4 text-[13px] text-gray-600 border-b border-gray-100">
                            {item.free === 'Yes' ? <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : item.free}
                          </td>
                          <td className="py-3.5 px-4 text-[13px] text-gray-600 border-b border-gray-100">
                            {item.pro === 'Yes' ? <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : item.pro}
                          </td>
                          <td className="py-3.5 px-4 text-[13px] text-gray-600 border-b border-gray-100">
                            {item.max === 'Yes' ? <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : item.max}
                          </td>
                          <td className="py-3.5 px-4 text-[13px] text-gray-600 border-b border-gray-100">
                            {item.unlimited === 'Yes' ? <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> : item.unlimited}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}}