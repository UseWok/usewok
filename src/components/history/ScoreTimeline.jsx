import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CORAL = '#FF5A1F';
const BORDER = 'rgba(21,19,15,0.10)';

export default function ScoreTimeline({ records }) {
  const data = records.map(r => ({
    date: new Date(r.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: Math.round(r.score_overall || 0),
    lrs: Math.round(r.lrs_score || 0),
  }));

  if (data.length === 0) {
    return (
      <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(21,19,15,0.5)' }}>No scans in this period</span>
        <span style={{ fontSize: 12, color: 'rgba(21,19,15,0.35)' }}>Your score history will build up with each scan.</span>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, padding: '18px 12px 8px' }}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CORAL} stopOpacity={0.22} />
              <stop offset="100%" stopColor={CORAL} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(21,19,15,0.06)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgba(21,19,15,0.45)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgba(21,19,15,0.45)' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${BORDER}`, fontSize: 12 }} />
          <Area type="monotone" dataKey="score" name="Overall score" stroke={CORAL} strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ r: 3, fill: CORAL }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}