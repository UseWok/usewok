import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, ExternalLink, TrendingUp, TrendingDown, AlertCircle, AlertTriangle,
  CheckCircle2, ArrowRight, Plus, Search, X, Share2, RotateCcw,
} from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#111827';
const T2 = '#374151';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const BG = '#F9FAFB';

function fmt(n) {
  if (n == null) return 'n/a';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function Delta({ val, type = 'pct' }) {
  if (val == null || val === 0) return <span style={{ fontSize: 11, color: T3 }}>—</span>;
  const up = val > 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 600, color: up ? '#16A34A' : '#DC2626' }}>
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {up ? '+' : ''}{typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(1)) : val}{type === 'pct' ? '%' : 'pts'}
    </span>
  );
}

function Metric({ label, value, delta, deltaType = 'pct' }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: T3, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: T1, lineHeight: 1 }}>{value ?? 'n/a'}</div>
      {delta != null && <div style={{ marginTop: 3 }}><Delta val={delta} type={deltaType} /></div>}
    </div>
  );
}

function Chip({ ok, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: ok ? '#F0FDF4' : '#F9FAFB',
      color: ok ? '#15803D' : T3,
      border: `1px solid ${ok ? '#BBF7D0' : BD}`,
    }}>
      {ok ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
      {label}
    </span>
  );
}

