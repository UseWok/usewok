import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { siteUrl, startDate, endDate } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('6a3a4933e8ecc1e44aaaaf23');

    // List all verified sites
    const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const sitesData = await sitesRes.json();
    const sites = sitesData.siteEntry || [];

    if (!siteUrl && !sites.length) {
      return Response.json({ connected: true, sites: [], data: null });
    }

    // Find best matching site
    const targetSite = siteUrl
      ? sites.find(s => s.siteUrl.includes(siteUrl.replace(/https?:\/\//, '').split('/')[0])) || sites[0]
      : sites[0];

    if (!targetSite) {
      return Response.json({ connected: true, sites, data: null });
    }

    const site = targetSite.siteUrl;
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Query performance data — clicks, impressions, CTR, position
    const [perfRes, topPagesRes, topQueriesRes] = await Promise.all([
      fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: start, endDate: end,
          dimensions: ['date'],
          rowLimit: 90
        })
      }),
      fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: start, endDate: end,
          dimensions: ['page'],
          rowLimit: 10
        })
      }),
      fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: start, endDate: end,
          dimensions: ['query'],
          rowLimit: 20
        })
      })
    ]);

    const [perf, topPages, topQueries] = await Promise.all([
      perfRes.json(),
      topPagesRes.json(),
      topQueriesRes.json()
    ]);

    // Aggregate totals
    const rows = perf.rows || [];
    const totalClicks = rows.reduce((s, r) => s + (r.clicks || 0), 0);
    const totalImpressions = rows.reduce((s, r) => s + (r.impressions || 0), 0);
    const avgCtr = rows.length ? rows.reduce((s, r) => s + (r.ctr || 0), 0) / rows.length : 0;
    const avgPosition = rows.length ? rows.reduce((s, r) => s + (r.position || 0), 0) / rows.length : 0;

    return Response.json({
      connected: true,
      sites,
      activeSite: site,
      data: {
        totalClicks,
        totalImpressions,
        avgCtr: Math.round(avgCtr * 1000) / 10,
        avgPosition: Math.round(avgPosition * 10) / 10,
        dailyRows: rows.map(r => ({
          date: r.keys?.[0],
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: Math.round((r.ctr || 0) * 1000) / 10,
          position: Math.round((r.position || 0) * 10) / 10
        })),
        topPages: (topPages.rows || []).map(r => ({
          page: r.keys?.[0],
          clicks: r.clicks,
          impressions: r.impressions,
          position: Math.round((r.position || 0) * 10) / 10
        })),
        topQueries: (topQueries.rows || []).map(r => ({
          query: r.keys?.[0],
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: Math.round((r.ctr || 0) * 1000) / 10,
          position: Math.round((r.position || 0) * 10) / 10
        }))
      }
    });
  } catch (error) {
    if (error.message?.includes('connection') || error.message?.includes('not found')) {
      return Response.json({ connected: false, error: 'not_connected' }, { status: 200 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});