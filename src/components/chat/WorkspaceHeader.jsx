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


function PublishModal({ conversationId, isPublishing, setIsPublishing, onClose }) {
  const [isSuccess, setIsSuccess] = useState(false);
  const appLink = `stensor.base44.app/p/${conversationId || 'xyz123'}`;
  const fullUrl = `https://${appLink}`;
  const handlePublishClick = async () => {
    setIsPublishing(true);
    if (conversationId) {
      try {
        const convs = await base44.entities.Conversation.filter({ conv_id: conversationId });
        if (convs.length > 0) {
          await base44.entities.Conversation.update(convs[0].id, { is_public: true });
        }
      } catch {}
    }
    setIsPublishing(false);
    setIsSuccess(true);
  };
  // VIEW 2: SUCCESS MODAL & SOCIAL MEDIA SHARING
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
        <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col font-open" onClick={(e) => e.stopPropagation()}>
          
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-[15px] text-gray-900">Your app is published and live online!</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-800 font-medium mb-2">App link.</p>
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
              <span className="text-[13px] text-gray-800 truncate">{appLink}</span>
              <div className="flex items-center gap-3 ml-2 text-gray-500">
                <button onClick={() => navigator.clipboard.writeText(fullUrl)} className="hover:text-gray-900" title="Copy"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button onClick={() => window.open(fullUrl, '_blank')} className="hover:text-gray-900" title="Open"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></button>
              </div>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-gray-800 font-medium mb-3">Sharing options</p>
            <div className="flex items-center gap-3">
              <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, '_blank')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#1877F2] hover:bg-gray-50 transition-colors">f</button>
              <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`, '_blank')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#0A66C2] hover:bg-gray-50 transition-colors">in</button>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}`, '_blank')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-black hover:bg-gray-50 transition-colors">𝕏</button>
              <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullUrl)}`, '_blank')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#25D366] hover:bg-gray-50 transition-colors">W</button>
              <button onClick={() => window.open(`https://reddit.com/submit?url=${encodeURIComponent(fullUrl)}`, '_blank')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#FF4500] hover:bg-gray-50 transition-colors">R</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // VIEW 1: DROPDOWN MENU
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="absolute top-full mt-2 right-0 bg-white z-50 w-[300px] p-5"
      style={{ borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.08)' }}
    >
      <h4 className="text-[15px] font-semibold mb-1 text-gray-900">Publish Settings</h4>
      <p className="text-[13px] text-gray-500 mb-5 leading-snug">Make this conversation public and shareable.</p>
      
      <button 
        onClick={handlePublishClick}
        disabled={isPublishing}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isPublishing ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:opacity-90'
        }`}
      >
        {isPublishing ? (
          <>
            <svg className="w-4 h-4 animate-spin text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Publishing...
          </>
        ) : (
          'Publish Now'
        )}
      </button>
      {/* Disclaimer cleanly integrated at the bottom */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-center text-[10px] text-gray-400">
          Stensor is an AI tool · Responses may contain errors
        </p>
      </div>
    </motion.div>
  );
}

export default function WorkspaceHeader({ title, conversationId, user, userPlan, onUpgrade }) {
  const [showCredits, setShowCredits] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const creditsRef = useRef(null);
  const publishRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (creditsRef.current && !creditsRef.current.contains(e.target)) setShowCredits(false);
      if (publishRef.current && !publishRef.current.contains(e.target) && !isPublishing) setShowPublish(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isPublishing]);

  return (
    <header className="flex items-center justify-between px-4 h-12 flex-shrink-0" style={{ background: '#F8F9FA', borderBottom: 'none' }}>
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
        <p className="text-sm font-semibold truncate max-w-[360px]" style={{ color: '#0A0A0A' }}>
          {title || 'New conversation'}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={onUpgrade}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-lg transition-all hover:opacity-90 border"
          style={{ background: 'linear-gradient(90deg, #DDFF00 0%, #FFFFFF 100%)', borderColor: '#DDFF00', color: '#0A0A0A' }}>
          <span className="text-[14px] leading-none"></span>
          Upgrade
        </button>

        <div ref={publishRef} className="relative flex-shrink-0">
          <button
            onClick={() => { if (!isPublishing) setShowPublish((s) => !s); }}
            disabled={isPublishing}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              isPublishing
                ? 'bg-[#1A1A1A] text-gray-400 cursor-not-allowed'
                : 'bg-[#0A0A0A] text-white hover:opacity-90'
            }`}
          >
            {isPublishing ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </button>
          <AnimatePresence>
            {showPublish && (
              <PublishModal
                conversationId={conversationId}
                isPublishing={isPublishing}
                setIsPublishing={setIsPublishing}
                onClose={() => setShowPublish(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}