import { useState } from 'react';
import { TrendingUp, TrendingDown, CheckCircle2, XCircle, AlertTriangle, Star, Globe, ExternalLink, Zap, Activity, BarChart2, Shield, Smartphone, Map, Search } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const VIOLET = '#7C3AED';
const F = 'Inter, system-ui, sans-serif';

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function Delta({ val, suffix = '%' }) {
  if (val == null || val === 0) return <span style={{ fontSize: 11, color: '#bbb' }}>—</span>;
  const up = val > 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: up ? '#16A34A' : '#DC2626' }}>
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {up ? '+' : ''}{typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(1)) : val}{suffix}
    </span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #EDECE9', borderRadius: 14,
      padding: '18px 20px', marginBottom: 14, ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children, color = '#888' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
      {Icon && <Icon size={13} color={color} />}
      <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{children}</p>
    </div>
  );
}

function MetricTile({ label, value, delta, color = '#0F0F10', emoji }) {
  return (
    <div style={{ background: '#FAFAF8', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{emoji && <span style={{ marginRight: 4 }}>{emoji}</span>}{value}</div>
      {delta != null && <Delta val={delta} />}
    </div>
  );
}

// ── Score Ring ──────────────────────────────────────────────────────
function ScoreRing({ value, size = 72, strokeWidth = 7, color }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F0EE" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(value, 100) / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#0F0F10' }}>
        {Math.round(value)}
      </div>
    </div>
  );
}

// ── Horizontal bar ─────────────────────────────────────────────────
function HBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#F1F0EE', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 1.2s ease' }} />
      </div>
      {label && <span style={{ fontSize: 11, color: '#888', minWidth: 28, textAlign: 'right' }}>{label}</span>}
    </div>
  );
}

// ── AI Engine row ──────────────────────────────────────────────────
const ENGINE_COLORS = {
  chatgpt:    { color: '#10A37F', label: 'ChatGPT' },
  gemini:     { color: '#4285F4', label: 'Gemini' },
  claude:     { color: '#C96442', label: 'Claude' },
  perplexity: { color: '#20808D', label: 'Perplexity' },
  mistral:    { color: '#7C3AED', label: 'Mistral' },
  llama:      { color: '#0EA5E9', label: 'Llama' },
  grok:       { color: '#1a1a1a', label: 'Grok' },
  copilot:    { color: '#0078D4', label: 'Copilot' },
};

function EngineRow({ name, score, max }) {
  const cfg = ENGINE_COLORS[name] || { color: '#888', label: name };
  const pct = max > 0 ? Math.min((score / max) * 100, 100) : 0;
  const badge = score >= 60 ? '🏆' : score >= 35 ? '⚡' : '🔴';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F5F4F1' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: '#333', width: 90, flexShrink: 0 }}>{cfg.label}</span>
      <div style={{ flex: 1, height: 6, background: '#F1F0EE', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 3, transition: 'width 1.2s ease' }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', width: 32, textAlign: 'right' }}>{score ?? '–'}</span>
      <span style={{ fontSize: 12, width: 18 }}>{badge}</span>
    </div>
  );
}

// ── Geo traffic donut ──────────────────────────────────────────────
const GEO_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#E5E7EB'];

