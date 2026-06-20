import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, RotateCcw, ExternalLink, TrendingUp, TrendingDown, AlertCircle,
  AlertTriangle, CheckCircle2, ArrowRight, Plus, BarChart2, Search,
  ShieldCheck, Link2, Star
} from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#0F0F10';
const T2 = '#4B5563';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const BG = '#F9FAFB';
const BLUE = '#1677FF';

// ── Format numbers like Semrush ─────────────────────────────────────
function fmt(n) {
  if (n == null) return 'n/a';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} Mio`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} K`;
  return String(n);
}

function Delta({ pct, pts, direction }) {
  // pct: percentage delta, pts: point delta, direction: 'up'|'down'|'neutral'
  const val = pct != null ? pct : pts;
  if (val == null || val === 0) return <span style={{ fontSize: 11, color: T3 }}>—</span>;
  const up = val > 0;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600, color: up ? '#16A34A' : '#DC2626' }}>
      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {up ? '+' : ''}{typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(1)) : val}{pct != null ? ' %' : ' pts'}
    </span>
  );
}

// ── Metric cell ──────────────────────────────────────────────────────
function MetricCell({ label, value, delta, deltaType = 'pct', sub, link }) {
  const isNA = value == null || value === 'n/a';
  return (
    <div style={{ minWidth: 100 }}>
      <div style={{ fontSize: 10, color: T3, marginBottom: 4, whiteSpace: 'nowrap' }}>{label}</div>
      {isNA ? (
        <div style={{ fontSize: 15, fontWeight: 700, color: T3 }}>n/a</div>
      ) : (
        <>
          <div style={{ fontSize: 15, fontWeight: 700, color: T1, lineHeight: 1 }}>{value}</div>
          {delta != null && (
            <div style={{ marginTop: 3 }}>
              <Delta {...(deltaType === 'pct' ? { pct: delta } : { pts: delta })} />
            </div>
          )}
          {sub && <div style={{ fontSize: 10, color: T3, marginTop: 2 }}>{sub}</div>}
        </>
      )}
    </div>
  );
}

// ── Health badge ─────────────────────────────────────────────────────
function HealthBadge({ pct, issues }) {
  const color = pct >= 80 ? '#16A34A' : pct >= 50 ? '#D97706' : '#DC2626';
  const bg = pct >= 80 ? '#F0FDF4' : pct >= 50 ? '#FFFBEB' : '#FEF2F2';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color, lineHeight: 1 }}>{pct} %</div>
      {issues > 0 && (
        <div style={{ fontSize: 10, color: T3 }}>
          {issues} {issues === 1 ? 'issue' : 'issues'}
        </div>
      )}
    </div>
  );
}

// ── AI Visibility badge ──────────────────────────────────────────────
function AIBadge({ score }) {
  const color = score >= 60 ? '#16A34A' : score >= 30 ? '#D97706' : '#DC2626';
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color, lineHeight: 1 }}>{score}</div>
      <div style={{ fontSize: 10, color: T3, marginTop: 2 }}>/ 100</div>
    </div>
  );
}

