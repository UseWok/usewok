import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Minus, ArrowRight, CheckCircle, XCircle, Star, Zap } from 'lucide-react';
import FixInstructionModal from '@/components/report/FixInstructionModal';
import AIEnginesChart from '@/components/report/AIEnginesChart';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111111';
const INK2 = '#555555';
const INK3 = '#999999';
const BORDER = '#EBEBEB';
const SURFACE = '#F8F7F5';
const WHITE = '#FFFFFF';

function fmt(n) {
  if (n == null || n === 0) return '–';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 16px', fontFamily: F }}>
      {children}
    </p>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 22px', ...style }}>
      {children}
    </div>
  );
}

function DeltaBadge({ val }) {
  if (val == null) return null;
  const up = val > 0;
  const neutral = val === 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700,
      color: neutral ? INK3 : up ? '#27AE60' : '#E74C3C',
      background: neutral ? SURFACE : up ? '#EAFAF1' : '#FDEDEC',
      padding: '2px 7px', borderRadius: 20,
    }}>
      {neutral ? <Minus size={9} /> : up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {!neutral && (up ? '+' : '')}{typeof val === 'number' ? val.toFixed(1) : val}%
    </span>
  );
}

// ── LRS Hero Card ─────────────────────────────────────────────────────────────
function LRSCard({ profile }) {
  const lrs = Math.round(profile.lrs_score || 0);
  const trend = profile.lrs_trend || 'stable';
  const vsIndustry = profile.lrs_vs_industry;
  const citation = Math.round(profile.lrs_citation_score || 0);
  const sentiment = Math.round(profile.lrs_sentiment_score || 0);
  const accuracy = Math.round(profile.lrs_accuracy_score || 0);

  const lrsColor = lrs >= 65 ? '#27AE60' : lrs >= 35 ? '#E67E22' : '#E74C3C';
  const trendIcon = trend === 'rising' ? <TrendingUp size={13} color="#27AE60" /> : trend === 'declining' ? <TrendingDown size={13} color="#E74C3C" /> : <Minus size={13} color={INK3} />;
  const trendLabel = trend === 'rising' ? 'En hausse' : trend === 'declining' ? 'En baisse' : 'Stable';
  const trendColor = trend === 'rising' ? '#27AE60' : trend === 'declining' ? '#E74C3C' : INK3;

  return (
    <div style={{
      background: INK, borderRadius: 18, padding: '28px 28px 24px', marginBottom: 14,
      fontFamily: F, position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle texture */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 60%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', marginBottom: 20 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: lrsColor }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.09em' }}>LLM Resonance Score™</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 80, fontWeight: 900, color: WHITE, lineHeight: 0.9, letterSpacing: '-0.05em' }}>{lrs}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8, fontWeight: 500 }}>sur 100</div>
          </div>
          <div style={{ paddingBottom: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: WHITE, marginBottom: 4 }}>{profile.identity_name || profile.site_url}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: trendColor }}>
                {trendIcon} {trendLabel}
              </span>
              {vsIndustry != null && (
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                  {vsIndustry >= 0 ? `+${vsIndustry}` : vsIndustry} pts vs moyenne secteur
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3 components */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Fréquence de citation', value: citation, desc: '40% du score' },
            { label: 'Qualité du sentiment', value: sentiment, desc: '30% du score' },
            { label: 'Exactitude des infos', value: accuracy, desc: '30% du score' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: WHITE, lineHeight: 1 }}>{s.value}</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, margin: '8px 0 6px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.value}%`, background: 'rgba(255,255,255,0.55)', borderRadius: 2, transition: 'width 1.2s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {profile.shock_insight && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '18px 0 0', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14 }}>
            {profile.shock_insight}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Sub-scores row ─────────────────────────────────────────────────────────────
