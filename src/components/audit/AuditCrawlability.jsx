import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const CREAM = '#F6F2EA';
const CREAM_2 = '#EFE9DC';
const INK = '#151310';
const INK_SOFT = '#3A362F';
const ORANGE = '#FF5A1F';
const LINE = '#E3DCCB';
const MUTED = '#8A8375';
const WHITE = '#FFFFFF';

function Donut({ segments, size = 150, stroke = 14, centerNum, centerLabel }) {
  const r = (size - stroke) / 2 - 1;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + (x.value || 0), 0) || 1;
  let cumulative = 0;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={CREAM_2} strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const value = seg.value || 0;
          if (value === 0) return null;
          const dashLen = (value / total) * circ;
          const offset = -cumulative;
          cumulative += dashLen;
          return (
            <motion.circle
              key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={seg.color} strokeWidth={stroke}
              strokeLinecap="butt"
              initial={{ strokeDasharray: `0 ${circ}`, strokeDashoffset: offset }}
              animate={{ strokeDasharray: `${dashLen} ${circ}`, strokeDashoffset: offset }}
              transition={{ duration: 1.1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}
      </svg>
      {centerNum != null && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: INK }}>{centerNum}</span>
          {centerLabel && <span style={{ fontSize: 11, color: MUTED }}>{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: WHITE, border: `1px solid ${LINE}`, borderRadius: 16, padding: '24px 26px', fontFamily: F, ...style }}>{children}</div>;
}

function CardLabel({ children }) {
  return <div style={{ fontSize: 11.5, color: MUTED, letterSpacing: '0.04em', marginBottom: 16, fontWeight: 600 }}>{children}</div>;
}

