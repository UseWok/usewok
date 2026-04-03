import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const apps = [
  {
    name: 'Stensor',
    desc: 'Plongez dans une expérience immersive',
    color: 'bg-green-100',
    emoji: '🌿',
  },
  {
    name: 'Go App',
    desc: 'Une application simple pour tout gérer',
    color: 'bg-yellow-100',
    emoji: '⚡',
  },
  {
    name: 'DataFlow',
    desc: 'Gérez vos données efficacement',
    color: 'bg-blue-100',
    emoji: '📊',
  },
];

export default function RecentApps() {
  const [activeTab, setActiveTab] = useState('recent');

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="max-w-3xl mx-auto mt-12 px-4"
    >
      {/* Gradient card */}
      <div className="rounded-2xl bg-gradient-to-b from-orange-50 to-orange-100/50 border border-orange-200/30 p-5">
        {/* Tabs + See all */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('recent')}
              className={`text-sm font-medium pb-0.5 transition-colors ${
                activeTab === 'recent'
                  ? 'text-foreground border-b-2 border-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Apps récentes
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`text-sm font-medium pb-0.5 transition-colors ${
                activeTab === 'models'
                  ? 'text-foreground border-b-2 border-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Modèles
            </button>
          </div>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            Voir tout
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* App cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {apps.map((app) => (
            <div
              key={app.name}
              className="bg-card rounded-xl p-3 border border-border hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${app.color} flex items-center justify-center text-lg`}>
                  {app.emoji}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {app.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{app.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}