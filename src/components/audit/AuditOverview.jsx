import { useState } from 'react';
import { Check, ChevronRight, X, AlertCircle, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const F = 'Inter, system-ui, sans-serif';

// ── Design tokens — monochrome + single accent ──────────────────────
const INK    = '#111111';
const INK2   = '#555555';
const INK3   = '#999999';
const BORDER = '#E8E7E4';
const SURFACE= '#F7F6F3';
const WHITE  = '#FFFFFF';
const ACCENT = '#1a1a1a'; // buttons
const OK     = '#22C55E'; // only for "ok" states — muted usage

// ── Primitives ──────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '18px 20px', fontFamily: F, ...style }}>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>{children}</p>;
}

function Btn({ children, onClick, variant = 'ghost' }) {
  const styles = {
    ghost:   { background: 'none', border: 'none', color: INK2, fontSize: 12, fontWeight: 600, padding: 0 },
    outline: { background: 'none', border: `1px solid ${BORDER}`, color: INK, fontSize: 12, fontWeight: 600, borderRadius: 7, padding: '7px 14px' },
    solid:   { background: INK, border: 'none', color: WHITE, fontSize: 12, fontWeight: 700, borderRadius: 8, padding: '9px 18px' },
  };
  return (
    <button onClick={onClick} style={{ cursor: 'pointer', fontFamily: F, display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'opacity 120ms', ...styles[variant] }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
      {children}
    </button>
  );
}

// ── Mini donut (SVG, no recharts overhead for small sizes) ──────────
function MiniDonut({ pct, size = 52 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={SURFACE} strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={INK} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.min(pct, 100) / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.9s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: INK }}>{pct}%</div>
    </div>
  );
}

// ── Stacked bar — monochrome segments ──────────────────────────────
function StackedBar({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const SHADES = ['#1a1a1a', '#666', '#aaa', '#ddd'];
  return (
    <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', background: SURFACE }}>
      {segments.map((seg, i) => seg.value > 0 && (
        <div key={i} style={{ width: `${(seg.value / total) * 100}%`, background: SHADES[i], transition: 'width 0.6s ease' }} />
      ))}
    </div>
  );
}

// ── Issue row ───────────────────────────────────────────────────────
function IssueRow({ label, count, unit = 'pages', onFix }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: INK, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: INK, flex: 1 }}>{label}</span>
      <span style={{ fontSize: 12, color: INK3, flexShrink: 0 }}>{count} {unit}</span>
      <Btn variant="outline" onClick={onFix}>Corriger</Btn>
    </div>
  );
}

// ── Thematic widget ─────────────────────────────────────────────────
function ThematicWidget({ title, gauge, text, locked, action, onAction }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 110 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>{title}</span>
        {locked && <span style={{ fontSize: 9, fontWeight: 700, color: INK3, background: SURFACE, border: `1px solid ${BORDER}`, padding: '2px 7px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pro</span>}
      </div>
      {gauge != null && <MiniDonut pct={gauge} size={50} />}
      {text && <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.55 }}>{text}</p>}
      {locked && <p style={{ fontSize: 11, color: INK3, margin: 0 }}>Disponible avec un forfait supérieur</p>}
      {action && <Btn variant="ghost" onClick={onAction}>{action} <ChevronRight size={12} /></Btn>}
    </Card>
  );
}

