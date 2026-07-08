import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ChevronRight } from 'lucide-react';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const CREAM = '#FBF8F2';
const CREAM_2 = '#F3EEE3';
const INK = '#15130F';
const INK_SOFT = '#4A453B';
const INK_FAINT = 'rgba(21,19,15,0.5)';
const ORANGE = '#FF5A1F';
const ORANGE_DEEP = '#C43E14';
const ORANGE_PALE = '#FFE7D6';
const GREEN = '#1E7A4C';
const LINE = 'rgba(21,19,15,0.09)';
const LINE_STRONG = 'rgba(21,19,15,0.14)';
const WHITE = '#FFFFFF';

const SEV_LABELS = { error: 'Errors', warning: 'Warnings', notice: 'Notices' };

function ringOffset(pct, r = 30) {
  const circ = 2 * Math.PI * r;
  return circ * (1 - Math.min(pct || 0, 100) / 100);
}

function Ring({ pct, size = 64, stroke = 6, color = INK, label }) {
  const r = (size - stroke * 2) / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto 14px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={CREAM_2} strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          initial={{ strokeDasharray: 2 * Math.PI * r, strokeDashoffset: 2 * Math.PI * r }}
          animate={{ strokeDashoffset: ringOffset(pct, r) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 700, color: INK }}>
        {label ?? `${Math.round(pct || 0)}%`}
      </div>
    </div>
  );
}

