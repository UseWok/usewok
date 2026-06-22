import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Trophy, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Design tokens ────────────────────────────────────────────────
const VIOLET = '#7C3AED';
const F = 'Inter, system-ui, sans-serif';

// ─── Shared primitives ────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 14, padding: 20, marginBottom: 14, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 10.5, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
      {children}
    </p>
  );
}

function InsightChip({ type, title, text }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: VIOLET, fontWeight: 700 }}>✦</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: VIOLET }}>{title}</span>
      </div>
      <p style={{ fontSize: 12.5, color: '#555', margin: 0, lineHeight: 1.55 }}>{text}</p>
    </div>
  );
}

function Delta({ val }) {
  if (val == null || val === 0) return <span style={{ fontSize: 10, color: '#aaa' }}>0</span>;
  const up = val > 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 10, fontWeight: 700, color: up ? '#10B981' : '#EF4444' }}>
      {up ? <TrendingUp size={8} /> : <TrendingDown size={8} />}{up ? '+' : ''}{val}%
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = {
    urgent:      { label: 'Urgent',      bg: '#FEE2E2', color: '#DC2626' },
    short_term:  { label: 'Short-term',  bg: '#FEF3C7', color: '#D97706' },
    medium_term: { label: 'Medium-term', bg: '#E0F2FE', color: '#0284C7' },
  };
  const c = cfg[priority] || cfg.medium_term;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────
function Skeleton({ w = '100%', h = 16, style = {} }) {
  return (
    <div style={{ width: w, height: h, borderRadius: 6, background: 'linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)', backgroundSize: '400% 100%', animation: 'skshimmer 1.4s ease-in-out infinite', ...style }} />
  );
}