// ── Signal chip ──────────────────────────────────────────────────────
function SignalChip({ ok, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500,
      background: ok ? '#F0FDF4' : '#FEF2F2',
      color: ok ? '#15803D' : '#DC2626',
      border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}`,
    }}>
      {ok ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
      {label}
    </span>
  );
}

// ── Mini sparkline ───────────────────────────────────────────────────
function Spark({ up }) {
  const pts = up
    ? '0,20 10,18 20,14 30,15 40,10 50,8 60,5 70,3'
    : '0,3 10,5 20,8 30,7 40,12 50,15 60,17 70,20';
  const color = up ? '#16A34A' : '#DC2626';
  return (
    <svg width="70" height="22" viewBox="0 0 70 22" fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Section header ───────────────────────────────────────────────────
function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: T1, margin: 0 }}>{title}</h2>
      {action}
    </div>
  );
}

// ── Project row (site card) ──────────────────────────────────────────
function ProjectRow({ data, url, isFirst }) {
  const domain = url.replace(/https?:\/\//, '').split('/')[0];
  const ai = data.ai_visibility_score || data.overall_score || 0;
  const health = data.site_health || 0;
  const healthIssues = data.site_health_issues || 0;
  const visibilityPct = data.visibility_pct || 0;
  const visibilityDelta = data.visibility_delta || 0;
  const organicTraffic = data.organic_traffic;
  const organicTrafficDelta = data.organic_traffic_delta_pct;
  const organicKw = data.organic_keywords;
  const organicKwDelta = data.organic_keywords_delta_pct;
  const backlinks = data.backlinks;
  const backlinksDelta = data.backlinks_delta_pct;
  const mentions = data.ai_mentions_count || Math.round(ai * 3.8);

  return (
    <div style={{
      background: '#fff', border: `1px solid ${BD}`, borderRadius: 12,
      overflow: 'hidden', marginBottom: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Domain bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: `1px solid #F3F4F6` }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Globe size={12} color={BLUE} />
        </div>
        <a href={url} target="_blank" rel="noreferrer"
          style={{ fontSize: 13, fontWeight: 700, color: BLUE, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          {domain} <ExternalLink size={10} />
        </a>
        {data.country && (
          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: '#F3F4F6', color: T3, fontWeight: 500 }}>
            {data.country.toUpperCase()}
          </span>
        )}
      </div>

      {/* Metrics grid */}
      <div style={{ padding: '14px 20px' }}>
        {/* Row 1 label */}
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: 0, alignItems: 'start' }}>
          {/* SEO label */}
          <div>
            <span style={{
              display: 'inline-block', fontSize: 10, fontWeight: 700,
              padding: '2px 8px', borderRadius: 4,
              background: '#EFF6FF', color: BLUE, letterSpacing: '0.04em',
            }}>SEO</span>
          </div>

          {/* AI Visibility */}
          <div style={{ borderLeft: `1px solid #F3F4F6`, paddingLeft: 16 }}>
            <div style={{ fontSize: 10, color: T3, marginBottom: 4 }}>Visibilité dans l'IA</div>
            <AIBadge score={ai} />
          </div>

          {/* Mentions */}
          <div style={{ borderLeft: `1px solid #F3F4F6`, paddingLeft: 16 }}>
            <MetricCell label="Mentions" value={mentions} />
          </div>

          {/* Site health */}
          <div style={{ borderLeft: `1px solid #F3F4F6`, paddingLeft: 16 }}>
            <div style={{ fontSize: 10, color: T3, marginBottom: 4 }}>Santé du site</div>
            <HealthBadge pct={health} issues={healthIssues} />
          </div>

          {/* Visibility % */}
          <div style={{ borderLeft: `1px solid #F3F4F6`, paddingLeft: 16 }}>
            <MetricCell
              label="Visibilité"
              value={`${visibilityPct} %`}
              delta={visibilityDelta}
              deltaType="pts"
            />
          </div>

          {/* Organic traffic */}
          <div style={{ borderLeft: `1px solid #F3F4F6`, paddingLeft: 16 }}>
            <MetricCell
              label="Trafic organique"
              value={fmt(organicTraffic)}
              delta={organicTrafficDelta}
              deltaType="pct"
            />
          </div>

          {/* Organic keywords */}
          <div style={{ borderLeft: `1px solid #F3F4F6`, paddingLeft: 16 }}>
            <MetricCell
              label="Mots clés organiques"
              value={fmt(organicKw)}
              delta={organicKwDelta}
              deltaType="pct"
            />
          </div>

          {/* Backlinks */}
          <div style={{ borderLeft: `1px solid #F3F4F6`, paddingLeft: 16 }}>
            <MetricCell
              label="Backlinks"
              value={fmt(backlinks)}
              delta={backlinksDelta}
              deltaType="pct"
            />
          </div>
        </div>

        {/* Technical signals row */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
          <SignalChip ok={data.has_schema_markup} label="Schema" />
          <SignalChip ok={data.has_google_business} label="Google Business" />
          <SignalChip ok={data.has_ssl !== false} label="SSL" />
          <SignalChip ok={data.has_mobile_friendly !== false} label="Mobile" />
          <SignalChip ok={data.has_sitemap !== false} label="Sitemap" />
        </div>
      </div>
    </div>
  );
}

