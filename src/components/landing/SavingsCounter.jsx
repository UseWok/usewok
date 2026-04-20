import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHLY_SAVINGS = 384;
const MAX_MONTHS = 60; // 5 years
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#FFD700';
const FG = '#0A0A0A';

function formatMoney(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function SavingsCounter() {
  const [months, setMonths] = useState(1);
  const [displayTotal, setDisplayTotal] = useState(MONTHLY_SAVINGS);
  const [targetTotal, setTargetTotal] = useState(MONTHLY_SAVINGS);
  const animRef = useRef(null);
  const startRef = useRef(MONTHLY_SAVINGS);
  const startTimeRef = useRef(null);
  const ANIM_DURATION = 2000; // 2s per increment

  // Animate the number climbing from current to target
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const from = startRef.current;
    const to = targetTotal;
    if (from === to) return;
    startTimeRef.current = null;

    const step = (ts) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      const progress = Math.min(elapsed / ANIM_DURATION, 1);
      // ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(from + (to - from) * eased);
      setDisplayTotal(current);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        startRef.current = to;
      }
    };
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [targetTotal]);

  const goLeft = () => {
    if (months <= 1) return;
    const next = months - 1;
    setMonths(next);
    startRef.current = displayTotal;
    setTargetTotal(next * MONTHLY_SAVINGS);
  };

  const goRight = () => {
    if (months >= MAX_MONTHS) return;
    const next = months + 1;
    setMonths(next);
    startRef.current = displayTotal;
    setTargetTotal(next * MONTHLY_SAVINGS);
  };

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const periodLabel = years > 0
    ? `${years}y${remMonths > 0 ? ` ${remMonths}m` : ''}`
    : `${months} month${months > 1 ? 's' : ''}`;

  const barWidth = (months / MAX_MONTHS) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7 }}
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 100%)',
        border: '1px solid rgba(212,175,55,0.2)',
        boxShadow: '0 0 80px rgba(212,175,55,0.06), 0 20px 60px rgba(0,0,0,0.4)',
        padding: '48px 40px 40px',
      }}>

      {/* Grid dot pattern */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Gold glow */}
      <div className="absolute pointer-events-none" style={{
        top: 0, left: '30%', right: '30%', height: 200,
        background: `radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 70%)`,
        filter: 'blur(30px)',
      }} />

      <div className="relative z-10">

        {/* Label */}
        <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Savings with Stensor
        </p>

        {/* Gold total */}
        <div className="text-center mb-8">
          <motion.div
            key={Math.round(displayTotal / 100)} // re-pulse on major changes
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 0.3 }}
            className="font-black inline-block"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 6rem)',
              background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 50%, ${GOLD} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              textShadow: 'none',
              filter: `drop-shadow(0 0 20px rgba(212,175,55,0.4))`,
            }}>
            {formatMoney(displayTotal)}
          </motion.div>
          <p className="text-xs font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
            saved vs. a finance coach · {periodLabel}
          </p>
        </div>

        {/* Slider bar */}
        <div className="mb-6">
          <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${barWidth}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{ background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>
            <span>1 month</span>
            <span>5 years</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <motion.button
            onClick={goLeft}
            whileTap={{ scale: 0.9 }}
            disabled={months <= 1}
            className="w-12 h-12 flex items-center justify-center rounded-full transition-all"
            style={{
              background: months <= 1 ? 'rgba(255,255,255,0.04)' : 'rgba(212,175,55,0.12)',
              border: `1px solid ${months <= 1 ? 'rgba(255,255,255,0.06)' : 'rgba(212,175,55,0.3)'}`,
              cursor: months <= 1 ? 'not-allowed' : 'pointer',
            }}>
            <ChevronLeft className="w-5 h-5" style={{ color: months <= 1 ? 'rgba(255,255,255,0.15)' : GOLD }} />
          </motion.button>

          <div className="text-center min-w-[80px]">
            <p className="font-black text-2xl text-white">{periodLabel}</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{formatMoney(MONTHLY_SAVINGS)}/mo saved</p>
          </div>

          <motion.button
            onClick={goRight}
            whileTap={{ scale: 0.9 }}
            disabled={months >= MAX_MONTHS}
            className="w-12 h-12 flex items-center justify-center rounded-full transition-all"
            style={{
              background: months >= MAX_MONTHS ? 'rgba(255,255,255,0.04)' : 'rgba(212,175,55,0.15)',
              border: `1px solid ${months >= MAX_MONTHS ? 'rgba(255,255,255,0.06)' : 'rgba(212,175,55,0.4)'}`,
              cursor: months >= MAX_MONTHS ? 'not-allowed' : 'pointer',
            }}>
            <ChevronRight className="w-5 h-5" style={{ color: months >= MAX_MONTHS ? 'rgba(255,255,255,0.15)' : GOLD }} />
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
}