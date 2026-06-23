import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, ExternalLink, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle2, ArrowRight, RotateCcw, ChevronDown, Zap, Target,
} from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0F0F10';
const INK2 = '#555';
const INK3 = '#999';
const BORDER = '#E8E7E4';
const SURFACE = '#F7F6F3';
const WHITE = '#FFFFFF';

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ── LRS Hero Card ────────────────────────────────────────────────────────────
function LRSHero({ data, domain }) {
  const lrs = Math.round(data.lrs_score || data.overall_score || 0);
  const trend = data.lrs_trend || 'stable';
  const vsIndustry = data.lrs_vs_industry;
  const citation = Math.round(data.lrs_citation_score || 0);
  const sentiment = Math.round(data.lrs_sentiment_score || 0);
  const accuracy = Math.round(data.lrs_accuracy_score || 0);

  const lrsColor = lrs >= 65 ? '#4ADE80' : lrs >= 35 ? '#FBBF24' : '#F87171';
  const trendIcon = trend === 'rising'
    ? <TrendingUp size={12} color="#4ADE80" />
    : trend === 'declining'
    ? <TrendingDown size={12} color="#F87171" />
    : <span style={{ fontSize: 10, color: INK3 }}>→</span>;

  return (
    <div style={{
      background: INK, borderRadius: 18, padding: '28px 24px 24px',
      marginBottom: 12, fontFamily: F, position: 'relative', overflow: 'hidden',
    }}>
      {/* subtle noise texture */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '150px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.07)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: lrsColor }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>LLM Resonance Score™</span>
        </div>

        {/* Score + meta */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 88, fontWeight: 900, color: WHITE, lineHeight: 0.85, letterSpacing: '-0.06em' }}>{lrs}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 10, fontWeight: 500 }}>/ 100</div>
          </div>
          <div style={{ paddingBottom: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: WHITE, marginBottom: 6 }}>{domain}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: lrsColor }}>
                {trendIcon}
                {trend === 'rising' ? 'En hausse' : trend === 'declining' ? 'En baisse' : 'Stable'}
              </span>
              {vsIndustry != null && (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  {vsIndustry >= 0 ? `+${vsIndustry}` : vsIndustry} pts vs secteur
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3 components */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { label: 'Citation', value: citation, desc: '40%' },
            { label: 'Sentiment', value: sentiment, desc: '30%' },
            { label: 'Exactitude', value: accuracy, desc: '30%' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: WHITE, lineHeight: 1 }}>{s.value}</div>
              <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, margin: '8px 0 5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.value}%`, background: 'rgba(255,255,255,0.5)', borderRadius: 1, transition: 'width 1.2s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>poids {s.desc}</div>
            </div>
          ))}
        </div>

        {/* Shock insight */}
        {data.shock_insight && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '18px 0 0', lineHeight: 1.65, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
            {data.shock_insight}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Injection Plan ────────────────────────────────────────────────────────────
function InjectionPlan({ plan }) {
  const [open, setOpen] = useState(null);
  if (!plan?.length) return null;

  const impactBg = (v) => v === 'high' ? '#ECFDF5' : '#FFF7ED';
  const impactColor = (v) => v === 'high' ? '#065F46' : '#92400E';
  const effortLabel = { low: 'Facile', medium: 'Moyen', high: 'Exigeant' };

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12, fontFamily: F }}>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Ordonnance d'injection d'entité</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>Plan d'action IA — {plan.length} leviers</div>
        <div style={{ fontSize: 12, color: INK3, marginTop: 2 }}>Actions concrètes pour améliorer votre LRS ce mois-ci</div>
      </div>

      <div>
        {plan.map((item, i) => (
          <div key={i} style={{ borderBottom: i < plan.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            {/* Row */}
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontFamily: F,
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: 7, background: INK, color: WHITE,
                fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{i + 1}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{item.action_title}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: impactColor(item.impact), background: impactBg(item.impact),
                    padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                  }}>Impact {item.impact === 'high' ? 'élevé' : 'moyen'}</span>
                </div>
                <div style={{ fontSize: 11, color: INK3 }}>
                  <span style={{ fontWeight: 600, color: '#3B5BDB', marginRight: 5 }}>{item.engine}</span>
                  {item.gap}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: INK3 }}>{effortLabel[item.effort] || item.effort}</span>
                <ChevronDown size={13} color={INK3} style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
            </button>

            {/* Expanded */}
            {open === i && (
              <div style={{ padding: '0 20px 18px', borderTop: `1px solid ${BORDER}`, background: SURFACE }}>
                <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Pourquoi vos concurrents sont cités à votre place</div>
                    <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.competitor_advantage}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Action concrète</div>
                    <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.action_detail}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 14px' }}>
                    <Target size={12} color={INK} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: INK }}>Plateforme : {item.platform}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sub-scores row ────────────────────────────────────────────────────────────
