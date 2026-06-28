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
import { FeatureGate } from '@/lib/usePlanFeatures.jsx';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import { DEMO_PROFILE, DEMO_SITE_URL } from '@/lib/demo-data';

const DEMO_PERF_DATA = {
  share_of_voice: {
    your_brand: { voice_share_pct: 18, voice_share_delta: 4, favorable_pct: 72, favorable_delta: 6 },
    competitors: [
      { name: 'Semrush AI', voice_share_pct: 34 },
      { name: 'BrightEdge', voice_share_pct: 27 },
      { name: 'Conductor', voice_share_pct: 21 },
      { name: 'UseWok', voice_share_pct: 18 },
    ],
  },
  strategy: {
    strategic_levers: [
      { title: 'Créer une page FAQ structurée', body: 'Perplexity et ChatGPT favorisent les contenus en Q&R bien balisés.', priority: 'urgent' },
      { title: 'Compléter Schema.org SoftwareApplication', body: 'Augmente la précision de catégorisation chez Claude et Gemini.', priority: 'urgent' },
      { title: 'Publier 2 études de cas clients avec chiffres clés', body: 'Les LLM citent davantage les contenus factuels vérifiables.', priority: 'short_term' },
      { title: 'Obtenir des mentions sur G2 et Capterra', body: 'Perplexity utilise ces plateformes comme sources de confiance.', priority: 'short_term' },
      { title: 'Lancer une newsletter mensuelle avec insights IA', body: 'Renforce la fréquence de citation sur Mistral et Claude.', priority: 'medium_term' },
    ],
  },
  lrs_trend: 'rising',
  lrs_vs_industry: 8,
  ai_mentions_count: 420,
  geo_scores: [
    { country: 'France', score: 74 },
    { country: 'Belgique', score: 61 },
    { country: 'Suisse', score: 58 },
    { country: 'Canada', score: 44 },
  ],
};

const F = 'Inter, system-ui, sans-serif';
const INK = '#1C1C1E';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EBEBEB';
const SURFACE = '#F8F8F8';
const WHITE = '#FFFFFF';
const CORAL = '#E8622A';

// ── KPI card (3 colonnes) ─────────────────────────────────────────────────────
function KPICard({ label, value, delta, sub }) {
  const up = delta > 0;
  return (
    <div style={{
      background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12,
      padding: '14px 14px', flex: 1,
    }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: INK, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      {delta != null && (
        <div style={{ fontSize: 11, fontWeight: 700, color: up ? '#34C759' : CORAL, marginTop: 3 }}>
          {up ? '↑' : '↓'} {up ? '+' : ''}{delta}% vs mois-1
        </div>
      )}
      <div style={{ fontSize: 11, color: INK3, marginTop: 4, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// ── Action card ───────────────────────────────────────────────────────────────
function LeverCard({ lever, index }) {
  const urgent = lever.priority === 'urgent';
  const isMedium = lever.priority === 'medium_term';
  const label = urgent ? 'Urgent' : lever.priority === 'short_term' ? 'Cette semaine' : 'Moyen terme';
  const labelBg = urgent ? CORAL : isMedium ? '#9B9BA8' : '#FF9500';
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: WHITE,
            background: labelBg, borderRadius: 5, padding: '2px 8px', flexShrink: 0,
          }}>{label}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: INK, lineHeight: 1.4 }}>{lever.title}</span>
        </div>
        {lever.body && <p style={{ fontSize: 11.5, color: INK3, margin: 0, lineHeight: 1.55 }}>{lever.body}</p>}
      </div>
      <div style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: CORAL, whiteSpace: 'nowrap' }}>
        Lancer →
      </div>
    </motion.div>
  );
}

export default function PerformancePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [perfData, setPerfData] = useState(null);
  const [phase, setPhase] = useState('loading');

  const loadPerf = async (forceRefresh = false) => {
    // Demo mode
    const activeDomain = getActiveDomain();
    if (activeDomain?.url === DEMO_SITE_URL) {
      setProfile({ ...DEMO_PROFILE });
      setPerfData(DEMO_PERF_DATA);
      setPhase('done');
      return;
    }

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
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '12px 18px', paddingTop: 'max(12px, env(safe-area-inset-top))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
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
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Calcul en cours…</p>
          <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Analyse de votre LRS sur 8 assistants IA</p>
        </motion.div>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          style={{ maxWidth: 660, margin: '0 auto', padding: '16px 16px 100px' }}>

          {/* Hero score + badges */}
          <LRSHero d={richData} />

          {/* Line chart évolution */}
          <LRSLineChart score={richData.lrs_score || richData.score_overall || 0} domain={domain} />

          {/* KPIs 3 colonnes */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <KPICard
              label="Part de voix IA"
              value={`${sov?.your_brand?.voice_share_pct || 0}%`}
              delta={sov?.your_brand?.voice_share_delta}
            />
            <KPICard
              label="Perception positive"
              value={`${sov?.your_brand?.favorable_pct || 0}%`}
              delta={sov?.your_brand?.favorable_delta}
            />
            <KPICard
              label="Mentions IA / mois"
              value={richData.ai_mentions_count ? `~${richData.ai_mentions_count}` : '–'}
              delta={richData.ai_mentions_delta}
            />
          </div>

          {/* Radar */}
          <LRSRadarChart d={richData} />

          {/* Scores par assistant */}
          <EngineScoreGrid d={richData} />

          {/* SOV concurrents */}
          {sov && <SOVChart sov={sov} />}

          {/* Actions recommandées */}
          {levers.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.10em', margin: '0 0 10px' }}>Actions recommandées</p>
              {levers.slice(0, 5).map((lever, i) => <LeverCard key={i} lever={lever} index={i} />)}
            </div>
          )}

        </motion.div>
      )}
    </div>
  );
}