function BarItem({ label, value, max, color = INK }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 0' }}>
      <span style={{ width: 110, fontSize: 13, color: INK_SOFT, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 7, background: CREAM_2, borderRadius: 4, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', background: color, borderRadius: 4 }}
        />
      </div>
      <span style={{ width: 26, textAlign: 'right', fontSize: 13, fontWeight: 600, color: INK }}>{value}</span>
    </div>
  );
}

export default function AuditCrawlability({ data = {} }) {
  const [sitemapDrawer, setSitemapDrawer] = useState(false);

  const indexable = data.indexable_pages || 0;
  const nonIndexable = data.non_indexable_pages || 0;
  const totalPages = indexable + nonIndexable;

  const crawlBudgetItems = data.crawl_budget_items || [];
  const crawlBudgetMax = Math.max(...crawlBudgetItems.map(i => i.value || 0), 1);

  const inboundLinks = data.inbound_links_distribution || [];
  const inboundMax = Math.max(...inboundLinks.map(i => i.count || 0), 1);

  const depthData = data.depth_distribution || [
    { label: '1 click', pages: data.pages_crawled || 0 },
    { label: '2 clicks', pages: 0 },
    { label: '3 clicks', pages: 0 },
    { label: '4+ clicks', pages: 0 },
  ];
  const depthMax = Math.max(...depthData.map(d => d.pages || 0), 1);

  const httpData = [
    { name: '2xx', value: data.http_2xx_count || 0, color: INK },
    { name: '3xx', value: data.http_3xx_count || 0, color: '#8A8375' },
    { name: '4xx', value: data.http_4xx_count || 0, color: '#C9C3B5' },
    { name: '5xx', value: data.http_5xx_count || 0, color: '#E3DCCB' },
  ];

  const analyzedDate = data.analyzed_at
    ? new Date(data.analyzed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const pagesAxisMax = Math.max(data.pages_crawled || 0, 8);
  const pagesAxisSteps = [pagesAxisMax, Math.round(pagesAxisMax / 2), 0];

  return (
    <div style={{ fontFamily: F, color: INK }}>
      <style>{`
        @media (max-width:1100px){
          .uw-crawl .grid3{grid-template-columns:1fr !important;}
          .uw-crawl .grid2{grid-template-columns:1fr !important;}
        }
      `}</style>

      <div className="uw-crawl">
        {/* ── Topbar ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: INK, margin: 0 }}>Crawlability</h1>
            <div style={{ color: MUTED, fontSize: 13, marginTop: 6 }}>
              Overall score · <b style={{ color: INK }}>{data.crawlability_score ?? '—'} / 100</b>
            </div>
          </div>
          {analyzedDate && (
            <div style={{ fontSize: 12, color: MUTED, padding: '6px 12px', border: `1px solid ${LINE}`, borderRadius: 20, background: WHITE }}>
              Updated · {analyzedDate}
            </div>
          )}
        </div>

        {/* ── Grid 3 ── */}
        <div className="grid3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>

          {/* Indexabilité */}
          <Card>
            <CardLabel>SITE INDEXABILITY</CardLabel>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Donut
                segments={[
                  { value: indexable, color: INK },
                  { value: nonIndexable, color: '#DCD5C4' },
                ]}
                size={150}
                stroke={14}
                centerNum={totalPages}
                centerLabel="pages"
              />
              <div style={{ display: 'flex', gap: 22, marginTop: 16, fontSize: 12.5, color: INK_SOFT }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: '#DCD5C4' }} />
                  {nonIndexable} non-indexable
                                   </span>
                                   <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                     <span style={{ width: 9, height: 9, borderRadius: 2, background: INK }} />
                                     {indexable} indexable
                </span>
              </div>
            </div>
          </Card>

          {/* Budget de crawl */}
          <Card>
            <CardLabel>CRAWL BUDGET WASTED — {data.crawl_budget_waste ?? '—'} / 10</CardLabel>
            {crawlBudgetItems.length > 0 ? (
              crawlBudgetItems.map((item, i) => (
                <BarItem key={i} label={item.label} value={item.value || 0} max={crawlBudgetMax} color={(item.value || 0) > 0 ? ORANGE : INK} />
              ))
            ) : (
              <p style={{ fontSize: 13, color: MUTED, padding: '20px 0' }}>No data available</p>
            )}
          </Card>

          {/* Pages explorées */}
          <Card>
            <CardLabel>PAGES CRAWLED</CardLabel>
            <div style={{ height: 150, display: 'flex', alignItems: 'flex-end', gap: 8, position: 'relative', paddingLeft: 28 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 11, color: MUTED }}>
                {pagesAxisSteps.map((v, i) => <span key={i}>{v}</span>)}
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.min(((data.pages_crawled || 0) / pagesAxisMax) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: 56, background: INK, borderRadius: '6px 6px 0 0', minHeight: 4 }}
              />
            </div>
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 8, marginLeft: 28 }}>
              {analyzedDate || "Today"}
            </div>
          </Card>
        </div>

        {/* ── Grid 2 — row 1 ── */}
        <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

          {/* Liens internes entrants */}
          <Card>
            <CardLabel>INBOUND INTERNAL LINKS</CardLabel>
            {inboundLinks.length > 0 ? (
              <>
                <div style={{ height: 150, display: 'flex', alignItems: 'flex-end', gap: 26, position: 'relative', paddingLeft: 28 }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 11, color: MUTED }}>
                    <span>{inboundMax}</span>
                    <span>{Math.round(inboundMax / 2)}</span>
                    <span>0</span>
                  </div>
                  {inboundLinks.map((item, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.count || 0) / inboundMax * 110}px` }}
                        transition={{ duration: 1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        style={{ width: '100%', maxWidth: 70, background: INK, borderRadius: '6px 6px 0 0', minHeight: (item.count || 0) > 0 ? 4 : 0 }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 26, marginLeft: 28, fontSize: 11.5, color: MUTED, marginTop: 8 }}>
                  {inboundLinks.map((item, i) => <span key={i}>{item.range}</span>)}
                </div>
              </>
            ) : (
              <p style={{ fontSize: 13, color: MUTED, padding: '20px 0' }}>No data available</p>
            )}
          </Card>

          {/* Profondeur de crawl */}
          <Card style={{ display: 'flex', flexDirection: 'column' }}>
            <CardLabel>CRAWL DEPTH</CardLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                {depthData.map((d, i) => (
                  <BarItem key={i} label={d.label} value={d.pages || 0} max={depthMax} />
                ))}
              </div>
              <div style={{
                width: 70, height: 70, borderRadius: '50%', border: `2.5px solid ${INK}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 19, fontWeight: 700, color: INK }}>{data.crawl_depth_avg ?? '—'}</span>
                <span style={{ fontSize: 9.5, color: MUTED }}>level</span>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Grid 2 — row 2 ── */}
        <div className="grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Sitemap */}
          <Card style={{ display: 'flex', flexDirection: 'column' }}>
            <CardLabel>SITEMAP VS. PAGES CRAWLED</CardLabel>
            {data.sitemap_status === 'found' ? (
              <div style={{ background: CREAM_2, borderRadius: 12, padding: '20px 22px', marginTop: 'auto' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: INK, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Sitemap found <span style={{ color: ORANGE, fontWeight: 700 }}>✓</span>
                                   </div>
                                   <div style={{ fontSize: 13, color: INK_SOFT, marginTop: 4 }}>{data.sitemap_url_count || 0} URLs declared</div>
              </div>
            ) : (
              <div style={{ background: CREAM_2, borderRadius: 12, padding: '20px 22px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: INK }}>Sitemap not found</div>
                <div style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.5 }}>
                  No sitemap.xml file detected. This may limit indexing by AI engines and Google.
                </div>
                <button onClick={() => setSitemapDrawer(true)}
                  style={{ fontSize: 12, fontWeight: 600, color: WHITE, background: INK, border: 'none', borderRadius: 7, padding: '8px 14px', cursor: 'pointer', fontFamily: F, alignSelf: 'flex-start' }}>
                  How to create a sitemap →
                </button>
              </div>
            )}
          </Card>

          {/* Codes de statut HTTP */}
          <Card>
            <CardLabel>HTTP STATUS CODES</CardLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
              <Donut segments={httpData} size={110} stroke={14} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13.5, color: INK_SOFT }}>
                {httpData.map((d, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: d.color }} />
                    {d.name} <b style={{ marginLeft: 'auto', paddingLeft: 14, color: INK }}>{d.value}</b>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Sitemap drawer ── */}
      {sitemapDrawer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }} onClick={() => setSitemapDrawer(false)}>
          <div style={{ flex: 1 }} />
          <div onClick={e => e.stopPropagation()} style={{ width: 360, background: WHITE, borderLeft: `1px solid ${LINE}`, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>Guide</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0 }}>Create a sitemap.xml</p>
              </div>
              <button onClick={() => setSitemapDrawer(false)} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${LINE}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={13} color={INK_SOFT} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Generate an XML sitemap from your CMS (WordPress: Yoast SEO, Shopify: built-in)',
                  'If SPA/React: use the "sitemap" package on Node.js to generate it at build time',
                  'Place the file at the root: https://your-domain.com/sitemap.xml',
                  'Declare it in robots.txt with the directive: Sitemap: https://…/sitemap.xml',
                  "Submit the sitemap URL in Google Search Console",
                ].map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: INK, color: WHITE, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <p style={{ fontSize: 13, color: INK_SOFT, margin: 0, lineHeight: 1.55 }}>{step}</p>
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