function FixDrawer({ issue, onClose }) {
  if (!issue) return null;
  const steps = issue.fix_steps || [];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1 }} />
      <div onClick={e => e.stopPropagation()} style={{ width: 380, background: WHITE, borderLeft: `1px solid ${LINE_STRONG}`, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.08)', fontFamily: F }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: INK_FAINT, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>How to fix</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0, lineHeight: 1.4 }}>{issue.title}</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${LINE_STRONG}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={13} color={INK_SOFT} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {issue.description && <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.6, margin: '0 0 20px' }}>{issue.description}</p>}
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {steps.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: INK, color: WHITE, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <p style={{ fontSize: 13, color: INK_SOFT, margin: 0, lineHeight: 1.55 }}>{step}</p>
              </li>
            ))}
            {steps.length === 0 && <p style={{ fontSize: 13, color: INK_FAINT, margin: 0 }}>No fix steps available for this issue.</p>}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function AuditOverview({ data = {}, onNavigate }) {
  const [issueTab, setIssueTab] = useState('notice');
  const [robotsOpen, setRobotsOpen] = useState(false);
  const [fixIssue, setFixIssue] = useState(null);
  const [aiInfoOpen, setAiInfoOpen] = useState(false);

  const issues = data.issues || [];
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const notices = issues.filter(i => i.severity === 'notice');
  const displayIssues = issueTab === 'errors' ? errors : issueTab === 'warnings' ? warnings : notices;

  const allowedBots = data.ai_bots_allowed?.length ? data.ai_bots_allowed : ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'Google-Extended', 'ClaudeBot'];
  const blockedBots = data.ai_bots_blocked || [];

  return (
    <div style={{ fontFamily: F, background: CREAM, padding: '28px 40px 60px' }}>
      <style>{`
        .uw-audit-overview *{box-sizing:border-box;}
        @media (max-width:1100px){
          .uw-audit-overview .stat-row{grid-template-columns:1fr 1fr !important;}
          .uw-audit-overview .reports-grid,.uw-audit-overview .reports-grid.row2{grid-template-columns:repeat(2,1fr) !important;}
          .uw-audit-overview .bottom-row{grid-template-columns:1fr !important;}
        }
        @media (max-width:640px){
          .uw-audit-overview{padding:20px 16px 40px !important;}
          .uw-audit-overview .stat-row{grid-template-columns:1fr !important;}
          .uw-audit-overview .reports-grid,.uw-audit-overview .reports-grid.row2{grid-template-columns:1fr !important;}
        }
      `}</style>

      <div className="uw-audit-overview" style={{ maxWidth: 1240, margin: '0 auto' }}>

        {/* ── TOP STAT CARDS ── */}
        <div className="stat-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.15fr', gap: 16, marginBottom: 16 }}>

          {/* Site health */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: 14 }}>Site health</div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 14 }}>
              {data.site_health_score ?? '—'}<span className="unit" style={{ fontSize: 16, fontWeight: 600, color: INK_FAINT }}>%</span>
            </div>
            <div style={{ height: 6, borderRadius: 100, background: CREAM_2, overflow: 'hidden', marginBottom: 12 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${data.site_health_score || 0}%` }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: '100%', borderRadius: 100, background: ORANGE }} />
            </div>
            <div style={{ fontSize: 12.5, color: INK_FAINT }}>{issues.length} problème{issues.length !== 1 ? 's' : ''} détecté{issues.length !== 1 ? 's' : ''}</div>
          </div>

          {/* Pages analyzed */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: 14 }}>Pages analysées</div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 14 }}>
              {data.pages_crawled ?? '—'}<span style={{ fontSize: 16, fontWeight: 600, color: INK_FAINT }}>pages</span>
            </div>
            <div style={{ height: 6, borderRadius: 100, background: CREAM_2, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', width: '100%', borderRadius: 100, background: INK }} />
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: INK_FAINT, flexWrap: 'wrap' }}>
              <span>Saines <b style={{ color: INK, fontWeight: 700 }}>{data.pages_healthy ?? 0}</b></span>
              <span>Redirections <b style={{ color: INK, fontWeight: 700 }}>{data.pages_redirects ?? 0}</b></span>
              <span>Bloquées <b style={{ color: INK, fontWeight: 700 }}>{data.pages_blocked ?? 0}</b></span>
              <span>Cassées <b style={{ color: INK, fontWeight: 700 }}>{data.pages_broken ?? 0}</b></span>
            </div>
          </div>

          {/* AI search health */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: 14 }}>Santé recherche IA</div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>
              {data.ai_readiness_score ?? '—'}<span style={{ fontSize: 16, fontWeight: 600, color: INK_FAINT }}>%</span>
            </div>
            <p style={{ fontSize: 12.5, color: INK_SOFT, lineHeight: 1.5, marginBottom: 12 }}>
              {blockedBots.length > 0
                ? `${blockedBots.length} bot(s) IA bloqué(s) dans robots.txt.`
                : 'Aucun bot IA bloqué. Votre site est accessible aux moteurs IA.'}
            </p>
            <button onClick={() => setAiInfoOpen(true)} style={{ fontSize: 12.5, fontWeight: 600, color: INK, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', background: 'none', border: 'none', fontFamily: F, padding: 0 }}>
              Comment ça marche <ChevronRight size={13} />
            </button>
          </div>

          {/* Blocked AI bots */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: 14 }}>Bots IA bloqués : {blockedBots.length}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
              {allowedBots.slice(0, 5).map(bot => (
                <div key={bot} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: INK, fontWeight: 500 }}>
                    <Check size={13} color={GREEN} style={{ flexShrink: 0 }} />{bot}
                  </span>
                  <span style={{ color: INK_FAINT, fontSize: 11.5 }}>Autorisé</span>
                </div>
              ))}
              {blockedBots.map(bot => (
                <div key={bot} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: INK, fontWeight: 500 }}>
                    <X size={13} color={ORANGE} style={{ flexShrink: 0 }} />{bot}
                  </span>
                  <span style={{ color: ORANGE_DEEP, fontSize: 11.5 }}>Bloqué</span>
                </div>
              ))}
            </div>
            {data.has_robots_txt && (
              <button onClick={() => setRobotsOpen(true)} style={{ width: '100%', height: 38, borderRadius: 9, border: `1px solid ${LINE_STRONG}`, background: WHITE, fontFamily: F, fontSize: 12.5, fontWeight: 600, color: INK, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = INK} onMouseLeave={e => e.currentTarget.style.borderColor = LINE_STRONG}>
                Voir robots.txt
              </button>
            )}
          </div>
        </div>

        {/* ── DETECTED ISSUES ── */}
        <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 16, padding: '24px 28px', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 700, color: INK, margin: 0 }}>Problèmes détectés</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {[{ id: 'errors', label: 'Erreurs', count: errors.length }, { id: 'warnings', label: 'Avertissements', count: warnings.length }, { id: 'notice', label: 'Notices', count: notices.length }].map(t => (
                <button key={t.id} onClick={() => setIssueTab(t.id)}
                  style={{ padding: '7px 13px', fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer', fontFamily: F, border: 'none',
                    background: issueTab === t.id ? INK : CREAM_2, color: issueTab === t.id ? CREAM : INK_FAINT, transition: 'all 150ms' }}>
                  {t.label} {t.count}
                </button>
              ))}
            </div>
          </div>
          {displayIssues.length === 0 ? (
            <p style={{ fontSize: 13, color: INK_FAINT, textAlign: 'center', padding: '24px 0' }}>Aucun problème dans cette catégorie. 🎉</p>
          ) : (
            displayIssues.slice(0, 5).map((issue, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: i === 0 ? 'none' : `1px solid ${LINE}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: issue.severity === 'error' ? ORANGE : issue.severity === 'warning' ? ORANGE : INK_FAINT, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: INK }}>{issue.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {issue.count > 0 && <span style={{ fontSize: 12.5, color: INK_FAINT }}>{issue.count} pages</span>}
                  <button onClick={() => setFixIssue(issue)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: INK, color: CREAM, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
                    onMouseEnter={e => e.currentTarget.style.background = ORANGE_DEEP} onMouseLeave={e => e.currentTarget.style.background = INK}>
                    Corriger
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── THEMATIC REPORTS ── */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: INK_FAINT, marginBottom: 16 }}>Rapports thématiques</div>

        {/* Row 1 — 5 cards */}
        <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 14 }}>

          {/* Robots.txt */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>Robots.txt</h4>
            </div>
            <div style={{ fontSize: 12.5, color: INK_FAINT, marginBottom: 12 }}>{data.has_robots_txt ? 'Trouvé' : 'Non trouvé'}</div>
            {data.has_robots_txt ? (
              <button onClick={() => setRobotsOpen(true)} style={{ width: '100%', padding: 9, borderRadius: 8, border: `1px solid ${LINE_STRONG}`, background: WHITE, fontSize: 12, fontWeight: 600, color: INK, textAlign: 'left', cursor: 'pointer', fontFamily: F, marginTop: 'auto' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = INK} onMouseLeave={e => e.currentTarget.style.borderColor = LINE_STRONG}>
                Ouvrir le fichier
              </button>
            ) : (
              <p style={{ fontSize: 12, color: INK_FAINT, marginTop: 'auto' }}>Aucun fichier robots.txt détecté.</p>
            )}
          </div>

          {/* Crawlability */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>Crawlabilité</h4>
            </div>
            <Ring pct={data.crawlability_score} color={ORANGE} />
            <button onClick={() => onNavigate('crawlability')} style={{ fontSize: 12, fontWeight: 600, color: INK, display: 'flex', alignItems: 'center', gap: 3, marginTop: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, padding: 0 }}>
              Voir le détail <ChevronRight size={13} />
            </button>
          </div>

          {/* HTTPS */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>HTTPS</h4>
            </div>
            <Ring pct={data.has_ssl ? 100 : 0} />
            <p style={{ fontSize: 12.5, color: INK_SOFT, lineHeight: 1.5, marginTop: 'auto' }}>{data.has_ssl ? 'Certificat SSL valide.' : 'Aucun certificat SSL.'}</p>
          </div>

          {/* Schema Markup */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>Balisage Schema</h4>
            </div>
            <p style={{ fontSize: 12.5, color: INK_SOFT, lineHeight: 1.5, marginTop: 24 }}>{data.has_schema ? 'Balisage Schema détecté.' : 'Aucun balisage Schema détecté. Les IA ne comprennent pas bien votre contenu.'}</p>
          </div>

          {/* Core Web Vitals — PRO */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>Core Web Vitals</h4>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: ORANGE_DEEP, background: ORANGE_PALE, padding: '2px 7px', borderRadius: 100 }}>PRO</span>
            </div>
            <p style={{ fontSize: 12, color: INK_FAINT, fontStyle: 'italic', marginTop: 24 }}>Disponible avec un plan supérieur</p>
          </div>
        </div>

        {/* Row 2 — 3 cards */}
        <div className="reports-grid row2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>

          {/* Internal links */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>Liens internes</h4>
            </div>
            <Ring pct={data.has_canonical ? 100 : 70} />
            <button onClick={() => onNavigate('crawlability')} style={{ fontSize: 12, fontWeight: 600, color: INK, display: 'flex', alignItems: 'center', gap: 3, marginTop: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, padding: 0 }}>
              Voir le détail <ChevronRight size={13} />
            </button>
          </div>

          {/* Open Graph */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>Open Graph</h4>
            </div>
            <Ring pct={data.has_og_tags ? 100 : 0} color={ORANGE} />
            <p style={{ fontSize: 12.5, color: INK_SOFT, lineHeight: 1.5, marginTop: 'auto' }}>{data.has_og_tags ? 'Balises OG présentes.' : 'Balises OG manquantes.'}</p>
          </div>

          {/* Performance */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: 0 }}>Performance</h4>
            </div>
            <Ring pct={data.performance_score} />
            <button onClick={() => onNavigate('performance')} style={{ fontSize: 12, fontWeight: 600, color: INK, display: 'flex', alignItems: 'center', gap: 3, marginTop: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, padding: 0 }}>
              Voir le détail <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="bottom-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 16 }}>

          {/* CTA dark */}
          <div style={{ background: INK, borderRadius: 18, padding: 32, color: CREAM, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 90% at 90% 10%, rgba(255,90,31,0.25) 0%, transparent 60%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: 19, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em', color: CREAM }}>Vous ne voyez qu'une partie du tableau.</h3>
              <p style={{ fontSize: 13, color: 'rgba(251,248,242,0.65)', lineHeight: 1.55, marginBottom: 22, maxWidth: 340 }}>
                Analysez plus de pages et corrigez votre visibilité sur Google et les outils IA comme ChatGPT.
              </p>
              <button onClick={() => window.location.assign('/pricing')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 20px', borderRadius: 100, border: 'none', background: ORANGE, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F, width: 'fit-content' }}
                onMouseEnter={e => e.currentTarget.style.background = ORANGE_DEEP} onMouseLeave={e => e.currentTarget.style.background = ORANGE}>
                Essai gratuit →
              </button>
            </div>
          </div>

          {/* Market trends */}
          <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 18, padding: '28px 30px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: INK, marginBottom: 2 }}>Tendances du marché</h3>
            <p style={{ fontSize: 12, color: INK_FAINT, marginBottom: 20 }}>Sources de trafic estimées</p>
            {data.market_traffic ? (
              [
                ['Trafic direct', data.market_traffic.direct, null],
                ['Recherche organique', data.market_traffic.organic, data.market_traffic.organic_pct],
                ['Recherche payante', data.market_traffic.paid, null],
                ['Réseaux sociaux', data.market_traffic.social, data.market_traffic.social_pct],
                ['Autre trafic', data.market_traffic.other, data.market_traffic.other_pct],
              ].map(([label, value, pct], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: i === 0 ? 'none' : `1px solid ${LINE}`, fontSize: 13.5 }}>
                  <span style={{ color: INK_SOFT, fontWeight: 500 }}>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: INK }}>{value ?? '—'}</span>
                    {pct && <span style={{ fontSize: 11.5, color: INK_FAINT, width: 38, textAlign: 'right' }}>{pct}</span>}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 12, color: INK_FAINT }}>Données non disponibles</p>
            )}
          </div>
        </div>

      </div>

      {/* Robots.txt modal */}
      {robotsOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setRobotsOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0F0F0F', borderRadius: 14, width: '100%', maxWidth: 520, maxHeight: '60vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #333' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa', fontFamily: 'monospace' }}>robots.txt — {data.domain || ''}</span>
              <button onClick={() => setRobotsOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <pre style={{ margin: 0, padding: '20px 18px', fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace', lineHeight: 1.8, overflowY: 'auto' }}>{data.robots_txt_content || '# robots.txt vide ou introuvable'}</pre>
          </div>
        </div>
      )}

      {/* AI info modal */}
      {aiInfoOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setAiInfoOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 14, width: '100%', maxWidth: 400, padding: 28, border: `1px solid ${LINE_STRONG}` }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 12px' }}>Santé recherche IA</p>
            <p style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.65, margin: '0 0 16px' }}>
              Ce score évalue si les crawlers IA (ChatGPT, Perplexity, Google AI…) peuvent accéder librement à votre contenu et l'indexer. Un score de 100% signifie qu'aucun bot IA n'est bloqué dans votre robots.txt et que votre site est bien structuré pour les moteurs IA.
            </p>
            <button onClick={() => setAiInfoOpen(false)} style={{ padding: '9px 18px', background: INK, color: WHITE, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              Compris
            </button>
          </div>
        </div>
      )}

      <FixDrawer issue={fixIssue} onClose={() => setFixIssue(null)} />
    </div>
  );
}