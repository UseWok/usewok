import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { loadPlansFromDB, getPlansConfig } from '@/lib/plans-config';
import PlanCard from '@/components/pricing/PlanCard';

const WIX = "'Madefor Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function LandingPricingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState('monthly');

  useEffect(() => {
    document.body.style.backgroundColor = '#FBF8F2';
    document.body.style.fontFamily = WIX;
    loadPlansFromDB()
      .then(db => { setPlans((db || getPlansConfig()).filter(p => p.visible !== false)); setLoading(false); })
      .catch(() => { setPlans(getPlansConfig().filter(p => p.visible !== false)); setLoading(false); });
    return () => { document.body.style.backgroundColor = ''; document.body.style.fontFamily = ''; };
  }, []);

  const goRegister = () => navigate('/register');
  const goLogin = () => navigate('/login');
  const goHome = () => navigate('/');
  const goBlog = () => navigate('/blog');

  const sortedPlans = [...plans].sort((a, b) => (a.price_monthly || 0) - (b.price_monthly || 0));

  const samplePaid = sortedPlans.find(p => p.price_monthly && p.price_yearly);
  const discount = samplePaid ? Math.round((1 - (samplePaid.price_yearly / (samplePaid.price_monthly * 12))) * 100) : 0;

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF8F2', fontFamily: WIX }}>
      <div style={{ width: 20, height: 20, border: '2px solid rgba(21,19,15,0.08)', borderTopColor: '#FF5A1F', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: WIX, background: '#FBF8F2', color: '#15130F', minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        .uw-pricing * { box-sizing: border-box; }
        .uw-pricing .wrap { max-width: 1160px; margin: 0 auto; padding: 0 40px; }
        .uw-pricing section { padding: 80px 0; }
        .uw-pricing h1, .uw-pricing h2, .uw-pricing h3 { font-weight: 800; letter-spacing: -0.03em; }
        .uw-pricing .serif { font-family: 'Fraunces', serif; font-weight: 500; }
        .uw-pricing .eyebrow { display: inline-flex; align-items: center; gap: 7px; font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #C43E14; }
        .uw-pricing .eyebrow .dot { width: 6px; height: 6px; border-radius: 50%; background: #FF5A1F; }
        .uw-pricing .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 22px; border-radius: 100px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; transition: transform .15s ease, background .15s ease; }
        .uw-pricing .btn:active { transform: scale(0.97); }
        .uw-pricing .btn-dark { background: #15130F; color: #FBF8F2; }
        .uw-pricing .btn-dark:hover { background: #C43E14; }
        .uw-pricing .btn-outline { background: transparent; color: #15130F; border: 1px solid rgba(21,19,15,0.14); }
        .uw-pricing .btn-outline:hover { border-color: #15130F; }
        .uw-pricing nav { position: sticky; top: 0; z-index: 20; background: rgba(251,248,242,0.82); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(21,19,15,0.10); }
        .uw-pricing nav .wrap { display: flex; align-items: center; justify-content: space-between; height: 74px; }
        .uw-pricing .brand { display: flex; align-items: center; gap: 9px; cursor: pointer; }
        .uw-pricing .brand .mark { width: 26px; height: 26px; border-radius: 7px; background: #FF5A1F; display: flex; align-items: center; justify-content: center; }
        .uw-pricing .brand .mark svg { width: 13px; height: 13px; }
        .uw-pricing .brand span { font-weight: 700; font-size: 15.5px; }
        .uw-pricing .navlinks { display: flex; align-items: center; gap: 34px; font-size: 14px; font-weight: 500; color: #4A453B; }
        .uw-pricing .navlinks button { background: none; border: none; cursor: pointer; font-family: inherit; font-size: inherit; font-weight: inherit; color: inherit; padding: 0; }
        .uw-pricing .navlinks button:hover { color: #15130F; }
        .uw-pricing .navlinks button.active { color: #15130F; }
        .uw-pricing .navright { display: flex; align-items: center; gap: 12px; }
        .uw-pricing .p-hero { text-align: center; padding: 72px 0 8px; }
        .uw-pricing .p-hero h1 { font-size: 48px; margin-bottom: 14px; }
        .uw-pricing .p-hero p { font-size: 15.5px; color: rgba(21,19,15,0.55); }
        .uw-pricing .toggle { display: inline-flex; margin: 34px auto 0; padding: 4px; background: #F3EEE3; border-radius: 100px; }
        .uw-pricing .toggle span { padding: 9px 20px; font-size: 13.5px; font-weight: 600; border-radius: 100px; cursor: pointer; color: rgba(21,19,15,0.55); display: flex; align-items: center; gap: 7px; border: none; background: none; font-family: inherit; }
        .uw-pricing .toggle span.on { background: #15130F; color: #FBF8F2; }
        .uw-pricing .toggle .save { font-size: 10.5px; font-weight: 700; color: #C43E14; background: #FFE7D6; padding: 2px 7px; border-radius: 100px; }
        .uw-pricing .toggle-wrap { text-align: center; }
        .uw-pricing .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 52px; align-items: start; }
        .uw-pricing .trustbar { padding: 70px 0; text-align: center; }
        .uw-pricing .trustlogos { display: flex; justify-content: center; align-items: center; gap: 40px; flex-wrap: wrap; margin-top: 28px; }
        .uw-pricing .tlogo { display: flex; align-items: center; gap: 8px; opacity: 0.75; }
        .uw-pricing .tlogo .ic { width: 26px; height: 26px; border-radius: 7px; background: #15130F; color: #FBF8F2; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .uw-pricing .tlogo span { font-weight: 700; font-size: 14.5px; }
        .uw-pricing .testi { display: flex; align-items: center; gap: 40px; }
        .uw-pricing .testi .av { width: 88px; height: 88px; border-radius: 18px; background: #FFE7D6; flex-shrink: 0; }
        .uw-pricing .testi blockquote { font-family: 'Fraunces', serif; font-weight: 500; font-size: 24px; line-height: 1.35; margin-bottom: 16px; max-width: 620px; }
        .uw-pricing .testi cite { font-style: normal; font-size: 13.5px; color: rgba(21,19,15,0.55); }
        .uw-pricing .cta-band { position: relative; overflow: hidden; border-radius: 26px; padding: 70px 40px; text-align: center; background: radial-gradient(70% 70% at 15% 20%, #FFD9BE 0%, transparent 55%), radial-gradient(70% 70% at 88% 85%, #FFB98F 0%, transparent 55%), linear-gradient(160deg, #FFF3E9 0%, #FFE0C7 100%); }
        .uw-pricing .cta-band::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(196,62,20,0.09) 1px, transparent 1px); background-size: 24px 24px; mask-image: radial-gradient(ellipse 65% 60% at 50% 50%, black 0%, transparent 70%); -webkit-mask-image: radial-gradient(ellipse 65% 60% at 50% 50%, black 0%, transparent 70%); }
        .uw-pricing .cta-band > * { position: relative; z-index: 2; }
        .uw-pricing .cta-band h2 { font-size: 32px; max-width: 560px; margin: 0 auto 26px; line-height: 1.2; }
        .uw-pricing .cta-btns { display: flex; gap: 12px; justify-content: center; margin-bottom: 18px; }
        .uw-pricing .cta-band .noc { font-size: 12.5px; color: rgba(21,19,15,0.55); }
        .uw-pricing .faq-wrap { max-width: 680px; margin: 0 auto; }
        .uw-pricing .faq-wrap h2 { text-align: center; font-size: 28px; margin-bottom: 36px; }
        .uw-pricing details { border-bottom: 1px solid rgba(21,19,15,0.10); padding: 20px 4px; }
        .uw-pricing details summary { cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; font-size: 14.5px; font-weight: 600; }
        .uw-pricing details summary::-webkit-details-marker { display: none; }
        .uw-pricing details summary::after { content: '+'; font-size: 20px; font-weight: 400; color: rgba(21,19,15,0.55); }
        .uw-pricing details[open] summary::after { content: '–'; }
        .uw-pricing details p { font-size: 13.5px; color: rgba(21,19,15,0.55); line-height: 1.6; margin-top: 14px; }
        .uw-pricing footer { padding: 80px 0 40px; }
        .uw-pricing .foot-top { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 60px; }
        .uw-pricing .foot-brand p { font-size: 13.5px; color: rgba(21,19,15,0.55); line-height: 1.6; margin: 16px 0 20px; max-width: 280px; }
        .uw-pricing .foot-social { display: flex; gap: 10px; }
        .uw-pricing .foot-social a { width: 32px; height: 32px; border-radius: 9px; background: #F3EEE3; display: flex; align-items: center; justify-content: center; text-decoration: none; color: #4A453B; font-size: 13px; }
        .uw-pricing .foot-col h5 { font-size: 11.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(21,19,15,0.55); margin-bottom: 16px; }
        .uw-pricing .foot-col button { display: block; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 13.5px; color: #4A453B; text-align: left; margin-bottom: 11px; padding: 0; }
        .uw-pricing .foot-col button:hover { color: #15130F; }
        .uw-pricing .foot-bottom { display: flex; justify-content: space-between; padding-top: 26px; border-top: 1px solid rgba(21,19,15,0.10); font-size: 12.5px; color: rgba(21,19,15,0.55); }
        .uw-pricing .foot-bottom .fr { display: flex; align-items: center; gap: 6px; }
        .uw-pricing .foot-bottom .fr .flag { width: 12px; height: 12px; border-radius: 50%; background: linear-gradient(90deg,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%); }
        @media (max-width: 900px) {
          .uw-pricing .wrap { padding: 0 20px; }
          .uw-pricing .navlinks { display: none; }
          .uw-pricing .pricing-grid { grid-template-columns: 1fr; }
          .uw-pricing .testi { flex-direction: column; text-align: center; }
          .uw-pricing .foot-top { grid-template-columns: 1fr; }
          .uw-pricing .p-hero h1 { font-size: 36px; }
        }
      `}</style>

      <div className="uw-pricing">
        {/* NAV */}
        <nav>
          <div className="wrap">
            <div className="brand" onClick={goHome}>
              <div className="mark"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3L21 20H3L12 3Z" fill="#FBF8F2"/></svg></div>
              <span>UseWok</span>
            </div>
            <div className="navlinks">
              <button onClick={goHome}>Produit</button>
              <button onClick={goHome}>Cas d'usage</button>
              <button className="active">Tarifs</button>
              <button onClick={goBlog}>Ressources</button>
            </div>
            <div className="navright">
              <button className="btn btn-outline" onClick={goLogin}>Se connecter</button>
              <button className="btn btn-dark" onClick={goRegister}>Commencer</button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="p-hero">
          <div className="wrap">
            <span className="eyebrow" style={{ justifyContent: 'center', display: 'flex', marginBottom: 16 }}><span className="dot"></span>Tarifs simples</span>
            <h1>Des tarifs flexibles</h1>
            <p>Commencez gratuitement. Changez de formule ou annulez à tout moment.</p>
            <div className="toggle-wrap">
              <div className="toggle">
                <button className={billing === 'monthly' ? 'on' : ''} onClick={() => setBilling('monthly')}>Mensuel</button>
                <button className={billing === 'yearly' ? 'on' : ''} onClick={() => setBilling('yearly')}>Annuel {discount > 0 && <span className="save">-{discount}%</span>}</button>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING CARDS */}
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="pricing-grid">
              {sortedPlans.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  billing={billing}
                  isCurrent={false}
                  onCta={goRegister}
                  ctaLabel={!plan.price_monthly || plan.price_monthly === 0 ? 'Commencer gratuitement' : `Choisir ${plan.name}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* TRUST BAR */}
        <div className="trustbar">
          <div className="wrap">
            <span className="eyebrow" style={{ justifyContent: 'center', display: 'flex' }}>Ils suivent déjà leur visibilité IA</span>
            <div className="trustlogos">
              <div className="tlogo"><span className="ic">N</span><span>Norea</span></div>
              <div className="tlogo"><span className="ic">K</span><span>Klarcy</span></div>
              <div className="tlogo"><span className="ic">M</span><span>Mio One</span></div>
              <div className="tlogo"><span className="ic">IB</span><span>Iberia Digital</span></div>
              <div className="tlogo"><span className="ic">E</span><span>Embat</span></div>
              <div className="tlogo"><span className="ic">P</span><span>Presqu'Île</span></div>
            </div>
          </div>
        </div>

        {/* TESTIMONIAL */}
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="testi">
              <div className="av"></div>
              <div>
                <blockquote>« UseWok ne nous a pas juste donné des données, ça nous a donné une direction. On sait exactement où on peut gagner et quoi prioriser. »</blockquote>
                <cite>Responsable Marketing, PME digitale</cite>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section>
          <div className="wrap">
            <div className="cta-band">
              <h2 className="serif">10x votre visibilité IA sans devenir expert GEO</h2>
              <div className="cta-btns">
                <button className="btn btn-dark" onClick={goRegister}>Essai gratuit 14 jours</button>
                <button className="btn btn-outline" style={{ background: '#fff' }} onClick={goHome}>Voir une démo</button>
              </div>
              <p className="noc">Sans carte bancaire · Gratuit 14 jours · Votre score en moins de 3 minutes</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="wrap">
            <div className="faq-wrap">
              <h2>Questions fréquentes</h2>
              <details open>
                <summary>Qu'est-ce que UseWok ?</summary>
                <p>UseWok est une plateforme de visibilité IA qui montre où et comment votre marque apparaît dans les moteurs IA comme ChatGPT, Perplexity, Google AI Overviews, Claude et Gemini. UseWok va plus loin et vous montre comment agir sur vos données pour apparaître dans les futures réponses des IA.</p>
              </details>
              <details>
                <summary>Quels moteurs IA puis-je suivre ?</summary>
                <p>UseWok suit les principaux moteurs IA : ChatGPT, Perplexity, Google AI Overviews, Google AI mode, Claude, Microsoft Copilot et Gemini.</p>
              </details>
              <details>
                <summary>Puis-je changer de formule à tout moment ?</summary>
                <p>Oui, vous pouvez changer de plan ou annuler à tout moment, sans engagement.</p>
              </details>
              <details>
                <summary>Mes données sont-elles hébergées en France ?</summary>
                <p>Oui — UseWok est conçu et hébergé en France, dans le respect du RGPD.</p>
              </details>
              <details>
                <summary>Combien de temps pour voir des résultats en AEO ?</summary>
                <p>Nous avons vu des résultats en AEO en 7 jours seulement avec nos clients. La visibilité IA peut être influencée beaucoup plus rapidement qu'avec le SEO traditionnel.</p>
              </details>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="wrap">
            <div className="foot-top">
              <div className="foot-brand">
                <div className="brand" onClick={goHome}><div className="mark"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3L21 20H3L12 3Z" fill="#FBF8F2"/></svg></div><span>UseWok</span></div>
                <p>UseWok est la plateforme française qui mesure et améliore votre visibilité sur les moteurs IA.</p>
                <div className="foot-social">
                  <a href="https://x.com/usewok" target="_blank" rel="noopener noreferrer">𝕏</a>
                  <a href="https://linkedin.com/company/usewok" target="_blank" rel="noopener noreferrer">in</a>
                  <a href="https://instagram.com/usewok" target="_blank" rel="noopener noreferrer">◎</a>
                </div>
              </div>
              <div className="foot-col">
                <h5>Produit</h5>
                <button onClick={goHome}>Fonctionnalités</button>
                <button onClick={() => {}}>Tarifs</button>
                <button onClick={goHome}>Intégrations</button>
              </div>
              <div className="foot-col">
                <h5>Ressources</h5>
                <button onClick={goBlog}>Documentation</button>
                <button onClick={goBlog}>Blog</button>
                <button onClick={goBlog}>Communauté</button>
              </div>
              <div className="foot-col">
                <h5>Légal</h5>
                <button onClick={() => navigate('/privacy')}>Confidentialité</button>
                <button onClick={() => navigate('/terms')}>Conditions</button>
                <button onClick={() => navigate('/legal')}>Sécurité</button>
              </div>
            </div>
            <div className="foot-bottom">
              <span>© 2026 UseWok. Tous droits réservés.</span>
              <span className="fr"><span className="flag"></span>Conçu en France</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}