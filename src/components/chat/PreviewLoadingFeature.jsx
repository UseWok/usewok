import { motion } from 'framer-motion';

export default function PreviewLoadingFeature() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-8 bg-white">
      {/* Awaiting message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 text-sm text-zinc-600"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          ⏱️
        </motion.div>
        <span>Awaiting further instructions</span>
      </motion.div>

      {/* Feature showcase card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-2xl rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100 border border-zinc-200 overflow-hidden shadow-md"
      >
        {/* Code editor mockup */}
        <div className="relative h-56 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-800 p-4 flex items-center justify-center">
          {/* Code window frame */}
          <div className="w-full h-full bg-slate-900 rounded-lg border border-slate-700 p-3 relative overflow-hidden">
            {/* Code editor header */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
              <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-slate-800 rounded">$ Code</span>
            </div>

            {/* Code content mockup */}
            <div className="space-y-2">
              <motion.div
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2 w-24 bg-slate-600 rounded"
              />
              <div className="h-2 w-32 bg-slate-700 rounded" />
              <div className="h-2 w-20 bg-slate-700 rounded" />
            </div>

            {/* Modal overlay on top */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            >
              <div className="bg-slate-800 border border-slate-600 rounded-lg p-5 max-w-xs shadow-2xl">
                <p className="text-white font-semibold text-sm mb-2">Revert and resend message?</p>
                <p className="text-slate-400 text-xs mb-4 leading-relaxed">For the "Try Lovable" button add an arrow icon pointing to lovable.dev</p>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-1.5 text-xs text-slate-300 bg-slate-700 hover:bg-slate-600 rounded transition">Cancel</button>
                  <button className="flex-1 px-3 py-1.5 text-xs text-white bg-slate-600 hover:bg-slate-500 rounded transition">
                    ↻ Reverting...
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Feature description */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Revert and edit messages</h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Revert to any point in chat history or edit past messages to explore new directions. Nothing gets lost.
          </p>
        </div>
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-zinc-400"
          />
        ))}
      </div>
    </div>
  );
}