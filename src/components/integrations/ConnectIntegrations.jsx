import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

const GSC_ID = '6a3a4933e8ecc1e44aaaaf23';
const GA_ID = '6a3a493a526e86829e5c5a79';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EFEFEF';
const SURFACE = '#F9F8F6';
const WHITE = '#FFFFFF';

function IntegrationCard({ name, desc, logo, connectorId, fetchFn, onConnected }) {
  const [status, setStatus] = useState('checking'); // checking | connected | disconnected
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);

  const check = async () => {
    setStatus('checking');
    try {
      const res = await base44.functions.invoke(fetchFn, {});
      if (res?.data?.connected) {
        setStatus('connected');
        setInfo(res.data);
        onConnected?.(fetchFn, res.data);
      } else {
        setStatus('disconnected');
      }
    } catch {
      setStatus('disconnected');
    }
  };

  useEffect(() => { check(); }, []);

  const handleConnect = async () => {
    setLoading(true);
    const url = await base44.connectors.connectAppUser(connectorId);
    const popup = window.open(url, '_blank', 'width=600,height=700');
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        check();
        setLoading(false);
      }
    }, 600);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await base44.connectors.disconnectAppUser(connectorId).catch(() => {});
    setStatus('disconnected');
    setInfo(null);
    setLoading(false);
    onConnected?.(fetchFn, null);
  };

  const connected = status === 'connected';

  return (
    <div style={{
      background: WHITE, border: `1.5px solid ${connected ? '#D1FAE5' : BORDER}`,
      borderRadius: 14, padding: '18px 20px',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Logo */}
        <div style={{ width: 42, height: 42, borderRadius: 10, background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src={logo} alt={name} width={26} height={26} style={{ objectFit: 'contain' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{name}</span>
            {status === 'checking' && (
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #E5E5E5', borderTopColor: INK3, animation: 'spin 0.8s linear infinite' }} />
            )}
            {connected && <CheckCircle size={14} color="#059669" />}
            {status === 'disconnected' && <AlertCircle size={14} color={INK3} />}
          </div>
          <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{desc}</p>
          {connected && info?.activeSite && (
            <p style={{ fontSize: 10, color: '#059669', margin: '3px 0 0', fontWeight: 600 }}>
              {info.activeSite.replace(/https?:\/\//, '')}
            </p>
          )}
          {connected && info?.activeProperty && (
            <p style={{ fontSize: 10, color: '#059669', margin: '3px 0 0', fontWeight: 600 }}>
              {info.properties?.find(p => p.id === info.activeProperty)?.displayName || info.activeProperty}
            </p>
          )}
        </div>

        {/* Action */}
        {status !== 'checking' && (
          <div style={{ flexShrink: 0 }}>
            {connected ? (
              <div style={{ display: 'flex', gap: 7 }}>
                <button onClick={check} disabled={loading}
                  style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={12} color={INK3} />
                </button>
                <button onClick={handleDisconnect} disabled={loading}
                  style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#DC2626' }}>
                  Déconnecter
                </button>
              </div>
            ) : (
              <button onClick={handleConnect} disabled={loading}
                style={{ padding: '8px 16px', borderRadius: 9, border: 'none', background: INK, color: WHITE, cursor: loading ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700, fontFamily: F, display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? 0.7 : 1 }}>
                <ExternalLink size={12} />
                Connecter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConnectIntegrations({ onDataLoaded, compact = false }) {
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
      desc: 'Clics, impressions, positions réelles de recherche',
      logo: 'https://www.gstatic.com/images/branding/product/2x/search_console_512dp.png',
      connectorId: GSC_ID,
      fetchFn: 'getSearchConsoleData',
    },
    {
      name: 'Google Analytics',
      desc: 'Sessions, utilisateurs, comportement réel',
      logo: 'https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg',
      connectorId: GA_ID,
      fetchFn: 'getAnalyticsData',
    },
  ];

  if (compact) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {integrations.map(i => (
          <IntegrationCard key={i.fetchFn} {...i} onConnected={handleConnected} />
        ))}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: F }}>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Connexions données réelles</h3>
        <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Connectez vos sources pour enrichir automatiquement tous vos rapports avec des données réelles.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {integrations.map(i => (
          <IntegrationCard key={i.fetchFn} {...i} onConnected={handleConnected} />
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}