import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, RefreshCw, Printer, AlertTriangle, CheckCircle, XCircle, Zap } from 'lucide-react';
import FixInstructionModal from '@/components/report/FixInstructionModal';

// Score circle
function ScoreCircle({ value, label, color }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 84, height: 84 }}>
        <svg width="84" height="84" viewBox="0 0 84 84" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="42" cy="42" r={r} fill="none" stroke="#F1F0EE" strokeWidth="8" />
          <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - value / 100)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#1a1a1a' }}>{Math.round(value)}</span>
      </div>
      <span style={{ fontSize: 11, color: '#888', fontWeight: 600, textAlign: 'center' }}>{label}</span>
    </div>
  );
}

// Gauge bar
function GaugeBar({ value, color }) {
  return (
    <div style={{ height: 6, background: '#F1F0EE', borderRadius: 3, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: color, borderRadius: 3, transition: 'width 1s ease' }} />
    </div>
  );
}

export default function AIVisibilityReport() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
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
        setProfileId(p.id);
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

  const openFix = (issue, idx) => {
    setSelectedIssue(typeof issue === 'string' ? issue : issue.problem);
    setSelectedIssueId(`issue_${idx}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '4px solid #F1F0EE', borderTopColor: '#7C3AED', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <AlertTriangle size={40} color="#F59E0B" />
        <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>Aucune donnée de scan trouvée</p>
        <p style={{ fontSize: 13, color: '#888' }}>Retournez scanner votre site d'abord.</p>
        <button onClick={() => navigate('/app')} style={{ padding: '10px 20px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          ← Retour au scanner
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
  const chatgptScore = profile.chatgpt_score || 0;
  const perplexityScore = profile.perplexity_score || 0;
  const googleAiScore = profile.google_ai_score || 0;

  // Score color
  const scoreColor = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const scoreLabel = score >= 70 ? 'Bonne visibilité' : score >= 40 ? 'Visibilité moyenne' : 'Faible visibilité';

  const technicals = [
    { label: 'Schema Markup', value: profile.has_schema_markup },
    { label: 'Google Business', value: profile.has_google_business },
    { label: 'SSL / HTTPS', value: profile.has_ssl },
    { label: 'Mobile Friendly', value: profile.has_mobile_friendly },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Page header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EDECE9', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/app')} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E5E4E0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={15} color="#555" />
          </button>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: '#0F0F10', margin: 0 }}>AI Visibility Report</h1>
            <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{profile.site_url || profile.identity_name}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/app')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #E5E4E0', borderRadius: 8, background: '#fff', fontSize: 12, fontWeight: 600, color: '#555', cursor: 'pointer' }}>
            <RefreshCw size={12} /> Nouveau scan
          </button>
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: 'none', borderRadius: 8, background: '#7C3AED', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
            <Printer size={12} /> Imprimer
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 24px' }}>

        {/* Hero score */}
        <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 20, padding: '28px 32px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
            <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="44" fill="none" stroke="#F1F0EE" strokeWidth="10" />
              <circle cx="55" cy="55" r="44" fill="none" stroke={scoreColor} strokeWidth="10"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - score / 100)}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: '#0F0F10' }}>{score}</span>
              <span style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>/100</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: scoreColor + '18', marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: scoreColor }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>{scoreLabel}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F0F10', margin: '0 0 6px' }}>{profile.identity_name || profile.site_url}</h2>
            {profile.shock_insight && (
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5, margin: 0 }}>{profile.shock_insight}</p>
            )}
          </div>
        </div>

        {/* 4 score cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'AI Visibility', value: aiScore, color: '#7C3AED' },
            { label: 'Message Clarity', value: clarityScore, color: '#3B82F6' },
            { label: 'Signal Commercial', value: commercialScore, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 16, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <ScoreCircle value={s.value} label={s.label} color={s.color} />
              <GaugeBar value={s.value} color={s.color} />
            </div>
          ))}
        </div>

        {/* AI Engines */}
        <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px' }}>Présence par moteur IA</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { name: 'ChatGPT', score: chatgptScore, color: '#10A37F' },
              { name: 'Perplexity', score: perplexityScore, color: '#20808D' },
              { name: 'Google AI', score: googleAiScore, color: '#4285F4' },
            ].map(e => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#444', width: 80, flexShrink: 0 }}>{e.name}</span>
                <GaugeBar value={e.score} color={e.color} />
                <span style={{ fontSize: 12, fontWeight: 700, color: e.color, width: 32, textAlign: 'right', flexShrink: 0 }}>{e.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technical signals */}
        <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 16px' }}>Signaux techniques</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
            {technicals.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: t.value ? '#ECFDF5' : '#FEF2F2', borderRadius: 10 }}>
                {t.value ? <CheckCircle size={14} color="#059669" /> : <XCircle size={14} color="#DC2626" />}
                <span style={{ fontSize: 12, fontWeight: 600, color: t.value ? '#059669' : '#DC2626' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Issues — Action Plan */}
        {issues.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Zap size={16} color="#7C3AED" />
              <h3 style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Plan d'action</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {issues.map((issue, i) => {
                const issueText = typeof issue === 'string' ? issue : issue.problem;
                const issueId = `issue_${i}`;
                const hasCached = !!fixCache[issueId];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: '#FFF8F6', border: '1px solid #FDECEA', borderRadius: 12 }}>
                    <AlertTriangle size={15} color="#F97316" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: '#1a1a1a', margin: 0, lineHeight: 1.5 }}>{issueText}</p>
                    </div>
                    <button
                      onClick={() => openFix(issue, i)}
                      style={{
                        flexShrink: 0, padding: '6px 14px',
                        background: hasCached ? '#ECFDF5' : '#7C3AED',
                        color: hasCached ? '#059669' : '#fff',
                        border: hasCached ? '1px solid #D1FAE5' : 'none',
                        borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s',
                      }}
                    >
                      {hasCached ? '✓ Voir' : 'Obtenir les instructions'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top keywords */}
        {topKeywords.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>Mots-clés principaux</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {topKeywords.map((kw, i) => (
                <span key={i} style={{ padding: '5px 12px', background: '#F5F4F1', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#444' }}>
                  {typeof kw === 'string' ? kw : kw.keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Competitors */}
        {competitors.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>Concurrents détectés</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {competitors.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8F7F4', borderRadius: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{typeof c === 'string' ? c : c.domain}</span>
                  {c.score !== undefined && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>{c.score}/100</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Fix modal */}
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