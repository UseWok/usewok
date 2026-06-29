import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#A8A49F';
const SURFACE = '#F8F7F4';

export default function UnsubscribePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get('email') || '';

  const [status, setStatus] = useState('idle'); // idle | loading | done | resubscribed | error
  const [email, setEmail] = useState(emailParam);

  const handleUnsubscribe = async () => {
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await base44.functions.invoke('unsubscribeEmail', { email: email.trim(), action: 'unsubscribe' });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const handleResubscribe = async () => {
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await base44.functions.invoke('unsubscribeEmail', { email: email.trim(), action: 'resubscribe' });
      setStatus('resubscribed');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    // Auto-unsubscribe if email is in URL
    if (emailParam) handleUnsubscribe();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F, padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: INK, letterSpacing: '-0.04em' }}>UseWok</span>
        </div>

        {status === 'loading' && (
          <div>
            <div style={{ width: 28, height: 28, border: '3px solid rgba(0,0,0,0.08)', borderTopColor: INK, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, color: INK3 }}>Traitement en cours…</p>
          </div>
        )}

        {status === 'idle' && !emailParam && (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '32px 28px' }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Se désabonner</h1>
            <p style={{ fontSize: 14, color: INK3, margin: '0 0 24px', lineHeight: 1.6 }}>Entrez votre email pour vous désabonner des emails UseWok.</p>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.10)', borderRadius: 8, fontSize: 14, color: INK, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: F }}
            />
            <button onClick={handleUnsubscribe} disabled={!email.trim()}
              style={{ width: '100%', padding: '12px', background: INK, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: email.trim() ? 'pointer' : 'not-allowed', opacity: email.trim() ? 1 : 0.4, fontFamily: F }}>
              Me désabonner
            </button>
          </div>
        )}

        {status === 'done' && (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '32px 28px' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span style={{ fontSize: 22 }}>✓</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Vous êtes désabonné</h1>
            <p style={{ fontSize: 14, color: INK3, margin: '0 0 24px', lineHeight: 1.6 }}>
              Vous ne recevrez plus d'emails marketing de UseWok.<br />
              Les emails transactionnels liés à votre compte continuent.
            </p>
            <button onClick={handleResubscribe}
              style={{ fontSize: 13, color: INK3, background: 'none', border: '1px solid rgba(0,0,0,0.10)', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontFamily: F }}>
              Me réabonner
            </button>
          </div>
        )}

        {status === 'resubscribed' && (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '32px 28px' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span style={{ fontSize: 22 }}>📬</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Réabonnement confirmé</h1>
            <p style={{ fontSize: 14, color: INK3, margin: 0, lineHeight: 1.6 }}>Vous recevrez à nouveau nos emails.</p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: '32px 28px' }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#ef4444', margin: '0 0 8px' }}>Erreur</h1>
            <p style={{ fontSize: 14, color: INK3, margin: '0 0 20px' }}>Une erreur est survenue. Réessayez ou contactez le support.</p>
            <button onClick={handleUnsubscribe}
              style={{ padding: '10px 20px', background: INK, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
              Réessayer
            </button>
          </div>
        )}

        <p style={{ fontSize: 11, color: INK3, marginTop: 24 }}>© 2025 UseWok — <a href="/" style={{ color: INK3 }}>Retour au site</a></p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}