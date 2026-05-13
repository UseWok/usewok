import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState(() => getPlansConfig());
  const [billing, setBilling] = useState('yearly');
  const [purchased, setPurchased] = useState('free');
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setPurchased(u?.subscription_plan || 'free'); }).catch(() => {});
    loadPlansFromDB().then(p => { if (p) setPlans(p); }).catch(() => {});
  }, []);

  const handleChoose = (plan) => {
    if (purchased === plan.id) { navigate('/app'); return; }
    if (plan.id === 'free') return; // Déjà free ou downgrade à gérer
    if (plan.id === 'enterprise') { window.location.href = 'mailto:contact@yoursite.com'; return; }
    
    // REDIRECTION DIRECTE VERS STRIPE
    const checkoutUrl = billing === 'yearly' ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (checkoutUrl) { window.location.href = checkoutUrl; }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#111827] flex flex-col">
      
      {/* Notion-style Header */}
      <div className="pt-20 pb-12 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-[44px] font-bold tracking-tight mb-4 text-[#0A0A0A]">
          Find the right plan for you
        </h1>
        <p className="text-[17px] text-gray-500 max-w-2xl mx-auto mb-10">
          Whether you want to organize your own finances or run your entire business strategy, we have a plan for you.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-[15px] font-medium cursor-pointer ${billing === 'monthly' ? 'text-black' : 'text-gray-400'}`} onClick={() => setBilling('monthly')}>
            Monthly
          </span>
          <button 
            className="w-12 h-6 rounded-full bg-gray-200 relative transition-colors"
            onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${billing === 'yearly' ? 'translate-x-6' : ''}`} />
          </button>
          <span className={`flex items-center gap-2 text-[15px] font-medium cursor-pointer ${billing === 'yearly' ? 'text-black' : 'text-gray-400'}`} onClick={() => setBilling('yearly')}>
            Annually <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-sm">SAVE 20%</span>
          </span>
        </div>
      </div>

      {/* Plans Grid (4 columns) */}
      <div className="max-w-[1200px] mx-auto px-6 w-full pb-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-l border-gray-200">
          
          {plans.map((plan) => {
            const isCurrentPlan = purchased === plan.id;
            const price = plan.price_monthly === 'Custom' ? 'Custom' : (billing === 'yearly' ? plan.price_yearly : plan.price_monthly);

            return (
              <div key={plan.id} className="flex flex-col p-8 border-b border-r border-gray-200 bg-white">
                <h3 className="text-xl font-bold mb-2 text-[#0A0A0A]">{plan.name}</h3>
                <p className="text-[14px] text-gray-500 mb-6 h-10">{plan.description}</p>
                
                <div className="mb-6 h-14">
                  {price === 'Custom' ? (
                    <span className="text-3xl font-bold">Contact us</span>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold">${price}</span>
                      {price !== 0 && <span className="text-gray-500 mb-1">/ user / month</span>}
                    </div>
                  )}
                  {billing === 'yearly' && price !== 'Custom' && price !== 0 && (
                    <p className="text-[13px] text-gray-500 mt-1">Billed annually (${price * 12})</p>
                  )}
                </div>

                <button 
                  onClick={() => handleChoose(plan)}
                  className={`w-full py-2.5 rounded-md text-[14px] font-medium mb-8 transition-colors ${
                    isCurrentPlan ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                    plan.id === 'pro' || plan.id === 'max' ? 'bg-[#0A0A0A] text-white hover:bg-black/80' : 
                    'bg-white border border-gray-300 hover:bg-gray-50 text-gray-900'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : (plan.id === 'enterprise' ? 'Contact sales' : 'Get started')}
                </button>

                <div className="flex-1">
                  <p className="text-[12px] font-bold uppercase tracking-wider text-gray-500 mb-4">
                    {plan.id === 'free' ? 'Features include:' : `Everything in ${plans[plans.findIndex(p => p.id === plan.id)-1].name}, plus:`}
                  </p>
                  <ul className="space-y-3">
                    {plan.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[14px] text-gray-700">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
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
  );
}