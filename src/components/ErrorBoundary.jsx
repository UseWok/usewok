import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UseWok crash caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/app';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Wix Madefor Text", system-ui, sans-serif',
          background: '#F7F5F0', padding: 32, textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: '#fff',
            border: '1px solid rgba(21,19,15,0.12)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: 18,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                stroke="#FF5A1F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1814', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Oups, une erreur est survenue
          </h1>
          <p style={{ fontSize: 14, color: '#857E6E', margin: '0 0 24px', maxWidth: 360, lineHeight: 1.55 }}>
            UseWok a rencontré un problème. Recharge la page — tes données sont sauvegardées.
          </p>
          <button onClick={this.handleReload}
            style={{
              padding: '13px 28px', background: '#FF5A1F', color: '#fff',
              border: 'none', borderRadius: 13, fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
            Recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}