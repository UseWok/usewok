import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, CheckCircle, AlertCircle, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import ConnectIntegrations from '@/components/integrations/ConnectIntegrations';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EFEFEF';
const SURFACE = '#F9F8F6';
const WHITE = '#FFFFFF';
const VIOLET = '#7C3AED';

export default function ConnectionsPage() {
  const navigate = useNavigate();
  const [connectedData, setConnectedData] = useState({});

  const handleDataLoaded = (data) => {
    setConnectedData(data);
  };

  const gscData = connectedData['getSearchConsoleData'];
  const gaData = connectedData['getAnalyticsData'];

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, fontFamily: F }}>
      {/* Header */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowLeft size={14} color={INK2} />
        </button>
        <div>
          <h1 style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>Connections</h1>
          <p style={{ fontSize: 11, color: INK3, margin: 0 }}>Real data sources</p>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 80px' }}>

        {/* Hero */}
        <div style={{ background: INK, borderRadius: 18, padding: '22px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }}>
              <Zap size={10} color="rgba(255,255,255,0.6)" />
              <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Real data</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: WHITE, margin: '0 0 6px', letterSpacing: '-0.03em' }}>
              Connect your sources
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.65 }}>
              Link Google Search Console and Analytics to power your audits, LRS scores and reports with 100% real data — no manual entry.
            </p>
          </div>
        </div>

        {/* Integration cards */}
        <ConnectIntegrations onDataLoaded={handleDataLoaded} compact={true} showMetrics={true} />

        {/* Live data preview — GSC */}
        {gscData?.data && (
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px', marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <img src="https://www.gstatic.com/images/branding/product/2x/search_console_512dp.png" width={18} height={18} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>Search Console — Last 28 days</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { label: 'Clicks', value: gscData.data.totalClicks?.toLocaleString('en') },
                { label: 'Impressions', value: gscData.data.totalImpressions?.toLocaleString('en') },
                { label: 'Avg. CTR', value: `${gscData.data.avgCtr}%` },
                { label: 'Avg. position', value: gscData.data.avgPosition },
              ].map((m, i) => (
                <div key={i} style={{ background: SURFACE, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: INK, lineHeight: 1 }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: INK3, fontWeight: 600, marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live data preview — GA */}
        {gaData?.data && (
          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px', marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <img src="https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg" width={18} height={18} style={{ objectFit: 'contain' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>Google Analytics — Last 28 days</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { label: 'Sessions', value: gaData.data.totalSessions?.toLocaleString('en') },
                { label: 'Users', value: gaData.data.totalUsers?.toLocaleString('en') },
                { label: 'Bounce rate', value: `${gaData.data.avgBounceRate}%` },
              ].map((m, i) => (
                <div key={i} style={{ background: SURFACE, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: INK, lineHeight: 1 }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: INK3, fontWeight: 600, marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What it powers */}
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 20px', marginTop: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>This data powers</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '📊', title: 'LRS dashboard', desc: 'Real traffic, positions, CTR from Search Console' },
              { icon: '🔍', title: 'Technical audit', desc: 'Real keywords, crawled pages, detected errors' },
              { icon: '📈', title: 'Performance page', desc: 'Share of voice, favorability, real competitors' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: INK3, marginTop: 1 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}