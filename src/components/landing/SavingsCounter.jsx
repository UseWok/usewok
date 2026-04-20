import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

const MONTHLY_COACH = 400;    // coach fees saved
const MONTHLY_STENSOR = 16;   // stensor cost
const MONTHLY_SAVINGS = MONTHLY_COACH - MONTHLY_STENSOR; // ~384$/mo
const MAX_MONTHS = 60;
const FG = '#0A0A0A';
const YUZU = '#DDFF00';
const GREEN = '#22c55e';

function buildData(months) {
  const data = [];
  for (let m = 0; m <= months; m++) {
    data.push({
      month: m === 0 ? 'Start' : m % 12 === 0 ? `${m / 12}y` : m === months ? `${m}m` : null,
      stensor: Math.round(m * MONTHLY_SAVINGS),
      coach: Math.round(m * MONTHLY_COACH),
    });
  }
  return data;
}

function fmt(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-lg border border-black/5 text-xs font-semibold">
      <p className="text-gray-400 mb-2 font-bold">{label !== null ? label : ''}</p>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: GREEN }} />
          <span className="text-gray-700">Stensor: <span className="font-black text-gray-900">{fmt(payload[0]?.value || 0)} saved</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#f87171' }} />
          <span className="text-gray-700">Coach: <span className="font-black text-gray-900">{fmt(payload[1]?.value || 0)} spent</span></span>
        </div>
      </div>
    </div>
  );
};

export default function SavingsCounter() {
  const [months, setMonths] = useState(24);
  const [animKey, setAnimKey] = useState(0);

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const periodLabel = years > 0
    ? `${years} year${years > 1 ? 's' : ''}${remMonths > 0 ? ` ${remMonths}m` : ''}`
    : `${months} month${months > 1 ? 's' : ''}`;

  const totalSaved = months * MONTHLY_SAVINGS;
  const data = buildData(months);

  const go = (dir) => {
    const next = Math.max(1, Math.min(MAX_MONTHS, months + dir));
    setMonths(next);
    setAnimKey(k => k + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-3xl overflow-hidden"
      style={{
        background: 'white',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.07)',
      }}
    >
      {/* Top header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3"
              style={{ background: 'rgba(34,197,94,0.1)', color: GREEN }}>
              <TrendingUp className="w-3 h-3" /> Savings vs. a Finance Coach
            </div>
            <motion.div key={animKey}
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="font-black leading-none"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 4.5rem)', color: FG }}>
              {fmt(totalSaved)}
            </motion.div>
            <p className="text-sm font-medium mt-1.5" style={{ color: 'rgba(10,10,10,0.4)' }}>
              saved over <span className="font-black" style={{ color: FG }}>{periodLabel}</span>
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 self-center">
            <button onClick={() => go(-12)} disabled={months <= 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl border transition-all disabled:opacity-30"
              style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
              <ChevronLeft className="w-4 h-4" style={{ color: FG }} />
            </button>
            <div className="text-center min-w-[64px]">
              <p className="font-black text-lg" style={{ color: FG }}>{periodLabel}</p>
              <p className="text-[10px] font-semibold" style={{ color: 'rgba(10,10,10,0.3)' }}>timeline</p>
            </div>
            <button onClick={() => go(+12)} disabled={months >= MAX_MONTHS}
              className="w-10 h-10 flex items-center justify-center rounded-xl border transition-all disabled:opacity-30"
              style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
              <ChevronRight className="w-4 h-4" style={{ color: FG }} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-6" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GREEN} stopOpacity={0.18} />
                <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.13} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: 'rgba(0,0,0,0.25)', fontSize: 10, fontWeight: 600 }}
              axisLine={false} tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'rgba(0,0,0,0.2)', fontSize: 10 }}
              axisLine={false} tickLine={false}
              tickFormatter={v => fmt(v)}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="stensor" name="Stensor"
              stroke={GREEN} strokeWidth={2.5} fill="url(#gradGreen)"
              dot={false} activeDot={{ r: 5, fill: GREEN, stroke: 'white', strokeWidth: 2 }} />
            <Area type="monotone" dataKey="coach" name="Coach"
              stroke="#f87171" strokeWidth={2} fill="url(#gradRed)"
              dot={false} activeDot={{ r: 4, fill: '#f87171', stroke: 'white', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + note */}
      <div className="px-8 pb-7 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-1 rounded-full" style={{ background: GREEN }} />
            <span className="text-xs font-bold" style={{ color: 'rgba(10,10,10,0.5)' }}>Stensor savings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-1 rounded-full" style={{ background: '#f87171' }} />
            <span className="text-xs font-bold" style={{ color: 'rgba(10,10,10,0.5)' }}>Coach costs</span>
          </div>
        </div>
        <p className="text-[10px]" style={{ color: 'rgba(10,10,10,0.25)' }}>Based on avg. $400/mo finance coach · Stensor from $16/mo</p>
      </div>
    </motion.div>
  );
}