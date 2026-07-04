import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, RefreshCw, Zap } from 'lucide-react';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { motion } from 'framer-motion';

import LRSHero from '@/components/performance/LRSHero';
import LRSLineChart from '@/components/performance/LRSLineChart';
import EngineScoreGrid from '@/components/performance/EngineScoreGrid';
import LRSRadarChart from '@/components/performance/LRSRadarChart';
import GeoScoreChart from '@/components/performance/GeoScoreChart';
import SOVChart from '@/components/performance/SOVChart';
import CitationTracker from '@/components/performance/CitationTracker';
import { FeatureGate } from '@/lib/usePlanFeatures.jsx';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';


const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#D8D4CC';
const SURFACE = '#F5F0E8';
const WHITE = '#FFFFFF';
const CORAL = '#E8622A';
const GREEN = '#3CC660';

// ── KPI card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, delta }) {
  const up = delta == null ? null : delta > 0;
  return (
    <div style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: '16px 16px 14px', flex: 1 }}>
      <p style={{ fontSize: 12, color: INK3, fontWeight: 400, margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 900, color: INK, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
      {delta != null && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width={10} height={10} viewBox="0 0 10 10">
            <path d={up ? 'M2 8 L5 2 L8 8' : 'M2 2 L5 8 L8 2'} stroke={up ? GREEN : CORAL} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: up ? GREEN : CORAL }}>
            {up ? '+' : ''}{delta}% vs last month
          </span>
        </div>
      )}
    </div>
  );
}

// ── Action card ───────────────────────────────────────────────────────────────
function LeverCard({ lever, index }) {
  const p = lever.priority;
  const isUrgent = p === 'urgent';
  const isShort = p === 'short_term';
  const isMedium = p === 'medium_term';
  const tagLabel = isUrgent ? 'Urgent' : isShort ? 'This week' : 'Medium term';
  // Colors: Urgent=orange solid, Cette semaine=light orange outline, Moyen terme=beige/grey
  const tagColor = isUrgent ? WHITE : isShort ? CORAL : '#6B6B6B';
  const tagBg = isUrgent ? CORAL : isShort ? 'rgba(232,98,42,0.10)' : '#EDE8DE';
  const tagBorder = isUrgent ? CORAL : isShort ? 'rgba(232,98,42,0.25)' : '#DDD8CE';
  const tagRadius = 999;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{
        background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 14,
        padding: '15px 18px', marginBottom: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
      }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Tag + Title on same line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: tagColor,
            background: tagBg, border: `1px solid ${tagBorder}`,
            borderRadius: 999, padding: '3px 10px', flexShrink: 0,
          }}>{tagLabel}</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{lever.title}</span>
        </div>
        {lever.body && (
          <p style={{ fontSize: 12, color: INK3, margin: 0, lineHeight: 1.55 }}>{lever.body}</p>
        )}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: CORAL, flexShrink: 0, whiteSpace: 'nowrap' }}>
        Launch →
      </span>
    </motion.div>
  );
}

