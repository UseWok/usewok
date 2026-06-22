import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, ChevronDown, Zap, BarChart2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import OverviewTab from '@/components/performance/OverviewTab';
import CrawlabilityTab from '@/components/performance/CrawlabilityTab';
import IssuesTab from '@/components/performance/IssuesTab';
import CrawledPagesTab from '@/components/performance/CrawledPagesTab';
import PerformanceDetailTab from '@/components/performance/PerformanceDetailTab';

const VIOLET = '#7C3AED';
const F = 'Inter, system-ui, sans-serif';

// ─── Primitives ──────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 16, padding: '18px 16px', marginBottom: 14, ...style }}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 10px' }}>{children}</p>;
}

function Delta({ val }) {
  if (val == null || val === 0) return null;
  const up = val > 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: up ? '#10B981' : '#EF4444' }}>
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}{up ? '+' : ''}{val}%
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = {
    urgent:      { label: '🔴 Urgent',      bg: '#FEE2E2', color: '#DC2626' },
    short_term:  { label: '🟡 Court terme', bg: '#FEF3C7', color: '#D97706' },
    medium_term: { label: '🔵 Moyen terme', bg: '#E0F2FE', color: '#0284C7' },
  };
  const c = cfg[priority] || cfg.medium_term;
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.color }}>{c.label}</span>;
}

