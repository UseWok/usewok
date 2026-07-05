import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import { SlidersHorizontal, RefreshCw, Zap, Info } from 'lucide-react';

import CustomizePanel, { DASHBOARD_WIDGETS } from '@/components/dashboard/CustomizePanel';
import EvolutionCard from '@/components/dashboard/EvolutionCard';
import TasksCard from '@/components/dashboard/TasksCard';
import CompetitorsCard from '@/components/dashboard/CompetitorsCard';
import LLMCitingCard from '@/components/dashboard/LLMCitingCard';
import CitedPagesCard from '@/components/dashboard/CitedPagesCard';
import { ZoneRankingCard, LanguageRankingCard } from '@/components/dashboard/RankingCards';

const INK = '#15130F';
const INK3 = 'rgba(21,19,15,0.5)';
const BG = '#FBF8F2';
const ORANGE = '#FF5A1F';
const ORANGE_DEEP = '#C43E14';
const F = 'Inter, system-ui, sans-serif';

const PERIODS = ['7J', '30J', '90J', '6M', 'Tout'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [period, setPeriod] = useState('30J');
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [visibility, setVisibility] = useState({});
  const profileIdRef = useRef(null);

  const toggleWidget = (id) => {
    setVisibility(prev => {
      const next = { ...prev, [id]: prev[id] === false ? true : false };
      if (profileIdRef.current) {
        base44.entities.BusinessProfile.update(profileIdRef.current, { dashboard_widgets: JSON.stringify(next) }).catch(() => {});
      }
      return next;
    });
  };

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
      profileIdRef.current = p.id;
      try { setVisibility(p.dashboard_widgets ? JSON.parse(p.dashboard_widgets) : {}); } catch { setVisibility({}); }

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
  const lastAudit = data?.analyzed_at
    ? new Date(data.analyzed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).replace('.', '')
    : '';

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '26px 36px 60px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Aperçu</h1>
            <div style={{ fontSize: 13, color: INK3 }}>
              Performance GEO de {brand}{lastAudit ? ` · Dernier audit le ${lastAudit}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'inline-flex', gap: 3, background: '#fff', border: '1px solid rgba(21,19,15,0.14)', borderRadius: 10, padding: 3 }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  style={{ padding: '6px 12px', border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: F,
                    fontSize: 12.5, fontWeight: 600, background: period === p ? INK : 'transparent', color: period === p ? BG : INK3 }}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={() => setCustomizeOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 10, border: `1px solid ${ORANGE}`, background: '#FFE7D6', color: ORANGE_DEEP, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              <SlidersHorizontal size={14} /> Personnaliser
            </button>
          </div>
        </div>

        {phase === 'loading' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16 }}>
            {[280, 200, 240, 240, 130, 130].map((h, i) => (
              <div key={i} style={{ gridColumn: i === 4 || i === 5 ? 'auto' : (i === 0 || i === 2 ? 'span 1' : 'auto'), height: h, borderRadius: 16, background: 'linear-gradient(90deg,#F3EEE3 25%,#E8E4DC 50%,#F3EEE3 75%)', backgroundSize: '600px 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
            <style>{`@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
          </div>
        )}

        {phase === 'thinking' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', textAlign: 'center' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', border: '3px solid rgba(21,19,15,0.09)', borderTopColor: ORANGE, animation: 'spin 0.9s linear infinite', marginBottom: 16 }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Construction de votre aperçu…</p>
            <p style={{ fontSize: 12.5, color: INK3, margin: 0 }}>Analyse de votre visibilité IA sur les moteurs de votre plan</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {phase === 'no_profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', border: '1px solid rgba(21,19,15,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Zap size={22} color={INK3} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Aucun site analysé</p>
            <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 16px' }}>Analysez votre site depuis la page d'accueil.</p>
            <button onClick={() => navigate('/app')} style={{ padding: '10px 20px', background: INK, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Retour</button>
          </div>
        )}

        {phase === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '55vh', textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 16px' }}>L'analyse a échoué</p>
            <button onClick={() => load(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: INK, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              <RefreshCw size={13} /> Réessayer
            </button>
          </div>
        )}

        {phase === 'done' && data && (() => {
          const vis = (id) => visibility[id] !== false;
          const allHidden = DASHBOARD_WIDGETS.every(w => visibility[w.id] === false);
          if (allHidden) {
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12 }}>
                <Info size={18} color="#2563EB" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, color: '#1E40AF' }}>Toutes les cartes sont masquées. Ouvre « Personnaliser » pour en réafficher.</span>
              </div>
            );
          }
          // Row 1
          const row1 = [vis('evolution'), vis('tasks')];
          const row2 = [vis('competitors'), vis('llms'), vis('pages')];
          const row3 = [vis('zones'), vis('languages')];
          const cols = (flags) => flags.filter(Boolean).map(() => '1fr').join(' ');
          return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5%' }}>
            {/* Row 1 : Score global + Tâches */}
            {(row1[0] || row1[1]) && (
              <div style={{ display: 'grid', gridTemplateColumns: row1[0] && row1[1] ? '1.55fr 1fr' : '1fr', gap: '5%', alignItems: 'stretch' }}>
                {vis('evolution') && <EvolutionCard score={data.geo_score} breakdown={data.score_breakdown} evolution={data.evolution} />}
                {vis('tasks') && <TasksCard tasks={data.tasks} onSeeAll={() => navigate('/tasks')} onLaunch={() => navigate('/tasks')} />}
              </div>
            )}

            {/* Row 2 : Concurrents + LLM + Pages citées */}
            {(row2[0] || row2[1] || row2[2]) && (
              <div style={{ display: 'grid', gridTemplateColumns: cols(row2), gap: '5%', alignItems: 'stretch' }}>
                {vis('competitors') && <CompetitorsCard competitors={data.competitors} onSeeAll={() => navigate('/competitors')} onWantRank2={() => navigate('/wok-ai', { state: { autoSend: 'Comment atteindre la 2ème place vs mes concurrents dans les recommandations IA ?' } })} />}
                {vis('llms') && <LLMCitingCard llms={data.llms_citing} onDetail={() => navigate('/ai-report')} onWantMore={() => navigate('/wok-ai', { state: { autoSend: 'Comment être cité plus souvent par les moteurs IA ?' } })} />}
                {vis('pages') && <CitedPagesCard pages={data.cited_pages} />}
              </div>
            )}

            {/* Row 3 : Zone + Langue */}
            {(row3[0] || row3[1]) && (
              <div style={{ display: 'grid', gridTemplateColumns: cols(row3), gap: '5%', alignItems: 'stretch' }}>
                {vis('zones') && <ZoneRankingCard zones={data.zones} onDetail={() => navigate('/performance')} />}
                {vis('languages') && <LanguageRankingCard languages={data.languages} onDetail={() => navigate('/performance')} />}
              </div>
            )}
          </div>
          );
        })()}

        <CustomizePanel open={customizeOpen} onClose={() => setCustomizeOpen(false)} visibility={visibility} onToggle={toggleWidget} />
      </div>
    </div>
  );
}