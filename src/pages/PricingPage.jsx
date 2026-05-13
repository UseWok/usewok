import React, { useState, useEffect } from 'react';
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
    const checkoutUrl = billing === 'yearly' ? plan.checkout_url_yearly : plan.checkout_url_monthly;
    if (checkoutUrl) { window.location.href = checkoutUrl; }
  };

  const getButtonState = (planId) => {
    const planIndex = plans.findIndex(p => p.id === planId);
    const currentIndex = plans.findIndex(p => p.id === purchased);
    
    if (planId === purchased) return { text: "Forfait actuel", class: "bg-gray-100 text-gray-500 cursor-default" };
    if (planIndex > currentIndex) return { text: "Passer à un forfait supérieur", class: "bg-[#2383E2] text-white hover:bg-[#1E70C1]" };
    return { text: "Passer à un forfait inférieur", class: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50" };
  };

  // Sécurité anti-crash
  const currentPlanObj = plans?.find(p => p.id === purchased) || plans?.[0] || {};

  return (
    <div className="min-h-screen bg-white font-sans text-[#0A0A0A] flex flex-col pb-24">
      
      <div className="pt-20 pb-8 px-6 max-w-[1200px] mx-auto w-full">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Découvrir les forfaits</h1>
        <p className="text-[16px] text-gray-500 mb-12">Comparez tous les forfaits Stensor</p>

        <div className="mb-12 border border-gray-200 rounded-[12px] p-6 md:p-8 flex flex-col md:flex-row items-start justify-between bg-white shadow-sm">
          <div className="mb-6 md:mb-0">
            <h2 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-4">Votre forfait actuel</h2>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] font-bold bg-gray-100 px-2 py-1 rounded">EUR</span>
              <h3 className="text-2xl font-bold">{currentPlanObj?.name || 'Forfait'}</h3>
            </div>
            <p className="text-[15px] text-gray-600 mb-4">Pour organiser tous les aspects de votre vie — personnelle et professionnelle</p>
            <div className="flex items-center gap-2 text-[14px] font-medium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              Blocs illimités
            </div>
          </div>
          
          <div className="flex flex-col items-start bg-gray-50 p-5 rounded-xl border border-gray-200 w-full md:w-[400px]">
            <div className="flex items-center gap-2 mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2383E2" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span className="text-[15px] font-bold">IA de Stensor</span>
            </div>
            <p className="text-[14px] text-gray-600 mb-5 leading-relaxed">
              Passez à un forfait supérieur pour rechercher n’importe où, automatiser les notes de réunion et plus encore
            </p>
            <button onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} className="px-4 py-2 bg-[#2383E2] text-white text-[14px] font-medium rounded-lg hover:bg-[#1E70C1] transition-colors w-full md:w-auto text-center">
              Passer à un forfait supérieur
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 cursor-pointer text-[#2383E2] hover:underline font-medium text-[15px]">
            Comparer tous les forfaits
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[14px] font-medium ${billing === 'monthly' ? 'text-black' : 'text-gray-500'}`} onClick={() => setBilling('monthly')}>Mensuel</span>
            <button className="w-11 h-6 rounded-full bg-gray-200 relative transition-colors" onClick={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${billing === 'yearly' ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`text-[14px] font-medium ${billing === 'yearly' ? 'text-black' : 'text-gray-500'}`} onClick={() => setBilling('yearly')}>Annuel</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {(plans || []).map((plan) => {
            const btnState = getButtonState(plan.id);
            const mainPrice = billing === 'yearly' ? plan.price_yearly : plan.price_monthly;
            const subPrice = billing === 'yearly' ? plan.price_monthly : plan.price_yearly;

            return (
              <div key={plan.id} className="flex flex-col bg-white">
                <div className="flex items-center gap-2 mb-4 h-[24px]">
                  <h3 className="text-[22px] font-bold text-[#0A0A0A]">{plan.name}</h3>
                  {plan.badge === 'Populaire' && <span className="bg-[#EBF5FF] text-[#2383E2] text-[11px] font-bold px-2 py-0.5 rounded-sm">Populaire</span>}
                  {plan.badge === 'Limited' && <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-0.5 rounded-sm">Limited</span>}
                </div>
                
                <div className="mb-6 h-[100px]">
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-[36px] font-bold leading-none">{mainPrice} €</span>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-tight mb-2">par membre et par mois</p>
                  
                  {plan.price_monthly > 0 && (
                    <div className="text-[12px] text-gray-500 leading-tight">
                      {billing === 'yearly' ? (
                        <>facturation annuelle<br/>{subPrice} € facturation mensuelle</>
                      ) : (
                        <>facturation mensuelle<br/>{subPrice} € facturation annuelle</>
                      )}
                    </div>
                  )}
                </div>

                <button onClick={() => handleChoose(plan)} className={`w-full py-2.5 rounded-[8px] text-[14px] font-medium mb-8 transition-colors ${btnState.class}`}>
                  {btnState.text}
                </button>

                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-gray-900 mb-4 whitespace-pre-line leading-snug">
                    {plan.features_header}
                  </p>
                  <ul className="space-y-3.5">
                    {(plan.features || []).map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[14px] text-gray-700">
                        {f.prefix ? (
                          <span className="text-[12px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">{f.prefix}</span>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                        <span className="leading-snug">
                          {f.text}
                          {f.tag && <span className="ml-2 bg-[#E6F4EA] text-[#16A34A] text-[10px] font-bold px-1.5 py-0.5 rounded-sm">{f.tag}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* COMPARISON TABLE */}
        <div className="flex justify-center mt-12 mb-8">
          <button onClick={() => setShowTable(!showTable)} className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5">
            Comparer toutes les fonctionnalités
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showTable ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

        {showTable && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="w-1/5"></th>
                  {(plans || []).map(plan => (
                    <th key={plan.id} className="w-1/5 py-4 px-4 font-bold text-[15px] text-gray-900 border-b border-gray-200">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(COMPARISON_FEATURES || []).map((section, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <tr>
                      <td colSpan={5} className="py-4 px-4 text-[13px] font-semibold text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
                        {section.category}
                      </td>
                    </tr>
                    {(section.items || []).map((item, iIdx) => (
                      <tr key={iIdx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-[13px] font-medium text-gray-900 border-b border-gray-100">{item.name}</td>
                        <td className="py-3.5 px-4 text-[13px] text-gray-600 border-b border-gray-100">{item.free}</td>
                        <td className="py-3.5 px-4 text-[13px] text-gray-600 border-b border-gray-100">{item.plus}</td>
                        <td className="py-3.5 px-4 text-[13px] text-gray-600 border-b border-gray-100">{item.business}</td>
                        <td className="py-3.5 px-4 text-[13px] text-gray-600 border-b border-gray-100">{item.enterprise}</td>
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