// ── Fix drawer (replaces fake modal) ───────────────────────────────
function FixDrawer({ issue, onClose }) {
  if (!issue) return null;
  const steps = {
    'Contenu en double': ['Identifiez les pages dupliquées via Google Search Console', 'Ajoutez une balise canonical sur chaque doublon pointant vers la page source', 'Ou utilisez une redirection 301 si les pages doivent être fusionnées'],
    'Balises de titre en double': ['Auditez toutes les balises <title> de vos pages', 'Rédigez un titre unique par page (50-60 caractères)', 'Utilisez les variables de template CMS pour automatiser'],
    'Descriptions Meta en double': ['Chaque page doit avoir une meta description unique (150-160 car.)', 'Évitez les descriptions génériques ou vides', 'Concentrez le mot-clé principal dans les 50 premiers caractères'],
    'Erreurs 4xx': ['Vérifiez l\'URL retournant 404 dans les logs serveur', 'Redirigez vers la page la plus pertinente avec un 301', 'Ou restaurez le contenu si la page doit exister'],
    'Taille totale des fichiers JavaScript et CSS trop grande': ['Activez la minification JS/CSS dans votre bundler', 'Activez la compression gzip/brotli côté serveur', 'Lazy-loadez les scripts non critiques au chargement initial'],
  };
  const list = steps[issue] || ['Analysez la cause racine', 'Appliquez les correctifs recommandés', 'Relancez l\'audit pour vérifier'];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1 }} />
      <div onClick={e => e.stopPropagation()} style={{ width: 360, background: WHITE, borderLeft: `1px solid ${BORDER}`, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>Comment corriger</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0, lineHeight: 1.4 }}>{issue}</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={13} color={INK2} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {list.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: INK, color: WHITE, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.55 }}>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function AuditOverview({ onNavigate }) {
  const [issueTab, setIssueTab] = useState('errors');
  const [robotsOpen, setRobotsOpen] = useState(false);
  const [fixIssue, setFixIssue] = useState(null);
  const [aiInfoOpen, setAiInfoOpen] = useState(false);

  const ROBOTS_TXT = `User-agent: *\nDisallow: /admin/\nDisallow: /api/\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nSitemap: https://wok-co.base44.app/sitemap.xml`;

  const ISSUES = [
    { label: 'Contenu en double', count: 17 },
    { label: 'Balises de titre en double', count: 17 },
    { label: 'Descriptions Meta en double', count: 46 },
    { label: 'Erreurs 4xx', count: 1, unit: 'page' },
    { label: 'Taille totale des fichiers JavaScript et CSS trop grande', count: 47 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: F }}>

      {/* ── 4 KPI cards ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>

        {/* Santé du site */}
        <Card>
          <Label>Santé du site</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: INK, letterSpacing: '-0.04em', lineHeight: 1 }}>83%</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: INK3, paddingBottom: 2 }}>Bon</span>
          </div>
          <div style={{ height: 3, background: SURFACE, borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
            <div style={{ width: '83%', height: '100%', background: INK, borderRadius: 2 }} />
          </div>
          <p style={{ fontSize: 11, color: INK3, margin: 0 }}>Top 10% des sites : <span style={{ color: INK2, fontWeight: 600 }}>92%</span></p>
        </Card>

        {/* Pages explorées */}
        <Card>
          <Label>Pages explorées</Label>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: INK, letterSpacing: '-0.04em', lineHeight: 1 }}>50</span>
            <span style={{ fontSize: 11, color: INK3 }}>pages</span>
          </div>
          <StackedBar segments={[{ value: 2 }, { value: 47 }, { value: 1 }, { value: 0 }]} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 16px', marginTop: 10 }}>
            {[['Saines', 2], ['Redirects', 47], ['Bloquées', 1], ['Rompues', 0]].map(([l, c]) => (
              <span key={l} style={{ fontSize: 11, color: INK3 }}>{l} <strong style={{ color: INK }}>{c}</strong></span>
            ))}
          </div>
        </Card>

        {/* Santé IA */}
        <Card>
          <Label>Santé de la recherche IA</Label>
          <span style={{ fontSize: 40, fontWeight: 900, color: INK, letterSpacing: '-0.04em', lineHeight: 1, display: 'block', marginBottom: 10 }}>100%</span>
          <p style={{ fontSize: 12, color: INK2, margin: '0 0 12px', lineHeight: 1.55 }}>Prêt pour l'IA. Optimisé pour les moteurs de recherche d'IA.</p>
          <Btn variant="ghost" onClick={() => setAiInfoOpen(true)}>Comment ça marche <ChevronRight size={12} /></Btn>
        </Card>

        {/* Robots IA */}
        <Card>
          <Label>Robots d'IA bloqués</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {['ChatGPT-User', 'OAI-SearchBot', 'Google-Extended', 'Claude-bot'].map(bot => (
              <div key={bot} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={12} color={INK} />
                  <span style={{ fontSize: 12, color: INK }}>{bot}</span>
                </div>
                <span style={{ fontSize: 11, color: INK3 }}>En ordre</span>
              </div>
            ))}
          </div>
          <Btn variant="outline" onClick={() => setRobotsOpen(true)}>Voir robots.txt</Btn>
        </Card>
      </div>

      {/* ── Issues panel ─────────────────────────────────────────────── */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>Problèmes détectés</p>
          <div style={{ display: 'flex', gap: 2, background: SURFACE, borderRadius: 8, padding: 3 }}>
            {[{ id: 'errors', label: 'Erreurs', count: 81 }, { id: 'warnings', label: 'Avertissements', count: 95 }, { id: 'notices', label: 'Avis', count: 1 }].map(t => (
              <button key={t.id} onClick={() => setIssueTab(t.id)}
                style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: issueTab === t.id ? 600 : 400, background: issueTab === t.id ? WHITE : 'transparent', color: issueTab === t.id ? INK : INK3, boxShadow: issueTab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 150ms', whiteSpace: 'nowrap' }}>
                {t.label} <span style={{ opacity: 0.5 }}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
        {issueTab === 'errors' && (
          <div>
            {ISSUES.map(issue => (
              <IssueRow key={issue.label} label={issue.label} count={issue.count} unit={issue.unit} onFix={() => setFixIssue(issue.label)} />
            ))}
            <div style={{ paddingTop: 14 }}>
              <Btn variant="ghost" onClick={() => onNavigate('issues')}>Afficher tous les problèmes <ChevronRight size={12} /></Btn>
            </div>
          </div>
        )}
        {issueTab === 'warnings' && (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: INK2, margin: '0 0 12px' }}>95 avertissements détectés.</p>
            <Btn variant="outline" onClick={() => onNavigate('issues')}>Voir tous les avertissements</Btn>
          </div>
        )}
        {issueTab === 'notices' && (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: INK2, margin: '0 0 12px' }}>1 avis informatif détecté.</p>
            <Btn variant="outline" onClick={() => onNavigate('issues')}>Voir l'avis</Btn>
          </div>
        )}
      </Card>

      {/* ── Thematic reports ─────────────────────────────────────────── */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Rapports thématiques</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
          {/* Robots.txt */}
          <Card style={{ gap: 10, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>Robots.txt</span>
            <span style={{ fontSize: 11, color: INK3, fontWeight: 500 }}>Inchangé</span>
            <Btn variant="outline" onClick={() => setRobotsOpen(true)}>Ouvrir le fichier</Btn>
          </Card>
          <ThematicWidget title="Explorabilité" gauge={92} action="Voir les détails" onAction={() => onNavigate('crawlability')} />
          <ThematicWidget title="HTTPS" gauge={100} action="Voir les détails" />
          <ThematicWidget title="SEO international" text="Site non international — aucune erreur hreflang" action="Voir les détails" />
          <ThematicWidget title="Core Web Vitals" locked action="Débloquer" onAction={() => onNavigate && window.location.assign('/pricing')} />
          <ThematicWidget title="Liens internes" gauge={100} action="Voir les détails" />
          <ThematicWidget title="Balisage" gauge={100} action="Voir les détails" />
          <ThematicWidget title="Performances" gauge={94} action="Voir les détails" onAction={() => onNavigate('performance')} />
        </div>
      </div>

      {/* ── Bottom: upsell + trends ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Upsell — dark, minimal */}
        <Card style={{ background: INK, border: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: WHITE, margin: 0, lineHeight: 1.3 }}>Vous ne voyez qu'une partie du tableau.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
            Auditez plus de pages et corrigez comment votre site apparaît sur Google et les outils IA comme ChatGPT.
          </p>
          <button
            onClick={() => window.location.assign('/pricing')}
            style={{ padding: '10px 18px', background: WHITE, color: INK, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F, alignSelf: 'flex-start', transition: 'opacity 120ms' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Essai gratuit →
          </button>
        </Card>

        {/* Market trends */}
        <Card>
          <p style={{ fontSize: 12, fontWeight: 600, color: INK, margin: '0 0 4px' }}>Tendances du marché</p>
          <p style={{ fontSize: 11, color: INK3, margin: '0 0 16px' }}>Activité moteur de recherche</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              ['Trafic direct', '120', null],
              ['Recherche organique', '502', '81%'],
              ['Recherche payante', '0', null],
              ['Autre trafic', '31', '5%'],
              ['Réseaux sociaux', '4.8k', '14%'],
            ].map(([label, value, pct], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none' }}>
                <span style={{ fontSize: 12, color: INK2 }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{value}</span>
                  {pct && <span style={{ fontSize: 11, color: INK3 }}>{pct}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Robots.txt modal ─────────────────────────────────────────── */}
      {robotsOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setRobotsOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0F0F0F', borderRadius: 14, width: '100%', maxWidth: 520, maxHeight: '60vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #333' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa', fontFamily: 'monospace' }}>robots.txt — wok-co.base44.app</span>
              <button onClick={() => setRobotsOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <pre style={{ margin: 0, padding: '20px 18px', fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace', lineHeight: 1.8, overflowY: 'auto' }}>{ROBOTS_TXT}</pre>
          </div>
        </div>
      )}

      {/* ── AI info modal ─────────────────────────────────────────────── */}
      {aiInfoOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setAiInfoOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 14, width: '100%', maxWidth: 400, padding: '28px 28px', border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 12px' }}>Santé de la recherche IA</p>
            <p style={{ fontSize: 13, color: INK2, lineHeight: 1.65, margin: '0 0 16px' }}>
              Ce score évalue si les robots d'exploration IA (ChatGPT, Perplexity, Google AI…) peuvent accéder et indexer librement votre contenu. Un score de 100% signifie qu'aucun robot IA n'est bloqué dans votre robots.txt.
            </p>
            <Btn variant="solid" onClick={() => setAiInfoOpen(false)}>Compris</Btn>
          </div>
        </div>
      )}

      {/* ── Fix drawer ───────────────────────────────────────────────── */}
      <FixDrawer issue={fixIssue} onClose={() => setFixIssue(null)} />
    </div>
  );
}