// ─── Custom Dropdown ─────────────────────────────────────────────────
function Dropdown({ options, value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div style={{ position: 'relative' }}>
      {label && <p style={{ fontSize: 10, fontWeight: 600, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</p>}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
          border: '1.5px solid #E5E4E0', borderRadius: 10, background: '#fff',
          fontSize: 12, fontWeight: 600, color: '#1a1a1a', cursor: 'pointer',
          minWidth: 160, justifyContent: 'space-between', width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {selected?.color && <div style={{ width: 8, height: 8, borderRadius: '50%', background: selected.color, flexShrink: 0 }} />}
          <span>{selected?.label || 'Select…'}</span>
        </div>
        <ChevronDown size={13} color="#888" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: '#fff', border: '1.5px solid #E5E4E0', borderRadius: 10,
          zIndex: 100, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '10px 12px', border: 'none', background: opt.value === value ? '#F5F3FF' : '#fff',
                fontSize: 12, fontWeight: 500, color: '#1a1a1a', cursor: 'pointer', textAlign: 'left',
              }}
            >
              {opt.color && <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />}
              {opt.label}
              {opt.value === value && <span style={{ marginLeft: 'auto', color: VIOLET, fontSize: 10 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Score Ring ──────────────────────────────────────────────────────
function ScoreRing({ value, size = 90, color = VIOLET, label }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value || 0, 100) / 100;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F0EE" strokeWidth={8} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#0F0F10' }}>
          {Math.round(value || 0)}%
        </div>
      </div>
      {label && <span style={{ fontSize: 11, color: '#888', fontWeight: 600, textAlign: 'center' }}>{label}</span>}
    </div>
  );
}

// ─── Share of Voice Section ──────────────────────────────────────────
function ShareOfVoiceSection({ data, yourBrandName }) {
  if (!data) return null;
  const donut = data.donut_data || [];

  return (
    <Card>
      <Label>📊 Share of Voice</Label>

      {/* Insight banner */}
      {data.insight_text && (
        <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: VIOLET, margin: '0 0 3px' }}>{data.insight_title}</p>
          <p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.5 }}>{data.insight_text}</p>
        </div>
      )}

      {/* Donut + legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <PieChart width={130} height={130}>
            <Pie data={donut} cx={60} cy={60} innerRadius={36} outerRadius={58} paddingAngle={2} dataKey="pct" startAngle={90} endAngle={450}>
              {donut.map((e, i) => <Cell key={i} fill={e.color || '#E5E7EB'} />)}
            </Pie>
          </PieChart>
          {/* Center label */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F0F10' }}>{data.your_brand?.voice_share_pct || donut[0]?.pct || 0}%</div>
              <div style={{ fontSize: 9, color: '#aaa', fontWeight: 600 }}>You</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 120 }}>
          {donut.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 9, height: 9, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#333', fontWeight: i === 0 ? 700 : 400 }}>{d.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a' }}>{d.pct}%</span>
                <Delta val={d.delta} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Favorability Bars ───────────────────────────────────────────────
function FavorabilitySection({ sov }) {
  if (!sov) return null;
  const items = [
    { name: sov.your_brand?.name || 'You', pct: sov.your_brand?.favorable_pct || 0, color: VIOLET, delta: sov.your_brand?.favorable_delta },
    ...(sov.competitors || []).map(c => ({ name: c.name, pct: c.favorable_pct || 0, color: c.color || '#9CA3AF', delta: c.favorable_delta })),
  ];
  return (
    <Card>
      <Label>❤️ Perception favorable</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                <span style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 500, color: '#1a1a1a' }}>{item.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a' }}>{item.pct}%</span>
                <Delta val={item.delta} />
              </div>
            </div>
            <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 4, transition: 'width 1s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Growth Factors Bar Chart ────────────────────────────────────────
function GrowthFactorsSection({ data, selectedBrand, onBrandChange }) {
  const { factors, brands_in_matrix, top_insight } = data || {};
  if (!factors?.length) return null;

  const brandOptions = (brands_in_matrix || []).map(b => ({ value: b.name, label: b.name, color: b.color }));
  const selectedBrandObj = brands_in_matrix?.find(b => b.name === selectedBrand) || brands_in_matrix?.[0];
  const yourBrandObj = brands_in_matrix?.[0];

  // Build bar data for selected brand vs yours
  const barData = factors.map(f => {
    const competitorEntry = f.competitors?.find(c => c.name === selectedBrand);
    return {
      name: f.name.length > 20 ? f.name.slice(0, 18) + '…' : f.name,
      fullName: f.name,
      yours: f.your_brand_count,
      competitor: competitorEntry?.count || 0,
    };
  }).slice(0, 10);

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <Label>🚀 Facteurs de croissance</Label>
        {brandOptions.length > 1 && (
          <div style={{ minWidth: 160 }}>
            <Dropdown
              options={brandOptions.filter((_, i) => i > 0)}
              value={selectedBrand}
              onChange={onBrandChange}
              label="vs concurrent"
            />
          </div>
        )}
      </div>

      {top_insight?.insight && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 13px', marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', margin: '0 0 2px' }}>💡 {top_insight.factor}</p>
          <p style={{ fontSize: 11.5, color: '#78350F', margin: 0, lineHeight: 1.5 }}>{top_insight.insight}</p>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: VIOLET }} />
          <span style={{ fontSize: 11, color: '#555' }}>{yourBrandObj?.name || 'Vous'}</span>
        </div>
        {selectedBrandObj && selectedBrandObj.name !== yourBrandObj?.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: selectedBrandObj.color }} />
            <span style={{ fontSize: 11, color: '#555' }}>{selectedBrandObj.name}</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EE" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 9, fill: '#aaa' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 9.5, fill: '#555' }} width={100} />
          <Tooltip
            content={({ payload, label }) => {
              if (!payload?.length) return null;
              const f = factors.find(f => f.name.startsWith(label?.replace('…', '')));
              return (
                <div style={{ background: '#fff', border: '1px solid #E5E4E0', borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
                  <strong style={{ display: 'block', marginBottom: 4 }}>{f?.name || label}</strong>
                  {payload.map((p, i) => (
                    <div key={i} style={{ color: p.color }}>{p.name === 'yours' ? (yourBrandObj?.name || 'Vous') : selectedBrandObj?.name}: {p.value}</div>
                  ))}
                </div>
              );
            }}
          />
          <Bar dataKey="yours" fill={VIOLET} radius={[0, 3, 3, 0]} name="yours" />
          {selectedBrandObj && selectedBrandObj.name !== yourBrandObj?.name && (
            <Bar dataKey="competitor" fill={selectedBrandObj.color} radius={[0, 3, 3, 0]} name="competitor" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Competitor Deep-Dive ─────────────────────────────────────────────
function CompetitorDeepDive({ strategy, yourBrandName }) {
  const comps = strategy?.competitor_comparisons || [];
  const [selected, setSelected] = useState(comps[0]?.competitor_name || '');

  if (!comps.length) return null;

  const options = comps.map(c => ({ value: c.competitor_name, label: c.competitor_name, color: c.competitor_color }));
  const comp = comps.find(c => c.competitor_name === selected) || comps[0];

  // Radar data
  const radarData = (comp?.growth_factors || []).slice(0, 7).map(f => ({
    subject: f.name.length > 14 ? f.name.slice(0, 13) + '…' : f.name,
    vous: f.your_count,
    concurrent: f.competitor_count,
  }));

  const insightBg = comp?.insight_type === 'ahead' ? { bg: '#F0FDF4', border: '#BBF7D0', color: '#065F46', emoji: '🏆' }
    : comp?.insight_type === 'behind' ? { bg: '#FFF1F2', border: '#FECDD3', color: '#9F1239', emoji: '⚠️' }
    : { bg: '#F0F9FF', border: '#BAE6FD', color: '#0C4A6E', emoji: '🤝' };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <Label>⚔️ Votre marque vs concurrent</Label>
        <div style={{ minWidth: 180 }}>
          <Dropdown options={options} value={selected} onChange={setSelected} label="Choisir un concurrent" />
        </div>
      </div>

      {/* Insight */}
      {comp?.insight_text && (
        <div style={{ background: insightBg.bg, border: `1px solid ${insightBg.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: insightBg.color, margin: '0 0 4px' }}>{insightBg.emoji} {comp.insight_title}</p>
          <p style={{ fontSize: 12, color: insightBg.color, margin: 0, opacity: 0.85, lineHeight: 1.5 }}>{comp.insight_text}</p>
        </div>
      )}

      {/* Key metrics 2-up */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Voice Share', yours: comp?.your_voice_share, theirs: comp?.competitor_voice_share, yourDelta: comp?.your_voice_delta, theirDelta: comp?.competitor_voice_delta },
          { label: 'Perception', yours: comp?.your_favorable, theirs: comp?.competitor_favorable, yourDelta: comp?.your_favorable_delta, theirDelta: comp?.competitor_favorable_delta },
        ].map((m, i) => (
          <div key={i} style={{ background: '#F8F7F4', borderRadius: 12, padding: '12px' }}>
            <p style={{ fontSize: 10, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 10px' }}>{m.label}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <ScoreRing value={m.yours} size={64} color={VIOLET} />
                <p style={{ fontSize: 10, textAlign: 'center', color: '#555', margin: '4px 0 0', fontWeight: 600 }}>Vous</p>
                <div style={{ textAlign: 'center' }}><Delta val={m.yourDelta} /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 16, color: '#ccc', fontWeight: 300 }}>vs</div>
              <div>
                <ScoreRing value={m.theirs} size={64} color={comp?.competitor_color || '#9CA3AF'} />
                <p style={{ fontSize: 10, textAlign: 'center', color: '#555', margin: '4px 0 0', fontWeight: 600, maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comp?.competitor_name?.split(' ')[0]}</p>
                <div style={{ textAlign: 'center' }}><Delta val={m.theirDelta} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Radar chart */}
      {radarData.length > 2 && (
        <>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 8px' }}>Radar des facteurs</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#F1F0EE" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#888' }} />
              <Radar name="Vous" dataKey="vous" stroke={VIOLET} fill={VIOLET} fillOpacity={0.25} />
              <Radar name={comp?.competitor_name} dataKey="concurrent" stroke={comp?.competitor_color || '#9CA3AF'} fill={comp?.competitor_color || '#9CA3AF'} fillOpacity={0.15} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E4E0' }} />
            </RadarChart>
          </ResponsiveContainer>
        </>
      )}
    </Card>
  );
}

// ─── Strategic Levers ─────────────────────────────────────────────────
function StrategicLeversSection({ levers }) {
  const [openIdx, setOpenIdx] = useState(0);
  if (!levers?.length) return null;

  const priorityOrder = { urgent: 0, short_term: 1, medium_term: 2 };
  const sorted = [...levers].sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));

  return (
    <Card>
      <Label>💡 Leviers stratégiques IA</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((lever, i) => (
          <div key={i} style={{ border: '1px solid #F0EEF8', borderRadius: 12, overflow: 'hidden' }}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: 'none', background: openIdx === i ? '#F5F3FF' : '#fff', cursor: 'pointer', textAlign: 'left' }}
            >
              <Zap size={13} color={VIOLET} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}>{lever.title}</span>
              <PriorityBadge priority={lever.priority} />
              <ChevronDown size={13} color="#aaa" style={{ transform: openIdx === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            </button>
            {openIdx === i && (
              <div style={{ padding: '0 14px 14px', borderTop: '1px solid #F0EEF8' }}>
                <p style={{ fontSize: 12.5, color: '#555', lineHeight: 1.6, margin: '12px 0 10px' }}>{lever.body}</p>
                {lever.recommendations?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {lever.recommendations.map((r, j) => (
                      <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: '#F8F7F4', borderRadius: 8, padding: '8px 10px' }}>
                        <span style={{ fontSize: 11, color: VIOLET, fontWeight: 800, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 12, color: '#333', lineHeight: 1.5 }}>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Thinking animation ───────────────────────────────────────────────
function ThinkingState({ url }) {
  const [step, setStep] = useState(0);
  const steps = [
    'Scanning AI results for your brand…',
    'Analyzing competitor voice share…',
    'Computing growth factor matrix…',
    'Building competitor comparisons…',
    'Generating strategic levers…',
  ];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2400);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', padding: 32, textAlign: 'center', fontFamily: F }}>
      {/* Animated orb */}
      <div style={{ position: 'relative', width: 72, height: 72, marginBottom: 28 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)`, animation: 'haloPulse 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: `3px solid #F1F0EE`, borderTopColor: VIOLET, animation: 'spin 0.9s linear infinite' }} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px' }}>Analyse en cours…</p>
      <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 28px' }}>{url}</p>
      <div style={{ maxWidth: 320, width: '100%' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.5s' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: i < step ? VIOLET : 'transparent', border: `2px solid ${i <= step ? VIOLET : '#E5E7EB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {i < step && <span style={{ fontSize: 8, color: '#fff' }}>✓</span>}
              {i === step && <div style={{ width: 6, height: 6, borderRadius: '50%', background: VIOLET, animation: 'pulse 1s ease-in-out infinite' }} />}
            </div>
            <span style={{ fontSize: 12.5, color: '#333' }}>{s}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.5)}}
        @keyframes haloPulse{0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.2);opacity:1}}
        @keyframes skshimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}
      `}</style>
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, style = {} }) {
  return <div style={{ width: w, height: h, borderRadius: 8, background: 'linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)', backgroundSize: '400% 100%', animation: 'skshimmer 1.4s ease-in-out infinite', ...style }} />;
}
function LoadingState() {
  return (
    <div style={{ padding: '20px 16px' }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 16, padding: 20, marginBottom: 14 }}>
          <Skeleton h={12} w="35%" style={{ marginBottom: 14 }} />
          <Skeleton h={18} w="75%" style={{ marginBottom: 10 }} />
          <Skeleton h={120} />
        </div>
      ))}
      <style>{`@keyframes skshimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
const SEO_TABS = [
  { id: 'overview', label: 'Vue d\'ensemble' },
  { id: 'crawlability', label: 'Explorabilité' },
  { id: 'issues', label: 'Problèmes' },
  { id: 'crawled-pages', label: 'Pages explorées' },
  { id: 'performance', label: 'Performances' },
  { id: 'ai', label: 'Performance IA' },
];

export default function PerformancePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [perfData, setPerfData] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [selectedGrowthBrand, setSelectedGrowthBrand] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [seoSubView, setSeoSubView] = useState(null); // 'crawlability' | 'perf-detail' | null

  useEffect(() => {
    base44.auth.me().then(async u => {
      if (!u) { navigate('/'); return; }
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      if (!profiles.length || !profiles[0].site_url) { setPhase('no_profile'); return; }

      const p = profiles[0];
      let extra = {};
      try { extra = JSON.parse(p.brand_keywords || '{}'); } catch {}
      const fullProfile = { ...p, ...extra };
      setProfile(fullProfile);

      // Cloud cache — same as Home
      if (extra.perf_data && extra.perf_analyzed_at) {
        const age = Date.now() - new Date(extra.perf_analyzed_at).getTime();
        if (age < 24 * 60 * 60 * 1000) {
          setPerfData(extra.perf_data);
          initBrandSelection(extra.perf_data);
          setPhase('done');
          return;
        }
      }

      setPhase('thinking');
      doFetch(p.site_url, fullProfile.identity_name, p.id, extra);
    }).catch(() => setPhase('error'));
  }, []);

  const initBrandSelection = (data) => {
    const comps = data?.strategy?.competitor_comparisons || [];
    if (comps.length) setSelectedGrowthBrand(comps[0]?.competitor_name || '');
    const brands = data?.growth_factors?.brands_in_matrix || [];
    if (brands.length > 1) setSelectedGrowthBrand(brands[1]?.name || '');
  };

  const doFetch = async (url, brandName, profileId, existingExtra) => {
    try {
      const res = await base44.functions.invoke('analyzePerformance', { url, business_name: brandName });
      const data = res?.data;
      if (!data || data.error) { setPhase('error'); return; }
      setPerfData(data);
      initBrandSelection(data);
      setPhase('done');
      const newExtra = { ...existingExtra, perf_data: data, perf_analyzed_at: new Date().toISOString() };
      base44.entities.BusinessProfile.update(profileId, { brand_keywords: JSON.stringify(newExtra) }).catch(() => {});
    } catch {
      setPhase('error');
    }
  };

  const handleRefresh = () => {
    if (!profile) return;
    setPhase('thinking');
    let extra = {};
    try { extra = JSON.parse(profile.brand_keywords || '{}'); } catch {}
    doFetch(profile.site_url, profile.identity_name, profile.id, extra);
  };

  const yourBrandName = perfData?.brand_name || profile?.identity_name || profile?.site_url || 'Votre marque';
  const analyzedAt = perfData?.analyzed_at ? new Date(perfData.analyzed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;

  const renderSeoContent = () => {
    if (seoSubView === 'crawlability') return <CrawlabilityTab onBack={() => setSeoSubView(null)} />;
    if (seoSubView === 'perf-detail') return <PerformanceDetailTab onBack={() => setSeoSubView(null)} />;
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onCrawlabilityClick={() => setSeoSubView('crawlability')} onPerformanceClick={() => setSeoSubView('perf-detail')} />;
      case 'crawlability':
        return <CrawlabilityTab onBack={() => setActiveTab('overview')} />;
      case 'issues':
        return <IssuesTab />;
      case 'crawled-pages':
        return <CrawledPagesTab />;
      case 'performance':
        return <PerformanceDetailTab onBack={() => setActiveTab('overview')} />;
      case 'ai':
        return perfData ? (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
              {[
                { label: 'Voice Share', value: `${perfData.share_of_voice?.your_brand?.voice_share_pct || 0}%`, delta: perfData.share_of_voice?.your_brand?.voice_share_delta, color: VIOLET, icon: '📢' },
                { label: 'Perception', value: `${perfData.share_of_voice?.your_brand?.favorable_pct || 0}%`, delta: perfData.share_of_voice?.your_brand?.favorable_delta, color: '#10B981', icon: '❤️' },
                { label: 'Concurrents', value: `${(perfData.share_of_voice?.competitors || []).length}`, delta: null, color: '#F59E0B', icon: '⚔️' },
              ].map((m, i) => (
                <div key={i} style={{ flex: '1 1 auto', minWidth: 100, background: '#fff', border: '1px solid #EDECE9', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: m.color, lineHeight: 1 }}>{m.value}</div>
                  {m.delta != null && <div style={{ marginTop: 3 }}><Delta val={m.delta} /></div>}
                  <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <ShareOfVoiceSection data={perfData.share_of_voice} yourBrandName={yourBrandName} />
            <FavorabilitySection sov={perfData.share_of_voice} />
            <GrowthFactorsSection data={perfData.growth_factors} selectedBrand={selectedGrowthBrand} onBrandChange={setSelectedGrowthBrand} />
            <CompetitorDeepDive strategy={perfData.strategy} yourBrandName={yourBrandName} />
            <StrategicLeversSection levers={perfData.strategy?.strategic_levers} />
            <p style={{ fontSize: 10, color: '#ccc', textAlign: 'center', marginTop: 16 }}>Données analysées par IA · {analyzedAt}</p>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 40 }}>📊</div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#888' }}>Analyse IA non disponible</p>
            <button onClick={handleRefresh} style={{ padding: '10px 20px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Lancer l'analyse</button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: F }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDECE9', padding: '11px 16px', paddingTop: 'max(11px, calc(env(safe-area-inset-top) + 8px))', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 7, border: '1px solid #E5E4E0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={13} color="#555" />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BarChart2 size={14} color={VIOLET} />
                <h1 style={{ fontSize: 14, fontWeight: 800, color: '#0F0F10', margin: 0 }}>Audit du site</h1>
              </div>
              {profile?.site_url && <p style={{ fontSize: 10, color: '#bbb', margin: 0 }}>{profile.site_url}</p>}
            </div>
          </div>
          <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #E5E4E0', borderRadius: 8, background: '#fff', fontSize: 11, fontWeight: 600, color: '#555', cursor: 'pointer' }}>
            <RefreshCw size={11} /> Actualiser
          </button>
        </div>
        {/* Tab bar */}
        {!seoSubView && (
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', marginBottom: -1 }}>
            {SEO_TABS.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSeoSubView(null); }} style={{
                padding: '8px 14px', border: 'none', borderBottom: `2px solid ${activeTab === tab.id ? VIOLET : 'transparent'}`,
                background: 'transparent', fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? VIOLET : '#888', cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s', flexShrink: 0,
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {phase === 'loading' && <LoadingState />}
      {phase === 'thinking' && <ThinkingState url={profile?.site_url || ''} />}

      {phase === 'no_profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📊</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>Aucun site scanné</p>
          <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>Scannez votre site depuis l'accueil pour débloquer l'analyse.</p>
          <button onClick={() => navigate('/app')} style={{ padding: '12px 24px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>← Aller scanner</button>
        </div>
      )}

      {phase === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>Analyse échouée</p>
          <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>Une erreur s'est produite. Veuillez réessayer.</p>
          <button onClick={handleRefresh} style={{ padding: '12px 24px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Réessayer</button>
        </div>
      )}

      {(phase === 'done' || phase === 'loading') && phase !== 'loading' && (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 12px 80px' }}>
          {renderSeoContent()}
        </div>
      )}

      <style>{`@keyframes skshimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
    </div>
  );
}