// ─── Share of Voice Donut ─────────────────────────────────────────
function DonutChart({ data }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + (d.pct || 0), 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <PieChart width={130} height={130}>
        <Pie data={data} cx={60} cy={60} innerRadius={38} outerRadius={60} paddingAngle={2} dataKey="pct" startAngle={90} endAngle={450}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color || '#E5E7EB'} />
          ))}
        </Pie>
      </PieChart>
      <div style={{ flex: 1, minWidth: 130 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 0', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: '#333', fontWeight: 500 }}>{d.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{d.pct}%</span>
              <Delta val={d.delta} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Bubble Chart (Voice Share vs Perception) ─────────────────────
function BubbleChart({ yourBrand, competitors }) {
  if (!yourBrand) return null;
  const all = [
    { name: yourBrand.name, x: yourBrand.voice_share_pct, y: yourBrand.favorable_pct, z: 300, color: VIOLET },
    ...(competitors || []).map(c => ({ name: c.name, x: c.voice_share_pct, y: c.favorable_pct, z: 200, color: c.color || '#9CA3AF' })),
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        {all.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color, border: b.name === yourBrand.name ? `2px solid ${VIOLET}` : 'none' }} />
            <span style={{ fontSize: 11, color: '#555' }}>{b.name}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EE" />
          <XAxis dataKey="x" name="Voice Share %" type="number" label={{ value: 'Voice Share (%)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#aaa' }} tick={{ fontSize: 9, fill: '#aaa' }} />
          <YAxis dataKey="y" name="Perception %" type="number" domain={[60, 105]} label={{ value: 'Perception (%)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#aaa' }} tick={{ fontSize: 9, fill: '#aaa' }} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div style={{ background: '#fff', border: '1px solid #E5E4E0', borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
                <strong>{d?.name}</strong><br />
                Voice: {d?.x}% · Perception: {d?.y}%
              </div>
            );
          }} />
          <Scatter data={all} fill={VIOLET}>
            {all.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Growth Factors Matrix ────────────────────────────────────────
function GrowthFactorRow({ factor, brandsInMatrix, yourBrandName, maxCount }) {
  const allCounts = [
    factor.your_brand_count,
    ...(factor.competitors || []).map(c => c.count),
  ];
  const maxVal = Math.max(...allCounts, 1);

  const getCell = (count, isLeader, color) => {
    const opacity = Math.max(0.08, (count / maxVal) * 0.85);
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minWidth: 40, height: 26, borderRadius: 4, background: count > 0 ? `${color}` : 'transparent', opacity: count > 0 ? opacity + 0.15 : 1 }}>
        {count > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a' }}>{count}</span>}
        {isLeader && count > 0 && <span style={{ position: 'absolute', top: -4, right: -4, fontSize: 9 }}>🏆</span>}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', borderBottom: '1px solid #F5F4F1' }}>
      <span style={{ flex: 1, fontSize: 11.5, color: '#333', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{factor.name}</span>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {/* Your brand */}
        {getCell(factor.your_brand_count, false, VIOLET)}
        {/* Competitors */}
        {(factor.competitors || []).map((c, i) => (
          getCell(c.count, c.is_leader, brandsInMatrix?.[i + 1]?.color || '#9CA3AF')
        ))}
        {/* Total */}
        <span style={{ fontSize: 10, color: '#aaa', minWidth: 24, textAlign: 'right' }}>{factor.total_mentions}</span>
        <span style={{ fontSize: 10, color: '#aaa', minWidth: 22, textAlign: 'right' }}>{factor.branded_mentions}</span>
      </div>
    </div>
  );
}

function GrowthFactorsMatrix({ data }) {
  const { top_insight, factors, brands_in_matrix } = data || {};
  if (!factors?.length) return null;

  return (
    <Card>
      <SectionLabel>Key Growth Factors</SectionLabel>
      {top_insight && (
        <InsightChip title={top_insight.factor} text={top_insight.insight} />
      )}

      {/* Brand headers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #F1F0EE' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Growth Factor</span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {(brands_in_matrix || []).map((b, i) => (
            <div key={i} style={{ minWidth: 40, textAlign: 'center' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: b.color, margin: '0 auto 2px' }} />
              <span style={{ fontSize: 9, color: '#aaa', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 40 }}>{b.name?.split(' ')[0]}</span>
            </div>
          ))}
          <span style={{ fontSize: 9, color: '#aaa', minWidth: 24, textAlign: 'right' }}>Total</span>
          <span style={{ fontSize: 9, color: '#aaa', minWidth: 22, textAlign: 'right' }}>Brand.</span>
        </div>
      </div>

      {factors.map((f, i) => (
        <GrowthFactorRow key={i} factor={f} brandsInMatrix={brands_in_matrix} maxCount={30} />
      ))}
    </Card>
  );
}

// ─── Competitor Comparison Card ───────────────────────────────────
function CompetitorComparison({ comp, yourBrandName, yourBrandColor = VIOLET, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const maxVal = Math.max(...(comp.growth_factors || []).map(f => Math.max(f.your_count, f.competitor_count)), 1);

  return (
    <Card style={{ marginBottom: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: yourBrandColor }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{yourBrandName}</span>
        <span style={{ fontSize: 12, color: '#888' }}>vs</span>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: comp.competitor_color || '#9CA3AF' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{comp.competitor_name}</span>
      </div>

      <InsightChip title={comp.insight_title} text={comp.insight_text} />

      {/* Key Metrics */}
      <div style={{ background: '#F8F7F4', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
        <div style={{ display: 'flex', marginBottom: 8 }}>
          <span style={{ flex: 1, fontSize: 11, color: '#aaa', fontWeight: 600 }}>Key Metrics</span>
          <span style={{ minWidth: 90, fontSize: 11, color: '#555', fontWeight: 600, textAlign: 'center' }}>{yourBrandName}</span>
          <span style={{ minWidth: 90, fontSize: 11, color: '#555', fontWeight: 600, textAlign: 'center' }}>{comp.competitor_name}</span>
        </div>
        {[
          { label: 'Voice Share', yours: `${comp.your_voice_share}%`, theirs: `${comp.competitor_voice_share}%`, yourDelta: comp.your_voice_delta, theirDelta: comp.competitor_voice_delta },
          { label: 'Favorable Perception', yours: `${comp.your_favorable}%`, theirs: `${comp.competitor_favorable}%`, yourDelta: comp.your_favorable_delta, theirDelta: comp.competitor_favorable_delta },
        ].map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', paddingTop: 6 }}>
            <span style={{ flex: 1, fontSize: 12, color: '#555' }}>{m.label}</span>
            <div style={{ minWidth: 90, textAlign: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a' }}>{m.yours} </span>
              <Delta val={m.yourDelta} />
            </div>
            <div style={{ minWidth: 90, textAlign: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a' }}>{m.theirs} </span>
              <Delta val={m.theirDelta} />
            </div>
          </div>
        ))}
      </div>

      {/* Growth factors table — collapsible */}
      {comp.growth_factors?.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#555' }}>Growth Factors by Frequency</span>
            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {expanded && (
            <div>
              {/* Header row */}
              <div style={{ display: 'flex', gap: 8, paddingBottom: 6, borderBottom: '1px solid #F1F0EE', marginBottom: 2 }}>
                <span style={{ flex: 1, fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase' }}>Factor</span>
                <span style={{ fontSize: 10, color: '#aaa', minWidth: 50, textAlign: 'center' }}>{yourBrandName?.split(' ')[0]}</span>
                <span style={{ fontSize: 10, color: '#aaa', minWidth: 50, textAlign: 'center' }}>{comp.competitor_name?.split(' ')[0]}</span>
              </div>
              {comp.growth_factors.map((f, i) => {
                const maxV = Math.max(f.your_count, f.competitor_count, 1);
                const yourOpacity = Math.max(0.12, (f.your_count / maxV) * 0.85);
                const theirOpacity = Math.max(0.12, (f.competitor_count / maxV) * 0.85);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #F9F8F6' }}>
                    <span style={{ flex: 1, fontSize: 11, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <div style={{ minWidth: 50, display: 'flex', justifyContent: 'center' }}>
                      {f.your_count > 0 ? (
                        <div style={{ background: VIOLET, opacity: yourOpacity + 0.1, borderRadius: 4, padding: '2px 8px', position: 'relative' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a' }}>{f.your_count}</span>
                        </div>
                      ) : <span style={{ fontSize: 10, color: '#ddd' }}>—</span>}
                    </div>
                    <div style={{ minWidth: 50, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                      {f.competitor_count > 0 ? (
                        <div style={{ background: comp.competitor_color || '#9CA3AF', opacity: theirOpacity + 0.1, borderRadius: 4, padding: '2px 8px', position: 'relative' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a' }}>{f.competitor_count}</span>
                          {f.competitor_is_leader && <span style={{ position: 'absolute', top: -5, right: -5, fontSize: 8 }}>🏆</span>}
                        </div>
                      ) : <span style={{ fontSize: 10, color: '#ddd' }}>—</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

// ─── Strategic Levers ─────────────────────────────────────────────
function StrategicLevers({ levers }) {
  if (!levers?.length) return null;

  return (
    <Card>
      <SectionLabel>Strategic AI Levers</SectionLabel>
      <p style={{ fontSize: 11.5, color: '#aaa', marginBottom: 16, marginTop: -6 }}>Based on what LLMs say about your brand from the latest analysis.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {levers.map((lever, i) => (
          <div key={i} style={{ paddingBottom: i < levers.length - 1 ? 16 : 0, borderBottom: i < levers.length - 1 ? '1px solid #F1F0EE' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
              <p style={{ fontSize: 13.5, fontWeight: 800, color: '#1a1a1a', margin: 0, lineHeight: 1.4, flex: 1 }}>{lever.title}</p>
              <PriorityBadge priority={lever.priority} />
            </div>
            <p style={{ fontSize: 12.5, color: '#555', lineHeight: 1.6, margin: '0 0 10px' }}>{lever.body}</p>
            {lever.recommendations?.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#888', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendations:</p>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {lever.recommendations.map((r, j) => (
                    <li key={j} style={{ fontSize: 12, color: '#444', lineHeight: 1.55, marginBottom: 4 }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Loading State ────────────────────────────────────────────────
function LoadingState() {
  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        <Skeleton h={28} w="60%" />
        <Skeleton h={14} w="40%" />
      </div>
      {[1,2,3].map(i => (
        <div key={i} style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 14, padding: 20, marginBottom: 14 }}>
          <Skeleton h={14} w="40%" style={{ marginBottom: 12 }} />
          <Skeleton h={20} w="80%" style={{ marginBottom: 8 }} />
          <Skeleton h={14} w="60%" style={{ marginBottom: 16 }} />
          <Skeleton h={100} />
        </div>
      ))}
      <style>{`@keyframes skshimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
    </div>
  );
}

// ─── Thinking animation while AI works ───────────────────────────
function ThinkingState({ url }) {
  const [step, setStep] = useState(0);
  const steps = [
    'Scanning AI search results for your brand…',
    'Analyzing competitor voice share data…',
    'Computing growth factor matrix…',
    'Building competitor comparisons…',
    'Generating strategic recommendations…',
  ];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2200);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center', fontFamily: F }}>
      <div style={{ width: 52, height: 52, borderRadius: '50%', border: `3px solid #F1F0EE`, borderTopColor: VIOLET, animation: 'spin 0.9s linear infinite', marginBottom: 24 }} />
      <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>Analyzing Performance</p>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>{url}</p>
      <div style={{ maxWidth: 340 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', opacity: i <= step ? 1 : 0.25, transition: 'opacity 0.4s' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${i < step ? VIOLET : i === step ? VIOLET : '#E5E7EB'}`, background: i < step ? VIOLET : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' }}>
              {i < step && <span style={{ fontSize: 8, color: '#fff' }}>✓</span>}
              {i === step && <div style={{ width: 6, height: 6, borderRadius: '50%', background: VIOLET, animation: 'pulse 1s ease-in-out infinite' }} />}
            </div>
            <span style={{ fontSize: 12, color: i <= step ? '#333' : '#aaa' }}>{s}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.5)}}`}</style>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function PerformancePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [perfData, setPerfData] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | thinking | done | error | no_profile

  useEffect(() => {
    base44.auth.me().then(async u => {
      if (!u) { navigate('/'); return; }

      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      if (!profiles.length || !profiles[0].site_url) {
        setPhase('no_profile');
        return;
      }
      const p = profiles[0];
      let extra = {};
      try { extra = JSON.parse(p.brand_keywords || '{}'); } catch {}
      const fullProfile = { ...p, ...extra };
      setProfile(fullProfile);

      // Check if we have cached perf data
      if (extra.perf_data && extra.perf_analyzed_at) {
        const age = Date.now() - new Date(extra.perf_analyzed_at).getTime();
        if (age < 24 * 60 * 60 * 1000) { // < 24h
          setPerfData(extra.perf_data);
          setPhase('done');
          return;
        }
      }

      // Fetch fresh
      setPhase('thinking');
      fetchPerformance(p.site_url, fullProfile.identity_name, p.id, extra);
    }).catch(() => setPhase('error'));
  }, []);

  const fetchPerformance = async (url, brandName, profileId, existingExtra) => {
    try {
      const res = await base44.functions.invoke('analyzePerformance', { url, business_name: brandName });
      const data = res?.data;
      if (!data || data.error) { setPhase('error'); return; }
      setPerfData(data);
      setPhase('done');
      // Cache in BusinessProfile
      const newExtra = { ...existingExtra, perf_data: data, perf_analyzed_at: new Date().toISOString() };
      base44.entities.BusinessProfile.update(profileId, { brand_keywords: JSON.stringify(newExtra) }).catch(() => {});
    } catch {
      setPhase('error');
    }
  };

  const handleRefresh = () => {
    if (!profile) return;
    setPhase('thinking');
    let existingExtra = {};
    try { existingExtra = JSON.parse(profile.brand_keywords || '{}'); } catch {}
    fetchPerformance(profile.site_url, profile.identity_name, profile.id, existingExtra);
  };

  const yourBrandName = perfData?.brand_name || profile?.identity_name || profile?.site_url || 'Your Brand';

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: F }}>
      {/* Sticky header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDECE9', padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/app')} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #E5E4E0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={13} color="#555" />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={14} color="#10B981" />
              <h1 style={{ fontSize: 14, fontWeight: 800, color: '#0F0F10', margin: 0 }}>Performance</h1>
            </div>
            {profile?.site_url && <p style={{ fontSize: 10.5, color: '#aaa', margin: 0 }}>{profile.site_url}</p>}
          </div>
        </div>
        {phase === 'done' && (
          <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: '1px solid #E5E4E0', borderRadius: 8, background: '#fff', fontSize: 11, fontWeight: 600, color: '#555', cursor: 'pointer' }}>
            <RefreshCw size={11} /> Refresh
          </button>
        )}
      </div>

      {/* States */}
      {phase === 'loading' && <LoadingState />}
      {phase === 'thinking' && <ThinkingState url={profile?.site_url || ''} />}

      {phase === 'no_profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>No website scanned yet</p>
          <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>Scan your website first to unlock Performance analysis.</p>
          <button onClick={() => navigate('/app')} style={{ padding: '12px 24px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            ← Go Scan
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>Analysis failed</p>
          <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>Something went wrong. Please try again.</p>
          <button onClick={handleRefresh} style={{ padding: '12px 24px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      )}

      {phase === 'done' && perfData && (
        <div style={{ maxWidth: 740, margin: '0 auto', padding: '20px 16px 60px' }}>

          {/* ── 1. Share of Voice ── */}
          <Card>
            <SectionLabel>Share of Voice</SectionLabel>
            {perfData.share_of_voice?.insight_title && (
              <InsightChip title={perfData.share_of_voice.insight_title} text={perfData.share_of_voice.insight_text} />
            )}
            <DonutChart data={perfData.share_of_voice?.donut_data} />
          </Card>

          {/* ── 2. Voice Share + Perception bubble chart ── */}
          <Card>
            <SectionLabel>Voice Share & Perception</SectionLabel>
            <BubbleChart yourBrand={perfData.share_of_voice?.your_brand} competitors={perfData.share_of_voice?.competitors} />
          </Card>

          {/* ── 3. Growth Factors Matrix ── */}
          {perfData.growth_factors && <GrowthFactorsMatrix data={perfData.growth_factors} />}

          {/* ── 4. Your Brand vs Competitors ── */}
          {perfData.strategy?.competitor_comparisons?.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 12px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#555', margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your Brand vs Competitors</p>
                <div style={{ height: 1, flex: 1, background: '#EDECE9' }} />
              </div>
              {perfData.strategy.competitor_comparisons.map((comp, i) => (
                <CompetitorComparison
                  key={i}
                  comp={comp}
                  yourBrandName={yourBrandName}
                  defaultExpanded={i === 0}
                />
              ))}
            </>
          )}

          {/* ── 5. Strategic AI Levers ── */}
          {perfData.strategy?.strategic_levers?.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '20px 0 12px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#555', margin: 0, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Strategic Recommendations</p>
                <div style={{ height: 1, flex: 1, background: '#EDECE9' }} />
              </div>
              <StrategicLevers levers={perfData.strategy.strategic_levers} />
            </>
          )}

          {/* Footer */}
          <p style={{ fontSize: 10.5, color: '#ccc', textAlign: 'center', marginTop: 20 }}>
            Analyzed {perfData.analyzed_at ? new Date(perfData.analyzed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently'}
          </p>
        </div>
      )}

      <style>{`@keyframes skshimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
    </div>
  );
}