export default function PerformancePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [perfData, setPerfData] = useState(null);
  const [phase, setPhase] = useState('loading');

  const loadPerf = async (forceRefresh = false) => {
    setPhase('loading');
    try {
      const u = await base44.auth.me();
      if (!u) { navigate('/'); return; }
      const active = getActiveDomain();
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const p = active ? (profiles.find(pr => pr.site_url === active.url) || profiles[0]) : profiles[0];
      if (!p?.site_url) { setPhase('no_profile'); return; }
      const extra = await getProfileData(p);
      setProfile({ ...p, ...extra });

      if (!forceRefresh && extra.perf_data && extra.perf_analyzed_at) {
        const age = Date.now() - new Date(extra.perf_analyzed_at).getTime();
        if (age < 24 * 60 * 60 * 1000) { setPerfData(extra.perf_data); setPhase('done'); return; }
      }

      setPhase('thinking');
      const res = await base44.functions.invoke('analyzePerformance', { url: p.site_url, business_name: p.identity_name || '' });
      if (!res?.data || res.data.error) { setPhase('error'); return; }
      setPerfData(res.data);
      setPhase('done');
      const newExtra = { ...extra, perf_data: res.data, perf_analyzed_at: new Date().toISOString() };
      const brand_keywords = await uploadProfileData(newExtra);
      base44.entities.BusinessProfile.update(p.id, { brand_keywords }).catch(() => {});
    } catch { setPhase('error'); }
  };

  useEffect(() => {
    loadPerf();
    const unsub = onActiveDomainChange(() => loadPerf());
    return unsub;
  }, []);

  const sov = perfData?.share_of_voice;
  const levers = perfData?.strategy?.strategic_levers || [];
  const domain = (profile?.site_url || '').replace(/https?:\/\//, '').split('/')[0];
  const richData = { ...profile, ...(perfData || {}) };

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F, overscrollBehavior: 'none' }}>
      {/* Header */}
      <div style={{ background: SURFACE, padding: '12px 18px', paddingTop: 'max(12px, env(safe-area-inset-top))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={14} color={INK2} />
          </button>
        </div>
        {phase === 'done' && (
          <button onClick={() => loadPerf(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
            <RefreshCw size={11} /> Refresh
          </button>
        )}
      </div>

      {phase === 'loading' && (
        <div style={{ padding: '16px', maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[160, 80, 80, 120].map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ height: h, borderRadius: 16, background: 'linear-gradient(90deg,#F0F0EE 25%,#E6E6E4 50%,#F0F0EE 75%)', backgroundSize: '600px 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
        </div>
      )}

      {phase === 'thinking' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            style={{ width: 38, height: 38, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: INK, marginBottom: 18 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Calculating…</p>
          <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Analyzing your LRS across 8 AI assistants</p>
        </motion.div>
      )}

      {phase === 'no_profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Zap size={22} color={INK3} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>No site analyzed</p>
          <p style={{ fontSize: 12, color: INK3, margin: '0 0 16px' }}>Analyze your site from the home page.</p>
          <button onClick={() => navigate('/app')} style={{ padding: '10px 20px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Back</button>
        </div>
      )}

      {phase === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 16px' }}>Analysis failed</p>
          <button onClick={() => loadPerf(true)} style={{ padding: '10px 20px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Retry</button>
        </div>
      )}

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          style={{ maxWidth: 660, margin: '0 auto', padding: '16px 16px 100px' }}>

          {/* Hero score + badges */}
          <LRSHero d={richData} />

          {/* Line chart évolution */}
          <LRSLineChart score={richData.lrs_score || richData.score_overall || 0} domain={domain} />

          {/* KPIs 3 colonnes */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'AI share of voice', value: `${sov?.your_brand?.voice_share_pct || 0}%`, delta: sov?.your_brand?.voice_share_delta },
              { label: 'Positive perception', value: `${sov?.your_brand?.favorable_pct || 0}%`, delta: sov?.your_brand?.favorable_delta },
              { label: 'AI mentions / month', value: richData.ai_mentions_count ? `~${richData.ai_mentions_count}` : '–', delta: richData.ai_mentions_delta },
            ].map((kpi, i) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }} style={{ flex: 1 }}>
                <KPICard label={kpi.label} value={kpi.value} delta={kpi.delta} />
              </motion.div>
            ))}
          </div>

          {/* Radar */}
          <LRSRadarChart d={richData} />

          {/* LRS+ — Live citation tracker + contextual sentiment */}
          <CitationTracker profile={profile} />

          {/* Scores par assistant */}
          <EngineScoreGrid d={richData} />

          {/* SOV concurrents */}
          {sov && <SOVChart sov={sov} />}

          {/* Actions recommandées */}
          {levers.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>Recommended actions</p>
              {levers.slice(0, 5).map((lever, i) => <LeverCard key={i} lever={lever} index={i} />)}
            </div>
          )}

        </motion.div>
      )}
    </div>
  );
}