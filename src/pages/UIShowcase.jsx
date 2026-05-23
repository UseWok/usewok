import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Copy, Check, Mail, ExternalLink, X, ChevronDown,
  CheckCircle2, Zap, Shield, Globe, Users, BarChart3, Headphones, Building2, Star
} from 'lucide-react';

// ── Social Icons ─────────────────────────────
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const RedditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// ── Toggle ────────────────────────────────────
const Toggle = ({ enabled, onChange, label }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-slate-900' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  </div>
);

// ── Share Popover ─────────────────────────────
const SharePopover = ({ onClose }) => {
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewUrl = `${window.location.origin}/p/my-project-preview`;

  const handleCopy = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { icon: <XIcon />, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(previewUrl)}`, label: 'X' },
    { icon: <LinkedInIcon />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(previewUrl)}`, label: 'LinkedIn' },
    { icon: <RedditIcon />, href: `https://reddit.com/submit?url=${encodeURIComponent(previewUrl)}`, label: 'Reddit' },
    { icon: <Mail className="w-4 h-4" />, href: `mailto:?body=${encodeURIComponent(previewUrl)}`, label: 'Email' },
    { icon: <FacebookIcon />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(previewUrl)}`, label: 'Facebook' },
    { icon: <WhatsAppIcon />, href: `https://api.whatsapp.com/send?text=${encodeURIComponent(previewUrl)}`, label: 'WhatsApp' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute top-[calc(100%+10px)] right-0 w-[340px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h3 className="text-[15px] font-bold text-slate-900">Share this project</h3>
      </div>

      <div className="p-5 space-y-5">
        {/* Visibility Toggle */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <Toggle
            enabled={isPublic}
            onChange={() => setIsPublic(v => !v)}
            label={isPublic ? '🌐 Public — anyone with the link' : '🔒 Private — workspace only'}
          />
        </div>

        {/* Preview Link */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preview Link</p>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-slate-400 transition-colors">
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              readOnly
              value={previewUrl}
              className="flex-1 bg-transparent text-[12px] font-mono text-slate-600 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-150 ${copied ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
        </div>

        {/* Social Sharing */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Share via</p>
          <div className="grid grid-cols-6 gap-2">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className="aspect-square flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-150"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Navigation Header ─────────────────────────
const Header = () => {
  const [showShare, setShowShare] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowShare(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="w-full bg-white border-b border-slate-100 px-6 md:px-10 h-[60px] flex items-center justify-between sticky top-0 z-40" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.05)' }}>
      <div className="flex items-center gap-8">
        <span className="text-[18px] font-black tracking-tight text-slate-900 italic">ACME</span>
        <div className="hidden md:flex items-center gap-6">
          {['Product', 'Pricing', 'Docs', 'Blog'].map(item => (
            <a key={item} href="#" className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors">{item}</a>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3" ref={ref}>
        <button className="px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors">Log in</button>
        <div className="relative">
          <button
            onClick={() => setShowShare(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[13px] font-bold rounded-xl hover:bg-slate-700 transition-colors"
          >
            Share
          </button>
          <AnimatePresence>
            {showShare && <SharePopover onClose={() => setShowShare(false)} />}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

// ── Futuristic Abstract Illustration ─────────────────────────
const AbstractIllustration = () => (
  <div className="w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center">
    {/* Background grid */}
    <div className="absolute inset-0" style={{
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
    }} />

    {/* Radial glow */}
    <div className="absolute inset-0" style={{
      background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(99,102,241,0.18) 0%, transparent 70%)',
    }} />

    {/* Orbiting rings */}
    <div className="absolute inset-0 flex items-center justify-center">
      {[280, 210, 150].map((size, i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            width: size,
            height: size,
            borderColor: `rgba(${i === 0 ? '99,102,241' : i === 1 ? '168,85,247' : '236,72,153'},${0.15 + i * 0.05})`,
            animation: `spin ${18 + i * 6}s linear infinite ${i % 2 === 1 ? 'reverse' : ''}`,
          }}
        />
      ))}

      {/* Center orb */}
      <div className="relative w-20 h-20 rounded-full" style={{
        background: 'radial-gradient(circle, #818cf8 0%, #4f46e5 60%, #3730a3 100%)',
        boxShadow: '0 0 60px rgba(99,102,241,0.5), 0 0 120px rgba(99,102,241,0.2)',
      }}>
        <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm" />
      </div>

      {/* Orbiting dots */}
      {[
        { angle: 0, r: 105, color: '#a78bfa' },
        { angle: 120, r: 105, color: '#f472b6' },
        { angle: 240, r: 105, color: '#34d399' },
        { angle: 60, r: 140, color: '#60a5fa' },
        { angle: 200, r: 140, color: '#fbbf24' },
      ].map((dot, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: dot.color,
            boxShadow: `0 0 12px ${dot.color}`,
            transform: `rotate(${dot.angle}deg) translateX(${dot.r}px)`,
          }}
        />
      ))}
    </div>

    {/* Corner accent lines */}
    <div className="absolute top-8 left-8 w-24 h-24 border-t border-l border-indigo-500/20 rounded-tl-xl" />
    <div className="absolute bottom-8 right-8 w-24 h-24 border-b border-r border-purple-500/20 rounded-br-xl" />

    {/* Floating tags */}
    {[
      { text: 'AI-Powered', top: '18%', left: '10%', color: 'indigo' },
      { text: 'Real-time', bottom: '22%', right: '10%', color: 'purple' },
      { text: 'Secure', top: '60%', left: '8%', color: 'emerald' },
    ].map((tag) => (
      <div
        key={tag.text}
        className={`absolute px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md border`}
        style={{
          top: tag.top,
          bottom: tag.bottom,
          left: tag.left,
          right: tag.right,
          background: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.6)',
        }}
      >
        {tag.text}
      </div>
    ))}

    {/* Bottom label */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
      <p className="text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase">Neural Interface v2.0</p>
    </div>

    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Login Page ────────────────────────────────
const LoginPage = () => (
  <div className="flex min-h-screen w-full">
    {/* Left — Login */}
    <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8 bg-white">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="text-[28px] font-black tracking-tight text-slate-900 italic">ACME</span>
          <h1 className="text-[26px] font-bold text-slate-900 mt-6 mb-2">Welcome back</h1>
          <p className="text-[14px] text-slate-500">Sign in to continue to your workspace.</p>
        </div>

        <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-[15px] font-semibold text-slate-800 hover:border-slate-400 hover:bg-slate-50 transition-all duration-150 shadow-sm group">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 text-center">
          <p className="text-[12px] text-slate-400">
            By continuing, you agree to our{' '}
            <a href="#" className="text-slate-600 underline underline-offset-2 hover:text-slate-900">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-slate-600 underline underline-offset-2 hover:text-slate-900">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>

    {/* Right — Illustration */}
    <div className="hidden md:block md:w-1/2">
      <AbstractIllustration />
    </div>
  </div>
);

// ── Pricing Section ───────────────────────────
const PLANS = [
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Perfect for individuals and small teams.',
    cta: 'Get started',
    accent: 'slate',
    features: [
      'Up to 5 projects',
      '10,000 AI generations / mo',
      'Custom domain',
      'Priority support',
      'Analytics dashboard',
      'Export to code',
    ],
  },
  {
    name: 'Max',
    price: '$69',
    period: '/month',
    description: 'For growing teams that need more power.',
    cta: 'Get started',
    accent: 'indigo',
    featured: true,
    badge: 'Most Popular',
    features: [
      'Unlimited projects',
      '100,000 AI generations / mo',
      'Custom domains (5)',
      'Dedicated support',
      'Advanced analytics',
      'White-label options',
      'Team collaboration',
      'API access',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'Tailored solutions for large organizations.',
    cta: 'Contact sales',
    accent: 'slate',
    features: [
      'Unlimited everything',
      'SLA guarantee (99.9%)',
      'Dedicated infrastructure',
      'Custom integrations',
      'SSO / SAML',
      'Audit logs',
      'Compliance reports',
      'Onboarding & training',
    ],
  },
];

const PricingSection = () => (
  <section className="bg-white py-24 px-6">
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[12px] font-bold rounded-full uppercase tracking-wider mb-4">Pricing</span>
        <h2 className="text-[40px] font-black text-slate-900 tracking-tight leading-tight mb-4">Simple, transparent pricing</h2>
        <p className="text-[16px] text-slate-500 max-w-xl mx-auto">Start free, scale as you grow. No hidden fees. Cancel anytime.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border transition-all duration-200 ${
              plan.featured
                ? 'bg-slate-900 border-slate-800 shadow-2xl ring-2 ring-indigo-500/30 scale-[1.03]'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-full shadow-lg">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="p-8 pb-6">
              <h3 className={`text-[18px] font-bold mb-1 ${plan.featured ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
              <p className={`text-[13px] mb-6 ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>

              <div className="flex items-end gap-1 mb-8">
                <span className={`text-[42px] font-black leading-none ${plan.featured ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                <span className={`text-[14px] font-medium mb-1.5 ${plan.featured ? 'text-slate-400' : 'text-slate-400'}`}>{plan.period}</span>
              </div>

              <button className={`w-full py-3 rounded-xl text-[14px] font-bold transition-all duration-150 ${
                plan.featured
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 text-white hover:bg-slate-700'
              }`}>
                {plan.cta}
              </button>
            </div>

            <div className="px-8 pb-8 flex-1">
              <div className={`w-full h-px mb-6 ${plan.featured ? 'bg-white/10' : 'bg-slate-100'}`} />
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.featured ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className={`text-[13px] ${plan.featured ? 'text-slate-300' : 'text-slate-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-[13px] text-slate-400 mt-12">
        All plans include a 14-day free trial. No credit card required.
      </p>
    </div>
  </section>
);

// ── Page ──────────────────────────────────────
export default function UIShowcase() {
  const [view, setView] = useState('header');

  const tabs = [
    { id: 'header', label: 'Header & Share' },
    { id: 'login', label: 'Login Page' },
    { id: 'pricing', label: 'Pricing' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Tab switcher */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-2">
        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mr-2">View:</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${view === t.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === 'header' && (
          <motion.div key="header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <Header />
            <div className="flex items-center justify-center py-32 text-center px-8">
              <div>
                <p className="text-[13px] font-medium text-slate-400 mb-2">Click the <strong className="text-slate-700">Share</strong> button in the top right to see the popover.</p>
                <div className="w-12 h-px bg-slate-200 mx-auto mt-4" />
              </div>
            </div>
          </motion.div>
        )}
        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <LoginPage />
          </motion.div>
        )}
        {view === 'pricing' && (
          <motion.div key="pricing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <PricingSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}