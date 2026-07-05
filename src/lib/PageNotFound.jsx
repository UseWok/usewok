import { useNavigate } from 'react-router-dom';

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: '#F7F5F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <span style={{ fontSize: 72, fontWeight: 900, color: '#15130F', letterSpacing: '-0.04em', lineHeight: 1 }}>404</span>
      <button
        onClick={() => navigate('/app')}
        style={{ padding: '12px 28px', background: '#15130F', color: '#F7F5F0', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        Back to home
      </button>
    </div>
  );
}