import { useState } from 'react';
import { Check, ExternalLink, AlertTriangle, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const VIOLET = '#7C3AED';

function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 14, padding: '16px', marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

function SLabel({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>{children}</p>;
}

function DonutMini({ pct, color, size = 56 }) {
  const data = [{ value: pct }, { value: 100 - pct }];
  const colors = [color, '#F1F0EE'];
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <PieChart width={size} height={size}>
        <Pie data={data} cx={size / 2 - 1} cy={size / 2 - 1} innerRadius={size * 0.32} outerRadius={size * 0.46} dataKey="value" startAngle={90} endAngle={450} strokeWidth={0}>
          {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
        </Pie>
      </PieChart>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: '#1a1a1a' }}>{pct}%</span>
      </div>
    </div>
  );
}

// 3.1 Top Grid
function TopGrid({ onCrawlabilityClick }) {
  const stackedData = [
    { label: 'Saines', count: 2, color: '#10B981' },
    { label: 'Rompues', count: 0, color: '#EF4444' },
    { label: 'Redirects', count: 47, color: '#F59E0B' },
    { label: 'Bloquées', count: 1, color: '#6B7280' },
  ];
  const total = stackedData.reduce((s, d) => s + d.count, 0);

  const robots = [
    { name: 'ChatGPT-User', status: 'En ordre' },
    { name: 'OAI-SearchBot', status: 'En ordre' },
    { name: 'Google-Extended', status: 'En ordre' },
    { name: 'Claude-bot', status: 'En ordre' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14 }}>
      {/* Card 1: Santé du site */}
      <Card style={{ margin: 0 }}>
        <SLabel>Santé du site</SLabel>
        <div style={{ fontSize: 30, fontWeight: 900, color: '#10B981', lineHeight: 1 }}>83%</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981', marginTop: 2 }}>Bon</div>
        <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>Top 10 % des sites : 92%</div>
      </Card>

      {/* Card 2: Pages explorées */}
      <Card style={{ margin: 0 }}>
        <SLabel>Pages explorées</SLabel>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>50</span>
          <span style={{ fontSize: 11, color: '#888' }}>pages</span>
        </div>
        {/* Stacked bar */}
        <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
          {stackedData.filter(d => d.count > 0).map((d, i) => (
            <div key={i} style={{ flex: d.count, background: d.color }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {stackedData.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#555' }}>{d.label}: {d.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Card 3: Santé IA */}
      <Card style={{ margin: 0 }}>
        <SLabel>Santé recherche IA</SLabel>
        <div style={{ fontSize: 30, fontWeight: 900, color: '#10B981', lineHeight: 1, marginBottom: 6 }}>100%</div>
        <p style={{ fontSize: 11, color: '#555', lineHeight: 1.5, margin: '0 0 8px' }}>Prêt pour l'IA. Le site est optimisé pour les moteurs de recherche d'IA.</p>
        <button style={{ fontSize: 11, color: VIOLET, fontWeight: 700, background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
          Comment ça marche <ExternalLink size={10} />
        </button>
      </Card>

      {/* Card 4: Robots bloqués */}
      <Card style={{ margin: 0 }}>
        <SLabel>Robots IA bloqués : —</SLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 10 }}>
          {robots.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={12} color="#10B981" strokeWidth={2.5} />
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#1a1a1a' }}>{r.name}</span>
                <span style={{ fontSize: 10, color: '#888', marginLeft: 5 }}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>
        <button style={{ fontSize: 11, color: VIOLET, fontWeight: 700, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          Comment débloquer les pages
        </button>
      </Card>
    </div>
  );
}

// 3.2 Issues table
function IssuesSection() {
  const [activeTab, setActiveTab] = useState('errors');
  const tabs = [
    { id: 'errors', label: 'Erreurs', count: 81 },
    { id: 'warnings', label: 'Avertissements', count: 95 },
    { id: 'notices', label: 'Avis', count: 1 },
  ];
  const errors = [
    { text: 'Contenu en double', count: 17 },
    { text: 'Balises de titre en double', count: 17 },
    { text: 'Descriptions Meta en double', count: 46 },
    { text: 'Erreurs 4xx', count: 1 },
    { text: 'Taille totale des fichiers JavaScript et CSS trop grande', count: 47 },
  ];
  return (
    <Card>
      <SLabel>Problèmes</SLabel>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 14, background: '#F8F7F4', borderRadius: 10, padding: 3 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: '6px 4px', border: 'none', borderRadius: 8, cursor: 'pointer',
            background: activeTab === t.id ? '#fff' : 'transparent',
            fontSize: 11, fontWeight: 700,
            color: activeTab === t.id ? '#1a1a1a' : '#888',
            boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}>
            {t.label} <span style={{ fontSize: 10, color: activeTab === t.id ? VIOLET : '#aaa' }}>({t.count})</span>
          </button>
        ))}
      </div>
      {activeTab === 'errors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {errors.map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#FFF8F6', border: '1px solid #FEE2E2', borderRadius: 10 }}>
              <AlertTriangle size={13} color="#EF4444" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: '#1a1a1a' }}>{e.text}</span>
              <span style={{ fontSize: 11, color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>{e.count} page{e.count > 1 ? 's' : ''}</span>
              <button style={{ fontSize: 11, color: VIOLET, fontWeight: 700, background: 'none', border: 'none', padding: '4px 8px', cursor: 'pointer', whiteSpace: 'nowrap', borderRadius: 6 }}>
                Résolution →
              </button>
            </div>
          ))}
        </div>
      )}
      {activeTab !== 'errors' && (
        <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', padding: '24px 0' }}>
          {tabs.find(t => t.id === activeTab)?.count} {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} détecté(e)s
        </p>
      )}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F5F4F1', textAlign: 'center' }}>
        <button style={{ fontSize: 12, color: VIOLET, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Afficher tous les problèmes <ChevronRight size={12} />
        </button>
      </div>
    </Card>
  );
}

