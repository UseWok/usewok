import { useState } from 'react';
import { Plus, SlidersHorizontal, Mic, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = ['CRM', 'Productivité', 'Divertissement', 'Éducatif', 'Finances personnelles'];

export default function HeroSection() {
  const [query, setQuery] = useState('');

  return (
    <section className="max-w-3xl mx-auto text-center px-4">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-foreground tracking-tight"
      >
        Que construirez-vous ensuite ?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-3 text-sm text-muted-foreground"
      >
        Décrivez votre idée d'application ci-dessous ou inspirez-vous de nos{' '}
        <span className="underline cursor-pointer text-foreground font-medium">modèles</span>
      </motion.p>

      {/* Input card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 bg-card border border-border rounded-2xl p-4 shadow-sm"
      >
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Décrivez l'application que vous souhaitez créer..."
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">Planifier</span>
            <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <Mic className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity shadow-md">
              <ArrowRight className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-5"
      >
        <p className="text-xs text-muted-foreground mb-3">Que souhaitez-vous créer ?</p>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              className="px-4 py-1.5 rounded-full border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              {cat}
            </button>
          ))}
          <button className="px-4 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            ··· Plus
          </button>
        </div>
      </motion.div>
    </section>
  );
}