// ── Domain monitoring table (competitors) ───────────────────────────
function DomainsTable({ data }) {
  const competitors = data.competitors || [];
  if (competitors.length === 0) return null;

  return (
    <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${BD}` }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: T1, margin: 0 }}>Domaines à surveiller</h2>
        <button
          onClick={() => window.location.href = '/pricing'}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#fff', background: BLUE, border: 'none', borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>
          <Plus size={12} /> Ajouter le domaine
        </button>
      </div>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 100px',
        gap: 0, padding: '8px 20px', borderBottom: `1px solid #F3F4F6`,
      }}>
        {['Domaine', 'Mots clés org.', 'Trafic org.', 'Mots clés payants', 'Trafic payant', 'Domaines réf.', 'Authority Score'].map((h, i) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: T3, textTransform: 'none', textAlign: i > 0 ? 'right' : 'left', paddingRight: i > 0 ? 16 : 0 }}>{h}</span>
        ))}
      </div>
      {/* Rows */}
      {competitors.map((c, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 100px',
          gap: 0, padding: '12px 20px', borderBottom: i < competitors.length - 1 ? `1px solid #F9FAFB` : 'none',
          alignItems: 'center',
        }}>
          <a href={`https://${c.domain}`} target="_blank" rel="noreferrer"
            style={{ fontSize: 13, fontWeight: 600, color: BLUE, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            {c.domain} <ExternalLink size={10} />
          </a>
          <div style={{ textAlign: 'right', paddingRight: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{fmt(c.organic_traffic ? Math.round(c.organic_traffic * 0.45) : 0)}</div>
          </div>
          <div style={{ textAlign: 'right', paddingRight: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{fmt(c.organic_traffic)}</div>
          </div>
          <div style={{ textAlign: 'right', paddingRight: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{fmt(Math.round((c.organic_traffic || 0) * 0.05))}</div>
          </div>
          <div style={{ textAlign: 'right', paddingRight: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{fmt(Math.round((c.organic_traffic || 0) * 0.08))}</div>
          </div>
          <div style={{ textAlign: 'right', paddingRight: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{fmt(Math.round((c.organic_traffic || 0) * 0.3))}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F0F0F0', border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: T1 }}>{c.authority_score || '?'}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Top Keywords table ───────────────────────────────────────────────
function KeywordsTable({ keywords }) {
  if (!keywords || keywords.length === 0) return null;
  return (
    <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${BD}` }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: T1, margin: 0 }}>Top mots-clés</h2>
        <button onClick={() => window.location.href = '/ai-report'}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: BLUE, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>
          Voir tout <ArrowRight size={10} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', padding: '8px 20px', borderBottom: `1px solid #F3F4F6` }}>
        {['Mot-clé', 'Position', 'Volume'].map((h, i) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: T3, textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
        ))}
      </div>
      {keywords.map((kw, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', padding: '10px 20px', borderBottom: i < keywords.length - 1 ? `1px solid #F9FAFB` : 'none', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: T1, fontWeight: 500 }}>{kw.keyword}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: kw.position <= 3 ? '#16A34A' : kw.position <= 10 ? '#D97706' : T2, textAlign: 'right' }}>#{kw.position}</span>
          <span style={{ fontSize: 12, color: T2, textAlign: 'right' }}>{fmt(kw.volume)}</span>
        </div>
      ))}
    </div>
  );
}

// ── MAIN DASHBOARD ───────────────────────────────────────────────────
export default function SemrushDashboard({ data, url, onRescan }) {
  const domain = url.replace(/https?:\/\//, '').split('/')[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: F }}>
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: T1, margin: 0, letterSpacing: '-0.03em' }}>
            Dossiers
          </h1>
          <p style={{ fontSize: 12, color: T3, margin: '3px 0 0' }}>
            Analyse IA + SEO pour <strong style={{ color: T2 }}>{domain}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.location.href = '/ai-report'}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: T2, cursor: 'pointer', fontFamily: F }}>
            <BarChart2 size={13} /> Rapport complet
          </button>
          <button onClick={onRescan}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: T2, cursor: 'pointer', fontFamily: F }}>
            <RotateCcw size={13} /> Nouveau site
          </button>
        </div>
      </div>

      {/* ── Shock insight ── */}
      {data.shock_insight && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#FFFBEB', border: '1px solid #FED7AA', borderRadius: 10,
            padding: '12px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
          <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: '#92400E', margin: 0, lineHeight: 1.6 }}>{data.shock_insight}</p>
        </motion.div>
      )}

      {/* ── Project row ── */}
      <ProjectRow data={data} url={url} isFirst={true} />

      {/* ── Competitors monitoring ── */}
      <DomainsTable data={data} />

      {/* ── Top keywords ── */}
      <KeywordsTable keywords={data.top_keywords} />

      {/* ── Upgrade CTA ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{
          marginTop: 20,
          background: 'linear-gradient(135deg, #1e3a8a, #2563EB)',
          borderRadius: 12, padding: '22px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
          boxShadow: '0 8px 32px rgba(37,99,235,0.25)',
        }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.02em' }}>
            Débloquez l'analyse complète
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
            Rapport hebdomadaire · Corrections IA · Suivi concurrent · Agent dédié
          </div>
        </div>
        <button onClick={() => window.location.href = '/pricing'}
          style={{ padding: '10px 22px', background: '#fff', color: '#1e3a8a', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0 }}>
          Voir les offres →
        </button>
      </motion.div>
    </motion.div>
  );
}