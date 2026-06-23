import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { propertyId } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('6a3a493a526e86829e5c5a79');

    // List GA4 properties
    const accountsRes = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const accountsData = await accountsRes.json();

    const properties = [];
    for (const account of (accountsData.accountSummaries || [])) {
      for (const prop of (account.propertySummaries || [])) {
        properties.push({ id: prop.property, displayName: prop.displayName });
      }
    }

    const targetProperty = propertyId || properties[0]?.id;
    if (!targetProperty) {
      return Response.json({ connected: true, properties, data: null });
    }

    const end = new Date().toISOString().split('T')[0];
    const start = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // GA4 Data API
    const reportRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/${targetProperty}:runReport`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: start, endDate: end }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'screenPageViews' }
        ],
        dimensions: [{ name: 'date' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      })
    });
    const reportData = await reportRes.json();

    const rows = reportData.rows || [];
    const totalSessions = rows.reduce((s, r) => s + parseInt(r.metricValues?.[0]?.value || 0), 0);
    const totalUsers = rows.reduce((s, r) => s + parseInt(r.metricValues?.[1]?.value || 0), 0);
    const avgBounce = rows.length ? rows.reduce((s, r) => s + parseFloat(r.metricValues?.[2]?.value || 0), 0) / rows.length : 0;
    const avgDuration = rows.length ? rows.reduce((s, r) => s + parseFloat(r.metricValues?.[3]?.value || 0), 0) / rows.length : 0;

    return Response.json({
      connected: true,
      properties,
      activeProperty: targetProperty,
      data: {
        totalSessions,
        totalUsers,
        avgBounceRate: Math.round(avgBounce * 100),
        avgSessionDuration: Math.round(avgDuration),
        dailyRows: rows.map(r => ({
          date: r.dimensionValues?.[0]?.value,
          sessions: parseInt(r.metricValues?.[0]?.value || 0),
          users: parseInt(r.metricValues?.[1]?.value || 0),
          bounceRate: Math.round(parseFloat(r.metricValues?.[2]?.value || 0) * 100),
          duration: Math.round(parseFloat(r.metricValues?.[3]?.value || 0))
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