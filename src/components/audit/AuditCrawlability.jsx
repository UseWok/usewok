import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { X } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111111'; const INK2 = '#555555'; const INK3 = '#999999';
const BORDER = '#E8E7E4'; const SURFACE = '#F7F6F3'; const WHITE = '#FFFFFF';
const SHADES = [INK, '#777', '#aaa', '#ccc'];

function Card({ children, style = {} }) {
  return <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '18px 20px', fontFamily: F, ...style }}>{children}</div>;
}
function Label({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>{children}</p>;
}

function BigDonut({ indexable, nonIndexable }) {
  const total = (indexable || 0) + (nonIndexable || 0) || 1;
  const data = [{ value: nonIndexable || 0, name: 'Non indexables' }, { value: indexable || 0, name: 'Indexables' }];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: 150, height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={66} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
              {data.map((_, i) => <Cell key={i} fill={SHADES[i]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: INK, lineHeight: 1 }}>{total}</span>
          <span style={{ fontSize: 10, color: INK3 }}>pages</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        {[['Non indexables', nonIndexable || 0, '#777'], ['Indexables', indexable || 0, INK]].map(([l, c, col]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: col }} />
            <span style={{ fontSize: 11, color: INK2 }}><strong>{c}</strong> {l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AuditCrawlability({ data = {} }) {
  const [sitemapDrawer, setSitemapDrawer] = useState(false);

  const crawlBudgetItems = data.crawl_budget_items || [
    { label: 'Temporary redirects', value: 0 },
    { label: 'Permanent redirects', value: data.pages_redirects || 0 },
    { label: 'Redirect chains and loops', value: 0 },
    { label: 'Canonicals to another page', value: 0 },
    { label: 'Pages with duplicate text', value: 0 },
    { label: 'Crawl blocked', value: data.pages_blocked || 0 },
    { label: 'Large page size', value: 0 },
    { label: '4xx errors', value: data.http_4xx_count || 0 },
    { label: '5xx errors', value: data.http_5xx_count || 0 },
  ];

  const inboundLinks = data.inbound_links_distribution || [
    { range: '0', count: 0 }, { range: '1', count: 0 }, { range: '2-5', count: 0 },
    { range: '6-10', count: 0 }, { range: '11-50', count: 0 }, { range: '51+', count: 0 },
  ];

  const depthData = [
    { label: '1 click', pages: data.pages_crawled || 0 },
    { label: '2 clicks', pages: 0 },
    { label: '3 clicks', pages: 0 },
    { label: '4+ clicks', pages: 0 },
  ];

  const httpData = [
    { name: '2xx', value: data.http_2xx_count || 0 },
    { name: '3xx', value: data.http_3xx_count || 0 },
    { name: '4xx', value: data.http_4xx_count || 0 },
    { name: '5xx', value: data.http_5xx_count || 0 },
  ];

  const crawledBarData = [{ date: data.analyzed_at ? new Date(data.analyzed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Today', pages: data.pages_crawled || 0 }];

  return (
    <div style={{ fontFamily: F }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 22, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Crawlability</p>
        <p style={{ fontSize: 13, color: INK3, margin: 0 }}>Overall score: <strong style={{ color: INK }}>{data.crawlability_score ?? '–'} / 100</strong></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>

        <Card>
          <Label>Site indexability</Label>
          <BigDonut indexable={data.indexable_pages} nonIndexable={data.non_indexable_pages} />
        </Card>

        <Card>
          <Label>Crawl budget waste — {data.crawl_budget_waste ?? '?'} / 10</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {crawlBudgetItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: item.value > 0 ? INK : INK3, flex: 1 }}>{item.label}</span>
                <div style={{ width: 60, height: 4, background: SURFACE, borderRadius: 2, flexShrink: 0 }}>
                  <div style={{ height: '100%', width: item.value > 0 ? `${Math.min(item.value * 15, 100)}%` : '0%', background: INK, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: item.value > 0 ? 700 : 400, color: item.value > 0 ? INK : INK3, width: 14, textAlign: 'right' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Label>Pages crawled</Label>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={crawledBarData} margin={{ top: 4, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: INK3 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: INK3 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE }} cursor={{ fill: SURFACE }} />
              <Bar dataKey="pages" fill={INK} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <Label>Inbound internal links</Label>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={inboundLinks} margin={{ top: 4, bottom: 0 }}>
              <XAxis dataKey="range" tick={{ fontSize: 9, fill: INK3 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: INK3 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE }} cursor={{ fill: SURFACE }} />
              <Bar dataKey="count" fill={INK} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <Label>Crawl depth</Label>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {depthData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: INK2, width: 60, flexShrink: 0 }}>{d.label}</span>
                  <div style={{ flex: 1, height: 5, background: SURFACE, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: d.pages > 0 ? '100%' : '0%', background: INK, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: INK3, width: 24, textAlign: 'right' }}>{d.pages}</span>
                </div>
              ))}
            </div>
            <div style={{ width: 54, height: 54, borderRadius: '50%', border: `2px solid ${INK}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: INK, lineHeight: 1 }}>{data.crawl_depth_avg ?? 1}</span>
              <span style={{ fontSize: 8, color: INK3, textAlign: 'center' }}>level</span>
            </div>
          </div>
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <Label>Sitemap vs. Pages crawled</Label>
          {data.sitemap_status === 'found' ? (
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: '0 0 4px' }}>Sitemap found ✓</p>
              <p style={{ fontSize: 12, color: INK2, margin: 0 }}>{data.sitemap_url_count || 0} URLs declared</p>
            </div>
          ) : (
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0 }}>Sitemap not found</p>
              <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.5 }}>No sitemap.xml file detected. This may limit indexing by AI engines and Google.</p>
              <button onClick={() => setSitemapDrawer(true)} style={{ fontSize: 12, fontWeight: 600, color: WHITE, background: INK, border: 'none', borderRadius: 7, padding: '8px 14px', cursor: 'pointer', fontFamily: F, alignSelf: 'flex-start' }}>How to create a sitemap →</button>
            </div>
          )}
        </Card>

        <Card>
          <Label>HTTP status codes</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 100, height: 100, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={httpData.filter(d => d.value > 0)} cx="50%" cy="50%" outerRadius={42} dataKey="value" strokeWidth={0}>
                    {httpData.filter(d => d.value > 0).map((_, i) => <Cell key={i} fill={SHADES[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {httpData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: SHADES[i] }} />
                  <span style={{ fontSize: 11, color: INK2 }}>{d.name} — <strong style={{ color: INK }}>{d.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>

      {sitemapDrawer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }} onClick={() => setSitemapDrawer(false)}>
          <div style={{ flex: 1 }} />
          <div onClick={e => e.stopPropagation()} style={{ width: 360, background: WHITE, borderLeft: `1px solid ${BORDER}`, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>Guide</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0 }}>Create a sitemap.xml</p>
              </div>
              <button onClick={() => setSitemapDrawer(false)} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={13} color={INK2} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {['Generate an XML sitemap from your CMS (WordPress: Yoast SEO, Shopify: built-in)', 'If SPA/React: use the "sitemap" package on Node.js to generate it at build time', 'Place the file at the root: https://your-domain.com/sitemap.xml', 'Declare it in robots.txt via the directive: Sitemap: https://…/sitemap.xml', 'Submit the sitemap URL in Google Search Console'].map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: INK, color: WHITE, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.55 }}>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}