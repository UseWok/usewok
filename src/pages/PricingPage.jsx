import React, { useState } from 'react';

const CheckIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color:'#555'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ContactModal = ({ onClose }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{background:'#1a1a1a',border:'0.5px solid #2e2e2e',borderRadius:'16px',padding:'2rem',width:'100%',maxWidth:'480px',position:'relative'}}>
        <button
          onClick={onClose}
          style={{position:'absolute',top:'1rem',right:'1rem',background:'none',border:'none',cursor:'pointer',color:'#666',fontSize:'20px',lineHeight:1,padding:'4px'}}
        >×</button>

        {submitted ? (
          <div style={{textAlign:'center',padding:'2rem 0'}}>
            <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'#1e3a2e',border:'0.5px solid #2a5a40',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style={{fontSize:'18px',fontWeight:500,color:'#f0f0f0',marginBottom:'.5rem'}}>Message envoyé</h3>
            <p style={{fontSize:'14px',color:'#888',lineHeight:1.6}}>Notre équipe vous contactera sous 24h.</p>
            <button onClick={onClose} style={{marginTop:'1.5rem',padding:'10px 28px',background:'#f0f0f0',color:'#111',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:500,cursor:'pointer'}}>Fermer</button>
          </div>
        ) : (
          <>
            <h2 style={{fontSize:'22px',fontWeight:500,color:'#f0f0f0',marginBottom:'.4rem'}}>Parlons-en</h2>
            <p style={{fontSize:'14px',color:'#888',marginBottom:'1.5rem',lineHeight:1.6,borderBottom:'0.5px solid #2e2e2e',paddingBottom:'1.25rem'}}>
              Contactez notre équipe pour découvrir comment notre IA Finance peut aider votre organisation.
            </p>

            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div>
                  <label style={{display:'block',fontSize:'13px',color:'#aaa',marginBottom:'6px'}}>Prénom *</label>
                  <input required placeholder="Prénom" style={{width:'100%',background:'#111',border:'0.5px solid #2e2e2e',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#f0f0f0',outline:'none'}} onFocus={e=>e.target.style.borderColor='#555'} onBlur={e=>e.target.style.borderColor='#2e2e2e'}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'13px',color:'#aaa',marginBottom:'6px'}}>Nom *</label>
                  <input required placeholder="Nom" style={{width:'100%',background:'#111',border:'0.5px solid #2e2e2e',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#f0f0f0',outline:'none'}} onFocus={e=>e.target.style.borderColor='#555'} onBlur={e=>e.target.style.borderColor='#2e2e2e'}/>
                </div>
              </div>

              <div>
                <label style={{display:'block',fontSize:'13px',color:'#aaa',marginBottom:'6px'}}>Email professionnel *</label>
                <input required type="email" placeholder="vous@entreprise.com" style={{width:'100%',background:'#111',border:'0.5px solid #2e2e2e',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#f0f0f0',outline:'none'}} onFocus={e=>e.target.style.borderColor='#555'} onBlur={e=>e.target.style.borderColor='#2e2e2e'}/>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div>
                  <label style={{display:'block',fontSize:'13px',color:'#aaa',marginBottom:'6px'}}>Site web *</label>
                  <input required placeholder="entreprise.com" style={{width:'100%',background:'#111',border:'0.5px solid #2e2e2e',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#f0f0f0',outline:'none'}} onFocus={e=>e.target.style.borderColor='#555'} onBlur={e=>e.target.style.borderColor='#2e2e2e'}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'13px',color:'#aaa',marginBottom:'6px'}}>Rôle *</label>
                  <input required placeholder="ex: CFO, Directeur" style={{width:'100%',background:'#111',border:'0.5px solid #2e2e2e',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#f0f0f0',outline:'none'}} onFocus={e=>e.target.style.borderColor='#555'} onBlur={e=>e.target.style.borderColor='#2e2e2e'}/>
                </div>
              </div>

              <div>
                <label style={{display:'block',fontSize:'13px',color:'#aaa',marginBottom:'6px'}}>Qu'aimeriez-vous discuter ? *</label>
                <textarea required placeholder="Décrivez votre besoin..." rows={4} style={{width:'100%',background:'#111',border:'0.5px solid #2e2e2e',borderRadius:'8px',padding:'10px 12px',fontSize:'14px',color:'#f0f0f0',outline:'none',resize:'vertical',fontFamily:'inherit'}} onFocus={e=>e.target.style.borderColor='#555'} onBlur={e=>e.target.style.borderColor='#2e2e2e'}/>
              </div>

              <button type="submit" style={{width:'100%',padding:'12px',background:'#f0f0f0',color:'#111',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:500,cursor:'pointer',marginTop:'4px'}}>
                Envoyer
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default function PricingPage() {
  const [currency, setCurrency] = useState('USD');
  const [showModal, setShowModal] = useState(false);

  const getPrice = (base) => {
    if (base === 0) return '0';
    if (currency === 'EUR') return (base * 0.92).toFixed(2);
    if (currency === 'GBP') return (base * 0.79).toFixed(2);
    return base.toFixed(2);
  };

  const sym = { USD: '$', EUR: '€', GBP: '£' }[currency];

  const BG = '#141414';
  const CARD = '#1a1a1a';
  const BORDER = '#2a2a2a';
  const TEXT = '#f0f0f0';
  const MUTED = '#888';
  const SUBTLE = '#444';

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      badge: null,
      desc: 'Pour explorer et un usage individuel',
      btnLabel: 'Commencer',
      btnStyle: { background: 'transparent', color: TEXT, border: `0.5px solid ${BORDER}` },
      features: ['50 générations / mois', 'Analyses financières', 'Export PDF', 'Support email', '1 utilisateur'],
      notIncluded: ['Intégrations API', 'Équipes', 'Modèle personnalisé'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 69,
      badge: 'Populaire',
      desc: 'Pour les équipes qui produisent à grande échelle',
      btnLabel: 'Choisir Pro',
      btnStyle: { background: '#f0f0f0', color: '#111', border: 'none' },
      features: ['500 générations / mois', 'Analyses + prévisions', 'Export PDF & CSV', 'Intégrations API', "Jusqu'à 5 utilisateurs", 'Support prioritaire'],
      notIncluded: ['Modèle personnalisé', 'SLA garanti'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: null,
      badge: null,
      desc: 'Pour les grandes organisations, sur mesure',
      btnLabel: 'Nous contacter',
      btnStyle: { background: 'transparent', color: TEXT, border: `0.5px solid ${BORDER}` },
      features: ['Générations illimitées', 'Modèle IA personnalisé', 'SSO + sécurité avancée', 'SLA garanti', 'Utilisateurs illimités', 'Onboarding dédié', 'Audit log & conformité'],
      notIncluded: [],
    },
  ];

  const tableFeatures = [
    { label: 'Générations / mois', vals: ['50', '500', 'Illimitées'] },
    { label: 'Analyses financières', vals: [true, true, true] },
    { label: 'Prévisions IA', vals: [false, true, true] },
    { label: 'Export PDF', vals: [true, true, true] },
    { label: 'Export CSV', vals: [false, true, true] },
    { label: 'Intégrations API', vals: [false, true, true] },
    { label: 'Génération interfaces', vals: ['Basique', 'Avancée', 'Sur mesure'] },
    { label: 'Utilisateurs', vals: ['1', "Jusqu'à 5", 'Illimités'] },
    { label: 'Support', vals: ['Email', 'Prioritaire', 'Dédié'] },
    { label: 'SSO & sécurité avancée', vals: [false, false, true] },
    { label: 'SLA garanti', vals: [false, false, true] },
    { label: 'Audit log', vals: [false, false, true] },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'system-ui, -apple-system, sans-serif', color: TEXT, paddingBottom: '6rem' }}>
      {showModal && <ContactModal onClose={() => setShowModal(false)} />}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 2rem' }}>

        {/* Header */}
        <div style={{ paddingTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <p style={{ fontSize: '12px', letterSpacing: '.08em', color: MUTED, textTransform: 'uppercase', marginBottom: '.4rem' }}>Tarifs</p>
            <h1 style={{ fontSize: '30px', fontWeight: 500, color: TEXT, lineHeight: 1.1 }}>Choisissez votre forfait</h1>
            <p style={{ fontSize: '15px', color: MUTED, marginTop: '.4rem' }}>IA Finance · Génération d'interfaces</p>
          </div>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            style={{ background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: '999px', padding: '6px 14px', fontSize: '12px', color: MUTED, cursor: 'pointer', outline: 'none' }}
          >
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '3rem' }}>
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              style={{
                background: CARD,
                border: plan.badge ? `1.5px solid #3a3a3a` : `0.5px solid ${BORDER}`,
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
              }}
            >
              {plan.badge && (
                <span style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', background: '#2a2a2a', border: `0.5px solid ${BORDER}`, borderRadius: '999px', fontSize: '11px', padding: '3px 12px', color: '#bbb', whiteSpace: 'nowrap' }}>
                  ⭐ {plan.badge}
                </span>
              )}

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: TEXT, marginBottom: '.3rem' }}>{plan.name}</h3>
                <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.5 }}>{plan.desc}</p>
              </div>

              <div>
                {plan.price !== null ? (
                  <>
                    <span style={{ fontSize: '32px', fontWeight: 500, color: TEXT }}>{sym}{getPrice(plan.price)}</span>
                    <span style={{ fontSize: '13px', color: MUTED }}> / mois</span>
                  </>
                ) : (
                  <span style={{ fontSize: '22px', fontWeight: 500, color: TEXT }}>Sur devis</span>
                )}
              </div>

              <button
                onClick={() => plan.id === 'enterprise' && setShowModal(true)}
                style={{ width: '100%', padding: '11px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'opacity .15s', ...plan.btnStyle }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {plan.btnLabel}
              </button>

              <div style={{ borderTop: `0.5px solid ${BORDER}`, paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#ccc' }}>
                    <svg style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px', color: '#4ade80' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
                {plan.notIncluded.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: SUBTLE }}>
                    <svg style={{ width: '14px', height: '14px', flexShrink: 0, marginTop: '2px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <h2 style={{ fontSize: '16px', fontWeight: 500, color: TEXT, marginBottom: '1rem' }}>Comparer tous les forfaits</h2>
        <div style={{ background: '#111', border: `0.5px solid ${BORDER}`, borderRadius: '14px', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${BORDER}` }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', color: MUTED, fontWeight: 400, width: '34%' }}>Fonctionnalité</th>
                {plans.map(p => (
                  <th key={p.id} style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 500, color: p.badge ? TEXT : MUTED }}>
                    {p.name}
                    {p.badge && <span style={{ display: 'block', fontSize: '10px', color: '#777', fontWeight: 400 }}>{sym}{p.price ? getPrice(p.price) + '/mo' : 'Sur devis'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableFeatures.map((row, i) => (
                <tr key={i} style={{ borderBottom: `0.5px solid #1e1e1e` }}>
                  <td style={{ padding: '12px 20px', color: MUTED }}>{row.label}</td>
                  {row.vals.map((v, j) => (
                    <td key={j} style={{ padding: '12px 16px', textAlign: 'center', color: '#ccc' }}>
                      {v === true ? (
                        <svg style={{ width: '15px', height: '15px', display: 'inline-block', color: '#4ade80' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : v === false ? (
                        <span style={{ color: '#333', fontSize: '16px' }}>—</span>
                      ) : (
                        <span style={{ color: '#ccc' }}>{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Enterprise CTA banner */}
        <div style={{ marginTop: '2rem', background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: '14px', padding: '1.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 500, color: TEXT, marginBottom: '.3rem' }}>Vous avez des besoins spécifiques ?</h3>
            <p style={{ fontSize: '13px', color: MUTED, lineHeight: 1.5 }}>Notre équipe peut créer un plan sur mesure pour votre organisation.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: '#f0f0f0', color: '#111', border: 'none', borderRadius: '8px', padding: '11px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Nous contacter
          </button>
        </div>

      </div>
    </div>
  );
}