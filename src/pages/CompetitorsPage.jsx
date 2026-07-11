import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getActiveDomain } from '@/lib/active-domain';
import { getProfileData } from '@/lib/profile-storage';
import { getCachedUser, getCachedProfiles, peekCache, setCache } from '@/lib/data-cache';
import { Plus, Trash2, Loader, RefreshCw } from 'lucide-react';
import { getWokFeatures } from '@/lib/wok-plans';
import CompetitorDetailModal from '@/components/competitors/CompetitorDetailModal';
import PromptsMatrix from '@/components/competitors/PromptsMatrix';
import HeadToHead from '@/components/competitors/HeadToHead';
import Sparkline from '@/components/competitors/Sparkline';

const F = "'Wix Madefor Text', 'Wix Madefor Display', system-ui, sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const ORANGE = '#F97316';
const CORAL = '#FF5A1F';
const GREEN = '#0B815A';

const RANK_COLORS = ['#F97316', '#EF4444', '#7C3AED'];

export default function CompetitorsPage() {
  const navigate = useNavigate();
  const _active0 = getActiveDomain();
  const _seed = peekCache(`comp_${_active0?.url || 'all'}`);
  const [all, setAll] = useState(_seed?.all || []);
  const [suggestions, setSuggestions] = useState(_seed?.suggestions || []);
  const [loading, setLoading] = useState(!_seed);
  const [scanning, setScanning] = useState(false);
  const [addError, setAddError] = useState('');
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState('referral');
  const [maxCompetitors, setMaxCompetitors] = useState(3);
  const autoScanRef = useRef(false);
  const [siteUrl, setSiteUrl] = useState('');

  const load = async () => {
    try {
      const u = await getCachedUser();
      if (!u) return;
      const active = getActiveDomain();
      setSiteUrl(active?.url || '');
      setMaxCompetitors(getWokFeatures(u)?.max_competitors ?? 3);
      const q = { user_id: u.id };
      if (active?.url) q.site_url = active.url;
      const list = await base44.entities.Competitor.filter(q, '-created_date', 50);
      setAll(list);
      // Load suggestions stored on the profile
      let sugg = [];
      try {
        const profiles = await getCachedProfiles(u.id);
        const p = profiles.find(x => x.site_url === active?.url) || profiles[0];
        const extra = await getProfileData(p);
        sugg = Array.isArray(extra.competitor_suggestions) ? extra.competitor_suggestions.slice(0, 2) : [];
        setSuggestions(sugg);
      } catch {}
      setCache(`comp_${active?.url || 'all'}`, { all: list, suggestions: sugg });
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  // Auto-scan if no competitors exist yet — discovers rivals based on subscription
  useEffect(() => {
    if (!loading && !autoScanRef.current && siteUrl && maxCompetitors > 0 && all.filter(c => !c.is_you).length === 0) {
      autoScanRef.current = true;
      runScan();
    }
  }, [loading, siteUrl, maxCompetitors, all]);

  const you = all.find(c => c.is_you);
  const competitors = all.filter(c => !c.is_you).sort((a, b) => (b.referral_pct || 0) - (a.referral_pct || 0));
  const atMax = competitors.length >= maxCompetitors;

  // Instant add — NO AI, NO loading
  const addCompetitor = async (presetName, presetDomain) => {
    const dn = (presetDomain ?? domain).trim();
    const nm = (presetName ?? name).trim();
    if (!dn) return;
    if (atMax) { setAddError(`Maximum de ${maxCompetitors} concurrents suivis.`); return; }
    setAddError('');
    try {
      const res = await base44.functions.invoke('competitorEngine', { action: 'add', site_url: siteUrl, name: nm, domain: dn, max_competitors: maxCompetitors });
      if (res?.data?.error) { setAddError(res.data.error); return; }
      setName(''); setDomain('');
      const created = res?.data?.competitor;
      if (created) setAll(prev => [created, ...prev]);
      setSuggestions(prev => prev.filter(s => s.domain !== created?.domain));
    } catch (e) {
      setAddError(e?.response?.data?.error || "Couldn't add this competitor.");
    }
  };

  const remove = async (c) => {
    try { await base44.entities.Competitor.delete(c.id); setAll(prev => prev.filter(x => x.id !== c.id)); } catch {}
  };

  // Renew scan — runs the full real AI analysis
  const runScan = async () => {
    if (scanning || !siteUrl) return;
    setScanning(true);
    try {
      const res = await base44.functions.invoke('competitorEngine', { action: 'scan', site_url: siteUrl, max_competitors: maxCompetitors });
      if (res?.data?.suggestions) setSuggestions(res.data.suggestions.slice(0, 2));
      await load();
    } catch (e) {
      setAddError(e?.response?.data?.error || 'Scan failed — please try again.');
    }
    setScanning(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F0', fontFamily: F }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: '0 0 3px', letterSpacing: '-0.03em' }}>Qui les IA recommandent avant toi ?</h1>
            <p style={{ fontSize: 12.5, color: INK3, margin: 0, maxWidth: 620, lineHeight: 1.55 }}>
              Compare-toi à tes 3 principaux concurrents. On te montre qui ChatGPT, Gemini et Claude citent le plus — et, question par question, où tu gagnes et où tu es dépassé.
            </p>
          </div>
          <button onClick={runScan} disabled={scanning}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: scanning ? '#DDD' : INK, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: scanning ? 'default' : 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {scanning ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={13} />}
            {scanning ? 'Analyse…' : 'Relancer l\'analyse'}
          </button>
        </div>

        {/* ── Résumé visuel Toi vs concurrents ── */}
        {!loading && competitors.length > 0 && <HeadToHead you={you} competitors={competitors} />}

        {/* ── Ce que tu obtiendras (tant qu'aucun concurrent n'est suivi) ── */}
        {!loading && competitors.length === 0 && (
          <div style={{ background: '#F3F0FB', border: '1px solid #E0D9F5', borderRadius: 14, padding: '18px 20px', marginBottom: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#4C1D95', margin: '0 0 8px' }}>Ce que tu verras une fois tes concurrents ajoutés</p>
            <ul style={{ margin: 0, padding: '0 0 0 18px', color: '#5B4A82' }}>
              <li style={{ fontSize: 12.5, lineHeight: 1.7 }}>Un classement clair : à quelle fréquence les IA te recommandent, toi vs tes concurrents.</li>
              <li style={{ fontSize: 12.5, lineHeight: 1.7 }}>Question par question, qui a été cité (✓ vert) et qui ne l'a pas été (✗ rouge).</li>
              <li style={{ fontSize: 12.5, lineHeight: 1.7 }}>Un bouton pour rattraper chaque concurrent là où il te devance.</li>
            </ul>
          </div>
        )}

        {/* ── Tracked competitors table ── */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Le détail, concurrent par concurrent ({competitors.length})</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 2.2fr 1.2fr 1fr 1.2fr 1fr', padding: '10px 20px', borderBottom: `1px solid ${BORDER}` }}>
            {['#', 'CONCURRENT', 'RECOMMANDÉ PAR L\'IA', 'CRÉDIBILITÉ', 'TENDANCE 90J', ''].map((h, i) => (
              <span key={i} style={{ fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>
          {loading && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>Chargement…</p>}
          {!loading && competitors.length === 0 && (
            <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '26px 0' }}>Aucun concurrent suivi pour l'instant. Ajoutes-en un ci-dessous ({maxCompetitors} max), puis lance l'analyse.</p>
          )}
          {competitors.map((c, i) => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '0.5fr 2.2fr 1.2fr 1fr 1.2fr 1fr', padding: '13px 20px', borderBottom: `1px solid ${BORDER}`, alignItems: 'center' }}>
              <span style={{ width: 24, height: 24, borderRadius: 6, background: `${RANK_COLORS[i % RANK_COLORS.length]}18`, color: RANK_COLORS[i % RANK_COLORS.length], fontSize: 10.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>#{i + 1}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={`https://www.google.com/s2/favicons?domain=${c.domain}&sz=64`} width={26} height={26} style={{ borderRadius: 7 }} alt="" />
                <span>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: INK }}>{c.name}</span>
                  <span style={{ fontSize: 11.5, color: INK3 }}>{c.domain}</span>
                </span>
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: ORANGE }}>{c.referral_pct}%</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: GREEN }}>{c.authority_cited}</span>
              <Sparkline trend={c.trend_90d} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setDetail({ c, rank: i + 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: INK, fontFamily: F, textDecoration: 'underline' }}>Détails →</button>
                <button onClick={() => remove(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Trash2 size={13} color={INK3} /></button>
              </span>
            </div>
          ))}
          {/* Add form */}
          {!atMax && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 20px', flexWrap: 'wrap' }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom"
                style={{ padding: '8px 12px', fontSize: 12.5, border: `1px solid ${BORDER}`, borderRadius: 8, outline: 'none', fontFamily: F, width: 140 }} />
              <div>
                <input value={domain} onChange={e => { setDomain(e.target.value); setAddError(''); }} placeholder="Domaine *"
                  onKeyDown={e => e.key === 'Enter' && addCompetitor()}
                  style={{ padding: '8px 12px', fontSize: 12.5, border: `1px solid ${addError ? '#EF4444' : BORDER}`, borderRadius: 8, outline: 'none', fontFamily: F, width: 170 }} />
                <p style={{ fontSize: 10.5, color: addError ? '#EF4444' : INK3, margin: '4px 0 0' }}>{addError || 'Vérifie bien le domaine officiel'}</p>
              </div>
              <button onClick={() => addCompetitor()} disabled={!domain.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: domain.trim() ? INK : '#DDD', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: domain.trim() ? 'pointer' : 'not-allowed', fontFamily: F }}>
                <Plus size={12} /> Ajouter
              </button>
              <span style={{ fontSize: 11, color: INK3, alignSelf: 'center' }}>Les scores se mettent à jour à la prochaine analyse.</span>
            </div>
          )}
          {atMax && (
            <p style={{ fontSize: 11.5, color: INK3, padding: '12px 20px', margin: 0 }}>Maximum de {maxCompetitors} concurrents suivis atteint.</p>
          )}
        </div>

        {/* ── Prompts matrix ── */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ padding: '14px 20px 0' }}>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: INK, marginBottom: 8 }}>Question par question : qui est cité, qui ne l'est pas</span>
            <div style={{ display: 'inline-flex', gap: 4, marginBottom: 6 }}>
              {[{ id: 'referral', label: 'Recommandations' }, { id: 'authority', label: 'Crédibilité' }].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ padding: '6px 14px', border: 'none', borderRadius: 20, cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: 700, background: tab === t.id ? CORAL : '#F0EDE8', color: tab === t.id ? '#fff' : INK3 }}>
                  {t.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: INK3, margin: '0 0 10px' }}>
              {tab === 'referral' ? "Quand un client pose ces questions à une IA, qui est recommandé — toi ou tes concurrents." : "Sur les questions où l'IA cite un expert, qui apparaît comme référence."}
            </p>
          </div>
          <PromptsMatrix you={you} competitors={competitors} type={tab}
            onCatchUp={(target, question) => navigate('/wok-ai', { state: { autoSend: `Comment faire pour être recommandé par les IA comme ${target.name} sur cette question : "${question}" ?` } })} />
        </div>

        {/* ── Suggested competitors ── */}
        {suggestions.length > 0 && (
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Concurrents suggérés à suivre</span>
              <p style={{ fontSize: 11.5, color: INK3, margin: '2px 0 0' }}>Détectés dans les recommandations des IA, pas encore suivis.</p>
            </div>
            {suggestions.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: i < suggestions.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                <img src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=64`} width={26} height={26} style={{ borderRadius: 7 }} alt="" />
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: INK }}>{s.name}</span>
                  <span style={{ fontSize: 11.5, color: INK3 }}>{s.reason ? `${s.reason} · ` : ''}{s.domain}</span>
                </span>
                <button onClick={() => addCompetitor(s.name, s.domain)} disabled={atMax}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: atMax ? INK3 : INK, cursor: atMax ? 'not-allowed' : 'pointer', fontFamily: F }}>
                  <Plus size={12} /> Suivre
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {detail && <CompetitorDetailModal competitor={detail.c} rank={detail.rank} onClose={() => setDetail(null)} />}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}