import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getActiveDomain } from '@/lib/active-domain';
import { getProfileData } from '@/lib/profile-storage';
import { getCachedUser, getCachedProfiles, peekCache, setCache } from '@/lib/data-cache';
import { Plus, Trash2, Loader, RefreshCw } from 'lucide-react';
import CompetitorDetailModal from '@/components/competitors/CompetitorDetailModal';
import PromptsMatrix from '@/components/competitors/PromptsMatrix';
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
  const [siteUrl, setSiteUrl] = useState('');

  const load = async () => {
    try {
      const u = await getCachedUser();
      if (!u) return;
      const active = getActiveDomain();
      setSiteUrl(active?.url || '');
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

  const you = all.find(c => c.is_you);
  const competitors = all.filter(c => !c.is_you).sort((a, b) => (b.referral_pct || 0) - (a.referral_pct || 0));
  const atMax = competitors.length >= 3;

  // Instant add — NO AI, NO loading
  const addCompetitor = async (presetName, presetDomain) => {
    const dn = (presetDomain ?? domain).trim();
    const nm = (presetName ?? name).trim();
    if (!dn) return;
    if (atMax) { setAddError('Maximum of 3 tracked competitors.'); return; }
    setAddError('');
    try {
      const res = await base44.functions.invoke('competitorEngine', { action: 'add', site_url: siteUrl, name: nm, domain: dn });
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
      const res = await base44.functions.invoke('competitorEngine', { action: 'scan', site_url: siteUrl });
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
            <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: '0 0 3px', letterSpacing: '-0.03em' }}>Competitors</h1>
            <p style={{ fontSize: 12.5, color: INK3, margin: 0, maxWidth: 620, lineHeight: 1.55 }}>
              See who AI recommends most often in your market. Add up to 3 rivals, run a scan, and get a side-by-side chart of who ChatGPT, Gemini and Claude cite the most — plus how each one is trending.
            </p>
          </div>
          <button onClick={runScan} disabled={scanning}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: scanning ? '#DDD' : INK, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: scanning ? 'default' : 'pointer', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {scanning ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={13} />}
            {scanning ? 'Scanning…' : 'Refresh scan'}
          </button>
        </div>

        {/* ── What you'll get (shown until competitors are tracked) ── */}
        {!loading && competitors.length === 0 && (
          <div style={{ background: '#F3F0FB', border: '1px solid #E0D9F5', borderRadius: 14, padding: '18px 20px', marginBottom: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#4C1D95', margin: '0 0 8px' }}>What you'll see once you add competitors</p>
            <ul style={{ margin: 0, padding: '0 0 0 18px', color: '#5B4A82' }}>
              <li style={{ fontSize: 12.5, lineHeight: 1.7 }}>A ranking of who AI recommends most often in your market — you vs your rivals.</li>
              <li style={{ fontSize: 12.5, lineHeight: 1.7 }}>A prompt-by-prompt chart showing which brand ChatGPT, Gemini and Claude cite for each question.</li>
              <li style={{ fontSize: 12.5, lineHeight: 1.7 }}>Each competitor's 90-day trend, positioning summary and latest news.</li>
            </ul>
          </div>
        )}

        {/* ── Tracked competitors table ── */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Tracked competitors · 90-day summary ({competitors.length})</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 2.2fr 1.2fr 1fr 1.2fr 1fr', padding: '10px 20px', borderBottom: `1px solid ${BORDER}` }}>
            {['#', 'COMPETITOR', 'REFERRAL SOV', 'AUTHORITY', '90-DAY TREND', ''].map((h, i) => (
              <span key={i} style={{ fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>
          {loading && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>Loading…</p>}
          {!loading && competitors.length === 0 && (
            <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '26px 0' }}>No competitors tracked yet. Add one below (up to 3), then run the scan.</p>
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
                <button onClick={() => setDetail({ c, rank: i + 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: INK, fontFamily: F, textDecoration: 'underline' }}>Details →</button>
                <button onClick={() => remove(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Trash2 size={13} color={INK3} /></button>
              </span>
            </div>
          ))}
          {/* Add form */}
          {!atMax && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 20px', flexWrap: 'wrap' }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Name"
                style={{ padding: '8px 12px', fontSize: 12.5, border: `1px solid ${BORDER}`, borderRadius: 8, outline: 'none', fontFamily: F, width: 140 }} />
              <div>
                <input value={domain} onChange={e => { setDomain(e.target.value); setAddError(''); }} placeholder="Domain *"
                  onKeyDown={e => e.key === 'Enter' && addCompetitor()}
                  style={{ padding: '8px 12px', fontSize: 12.5, border: `1px solid ${addError ? '#EF4444' : BORDER}`, borderRadius: 8, outline: 'none', fontFamily: F, width: 170 }} />
                <p style={{ fontSize: 10.5, color: addError ? '#EF4444' : INK3, margin: '4px 0 0' }}>{addError || 'Double-check the official domain'}</p>
              </div>
              <button onClick={() => addCompetitor()} disabled={!domain.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: domain.trim() ? INK : '#DDD', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: domain.trim() ? 'pointer' : 'not-allowed', fontFamily: F }}>
                <Plus size={12} /> Add
              </button>
              <span style={{ fontSize: 11, color: INK3, alignSelf: 'center' }}>Scores update on the next scan.</span>
            </div>
          )}
          {atMax && (
            <p style={{ fontSize: 11.5, color: INK3, padding: '12px 20px', margin: 0 }}>Maximum of 3 tracked competitors reached.</p>
          )}
        </div>

        {/* ── Prompts matrix ── */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ display: 'inline-flex', gap: 4, marginBottom: 6 }}>
              {[{ id: 'referral', label: 'Referral' }, { id: 'authority', label: 'Authority' }].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ padding: '6px 14px', border: 'none', borderRadius: 20, cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: 700, background: tab === t.id ? CORAL : '#F0EDE8', color: tab === t.id ? '#fff' : INK3 }}>
                  {t.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: INK3, margin: '0 0 10px' }}>
              {tab === 'referral' ? "Where each player ranks in AI engine recommendations (without naming the brand)." : "Each player's presence on educational queries where an expert source is cited."}
            </p>
          </div>
          <PromptsMatrix you={you} competitors={competitors} type={tab} />
        </div>

        {/* ── Suggested competitors ── */}
        {suggestions.length > 0 && (
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Suggested competitors to track</span>
              <p style={{ fontSize: 11.5, color: INK3, margin: '2px 0 0' }}>Detected in AI engine recommendations, not tracked yet.</p>
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
                  <Plus size={12} /> Track
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