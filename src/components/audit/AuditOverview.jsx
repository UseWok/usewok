import { useState } from 'react';
import { Check, AlertTriangle, Info, ExternalLink, TrendingUp, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const F = 'Inter, system-ui, sans-serif';
const VIOLET = '#7C3AED';

// ── Small donut gauge ──────────────────────────────────────────────
function DonutGauge({ pct, color = VIOLET, size = 56 }) {
  const data = [{ value: pct }, { value: 100 - pct }];
  const COLORS = [color, '#F1F0EE'];
  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius="62%" outerRadius="85%" startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#1a1a1a' }}>{pct}%</div>
    </div>
  );
}

// ── Card wrapper ────────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 14, padding: 18, ...style }}>{children}</div>;
}

// ── Stacked progress bar ────────────────────────────────────────────
function StackedBar({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex', background: '#F1F0EE' }}>
      {segments.filter(s => s.value > 0).map((seg, i) => (
        <div key={i} style={{ width: `${(seg.value / total) * 100}%`, background: seg.color, transition: 'width 0.6s ease' }} />
      ))}
    </div>
  );
}

// ── Issues table row ────────────────────────────────────────────────
function IssueRow({ label, count, unit = 'pages' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F4F1' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertTriangle size={13} color="#F59E0B" />
        <span style={{ fontSize: 13, color: '#1a1a1a' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, color: '#888' }}>{count} {unit}</span>
        <button style={{ fontSize: 11, fontWeight: 600, color: VIOLET, background: '#F3F0FF', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>Résolution du problème</button>
      </div>
    </div>
  );
}

// ── Thematic widget ────────────────────────────────────────────────
function ThematicWidget({ title, gauge, gaugeColor, text, badge, action, onAction, locked }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#555', letterSpacing: '-0.01em' }}>{title}</span>
        {badge && <span style={{ fontSize: 10, fontWeight: 700, background: '#FEF3C7', color: '#D97706', padding: '2px 7px', borderRadius: 99, border: '1px solid #FDE68A' }}>{badge}</span>}
      </div>
      {gauge != null ? <DonutGauge pct={gauge} color={gaugeColor || VIOLET} size={52} /> : null}
      {text && <p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.5 }}>{text}</p>}
      {locked && <p style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600, margin: 0 }}>⚠ Disponible avec un forfait supérieur</p>}
      {action && (
        <button onClick={onAction} style={{ fontSize: 11, color: VIOLET, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', fontWeight: 600 }}>
          {action} →
        </button>
      )}
    </Card>
  );
}

