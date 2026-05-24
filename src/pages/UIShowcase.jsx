import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy, Check, Mail, ExternalLink, Monitor, Smartphone } from 'lucide-react';

// ── Social Icons ──────────────────────────────
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const RedditIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// ── Shimmer Skeleton ──────────────────────────
const Skeleton = ({ className = '', style = {} }) => (
  <div
    className={`rounded-lg ${className}`}
    style={{
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '400% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
      ...style,
    }}
  />
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
    { icon: <Mail className="w-[15px] h-[15px]" />, href: `mailto:?body=${encodeURIComponent(previewUrl)}`, label: 'Email' },
    { icon: <FacebookIcon />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(previewUrl)}`, label: 'Facebook' },
    { icon: <WhatsAppIcon />, href: `https://api.whatsapp.com/send?text=${encodeURIComponent(previewUrl)}`, label: 'WhatsApp' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="absolute top-[calc(100%+8px)] right-0 w-[320px] bg-white border border-slate-150 rounded-2xl z-50 overflow-hidden"
      style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.10), 0 2px 12px rgba(0,0,0,0.05)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-100">
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <h3 className="text-[14px] font-semibold text-slate-900">Share this project</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
          <span className="text-[13px] font-medium text-slate-700">
            {isPublic ? '🌐  Public' : '🔒  Private'}
          </span>
          <button
            onClick={() => setIsPublic(v => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${isPublic ? 'bg-slate-900' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isPublic ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Preview Link */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Preview Link</p>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <input
              readOnly
              value={previewUrl}
              className="flex-1 bg-transparent text-[11px] font-mono text-slate-500 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
            >
              {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
        </div>

        {/* Social Sharing */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Share via</p>
          <div className="grid grid-cols-6 gap-1.5">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                className="aspect-square flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-transparent transition-all duration-150"
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

// ── Header ────────────────────────────────────
const Header = () => {
  const [showShare, setShowShare] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowShare(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100/80 px-6 md:px-10 h-[58px] flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <span className="text-[17px] font-black tracking-tight text-slate-900 italic">ACME</span>
        <div className="hidden md:flex items-center gap-5">
          {['Product', 'Docs', 'Blog'].map(item => (
            <a key={item} href="#" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">{item}</a>
          ))}
          {/* Clean borderless project indicator */}
          <span className="text-[13px] font-semibold text-slate-900">My Project</span>
        </div>
      </div>

      <div className="flex items-center gap-2" ref={ref}>
        <div className="relative">
          <button
            onClick={() => setShowShare(v => !v)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-[13px] font-semibold rounded-xl hover:bg-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

// ── Smart Preview Canvas ──────────────────────
const SmartPreviewCanvas = () => {
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState('desktop');
  const containerRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  // Sample preview content rendered inside the scaled frame
  const previewSrc = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-50 font-sans p-8">
      <div class="max-w-3xl mx-auto">
        <div class="h-10 w-48 bg-slate-200 rounded-lg mb-6"></div>
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white border border-slate-200 rounded-2xl p-5"><div class="h-6 w-20 bg-slate-100 rounded mb-2"></div><div class="h-8 w-16 bg-indigo-100 rounded"></div></div>
          <div class="bg-white border border-slate-200 rounded-2xl p-5"><div class="h-6 w-20 bg-slate-100 rounded mb-2"></div><div class="h-8 w-16 bg-emerald-100 rounded"></div></div>
          <div class="bg-white border border-slate-200 rounded-2xl p-5"><div class="h-6 w-20 bg-slate-100 rounded mb-2"></div><div class="h-8 w-16 bg-amber-100 rounded"></div></div>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-6 mb-4">
          <div class="h-5 w-32 bg-slate-200 rounded mb-4"></div>
          <div class="h-40 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl flex items-end px-4 pb-4 gap-3">
            <div class="w-8 bg-indigo-300 rounded-t" style="height:60%"></div>
            <div class="w-8 bg-indigo-400 rounded-t" style="height:80%"></div>
            <div class="w-8 bg-indigo-500 rounded-t" style="height:50%"></div>
            <div class="w-8 bg-indigo-400 rounded-t" style="height:90%"></div>
            <div class="w-8 bg-indigo-300 rounded-t" style="height:70%"></div>
            <div class="w-8 bg-indigo-500 rounded-t" style="height:100%"></div>
            <div class="w-8 bg-indigo-400 rounded-t" style="height:65%"></div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
            <div class="h-3 bg-slate-100 rounded w-full"></div>
            <div class="h-3 bg-slate-100 rounded w-4/5"></div>
            <div class="h-3 bg-slate-100 rounded w-3/5"></div>
          </div>
          <div class="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
            <div class="h-3 bg-slate-100 rounded w-full"></div>
            <div class="h-3 bg-slate-100 rounded w-2/3"></div>
            <div class="h-3 bg-slate-100 rounded w-4/5"></div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return (
    <div className="bg-slate-100 min-h-[calc(100vh-108px)] flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-md transition-all ${device === 'desktop' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-md transition-all ${device === 'mobile' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
        <span className="text-[11px] font-mono text-slate-400">preview-only</span>
      </div>

      {/* Canvas area — smart fit */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-hidden">
        <div
          ref={containerRef}
          className="relative transition-all duration-300"
          style={{
            width: device === 'desktop' ? '100%' : '390px',
            maxWidth: device === 'desktop' ? '1200px' : '390px',
          }}
        >
          {/* Browser chrome */}
          <div className="bg-[#2a2a2a] rounded-t-xl px-4 py-2.5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            </div>
            <div className="flex-1 mx-2 bg-[#1a1a1a] rounded-md px-3 py-1 text-[11px] text-slate-500 font-mono truncate">
              {window.location.origin}/p/my-project-preview
            </div>
          </div>

          {/* Frame */}
          <div className="bg-slate-50 rounded-b-xl overflow-hidden border-x border-b border-slate-200 shadow-2xl"
            style={{ height: device === 'desktop' ? '520px' : '700px' }}
          >
            {loading ? (
              <div className="p-8 space-y-4">
                <Skeleton style={{ height: 40, width: '40%' }} />
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton style={{ height: 80 }} />
                  <Skeleton style={{ height: 80 }} />
                  <Skeleton style={{ height: 80 }} />
                </div>
                <Skeleton style={{ height: 160 }} />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton style={{ height: 80 }} />
                  <Skeleton style={{ height: 80 }} />
                </div>
              </div>
            ) : (
              <iframe
                srcDoc={previewSrc}
                className="w-full h-full border-none"
                sandbox="allow-scripts"
                title="Smart Preview"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Futuristic Illustration ───────────────────
const FuturisticPanel = () => (
  <div className="w-full h-full relative overflow-hidden flex items-center justify-center"
    style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0a1f 50%, #0a0f1a 100%)' }}
  >
    {/* Grid */}
    <div className="absolute inset-0" style={{
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
      backgroundSize: '48px 48px',
    }} />

    {/* Glow blobs */}
    <div className="absolute" style={{ width: 400, height: 400, top: '10%', left: '10%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
    <div className="absolute" style={{ width: 300, height: 300, bottom: '10%', right: '5%', background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />

    {/* Rings */}
    <div className="absolute inset-0 flex items-center justify-center">
      {[300, 220, 150].map((size, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: size, height: size,
          border: `1px solid rgba(${i === 0 ? '99,102,241' : i === 1 ? '139,92,246' : '167,139,250'},${0.08 + i * 0.04})`,
          animation: `ui-spin ${20 + i * 7}s linear infinite ${i % 2 === 1 ? 'reverse' : ''}`,
        }} />
      ))}

      {/* Center orb */}
      <div className="relative z-10" style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'radial-gradient(circle, #a78bfa 0%, #6d28d9 60%, #4c1d95 100%)',
        boxShadow: '0 0 40px rgba(139,92,246,0.5), 0 0 80px rgba(99,102,241,0.2)',
      }}>
        <div className="absolute inset-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)' }} />
      </div>

      {/* Orbiting dots */}
      {[
        { angle: 0, r: 75, color: '#a78bfa' },
        { angle: 120, r: 75, color: '#f472b6' },
        { angle: 240, r: 75, color: '#34d399' },
        { angle: 70, r: 110, color: '#60a5fa' },
        { angle: 190, r: 110, color: '#fbbf24' },
      ].map((dot, i) => (
        <div key={i} className="absolute w-2.5 h-2.5 rounded-full" style={{
          backgroundColor: dot.color,
          boxShadow: `0 0 10px ${dot.color}`,
          transform: `rotate(${dot.angle}deg) translateX(${dot.r}px)`,
        }} />
      ))}
    </div>

    {/* Floating chips */}
    {[
      { text: 'AI-Powered', pos: { top: '20%', left: '8%' } },
      { text: 'Real-time', pos: { bottom: '24%', right: '8%' } },
      { text: 'Secure', pos: { top: '62%', left: '6%' } },
    ].map((chip) => (
      <div key={chip.text} className="absolute px-3 py-1.5 rounded-full text-[10px] font-semibold tracking-wide" style={{
        ...chip.pos,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        color: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(8px)',
      }}>
        {chip.text}
      </div>
    ))}

    <style>{`
      @keyframes ui-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes shimmer { 0%,100% { background-position: 200% 0; } 50% { background-position: -200% 0; } }
    `}</style>
  </div>
);

// ── Login Page ────────────────────────────────
const LoginPage = () => (
  <div className="flex h-screen w-full overflow-hidden bg-white">
    {/* Left — Login panel */}
    <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-8 py-12 bg-white">
      {/* Mobile illustration (top, small) */}
      <div className="md:hidden w-full h-40 rounded-2xl overflow-hidden mb-8 flex-shrink-0">
        <FuturisticPanel />
      </div>

      <div className="w-full max-w-[340px]">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 mb-6">
            <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight mb-1.5">Welcome back</h1>
          <p className="text-[14px] text-slate-500">Sign in to continue to your workspace.</p>
        </div>

        {/* Google Button */}
        <button className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-[14px] font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-200 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer */}
        <p className="mt-8 text-center text-[11px] text-slate-400 leading-relaxed">
          By continuing, you agree to our{' '}
          <a href="#" className="underline underline-offset-2 hover:text-slate-700 transition-colors">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="underline underline-offset-2 hover:text-slate-700 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>

    {/* Right — Illustration (desktop only) */}
    <div className="hidden md:block md:w-1/2 h-full">
      <FuturisticPanel />
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
    features: ['Up to 5 projects', '10,000 AI generations / mo', 'Custom domain', 'Priority support', 'Analytics dashboard', 'Export to code'],
  },
  {
    name: 'Max',
    price: '$69',
    period: '/month',
    description: 'For growing teams that need more power.',
    cta: 'Get started',
    featured: true,
    badge: 'Most Popular',
    features: ['Unlimited projects', '100,000 AI generations / mo', 'Custom domains (5)', 'Dedicated support', 'Advanced analytics', 'White-label options', 'Team collaboration', 'API access'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'Tailored solutions for large organizations.',
    cta: 'Contact sales',
    features: ['Unlimited everything', 'SLA guarantee (99.9%)', 'Dedicated infrastructure', 'Custom integrations', 'SSO / SAML', 'Audit logs', 'Compliance reports', 'Onboarding & training'],
  },
];

const PricingSection = () => (
  <section className="bg-white py-20 px-6">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full uppercase tracking-wider mb-4">Pricing</span>
        <h2 className="text-[36px] font-black text-slate-900 tracking-tight leading-tight mb-3">Simple, transparent pricing</h2>
        <p className="text-[15px] text-slate-500 max-w-md mx-auto">Start free, scale as you grow. No hidden fees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {PLANS.map((plan) => (
          <div key={plan.name} className={`relative flex flex-col rounded-2xl border transition-all duration-200 ${
            plan.featured ? 'bg-slate-900 border-slate-800 shadow-2xl md:scale-[1.03]' : 'bg-white border-slate-200 hover:shadow-md'
          }`}>
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow">{plan.badge}</span>
              </div>
            )}
            <div className="p-7 pb-5">
              <h3 className={`text-[17px] font-bold mb-1 ${plan.featured ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
              <p className={`text-[12px] mb-5 ${plan.featured ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
              <div className="flex items-end gap-1 mb-6">
                <span className={`text-[38px] font-black leading-none ${plan.featured ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                <span className={`text-[13px] mb-1 ${plan.featured ? 'text-slate-400' : 'text-slate-400'}`}>{plan.period}</span>
              </div>
              <button className={`w-full py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                plan.featured ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-900 text-white hover:bg-slate-700'
              }`}>
                {plan.cta}
              </button>
            </div>
            <div className="px-7 pb-7 flex-1">
              <div className={`w-full h-px mb-5 ${plan.featured ? 'bg-white/10' : 'bg-slate-100'}`} />
              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.featured ? 'text-indigo-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    <span className={`text-[12px] ${plan.featured ? 'text-slate-300' : 'text-slate-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-[12px] text-slate-400 mt-10">14-day free trial. No credit card required.</p>
    </div>
  </section>
);

// ── Main Showcase Page ────────────────────────
export default function UIShowcase() {
  const [view, setView] = useState('header');

  const tabs = [
    { id: 'header', label: 'Header & Share' },
    { id: 'preview', label: 'Preview Canvas' },
    { id: 'login', label: 'Login Page' },
    { id: 'pricing', label: 'Pricing' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Tab bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 whitespace-nowrap">View:</span>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all ${view === t.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === 'header' && (
          <motion.div key="header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            <Header />
            <div className="flex items-center justify-center py-28 text-center px-8 bg-slate-50">
              <p className="text-[13px] text-slate-400">Click the <strong className="text-slate-700">Share</strong> button in the top right to open the popover.</p>
            </div>
          </motion.div>
        )}
        {view === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            <SmartPreviewCanvas />
          </motion.div>
        )}
        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            <LoginPage />
          </motion.div>
        )}
        {view === 'pricing' && (
          <motion.div key="pricing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            <PricingSection />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}