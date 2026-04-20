import { motion } from 'framer-motion';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const STEPS = [
  {
    badge: '01 — GENERATE',
    title: 'Create plans in seconds with the best AIs on the market.',
    desc: 'Describe your financial goal in plain language. Stensor instantly combines GPT, Claude and Gemini to produce a complete, actionable strategy — no spreadsheet, no jargon.',
    color: '#6366f1',
    yuzuOpacity: 0.03,
  },
  {
    badge: '02 — MENTOR',
    title: 'Choose from 3 AI agents, each like a different expert mentor.',
    desc: 'From a goal-setting strategist to an emotion-aware spending coach and a wealth-building specialist — pick the agent that fits your need. Each brings a unique perspective.',
    color: '#f59e0b',
    yuzuOpacity: 0.055,
  },
  {
    badge: '03 — ANALYZE',
    title: 'The AI reads files, browses the web, delivers extraordinary results.',
    desc: 'Attach bank statements, PDFs or spreadsheets. Enable web search. Stensor synthesizes all sources and gives you insights no single model could produce alone.',
    color: '#22c55e',
    yuzuOpacity: 0.035,
  },
  {
    badge: '04 — ITERATE',
    title: 'Continue, edit and refine everything the AI outputs.',
    desc: "The conversation doesn't stop at one answer. Ask follow-ups, adjust the plan, tweak numbers — your financial strategy evolves with you in real time.",
    color: '#ec4899',
    yuzuOpacity: 0.06,
  },
];

function Sparkle({ style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" style={{ width: 20, height: 20, ...style }}>
      <path d="M12 2L13.5 9L20 10L13.5 11L12 18L10.5 11L4 10L10.5 9L12 2Z" fill={FG} />
    </svg>
  );
}

function YoutubeEmbed({ url, yuzuOpacity }) {
  if (!url) return null;
  let videoId = '';
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) videoId = u.pathname.replace('/', '');
    else videoId = u.searchParams.get('v') || '';
    if (!videoId) videoId = url;
  } catch {
    videoId = url;
  }
  return (
    <div className="w-full overflow-hidden relative"
      style={{
        aspectRatio: '16/9',
        borderRadius: '10px',
        background: `rgba(221,255,0,${yuzuOpacity})`,
        border: '1px solid rgba(221,255,0,0.15)',
        boxShadow: `0 8px 40px rgba(221,255,0,${yuzuOpacity * 3}), 0 2px 12px rgba(0,0,0,0.05)`,
      }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="Stensor feature"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        style={{ border: 'none', borderRadius: '10px' }}
      />
    </div>
  );
}

function PlaceholderVideo({ yuzuOpacity }) {
  return (
    <div className="w-full flex items-center justify-center"
      style={{
        aspectRatio: '16/9',
        borderRadius: '10px',
        background: `rgba(221,255,0,${yuzuOpacity})`,
        border: '1px solid rgba(221,255,0,0.15)',
        boxShadow: `0 8px 40px rgba(221,255,0,${yuzuOpacity * 3}), 0 2px 12px rgba(0,0,0,0.04)`,
      }}>
      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(221,255,0,0.12)', border: '1.5px solid rgba(221,255,0,0.25)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path d="M8 5l11 7-11 7V5z" fill="rgba(10,10,10,0.3)" />
          </svg>
        </div>
        <p className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(10,10,10,0.2)' }}>Video coming soon</p>
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
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16`}
    >
      {/* Video */}
      <div className="w-full md:w-1/2">
        {url
          ? <YoutubeEmbed url={url} yuzuOpacity={step.yuzuOpacity} />
          : <PlaceholderVideo yuzuOpacity={step.yuzuOpacity} />
        }
      </div>

      {/* Text */}
      <div className="w-full md:w-1/2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black tracking-widest uppercase mb-5"
          style={{ background: `${step.color}10`, color: step.color, border: `1px solid ${step.color}20` }}>
          {step.badge}
        </div>
        <h3 className="font-black leading-tight mb-4"
          style={{ fontSize: 'clamp(1.4rem, 3.2vw, 2rem)', color: FG, letterSpacing: '-0.02em' }}>
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed font-medium" style={{ color: 'rgba(10,10,10,0.45)' }}>
          {step.desc}
        </p>
        <div className="mt-5 w-10 h-0.5 rounded-sm" style={{ background: step.color }} />
      </div>
    </motion.div>
  );
}

export default function StickyCardsSection({ cards, section_title, onCta, youtube_urls }) {
  const urls = youtube_urls || [];

  return (
    <section style={{ background: 'white' }}>

      {/* ── HEADER — yuzu luminous gradient blob ── */}
      <div className="relative overflow-hidden" style={{ background: 'white' }}>

        {/* Yuzu blobs */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left yuzu blob */}
          <div style={{
            position: 'absolute',
            width: '55%', height: '100%',
            left: '-5%', top: 0,
            background: 'radial-gradient(ellipse at 30% 50%, rgba(221,255,0,0.45) 0%, rgba(221,255,0,0.18) 45%, transparent 70%)',
            filter: 'blur(28px)',
          }} />
          {/* Right bright yuzu blob */}
          <div style={{
            position: 'absolute',
            width: '60%', height: '100%',
            right: '-8%', top: 0,
            background: 'radial-gradient(ellipse at 70% 45%, rgba(221,255,0,0.55) 0%, rgba(200,240,0,0.22) 45%, transparent 70%)',
            filter: 'blur(25px)',
          }} />
          {/* Center warm blend */}
          <div style={{
            position: 'absolute',
            width: '50%', height: '70%',
            left: '25%', top: '15%',
            background: 'radial-gradient(ellipse, rgba(221,255,0,0.18) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          {/* Bottom fade to white */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%',
            background: 'linear-gradient(to bottom, transparent, white)',
          }} />
        </div>

        {/* Sparkles */}
        <Sparkle style={{ position: 'absolute', top: '24%', left: '9%', opacity: 0.25 }} />
        <Sparkle style={{ position: 'absolute', top: '58%', left: '15%', opacity: 0.15, width: 12, height: 12 }} />
        <Sparkle style={{ position: 'absolute', top: '28%', right: '10%', opacity: 0.2, width: 16, height: 16 }} />
        <Sparkle style={{ position: 'absolute', top: '62%', right: '7%', opacity: 0.12, width: 11, height: 11 }} />

        {/* Title */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6"
          style={{ paddingTop: 90, paddingBottom: 100 }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="font-black tracking-tight"
              style={{
                fontSize: 'clamp(2.8rem, 6.5vw, 5rem)',
                letterSpacing: '-0.03em',
                color: FG,
                lineHeight: 1.08,
              }}>
              {section_title || 'Everything is Possible.'}
            </h2>
          </motion.div>
        </div>
      </div>

      {/* ── FEATURE ROWS — white, clean ── */}
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <div className="flex flex-col gap-24 pt-4 pb-24">
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
            style={{ background: FG, color: YUZU, borderRadius: '10px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
            Get my strategy →
          </motion.button>
        </div>
      </div>
    </section>
  );
}