function SubScoresRow({ profile }) {
  const items = [
    { label: 'Visibilité IA', value: Math.round(profile.score_ai_visibility || profile.ai_visibility_score || 0) },
    { label: 'Clarté du message', value: Math.round(profile.score_message_clarity || profile.message_clarity_score || 0) },
    { label: 'Signal commercial', value: Math.round(profile.score_commercial_signal || profile.commercial_presence_score || 0) },
    { label: 'Score global', value: Math.round(profile.score_overall || profile.overall_score || 0) },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
      {items.map(s => (
        <Card key={s.label} style={{ padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: INK, lineHeight: 1 }}>{s.value}</div>
          <div style={{ height: 3, background: SURFACE, borderRadius: 2, margin: '8px 0 5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${s.value}%`, background: INK, borderRadius: 2, transition: 'width 1s ease' }} />
          </div>
          <div style={{ fontSize: 10, color: INK3, fontWeight: 600 }}>{s.label}</div>
        </Card>
      ))}
    </div>
  );
}

// ── Injection Plan ─────────────────────────────────────────────────────────────
function InjectionPlan({ plan, onOpenFix }) {
  const [expanded, setExpanded] = useState(null);
  if (!plan?.length) return null;

  const impactColor = (impact) => impact === 'high' ? '#27AE60' : '#E67E22';
  const effortLabel = { low: 'Effort faible', medium: 'Effort moyen', high: 'Effort élevé' };

  return (
    <Card style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <SectionLabel>Ordonnance d'injection d'entité</SectionLabel>
          <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: 0, lineHeight: 1.3 }}>
            Plan d'action personnalisé
          </p>
          <p style={{ fontSize: 12, color: INK3, margin: '4px 0 0' }}>
            {plan.length} leviers identifiés pour améliorer votre LRS ce mois
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plan.map((item, i) => (
          <div key={i} style={{
            border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden',
            background: expanded === i ? SURFACE : WHITE,
            transition: 'background 0.15s',
          }}>
            {/* Header row */}
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: F,
              }}
            >
              {/* Step number */}
              <div style={{
                width: 28, height: 28, borderRadius: 8, background: INK, color: WHITE,
                fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{i + 1}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{item.action_title}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                    color: impactColor(item.impact), background: impactColor(item.impact) + '18',
                    padding: '2px 7px', borderRadius: 20, flexShrink: 0,
                  }}>Impact {item.impact === 'high' ? 'élevé' : 'moyen'}</span>
                </div>
                <div style={{ fontSize: 11, color: INK3 }}>
                  <span style={{ background: '#F0F4FF', color: '#3B5BDB', padding: '1px 7px', borderRadius: 4, fontWeight: 600, marginRight: 6 }}>{item.engine}</span>
                  {item.gap}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: INK3 }}>{effortLabel[item.effort] || item.effort}</span>
                <ArrowRight size={13} color={INK3} style={{ transform: expanded === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>
            </button>

            {/* Expanded detail */}
            {expanded === i && (
              <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${BORDER}` }}>
                <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Pourquoi vos concurrents sont cités à votre place</p>
                    <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.competitor_advantage}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Action concrète</p>
                    <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.65 }}>{item.action_detail}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: SURFACE, borderRadius: 9, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Zap size={12} color={INK} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>Plateforme cible : {item.platform}</span>
                    </div>
                    <button
                      onClick={() => onOpenFix(item.action_title + ' — ' + item.action_detail, i)}
                      style={{
                        padding: '7px 14px', background: INK, color: WHITE, border: 'none',
                        borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: F,
                      }}
                    >
                      Générer le contenu →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Traffic metrics ────────────────────────────────────────────────────────────
function TrafficCard({ profile }) {
  const metrics = [
    { label: 'Visiteurs / mois', value: fmt(profile.organic_traffic), delta: profile.organic_traffic_delta_pct },
    { label: 'Mots-clés organiques', value: fmt(profile.organic_keywords), delta: profile.organic_keywords_delta_pct },
    { label: 'Backlinks', value: fmt(profile.backlinks), delta: profile.backlinks_delta_pct },
    { label: 'Autorité de domaine', value: profile.authority_score ? `${profile.authority_score}` : '–', delta: null },
  ];
  return (
    <Card style={{ marginBottom: 14 }}>
      <SectionLabel>Performances du site</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: SURFACE, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: INK3, fontWeight: 600, marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: INK, lineHeight: 1 }}>{m.value}</div>
            {m.delta != null && <div style={{ marginTop: 6 }}><DeltaBadge val={m.delta} /></div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Technical signals ──────────────────────────────────────────────────────────
function TechnicalCard({ profile }) {
  const items = [
    { label: 'Structure lisible par les IA', value: profile.has_schema_markup, tip: 'Les IA comprennent bien votre contenu' },
    { label: 'Fiche Google My Business', value: profile.has_google_business, tip: 'Vous apparaissez sur Google Maps' },
    { label: 'Site sécurisé (HTTPS)', value: profile.has_ssl, tip: 'Cadenas actif, site de confiance' },
    { label: 'Compatible mobile', value: profile.has_mobile_friendly, tip: 'Fonctionne bien sur téléphone' },
  ];
  return (
    <Card style={{ marginBottom: 14 }}>
      <SectionLabel>Signaux techniques</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {items.map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px',
            background: t.value ? '#F0FAF4' : SURFACE,
            borderRadius: 10, border: `1px solid ${t.value ? '#C3E9D3' : BORDER}`,
          }}>
            {t.value
              ? <CheckCircle size={15} color="#27AE60" style={{ flexShrink: 0 }} />
              : <XCircle size={15} color="#CCC" style={{ flexShrink: 0 }} />}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: INK }}>{t.label}</div>
              <div style={{ fontSize: 10, color: INK3, marginTop: 1 }}>{t.tip}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Strengths ──────────────────────────────────────────────────────────────────
function StrengthsCard({ strengths }) {
  if (!strengths?.length) return null;
  return (
    <Card style={{ marginBottom: 14 }}>
      <SectionLabel>Points forts</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {strengths.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', background: SURFACE, borderRadius: 10 }}>
            <Star size={12} color={INK} fill={INK} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.5 }}>{s}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Keywords ───────────────────────────────────────────────────────────────────
function KeywordsCard({ keywords }) {
  if (!keywords?.length) return null;
  return (
    <Card style={{ marginBottom: 14 }}>
      <SectionLabel>Mots-clés organiques principaux</SectionLabel>
      <div>
        {keywords.map((kw, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: i < keywords.length - 1 ? `1px solid ${BORDER}` : 'none',
          }}>
            <span style={{ fontSize: 13, color: INK, fontWeight: 500 }}>{kw.keyword}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: kw.position <= 3 ? '#27AE60' : kw.position <= 10 ? '#E67E22' : INK3,
              }}>#{kw.position}</span>
              <span style={{ fontSize: 11, color: INK3 }}>{fmt(kw.volume)}/mois</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Competitors ────────────────────────────────────────────────────────────────
function CompetitorsCard({ competitors }) {
  if (!competitors?.length) return null;
  return (
    <Card style={{ marginBottom: 14 }}>
      <SectionLabel>Concurrents identifiés</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {competitors.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', background: SURFACE, borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: INK }}>{typeof c === 'string' ? c : c.domain}</div>
              {c.organic_traffic > 0 && <div style={{ fontSize: 11, color: INK3, marginTop: 2 }}>{fmt(c.organic_traffic)} visites/mois</div>}
            </div>
            {c.authority_score != null && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: INK }}>{c.authority_score}</div>
                <div style={{ fontSize: 9, color: INK3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Autorité</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
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
    setSelectedIssueId(`injection_${idx}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E0E0E0', borderTopColor: INK, animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center', fontFamily: F }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: INK, margin: 0 }}>Aucun rapport disponible</p>
        <p style={{ fontSize: 13, color: INK3, margin: 0 }}>Scannez votre site depuis l'accueil pour générer votre rapport.</p>
        <button onClick={() => navigate('/app')} style={{ padding: '11px 22px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
          ← Retour à l'accueil
        </button>
      </div>
    );
  }

  const injectionPlan = profile.injection_plan || [];

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>
      {/* Header */}
      <div style={{
        background: WHITE, borderBottom: `1px solid ${BORDER}`,
        padding: '12px 20px', paddingTop: 'max(12px, calc(env(safe-area-inset-top) + 10px))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button
            onClick={() => navigate('/app')}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <ArrowLeft size={14} color={INK2} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>Rapport IA</h1>
            <p style={{ fontSize: 11, color: INK3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.site_url}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/app')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          <RefreshCw size={11} /> Nouvelle analyse
        </button>
      </div>

      <div style={{ maxWidth: 740, margin: '0 auto', padding: '20px 16px 48px' }}>

        {/* 1. LRS Hero */}
        <LRSCard profile={profile} />

        {/* 2. Sub-scores */}
        <SubScoresRow profile={profile} />

        {/* 3. AI Engines breakdown */}
        <Card style={{ marginBottom: 14 }}>
          <SectionLabel>Présence par moteur IA</SectionLabel>
          <AIEnginesChart data={profile} />
        </Card>

        {/* 4. Injection action plan */}
        {injectionPlan.length > 0 && (
          <InjectionPlan plan={injectionPlan} onOpenFix={openFix} />
        )}

        {/* 5. Traffic */}
        <TrafficCard profile={profile} />

        {/* 6. Technical */}
        <TechnicalCard profile={profile} />

        {/* 7. Strengths */}
        <StrengthsCard strengths={profile.strengths} />

        {/* 8. Keywords */}
        <KeywordsCard keywords={profile.top_keywords} />

        {/* 9. Competitors */}
        <CompetitorsCard competitors={profile.competitors} />

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