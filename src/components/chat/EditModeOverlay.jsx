import React from 'react';
import { Pencil, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditModeOverlay({ active, onDisable }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-[50] pointer-events-none rounded-2xl"
          style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '2px solid rgba(139, 92, 246, 0.35)',
            boxShadow: 'inset 0 0 40px rgba(139, 92, 246, 0.06)',
          }}
        >
          {/* Badge top-right */}
          <div className="absolute top-3 right-3 pointer-events-auto">
            <div className="flex items-center gap-2 bg-violet-500/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              <Pencil className="w-3 h-3" />
              Mode Édition
              <button
                onClick={onDisable}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}