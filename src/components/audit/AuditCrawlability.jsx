import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

const F = 'Inter, system-ui, sans-serif';
const VIOLET = '#7C3AED';

function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', border: '1px solid #EDECE9', borderRadius: 14, padding: 18, ...style }}>{children}</div>;
}

function CardTitle({ children }) {
  return <p style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>{children}</p>;
}

// ── Donut big ──────────────────────────────────────────────────────
function BigDonut() {
  const data = [{ value: 18, name: 'Non indexables' }, { value: 32, name: 'Indexables' }];
  const COLORS = ['#F59E0B', '#10B981'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={72} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#1a1a1a' }}>50</span>
          <span style={{ fontSize: 10, color: '#888' }}>pages au total</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {[{ label: 'Non indexables', count: 18, color: '#F59E0B' }, { label: 'Indexables', count: 32, color: '#10B981' }].map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
            <span style={{ fontSize: 11, color: '#555' }}>{d.count} {d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CRAWL_BUDGET_ITEMS = [
  { label: 'Redirections temporaires', value: 0 },
  { label: 'Redirections permanentes', value: 0 },
  { label: 'Chaînes et boucles de redirection', value: 0 },
  { label: 'Canoniques vers une autre page', value: 0 },
  { label: 'Pages avec du texte dupliqué', value: 0 },
  { label: 'Exploration bloquée', value: 0 },
  { label: 'Grande taille de page', value: 0 },
  { label: 'Erreurs 4xx', value: 1 },
  { label: 'Erreurs 5xx', value: 0 },
  { label: 'Chaînes et boucles de redirection (2)', value: 0 },
];

export default function AuditCrawlability() {
  const crawledBarData = [{ date: 'ven. 20 juin 2026 18:31', pages: 50 }];

  const inboundLinkData = [
    { range: '0', count: 5 },
    { range: '1', count: 4 },
    { range: '2-5', count: 12 },
    { range: '6-10', count: 18 },
    { range: '11-50', count: 7 },
    { range: '51-100', count: 2 },
    { range: '101-500', count: 1 },
    { range: '500+', count: 1 },
  ];

  const depthData = [
    { label: '1 clic', pages: 50 },
    { label: '2 clics', pages: 0 },
    { label: '3 clics', pages: 0 },
    { label: '4+ clics', pages: 0 },
  ];

  const httpPieData = [
    { name: '2xx', value: 49, color: '#10B981' },
    { name: '3xx', value: 0, color: '#F59E0B' },
    { name: '4xx', value: 1, color: '#EF4444' },
    { name: '5xx', value: 0, color: '#7C3AED' },
  ];

  return (
    <div style={{ fontFamily: F }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F0F10', margin: 0 }}>Audit de site : wok-co.base44.app</p>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Explorabilité / Score : <strong style={{ color: VIOLET }}>92%</strong></p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>

        {/* Indexabilité */}
        <Card>
          <CardTitle>Indexabilité du site</CardTitle>
          <BigDonut />
        </Card>

        {/* Crawl budget */}
        <Card>
          <CardTitle>Gaspillage de budget d'exploration : 0 / 10</CardTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {CRAWL_BUDGET_ITEMS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#555', flex: 1, minWidth: 0 }}>{item.label}</span>
                <div style={{ width: 80, height: 4, background: '#F1F0EE', borderRadius: 2, flexShrink: 0 }}>
                  <div style={{ height: '100%', width: item.value > 0 ? '15%' : '0%', background: item.value > 0 ? '#EF4444' : '#10B981', borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: item.value > 0 ? '#EF4444' : '#888', width: 16, textAlign: 'right' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pages crawled chart */}
        <Card>
          <CardTitle>Pages explorées</CardTitle>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={crawledBarData} margin={{ top: 5, bottom: 5 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#aaa' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#aaa' }} tickLine={false} axisLine={false} domain={[0, 60]} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E4E0' }} />
              <Bar dataKey="pages" fill={VIOLET} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Inbound internal links */}
        <Card>
          <CardTitle>Liens internes entrants</CardTitle>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={inboundLinkData} margin={{ top: 5, bottom: 5 }}>
              <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#aaa' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#aaa' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E4E0' }} />
              <Bar dataKey="count" fill="#3B82F6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Crawl depth */}
        <Card>
          <CardTitle>Profondeur d'exploration des pages</CardTitle>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {depthData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#555', width: 60, flexShrink: 0 }}>{d.label}</span>
                  <div style={{ flex: 1, height: 8, background: '#F1F0EE', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: d.pages > 0 ? '100%' : '0%', background: d.pages > 0 ? VIOLET : '#F1F0EE', borderRadius: 2, transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#888', width: 30, textAlign: 'right' }}>{d.pages}</span>
                </div>
              ))}
            </div>
            {/* Depth widget */}
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid #7C3AED', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>1</span>
              <span style={{ fontSize: 8, color: '#888', textAlign: 'center', lineHeight: 1.2 }}>profondeur</span>
            </div>
          </div>
        </Card>

        {/* Sitemap */}
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 12, minHeight: 140 }}>
          <CardTitle>Sitemap vs. Pages explorées</CardTitle>
          <div style={{ textAlign: 'center', padding: 14, background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA', width: '100%' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#B91C1C', margin: '0 0 8px' }}>Sitemap introuvable</p>
            <button style={{ fontSize: 11, fontWeight: 600, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>Voir les détails →</button>
          </div>
        </Card>

        {/* HTTP status codes */}
        <Card>
          <CardTitle>Code de statut HTTP</CardTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 100, height: 100, position: 'relative', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={httpPieData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={45} dataKey="value" strokeWidth={0}>
                    {httpPieData.filter(d => d.value > 0).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {httpPieData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  <span style={{ fontSize: 11, color: '#555' }}>{d.name} — <strong>{d.value} page{d.value !== 1 ? 's' : ''}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}