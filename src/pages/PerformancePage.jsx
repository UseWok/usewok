import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, ChevronDown, Zap } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EFEFEF';
const SURFACE = '#F9F8F6';
const WHITE = '#FFFFFF';
const VIOLET = '#7C3AED';

// ── Primitives ────────────────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px', marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px', fontFamily: F }}>{children}</p>;
}

function Delta({ val }) {
  if (val == null || val === 0) return null;
  const up = val > 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: up ? '#059669' : '#DC2626' }}>
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}{up ? '+' : ''}{val}%
    </span>
  );
}

// ── Simple dropdown ───────────────────────────────────────────────────────────
function Dropdown({ options, value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div style={{ position: 'relative' }}>
      {label && <p style={{ fontSize: 10, fontWeight: 700, color: INK3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>}
      <button onClick={() => setOpen(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
        border: `1.5px solid ${BORDER}`, borderRadius: 10, background: WHITE,
        fontSize: 12, fontWeight: 600, color: INK, cursor: 'pointer', minWidth: 160, justifyContent: 'space-between', width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {selected?.color && <div style={{ width: 8, height: 8, borderRadius: '50%', background: selected.color }} />}
          <span>{selected?.label || 'Choisir…'}</span>
        </div>
        <ChevronDown size={12} color={INK3} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 10, zIndex: 100, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          {options.map(opt => (
            <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px',
              border: 'none', background: opt.value === value ? '#F5F3FF' : WHITE,
              fontSize: 12, fontWeight: opt.value === value ? 700 : 500, color: INK, cursor: 'pointer', textAlign: 'left',
            }}>
              {opt.color && <div style={{ width: 8, height: 8, borderRadius: '50%', background: opt.color }} />}
              {opt.label}
              {opt.value === value && <span style={{ marginLeft: 'auto', color: VIOLET, fontSize: 12 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Share of Voice ────────────────────────────────────────────────────────────
function ShareOfVoice({ data }) {
  if (!data) return null;
  const donut = data.donut_data || [];

  return (
    <Card>
      <Label>Share of Voice</Label>
      {data.insight_text && (
        <div style={{ background: '#F5F3FF', border: `1px solid #DDD6FE`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: VIOLET, margin: '0 0 3px' }}>{data.insight_title}</p>
          <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.55 }}>{data.insight_text}</p>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <PieChart width={120} height={120}>
            <Pie data={donut} cx={55} cy={55} innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="pct" startAngle={90} endAngle={450}>
              {donut.map((e, i) => <Cell key={i} fill={e.color || '#E5E7EB'} />)}
            </Pie>
          </PieChart>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: INK }}>{data.your_brand?.voice_share_pct || donut[0]?.pct || 0}%</div>
              <div style={{ fontSize: 9, color: INK3, fontWeight: 600 }}>Vous</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          {donut.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < donut.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: INK, fontWeight: i === 0 ? 700 : 400 }}>{d.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>{d.pct}%</span>
                <Delta val={d.delta} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── Favorability ──────────────────────────────────────────────────────────────
function Favorability({ sov }) {
  if (!sov) return null;
  const items = [
    { name: sov.your_brand?.name || 'Vous', pct: sov.your_brand?.favorable_pct || 0, color: VIOLET, delta: sov.your_brand?.favorable_delta },
    ...(sov.competitors || []).map(c => ({ name: c.name, pct: c.favorable_pct || 0, color: c.color || '#9CA3AF', delta: c.favorable_delta })),
  ];
  return (
    <Card>
      <Label>Perception favorable</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                <span style={{ fontSize: 12, fontWeight: i === 0 ? 700 : 500, color: INK }}>{item.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>{item.pct}%</span>
                <Delta val={item.delta} />
              </div>
            </div>
            <div style={{ height: 6, background: SURFACE, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${item.pct}%`, background: item.color, borderRadius: 4, transition: 'width 1s ease', opacity: i === 0 ? 1 : 0.7 }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Growth Factors ────────────────────────────────────────────────────────────
function GrowthFactors({ data, selectedBrand, onBrandChange }) {
  const { factors, brands_in_matrix, top_insight } = data || {};
  if (!factors?.length) return null;

  const brandOptions = (brands_in_matrix || []).filter((_, i) => i > 0).map(b => ({ value: b.name, label: b.name, color: b.color }));
  const yourBrand = brands_in_matrix?.[0];
  const selectedObj = brands_in_matrix?.find(b => b.name === selectedBrand);

  const barData = factors.map(f => {
    const compEntry = f.competitors?.find(c => c.name === selectedBrand);
    return {
      name: f.name.length > 18 ? f.name.slice(0, 16) + '…' : f.name,
      fullName: f.name,
      yours: f.your_brand_count,
      competitor: compEntry?.count || 0,
    };
  }).slice(0, 8);

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <Label>Facteurs de croissance</Label>
        {brandOptions.length > 0 && (
          <div style={{ minWidth: 160 }}>
            <Dropdown options={brandOptions} value={selectedBrand} onChange={onBrandChange} label="vs concurrent" />
          </div>
        )}
      </div>

      {top_insight?.insight && (
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '10px 13px', marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: INK, margin: '0 0 2px' }}>💡 {top_insight.factor}</p>
          <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.5 }}>{top_insight.insight}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: VIOLET }} />
          <span style={{ fontSize: 11, color: INK2, fontWeight: 600 }}>{yourBrand?.name || 'Vous'}</span>
        </div>
        {selectedObj && selectedObj.name !== yourBrand?.name && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: selectedObj.color }} />
            <span style={{ fontSize: 11, color: INK2, fontWeight: 600 }}>{selectedObj.name}</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 9, fill: INK3 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: INK2 }} width={95} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${BORDER}`, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
          <Bar dataKey="yours" fill={VIOLET} radius={[0, 3, 3, 0]} />
          {selectedObj && selectedObj.name !== yourBrand?.name && (
            <Bar dataKey="competitor" fill={selectedObj.color} radius={[0, 3, 3, 0]} opacity={0.7} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ── Competitor Deep-Dive ──────────────────────────────────────────────────────
function CompetitorDeepDive({ strategy }) {
  const comps = strategy?.competitor_comparisons || [];
  const [selected, setSelected] = useState(comps[0]?.competitor_name || '');
  if (!comps.length) return null;

  const options = comps.map(c => ({ value: c.competitor_name, label: c.competitor_name, color: c.competitor_color }));
  const comp = comps.find(c => c.competitor_name === selected) || comps[0];

  const radarData = (comp?.growth_factors || []).slice(0, 7).map(f => ({
    subject: f.name.length > 13 ? f.name.slice(0, 12) + '…' : f.name,
    vous: f.your_count,
    concurrent: f.competitor_count,
  }));

  const statusCfg = comp?.insight_type === 'ahead'
    ? { bg: '#F0FDF4', border: '#BBF7D0', color: '#065F46', emoji: '🏆' }
    : comp?.insight_type === 'behind'
    ? { bg: '#FFF1F2', border: '#FECDD3', color: '#9F1239', emoji: '⚠️' }
    : { bg: '#F0F9FF', border: '#BAE6FD', color: '#0C4A6E', emoji: '🤝' };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <Label>Votre marque vs concurrent</Label>
        <div style={{ minWidth: 180 }}>
          <Dropdown options={options} value={selected} onChange={setSelected} label="Choisir un concurrent" />
        </div>
      </div>

      {comp?.insight_text && (
        <div style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: statusCfg.color, margin: '0 0 3px' }}>{statusCfg.emoji} {comp.insight_title}</p>
          <p style={{ fontSize: 12, color: statusCfg.color, margin: 0, opacity: 0.85, lineHeight: 1.5 }}>{comp.insight_text}</p>
        </div>
      )}

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Voice Share', yours: comp?.your_voice_share, theirs: comp?.competitor_voice_share, yourDelta: comp?.your_voice_delta, theirDelta: comp?.competitor_voice_delta },
          { label: 'Perception', yours: comp?.your_favorable, theirs: comp?.competitor_favorable, yourDelta: comp?.your_favorable_delta, theirDelta: comp?.competitor_favorable_delta },
        ].map((m, i) => (
          <div key={i} style={{ background: SURFACE, borderRadius: 12, padding: '14px 12px' }}>
            <p style={{ fontSize: 10, color: INK3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>{m.label}</p>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: VIOLET, lineHeight: 1 }}>{m.yours || 0}%</div>
                <div style={{ fontSize: 10, color: INK3, margin: '3px 0 2px' }}>Vous</div>
                <Delta val={m.yourDelta} />
              </div>
              <div style={{ fontSize: 14, color: BORDER, fontWeight: 300 }}>vs</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: comp?.competitor_color || INK3, lineHeight: 1 }}>{m.theirs || 0}%</div>
                <div style={{ fontSize: 10, color: INK3, margin: '3px 0 2px', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comp?.competitor_name?.split(' ')[0]}</div>
                <Delta val={m.theirDelta} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {radarData.length > 2 && (
        <>
          <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 8px' }}>Radar facteurs</p>
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={BORDER} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: INK2 }} />
              <Radar name="Vous" dataKey="vous" stroke={VIOLET} fill={VIOLET} fillOpacity={0.2} />
              <Radar name={comp?.competitor_name} dataKey="concurrent" stroke={comp?.competitor_color || INK3} fill={comp?.competitor_color || INK3} fillOpacity={0.12} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${BORDER}` }} />
            </RadarChart>
          </ResponsiveContainer>
        </>
      )}
    </Card>
  );
}

// ── Strategic Levers ──────────────────────────────────────────────────────────
function StrategicLevers({ levers }) {
  const [openIdx, setOpenIdx] = useState(0);
  if (!levers?.length) return null;

  const priority = { urgent: 0, short_term: 1, medium_term: 2 };
  const sorted = [...levers].sort((a, b) => (priority[a.priority] ?? 2) - (priority[b.priority] ?? 2));

  const badgeCfg = {
    urgent:      { label: 'Urgent',      bg: '#FEF2F2', color: '#DC2626' },
    short_term:  { label: 'Court terme', bg: '#FFFBEB', color: '#D97706' },
    medium_term: { label: 'Moyen terme', bg: '#EFF6FF', color: '#2563EB' },
  };

  return (
    <Card>
      <Label>Leviers stratégiques IA</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {sorted.map((lever, i) => {
          const b = badgeCfg[lever.priority] || badgeCfg.medium_term;
          return (
            <div key={i} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', border: 'none', background: openIdx === i ? SURFACE : WHITE, cursor: 'pointer', textAlign: 'left', fontFamily: F }}>
                <Zap size={13} color={VIOLET} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: INK, lineHeight: 1.3 }}>{lever.title}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: b.bg, color: b.color, flexShrink: 0 }}>{b.label}</span>
                <ChevronDown size={12} color={INK3} style={{ transform: openIdx === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
              </button>
              {openIdx === i && (
                <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${BORDER}` }}>
                  <p style={{ fontSize: 13, color: INK2, lineHeight: 1.65, margin: '12px 0 10px' }}>{lever.body}</p>
                  {lever.recommendations?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {lever.recommendations.map((r, j) => (
                        <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: SURFACE, borderRadius: 8, padding: '8px 10px' }}>
                          <span style={{ fontSize: 11, color: VIOLET, fontWeight: 800, flexShrink: 0 }}>→</span>
                          <span style={{ fontSize: 12, color: INK2, lineHeight: 1.5 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ── Loading / Thinking states ─────────────────────────────────────────────────
function ThinkingState({ url }) {
  const [step, setStep] = useState(0);
  const steps = [
    'Scanning les résultats IA pour votre marque…',
    'Analyse de la part de voix concurrentielle…',
    'Calcul de la matrice de croissance…',
    'Comparaisons concurrents en cours…',
    'Génération des leviers stratégiques…',
  ];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2500);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', padding: 32, textAlign: 'center', fontFamily: F }}>
      <div style={{ position: 'relative', width: 64, height: 64, marginBottom: 24 }}>
        <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: VIOLET, animation: 'spin 0.9s linear infinite' }} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 800, color: INK, margin: '0 0 4px' }}>Analyse Performance en cours…</p>
      <p style={{ fontSize: 12, color: INK3, margin: '0 0 28px' }}>{url}</p>
      <div style={{ maxWidth: 300, width: '100%' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.5s' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: i < step ? VIOLET : 'transparent', border: `2px solid ${i <= step ? VIOLET : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {i < step && <span style={{ fontSize: 8, color: WHITE }}>✓</span>}
              {i === step && <div style={{ width: 5, height: 5, borderRadius: '50%', background: VIOLET, animation: 'pulse 1s ease-in-out infinite' }} />}
            </div>
            <span style={{ fontSize: 12, color: INK2, textAlign: 'left' }}>{s}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.5)}}`}</style>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PerformancePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [perfData, setPerfData] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [selectedGrowthBrand, setSelectedGrowthBrand] = useState('');

  const loadPerf = async (forceRefresh = false) => {
    try {
      const u = await base44.auth.me();
      if (!u) { navigate('/'); return; }
      const active = getActiveDomain();
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      // Match active domain first, fallback to first profile
      const p = active ? (profiles.find(pr => pr.site_url === active.url) || profiles[0]) : profiles[0];
      if (!p || !p.site_url) { setPhase('no_profile'); return; }
      let extra = {};
      try { extra = JSON.parse(p.brand_keywords || '{}'); } catch {}
      const full = { ...p, ...extra };
      setProfile(full);

      if (!forceRefresh && extra.perf_data && extra.perf_analyzed_at) {
        const age = Date.now() - new Date(extra.perf_analyzed_at).getTime();
        if (age < 24 * 60 * 60 * 1000) {
          setPerfData(extra.perf_data);
          initBrandSel(extra.perf_data);
          setPhase('done');
          return;
        }
      }
      setPhase('thinking');
      doFetch(p.site_url, full.identity_name, p.id, extra);
    } catch { setPhase('error'); }
  };

  useEffect(() => {
    loadPerf();
    const unsub = onActiveDomainChange(() => loadPerf());
    return unsub;
  }, []);

  const initBrandSel = (data) => {
    const brands = data?.growth_factors?.brands_in_matrix || [];
    if (brands.length > 1) setSelectedGrowthBrand(brands[1]?.name || '');
  };

  const doFetch = async (url, brandName, profileId, existingExtra) => {
    try {
      const res = await base44.functions.invoke('analyzePerformance', { url, business_name: brandName });
      const d = res?.data;
      if (!d || d.error) { setPhase('error'); return; }
      setPerfData(d);
      initBrandSel(d);
      setPhase('done');
      const newExtra = { ...existingExtra, perf_data: d, perf_analyzed_at: new Date().toISOString() };
      base44.entities.BusinessProfile.update(profileId, { brand_keywords: JSON.stringify(newExtra) }).catch(() => {});
    } catch { setPhase('error'); }
  };

  const handleRefresh = () => loadPerf(true);

  const yourBrandName = perfData?.brand_name || profile?.identity_name || profile?.site_url || 'Votre marque';
  const analyzedAt = perfData?.analyzed_at
    ? new Date(perfData.analyzed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>
      {/* Header */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '11px 16px', paddingTop: 'max(11px, calc(env(safe-area-inset-top) + 8px))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/app')} style={{ width: 30, height: 30, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={13} color={INK2} />
          </button>
          <div>
            <h1 style={{ fontSize: 14, fontWeight: 800, color: INK, margin: 0 }}>Performance IA</h1>
            {analyzedAt && <p style={{ fontSize: 10, color: INK3, margin: 0 }}>Analysé le {analyzedAt}</p>}
          </div>
        </div>
        {phase === 'done' && (
          <button onClick={handleRefresh} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer' }}>
            <RefreshCw size={11} /> Actualiser
          </button>
        )}
      </div>

      {phase === 'loading' && (
        <div style={{ padding: '24px 16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 12 }}>
              <div style={{ height: 10, width: '30%', background: SURFACE, borderRadius: 6, marginBottom: 14 }} />
              <div style={{ height: 110, background: SURFACE, borderRadius: 10 }} />
            </div>
          ))}
        </div>
      )}

      {phase === 'thinking' && <ThinkingState url={profile?.site_url || ''} />}

      {phase === 'no_profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: INK, margin: '0 0 8px' }}>Aucun site scanné</p>
          <p style={{ fontSize: 13, color: INK3, margin: '0 0 20px' }}>Scannez votre site depuis l'accueil pour débloquer l'analyse Performance.</p>
          <button onClick={() => navigate('/app')} style={{ padding: '12px 24px', background: INK, color: WHITE, border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>← Aller scanner</button>
        </div>
      )}

      {phase === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '65vh', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: 17, fontWeight: 800, color: INK, margin: '0 0 8px' }}>Analyse échouée</p>
          <button onClick={handleRefresh} style={{ padding: '12px 24px', background: INK, color: WHITE, border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Réessayer</button>
        </div>
      )}

      {phase === 'done' && perfData && (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 14px 80px' }}>

          {/* Hero metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Voice Share', value: `${perfData.share_of_voice?.your_brand?.voice_share_pct || 0}%`, delta: perfData.share_of_voice?.your_brand?.voice_share_delta },
              { label: 'Perception fav.', value: `${perfData.share_of_voice?.your_brand?.favorable_pct || 0}%`, delta: perfData.share_of_voice?.your_brand?.favorable_delta },
              { label: 'Concurrents', value: `${(perfData.share_of_voice?.competitors || []).length}`, delta: null },
            ].map((m, i) => (
              <div key={i} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 14px' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.03em' }}>{m.value}</div>
                {m.delta != null && <div style={{ margin: '6px 0 2px' }}><Delta val={m.delta} /></div>}
                <div style={{ fontSize: 10, color: INK3, fontWeight: 600, marginTop: m.delta != null ? 0 : 8 }}>{m.label}</div>
              </div>
            ))}
          </div>

          <ShareOfVoice data={perfData.share_of_voice} />
          <Favorability sov={perfData.share_of_voice} />
          <GrowthFactors data={perfData.growth_factors} selectedBrand={selectedGrowthBrand} onBrandChange={setSelectedGrowthBrand} />
          <CompetitorDeepDive strategy={perfData.strategy} yourBrandName={yourBrandName} />
          <StrategicLevers levers={perfData.strategy?.strategic_levers} />

          {analyzedAt && <p style={{ fontSize: 10, color: '#D1D1D1', textAlign: 'center', marginTop: 12 }}>Données analysées par IA · {analyzedAt}</p>}
        </div>
      )}
    </div>
  );
}