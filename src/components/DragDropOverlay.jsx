import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Lock } from 'lucide-react';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function DragDropOverlay({ visible, canUpload }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
          style={{
            background: canUpload ? 'rgba(221,255,0,0.12)' : 'rgba(239,68,68,0.07)',
            border: `2px dashed ${canUpload ? YUZU : '#ef4444'}`,
            borderRadius: '6px',
          }}>
          <div className="w-12 h-12 flex items-center justify-center mb-3 rounded-full"
            style={{ background: canUpload ? YUZU : 'rgba(239,68,68,0.1)' }}>
            {canUpload
              ? <Upload className="w-6 h-6" style={{ color: FG }} />
              : <Lock className="w-6 h-6" style={{ color: '#ef4444' }} />}
          </div>
          <p className="text-sm font-black" style={{ color: canUpload ? FG : '#ef4444' }}>
            {canUpload ? 'Déposer ici' : 'Mettez à niveau pour joindre des fichiers'}
          </p>
          {canUpload && <p className="text-xs mt-1" style={{ color: '#888' }}>Relâchez pour ajouter le fichier</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}