function BarFill({ value, color = T1 }) {
  const [w, setW] = useState(0);
  if (!w) setTimeout(() => setW(value), 100);
  return (
    <div style={{ height: 4, background: BG, borderRadius: 2, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 2, transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)' }} />
    </div>
  );
}

// ── Add Domain Modal ─────────────────────────────────────────────────
function AddDomainModal({ open, onClose }) {
  const [domain, setDomain] = useState('');
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '28px 32px', width: '100%', maxWidth: 400, boxShadow: '0 16px 48px rgba(0,0,0,0.16)', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', background: BG, cursor: 'pointer', color: T3 }}><X size={13} /></button>
          <div style={{ fontSize: 16, fontWeight: 700, color: T1, marginBottom: 20 }}>Add a domain</div>
          <label style={{ fontSize: 11, fontWeight: 600, color: T3, display: 'block', marginBottom: 6 }}>Domain, subdomain or subfolder</label>
          <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="example.com"
            style={{ width: '100%', padding: '9px 12px', border: `1px solid ${BD}`, borderRadius: 7, fontSize: 13, color: T1, outline: 'none', boxSizing: 'border-box', marginBottom: 14, fontFamily: F }} />
          <label style={{ fontSize: 11, fontWeight: 600, color: T3, display: 'block', marginBottom: 6 }}>Location</label>
          <select style={{ width: '100%', padding: '9px 12px', border: `1px solid ${BD}`, borderRadius: 7, fontSize: 13, color: T1, background: '#fff', marginBottom: 22, fontFamily: F, outline: 'none' }}>
            <option>🌍 Worldwide</option>
            <option>🇺🇸 United States</option>
            <option>🇫🇷 France</option>
            <option>🇬🇧 United Kingdom</option>
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { onClose(); window.location.href = '/pricing'; }}
              style={{ flex: 1, padding: '9px 0', background: T1, color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              Add domain
            </button>
            <button onClick={onClose}
              style={{ padding: '9px 18px', background: '#fff', color: T2, border: `1px solid ${BD}`, borderRadius: 7, fontSize: 13, cursor: 'pointer', fontFamily: F }}>
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────
export default function SemrushDashboard({ data, url, onRescan }) {
  const [showAddDomain, setShowAddDomain] = useState(false);
  const domain = url.replace(/https?:\/\//, '').split('/')[0];
  const ai = data.ai_visibility_score || data.overall_score || 0;
  const aiColor = ai >= 60 ? '#16A34A' : ai >= 35 ? '#D97706' : '#DC2626';
  const competitors = data.competitors || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: F }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: T1, margin: '0 0 2px', letterSpacing: '-0.03em' }}>Overview</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Globe size={11} color={T3} />
            <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: T3, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              {domain} <ExternalLink size={9} />
            </a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.location.href = '/ai-report'}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 7, fontSize: 12, fontWeight: 500, color: T2, cursor: 'pointer', fontFamily: F }}>
            <Share2 size={12} /> Full report
          </button>
          <button onClick={onRescan}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: `1px solid ${BD}`, borderRadius: 7, fontSize: 12, fontWeight: 500, color: T2, cursor: 'pointer', fontFamily: F }}>
            <RotateCcw size={12} /> New site
          </button>
        </div>
      </div>

      {/* ── Shock insight ── */}
      {data.shock_insight && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <AlertTriangle size={14} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: '#92400E', margin: 0, lineHeight: 1.6 }}>{data.shock_insight}</p>
        </div>
      )}

      {/* ── Main site card ── */}
      <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
        {/* Domain header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderBottom: `1px solid ${BG}` }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={11} color={T3} />
          </div>
          <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: T1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            {domain} <ExternalLink size={10} color={T3} />
          </a>
          {data.country && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, background: BG, color: T3 }}>{data.country.toUpperCase()}</span>}
        </div>

        {/* Metrics grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: 0, padding: '16px 18px', alignItems: 'start' }}>
          <div style={{ paddingRight: 16 }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: T1, color: '#fff', letterSpacing: '0.04em' }}>SEO</span>
          </div>
          <div style={{ borderLeft: `1px solid ${BG}`, paddingLeft: 14 }}>
            <div style={{ fontSize: 10, color: T3, marginBottom: 3 }}>AI Visibility</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: aiColor, lineHeight: 1 }}>{ai}</div>
            <div style={{ fontSize: 9, color: T3 }}>/100</div>
          </div>
          <div style={{ borderLeft: `1px solid ${BG}`, paddingLeft: 14 }}>
            <Metric label="AI Mentions" value={data.ai_mentions_count ?? Math.round(ai * 3.8)} />
          </div>
          <div style={{ borderLeft: `1px solid ${BG}`, paddingLeft: 14 }}>
            <Metric label="Site Health" value={`${data.site_health || 0}%`} />
          </div>
          <div style={{ borderLeft: `1px solid ${BG}`, paddingLeft: 14 }}>
            <Metric label="Visibility" value={`${data.visibility_pct || 0}%`} delta={data.visibility_delta} deltaType="pts" />
          </div>
          <div style={{ borderLeft: `1px solid ${BG}`, paddingLeft: 14 }}>
            <Metric label="Organic traffic" value={fmt(data.organic_traffic)} delta={data.organic_traffic_delta_pct} />
          </div>
          <div style={{ borderLeft: `1px solid ${BG}`, paddingLeft: 14 }}>
            <Metric label="Keywords" value={fmt(data.organic_keywords)} delta={data.organic_keywords_delta_pct} />
          </div>
          <div style={{ borderLeft: `1px solid ${BG}`, paddingLeft: 14 }}>
            <Metric label="Backlinks" value={fmt(data.backlinks)} delta={data.backlinks_delta_pct} />
          </div>
        </div>

        {/* Technical chips */}
        <div style={{ display: 'flex', gap: 5, padding: '0 18px 14px', flexWrap: 'wrap' }}>
          <Chip ok={data.has_schema_markup} label="Schema" />
          <Chip ok={data.has_google_business} label="Google Business" />
          <Chip ok={data.has_ssl !== false} label="SSL" />
          <Chip ok={data.has_mobile_friendly !== false} label="Mobile" />
          <Chip ok={data.has_sitemap !== false} label="Sitemap" />
        </div>
      </div>

      {/* ── Competitor domains table ── */}
      <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: `1px solid ${BD}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Monitored domains</span>
          <div style={{ display: 'flex', gap: 7 }}>
            <select style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: `1px solid ${BD}`, background: '#fff', color: T2, fontFamily: F, outline: 'none' }}>
              <option>Month</option>
              <option>Year</option>
            </select>
            <button onClick={() => setShowAddDomain(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: T1, color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
              <Plus size={11} /> Add domain
            </button>
          </div>
        </div>

        {competitors.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', fontSize: 13, color: T3 }}>
            No competitors detected.{' '}
            <button onClick={() => setShowAddDomain(true)} style={{ color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: F }}>Add one</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr 1fr 90px', padding: '7px 18px', borderBottom: `1px solid ${BG}` }}>
              {['Domain', 'Org. Keywords', 'Org. Traffic', 'Paid KW', 'Paid Traffic', 'Ref. Domains', 'Authority'].map((h, i) => (
                <span key={h} style={{ fontSize: 10, fontWeight: 600, color: T3, textAlign: i > 0 ? 'right' : 'left', paddingRight: i > 0 ? 12 : 0 }}>{h}</span>
              ))}
            </div>
            {competitors.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr 1fr 90px', padding: '11px 18px', borderBottom: i < competitors.length - 1 ? `1px solid ${BG}` : 'none', alignItems: 'center' }}>
                <a href={`https://${c.domain}`} target="_blank" rel="noreferrer"
                  style={{ fontSize: 13, fontWeight: 500, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {c.domain} <ExternalLink size={10} />
                </a>
                {[
                  fmt(c.organic_traffic ? Math.round(c.organic_traffic * 0.45) : 0),
                  fmt(c.organic_traffic),
                  fmt(Math.round((c.organic_traffic || 0) * 0.05)),
                  fmt(Math.round((c.organic_traffic || 0) * 0.08)),
                  fmt(Math.round((c.organic_traffic || 0) * 0.3)),
                ].map((v, j) => (
                  <div key={j} style={{ textAlign: 'right', paddingRight: 12, fontSize: 13, color: T2 }}>{v}</div>
                ))}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', width: 30, height: 30, borderRadius: '50%', border: `2px solid ${T1}`, alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: T1 }}>{c.authority_score || '?'}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Top keywords ── */}
      {data.top_keywords?.length > 0 && (
        <div style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: `1px solid ${BD}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Top keywords</span>
            <button onClick={() => window.location.href = '/ai-report'}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F }}>
              See all <ArrowRight size={10} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', padding: '7px 18px', borderBottom: `1px solid ${BG}` }}>
            {['Keyword', 'Position', 'Volume'].map((h, i) => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, color: T3, textAlign: i > 0 ? 'right' : 'left' }}>{h}</span>
            ))}
          </div>
          {data.top_keywords.map((kw, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 100px', padding: '10px 18px', borderBottom: i < data.top_keywords.length - 1 ? `1px solid ${BG}` : 'none', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: T1 }}>{kw.keyword}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: kw.position <= 3 ? '#16A34A' : kw.position <= 10 ? '#D97706' : T2, textAlign: 'right' }}>#{kw.position}</span>
              <span style={{ fontSize: 12, color: T2, textAlign: 'right' }}>{fmt(kw.volume)}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Upsell CTA ── */}
      <div style={{ background: T1, borderRadius: 10, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.02em' }}>Unlock the full report</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Weekly reports · AI fixes · Competitor tracking · Dedicated AI agent</div>
        </div>
        <button onClick={() => window.location.href = '/pricing'}
          style={{ padding: '9px 20px', background: '#fff', color: T1, border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0 }}>
          View plans →
        </button>
      </div>

      <AddDomainModal open={showAddDomain} onClose={() => setShowAddDomain(false)} />
    </motion.div>
  );
}