export default function AuditOverview({ onNavigate }) {
  const [issueTab, setIssueTab] = useState('errors');
  const [robotsOpen, setRobotsOpen] = useState(false);

  const ROBOTS_TXT = `User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: https://wok-co.base44.app/sitemap.xml`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: F }}>

      {/* ── Section 3.1 : Top Grid ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>

        {/* Card 1 : Santé du site */}
        <Card>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Santé du site</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: '#10B981', lineHeight: 1 }}>83%</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981', marginBottom: 4 }}>Bon</span>
          </div>
          <div style={{ height: 4, background: '#F1F0EE', borderRadius: 2, marginBottom: 8 }}>
            <div style={{ width: '83%', height: '100%', background: '#10B981', borderRadius: 2 }} />
          </div>
          <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>Top 10% des sites : <strong style={{ color: '#555' }}>92%</strong></p>
        </Card>

        {/* Card 2 : Pages explorées */}
        <Card>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Pages explorées</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>50</span>
            <span style={{ fontSize: 11, color: '#888' }}>pages de l'exploration</span>
          </div>
          <StackedBar segments={[
            { value: 2, color: '#10B981' },
            { value: 0, color: '#EF4444' },
            { value: 47, color: '#F59E0B' },
            { value: 1, color: '#6B7280' },
          ]} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 8 }}>
            {[
              { label: 'Saines', count: 2, color: '#10B981' },
              { label: 'Rompues', count: 0, color: '#EF4444' },
              { label: 'Redirects', count: 47, color: '#F59E0B' },
              { label: 'Bloquées', count: 1, color: '#6B7280' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                <span style={{ fontSize: 11, color: '#555' }}>{s.label} : <strong>{s.count}</strong></span>
              </div>
            ))}
          </div>
        </Card>

        {/* Card 3 : Santé de la recherche IA */}
        <Card>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Santé de la recherche IA</p>
          <span style={{ fontSize: 36, fontWeight: 900, color: '#10B981', lineHeight: 1, display: 'block', marginBottom: 8 }}>100%</span>
          <p style={{ fontSize: 12, color: '#555', margin: '0 0 8px', lineHeight: 1.5 }}>Prêt pour l'IA. Le site Web est optimisé pour les moteurs de recherche d'IA.</p>
          <button style={{ fontSize: 11, color: VIOLET, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>Comment ça marche →</button>
        </Card>

        {/* Card 4 : Robots d'IA bloqués */}
        <Card>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Robots d'IA bloqués : <span style={{ color: '#10B981' }}>–</span></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {[
              'ChatGPT-User',
              'OAI-SearchBot',
              'Google-Extended',
              'Claude-bot',
            ].map(bot => (
              <div key={bot} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={10} color="#10B981" />
                  </div>
                  <span style={{ fontSize: 12, color: '#1a1a1a' }}>{bot}</span>
                </div>
                <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>En ordre</span>
              </div>
            ))}
          </div>
          <button style={{ fontSize: 11, fontWeight: 600, color: VIOLET, background: '#F3F0FF', border: 'none', borderRadius: 7, padding: '7px 12px', cursor: 'pointer', width: '100%' }}>
            Comment débloquer les pages
          </button>
        </Card>
      </div>

      {/* ── Section 3.2 : Issues ───────────────────────────────────── */}
      <Card>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F0F10', margin: '0 0 14px' }}>Problèmes détectés</p>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid #F1F0EE', paddingBottom: 10 }}>
          {[
            { id: 'errors', label: 'Erreurs', count: 81, color: '#EF4444' },
            { id: 'warnings', label: 'Avertissements', count: 95, color: '#F59E0B' },
            { id: 'notices', label: 'Avis', count: 1, color: '#3B82F6' },
          ].map(t => (
            <button key={t.id} onClick={() => setIssueTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: F,
                background: issueTab === t.id ? '#1a1a1a' : '#F5F4F1',
                color: issueTab === t.id ? '#fff' : '#555',
                fontSize: 12, fontWeight: 600, transition: 'all 150ms',
              }}>
              {t.label}
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                background: issueTab === t.id ? t.color : `${t.color}20`,
                color: issueTab === t.id ? '#fff' : t.color,
              }}>{t.count}</span>
            </button>
          ))}
        </div>

        {issueTab === 'errors' && (
          <div>
            <IssueRow label="Contenu en double" count={17} />
            <IssueRow label="Balises de titre en double" count={17} />
            <IssueRow label="Descriptions Meta en double" count={46} />
            <IssueRow label="Erreurs 4xx" count={1} unit="page" />
            <IssueRow label="Taille totale des fichiers JavaScript et CSS trop grande" count={47} />
            <div style={{ paddingTop: 14, textAlign: 'right' }}>
              <button style={{ fontSize: 12, fontWeight: 600, color: VIOLET, background: 'none', border: 'none', cursor: 'pointer' }}>Afficher tous les problèmes →</button>
            </div>
          </div>
        )}
        {issueTab === 'warnings' && (
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>95 avertissements détectés. Utilisez l'onglet "Problèmes" pour les consulter en détail.</p>
        )}
        {issueTab === 'notices' && (
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>1 avis informatif détecté.</p>
        )}
      </Card>

      {/* ── Section 3.3 : Thematic Grid ───────────────────────────── */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F0F10', margin: '0 0 12px' }}>Rapports thématiques</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>

          {/* Robots.txt */}
          <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>Robots.txt</span>
            <span style={{ fontSize: 11, background: '#F1F0EE', color: '#555', padding: '2px 8px', borderRadius: 99, width: 'fit-content', fontWeight: 600 }}>Inchangé</span>
            <button onClick={() => setRobotsOpen(true)} style={{ fontSize: 11, fontWeight: 600, color: VIOLET, background: '#F3F0FF', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer' }}>
              Ouvrir le fichier
            </button>
          </Card>

          <ThematicWidget title="Explorabilité" gauge={92} gaugeColor="#7C3AED" action="Voir les détails" onAction={() => onNavigate('crawlability')} />
          <ThematicWidget title="HTTPS" gauge={100} gaugeColor="#10B981" action="Voir les détails" />
          <ThematicWidget title="SEO international" text="Le site Web n'est pas international ou ne présente pas d'erreurs hreflang" action="Voir les détails" />
          <ThematicWidget title="Core Web Vitals" locked badge="Pro" action="Afficher plus" />
          <ThematicWidget title="Liens internes" gauge={100} gaugeColor="#3B82F6" action="Voir les détails" />
          <ThematicWidget title="Balisage" gauge={100} gaugeColor="#8B5CF6" action="Voir les détails" />
          <ThematicWidget title="Performances" gauge={94} gaugeColor="#F59E0B" action="Voir les détails" onAction={() => onNavigate('performance')} />
        </div>
      </div>

      {/* ── Section 3.4 : Upsell + Market Trends ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Upsell */}
        <Card style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: 'none', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>You're only seeing part of the picture</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '0 0 14px', lineHeight: 1.55 }}>
              Audit more pages and fix how your site appears to both Google and AI tools like ChatGPT... Upgrade to Starter and access all features.
            </p>
            <button style={{ padding: '9px 18px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Get free trial
            </button>
          </div>
          {/* Placeholder illustration */}
          <div style={{ width: 80, height: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
            <svg viewBox="0 0 80 80" fill="none" width="80" height="80">
              <circle cx="40" cy="40" r="30" stroke="#7C3AED" strokeWidth="2" strokeDasharray="4 3" />
              <circle cx="40" cy="40" r="18" fill="#7C3AED" opacity="0.2" />
              <path d="M25 55 Q40 20 55 55" stroke="#A78BFA" strokeWidth="2" fill="none" />
              <circle cx="25" cy="55" r="4" fill="#A78BFA" />
              <circle cx="55" cy="55" r="4" fill="#A78BFA" />
              <circle cx="40" cy="32" r="4" fill="#C4B5FD" />
            </svg>
          </div>
        </Card>

        {/* Market trends */}
        <Card>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F0F10', margin: '0 0 4px' }}>Tendances du marché et de la concurrence</p>
          <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 14px', fontWeight: 600 }}>Activité Moteur de recherche</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Trafic direct', value: '120', sub: null },
              { label: 'Recherche organique', value: '502', sub: '81%' },
              { label: 'Recherche payante', value: '0.00', sub: null },
              { label: 'Autre trafic', value: '31', sub: '5%' },
              { label: 'Réseaux sociaux', value: '4.8k', sub: '14%' },
            ].map((m, i) => (
              <div key={i} style={{ background: '#F8F7F4', borderRadius: 8, padding: '9px 11px' }}>
                <p style={{ fontSize: 10, color: '#aaa', fontWeight: 600, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>{m.value}</span>
                  {m.sub && <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>{m.sub}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Robots.txt modal */}
      {robotsOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setRobotsOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a2e', borderRadius: 14, width: '100%', maxWidth: 560, maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>robots.txt</span>
              <button onClick={() => setRobotsOpen(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <pre style={{ margin: 0, padding: '18px', fontSize: 12, color: '#A78BFA', fontFamily: 'monospace', lineHeight: 1.7, overflowY: 'auto' }}>{ROBOTS_TXT}</pre>
          </div>
        </div>
      )}
    </div>
  );
}