import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, LogOut, Copy, Globe, Lock, X, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';
const FG = '#0A0A0A';

function LogoMenu({ onBack }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(s => !s)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-black/5 transition-colors">
        <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain" />
        <ChevronDown className="w-3 h-3 text-zinc-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1.5 left-0 bg-white border border-black/8 rounded-xl shadow-xl z-50 min-w-[160px] overflow-hidden"
          >
            <button onClick={() => { setOpen(false); navigate('/pricing'); }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-sm hover:bg-black/4 transition-colors text-left"
              style={{ color: FG }}>
              <Zap className="w-3.5 h-3.5 text-zinc-400" /> Conso
            </button>
            <div className="h-px bg-black/5" />
            <button onClick={() => { setOpen(false); navigate('/app'); }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-sm hover:bg-black/4 transition-colors text-left"
              style={{ color: FG }}>
              <LogOut className="w-3.5 h-3.5 text-zinc-400" /> Retour à l'accueil
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PublishModal({ onClose, conversationId }) {
  const link = `stensor.ai/p/${conversationId || 'xyz123'}`;
  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState('public');
  const [published, setPublished] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${link}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-full mt-2 right-0 bg-white border border-black/8 rounded-2xl shadow-2xl z-50 w-[320px] overflow-hidden"
    >
      {/* Link */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Lien public</p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-black/8 bg-black/3">
          <Globe className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          <span className="flex-1 text-xs font-medium truncate" style={{ color: FG }}>{link}</span>
          <button onClick={handleCopy}
            className="flex items-center justify-center w-6 h-6 rounded-lg transition-colors hover:bg-black/8">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
          </button>
        </div>
      </div>

      <div className="h-px bg-black/5 mx-4" />

      {/* Visibility */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">App Visibility</p>
        <div className="flex gap-2">
          {[
            { id: 'public', label: 'Public', icon: Globe },
            { id: 'private', label: 'Privé', icon: Lock },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setVisibility(id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border"
              style={{
                background: visibility === id ? FG : 'transparent',
                color: visibility === id ? 'white' : '#999',
                borderColor: visibility === id ? FG : 'rgba(0,0,0,0.08)',
              }}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-black/5 mx-4" />

      {/* Action */}
      <div className="px-4 py-3">
        <button onClick={() => setPublished(true)}
          className="w-full py-3 rounded-xl text-sm font-black transition-all hover:opacity-90"
          style={{ background: published ? '#16a34a' : FG, color: 'white' }}>
          {published ? '✓ Publié' : 'Publier maintenant'}
        </button>
      </div>
    </motion.div>
  );
}

export default function WorkspaceHeader({ title, conversationId }) {
  const [favorited, setFavorited] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const publishRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (publishRef.current && !publishRef.current.contains(e.target)) setShowModal(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleFavorite = () => {
    setFavorited(true);
    setTimeout(() => setShowPublish(true), 600);
  };

  return (
    <header className="flex items-center justify-between px-4 h-12 flex-shrink-0 bg-white"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
      {/* Left: logo dropdown */}
      <LogoMenu />

      {/* Center: title */}
      <p className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold truncate max-w-[40%]"
        style={{ color: FG }}>
        {title || 'Nouvelle discussion'}
      </p>

      {/* Right: favorite + publish */}
      <div ref={publishRef} className="relative flex items-center gap-2">
        <AnimatePresence mode="popLayout">
          {showPublish && (
            <motion.button
              key="publish"
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setShowModal(s => !s)}
              className="px-3 py-1.5 text-xs font-black rounded-lg transition-all hover:opacity-90"
              style={{ background: FG, color: 'white' }}>
              Publier
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          animate={favorited ? { x: showPublish ? -4 : 0 } : {}}
          onClick={!favorited ? handleFavorite : undefined}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-black/5"
        >
          <motion.div
            animate={favorited ? { scale: [1, 1.5, 0.85, 1.1, 1], rotate: [0, -15, 15, -5, 0] } : {}}
            transition={{ duration: 0.5 }}>
            <Star
              className="w-4 h-4 transition-colors"
              style={{ color: favorited ? '#DDFF00' : '#999', fill: favorited ? '#DDFF00' : 'none', stroke: favorited ? '#999' : '#999' }}
            />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showModal && (
            <PublishModal onClose={() => setShowModal(false)} conversationId={conversationId} />
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}