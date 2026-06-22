import { ArrowLeft, AlertCircle } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const VIOLET = '#7C3AED';

function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 14, padding: '16px', marginBottom: 12, ...style }}>
      {children}
    </div>
  );
}

function SLabel({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>{children}</p>;
}

// Indexability donut
function IndexabilityWidget() {
  const data = [
    { name: 'Indexables', value: 32, color: '#10B981' },
    { name: 'Non-indexables', value: 18, color: '#E5E7EB' },
  ];
  return (
    <Card>
      <SLabel>Indexabilité du site</SLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
          <PieChart width={120} height={120}>
            <Pie data={data} cx={58} cy={58} innerRadius={36} outerRadius={54} dataKey="value" startAngle={90} endAngle={450} strokeWidth={0}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
          </PieChart>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>50</span>
            <span style={{ fontSize: 9, color: '#aaa', fontWeight: 600 }}>pages</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#333' }}>{d.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 900, color: '#1a1a1a' }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// Crawl budget waste
function CrawlBudgetWidget() {
  const criteria = [
    { label: 'Redirections temporaires', value: 0 },
    { label: 'Redirections permanentes', value: 0 },
    { label: 'Chaînes et boucles de redirection', value: 0 },
    { label: 'Canoniques vers une autre page', value: 0 },
    { label: 'Pages avec du texte dupliqué', value: 0 },
    { label: 'Exploration bloquée', value: 0 },
    { label: 'Grande taille de page', value: 0 },
    { label: 'Erreurs 4xx', value: 1 },
    { label: 'Erreurs 5xx', value: 0 },
    { label: 'Boucles de redirection (2)', value: 0 },
  ];
  const total = 10;
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <SLabel>Gaspillage de budget d'exploration</SLabel>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#1a1a1a' }}>0 / {total}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {criteria.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1, fontSize: 11, color: '#444', lineHeight: 1.3 }}>{c.label}</span>
            <div style={{ width: 64, height: 5, background: '#F1F0EE', borderRadius: 3, flexShrink: 0, overflow: 'hidden' }}>
              <div style={{ width: `${(c.value / 10) * 100}%`, height: '100%', background: c.value > 0 ? '#F59E0B' : '#10B981', borderRadius: 3, minWidth: c.value > 0 ? 6 : 0 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: c.value > 0 ? '#F59E0B' : '#10B981', width: 16, textAlign: 'right' }}>{c.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Pages crawled bar chart
function CrawledPagesChart() {
  const data = [{ name: 'ven. 20 juin 2026', pages: 50 }];
  return (
    <Card>
      <SLabel>Pages explorées</SLabel>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EE" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#aaa' }} />
          <YAxis tick={{ fontSize: 10, fill: '#aaa' }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E4E0' }} />
          <Bar dataKey="pages" fill={VIOLET} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Internal links histogram
function InternalLinksChart() {
  const data = [
    { range: '0', pages: 3 },
    { range: '1', pages: 5 },
    { range: '2-5', pages: 8 },
    { range: '6-10', pages: 22 },
    { range: '11-50', pages: 9 },
    { range: '51-100', pages: 2 },
    { range: '101-500', pages: 1 },
    { range: '500+', pages: 0 },
  ];
  return (
    <Card>
      <SLabel>Liens internes entrants</SLabel>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EE" vertical={false} />
          <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#aaa' }} />
          <YAxis tick={{ fontSize: 9, fill: '#aaa' }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E4E0' }} />
          <Bar dataKey="pages" fill="#3B82F6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// Crawl depth
function CrawlDepthWidget() {
  const rows = [
    { label: '1 clic', pages: 50, max: 50 },
    { label: '2 clics', pages: 0, max: 50 },
    { label: '3 clics', pages: 0, max: 50 },
    { label: '4+ clics', pages: 0, max: 50 },
  ];
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <SLabel>Profondeur d'exploration</SLabel>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#1a1a1a' }}>1</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#555', width: 52, flexShrink: 0 }}>{r.label}</span>
            <div style={{ flex: 1, height: 8, background: '#F1F0EE', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(r.pages / r.max) * 100}%`, height: '100%', background: VIOLET, borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', width: 24, textAlign: 'right' }}>{r.pages}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Sitemap widget
function SitemapWidget() {
  return (
    <Card style={{ background: '#FFF8F6', border: '1px solid #FEE2E2' }}>
      <SLabel>Sitemap vs. Pages explorées</SLabel>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '12px 0' }}>
        <AlertCircle size={28} color="#EF4444" />
        <p style={{ fontSize: 13, fontWeight: 700, color: '#991B1B', margin: 0 }}>Sitemap introuvable</p>
        <button style={{ fontSize: 11, color: VIOLET, fontWeight: 700, background: 'none', border: '1px solid #DDD6FE', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
          Voir les détails
        </button>
      </div>
    </Card>
  );
}

// HTTP status pie
function HttpStatusWidget() {
  const data = [
    { name: '2xx', value: 49, color: '#10B981' },
    { name: '3xx', value: 0, color: '#F59E0B' },
    { name: '4xx', value: 1, color: '#EF4444' },
    { name: '5xx', value: 0, color: '#DC2626' },
    { name: 'Sans code', value: 0, color: '#E5E7EB' },
  ].filter(d => d.value > 0);

  return (
    <Card>
      <SLabel>Code de statut HTTP</SLabel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <PieChart width={100} height={100}>
          <Pie data={data} cx={48} cy={48} outerRadius={44} dataKey="value" strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
        </PieChart>
        <div style={{ flex: 1 }}>
          {[
            { label: '2xx', value: 49, color: '#10B981' },
            { label: '3xx', value: 0, color: '#F59E0B' },
            { label: '4xx', value: 1, color: '#EF4444' },
            { label: '5xx', value: 0, color: '#DC2626' },
          ].map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#555' }}>{d.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: d.value > 0 ? '#1a1a1a' : '#ccc' }}>{d.value} page{d.value !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function CrawlabilityTab({ onBack }) {
  return (
    <div>
      {/* Sub-header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', marginBottom: 8 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={13} /> Vue d'ensemble
        </button>
        <span style={{ color: '#ccc' }}>/</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>Explorabilité</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '4px 10px' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#10B981' }}>92%</span>
        </div>
      </div>
      <IndexabilityWidget />
      <CrawlBudgetWidget />
      <CrawledPagesChart />
      <InternalLinksChart />
      <CrawlDepthWidget />
      <SitemapWidget />
      <HttpStatusWidget />
    </div>
  );
}