function GeoSection({ geoTraffic }) {
  if (!geoTraffic?.length) return null;
  const data = geoTraffic.slice(0, 5).map((g, i) => ({ name: g.country_name || g.country, value: g.pct, color: GEO_COLORS[i] }));
  return (
    <Card>
      <SectionTitle icon={Map} color="#3B82F6">Traffic by Country</SectionTitle>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <PieChart width={90} height={90}>
          <Pie data={data} cx={40} cy={40} innerRadius={25} outerRadius={42} dataKey="value" strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
        <div style={{ flex: 1 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#555', flex: 1 }}>{d.name}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ── Keyword table ──────────────────────────────────────────────────
function KeywordRow({ kw }) {
  const posColor = kw.position <= 3 ? '#10B981' : kw.position <= 10 ? '#D97706' : '#888';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 80px', padding: '9px 0', borderBottom: '1px solid #F5F4F1', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: '#333' }}>{kw.keyword}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: posColor, textAlign: 'center' }}>
        #{kw.position}
      </span>
      <span style={{ fontSize: 11, color: '#aaa', textAlign: 'right' }}>{fmt(kw.volume)}/mo</span>
    </div>
  );
}

// ── Competitor card ────────────────────────────────────────────────
function CompetitorCard({ c, myTraffic }) {
  const domain = typeof c === 'string' ? c : c.domain;
  const traffic = c.organic_traffic || 0;
  const auth = c.authority_score;
  const max = Math.max(myTraffic || 1, traffic, 1);
  return (
    <div style={{ padding: '12px 14px', background: '#FAFAF8', borderRadius: 10, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <a href={`https://${domain}`} target="_blank" rel="noreferrer"
          style={{ fontSize: 13, fontWeight: 700, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          {domain} <ExternalLink size={10} />
        </a>
        {auth != null && (
          <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#1a1a1a' }}>{auth}</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 5, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(traffic / max) * 100}%`, background: '#DC2626', borderRadius: 3, transition: 'width 1s ease' }} />
        </div>
        <span style={{ fontSize: 11, color: '#888', minWidth: 56, textAlign: 'right' }}>{fmt(traffic)}/mo</span>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ────────────────────────────────────────────────────
export default function PerformanceTool({ profile }) {
  const score = Math.round(profile.score_overall || profile.overall_score || 0);
  const aiScore = Math.round(profile.score_ai_visibility || profile.ai_visibility_score || 0);
  const clarityScore = Math.round(profile.score_message_clarity || profile.message_clarity_score || 0);
  const commercialScore = Math.round(profile.score_commercial_signal || profile.commercial_presence_score || 0);
  const scoreColor = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const scoreLabel = score >= 70 ? '✨ Great visibility' : score >= 40 ? '⚡ Average visibility' : '🚨 Low visibility';

  const engines = [
    ['chatgpt', profile.chatgpt_score],
    ['gemini', profile.gemini_score ?? profile.google_ai_score],
    ['claude', profile.claude_score],
    ['perplexity', profile.perplexity_score],
    ['mistral', profile.mistral_score],
    ['llama', profile.llama_score],
    ['copilot', profile.copilot_score],
    ['grok', profile.grok_score],
  ].filter(([, v]) => v != null && v > 0);
  const maxEngine = Math.max(...engines.map(([, v]) => v), 1);

  const technicals = [
    { label: 'Schema Markup', value: profile.has_schema_markup, icon: Shield },
    { label: 'Google Business', value: profile.has_google_business, icon: Globe },
    { label: 'SSL / HTTPS', value: profile.has_ssl !== false, icon: Shield },
    { label: 'Mobile-Friendly', value: profile.has_mobile_friendly !== false, icon: Smartphone },
    { label: 'Sitemap', value: profile.has_sitemap !== false, icon: Search },
  ];

  const topKeywords = profile.top_keywords || [];
  const competitors = profile.competitors || [];
  const strengths = profile.strengths || [];
  const issues = profile.issues || [];
  const domain = (profile.site_url || '').replace(/https?:\/\//, '').split('/')[0];

  return (
    <div style={{ fontFamily: F }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F0F10', margin: '0 0 2px', letterSpacing: '-0.02em' }}>
          Performance
        </h2>
        <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>{domain || profile.site_url}</p>
      </div>

      {/* ── Hero score ── */}
      <Card style={{ background: 'linear-gradient(135deg, #F8F6FF 0%, #fff 100%)', borderColor: '#E8E3FF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ScoreRing value={score} size={72} strokeWidth={7} color={scoreColor} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: scoreColor + '18', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>{scoreLabel}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F0F10', marginBottom: 4 }}>{profile.identity_name || domain}</div>
            {profile.shock_insight && (
              <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.5 }}>{profile.shock_insight}</p>
            )}
          </div>
        </div>
        {/* Sub-scores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid #EDECE9' }}>
          {[
            { label: 'AI Visibility', value: aiScore, color: VIOLET },
            { label: 'Message Clarity', value: clarityScore, color: '#3B82F6' },
            { label: 'Commercial Signal', value: commercialScore, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ height: 3, background: '#F1F0EE', borderRadius: 2, margin: '5px 0 4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.value}%`, background: s.color, borderRadius: 2, transition: 'width 1s ease' }} />
              </div>
              <div style={{ fontSize: 9, color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Traffic metrics ── */}
      <Card>
        <SectionTitle icon={TrendingUp} color="#10B981">Traffic & Authority</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <MetricTile label="Monthly Visits" value={fmt(profile.organic_traffic)} delta={profile.organic_traffic_delta_pct} />
          <MetricTile label="Organic Keywords" value={fmt(profile.organic_keywords)} delta={profile.organic_keywords_delta_pct} />
          <MetricTile label="Backlinks" value={fmt(profile.backlinks)} delta={profile.backlinks_delta_pct} />
          <MetricTile label="Authority Score" value={profile.authority_score ? `${profile.authority_score}/100` : '–'} color={profile.authority_score >= 60 ? '#10B981' : profile.authority_score >= 30 ? '#F59E0B' : '#EF4444'} />
        </div>
        {/* Secondary metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}>
          {[
            { label: 'Ref. Domains', value: fmt(profile.referring_domains) },
            { label: 'Site Health', value: profile.site_health ? `${profile.site_health}%` : '–' },
            { label: 'AI Mentions', value: fmt(profile.ai_mentions_count ?? Math.round((profile.ai_visibility_score || 0) * 3.5)) },
          ].map((m, i) => (
            <div key={i} style={{ background: '#F8F7F4', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: '#bbb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{m.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>{m.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Site health bar ── */}
      {(profile.site_health || profile.visibility_pct) && (
        <Card>
          <SectionTitle icon={Activity} color="#F59E0B">Site Health & Visibility</SectionTitle>
          {profile.site_health > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>Site Health</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: profile.site_health >= 70 ? '#10B981' : profile.site_health >= 40 ? '#F59E0B' : '#EF4444' }}>{profile.site_health}%</span>
              </div>
              <div style={{ height: 7, background: '#F1F0EE', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${profile.site_health}%`, background: profile.site_health >= 70 ? '#10B981' : profile.site_health >= 40 ? '#F59E0B' : '#EF4444', borderRadius: 4, transition: 'width 1.2s ease' }} />
              </div>
              {profile.site_health_issues > 0 && (
                <p style={{ fontSize: 11, color: '#888', margin: '5px 0 0' }}>⚠ {profile.site_health_issues} issue{profile.site_health_issues > 1 ? 's' : ''} detected</p>
              )}
            </div>
          )}
          {profile.visibility_pct > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>Search Visibility</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{profile.visibility_pct}%</span>
                  <Delta val={profile.visibility_delta} suffix="pts" />
                </div>
              </div>
              <div style={{ height: 7, background: '#F1F0EE', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${profile.visibility_pct}%`, background: VIOLET, borderRadius: 4, transition: 'width 1.2s ease' }} />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── AI Engines ── */}
      {engines.length > 0 && (
        <Card>
          <SectionTitle icon={BarChart2} color={VIOLET}>AI Engine Scores</SectionTitle>
          <div>
            {engines.map(([name, score]) => (
              <EngineRow key={name} name={name} score={score} max={maxEngine} />
            ))}
          </div>
          {profile.ai_mentions_count > 0 && (
            <div style={{ marginTop: 10, padding: '8px 10px', background: VIOLET + '10', borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: VIOLET, fontWeight: 600 }}>~{fmt(profile.ai_mentions_count)} AI mentions/month estimated</span>
            </div>
          )}
        </Card>
      )}

      {/* ── Technical signals ── */}
      <Card>
        <SectionTitle icon={Shield} color="#0EA5E9">Technical Signals</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {technicals.map((t, i) => {
            const IconC = t.icon;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', borderRadius: 9,
                background: t.value ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${t.value ? '#D1FAE5' : '#FECACA'}`,
              }}>
                {t.value
                  ? <CheckCircle2 size={13} color="#16A34A" style={{ flexShrink: 0 }} />
                  : <XCircle size={13} color="#EF4444" style={{ flexShrink: 0 }} />}
                <span style={{ fontSize: 11, fontWeight: 600, color: t.value ? '#065F46' : '#991B1B' }}>{t.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Geo traffic ── */}
      {profile.geo_traffic?.length > 0 && <GeoSection geoTraffic={profile.geo_traffic} />}

      {/* ── Issues / Action plan ── */}
      {issues.length > 0 && (
        <Card>
          <SectionTitle icon={Zap} color="#F97316">Issues to Fix</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {issues.map((issue, i) => {
              const txt = typeof issue === 'string' ? issue : issue.problem;
              const isErr = (issue.severity || 'warning') === 'error';
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 9,
                  padding: '10px 12px',
                  background: isErr ? '#FFF8F6' : '#FFFBEB',
                  border: `1px solid ${isErr ? '#FECACA' : '#FDE68A'}`,
                  borderRadius: 10,
                }}>
                  <AlertTriangle size={12} color={isErr ? '#EF4444' : '#F59E0B'} style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: '#1a1a1a', margin: 0, lineHeight: 1.5 }}>{txt}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Strengths ── */}
      {strengths.length > 0 && (
        <Card>
          <SectionTitle icon={Star} color="#10B981">Strengths 💪</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {strengths.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: '#F0FDF4', borderRadius: 9 }}>
                <Star size={11} color="#10B981" fill="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: '#065F46', margin: 0, lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Top Keywords ── */}
      {topKeywords.length > 0 && (
        <Card>
          <SectionTitle icon={Search} color="#A855F7">Top Keywords</SectionTitle>
          <div style={{ marginBottom: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 80px', padding: '6px 0 6px', borderBottom: '1px solid #EDECE9' }}>
              {['Keyword', 'Pos.', 'Volume'].map((h, i) => (
                <span key={h} style={{ fontSize: 9, fontWeight: 700, color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: i > 0 ? 'center' : 'left' }}>{h}</span>
              ))}
            </div>
            {topKeywords.map((kw, i) => <KeywordRow key={i} kw={kw} />)}
          </div>
        </Card>
      )}

      {/* ── Competitors ── */}
      {competitors.length > 0 && (
        <Card>
          <SectionTitle icon={Activity} color="#EC4899">Competitors</SectionTitle>
          {competitors.map((c, i) => (
            <CompetitorCard key={i} c={c} myTraffic={profile.organic_traffic} />
          ))}
        </Card>
      )}

    </div>
  );
}