import { motion } from 'framer-motion';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

const ROW1 = [
  { name: 'Sarah K.', role: 'Engineer · London', result: '€640/month recovered', sub: 'First conversation', src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&crop=face' },
  { name: 'Julien M.', role: 'Freelance dev · Paris', result: 'Retiring at 47', sub: '6-month plan, coffee intact', src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face' },
  { name: 'Camille F.', role: 'Designer · Nice', result: 'First ETF in 10 min', sub: 'After one chat', src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&crop=face' },
  { name: 'Thomas R.', role: 'Marketing · Bordeaux', result: '+€23,000 in 2 years', sub: 'Zero lifestyle cuts', src: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=60&h=60&fit=crop&crop=face' },
  { name: 'Marc D.', role: 'Entrepreneur · Brussels', result: '€0 debt · 14 months', sub: 'Nights out: untouched', src: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&h=60&fit=crop&crop=face' },
  { name: 'Léa B.', role: 'Doctor · Lyon', result: '€2,800 trip funded', sub: 'In 8 weeks', src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face' },
];

const ROW2 = [
  { name: 'Antoine V.', role: 'Teacher · Nantes', result: '€380/mo freed up', sub: '3 forgotten subscriptions cut', src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=face' },
  { name: 'Sophie L.', role: 'Nurse · Toulouse', result: 'Emergency fund: done', sub: '4 months, gaming subscription kept', src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&h=60&fit=crop&crop=face' },
  { name: 'Romain C.', role: 'Dev · Lille', result: 'Invested €12k', sub: 'Still ordering takeout weekly', src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=face' },
  { name: 'Emma P.', role: 'Consultant · Strasbourg', result: '€550/mo in savings', sub: 'From absolutely nothing', src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face' },
  { name: 'Lucas B.', role: 'Student · Montpellier', result: 'First €1,000 invested', sub: 'At 22 years old', src: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=60&h=60&fit=crop&crop=face' },
  { name: 'Nina R.', role: 'Architect · Marseille', result: 'Down payment saved', sub: '18 months, no stress', src: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=60&h=60&fit=crop&crop=face' },
];

function Card({ item }) {
  return (
    <div className="flex-shrink-0 w-72 p-5 mx-2"
      style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-lg font-black text-white mb-1">{item.result}</p>
      <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-open)' }}>{item.sub}</p>
      <div className="flex items-center gap-2.5 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <img src={item.src} alt={item.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
        <div>
          <p className="text-xs font-black text-white">{item.name}</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{item.role}</p>
        </div>
        <div className="ml-auto flex gap-0.5">
          {[...Array(5)].map((_, j) => <span key={j} style={{ color: YELLOW, fontSize: '9px' }}>★</span>)}
        </div>
      </div>
    </div>
  );
}

function InfiniteRow({ items, direction = 'left', speed = 40 }) {
  const doubled = [...items, ...items];
  const totalWidth = items.length * (288 + 16); // card width + gap

  return (
    <div className="overflow-hidden w-full">
      <motion.div
        className="flex"
        animate={{ x: direction === 'left' ? [-totalWidth, 0] : [0, -totalWidth] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
        style={{ width: doubled.length * (288 + 16) }}
      >
        {doubled.map((item, i) => <Card key={i} item={item} />)}
      </motion.div>
    </div>
  );
}

export default function ScrollingTestimonials() {
  return (
    <section className="relative w-full py-24 overflow-hidden" style={{ background: FG }}>
      <div className="text-center mb-20">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-6"
          style={{ color: 'rgba(255,255,255,0.18)' }}>
          Real results
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="font-black tracking-tighter"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', lineHeight: 1.0 }}>
          They kept their pleasures.<br />
          <span style={{ color: YELLOW }}>And built something real.</span>
        </motion.h2>
      </div>

      <div className="flex flex-col gap-4">
        <InfiniteRow items={ROW1} direction="left" speed={45} />
        <InfiniteRow items={ROW2} direction="right" speed={38} />
      </div>

      {/* Quote */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ delay: 0.2 }} className="text-center mt-20 px-6">
        <p className="font-black italic text-white leading-tight"
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontFamily: '"Georgia", serif' }}>
          "Your pleasure isn't the problem.<br />It's the solution."
        </p>
        <p className="mt-4 tracking-[0.25em] uppercase"
          style={{ fontSize: '10px', color: 'rgba(255,255,255,0.16)', fontFamily: 'var(--font-open)', fontWeight: 300 }}>
          — The Stensor Philosophy
        </p>
      </motion.div>
    </section>
  );
}