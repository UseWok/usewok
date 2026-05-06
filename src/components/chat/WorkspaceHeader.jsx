import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Lock, Copy, Check, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const FG = '#0A0A0A';

function CreditsPopover({ user, userPlan, onClose }) {
  const navigate = useNavigate();
  const creditsUsed = user?.credits_used || 0;
  const creditsLimit = userPlan ? (userPlan.credits_limit || 10) + (user?.credits_bonus || 0) : 10;
  const pct = Math.min(100, Math.round((creditsUsed / creditsLimit) * 100));
  const remaining = Math.max(0, creditsLimit - creditsUsed);
  const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : FG;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      className="absolute top-full mt-2 left-0 bg-white border border-black/8 z-50 w-[220px] overflow-hidden"
      style={{ borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.14)' }}
    >
      <div className="px-4 pt-4 pb-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Flash Usage</p>
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-black" style={{ color: FG }}>{remaining}</span>
          <span className="text-xs text-zinc-400 mb-1">/ {creditsLimit} left</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-black/8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: barColor }}
          />
        </div>
        <p className="text-[10px] text-zinc-400 mt-1.5">{pct}% used this month</p>
        {userPlan?.name && (
          <p className="text-[10px] font-bold mt-1" style={{ color: FG }}>{userPlan.name}</p>
        )}
      </div>

      <div className="h-px bg-black/5" />

      <button
        onClick={() => { onClose(); navigate('/app'); }}
        className="flex items-center gap-2.5 w-full px-4 py-3 text-sm hover:bg-black/4 transition-colors text-left"
        style={{ color: FG }}
      >
        <LogOut className="w-3.5 h-3.5 text-zinc-400" />
        Back to Home
      </button>
    </motion.div>
  );
}

function PublishModal({ conversationId }) {
  const link = `${window.location.origin}/p/${conversationId || 'xyz123'}`;
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [published, setPublished] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-full mt-2 right-0 bg-white border border-black/10 z-50 w-[300px] overflow-hidden"
      style={{ borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
    >
      <div className="px-5 pt-5 pb-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Public Link</p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-black/8 bg-zinc-50">
          <Globe className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          <span className="flex-1 text-[11px] font-medium truncate" style={{ color: FG }}>{link}</span>
          <button onClick={handleCopy} className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-black/8 transition-colors flex-shrink-0">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
          </button>
        </div>
      </div>

      <div className="h-px bg-black/5 mx-5" />

      <div className="px-5 py-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Visibility</p>
        <div className="flex gap-2">
          {[
            { id: 'public', label: 'Public', icon: Globe },
            { id: 'private', label: 'Private', icon: Lock },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setVisibility(id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all border rounded-lg"
              style={{
                background: visibility === id ? FG : 'transparent',
                color: visibility === id ? 'white' : '#999',
                borderColor: visibility === id ? FG : 'rgba(0,0,0,0.1)',
              }}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={() => setPublished(true)}
          className="w-full py-3.5 rounded-lg text-sm font-black transition-all hover:opacity-90"
          style={{ background: published ? '#16a34a' : FG, color: 'white' }}
        >
          {published ? '✓ Published' : 'Publish Now'}
        </button>
      </div>
    </motion.div>
  );
}

export default function WorkspaceHeader({ title, conversationId, user, userPlan }) {
  const [showCredits, setShowCredits] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const creditsRef = useRef(null);
  const publishRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (creditsRef.current && !creditsRef.current.contains(e.target)) setShowCredits(false);
      if (publishRef.current && !publishRef.current.contains(e.target)) setShowPublish(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header
      className="flex items-center justify-between px-4 h-12 flex-shrink-0 bg-white"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div ref={creditsRef} className="relative flex-shrink-0">
          <button
            onClick={() => setShowCredits(s => !s)}
            className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-black/5 transition-colors"
          >
            <img src={LOGO_URL} alt="Stensor" className="w-5 h-5 object-contain" />
          </button>
          <AnimatePresence>
            {showCredits && (
              <CreditsPopover
                user={user}
                userPlan={userPlan}
                onClose={() => setShowCredits(false)}
              />
            )}
          </AnimatePresence>
        </div>

        <p className="text-sm font-semibold truncate max-w-[360px]" style={{ color: FG }}>
          {title || 'New conversation'}
        </p>
      </div>

      {/* Right: Publish */}
      <div ref={publishRef} className="relative flex-shrink-0">
        <button
          onClick={() => setShowPublish(s => !s)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all hover:opacity-90"
          style={{ background: FG, color: 'white' }}
        >
          <Globe className="w-3.5 h-3.5" />
          Publish
        </button>
        <AnimatePresence>
          {showPublish && <PublishModal conversationId={conversationId} />}
        </AnimatePresence>
      </div>
    </header>
  );
}