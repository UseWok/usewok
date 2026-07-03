import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, ExternalLink, RefreshCw, AlertCircle, Info, ChevronDown } from 'lucide-react';

const GSC_ID = '6a3a4933e8ecc1e44aaaaf23';
const GA_ID = '6a3a493a526e86829e5c5a79';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E8';
const SURFACE = '#F7F7F5';
const WHITE = '#FFFFFF';

const ERROR_CONTEXT = {
  not_connected: {
    why: "You haven't authorized access to this Google account yet.",
    fix: 'Click "Connect" and authorize access in the Google popup.',
  },
  no_sites: {
    why: "Your Google Search Console account has no verified properties.",
    fix: 'Add your site on search.google.com/search-console and verify it first.',
  },
  no_data: {
    why: "Your site is connected but hasn't generated data yet (site too new or insufficient traffic).",
    fix: 'Data appears after 48–72h of indexing. Make sure your sitemap is submitted.',
  },
  default: {
    why: 'An error occurred while fetching the data.',
    fix: 'Disconnect and reconnect the account, or check your Google permissions.',
  }
};

function ContextualHelp({ errorType }) {
  const [open, setOpen] = useState(false);
  const ctx = ERROR_CONTEXT[errorType] || ERROR_CONTEXT.default;
  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontFamily: F }}>
        <Info size={11} /> Why aren't my data showing?
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', margin: '0 0 5px' }}>Likely cause</p>
          <p style={{ fontSize: 12, color: '#78350F', margin: '0 0 10px', lineHeight: 1.6 }}>{ctx.why}</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', margin: '0 0 5px' }}>How to fix</p>
          <p style={{ fontSize: 12, color: '#78350F', margin: 0, lineHeight: 1.6 }}>{ctx.fix}</p>
        </div>
      )}
    </div>
  );
}

