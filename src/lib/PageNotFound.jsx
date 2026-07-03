import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#FBF8F2', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm w-full text-center"
      >
        {/* 404 badge */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{ background: '#FF5A1F' }}>
            <span className="text-3xl font-black" style={{ color: '#FBF8F2' }}>404</span>
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: '#15130F', letterSpacing: '-0.03em' }}>Page not found</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(21,19,15,0.55)' }}>
            This page doesn't exist or may have been moved.
          </p>
        </div>

        {/* Divider */}
        <div className="w-12 h-0.5 mx-auto mb-8" style={{ background: 'rgba(21,19,15,0.10)' }} />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center justify-center gap-2 w-full py-3 font-bold text-sm rounded-lg transition-opacity hover:opacity-90"
            style={{ background: '#15130F', color: '#FBF8F2' }}
          >
            <Home className="w-4 h-4" />
            Back to home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium transition-colors"
            style={{ color: 'rgba(21,19,15,0.45)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#15130F'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(21,19,15,0.45)'}
          >
            <Compass className="w-4 h-4" />
            Go back
          </button>
        </div>
      </motion.div>
    </div>
  );
}