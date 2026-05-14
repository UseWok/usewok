import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

// Composant utilitaire pour générer les fausses icones de marques demandées
const BrandIconsRow = ({ count, extraText }) => (
  <div className="flex items-center gap-1.5 mt-2 mb-3">
    <div className="flex items-center gap-1">
      <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm"></div>
      <div className="w-3.5 h-3.5 bg-green-500 rounded-sm"></div>
      <div className="w-3.5 h-3.5 bg-yellow-400 rounded-sm"></div>
      <div className="w-3.5 h-3.5 bg-red-500 rounded-sm"></div>
      {count > 4 && <div className="w-3.5 h-3.5 bg-purple-500 rounded-full"></div>}
    </div>
    {extraText && <span className="text-[11px] text-[#999999] font-medium">{extraText}</span>}
  </div>
);

// Composant Checkmark réutilisable
const CheckIcon = () => (
  <svg className="w-4 h-4 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => {});
  }, []);

  const handleAction = (planId) => {
    if (planId === 'free') return;
    // Logique de redirection vers Stripe ou Contact
    if (planId === 'pro') window.location.href = 'https://buy.stripe.com/test_pro';
    if (planId === 'max') window.location.href = 'https://buy.stripe.com/test_max';
    if (planId === 'unlimited') window.location.href = 'mailto:contact@stensor.com';
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col items-center pb-24 antialiased">
      
      <div className="w-full max-w-[1000px] px-8">
        
        {/* SECTION 1: Page Header */}
        <div className="pt-10">
          <h1 className="text-[32px] font-bold text-[#333333] tracking-tight leading-none">Discover plans</h1>
          <p className="text-[16px] text-[#707070] mt-2">Compare all Stensor plans</p>
        </div>

        {/* SECTION 2: "Votre forfait actuel" (Current Plan) Container */}
        <div className="mt-10">
          <div className="flex justify-between items-end mb-3">
            <h2 className="text-[16px] font-bold text-[#333333]">Your current plan</h2>
            <div className="flex items-center gap-1.5 px-3 py-1 border border-[#E6E6E9] rounded-full cursor-pointer hover:bg-gray-50">
              <span className="text-[12px] text-[#707070] font-medium">USD</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>

          <div className="w-full border border-[#E6E6E9] rounded-[8px] bg-[#FFFFFF] p-6 flex flex-col md:flex-row items-stretch justify-between">
            {/* Inside Card - Left Side */}
            <div className="flex-1 pr-6 flex flex-col justify-center">
              <h3 className="text-[24px] font-bold text-[#333333] mb-1 leading-tight">Free</h3>
              <p className="text-[15px] text-[#707070] mb-3">To organize every aspect of your life — personal and professional</p>
              <div className="flex items-center gap-1.5 text-[13px] text-[#999999]">
                Unlimited blocks
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
            </div>
            
            {/* Inside Card - Right Side */}
            <div className="mt-6 md:mt-0 w-full md:w-[40%] bg-[#F9F9F9] rounded-[6px] p-5 flex flex-col items-start justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full border border-[#E6E6E9] flex items-center justify-center bg-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <span className="text-[14px] font-bold text-[#333333]">Stensor AI</span>
              </div>
              <p className="text-[13px] text-[#707070] mb-4 leading-snug">
                Upgrade to search anywhere, automate meeting notes and more
              </p>
              <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="self-end px-4 py-2 bg-[#2383E2] text-white text-[13px] font-bold rounded-[4px] hover:bg-[#1e70c1] transition-colors text-center">
                Upgrade plan
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: Comparison Header & Pricing Columns */}
        <div className="mt-12">
          <h2 className="text-[16px] font-bold text-[#333333] mb-6 flex items-center gap-1.5">
            Compare all plans
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </h2>

          <div className="grid grid-cols-5 gap-0">
            {/* Column 0: Empty spacer for alignment */}
            <div className="col-span-1"></div>
            
            {/* Column 1: Free */}
            <div className="col-span-1 px-4 flex flex-col">
              <h3 className="text-[22px] font-bold text-[#333333] mb-2 leading-none">Free</h3>
              <div className="h-[50px] flex flex-col justify-start mt-1">
                <span className="text-[13px] text-[#999999]">$0 per member per month</span>
              </div>
              <div className="h-[36px] mt-2"></div> {/* Blank action area */}
            </div>

            {/* Column 2: Plus (Pro) */}
            <div className="col-span-1 px-4 flex flex-col">
              <h3 className="text-[22px] font-bold text-[#333333] mb-2 leading-none">Pro</h3>
              <div className="h-[50px] flex flex-col justify-start mt-1">
                <span className="text-[13px] text-[#707070]">$9.50 per member per month</span>
                <span className="text-[11px] text-[#999999]">billed annually</span>
                <span className="text-[11px] text-[#999999]">$11.50 billed monthly</span>
              </div>
              <button onClick={() => handleAction('pro')} className="mt-2 w-full py-1.5 rounded-[4px] text-[13px] font-bold text-[#333333] bg-white border border-[#E6E6E9] hover:bg-gray-50 transition-colors">
                Upgrade plan
              </button>
            </div>

            {/* Column 3: Business (Max) */}
            <div className="col-span-1 px-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-[22px] font-bold text-[#333333] leading-none">Max</h3>
                <span className="bg-[#EBF5FF] text-[#2383E2] text-[10px] font-bold px-1.5 py-0.5 rounded-full">Popular</span>
              </div>
              <div className="h-[50px] flex flex-col justify-start mt-1">
                <span className="text-[13px] text-[#707070]">$19.50 per member per month</span>
                <span className="text-[11px] text-[#999999]">billed annually</span>
                <span className="text-[11px] text-[#999999]">$23.50 billed monthly</span>
              </div>
              <button onClick={() => handleAction('max')} className="mt-2 w-full py-1.5 rounded-[4px] text-[13px] font-bold text-white bg-[#2383E2] border border-transparent hover:bg-[#1e70c1] transition-colors">
                Upgrade plan
              </button>
            </div>

            {/* Column 4: Enterprise (Unlimited) */}
            <div className="col-span-1 px-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-[22px] font-bold text-[#333333] leading-none">Unlimited</h3>
                <span className="bg-[#F0F0F0] text-[#707070] text-[10px] font-bold px-1.5 py-0.5 rounded-full">Limited</span>
              </div>
              <div className="h-[50px] flex flex-col justify-start mt-1">
                <span className="text-[13px] text-[#707070]">$25.50 per member per month</span>
                <span className="text-[11px] text-[#999999]">billed annually</span>
                <span className="text-[11px] text-[#999999]">$31.50 billed monthly</span>
              </div>
              <button onClick={() => handleAction('unlimited')} className="mt-2 w-full py-1.5 rounded-[4px] text-[13px] font-bold text-[#333333] bg-white border border-[#E6E6E9] hover:bg-gray-50 transition-colors">
                Upgrade plan
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: Features Comparison Table */}
        <div className="mt-8 bg-[#F7F7F5] w-full pt-8 pb-10 rounded-b-[8px]">
          <div className="grid grid-cols-5 gap-0">
            
            {/* Column 1 (Far Left Label) */}
            <div className="col-span-1 px-4">
              <p className="text-[13px] font-bold text-[#333333]">Key elements</p>
            </div>

            {/* Column 2 (General Features) */}
            <div className="col-span-1 px-4">
              <p className="text-[13px] font-bold text-[#333333] mb-4">Includes</p>
              <ul className="space-y-3">
                {['Basic forms', 'Basic sites', 'Basic automations', 'Custom databases', 'Stensor Calendar', 'Stensor Mail'].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#707070] leading-snug">
                    <CheckIcon /> <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 (Under 'Plus' / Pro) */}
            <div className="col-span-1 px-4">
              <p className="text-[13px] font-bold text-[#333333] mb-4">Everything in Free, plus</p>
              <ul className="space-y-3 mb-1">
                {['Unlimited blocks', 'Unlimited graphs', 'Custom forms', 'Custom sites', 'Basic integrations'].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#707070] leading-snug">
                    <CheckIcon /> <span>{text}</span>
                  </li>
                ))}
              </ul>
              <div className="pl-6">
                <BrandIconsRow count={4} />
              </div>
            </div>

            {/* Column 4 (Under 'Business' / Max) */}
            <div className="col-span-1 px-4">
              <p className="text-[13px] font-bold text-[#333333] mb-4">Everything in Pro, plus</p>
              <ul className="space-y-3 mb-1">
                <li className="flex items-start gap-2 text-[13px] text-[#707070] leading-snug"><CheckIcon /> <span>Stensor Agent</span></li>
                <li className="flex items-start gap-2 text-[13px] text-[#707070] leading-snug"><CheckIcon /> <span>Custom agents</span></li>
                <li className="flex items-start gap-2 text-[13px] text-[#707070] leading-snug">
                  <CheckIcon />
                  <span className="flex flex-wrap items-center gap-1.5">
                    AI Notes <span className="bg-[#EBF5FF] text-[#2383E2] text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">Beta</span>
                  </span>
                </li>
                <li className="flex items-start gap-2 text-[13px] text-[#707070] leading-snug"><CheckIcon /> <span>Database permissions</span></li>
                <li className="flex items-start gap-2 text-[13px] text-[#707070] leading-snug"><CheckIcon /> <span>SAML SSO</span></li>
                <li className="flex items-start gap-2 text-[13px] text-[#707070] leading-snug"><CheckIcon /> <span>Enterprise search</span></li>
              </ul>
              <div className="pl-6 mb-3">
                <BrandIconsRow count={4} extraText="+4" />
              </div>
              <ul className="space-y-3 mb-1">
                <li className="flex items-start gap-2 text-[13px] text-[#707070] leading-snug"><CheckIcon /> <span>Premium integrations</span></li>
              </ul>
              <div className="pl-6 mb-3">
                <BrandIconsRow count={5} extraText="+5" />
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-[13px] text-[#707070] leading-snug"><CheckIcon /> <span>Verify any page</span></li>
              </ul>
            </div>

            {/* Column 5 (Under 'Enterprise' / Unlimited) */}
            <div className="col-span-1 px-4">
              <p className="text-[13px] font-bold text-[#333333] mb-4">Everything in Max, plus</p>
              <ul className="space-y-3">
                {['AI analytics and controls', 'No data retention with LLM providers', 'User provisioning via SCIM', 'Advanced security and controls', 'Audit log', 'Security and compliance integrations (DLP, SIEM)', 'Domain management', 'Advanced integrations'].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#707070] leading-snug">
                    <CheckIcon /> <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* SECTION 5: Footer/Expand Area */}
        <div className="flex justify-center mt-6">
          <button className="text-[13px] font-medium text-[#999999] hover:text-[#707070] transition-colors flex items-center gap-1.5">
            Compare all features
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>

      </div>
    </div>
  );
}