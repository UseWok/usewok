import { motion } from 'framer-motion';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const STEPS = [
  {
    badge: '01 — GENERATE',
    title: 'Create plans in seconds with the best AIs on the market.',
    desc: 'Describe your financial goal in plain language. Stensor instantly combines GPT, Claude and Gemini to produce a complete, actionable strategy — no spreadsheet, no jargon.',
    color: '#c9a227',
  },
  {
    badge: '02 — MENTOR',
    title: 'Choose from 3 AI agents, each like a different expert mentor.',
    desc: 'From a goal-setting strategist to an emotion-aware spending coach and a wealth-building specialist — pick the agent that fits your need. Each brings a unique perspective.',
    color: '#d4a853',
  },
  {
    badge: '03 — ANALYZE',
    title: 'The AI reads files, browses the web, delivers extraordinary results.',
    desc: 'Attach bank statements, PDFs or spreadsheets. Enable web search. Stensor synthesizes all sources and gives you insights no single model could produce alone.',
    color: '#b8922a',
  },
  {
    badge: '04 — ITERATE',
    title: 'Continue, edit and refine everything the AI outputs.',
    desc: "The conversation doesn't stop at one answer. Ask follow-ups, adjust the plan, tweak numbers — your financial strategy evolves with you in real time.",
    color: '#e0b84a',
  },
];

function Sparkle({ style }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={style}>
      <path d="M11 1L12.8 8.2L20 10L12.8 11.8L11 19L9.2 11.8L2 10L9.2 8.2L11 1Z" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

function YoutubeEmbed({ url }) {
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
    <div className="w-full overflow-hidden"
      style={{ aspectRatio: '16/9', borderRadius: '16px', boxShadow: '0 8px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.07)' }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="Stensor feature"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        style={{ border: 'none', borderRadius: '16px' }}
      />
    </div>
  );
}

function PlaceholderVideo({ index, badge }) {
  return (
    <div className="w-full flex items-center justify-center"
      style={{
        aspectRatio: '16/9',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.3)',
      }}>
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)' }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
            <path d="M8 5l11 7-11 7V5z" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>
        <p className="text-xs font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Video coming soon</p>
      </div>
    </div>
  );
}

function FeatureRow({ step, index, url }) {
  const isEven = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16`}
    >
      {/* Video */}
      <div className="w-full md:w-1/2">
        {url ? <YoutubeEmbed url={url} /> : <PlaceholderVideo index={index} badge={step.badge} />}
      </div>

      {/* Text */}
      <div className="w-full md:w-1/2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-5"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.10)' }}>
          {step.badge}
        </div>
        <h3 className="font-black leading-tight mb-4 text-white"
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '-0.02em' }}>
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
          {step.desc}
        </p>
        {/* Gold accent line */}
        <div className="mt-6 w-10 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg, #c9a227, #e8cc6a)' }} />
      </div>
    </motion.div>
  );
}

export default function StickyCardsSection({ cards, section_title, onCta, youtube_urls }) {
  const urls = youtube_urls || [];

  return (
    <section style={{ background: 'white' }}>
      {/* Gradient bridge from light blue to dark */}
      <div style={{ height: 80, background: 'linear-gradient(to bottom, #f8faff 0%, #0c0a06 100%)' }} />

      {/* Main dark gold section */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0c0a06 0%, #1a1304 30%, #110e02 60%, #0c0a06 100%)' }}>

        {/* Gold orb blobs — like the image reference */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Left purple-gold orb */}
          <motion.div
            animate={{ x: [0, 30, -10, 0], y: [0, -20, 15, 0], scale: [1, 1.06, 0.97, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', width: 700, height: 700,
              top: '-100px', left: '-200px',
              background: 'radial-gradient(circle, rgba(180,130,30,0.22) 0%, rgba(120,80,10,0.08) 50%, transparent 70%)',
              filter: 'blur(70px)',
            }} />
          {/* Right gold orb */}
          <motion.div
            animate={{ x: [0, -30, 15, 0], y: [0, 25, -20, 0], scale: [1, 1.04, 0.98, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            style={{
              position: 'absolute', width: 800, height: 800,
              top: '-150px', right: '-250px',
              background: 'radial-gradient(circle, rgba(220,180,60,0.18) 0%, rgba(160,110,20,0.07) 50%, transparent 70%)',
              filter: 'blur(80px)',
            }} />
          {/* Center warm glow */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            style={{
              position: 'absolute', width: 600, height: 400,
              top: '10%', left: '20%',
              background: 'radial-gradient(ellipse, rgba(200,160,50,0.10) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }} />
        </div>

        {/* Sparkles */}
        <Sparkle style={{ position: 'absolute', top: '8%', left: '6%', opacity: 0.5 }} />
        <Sparkle style={{ position: 'absolute', top: '15%', left: '12%', opacity: 0.3, width: 14, height: 14 }} />
        <Sparkle style={{ position: 'absolute', top: '6%', right: '8%', opacity: 0.4, width: 18, height: 18 }} />
        <Sparkle style={{ position: 'absolute', top: '20%', right: '5%', opacity: 0.25, width: 12, height: 12 }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 pt-20 pb-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-24">

            <div className="inline-block px-3 py-1.5 mb-6 text-[10px] font-black tracking-[0.25em] uppercase rounded-full"
              style={{ background: 'rgba(201,162,39,0.15)', color: '#d4a853', border: '1px solid rgba(201,162,39,0.25)' }}>
              Features
            </div>

            <h2 className="font-black tracking-tight leading-none"
              style={{
                fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
                background: 'linear-gradient(135deg, #f5e098 0%, #c9a227 40%, #e8cc6a 70%, #a07820 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.03em',
              }}>
              {section_title || 'Everything is Possible.'}
            </h2>

            {/* Subtle gold line */}
            <div className="mx-auto mt-8 w-16 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,162,39,0.6), transparent)' }} />
          </motion.div>

          {/* Feature rows */}
          <div className="flex flex-col gap-28 pb-24">
            {STEPS.map((step, i) => (
              <FeatureRow key={i} step={step} index={i} url={urls[i]} />
            ))}
          </div>

          {/* CTA */}
          <div className="text-center pb-28">
            <motion.button
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1 }}
              onClick={onCta}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 font-black text-sm px-10 py-4"
              style={{
                background: 'linear-gradient(135deg, #c9a227, #e8cc6a)',
                color: '#0c0a06',
                borderRadius: '12px',
                boxShadow: '0 4px 32px rgba(201,162,39,0.25)',
              }}>
              Get my strategy →
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bridge back to white */}
      <div style={{ height: 80, background: 'linear-gradient(to bottom, #0c0a06 0%, white 100%)' }} />
    </section>
  );
}