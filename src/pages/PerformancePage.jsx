import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';

import LRSHero from '@/components/performance/LRSHero';
import EngineScoreGrid from '@/components/performance/EngineScoreGrid';
import LRSRadarChart from '@/components/performance/LRSRadarChart';
import GeoScoreChart from '@/components/performance/GeoScoreChart';
import SOVChart from '@/components/performance/SOVChart';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const SURFACE = '#F7F6F4';
const WHITE = '#FFFFFF';
const VIOLET = '#7C3AED';

function StatCard({ label, value, delta, sub, accent }) {
  const up = delta > 0;
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: accent || INK, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: delta != null ? 5 : 0 }}>{value}</div>
      {delta != null && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: up ? '#059669' : '#DC2626' }}>
          {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}{up ? '+' : ''}{delta}%
        </span>
      )}
      {sub && <div style={{ fontSize: 11, color: INK3, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function Section({ title, sub, children }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{title}</p>
        {sub && <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function StrategicLevers({ levers }) {
  if (!levers?.length) return null;
  return (
    <Section title="Actions recommandées" sub="Classées par impact sur votre LRS">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {levers.slice(0, 5).map((lever, i) => {
          const urgent = lever.priority === 'urgent';
          const PRIORITY_COLORS = { urgent: { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', label: '🔴 Urgent' }, short_term: { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', label: '🟡 Court terme' } };
          const pc = PRIORITY_COLORS[lever.priority] || { bg: SURFACE, border: BORDER, color: INK3, label: '🔵 Moyen terme' };
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: `${VIOLET}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: VIOLET }}>{i + 1}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, flex: 1, lineHeight: 1.4 }}>{lever.title}</p>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: pc.bg, color: pc.color, border: `1px solid ${pc.border}`, flexShrink: 0 }}>{pc.label}</span>
              </div>
              {lever.body && <p style={{ fontSize: 12, color: INK2, margin: '0 0 0 34px', lineHeight: 1.65 }}>{lever.body}</p>}
              {lever.impact_pct && (
                <div style={{ margin: '8px 0 0 34px', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <TrendingUp size={10} color="#059669" />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#059669' }}>+{lever.impact_pct}% LRS estimé</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </Section>
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
      let extra = {};
      try { extra = JSON.parse(p.brand_keywords || '{}'); } catch {}
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
      base44.entities.BusinessProfile.update(p.id, { brand_keywords: JSON.stringify(newExtra) }).catch(() => {});
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

  // Merge profile + perfData for rich engine data
  const richData = { ...profile, ...(perfData || {}) };

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>
      {/* Header */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={14} color={INK2} />
          </button>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>Performance & LRS</p>
            {domain && <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{domain}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {phase === 'done' && (
            <button onClick={() => loadPerf(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
              <RefreshCw size={11} /> Actualiser
            </button>
          )}
        </div>
      </div>

      {/* Loading shimmer */}
      {phase === 'loading' && (
        <div style={{ padding: '16px', maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: i === 1 ? 160 : 80, borderRadius: 16, background: 'linear-gradient(90deg,#F0F0EE 25%,#E6E6E4 50%,#F0F0EE 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
          <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
        </div>
      )}

      {/* Thinking */}
      {phase === 'thinking' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: VIOLET, animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Calcul du LRS en cours…</p>
          <p style={{ fontSize: 12, color: INK3, margin: 0, maxWidth: 280 }}>Analyse de votre fréquence de citation, sentiment et précision sur 8 assistants IA</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {phase === 'no_profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: `${VIOLET}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Zap size={24} color={VIOLET} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Aucun site analysé</p>
          <p style={{ fontSize: 12, color: INK3, margin: '0 0 16px' }}>Analysez votre site depuis l'accueil pour obtenir votre LRS.</p>
          <button onClick={() => navigate('/app')} style={{ padding: '10px 20px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Retour</button>
        </div>
      )}

      {phase === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 16px' }}>Analyse impossible</p>
          <button onClick={() => loadPerf(true)} style={{ padding: '10px 20px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Réessayer</button>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ maxWidth: 660, margin: '0 auto', padding: '16px 16px 100px' }}>

          {/* 1. LRS Hero — THE signature metric */}
          <LRSHero d={richData} />

          {/* 2. KPIs rapides */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 14 }}>
            <StatCard label="Part de voix IA" value={`${sov?.your_brand?.voice_share_pct || 0}%`} delta={sov?.your_brand?.voice_share_delta} sub="vs concurrents" />
            <StatCard label="Perception positive" value={`${sov?.your_brand?.favorable_pct || 0}%`} delta={sov?.your_brand?.favorable_delta} sub="des réponses IA" />
            <StatCard label="Mentions IA / mois" value={richData.ai_mentions_count ? `~${richData.ai_mentions_count}` : '–'} sub="estimation" accent={VIOLET} />
            <StatCard label="Tendance LRS" value={richData.lrs_trend === 'rising' ? '↗ En hausse' : richData.lrs_trend === 'declining' ? '↘ En baisse' : '→ Stable'} sub={`${richData.lrs_vs_industry > 0 ? '+' : ''}${richData.lrs_vs_industry || 0}pts vs secteur`} />
          </div>

          {/* 3. Radar chart */}
          <LRSRadarChart d={richData} />

          {/* 4. Engine grid with prompts + simulated responses */}
          <EngineScoreGrid d={richData} />

          {/* 5. Geo distribution */}
          <GeoScoreChart d={richData} />

          {/* 6. Share of voice vs competitors */}
          {sov && <SOVChart sov={sov} />}

          {/* 7. Strategic levers */}
          <StrategicLevers levers={levers} />

        </div>
      )}
    </div>
  );
}