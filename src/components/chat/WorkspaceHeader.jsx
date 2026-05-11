import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Lock, Copy, Check, ArrowLeft, TrendingUp, X, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const FG = '#0A0A0A';
const CORAL = '#FF4F00';
const BLUE = '#3B82F6';

function UsageBar({ used, total, color }) {
  const pct = total > 0 ? Math.min(used / total * 100, 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }} />
    </div>
  );
}

function CreditsPopover({ user, userPlan, onClose }) {
  const navigate = useNavigate();
  const flashUsed = user?.credits_used || 0;
  const flashLimit = (userPlan?.credits_limit || 10) + (user?.credits_bonus || 0);
  const deepUsed = user?.deep_credits_used || 0;
  const deepLimit = userPlan?.deep_credits_limit || 0;
  const now = new Date();
  const renewal = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const renewalStr = renewal.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      className="absolute top-full mt-2 left-0 bg-white z-50 w-[260px] overflow-hidden"
      style={{ borderRadius: '12px', boxShadow: '0 16px 48px rgba(0,0,0,0.14)', border: '1px solid rgba(0,0,0,0.09)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <span className="text-sm font-bold" style={{ color: FG }}>Consommation</span>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/5">
          <X className="w-3.5 h-3.5" style={{ color: '#bbb' }} />
        </button>
      </div>
      <div className="px-4 py-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: FG }}>⚡ Flash ce mois-ci</span>
            <span className="text-xs font-bold" style={{ color: '#888' }}>{flashUsed}/{flashLimit}</span>
          </div>
          <UsageBar used={flashUsed} total={flashLimit} color={BLUE} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: FG }}>🧠 Deep Synthèses</span>
            <span className="text-xs font-bold" style={{ color: '#888' }}>{deepUsed}{deepLimit > 0 ? `/${deepLimit}` : ''}</span>
          </div>
          {deepLimit > 0 && <UsageBar used={deepUsed} total={deepLimit} color={CORAL} />}
          {deepLimit === 0 && <p className="text-[10px]" style={{ color: '#bbb' }}>Inclus dans votre plan</p>}
        </div>
        <p className="text-[10px] font-medium" style={{ color: BLUE }}>Renouvellement le {renewalStr}</p>
      </div>
      <div className="h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
      <div className="px-4 py-3 flex flex-col gap-2">
        <button onClick={() => { onClose(); navigate('/pricing'); }}
          className="w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 rounded-lg transition-all hover:opacity-90"
          style={{ background: FG, color: 'white' }}>
          <TrendingUp className="w-3 h-3" /> Upgrade →
        </button>
        <button onClick={() => { onClose(); navigate('/app'); }}
          className="w-full py-2 text-xs font-medium flex items-center justify-center gap-1.5 rounded-lg transition-all hover:bg-black/5"
          style={{ color: '#888' }}>
          <ArrowLeft className="w-3 h-3" /> Back to Home
        </button>
      </div>
    </motion.div>
  );
}

function PublishModal({ conversationId }) {
  const link = `${window.location.origin}/p/${conversationId || 'xyz123'}`;
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    setSaving(true);
    if (conversationId) {
      try {
        const convs = await base44.entities.Conversation.filter({ conv_id: conversationId });
        if (convs.length > 0) {
          await base44.entities.Conversation.update(convs[0].id, { is_public: visibility === 'public' });
        }
      } catch {}
    }
    setSaving(false);
    setPublished(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-full mt-2 right-0 bg-white z-50 w-[300px] overflow-hidden"
      style={{ borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: '1px solid rgba(0,0,0,0.10)' }}>
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
        <button onClick={handlePublish} disabled={saving}
          className="w-full py-3.5 rounded-lg text-sm font-black transition-all hover:opacity-90"
          style={{ background: published ? '#16a34a' : FG, color: 'white' }}>
          {saving ? '...' : published ? '✓ Published' : 'Publish Now'}
        </button>
      </div>
    </motion.div>
  );
}

export default function WorkspaceHeader({ title, conversationId, user, userPlan, onUpgrade }) {
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
      className="flex items-center justify-between px-4 h-12 flex-shrink-0"
      style={{ background: '#F8F9FA', borderBottom: 'none' }}
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div ref={creditsRef} className="relative flex-shrink-0">
          <button
            onClick={() => setShowCredits((s) => !s)}
            className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-black/8 transition-colors">
            <img src={LOGO_URL} alt="Stensor" className="w-5 h-5 object-contain" />
          </button>
          <AnimatePresence>
            {showCredits && <CreditsPopover user={user} userPlan={userPlan} onClose={() => setShowCredits(false)} />}
          </AnimatePresence>
        </div>
        <p className="text-sm font-semibold truncate max-w-[360px]" style={{ color: FG }}>
          {title || 'New conversation'}
        </p>
      </div>

      {/* Right: Upgrade + Publish */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* BOUTON UPGRADE (Diamant texte et espacement ajusté) */}
        <button onClick={onUpgrade}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-lg transition-all hover:opacity-90"
          style={{ background: '#DDFF00', color: '#0A0A0A' }}>
          <span className="text-[14px] leading-none">♦</span>
          Upgrade
        </button>

        {/* BOUTON PUBLISH (Sans icône) */}
        <div ref={publishRef} className="relative flex-shrink-0">
          <button onClick={() => setShowPublish((s) => !s)}
            className="flex items-center px-4 py-2 text-xs font-medium rounded-lg transition-all hover:opacity-90"
            style={{ background: FG, color: 'white' }}>
            Publish
          </button>
          <AnimatePresence>
            {showPublish && <PublishModal conversationId={conversationId} />}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}