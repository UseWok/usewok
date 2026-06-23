import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, RefreshCw, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { motion } from 'framer-motion';

import LRSHero from '@/components/performance/LRSHero';
import EngineScoreGrid from '@/components/performance/EngineScoreGrid';
import LRSRadarChart from '@/components/performance/LRSRadarChart';
import GeoScoreChart from '@/components/performance/GeoScoreChart';
import SOVChart from '@/components/performance/SOVChart';
import { FeatureGate } from '@/lib/usePlanFeatures.jsx';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const SURFACE = '#F7F6F4';
const WHITE = '#FFFFFF';

// ── Big stat row — ligne haute, lisible d'un coup d'oeil ─────────────────────
function StatRow({ label, value, delta, sub }) {
  const up = delta > 0;
  return (
    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 12, color: INK3, fontWeight: 600, marginBottom: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: INK3 }}>{sub}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
        {delta != null && (
          <span style={{ fontSize: 11, fontWeight: 700, color: up ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', marginTop: 2 }}>
            {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{up ? '+' : ''}{delta}%
          </span>
        )}
      </div>
    </div>
  );
}

// ── Action card simple ───────────────────────────────────────────────────────
function LeverCard({ lever, index }) {
  const urgent = lever.priority === 'urgent';
  const label = urgent ? 'Urgent' : lever.priority === 'short_term' ? 'Court terme' : 'Moyen terme';
  const labelColor = urgent ? '#DC2626' : lever.priority === 'short_term' ? '#D97706' : INK3;
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, lineHeight: 1.45, flex: 1 }}>{lever.title}</p>
        <span style={{ fontSize: 10, fontWeight: 700, color: labelColor, background: SURFACE, borderRadius: 20, padding: '2px 8px', flexShrink: 0, border: `1px solid ${BORDER}` }}>{label}</span>
      </div>
      {lever.body && <p style={{ fontSize: 12, color: INK2, margin: '8px 0 0', lineHeight: 1.65 }}>{lever.body}</p>}
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
        {phase === 'done' && (
          <button onClick={() => loadPerf(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
            <RefreshCw size={11} /> Actualiser
          </button>
        )}
      </div>

      {phase === 'loading' && (
        <div style={{ padding: '16px', maxWidth: 660, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[160, 80, 80, 120].map((h, i) => (
            <div key={i} style={{ height: h, borderRadius: 16, background: 'linear-gradient(90deg,#F0F0EE 25%,#E6E6E4 50%,#F0F0EE 75%)', backgroundSize: '400px 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
          <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
        </div>
      )}

      {phase === 'thinking' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: INK, animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Calcul en cours…</p>
          <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Analyse de votre LRS sur 8 assistants IA</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {phase === 'no_profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Zap size={22} color={INK3} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Aucun site analysé</p>
          <p style={{ fontSize: 12, color: INK3, margin: '0 0 16px' }}>Analysez votre site depuis l'accueil.</p>
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

          {/* LRS Hero */}
          <LRSHero d={richData} />

          {/* KPIs en lignes épaisses */}
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
            <StatRow label="Part de voix IA" value={`${sov?.your_brand?.voice_share_pct || 0}%`} delta={sov?.your_brand?.voice_share_delta} sub="vs concurrents directs" />
            <StatRow label="Perception positive" value={`${sov?.your_brand?.favorable_pct || 0}%`} delta={sov?.your_brand?.favorable_delta} sub="des réponses IA" />
            <StatRow label="Mentions IA / mois" value={richData.ai_mentions_count ? `~${richData.ai_mentions_count}` : '–'} sub="estimation multi-modèles" />
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: INK3, fontWeight: 600, marginBottom: 2 }}>Tendance LRS</div>
                <div style={{ fontSize: 11, color: INK3 }}>{richData.lrs_vs_industry > 0 ? `+${richData.lrs_vs_industry}` : richData.lrs_vs_industry || '0'}pts vs secteur</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: '-0.02em' }}>
                {richData.lrs_trend === 'rising' ? '↗' : richData.lrs_trend === 'declining' ? '↘' : '→'}{' '}
                <span style={{ fontSize: 14, fontWeight: 600, color: INK2 }}>
                  {richData.lrs_trend === 'rising' ? 'En hausse' : richData.lrs_trend === 'declining' ? 'En baisse' : 'Stable'}
                </span>
              </div>
            </div>
          </div>

          {/* Radar */}
          <FeatureGate feature="performance_advanced">
            <LRSRadarChart d={richData} />
          </FeatureGate>

          {/* Engine table */}
          <FeatureGate feature="performance_advanced">
            <EngineScoreGrid d={richData} />
          </FeatureGate>

          {/* Geo */}
          <GeoScoreChart d={richData} />

          {/* SOV vs concurrents */}
          {sov && <SOVChart sov={sov} />}

          {/* Actions */}
          {levers.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Actions recommandées</p>
              {levers.slice(0, 5).map((lever, i) => <LeverCard key={i} lever={lever} index={i} />)}
            </div>
          )}

        </div>
      )}
    </div>
  );
}