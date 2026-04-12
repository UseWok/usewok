import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, MessageSquare } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 font-be">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm w-full text-center"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <img src={LOGO_URL} alt="Stensor" className="w-8 h-8 object-contain" />
          <span className="font-black text-lg text-fg tracking-tight">Stensor</span>
        </div>

        {/* 404 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yuzu rounded-2xl mb-6">
            <span className="text-3xl font-black text-fg">404</span>
          </div>
          <h1 className="text-2xl font-black text-fg mb-2">Page introuvable</h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Cette page n'existe pas ou a été déplacée.
          </p>
        </div>

        {/* Divider */}
        <div className="w-12 h-0.5 bg-black/10 mx-auto mb-8" />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-fg text-white font-bold text-sm rounded-md hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-yuzu text-fg font-bold text-sm rounded-md hover:opacity-90 transition-opacity"
          >
            <MessageSquare className="w-4 h-4" />
            Démarrer une conversation
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-zinc-500 hover:text-fg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Revenir en arrière
          </button>
        </div>
      </motion.div>
    </div>
  );
}