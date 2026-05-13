import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getPlansConfig, loadPlansFromDB } from '@/lib/plans-config';

// Composant utilitaire pour générer de fausses icones de marques
const BrandIcons = ({ count }) => (
  <div className="flex items-center gap-1 mt-1.5 mb-1">
    <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm"></div>
    <div className="w-3.5 h-3.5 bg-green-500 rounded-sm"></div>
    <div className="w-3.5 h-3.5 bg-yellow-400 rounded-sm"></div>
    <div className="w-3.5 h-3.5 bg-red-500 rounded-sm"></div>
    {count > 4 && <div className="w-3.5 h-3.5 bg-purple-500 rounded-full"></div>}
  </div>
);

export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState(() => getPlansConfig());
  const [purchased, setPurchased] = useState('free');
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

  const getButtonProps = (planId) => {
    if (planId === purchased) return { text: "Current plan", class: "bg-white text-[#999999] border border-[#E6E6E9] cursor-default" };
    if (planId === 'max') return { text: "Upgrade plan", class: "bg-[#2383E2] text-white border border-transparent hover:bg-[#1e70c1]" };
    return { text: "Upgrade plan", class: "bg-white text-[#333333] border border-[#E6E6E9] hover:bg-[#F9F9F9]" };
  };

  const pFree = plans.find(p => p.id === 'free') || {};
  const pPro = plans.find(p => p.id === 'pro') || {};
  const pMax = plans.find(p => p.id === 'max') || {};
  const pUnlim = plans.find(p => p.id === 'unlimited') || {};

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col pb-24 antialiased">
      
      {/* SECTION 1: PAGE HEADER */}
      <div className="pt-10 px-10 w-full max-w-[1200px] mx-auto">
        <h1 className="text-[32px] font-bold text-[#333333] tracking-tight">Discover plans</h1>
        <p className="text-[16px] text-[#707070] mt-2">Compare all Stensor plans</p>
      </div>

      {/* SECTION 2: YOUR CURRENT PLAN */}
      <div className="mt-10 px-10 w-full max-w-[1200px] mx-auto">
        <div className="flex justify-between items-end mb-3">
          <h2 className="text-[18px] font-bold text-[#333333]">Your current plan</h2>
          <div className="flex items-center gap-1.5 px-3 py-1 border border-[#E6E6E9] rounded-full cursor-pointer hover:bg-gray-50">
            <span className="text-[13px] text-[#707070] font-medium">USD</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div className="border border-[#E6E6E9] rounded-[8px] bg-white p-6 md:p-8 flex flex-col md:flex-row items-stretch justify-between">
          <div className="flex-1 pr-6">
            <h3 className="text-[28px] font-bold text-[#333333] mb-1">Free</h3>
            <p className="text-[16px] text-[#707070] mb-4">For organizing every corner of your life — personal and professional</p>
            <div className="flex items-center gap-1.5 text-[13px] text-[#999999]">
              Unlimited blocks
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
          
          {/* Nested Box */}
          <div className="mt-6 md:mt-0 w-full md:w-[40%] bg-[#F9F9F9] rounded-[6px] p-6 flex flex-col items-start justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-gray-200/50 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <span className="text-[15px] font-bold text-[#333333]">Stensor AI</span>
            </div>
            <p className="text-[13px] text-[#707070] mb-5 leading-relaxed">
              Upgrade to search anywhere, automate meeting notes and more
            </p>
            <button className="self-end px-4 py-2 bg-[#2383E2] text-white text-[14px] font-bold rounded-[4px] hover:bg-[#1e70c1] transition-colors max-w-[200px] text-center">
              Upgrade plan
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: COMPARISON HEADER & PRICING COLUMNS */}
      <div className="mt-12 px-10 w-full max-w-[1200px] mx-auto">
        <h2 className="text-[18px] font-bold text-[#333333] mb-6 flex items-center gap-1.5">
          Compare all plans
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </h2>

        {/* 5-Column Grid Layout. Col 1 is empty in this row */}
        <div className="grid grid-cols-5 gap-0">
          <div className="col-span-1"></div>
          
          {/* Free */}
          <div className="col-span-1 px-4 flex flex-col">
            <h3 className="text-[28px] font-bold text-[#333333] mb-3">Free</h3>
            <p className="text-[13px] text-[#999999] h-[48px]">$0 per user per month</p>
            <div className="h-[36px] mt-2"></div> {/* Spacer for button area */}
          </div>

          {/* Pro */}
          <div className="col-span-1 px-4 flex flex-col">
            <h3 className="text-[28px] font-bold text-[#333333] mb-3">Pro</h3>
            <div className="h-[48px] flex flex-col">
              <span className="text-[13px] text-[#707070]">${pPro.price_yearly?.toFixed(2)} per user per month</span>
              <span className="text-[11px] text-[#999999]">billed annually</span>
              <span className="text-[11px] text-[#999999]">${pPro.price_monthly?.toFixed(2)} billed monthly</span>
            </div>
            <button onClick={() => handleChoose(pPro)} className={`mt-2 w-full py-2 rounded-[4px] text-[13px] font-bold transition-colors ${getButtonProps('pro').class}`}>
              {getButtonProps('pro').text}
            </button>
          </div>

          {/* Max */}
          <div className="col-span-1 px-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[28px] font-bold text-[#333333] leading-none">Max</h3>
              <span className="bg-[#EBF5FF] text-[#2383E2] text-[11px] font-bold px-2 py-0.5 rounded-full">Popular</span>
            </div>
            <div className="h-[48px] flex flex-col">
              <span className="text-[13px] text-[#707070]">${pMax.price_yearly?.toFixed(2)} per user per month</span>
              <span className="text-[11px] text-[#999999]">billed annually</span>
              <span className="text-[11px] text-[#999999]">${pMax.price_monthly?.toFixed(2)} billed monthly</span>
            </div>
            <button onClick={() => handleChoose(pMax)} className={`mt-2 w-full py-2 rounded-[4px] text-[13px] font-bold transition-colors ${getButtonProps('max').class}`}>
              {getButtonProps('max').text}
            </button>
          </div>

          {/* Unlimited */}
          <div className="col-span-1 px-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-[28px] font-bold text-[#333333] leading-none">Unlimited</h3>
              <span className="bg-[#F0F0F0] text-[#707070] text-[11px] font-bold px-2 py-0.5 rounded-full">Limited</span>
            </div>
            <div className="h-[48px] flex flex-col">
              <span className="text-[13px] text-[#707070]">${pUnlim.price_yearly?.toFixed(2)} per user per month</span>
              <span className="text-[11px] text-[#999999]">billed annually</span>
              <span className="text-[11px] text-[#999999]">${pUnlim.price_monthly?.toFixed(2)} billed monthly</span>
            </div>
            <button onClick={() => handleChoose(pUnlim)} className={`mt-2 w-full py-2 rounded-[4px] text-[13px] font-bold transition-colors ${getButtonProps('unlimited').class}`}>
              {getButtonProps('unlimited').text}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: FEATURES COMPARISON TABLE */}
      <div className="mt-8 px-10 w-full max-w-[1200px] mx-auto">
        <div className="bg-[#F7F7F5] rounded-t-[8px] pb-6">
          <div className="grid grid-cols-5 gap-0">
            
            {/* COLUMN 1: Labels */}
            <div className="col-span-1 p-5 border-r border-transparent">
              <p className="text-[13px] font-bold text-[#333333]">Key elements</p>
            </div>

            {/* COLUMN 2: Free */}
            <div className="col-span-1 p-5">
              <p className="text-[13px] font-bold text-[#333333] mb-4">Includes</p>
              <ul className="space-y-3">
                {['Basic forms', 'Basic sites', 'Basic automations', 'Custom databases', 'Stensor Calendar', 'Stensor Mail'].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#333333]">
                    <svg className="w-3.5 h-3.5 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3: Pro */}
            <div className="col-span-1 p-5">
              <p className="text-[13px] font-bold text-[#333333] mb-4">Everything in Free, plus</p>
              <ul className="space-y-3">
                {['Unlimited blocks', 'Unlimited graphs', 'Custom forms', 'Custom sites', 'Basic integrations'].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#333333]">
                    <svg className="w-3.5 h-3.5 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <BrandIcons count={4} />
            </div>

            {/* COLUMN 4: Max */}
            <div className="col-span-1 p-5">
              <p className="text-[13px] font-bold text-[#333333] mb-4">Everything in Pro, plus</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-[13px] text-[#333333]">
                  <svg className="w-3.5 h-3.5 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Stensor Agent
                </li>
                <li className="flex items-start gap-2 text-[13px] text-[#333333]">
                  <svg className="w-3.5 h-3.5 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Custom agents
                </li>
                <li className="flex items-start gap-2 text-[13px] text-[#333333]">
                  <svg className="w-3.5 h-3.5 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>AI Notes <span className="ml-1 bg-[#EBF5FF] text-[#2383E2] text-[10px] font-bold px-1.5 py-0.5 rounded-full">Beta</span></span>
                </li>
                <li className="flex items-start gap-2 text-[13px] text-[#333333]">
                  <svg className="w-3.5 h-3.5 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Database permissions
                </li>
                <li className="flex items-start gap-2 text-[13px] text-[#333333]">
                  <svg className="w-3.5 h-3.5 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  SAML SSO
                </li>
                <li className="flex items-start gap-2 text-[13px] text-[#333333]">
                  <svg className="w-3.5 h-3.5 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Enterprise search
                </li>
                <div className="flex items-center gap-1.5 ml-5 mt-1">
                  <BrandIcons count={4} />
                  <span className="text-[11px] text-[#999999]">+4</span>
                </div>
                <li className="flex items-start gap-2 text-[13px] text-[#333333] mt-3">
                  <svg className="w-3.5 h-3.5 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Premium integrations
                </li>
                <div className="flex items-center gap-1.5 ml-5 mt-1">
                  <BrandIcons count={5} />
                  <span className="text-[11px] text-[#999999]">+5</span>
                </div>
                <li className="flex items-start gap-2 text-[13px] text-[#333333] mt-3">
                  <svg className="w-3.5 h-3.5 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  Verify any page
                </li>
              </ul>
            </div>

            {/* COLUMN 5: Unlimited */}
            <div className="col-span-1 p-5">
              <p className="text-[13px] font-bold text-[#333333] mb-4">Everything in Max, plus</p>
              <ul className="space-y-3">
                {['AI analytics and controls', 'No data retention with LLM providers', 'User provisioning via SCIM', 'Advanced security and controls', 'Audit log', 'Security and compliance integrations (DLP, SIEM)', 'Domain management', 'Advanced integrations'].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#333333]">
                    <svg className="w-3.5 h-3.5 text-[#333333] flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className="leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* SECTION 5: FOOTER */}
      <div className="flex justify-center mt-6 mb-12">
        <button className="text-[13px] font-medium text-[#707070] hover:text-[#333333] flex items-center gap-1.5 transition-colors">
          Compare all features
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

    </div>
  );
}