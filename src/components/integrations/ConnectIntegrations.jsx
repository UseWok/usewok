import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle, ExternalLink, RefreshCw, AlertCircle, Wifi, WifiOff, Info } from 'lucide-react';

const GSC_ID = '6a3a4933e8ecc1e44aaaaf23';
const GA_ID = '6a3a493a526e86829e5c5a79';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E8';
const SURFACE = '#F7F7F5';
const WHITE = '#FFFFFF';

// Why the data might be missing — contextual help messages
const ERROR_CONTEXT = {
  not_connected: {
    why: 'Vous n\'avez pas encore autorisé l\'accès à ce compte Google.',
    fix: 'Cliquez sur "Connecter" et autorisez l\'accès dans la fenêtre Google.',
  },
  no_sites: {
    why: 'Votre compte Google Search Console n\'a aucune propriété vérifiée.',
    fix: 'Ajoutez votre site sur search.google.com/search-console et vérifiez-le d\'abord.',
  },
  no_data: {
    why: 'Votre site est connecté mais n\'a pas encore généré de données (site trop récent ou trafic insuffisant).',
    fix: 'Les données apparaissent après 48–72h d\'indexation. Vérifiez que votre sitemap est soumis.',
  },
  default: {
    why: 'Une erreur est survenue lors de la récupération des données.',
    fix: 'Déconnectez et reconnectez le compte, ou vérifiez vos permissions Google.',
  }
};

function ContextualHelp({ errorType }) {
  const [open, setOpen] = useState(false);
  const ctx = ERROR_CONTEXT[errorType] || ERROR_CONTEXT.default;
  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontFamily: F }}>
        <Info size={11} /> Pourquoi mes données ne s'affichent-elles pas ?
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', margin: '0 0 5px' }}>Cause probable</p>
          <p style={{ fontSize: 12, color: '#78350F', margin: '0 0 10px', lineHeight: 1.6 }}>{ctx.why}</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#92400E', margin: '0 0 5px' }}>Comment résoudre</p>
          <p style={{ fontSize: 12, color: '#78350F', margin: 0, lineHeight: 1.6 }}>{ctx.fix}</p>
        </div>
      )}
    </div>
  );
}

function IntegrationCard({ name, desc, logo, connectorId, fetchFn, onConnected, showMetrics = false }) {
  const [status, setStatus] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);
  const [errorType, setErrorType] = useState(null);

  const check = async () => {
    setStatus('checking');
    setErrorType(null);
    try {
      const res = await base44.functions.invoke(fetchFn, {});
      if (res?.data?.connected) {
        if (!res.data.data) {
          setStatus('connected_no_data');
          setErrorType(res.data.sites?.length === 0 ? 'no_sites' : 'no_data');
        } else {
          setStatus('connected');
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
          {connected && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#10B981', border: '2px solid WHITE', boxShadow: '0 0 0 1px #BBF7D0' }} />}
          {connectedNoData && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: '#F59E0B', border: '2px solid WHITE' }} />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{name}</span>
            {connected && <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: '#DCFCE7', padding: '2px 6px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Connecté</span>}
            {connectedNoData && <span style={{ fontSize: 9, fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '2px 6px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Données manquantes</span>}
          </div>
          <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{desc}</p>
          {connected && info?.activeSite && (
            <p style={{ fontSize: 10, color: '#059669', margin: '3px 0 0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              ✓ {info.activeSite.replace(/https?:\/\//, '')}
            </p>
          )}
        </div>

        {/* Action button */}
        {status !== 'checking' && (
          <div style={{ flexShrink: 0 }}>
            {connected || connectedNoData ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={check} disabled={loading}
                  style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={12} color={INK3} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
                </button>
                <button onClick={handleDisconnect} disabled={loading}
                  style={{ padding: '6px 11px', borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#DC2626', fontFamily: F }}>
                  Déconnecter
                </button>
              </div>
            ) : (
              <button onClick={handleConnect} disabled={loading}
                style={{ padding: '9px 16px', borderRadius: 9, border: 'none', background: INK, color: WHITE, cursor: loading ? 'wait' : 'pointer', fontSize: 12, fontWeight: 700, fontFamily: F, display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? 0.7 : 1 }}>
                <ExternalLink size={12} />
                {loading ? 'Connexion…' : 'Connecter'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contextual help when data is missing */}
      {errorType && status !== 'checking' && !connected && (
        <ContextualHelp errorType={errorType} />
      )}
      {connectedNoData && (
        <ContextualHelp errorType={errorType} />
      )}

      {/* Live metrics preview (when connected + data) */}
      {connected && showMetrics && info?.data && (
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[
            { l: 'Clics', v: info.data.totalClicks?.toLocaleString('fr') || '–' },
            { l: 'Impressions', v: info.data.totalImpressions?.toLocaleString('fr') || '–' },
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
      desc: 'Clics, impressions, positions réelles · 28 derniers jours',
      logo: 'https://www.gstatic.com/images/branding/product/2x/search_console_512dp.png',
      connectorId: GSC_ID,
      fetchFn: 'getSearchConsoleData',
    },
    {
      name: 'Google Analytics',
      desc: 'Sessions, utilisateurs, taux de rebond · 28 derniers jours',
      logo: 'https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg',
      connectorId: GA_ID,
      fetchFn: 'getAnalyticsData',
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