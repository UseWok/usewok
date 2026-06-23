import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#555554';
const INK3 = '#999997';
const BORDER = '#E8E8E6';
const SURFACE = '#F7F6F4';
const WHITE = '#FFFFFF';

function fmt(n) {
  if (n == null) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function Delta({ val }) {
  if (!val) return null;
  const up = val > 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 700, color: up ? '#059669' : '#DC2626' }}>
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}{up ? '+' : ''}{val}%
    </span>
  );
}

function StatCard({ label, value, delta, sub }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '16px 18px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: INK, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: delta ? 4 : 0 }}>{value}</div>
      {delta != null && <Delta val={delta} />}
      {sub && <div style={{ fontSize: 11, color: INK3, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>{title}</p>
      {children}
    </div>
  );
}

function BarRow({ label, value, max = 100, accent }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 12, color: INK2, flex: 1 }}>{label}</span>
      <div style={{ width: 80, height: 3, background: SURFACE, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: accent || INK, borderRadius: 2, transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: INK, width: 32, textAlign: 'right', flexShrink: 0 }}>{value}%</span>
    </div>
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
  const yourBrand = sov?.your_brand;
  const competitors = sov?.competitors || [];
  const levers = perfData?.strategy?.strategic_levers || [];
  const domain = (profile?.site_url || '').replace(/https?:\/\//, '').split('/')[0];

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>
      {/* Header */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={14} color={INK2} />
          </button>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>Performance</p>
            {domain && <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{domain}</p>}
          </div>
        </div>
        {phase === 'done' && (
          <button onClick={() => loadPerf(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
            <RefreshCw size={11} /> Actualiser
          </button>
        )}
      </div>

      {/* States */}
      {phase === 'loading' && (
        <div style={{ padding: '20px 16px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 80, borderRadius: 14, background: `linear-gradient(90deg,#F0F0EE 25%,#E6E6E4 50%,#F0F0EE 75%)`, backgroundSize: '400px 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
          <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}`}</style>
        </div>
      )}

      {phase === 'thinking' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E8E8E6', borderTopColor: INK, animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Analyse en cours…</p>
          <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Comparaison avec vos concurrents IA</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {phase === 'no_profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 6px' }}>Aucun site analysé</p>
          <p style={{ fontSize: 12, color: INK3, margin: '0 0 16px' }}>Analysez votre site depuis l'accueil en premier.</p>
          <button onClick={() => navigate('/app')} style={{ padding: '10px 20px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Retour</button>
        </div>
      )}

      {phase === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 16px' }}>Analyse impossible</p>
          <button onClick={() => loadPerf(true)} style={{ padding: '10px 20px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Réessayer</button>
        </div>
      )}

      {phase === 'done' && perfData && (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px 100px' }}>

          {/* KPIs principaux */}
          <Section title="Votre position sur les IA">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <StatCard label="Part de voix" value={`${yourBrand?.voice_share_pct || 0}%`} delta={yourBrand?.voice_share_delta} sub="vs concurrents" />
              <StatCard label="Perception positive" value={`${yourBrand?.favorable_pct || 0}%`} delta={yourBrand?.favorable_delta} sub="des réponses IA" />
            </div>
          </Section>

          {/* Concurrents */}
          {competitors.length > 0 && (
            <Section title="Part de voix — comparaison">
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 16px' }}>
                <BarRow label={yourBrand?.name || 'Vous'} value={yourBrand?.voice_share_pct || 0} />
                {competitors.map((c, i) => (
                  <BarRow key={i} label={c.name || c.domain || `Concurrent ${i+1}`} value={c.voice_share_pct || 0} />
                ))}
              </div>
            </Section>
          )}

          {/* Perception favorable */}
          {(yourBrand?.favorable_pct > 0 || competitors.some(c => c.favorable_pct > 0)) && (
            <Section title="Perception favorable — comparaison">
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '14px 16px' }}>
                <BarRow label={yourBrand?.name || 'Vous'} value={yourBrand?.favorable_pct || 0} accent="#059669" />
                {competitors.map((c, i) => (
                  <BarRow key={i} label={c.name || `Concurrent ${i+1}`} value={c.favorable_pct || 0} />
                ))}
              </div>
            </Section>
          )}

          {/* Leviers */}
          {levers.length > 0 && (
            <Section title="Actions recommandées">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {levers.slice(0, 5).map((lever, i) => {
                  const urgent = lever.priority === 'urgent';
                  return (
                    <div key={i} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, flex: 1, lineHeight: 1.4 }}>{lever.title}</p>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: urgent ? '#FEF2F2' : SURFACE, color: urgent ? '#DC2626' : INK3, flexShrink: 0 }}>
                          {urgent ? 'Urgent' : lever.priority === 'short_term' ? 'Court terme' : 'Moyen terme'}
                        </span>
                      </div>
                      {lever.body && <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.65 }}>{lever.body}</p>}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

        </div>
      )}
    </div>
  );
}