import { motion } from 'framer-motion';
import { Zap, Heart, Globe, ArrowRight, Star, Shield, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const blur = (delay = 0, y = 8) => ({
  initial: { opacity: 0, filter: `blur(10px)`, y },
  animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const blurView = (delay = 0) => ({
  initial: { opacity: 0, filter: 'blur(10px)', y: 8 },
  whileInView: { opacity: 1, filter: 'blur(0px)', y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
});

const TEAM = [
  {
    name: 'Jason Hanch',
    role: 'Founder & CEO',
    initials: 'JH',
    bio: 'Built Stensor after realizing great financial coaching shouldn\'t cost $300/hour. Making AI-powered clarity accessible to everyone.',
  },
];

const TESTIMONIALS = [
  { name: 'Marie L.', handle: '@marie_invests', text: 'Stensor changed how I think about money. I paid off €8,000 in debt in 6 months following the AI plan.', stars: 5, avatar: 'ML' },
  { name: 'Thomas D.', handle: '@td_finance', text: 'Finally an AI that explains things clearly. No jargon, just real actionable advice. 10/10.', stars: 5, avatar: 'TD' },
  { name: 'Anaïs B.', handle: '@anais_b', text: 'The Stensor Score feature is incredible — tracking my financial health like fitness. Game changer.', stars: 5, avatar: 'AB' },
  { name: 'Romain V.', handle: '@romain_invests', text: 'Started with zero investing knowledge. After 3 months with Stensor, I have a real diversified portfolio.', stars: 5, avatar: 'RV' },
];

const VALUES = [
  { icon: Zap, title: 'Clarity first', desc: 'Complex financial concepts explained simply. No jargon, no gatekeeping — ever.' },
  { icon: Heart, title: 'Genuine care', desc: 'Built for your long-term success, not engagement metrics or data harvesting.' },
  { icon: Globe, title: 'Accessible to all', desc: 'World-class financial coaching shouldn\'t be reserved for people who can already afford it.' },
  { icon: Shield, title: 'Privacy by design', desc: 'Your financial data is yours. We never sell it, never share it, never monetize it.' },
  { icon: TrendingUp, title: 'Real outcomes', desc: 'Every feature is designed around one question: does this help users build wealth?' },
];

const STATS = [
  { value: '10,000+', label: 'Active users' },
  { value: '500K+', label: 'Questions answered' },
  { value: '4.9★', label: 'Average rating' },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-be" style={{ background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)' }}>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-4 pt-16 pb-14 text-center">
        <motion.div {...blur(0)}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-fg rounded-xl mb-6">
            <Zap className="w-3 h-3 text-yuzu" />
            <span className="text-[10px] font-black tracking-widest text-white">OUR MISSION</span>
          </div>
        </motion.div>
        <motion.h1 {...blur(0.07)} className="text-4xl md:text-5xl font-black text-fg leading-tight mb-5">
          Making financial freedom<br />accessible to everyone.
        </motion.h1>
        <motion.p {...blur(0.14)} className="text-base text-zinc-400 max-w-md mx-auto leading-relaxed">
          Stensor was born from a simple observation: great financial coaching is expensive and inaccessible to most people. We're changing that with AI.
        </motion.p>
      </section>

      {/* Stats */}
      <section className="max-w-2xl mx-auto px-4 mb-14">
        <motion.div {...blur(0.18)} className="grid grid-cols-3 gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-6 text-center">
              <p className="text-2xl font-black text-fg">{stat.value}</p>
              <p className="text-xs text-zinc-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Values */}
      <section className="max-w-2xl mx-auto px-4 mb-14">
        <motion.h2 {...blurView()} className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-5">Our values</motion.h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {VALUES.map((v, i) => (
            <motion.div key={i} {...blurView(i * 0.07)}
              className="bg-white border border-border rounded-2xl p-6">
              <div className="w-10 h-10 flex items-center justify-center bg-yuzu rounded-xl mb-4">
                <v.icon className="w-5 h-5 text-fg" />
              </div>
              <p className="text-sm font-black text-fg mb-1.5">{v.title}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-2xl mx-auto px-4 mb-14">
        <motion.h2 {...blurView()} className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-5">Team</motion.h2>
        {TEAM.map((member, i) => (
          <motion.div key={i} {...blurView(i * 0.1)}
            className="bg-white border border-border rounded-2xl p-6 flex items-start gap-5">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0 font-black text-fg bg-yuzu text-sm">
              {member.initials}
            </div>
            <div>
              <p className="text-base font-black text-fg">{member.name}</p>
              <p className="text-xs text-zinc-400 mb-2">{member.role}</p>
              <p className="text-sm text-zinc-500 leading-relaxed">{member.bio}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Testimonials */}
      <section className="max-w-2xl mx-auto px-4 mb-14">
        <motion.h2 {...blurView()} className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-5">What users say</motion.h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} {...blurView(i * 0.08)}
              className="bg-white border border-border rounded-2xl p-6">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-yuzu text-yuzu" />
                ))}
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex items-center justify-center bg-black/8 rounded-full text-[10px] font-black text-fg">
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
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <motion.div {...blurView()} className="p-10 bg-fg rounded-3xl text-center">
          <p className="text-2xl font-black text-white mb-2">Ready to take control?</p>
          <p className="text-sm text-white/40 mb-7">Join thousands building financial freedom with Stensor.</p>
          <button onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-yuzu text-fg text-sm font-black rounded-xl hover:opacity-90 transition-opacity">
            Start for free <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>
    </div>
  );
}