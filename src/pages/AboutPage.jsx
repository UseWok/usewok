import { motion } from 'framer-motion';
import { Zap, Heart, Globe, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TEAM = [
  { name: 'Jason Hanch', role: 'Founder & CEO', initials: 'JH', color: '#DDFF00', bio: 'Passionate about making financial freedom accessible to everyone.' },
];

const TESTIMONIALS = [
  { name: 'Marie L.', handle: '@marie_invests', text: 'Stensor changed how I think about money. I paid off €8,000 in debt in 6 months following the AI coach\'s plan.', stars: 5, avatar: 'ML' },
  { name: 'Thomas D.', handle: '@td_finance', text: 'Finally an AI that actually explains things clearly. No jargon, just real advice. 10/10.', stars: 5, avatar: 'TD' },
  { name: 'Anaïs B.', handle: '@anais_b', text: 'The Stensor Score feature is incredible — I can track my financial health like I track my fitness.', stars: 5, avatar: 'AB' },
  { name: 'Romain V.', handle: '@romain_invests', text: 'Started with zero investing knowledge. After 3 months with Stensor, I have a diversified portfolio. Amazing.', stars: 5, avatar: 'RV' },
];

const VALUES = [
  { icon: Zap, title: 'Clarity first', desc: 'Complex financial concepts explained simply. No jargon, ever.' },
  { icon: Heart, title: 'Genuine care', desc: 'We\'re here for your long-term success, not quick engagement metrics.' },
  { icon: Globe, title: 'Accessible to all', desc: 'Great financial coaching shouldn\'t be reserved for the wealthy.' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-be">
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-4 pt-16 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yuzu rounded-sm mb-5">
            <Zap className="w-3 h-3 text-fg" />
            <span className="text-[10px] font-black tracking-widest text-fg">OUR MISSION</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-fg leading-tight">
            Making financial freedom<br />accessible to everyone.
          </h1>
          <p className="mt-4 text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
            Stensor was born from a simple observation: great financial coaching is expensive and inaccessible to most people. We're changing that with AI.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-black/8 py-8 mb-12">
        <div className="max-w-2xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { value: '10,000+', label: 'Active users' },
            { value: '500K+', label: 'Questions answered' },
            { value: '4.9★', label: 'Average rating' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <p className="text-2xl font-black text-fg">{stat.value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="max-w-2xl mx-auto px-4 mb-14">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-5">Our values</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {VALUES.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 border border-black/8 rounded-md">
              <div className="w-8 h-8 flex items-center justify-center bg-yuzu rounded-sm mb-3">
                <v.icon className="w-4 h-4 text-fg" />
              </div>
              <p className="text-sm font-black text-fg mb-1">{v.title}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-2xl mx-auto px-4 mb-14">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-5">Team</h2>
        <div className="flex flex-col gap-3">
          {TEAM.map((member, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 border border-black/8 rounded-md">
              <div className="w-12 h-12 flex items-center justify-center rounded-md flex-shrink-0 font-black text-fg"
                style={{ background: member.color }}>
                {member.initials}
              </div>
              <div>
                <p className="text-sm font-black text-fg">{member.name}</p>
                <p className="text-xs text-zinc-500 mb-1">{member.role}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{member.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-2xl mx-auto px-4 mb-14">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-5">What users say</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 border border-black/8 rounded-md bg-white">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-3 h-3 fill-yuzu text-yuzu" />
                ))}
              </div>
              <p className="text-sm text-zinc-700 leading-relaxed mb-3">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 flex items-center justify-center bg-black/8 rounded-full text-[10px] font-black text-fg">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-fg">{t.name}</p>
                  <p className="text-[10px] text-zinc-400">{t.handle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 pb-16 text-center">
        <div className="p-8 bg-fg rounded-md">
          <p className="text-xl font-black text-white mb-2">Ready to take control?</p>
          <p className="text-sm text-white/50 mb-5">Join thousands building financial freedom with Stensor.</p>
          <button onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-yuzu text-fg text-sm font-black rounded-md hover:opacity-90 transition-opacity">
            Start for free <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}