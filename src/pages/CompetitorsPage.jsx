import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getActiveDomain } from '@/lib/active-domain';
import { Plus, Trash2, Loader, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import CompetitorDetailModal from '@/components/competitors/CompetitorDetailModal';
import PromptsMatrix from '@/components/competitors/PromptsMatrix';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const ORANGE = '#F97316';
const CORAL = '#FF5A1F';

const RANK_COLORS = ['#F97316', '#EF4444', '#7C3AED', '#3B8BEB', '#10B981'];

function Trend({ t }) {
  if (t === 'up') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0B815A', fontSize: 12, fontWeight: 600 }}><TrendingUp size={13} /> Up</span>;
  if (t === 'down') return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#EF4444', fontSize: 12, fontWeight: 600 }}><TrendingDown size={13} /> Down</span>;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: INK3, fontSize: 12 }}><Minus size={13} /> Stable</span>;
}

export default function CompetitorsPage() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [detail, setDetail] = useState(null);
  const [tab, setTab] = useState('referral');
  const [siteUrl, setSiteUrl] = useState('');

  const load = async () => {
    try {
      const u = await base44.auth.me();
      if (!u) return;
      const active = getActiveDomain();
      setSiteUrl(active?.url || '');
      const q = { user_id: u.id };
      if (active?.url) q.site_url = active.url;
      const list = await base44.entities.Competitor.filter(q, '-created_date', 50);
      setAll(list);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const you = all.find(c => c.is_you);
  const competitors = all.filter(c => !c.is_you).sort((a, b) => (b.referral_pct || 0) - (a.referral_pct || 0));

  const addCompetitor = async () => {
    if (!domain.trim() || adding) return;
    setAdding(true); setAddError('');
    try {
      const res = await base44.functions.invoke('competitorEngine', { action: 'add', site_url: siteUrl, name: name.trim(), domain: domain.trim() });
      if (res?.data?.error) setAddError(res.data.error);
      else { setName(''); setDomain(''); }
      await load();
    } catch (e) {
      setAddError(e?.response?.data?.error || 'Analysis failed — please retry.');
    }
    setAdding(false);
  };

  const remove = async (c) => {
    try { await base44.entities.Competitor.delete(c.id); setAll(prev => prev.filter(x => x.id !== c.id)); } catch {}
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F0', fontFamily: F }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 80px' }}>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: INK, margin: '0 0 3px', letterSpacing: '-0.03em' }}>Competitors</h1>
        <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 20px' }}>
          Each competitor's position on your active prompts (Referral · Authority), trend and news. Click a competitor for details.
        </p>

        {/* ── Tracked competitors table ── */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Tracked competitors · 90d summary ({competitors.length})</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 2.2fr 1.2fr 1fr 1.2fr 1fr', padding: '10px 20px', borderBottom: `1px solid ${BORDER}` }}>
            {['#', 'COMPETITOR', 'REFERRAL SOV', 'AUTHORITY', '90D TREND', ''].map((h, i) => (
              <span key={i} style={{ fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>
          {loading && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>Loading…</p>}
          {!loading && competitors.length === 0 && !adding && (
            <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '26px 0' }}>No competitors tracked. Add one below — active prompts are generated automatically.</p>
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
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0B815A' }}>{c.authority_pct}</span>
              <Trend t={c.trend_90d} />
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setDetail(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: INK, fontFamily: F, textDecoration: 'underline' }}>Details →</button>
                <button onClick={() => remove(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Trash2 size={13} color={INK3} /></button>
              </span>
            </div>
          ))}
          {adding && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px', borderBottom: `1px solid ${BORDER}` }}>
              <Loader size={13} color={CORAL} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 12.5, color: INK3 }}>Analyzing <strong style={{ color: INK }}>{domain}</strong> — evaluating against your active prompts…</span>
            </div>
          )}
          {/* Add form */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 20px', flexWrap: 'wrap' }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Name"
              style={{ padding: '8px 12px', fontSize: 12.5, border: `1px solid ${BORDER}`, borderRadius: 8, outline: 'none', fontFamily: F, width: 140 }} />
            <div>
              <input value={domain} onChange={e => { setDomain(e.target.value); setAddError(''); }} placeholder="Domain *"
                onKeyDown={e => e.key === 'Enter' && addCompetitor()}
                style={{ padding: '8px 12px', fontSize: 12.5, border: `1px solid ${addError ? '#EF4444' : BORDER}`, borderRadius: 8, outline: 'none', fontFamily: F, width: 170 }} />
              <p style={{ fontSize: 10.5, color: addError ? '#EF4444' : INK3, margin: '4px 0 0' }}>{addError || 'Check the official domain'}</p>
            </div>
            <button onClick={addCompetitor} disabled={!domain.trim() || adding}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: domain.trim() && !adding ? INK : '#DDD', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, color: '#fff', cursor: domain.trim() && !adding ? 'pointer' : 'not-allowed', fontFamily: F }}>
              <Plus size={12} /> Add
            </button>
            <span style={{ fontSize: 11, color: INK3, alignSelf: 'center' }}>Scores update with each new analysis.</span>
          </div>
        </div>

        {/* ── Prompts matrix ── */}
        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
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
              {tab === 'referral' ? "Each player's position in AI engine recommendations (without naming the brand)." : "Each player's presence on educational queries where an expert source is cited."}
            </p>
          </div>
          <PromptsMatrix you={you} competitors={competitors} type={tab} />
        </div>
      </div>

      {detail && <CompetitorDetailModal competitor={detail} onClose={() => setDetail(null)} />}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}