function ScoreRow({ data }) {
  const items = [
    { label: 'Visibilité IA', value: Math.round(data.ai_visibility_score || 0) },
    { label: 'Clarté message', value: Math.round(data.message_clarity_score || 0) },
    { label: 'Signal commercial', value: Math.round(data.commercial_presence_score || 0) },
    { label: 'Score global', value: Math.round(data.overall_score || 0) },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
      {items.map(s => (
        <div key={s.label} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: INK, lineHeight: 1 }}>{s.value}</div>
          <div style={{ height: 2, background: SURFACE, borderRadius: 1, margin: '8px 0 5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${s.value}%`, background: INK, borderRadius: 1, transition: 'width 1s ease' }} />
          </div>
          <div style={{ fontSize: 10, color: INK3, fontWeight: 600 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Tech chips ────────────────────────────────────────────────────────────────
function TechRow({ data }) {
  const items = [
    { ok: data.has_schema_markup, label: 'Structure IA' },
    { ok: data.has_google_business, label: 'Google Business' },
    { ok: data.has_ssl !== false, label: 'HTTPS' },
    { ok: data.has_mobile_friendly !== false, label: 'Mobile' },
    { ok: data.has_sitemap !== false, label: 'Sitemap' },
  ];
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
      {items.map(t => (
        <span key={t.label} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
          background: t.ok ? '#F0FDF4' : SURFACE,
          color: t.ok ? '#15803D' : INK3,
          border: `1px solid ${t.ok ? '#BBF7D0' : BORDER}`,
        }}>
          {t.ok ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
          {t.label}
        </span>
      ))}
    </div>
  );
}

// ── Competitors ────────────────────────────────────────────────────────────────
function Competitors({ competitors }) {
  if (!competitors?.length) return null;
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 12, fontFamily: F }}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>Concurrents détectés</div>
      </div>
      {competitors.map((c, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderBottom: i < competitors.length - 1 ? `1px solid ${BORDER}` : 'none',
        }}>
          <a href={`https://${c.domain}`} target="_blank" rel="noreferrer"
            style={{ fontSize: 13, fontWeight: 500, color: '#2563EB', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            {c.domain} <ExternalLink size={10} />
          </a>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: INK3 }}>Trafic</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{fmt(c.organic_traffic)}</div>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', border: `2px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: INK }}>{c.authority_score || '?'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function SemrushDashboard({ data, url, onRescan }) {
  const domain = url.replace(/https?:\/\//, '').split('/')[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontFamily: F }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Globe size={11} color={INK3} />
          <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: INK3, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
            {domain} <ExternalLink size={9} />
          </a>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => window.location.href = '/ai-report'}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', background: INK, color: WHITE, border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
            Rapport complet <ArrowRight size={11} />
          </button>
          <button onClick={onRescan}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', background: WHITE, color: INK2, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: F }}>
            <RotateCcw size={11} /> Nouveau site
          </button>
        </div>
      </div>

      {/* 1. LRS Hero */}
      <LRSHero data={data} domain={domain} />

      {/* 2. Sub-scores */}
      <ScoreRow data={data} />

      {/* 3. Technical chips */}
      <TechRow data={data} />

      {/* 4. Injection plan */}
      {data.injection_plan?.length > 0 && <InjectionPlan plan={data.injection_plan} />}

      {/* 5. Competitors */}
      <Competitors competitors={data.competitors} />

      {/* 6. CTA */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 3 }}>Rapport complet + suivi mensuel</div>
          <div style={{ fontSize: 11, color: INK3 }}>Corrections guidées · Tracking LRS · Agent IA dédié</div>
        </div>
        <button onClick={() => window.location.href = '/pricing'}
          style={{ padding: '9px 18px', background: INK, color: WHITE, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0 }}>
          Voir les plans →
        </button>
      </div>

    </motion.div>
  );
}