// Site/property selector dropdown
function SiteSelector({ sites, selectedSite, onSelect, label = 'Site' }) {
  const [open, setOpen] = useState(false);
  if (!sites || sites.length <= 1) return null;

  const display = selectedSite
    ? selectedSite.replace(/https?:\/\//, '').replace(/\/$/, '')
    : 'Select…';

  return (
    <div style={{ marginTop: 10, position: 'relative' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: INK3, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Selected {label.toLowerCase()}
      </div>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%', padding: '7px 10px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, cursor: 'pointer', fontFamily: F, fontSize: 12, color: INK }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{display}</span>
        <ChevronDown size={12} color={INK3} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)', marginTop: 4, overflow: 'hidden',
        }}>
          {sites.map((site, i) => {
            const url = site.siteUrl || site.id || site;
            const name = (site.displayName || url).replace(/https?:\/\//, '').replace(/\/$/, '');
            const active = url === selectedSite;
            return (
              <button key={i} onClick={() => { onSelect(url); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px',
                  background: active ? SURFACE : WHITE, border: 'none', cursor: 'pointer', fontFamily: F,
                  fontSize: 12, color: active ? INK : INK2, textAlign: 'left',
                  borderBottom: i < sites.length - 1 ? `1px solid ${BORDER}` : 'none',
                }}>
                {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />}
                {!active && <span style={{ width: 6 }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IntegrationCard({ name, desc, logo, connectorId, fetchFn, siteLabel, onConnected, showMetrics = false }) {
  const [status, setStatus] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  const check = async (siteOverride) => {
    setStatus('checking');
    setErrorType(null);
    const payload = siteOverride ? { siteUrl: siteOverride } : (selectedSite ? { siteUrl: selectedSite } : {});
    try {
      const res = await base44.functions.invoke(fetchFn, payload);
      if (res?.data?.connected) {
        // Store available sites/properties
        const availableSites = res.data.sites || res.data.properties || [];
        setSites(availableSites);
        if (!res.data.data) {
          setStatus('connected_no_data');
          setErrorType(availableSites.length === 0 ? 'no_sites' : 'no_data');
        } else {
          setStatus('connected');
          const active = res.data.activeSite || res.data.activeProperty;
          if (active) setSelectedSite(active);
          setInfo(res.data);
          onConnected?.(fetchFn, res.data);
        }
      } else {
        setStatus('disconnected');
        setErrorType('not_connected');
      }
    } catch {
      setStatus('disconnected');
      setErrorType('not_connected');
    }
  };

  useEffect(() => { check(); }, []);

  const handleSiteChange = (newSite) => {
    setSelectedSite(newSite);
    check(newSite);
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await base44.connectors.connectAppUser(connectorId);
      const popup = window.open(url, '_blank', 'width=600,height=700');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          check();
          setLoading(false);
        }
      }, 600);
    } catch {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await base44.connectors.disconnectAppUser(connectorId).catch(() => {});
    setStatus('disconnected');
    setInfo(null);
    setSites([]);
    setSelectedSite(null);
    setErrorType('not_connected');
    setLoading(false);
    onConnected?.(fetchFn, null);
  };

  const connected = status === 'connected';
  const connectedNoData = status === 'connected_no_data';
  const borderColor = connected ? '#BBF7D0' : connectedNoData ? '#FDE68A' : BORDER;
  const bgColor = connected ? '#F0FDF4' : connectedNoData ? '#FFFBEB' : WHITE;

  return (
    <div style={{ background: bgColor, border: `1.5px solid ${borderColor}`, borderRadius: 14, padding: '16px 18px', transition: 'all 0.2s', fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Logo + status ring */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: WHITE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <img src={logo} alt={name} width={26} height={26} style={{ objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
          </div>
          {status === 'checking' && (
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', border: '2px solid #E8E8E8', borderTopColor: INK3, animation: 'spin 0.8s linear infinite', background: WHITE }} />
          )}
          {connected && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#10B981', border: '2px solid white', boxShadow: '0 0 0 1px #BBF7D0' }} />}
          {connectedNoData && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#F59E0B', border: '2px solid white' }} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{name}</span>
            {connected && <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: '#DCFCE7', padding: '2px 6px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Connected</span>}
            {connectedNoData && <span style={{ fontSize: 9, fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 6px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.07em' }}>No data</span>}
          </div>
          <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{desc}</p>
        </div>

        {/* Action buttons */}
        {status !== 'checking' && (
          <div style={{ flexShrink: 0 }}>
            {connected || connectedNoData ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => check()} disabled={loading}
                  style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={12} color={INK3} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
                </button>
                <button onClick={handleDisconnect} disabled={loading}
                  style={{ padding: '6px 11px', borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#DC2626', fontFamily: F }}>
                  Disconnect
                  </button>
              </div>
            ) : (
              <button onClick={handleConnect} disabled={loading}
                style={{ padding: '9px 16px', borderRadius: 9, border: 'none', background: INK, color: WHITE, cursor: loading ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700, fontFamily: F, display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? 0.7 : 1 }}>
                <ExternalLink size={12} />
                {loading ? 'Connecting…' : 'Connect'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Site selector — shown when connected and multiple sites available */}
      {(connected || connectedNoData) && sites.length > 1 && (
        <SiteSelector
          sites={sites}
          selectedSite={selectedSite}
          onSelect={handleSiteChange}
          label={siteLabel || 'Site'}
        />
      )}

      {/* Contextual help */}
      {errorType && status !== 'checking' && !connected && (
        <ContextualHelp errorType={errorType} />
      )}
      {connectedNoData && (
        <ContextualHelp errorType={errorType} />
      )}

      {/* Live metrics preview */}
      {connected && showMetrics && info?.data && (
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[
            { l: 'Clicks', v: info.data.totalClicks?.toLocaleString('en') || '–' },
            { l: 'Impressions', v: info.data.totalImpressions?.toLocaleString('en') || '–' },
            { l: 'CTR', v: `${info.data.avgCtr ?? '–'}%` },
            { l: 'Position', v: `#${info.data.avgPosition ?? '–'}` },
          ].map((m, i) => (
            <div key={i} style={{ background: WHITE, border: `1px solid #D1FAE5`, borderRadius: 9, padding: '9px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: INK, lineHeight: 1 }}>{m.v}</div>
              <div style={{ fontSize: 9, color: INK3, fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ConnectIntegrations({ onDataLoaded, compact = false, showMetrics = false }) {
  const [integrationData, setIntegrationData] = useState({});

  const handleConnected = (fn, data) => {
    setIntegrationData(prev => {
      const next = { ...prev, [fn]: data };
      onDataLoaded?.(next);
      return next;
    });
  };

  const integrations = [
    {
      name: 'Google Search Console',
      desc: 'Clicks, impressions, real positions · Last 28 days',
      logo: 'https://www.gstatic.com/images/branding/product/2x/search_console_512dp.png',
      connectorId: GSC_ID,
      fetchFn: 'getSearchConsoleData',
      siteLabel: 'Site',
    },
    {
      name: 'Google Analytics',
      desc: 'Sessions, users, bounce rate · Last 28 days',
      logo: 'https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg',
      connectorId: GA_ID,
      fetchFn: 'getAnalyticsData',
      siteLabel: 'Property',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: F }}>
      {integrations.map(i => (
        <IntegrationCard key={i.fetchFn} {...i} onConnected={handleConnected} showMetrics={showMetrics} />
      ))}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}