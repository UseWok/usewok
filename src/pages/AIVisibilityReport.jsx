import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, RefreshCw, Printer, AlertTriangle, CheckCircle, XCircle, Zap, TrendingUp, TrendingDown, Star } from 'lucide-react';
import FixInstructionModal from '@/components/report/FixInstructionModal';
import AIEnginesChart from '@/components/report/AIEnginesChart';

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function Delta({ val }) {
  if (!val) return null;
  const up = val > 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 700, color: up ? '#10B981' : '#EF4444' }}>
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}{up ? '+' : ''}{val.toFixed(1)}%
    </span>
  );
}

function ScoreRing({ value, size = 80, strokeWidth = 8, color, label }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F0EE" strokeWidth={strokeWidth} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(value, 100) / 100)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size > 90 ? 22 : 16, fontWeight: 900, color: '#0F0F10' }}>
          {Math.round(value)}
        </div>
      </div>
      {label && <span style={{ fontSize: 11, color: '#888', fontWeight: 600, textAlign: 'center', maxWidth: size + 20 }}>{label}</span>}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 16, padding: '20px', marginBottom: 16, ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 14px' }}>{children}</p>
  );
}

export default function AIVisibilityReport() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [fixCache, setFixCache] = useState({});

  useEffect(() => {
    base44.auth.me().then(async u => {
      if (!u) { navigate('/'); return; }
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      if (profiles.length > 0) {
        const p = profiles[0];
        let extra = {};
        try { extra = JSON.parse(p.brand_keywords || '{}'); } catch {}
        setFixCache(extra.fix_cache || {});
        setProfile({ ...p, ...extra });
      }
      setLoading(false);
    }).catch(() => navigate('/'));
  }, []);

  const handleFixSaved = (issueId, fixData) => {
    setFixCache(prev => ({ ...prev, [issueId]: fixData }));
  };

  const openFix = (issueText, idx) => {
    setSelectedIssue(issueText);
    setSelectedIssueId(`issue_${idx}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #F1F0EE', borderTopColor: '#7C3AED', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Aucun rapport disponible</p>
        <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Scannez votre site d'abord depuis l'accueil.</p>
        <button onClick={() => navigate('/app')} style={{ padding: '12px 24px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          ← Retour
        </button>
      </div>
    );
  }

  const score = Math.round(profile.score_overall || profile.overall_score || 0);
  const aiScore = Math.round(profile.score_ai_visibility || profile.ai_visibility_score || 0);
  const clarityScore = Math.round(profile.score_message_clarity || profile.message_clarity_score || 0);
  const commercialScore = Math.round(profile.score_commercial_signal || profile.commercial_presence_score || 0);
  const issues = profile.issues || [];
  const competitors = profile.competitors || [];
  const topKeywords = profile.top_keywords || [];
  const strengths = profile.strengths || [];

  const scoreColor = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const scoreLabel = score >= 70 ? '✨ Bonne visibilité' : score >= 40 ? '⚡ Visibilité moyenne' : '🚨 Faible visibilité';

  const technicals = [
    { label: 'Structure IA lisible', value: profile.has_schema_markup, tip: 'Les IA comprennent bien votre contenu' },
    { label: 'Fiche Google', value: profile.has_google_business, tip: 'Vous apparaissez sur Google Maps' },
    { label: 'Site sécurisé 🔒', value: profile.has_ssl, tip: 'Votre site a le cadenas HTTPS' },
    { label: 'Compatible mobile', value: profile.has_mobile_friendly, tip: 'Fonctionne bien sur téléphone' },
  ];

  const metrics = [
    { label: 'Visiteurs/mois', value: fmt(profile.organic_traffic), delta: profile.organic_traffic_delta_pct },
    { label: 'Mots-clés', value: fmt(profile.organic_keywords), delta: profile.organic_keywords_delta_pct },
    { label: 'Backlinks', value: fmt(profile.backlinks), delta: profile.backlinks_delta_pct },
    { label: 'Autorité', value: profile.authority_score ? `${profile.authority_score}/100` : '–', delta: null },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sticky header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDECE9', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E4E0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowLeft size={14} color="#555" />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 15, fontWeight: 800, color: '#0F0F10', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Rapport IA</h1>
            <p style={{ fontSize: 11, color: '#aaa', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.site_url}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={() => navigate('/app')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: '1px solid #E5E4E0', borderRadius: 8, background: '#fff', fontSize: 11, fontWeight: 600, color: '#555', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <RefreshCw size={11} /> Nouveau
          </button>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: 'none', borderRadius: 8, background: '#7C3AED', fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
            <Printer size={11} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* Hero */}
        <Card style={{ background: 'linear-gradient(135deg, #F8F6FF 0%, #fff 100%)', borderColor: '#E8E3FF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <ScoreRing value={score} size={100} strokeWidth={10} color={scoreColor} />
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: scoreColor + '20', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>{scoreLabel}</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0F0F10', margin: '0 0 6px', lineHeight: 1.2 }}>{profile.identity_name || profile.site_url}</h2>
              {profile.shock_insight && (
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.55, margin: 0 }}>{profile.shock_insight}</p>
              )}
            </div>
          </div>

          {/* Sub-scores */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20, paddingTop: 20, borderTop: '1px solid #EDECE9' }}>
            {[
              { label: 'Visibilité IA', value: aiScore, color: '#7C3AED' },
              { label: 'Clarté message', value: clarityScore, color: '#3B82F6' },
              { label: 'Signal commercial', value: commercialScore, color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ height: 4, background: '#F1F0EE', borderRadius: 2, margin: '6px 0 4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.value}%`, background: s.color, borderRadius: 2, transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Traffic metrics */}
        <Card>
          <SectionTitle>Performances du site</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {metrics.map((m, i) => (
              <div key={i} style={{ background: '#FAFAF8', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>{m.value}</div>
                {m.delta != null && <div style={{ marginTop: 4 }}><Delta val={m.delta} /></div>}
              </div>
            ))}
          </div>
        </Card>

        {/* AI Engines chart */}
        <AIEnginesChart data={profile} />

        {/* Technical signals */}
        <Card style={{ marginTop: 16 }}>
          <SectionTitle>Signaux techniques</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {technicals.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: t.value ? '#F0FDF4' : '#FEF2F2', borderRadius: 10, border: `1px solid ${t.value ? '#D1FAE5' : '#FECACA'}` }}>
                {t.value
                  ? <CheckCircle size={16} color="#10B981" style={{ flexShrink: 0 }} />
                  : <XCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: t.value ? '#065F46' : '#991B1B' }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: t.value ? '#6EE7B7' : '#FCA5A5', marginTop: 1 }}>{t.tip}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action plan */}
        {issues.length > 0 && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FFF4E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={14} color="#F97316" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0F0F10', margin: 0 }}>Plan d'action</p>
                <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{issues.length} problème{issues.length > 1 ? 's' : ''} à corriger</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {issues.map((issue, i) => {
                const issueText = typeof issue === 'string' ? issue : issue.problem;
                const issueId = `issue_${i}`;
                const hasCached = !!fixCache[issueId];
                const isError = (issue.severity || 'warning') === 'error';
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: isError ? '#FFF8F6' : '#FFFBEB', border: `1px solid ${isError ? '#FECACA' : '#FDE68A'}`, borderRadius: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: isError ? '#FEE2E2' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <AlertTriangle size={11} color={isError ? '#EF4444' : '#F59E0B'} />
                    </div>
                    <p style={{ fontSize: 13, color: '#1a1a1a', margin: 0, lineHeight: 1.5, flex: 1 }}>{issueText}</p>
                    <button
                      onClick={() => openFix(issueText, i)}
                      style={{
                        flexShrink: 0, padding: '6px 12px',
                        background: hasCached ? '#ECFDF5' : '#7C3AED',
                        color: hasCached ? '#059669' : '#fff',
                        border: hasCached ? '1px solid #D1FAE5' : 'none',
                        borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {hasCached ? '✓ Voir' : 'Corriger →'}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <Card>
            <SectionTitle>Points forts 💪</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {strengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F0FDF4', borderRadius: 10 }}>
                  <Star size={13} color="#10B981" fill="#10B981" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: '#065F46', margin: 0 }}>{s}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top keywords */}
        {topKeywords.length > 0 && (
          <Card>
            <SectionTitle>Mots-clés principaux</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {topKeywords.map((kw, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < topKeywords.length - 1 ? '1px solid #F5F4F1' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>{kw.keyword}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: kw.position <= 3 ? '#10B981' : kw.position <= 10 ? '#F59E0B' : '#888' }}>#{kw.position}</span>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{fmt(kw.volume)}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Competitors */}
        {competitors.length > 0 && (
          <Card>
            <SectionTitle>Concurrents</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {competitors.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8F7F4', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{typeof c === 'string' ? c : c.domain}</div>
                    {c.organic_traffic > 0 && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{fmt(c.organic_traffic)} visites/mois</div>}
                  </div>
                  {c.authority_score != null && (
                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 900, color: '#1a1a1a' }}>{c.authority_score}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>

      {selectedIssue && (
        <FixInstructionModal
          issue={selectedIssue}
          issueId={selectedIssueId}
          profile={profile}
          cachedFix={fixCache[selectedIssueId] || null}
          onClose={() => { setSelectedIssue(null); setSelectedIssueId(null); }}
          onFixSaved={handleFixSaved}
        />
      )}
    </div>
  );
}