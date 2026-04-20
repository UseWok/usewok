import { motion } from 'framer-motion';

const YUZU = '#DDFF00';
const FG = '#0A0A0A';

const STEPS = [
  {
    badge: '01 — GENERATE',
    title: 'Create plans in seconds with the best AIs on the market.',
    desc: 'Describe your financial goal in plain language. Stensor instantly combines GPT, Claude and Gemini to produce a complete, actionable strategy — no spreadsheet, no jargon.',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.06)',
  },
  {
    badge: '02 — MENTOR',
    title: 'Choose from 3 AI agents, each like a different expert mentor.',
    desc: 'From a goal-setting strategist to an emotion-aware spending coach and a wealth-building specialist — pick the agent that fits your need. Each brings a unique perspective.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.06)',
  },
  {
    badge: '03 — ANALYZE',
    title: 'The AI reads files, browses the web, delivers extraordinary results.',
    desc: 'Attach bank statements, PDFs or spreadsheets. Enable web search. Stensor synthesizes all sources and gives you insights no single model could produce alone.',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.06)',
  },
  {
    badge: '04 — ITERATE',
    title: 'Continue, edit and refine everything the AI outputs.',
    desc: 'The conversation doesn\'t stop at one answer. Ask follow-ups, adjust the plan, tweak numbers — your financial strategy evolves with you in real time.',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.06)',
  },
];

function YoutubeEmbed({ url }) {
  if (!url) return null;
  let videoId = '';
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) videoId = u.pathname.replace('/', '');
    else videoId = u.searchParams.get('v') || '';
    if (!videoId) videoId = url; // fallback: maybe it's just the ID
  } catch {
    videoId = url;
  }
  return (
    <div className="w-full overflow-hidden rounded-2xl"
      style={{ aspectRatio: '16/9', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="Stensor feature"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        style={{ border: 'none' }}
      />
    </div>
  );
}

function PlaceholderVideo({ color, badge }) {
  return (
    <div className="w-full rounded-2xl flex items-center justify-center"
      style={{ aspectRatio: '16/9', background: `linear-gradient(135deg, ${color}12 0%, ${color}06 100%)`, border: `1px solid ${color}25` }}>
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
          style={{ background: `${color}18`, border: `1.5px solid ${color}30` }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
            <path d="M8 5l11 7-11 7V5z" fill={color} opacity="0.7" />
          </svg>
        </div>
        <p className="text-xs font-black tracking-widest uppercase" style={{ color: `${color}70` }}>Video coming soon</p>
      </div>
    </div>
  );
}

function FeatureRow({ step, index, url }) {
  const isEven = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16`}
    >
      {/* Video side */}
      <div className="w-full md:w-1/2">
        {url
          ? <YoutubeEmbed url={url} />
          : <PlaceholderVideo color={step.color} badge={step.badge} />
        }
      </div>

      {/* Text side */}
      <div className="w-full md:w-1/2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-5"
          style={{ background: step.bg, color: step.color }}>
          {step.badge}
        </div>
        <h3 className="font-black leading-tight mb-4"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', color: FG }}>
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed font-medium" style={{ color: 'rgba(10,10,10,0.45)' }}>
          {step.desc}
        </p>
        {/* Accent line */}
        <div className="mt-6 w-12 h-1 rounded-full" style={{ background: step.color }} />
      </div>
    </motion.div>
  );
}

export default function StickyCardsSection({ cards, section_title, onCta, youtube_urls }) {
  // youtube_urls is an array of 4 optional URLs
  const urls = youtube_urls || [];

  return (
    <section style={{ background: 'white' }}>
      {/* Gradient bridge */}
      <div style={{ height: 60, background: 'linear-gradient(to bottom, #f8faff 0%, white 100%)' }} />

      <div className="max-w-5xl mx-auto px-6 md:px-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20">
          <div className="inline-block px-3 py-1.5 mb-5 text-[10px] font-black tracking-[0.2em] uppercase rounded-full"
            style={{ background: YUZU, color: FG }}>
            Features
          </div>
          <h2 className="font-black tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: FG }}>
            {section_title || 'Everything is Possible.'}
          </h2>
        </motion.div>

        {/* Feature rows */}
        <div className="flex flex-col gap-24 pb-24">
          {STEPS.map((step, i) => (
            <FeatureRow key={i} step={step} index={i} url={urls[i]} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center pb-24">
          <motion.button
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1 }}
            onClick={onCta}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 font-black text-sm px-10 py-4"
            style={{ background: FG, color: YUZU, borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
            Get my strategy →
          </motion.button>
        </div>
      </div>
    </section>
  );
}