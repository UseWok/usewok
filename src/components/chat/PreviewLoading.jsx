import { motion } from 'framer-motion';

const MODERN_VIDEOS = [
  { title: 'Fluid Design', color: 'from-blue-600 to-cyan-500' },
  { title: 'Digital Motion', color: 'from-purple-600 to-pink-500' },
  { title: 'Modern UX', color: 'from-orange-500 to-red-500' },
  { title: 'Creative Flow', color: 'from-emerald-500 to-teal-500' },
  { title: 'Interactive Art', color: 'from-indigo-600 to-blue-500' },
  { title: 'Dynamic UI', color: 'from-violet-600 to-purple-500' },
];

export default function PreviewLoading() {
  const randomVideos = MODERN_VIDEOS.sort(() => Math.random() - 0.5).slice(0, 3);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-12 p-8 bg-white">
      {/* Awaiting message */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 text-sm text-zinc-500"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          ⏱️
        </motion.div>
        <span>Awaiting further instructions</span>
      </motion.div>

      {/* Video placeholders */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
        {randomVideos.map((video, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.15 }}
            className="flex flex-col items-center gap-3"
          >
            {/* Video thumbnail placeholder */}
            <div
              className={`w-32 h-20 rounded-lg bg-gradient-to-br ${video.color} shadow-sm overflow-hidden relative`}
            >
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white/10"
              />
            </div>
            {/* Video title */}
            <p className="text-xs text-zinc-600 font-medium text-center">{video.title}</p>
          </motion.div>
        ))}
      </div>

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