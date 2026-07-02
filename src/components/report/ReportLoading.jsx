import { CORAL, INK3, SURFACE, CARD_DARK, F } from '@/lib/report-constants';

export default function ReportLoading() {
  return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(21,19,15,0.10)', borderTopColor: CORAL, animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: INK3, margin: 0 }}>Chargement…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function ScanInProgress() {
  return (
    <div style={{ minHeight: '100vh', background: CARD_DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: F }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.12)', borderTopColor: CORAL, animation: 'spin 0.9s linear infinite', marginBottom: 18 }} />
      <div style={{ fontSize: 19, fontWeight: 700, color: '#FFFFFF', marginBottom: 5 }}>Analyse en cours…</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>8 moteurs IA · Résultat dans ~60 secondes</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function ReportEmpty({ onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: SURFACE, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center', fontFamily: F }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={INK3} strokeWidth="2"><path d="M3 3v18h18M7 14l4-4 4 4 5-5" /></svg>
      <p style={{ fontSize: 17, fontWeight: 800, color: '#1A1814', margin: 0 }}>Aucune analyse disponible</p>
      <p style={{ fontSize: 13, color: INK3, margin: 0, maxWidth: 260 }}>Lancez une analyse depuis l'accueil pour voir votre rapport.</p>
      <button onClick={onBack} style={{ padding: '11px 22px', background: '#15130F', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Retour</button>
    </div>
  );
}