// 3.3 Thematic grid
function ThematicGrid({ onCrawlabilityClick, onPerformanceClick }) {
  const widgets = [
    {
      label: 'Robots.txt', status: 'Inchangé', type: 'status',
      action: 'Ouvrir le fichier', onAction: () => window.open('https://wok-co.base44.app/robots.txt', '_blank'),
    },
    { label: 'Explorabilité', pct: 92, color: '#10B981', type: 'donut', action: 'Voir les détails', onAction: onCrawlabilityClick },
    { label: 'HTTPS', pct: 100, color: '#10B981', type: 'donut', action: 'Voir les détails' },
    { label: 'SEO international', type: 'text', text: "Le site Web n'est pas international ou ne présente pas d'erreurs hreflang", action: 'Voir les détails' },
    { label: 'Core Web Vitals', type: 'upgrade', text: 'Disponible avec un forfait supérieur', action: 'Afficher plus' },
    { label: 'Liens internes', pct: 100, color: '#10B981', type: 'donut', action: 'Voir les détails' },
    { label: 'Balisage', pct: 100, color: '#10B981', type: 'donut', action: 'Voir les détails' },
    { label: 'Performances', pct: 94, color: '#F59E0B', type: 'donut', action: 'Voir les détails', onAction: onPerformanceClick },
  ];

  return (
    <Card>
      <SLabel>Rapports thématiques</SLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {widgets.map((w, i) => (
          <div key={i} style={{ background: '#F8F7F4', borderRadius: 12, padding: '12px 12px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#555' }}>{w.label}</span>
            {w.type === 'donut' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DonutMini pct={w.pct} color={w.color} size={48} />
                <span style={{ fontSize: 13, fontWeight: 900, color: w.color }}>{w.pct}%</span>
              </div>
            )}
            {w.type === 'status' && (
              <span style={{ fontSize: 12, color: '#888', padding: '4px 0' }}>{w.status}</span>
            )}
            {w.type === 'text' && (
              <p style={{ fontSize: 11, color: '#555', lineHeight: 1.4, margin: 0 }}>{w.text}</p>
            )}
            {w.type === 'upgrade' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <AlertTriangle size={11} color="#F59E0B" />
                <span style={{ fontSize: 11, color: '#D97706' }}>{w.text}</span>
              </div>
            )}
            <button
              onClick={w.onAction}
              style={{ fontSize: 11, color: VIOLET, fontWeight: 700, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', marginTop: 'auto' }}
            >
              {w.action}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 3.4 Upsell + Market trends
function BottomSection() {
  const marketMetrics = [
    { label: 'Trafic direct', value: '120', pct: null },
    { label: 'Recherche organique', value: '502', pct: '81%' },
    { label: 'Recherche payante', value: '0.00', pct: null },
    { label: 'Autre trafic', value: '31', pct: '5%' },
    { label: 'Réseaux sociaux', value: '4.8k', pct: '14%' },
  ];

  return (
    <>
      {/* Upsell banner */}
      <Card style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)', border: '1px solid #DDD6FE' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', margin: '0 0 6px', lineHeight: 1.3 }}>
              You're only seeing part of the picture
            </p>
            <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6, margin: '0 0 14px' }}>
              Audit more pages and fix how your site appears to both Google and AI tools like ChatGPT. Upgrade to Starter and access all features.
            </p>
            <button style={{ padding: '10px 20px', background: VIOLET, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Get free trial
            </button>
          </div>
          {/* Illustration placeholder */}
          <div style={{ width: 72, height: 72, borderRadius: 14, background: 'linear-gradient(135deg, #7C3AED22, #3B82F622)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            💬
          </div>
        </div>
      </Card>

      {/* Market trends */}
      <Card>
        <SLabel>Tendances du marché et de la concurrence</SLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>Activité Moteur de recherche</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {marketMetrics.map((m, i) => (
            <div key={i} style={{ background: '#F8F7F4', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, marginBottom: 3 }}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#1a1a1a' }}>{m.value}</span>
                {m.pct && <span style={{ fontSize: 11, color: '#888' }}>({m.pct})</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

export default function OverviewTab({ onCrawlabilityClick, onPerformanceClick }) {
  return (
    <div>
      <TopGrid />
      <IssuesSection />
      <ThematicGrid onCrawlabilityClick={onCrawlabilityClick} onPerformanceClick={onPerformanceClick} />
      <BottomSection />
    </div>
  );
}