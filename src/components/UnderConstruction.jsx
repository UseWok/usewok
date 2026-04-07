import { motion } from 'framer-motion';
import { Hammer, Zap, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const CORAL = '#FF4F00';

export default function UnderConstruction({ title = "Bientôt disponible", subtitle = "Cette section est en cours de développement." }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 font-be">
      <div className="w-full max-w-lg text-center">

        {/* Animated icon cluster */}
        <div className="relative w-32 h-32 mx-auto mb-10">
          {/* Pulsing bg */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full"
            style={{ background: YUZU }} />
          {/* Orbiting dot 1 */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
              style={{ background: CORAL }} />
          </motion.div>
          {/* Orbiting dot 2 */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="absolute inset-2">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
              style={{ background: FG, opacity: 0.4 }} />
          </motion.div>
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 flex items-center justify-center"
              style={{ background: FG, borderRadius: '24px' }}>
              <motion.div
                animate={{ rotate: [0, -15, 15, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
                <Hammer className="w-9 h-9" style={{ color: YUZU }} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-5"
          style={{ background: YUZU, borderRadius: '6px' }}>
          <Sparkles className="w-3 h-3" style={{ color: FG }} />
          <span className="text-[10px] font-black tracking-widest" style={{ color: FG }}>EN DÉVELOPPEMENT</span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl font-black mb-4 leading-tight"
          style={{ color: FG }}>
          {title}
        </motion.h2>

        {/* Pathos — émotion */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base mb-3 leading-relaxed"
          style={{ color: '#555' }}>
          {subtitle}
        </motion.p>

        {/* Logos — argument rationnel */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8 px-5 py-4"
          style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-start gap-3 text-left">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: FG, borderRadius: '8px' }}>
              <TrendingUp className="w-4 h-4" style={{ color: YUZU }} />
            </div>
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: FG }}>En attendant, maîtrisez l'essentiel</p>
              <p className="text-xs leading-relaxed" style={{ color: '#888' }}>
                Les utilisateurs qui maîtrisent les bases de Stensor obtiennent des réponses <strong>3x plus précises</strong> et économisent en moyenne <strong>2h par semaine</strong> sur leur gestion financière.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Ethos — preuve de confiance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-6 mb-10">
          {[
            { value: '10 000+', label: 'utilisateurs actifs' },
            { value: '98%', label: 'de satisfaction' },
            { value: '4.9★', label: 'note moyenne' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-lg font-black" style={{ color: FG }}>{stat.value}</p>
              <p className="text-[10px] font-semibold" style={{ color: '#bbb' }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-black transition-all"
            style={{ background: FG, color: 'white', borderRadius: '10px' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Zap className="w-4 h-4" />
            Démarrer une conversation
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold transition-all"
            style={{ background: 'rgba(0,0,0,0.05)', color: '#555', borderRadius: '10px' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}>
            Retour à l'accueil <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

      </div>
    </div>
  );
}