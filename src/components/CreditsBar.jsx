/**
 * CreditsBar — barre de crédits temps réel réutilisable
 * Utilisée dans Home et Settings/Usage
 * variant: "home" (dark, compact, bottom) | "settings" (dark panel, full detail)
 */
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';

export default function CreditsBar({ user, variant = 'home' }) {
  const navigate = useNavigate();
  const { used, limit, pct, remaining, barColor, resetAt, loading } = useCredits(user);

  if (loading || !user || user.role === 'admin') return null;

  const resetDisplay = resetAt
    ? new Date(resetAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : null;

  if (variant === 'home') {
    return (
      <div
        onClick={() => navigate('/settings?tab=usage')}
        style={{
          position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          zIndex: 50, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(18,18,18,0.85)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 999, padding: '7px 16px 7px 12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'border-color 150ms',
          minWidth: 220,
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'}
      >
        {/* Mini barre */}
        <div style={{ width: 80, height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{
            width: `${pct}%`, height: '100%', borderRadius: 999,
            background: barColor,
            transition: 'width 600ms ease',
          }} />
        </div>
        {/* Texte */}
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
          <span style={{ color: barColor, fontWeight: 600 }}>{remaining.toLocaleString('fr-FR')}</span>
          {' '}crédits restants
          {resetDisplay && <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: 6 }}>· renouvellement {resetDisplay}</span>}
        </span>
      </div>
    );
  }

  // variant === 'settings'
  return (
    <div style={{ background: '#141414', border: '1px solid #2A2A2A', borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#888', margin: 0 }}>Crédits consommés</p>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0 }}>
          {used.toLocaleString('fr-FR')}
          <span style={{ color: '#555', fontWeight: 400 }}> / {limit.toLocaleString('fr-FR')}</span>
        </p>
      </div>
      {/* Barre épaisse */}
      <div style={{ width: '100%', height: 10, background: '#2A2A2A', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 999,
          background: barColor,
          transition: 'width 600ms ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <p style={{ fontSize: 11, color: '#555', margin: 0 }}>{Math.round(pct)}% utilisé</p>
        {resetDisplay && <p style={{ fontSize: 11, color: '#555', margin: 0 }}>Renouvellement : {resetDisplay}</p>}
      </div>
      {/* Restants */}
      <div style={{ padding: '7px 12px', background: '#1A1A1A', borderRadius: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#555' }}>Restants</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: pct > 85 ? '#ef4444' : '#4ade80' }}>
          {remaining.toLocaleString('fr-FR')}
        </span>
      </div>
    </div>
  );
}