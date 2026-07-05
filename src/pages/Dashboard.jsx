import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import { SlidersHorizontal, RefreshCw, Zap } from 'lucide-react';

import EvolutionCard from '@/components/dashboard/EvolutionCard';
import TasksCard from '@/components/dashboard/TasksCard';
import CompetitorsCard from '@/components/dashboard/CompetitorsCard';
import LLMCitingCard from '@/components/dashboard/LLMCitingCard';
import CitedPagesCard from '@/components/dashboard/CitedPagesCard';
import { ZoneRankingCard, LanguageRankingCard } from '@/components/dashboard/RankingCards';

const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BG = '#F7F5F0';
const VIOLET = '#7C3AED';
const F = 'Inter, system-ui, sans-serif';

const PERIODS = ['7J', '30J', '90J', '6M', 'ALL'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [period, setPeriod] = useState('30J');

  const load = async (forceRefresh = false) => {
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

      if (!forceRefresh && extra.overview_data && extra.overview_analyzed_at) {
        const age = Date.now() - new Date(extra.overview_analyzed_at).getTime();
        if (age < 24 * 60 * 60 * 1000) { setData(extra.overview_data); setPhase('done'); return; }
      }

      setPhase('thinking');
      const res = await base44.functions.invoke('dashboardOverview', { url: p.site_url, business_name: p.identity_name || '' });
      if (!res?.data || res.data.error) { setPhase('error'); return; }
      setData(res.data);
      setPhase('done');
      const newExtra = { ...extra, overview_data: res.data, overview_analyzed_at: new Date().toISOString() };
      const brand_keywords = await uploadProfileData(newExtra);
      base44.entities.BusinessProfile.update(p.id, { brand_keywords }).catch(() => {});
    } catch { setPhase('error'); }
  };

  useEffect(() => {
    load();
    const unsub = onActiveDomainChange(() => load());
    return unsub;
  }, []);

  const domain = data?.domain || (profile?.site_url || '').replace(/https?:\/\//, '').split('/')[0];
  const brand = data?.brand_name || profile?.identity_name || domain;

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: '0 0 3px', letterSpacing: '-0.03em' }}>Overview</h1>
            <p style={{ fontSize: 13, color: INK3, margin: 0 }}>
              GEO performance of {brand}{data?.analyzed_at ? ` · Last audit ${new Date(data.analyzed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'inline-flex', background: '#fff', border: '1px solid #E9E5DD', borderRadius: 9, padding: 3 }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  style={{ padding: '6px 11px', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: F,
                    fontSize: 11.5, fontWeight: 700, background: period === p ? INK : 'transparent', color: period === p ? '#fff' : INK3 }}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={() => load(true)} disabled={phase === 'thinking'}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 13px', border: `1px solid ${VIOLET}`, borderRadius: 9, background: '#fff', fontSize: 12, fontWeight: 700, color: VIOLET, cursor: 'pointer', fontFamily: F }}>
              <SlidersHorizontal size={13} /> Customize
            </button>
          </div>
        </div>

        {phase === 'loading' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
            {[280, 200, 240, 240, 130, 130].map((h, i) => (
              <div key={i} style={{ gridColumn: i === 4 || i === 5 ? 'auto' : (i === 0 || i === 2 ? 'span 1' : 'auto'), height: h, borderRadius: 14, background: 'linear-gradient(90deg,#F0EEE9 25%,#E8E4DC 50%,#F0EEE9 75%)', backgroundSize: '600px 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
            <style>{`@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
          </div>
        )}

        {phase === 'thinking' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', textAlign: 'center' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', border: '3px solid #E9E5DD', borderTopColor: VIOLET, animation: 'spin 0.9s linear infinite', marginBottom: 16 }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Building your overview…</p>
            <p style={{ fontSize: 12.5, color: INK3, margin: 0 }}>Analyzing your AI visibility across your plan's engines</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {phase === 'no_profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', border: '1px solid #E9E5DD', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Zap size={22} color={INK3} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>No site analyzed</p>
            <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 16px' }}>Analyze your site from the home page.</p>
            <button onClick={() => navigate('/app')} style={{ padding: '10px 20px', background: INK, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Back</button>
          </div>
        )}

        {phase === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 16px' }}>Analysis failed</p>
            <button onClick={() => load(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: INK, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {phase === 'done' && data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Row 1 : Evolution (2/3) + Tasks (1/3) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 14, alignItems: 'start' }}>
              <EvolutionCard score={data.geo_score} breakdown={data.score_breakdown} evolution={data.evolution} />
              <TasksCard tasks={data.tasks} onSeeAll={() => navigate('/audit')} onLaunch={() => navigate('/audit')} />
            </div>

            {/* Row 2 : Competitors + LLMs citing + Cited pages */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, alignItems: 'start' }}>
              <CompetitorsCard competitors={data.competitors} onSeeAll={() => navigate('/performance')} onWantRank2={() => navigate('/wok-ai', { state: { autoSend: 'How can I reach #2 vs my competitors in AI recommendations?' } })} />
              <LLMCitingCard llms={data.llms_citing} onDetail={() => navigate('/ai-report')} onWantMore={() => navigate('/wok-ai', { state: { autoSend: 'How can I get cited more often by AI engines?' } })} />
              <CitedPagesCard pages={data.cited_pages} />
            </div>

            {/* Row 3 : Zone + Language */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
              <ZoneRankingCard zones={data.zones} onDetail={() => navigate('/performance')} />
              <LanguageRankingCard languages={data.languages} onDetail={() => navigate('/performance')} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}