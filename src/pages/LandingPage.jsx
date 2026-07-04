import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AnalyzeLeadModal from '@/components/landing/AnalyzeLeadModal';

export default function LandingPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const featuresRef = useRef(null);
  const howRef = useRef(null);
  const stackRef = useRef(null);

  useEffect(() => {
    document.body.style.backgroundColor = '#FBF8F2';
    document.body.style.color = '#15130F';
    base44.auth.isAuthenticated()
      .then(a => { if (a) navigate('/app', { replace: true }); else setReady(true); })
      .catch(() => setReady(true));
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    };
  }, [navigate]);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const goRegister = () => navigate('/register');
  const goLogin = () => navigate('/login');
  const goPricing = () => navigate('/tarifs');
  const goBlog = () => navigate('/blog');

  if (!ready) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF8F2' }}>
      <div style={{ width: 20, height: 20, border: '2px solid rgba(21,19,15,0.08)', borderTopColor: '#FF5A1F', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div className="uw-landing">
      <style>{`
        :root{
          --cream:#FBF8F2; --cream-2:#F3EEE3; --ink:#15130F; --ink-soft:#4A453B;
          --ink-faint:rgba(21,19,15,0.55); --orange:#FF5A1F; --orange-deep:#C43E14;
          --orange-pale:#FFE7D6; --amber:#FFCB6B; --line:rgba(21,19,15,0.10);
          --line-strong:rgba(21,19,15,0.14); --navy:#0E2A33;
        }
        .uw-landing *{box-sizing:border-box;}
        .uw-landing{ font-family:'Inter',sans-serif; background:var(--cream); color:var(--ink); -webkit-font-smoothing:antialiased; }
        .uw-landing .wrap{ max-width:1160px; margin:0 auto; padding:0 40px; }
        .uw-landing section{ padding:96px 0; }
        .uw-landing h1,.uw-landing h2,.uw-landing h3{ font-weight:800; letter-spacing:-0.03em; }
        .uw-landing .serif{ font-family:'Fraunces', serif; font-weight:500; letter-spacing:-0.01em; }
        .uw-landing .btn{
          display:inline-flex; align-items:center; gap:8px; height:46px; padding:0 22px;
          border-radius:100px; font-size:14px; font-weight:600; border:none; cursor:pointer;
          font-family:inherit; transition:transform .15s ease, background .15s ease, opacity .15s ease;
        }
        .uw-landing .btn:active{ transform:scale(0.97); }
        .uw-landing .btn-dark{ background:var(--ink); color:var(--cream); }
        .uw-landing .btn-dark:hover{ background:var(--orange-deep); }
        .uw-landing .btn-outline{ background:transparent; color:var(--ink); border:1px solid var(--line-strong); }
        .uw-landing .btn-outline:hover{ border-color:var(--ink); }
        .uw-landing .eyebrow{
          display:inline-flex; align-items:center; gap:7px; font-size:11.5px; font-weight:700;
          letter-spacing:0.05em; text-transform:uppercase; color:var(--orange-deep);
        }
        .uw-landing .eyebrow .dot{ width:6px; height:6px; border-radius:50%; background:var(--orange); }
        .uw-landing nav{
          position:sticky; top:0; z-index:20; background:rgba(251,248,242,0.82);
          backdrop-filter:blur(14px); border-bottom:1px solid var(--line);
        }
        .uw-landing nav .wrap{ display:flex; align-items:center; justify-content:space-between; height:74px; }
        .uw-landing .brand{ display:flex; align-items:center; gap:9px; cursor:pointer; }
        .uw-landing .brand .mark{ width:26px; height:26px; border-radius:7px; background:var(--orange); display:flex; align-items:center; justify-content:center; }
        .uw-landing .brand .mark svg{ width:13px; height:13px; }
        .uw-landing .brand span{ font-weight:700; font-size:15.5px; }
        .uw-landing .navlinks{ display:flex; align-items:center; gap:34px; font-size:14px; font-weight:500; color:var(--ink-soft); }
        .uw-landing .navlinks button{ background:none; border:none; cursor:pointer; font-family:inherit; font-size:inherit; font-weight:inherit; color:inherit; padding:0; }
        .uw-landing .navlinks button:hover{ color:var(--ink); }
        .uw-landing .navright{ display:flex; align-items:center; gap:18px; }
        .uw-landing .hero{
          position:relative; padding:120px 0 80px; text-align:center; overflow:hidden;
          background: radial-gradient(70% 60% at 15% 10%, #FFD9BE 0%, transparent 55%),
            radial-gradient(70% 60% at 88% 20%, #FFB98F 0%, transparent 55%),
            linear-gradient(180deg, #FBF8F2 0%, #FFF3E9 100%);
        }
        .uw-landing .hero::before{
          content:''; position:absolute; inset:0;
          background-image:radial-gradient(rgba(196,62,20,0.08) 1px, transparent 1px);
          background-size:26px 26px;
          mask-image:radial-gradient(ellipse 60% 50% at 50% 20%, black 0%, transparent 70%);
          -webkit-mask-image:radial-gradient(ellipse 60% 50% at 50% 20%, black 0%, transparent 70%);
        }
        .uw-landing .hero-inner{ position:relative; z-index:2; }
        .uw-landing .hero h1{ font-size:64px; line-height:1.06; max-width:820px; margin:22px auto 20px; }
        .uw-landing .hero h1 .hi{ color:var(--orange-deep); font-style:italic; font-family:'Fraunces', serif; font-weight:500; }
        .uw-landing .hero p{ font-size:17px; color:var(--ink-soft); max-width:480px; margin:0 auto 32px; }
        .uw-landing .hero-ctas{ display:flex; justify-content:center; gap:12px; }
        .uw-landing .hero-strip{ display:flex; justify-content:center; gap:10px; margin-top:56px; flex-wrap:wrap; }
        .uw-landing .strip-pill{
          display:flex; align-items:center; gap:7px; font-size:12.5px; font-weight:600;
          color:var(--ink-soft); background:#fff; border:1px solid var(--line);
          padding:8px 15px; border-radius:100px;
        }
        .uw-landing .strip-pill b{ color:var(--ink); }
        .uw-landing .panels{ display:grid; grid-template-columns:0.85fr 1.15fr; gap:20px; }
        .uw-landing .panel{ border-radius:22px; padding:44px; min-height:420px; }
        .uw-landing .panel-light{ background:var(--cream-2); }
        .uw-landing .panel-light .k{ font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:var(--orange-deep); margin-bottom:16px; }
        .uw-landing .panel-light h3{ font-size:27px; margin-bottom:24px; max-width:280px; }
        .uw-landing .feat{ margin-bottom:22px; }
        .uw-landing .feat b{ display:block; font-size:14.5px; margin-bottom:5px; }
        .uw-landing .feat p{ font-size:13.5px; color:var(--ink-faint); line-height:1.5; }
        .uw-landing .panel-glow{
          position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center;
          background: radial-gradient(80% 70% at 15% 15%, #FFC79B 0%, transparent 60%),
            radial-gradient(80% 70% at 90% 90%, #FF8A4C 0%, transparent 55%),
            linear-gradient(160deg, #FFF3E9 0%, #FFE0C7 100%);
        }
        .uw-landing .prompt-card{
          width:100%; max-width:420px; background:rgba(255,255,255,0.6);
          border:1px solid rgba(255,255,255,0.75); border-radius:16px;
          padding:20px 20px 14px; backdrop-filter:blur(14px);
        }
        .uw-landing .prompt-card p{ font-size:15.5px; color:var(--ink); line-height:1.4; margin-bottom:14px; }
        .uw-landing .prompt-card .caret{ display:inline-block; width:1px; height:16px; background:var(--orange-deep); vertical-align:-3px; animation:uwblink 1s step-end infinite; }
        @keyframes uwblink{ 50%{ opacity:0; } }
        .uw-landing .prompt-actions{ display:flex; align-items:center; gap:14px; }
        .uw-landing .prompt-actions .a{ font-size:12px; font-weight:600; color:var(--ink-soft); display:flex; align-items:center; gap:5px; }
        .uw-landing .prompt-actions .send{ margin-left:auto; width:32px; height:32px; border-radius:9px; background:var(--orange); display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .uw-landing .prompt-actions .send svg{ width:14px; height:14px; }
        .uw-landing .panels2{ display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:20px; }
        .uw-landing .panel-scores{
          border-radius:22px; padding:44px; display:flex; flex-direction:column; justify-content:center; gap:14px;
          background:linear-gradient(150deg, #FFE7D6 0%, #FBF8F2 60%, #F3EEE3 100%);
        }
        .uw-landing .score-row{ display:flex; align-items:center; gap:16px; background:#fff; border:1px solid var(--line); border-radius:14px; padding:14px 18px; }
        .uw-landing .score-row .ic{ width:32px; height:32px; border-radius:9px; background:var(--ink); display:flex; align-items:center; justify-content:center; font-size:13px; color:var(--cream); font-weight:700; flex-shrink:0; }
        .uw-landing .score-row .name{ font-size:14px; font-weight:600; flex:1; }
        .uw-landing .score-row .bar{ width:110px; height:6px; border-radius:100px; background:var(--line); overflow:hidden; }
        .uw-landing .score-row .bar i{ display:block; height:100%; background:var(--orange); border-radius:100px; }
        .uw-landing .score-row .val{ font-size:13px; font-weight:700; color:var(--orange-deep); width:28px; text-align:right; }
        .uw-landing .panel-check{ background:#fff; border:1px solid var(--line); border-radius:22px; padding:44px; }
        .uw-landing .panel-check h3{ font-size:24px; margin-bottom:12px; }
        .uw-landing .panel-check > p{ font-size:14px; color:var(--ink-faint); margin-bottom:26px; line-height:1.5; }
        .uw-landing .check-item{ display:flex; gap:12px; margin-bottom:18px; }
        .uw-landing .check-item svg{ width:18px; height:18px; flex-shrink:0; margin-top:1px; color:var(--orange-deep); }
        .uw-landing .check-item b{ font-size:13.5px; }
        .uw-landing .check-item span{ display:block; font-size:13px; color:var(--ink-faint); line-height:1.45; margin-top:2px; }
        .uw-landing .confidence-top{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:44px; gap:40px; }
        .uw-landing .confidence-top h2{ font-size:38px; max-width:420px; }
        .uw-landing .confidence-top p{ font-size:14.5px; color:var(--ink-faint); max-width:320px; line-height:1.55; margin-bottom:16px; }
        .uw-landing .cards3{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .uw-landing .card3{ border-radius:18px; padding:28px; background:linear-gradient(165deg, #FFF3E9 0%, #FFE7D6 100%); min-height:200px; display:flex; flex-direction:column; justify-content:space-between; }
        .uw-landing .card3 h4{ font-size:19px; font-weight:700; letter-spacing:-0.01em; line-height:1.2; }
        .uw-landing .card3 p{ font-size:13px; color:var(--ink-faint); line-height:1.5; margin-top:16px; }
        .uw-landing .stackband{ background:var(--ink); border-radius:26px; padding:80px 40px; text-align:center; color:var(--cream); }
        .uw-landing .stackband h2{ font-size:42px; }
        .uw-landing .stackband h2 .hi{ color:var(--amber); font-family:'Fraunces', serif; font-style:italic; font-weight:500; }
        .uw-landing .stackband p{ font-size:14.5px; color:rgba(251,248,242,0.6); max-width:460px; margin:18px auto 48px; line-height:1.55; }
        .uw-landing .logos{ display:flex; justify-content:center; gap:44px; flex-wrap:wrap; opacity:0.85; }
        .uw-landing .logos .lg{ display:flex; align-items:center; gap:8px; font-weight:700; font-size:15px; color:rgba(251,248,242,0.9); }
        .uw-landing .logos .lg .sw{ width:18px; height:18px; border-radius:5px; background:rgba(251,248,242,0.15); display:flex; align-items:center; justify-content:center; }
        .uw-landing .finalcta{
          position:relative; overflow:hidden; border-radius:26px; padding:100px 40px;
          display:flex; align-items:center; justify-content:center;
          background: radial-gradient(60% 80% at 10% 90%, #FFB98F 0%, transparent 60%),
            radial-gradient(70% 90% at 90% 10%, #FF7A3D 0%, transparent 55%),
            linear-gradient(155deg, #FF5A1F 0%, #C43E14 100%);
        }
        .uw-landing .finalcta::before{
          content:''; position:absolute; inset:0;
          background-image: linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size:46px 46px;
          mask-image:radial-gradient(circle at 50% 50%, black 0%, transparent 75%);
          -webkit-mask-image:radial-gradient(circle at 50% 50%, black 0%, transparent 75%);
        }
        .uw-landing .cta-card{ position:relative; z-index:2; background:var(--cream); border-radius:20px; padding:44px 48px; text-align:center; max-width:360px; }
        .uw-landing .cta-card h3{ font-size:27px; line-height:1.15; margin-bottom:24px; }
        .uw-landing footer{ padding:80px 0 40px; }
        .uw-landing .foot-top{ display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr 1fr; gap:32px; margin-bottom:60px; }
        .uw-landing .foot-brand p{ font-size:13.5px; color:var(--ink-faint); line-height:1.6; margin:16px 0 20px; max-width:280px; }
        .uw-landing .foot-social{ display:flex; gap:10px; }
        .uw-landing .foot-social a{ width:32px; height:32px; border-radius:9px; background:var(--cream-2); display:flex; align-items:center; justify-content:center; text-decoration:none; color:var(--ink-soft); font-size:13px; }
        .uw-landing .foot-social a:hover{ background:var(--orange-pale); color:var(--orange-deep); }
        .uw-landing .foot-col h5{ font-size:11.5px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:16px; }
        .uw-landing .foot-col button{ display:block; background:none; border:none; cursor:pointer; font-family:inherit; font-size:13.5px; color:var(--ink-soft); text-align:left; margin-bottom:11px; padding:0; }
        .uw-landing .foot-col button:hover{ color:var(--ink); }
        .uw-landing .foot-bottom{ display:flex; justify-content:space-between; padding-top:26px; border-top:1px solid var(--line); font-size:12.5px; color:var(--ink-faint); }
        .uw-landing .foot-bottom .fr{ display:flex; align-items:center; gap:6px; }
        .uw-landing .foot-bottom .fr .flag{ width:12px; height:12px; border-radius:50%; background:linear-gradient(90deg,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%); }
        .uw-landing .trustbar{ padding:0 0 90px; text-align:center; }
        .uw-landing .trustbar .eyebrow{ display:block; margin-bottom:26px; color:var(--ink-faint); }
        .uw-landing .trustlogos{ display:flex; justify-content:center; align-items:center; gap:46px; flex-wrap:wrap; opacity:0.6; }
        .uw-landing .trustlogos span{ font-weight:700; font-size:15px; color:var(--ink); letter-spacing:-0.01em; }
        .uw-landing .explain-head{ text-align:center; max-width:620px; margin:0 auto 56px; }
        .uw-landing .explain-head h2{ font-size:34px; line-height:1.15; }
        .uw-landing .explain-grid{ display:grid; grid-template-columns:0.9fr 1.2fr 0.9fr; gap:0; align-items:center; }
        .uw-landing .explain-col{ display:flex; flex-direction:column; gap:36px; }
        .uw-landing .explain-col.right{ align-items:flex-end; text-align:right; }
        .uw-landing .explain-item b{ display:block; font-size:15px; margin-bottom:6px; }
        .uw-landing .explain-item p{ font-size:13.5px; color:var(--ink-faint); line-height:1.55; max-width:230px; }
        .uw-landing .explain-item.right p{ margin-left:auto; }
        .uw-landing .explain-center{ display:flex; justify-content:center; }
        .uw-landing .stack-cards{ position:relative; width:210px; height:170px; }
        .uw-landing .stack-cards .c{ position:absolute; width:120px; height:150px; border-radius:16px; top:10px; }
        .uw-landing .stack-cards .c1{ background:var(--orange-pale); left:10px; transform:rotate(-9deg); }
        .uw-landing .stack-cards .c2{ background:var(--amber); left:55px; transform:rotate(3deg); }
        .uw-landing .stack-cards .c3{ background:var(--orange); left:95px; transform:rotate(13deg); }
        .uw-landing .test-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:16px; }
        .uw-landing .test-card{ background:#fff; border:1px solid var(--line); border-radius:16px; padding:24px; }
        .uw-landing .stars{ color:var(--orange); font-size:13px; letter-spacing:2px; margin-bottom:12px; }
        .uw-landing .test-card p{ font-size:13.5px; line-height:1.55; margin-bottom:16px; color:var(--ink-soft); }
        .uw-landing .test-who{ display:flex; align-items:center; gap:10px; }
        .uw-landing .test-who .av{ width:30px; height:30px; border-radius:50%; background:var(--cream-2); flex-shrink:0; }
        .uw-landing .test-who b{ display:block; font-size:12.5px; }
        .uw-landing .test-who span{ font-size:11.5px; color:var(--ink-faint); }
        .uw-landing .stat-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
        .uw-landing .stat-card{ border-radius:16px; padding:26px; display:flex; flex-direction:column; justify-content:flex-end; min-height:150px; }
        .uw-landing .stat-card .big{ font-size:38px; font-weight:800; letter-spacing:-0.02em; }
        .uw-landing .stat-card .lbl{ font-size:12.5px; font-weight:600; margin-top:4px; }
        .uw-landing .stat-1{ background:var(--amber); color:var(--ink); }
        .uw-landing .stat-2{ background:var(--ink); color:var(--cream); }
        .uw-landing .stat-3{ background:var(--orange-pale); color:var(--orange-deep); }
        .uw-landing .faq-wrap{ max-width:680px; margin:0 auto; }
        .uw-landing .faq-wrap h2{ text-align:center; font-size:28px; margin-bottom:36px; }
        .uw-landing details{ border-bottom:1px solid var(--line); padding:20px 4px; }
        .uw-landing details summary{ cursor:pointer; list-style:none; display:flex; justify-content:space-between; align-items:center; font-size:14.5px; font-weight:600; }
        .uw-landing details summary::-webkit-details-marker{ display:none; }
        .uw-landing details summary::after{ content:'+'; font-size:20px; font-weight:400; color:var(--ink-faint); transition:transform .2s ease; }
        .uw-landing details[open] summary::after{ content:'–'; }
        .uw-landing details p{ font-size:13.5px; color:var(--ink-faint); line-height:1.6; margin-top:14px; max-width:560px; }
        .uw-landing .nav-login{ font-size:14px; font-weight:500; color:var(--ink-soft); background:none; border:none; cursor:pointer; font-family:inherit; }
        .uw-landing .nav-login:hover{ color:var(--ink); }
        @media (max-width:900px){
          .uw-landing .explain-grid{ grid-template-columns:1fr; text-align:left; gap:32px; }
          .uw-landing .explain-col.right{ align-items:flex-start; text-align:left; }
          .uw-landing .explain-item.right p{ margin-left:0; }
          .uw-landing .test-grid, .uw-landing .stat-grid{ grid-template-columns:1fr; }
          .uw-landing .trustlogos{ gap:24px; }
          .uw-landing .wrap{ padding:0 20px; }
          .uw-landing .hero h1{ font-size:38px; }
          .uw-landing .panels, .uw-landing .panels2, .uw-landing .cards3, .uw-landing .foot-top{ grid-template-columns:1fr; }
          .uw-landing .navlinks{ display:none; }
          .uw-landing .confidence-top{ flex-direction:column; align-items:flex-start; }
        }
        @media (max-width:640px){
          .uw-landing section{ padding:56px 0; }
          .uw-landing .hero{ padding:80px 0 48px; }
          .uw-landing .hero h1{ font-size:30px; line-height:1.1; }
          .uw-landing .hero p{ font-size:15px; }
          .uw-landing .hero-ctas{ flex-direction:column; gap:10px; width:100%; }
          .uw-landing .hero-ctas .btn{ width:100%; justify-content:center; }
          .uw-landing .hero-strip{ gap:8px; margin-top:36px; }
          .uw-landing .strip-pill{ font-size:11px; padding:6px 12px; }
          .uw-landing .navright{ gap:10px; }
          .uw-landing .navright .btn-dark{ padding:0 16px; height:40px; font-size:13px; }
          .uw-landing .nav-login{ display:none; }
          .uw-landing nav .wrap{ height:60px; }
          .uw-landing .brand span{ font-size:14px; }
          .uw-landing .brand .mark{ width:24px; height:24px; }
          .uw-landing .panel{ padding:28px 22px; min-height:auto; border-radius:16px; }
          .uw-landing .panel-light h3{ font-size:22px; }
          .uw-landing .panel-check{ padding:28px 22px; border-radius:16px; }
          .uw-landing .panel-scores{ padding:28px 22px; border-radius:16px; }
          .uw-landing .score-row{ padding:12px 14px; }
          .uw-landing .score-row .bar{ width:70px; }
          .uw-landing .confidence-top{ gap:20px; margin-bottom:28px; }
          .uw-landing .confidence-top h2{ font-size:26px; }
          .uw-landing .confidence-top p{ font-size:13px; margin-bottom:12px; }
          .uw-landing .explain-head h2{ font-size:24px; }
          .uw-landing .explain-head{ margin-bottom:36px; }
          .uw-landing .explain-col{ gap:24px; }
          .uw-landing .explain-item b{ font-size:14px; }
          .uw-landing .explain-item p{ font-size:12.5px; max-width:100%; }
          .uw-landing .stack-cards{ width:170px; height:140px; }
          .uw-landing .stack-cards .c{ width:100px; height:125px; }
          .uw-landing .stackband{ padding:48px 24px; border-radius:18px; }
          .uw-landing .stackband h2{ font-size:28px; }
          .uw-landing .stackband p{ font-size:13px; margin:14px auto 32px; }
          .uw-landing .logos{ gap:20px; }
          .uw-landing .logos .lg{ font-size:13px; gap:6px; }
          .uw-landing .finalcta{ padding:56px 20px; border-radius:18px; }
          .uw-landing .cta-card{ padding:32px 24px; max-width:100%; }
          .uw-landing .cta-card h3{ font-size:22px; }
          .uw-landing .test-card{ padding:20px; border-radius:14px; }
          .uw-landing .stat-card{ padding:20px; min-height:120px; }
          .uw-landing .stat-card .big{ font-size:30px; }
          .uw-landing .faq-wrap h2{ font-size:22px; margin-bottom:24px; }
          .uw-landing details{ padding:16px 4px; }
          .uw-landing details summary{ font-size:13.5px; }
          .uw-landing details p{ font-size:12.5px; }
          .uw-landing footer{ padding:48px 0 32px; }
          .uw-landing .foot-top{ gap:28px; margin-bottom:40px; }
          .uw-landing .foot-brand p{ font-size:12.5px; max-width:100%; }
          .uw-landing .foot-bottom{ flex-direction:column; gap:8px; text-align:center; padding-top:20px; }
          .uw-landing .trustbar{ padding:0 0 56px; }
          .uw-landing .trustlogos span{ font-size:13px; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="wrap">
          <div className="brand" onClick={goRegister}>
            <div className="mark"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3L21 20H3L12 3Z" fill="#FBF8F2"/></svg></div>
            <span>UseWok</span>
          </div>
          <div className="navlinks">
            <button onClick={() => scrollTo(featuresRef)}>Product</button>
            <button onClick={() => scrollTo(howRef)}>Use cases</button>
            <button onClick={goBlog}>Resources</button>
            <button onClick={goPricing}>Pricing</button>
            <button onClick={() => scrollTo(stackRef)}>Company</button>
          </div>
          <div className="navright">
            <button className="nav-login" onClick={goLogin}>Log in</button>
            <button className="btn btn-dark" onClick={() => setShowAnalyze(true)}>Get started</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="wrap hero-inner">
          <span className="eyebrow"><span className="dot"></span>8 AI engines analyzed</span>
          <h1>Your customers ask AI<br />who to <span className="hi">call.</span></h1>
          <p>The new standard beyond SEO. Be recommended by ChatGPT, Gemini and Claude — not just found in search results. Built for startups, agencies and local businesses that need AI visibility without a full marketing team.</p>
          <div className="hero-ctas">
            <button className="btn btn-dark" onClick={() => setShowAnalyze(true)}>Analyze my site →</button>
            <button className="btn btn-outline" onClick={() => scrollTo(howRef)}>See a demo</button>
          </div>
          <div className="hero-strip">
            <div className="strip-pill"><b>From $49/mo</b> — transparent pricing</div>
            <div className="strip-pill"><b>30 sec</b> for your first score</div>
            <div className="strip-pill"><span className="flag-fr" style={{width:16, height:12, borderRadius:2, background:'linear-gradient(90deg,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%)', display:'inline-block', flexShrink:0}}></span> designed and hosted in France</div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <div className="trustbar">
        <div className="wrap">
          <span className="eyebrow" style={{justifyContent:'center', display:'flex'}}>Already tracking their AI visibility</span>
          <div className="trustlogos">
            <span>Norea</span><span>Klarcy</span><span>Mio One</span><span>Iberia Digital</span><span>Embat</span><span>Presqu'Île</span>
          </div>
        </div>
      </div>

      {/* TWO PANEL + SCORES */}
      <section ref={featuresRef}>
        <div className="wrap">
          <div className="panels">
            <div className="panel panel-light">
              <div className="k">Understand</div>
              <h3>Know what AI says about you</h3>
              <div className="feat">
                <b>Spot visibility gaps</b>
                <p>Discover the queries where competitors show up instead of you on ChatGPT, Claude and Gemini.</p>
              </div>
              <div className="feat">
                <b>Prioritize without guessing</b>
                <p>A clear action plan, ranked by impact, to win ground on AI engines.</p>
              </div>
            </div>
            <div className="panel panel-glow">
              <div className="prompt-card">
                <p>Analyze the visibility of <b>usewok.com</b> on ChatGPT<span className="caret"></span></p>
                <div className="prompt-actions">
                  <span className="a">＋ Add a domain</span>
                  <span className="a">✦ Compare a competitor</span>
                  <div className="send" onClick={goRegister}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="panels2">
            <div className="panel-scores">
              <div className="score-row"><div className="ic">GPT</div><div className="name">ChatGPT</div><div className="bar"><i style={{width:'43%'}}></i></div><div className="val">43</div></div>
              <div className="score-row"><div className="ic">✦</div><div className="name">Gemini</div><div className="bar"><i style={{width:'38%'}}></i></div><div className="val">38</div></div>
              <div className="score-row"><div className="ic">C</div><div className="name">Claude</div><div className="bar"><i style={{width:'51%'}}></i></div><div className="val">51</div></div>
            </div>
            <div className="panel-check">
              <h3>Reliability without compromise</h3>
              <p>Verified visibility data, continuously updated, on infrastructure hosted in France.</p>
              <div className="check-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                <div><b>Multi-engine analysis</b><span>ChatGPT, Claude, Gemini and 5 other engines tracked continuously.</span></div>
              </div>
              <div className="check-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                <div><b>Complete technical audit</b><span>Crawl, data structure and authority signals from your site.</span></div>
              </div>
              <div className="check-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                <div><b>Performance tracking</b><span>Measure your share of voice against competitors, week after week.</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLAIN 3 */}
      <section ref={howRef}>
        <div className="wrap">
          <div className="explain-head">
            <span className="eyebrow" style={{justifyContent:'center', display:'flex', marginBottom:14}}><span className="dot"></span>How it works</span>
            <h2>Turn your visibility data into an action plan, without being an AI expert</h2>
            <p style={{fontSize:15, color:'var(--ink-faint)', marginTop:14, lineHeight:1.6}}><b style={{color:'var(--ink)'}}>SEO</b> optimizes clicks from search results. <b style={{color:'var(--orange-deep)'}}>AEO</b> optimizes mentions and recommendations inside AI responses — often without a single click. UseWok helps you win both.</p>
          </div>
          <div className="explain-grid">
            <div className="explain-col">
              <div className="explain-item">
                <b>UseWok finds why you're invisible</b>
                <p>The reason AI cites another brand instead of you is hidden in citation data. We dig it up for you.</p>
              </div>
              <div className="explain-item">
                <b>And builds your action plan</b>
                <p>You finally know what to act on this week — UseWok prioritizes the actions that truly matter.</p>
              </div>
            </div>
            <div className="explain-center">
              <div className="stack-cards"><div className="c c1"></div><div className="c c2"></div><div className="c c3"></div></div>
            </div>
            <div className="explain-col right">
              <div className="explain-item right">
                <b>You stay in control</b>
                <p>You validate every action before publishing — UseWok prepares, you decide.</p>
              </div>
              <div className="explain-item right">
                <b>And watch your score climb</b>
                <p>Every action is tied to measurable impact on your AI share of voice.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONFIDENCE / FEATURES */}
      <section>
        <div className="wrap">
          <div className="confidence-top">
            <h2>Build your authority with confidence</h2>
            <div>
              <p>Track every improvement, share results with your team, and keep a clear view of your trajectory.</p>
              <button className="btn btn-dark" onClick={goRegister}>See features</button>
            </div>
          </div>
          <div className="cards3">
            <div className="card3"><h4>Full score history</h4><p>Look back at every change and measure the real impact of your actions.</p></div>
            <div className="card3"><h4>Shared team spaces</h4><p>Centralize tracking and keep everyone aligned on the same vision.</p></div>
            <div className="card3"><h4>Guided action plan</h4><p>A clear path, step by step, from diagnosis to visibility.</p></div>
          </div>
        </div>
      </section>

      {/* DARK STACK BAND */}
      <section ref={stackRef}>
        <div className="wrap">
          <div className="stackband">
            <h2>Built for <span className="hi">your tools</span></h2>
            <p>UseWok connects to your existing stack — Google Search Console, Analytics and your favorite team tools.</p>
            <div className="logos">
              <div className="lg"><span className="sw">🔍</span>Search Console</div>
              <div className="lg"><span className="sw">📊</span>Analytics</div>
              <div className="lg"><span className="sw">💬</span>Slack</div>
              <div className="lg"><span className="sw">⚡</span>Zapier</div>
              <div className="lg"><span className="sw">📁</span>Notion</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS + STATS */}
      <section>
        <div className="wrap">
          <div className="test-grid">
            <div className="test-card">
              <div className="stars">★★★★★</div>
              <p>A clear tool to understand where we're cited by AI, and where we're not yet.</p>
              <div className="test-who"><div className="av"></div><div><b>Camille Aubert</b><span>Marketing Lead</span></div></div>
            </div>
            <div className="test-card">
              <div className="stars">★★★★★</div>
              <p>The perfect starting point to prioritize our AI visibility actions without spending weeks on it.</p>
              <div className="test-who"><div className="av"></div><div><b>Julien Roze</b><span>Growth Lead</span></div></div>
            </div>
            <div className="test-card">
              <div className="stars">★★★★★</div>
              <p>We finally have a view of our share of voice against competitors on ChatGPT and Claude.</p>
              <div className="test-who"><div className="av"></div><div><b>Sarah Nizan</b><span>Strategy & Ops</span></div></div>
            </div>
          </div>
          <div className="stat-grid">
            <div className="stat-card stat-1"><span className="big">+38%</span><span className="lbl">traffic from AI search</span></div>
            <div className="stat-card stat-2"><span className="big">30 sec</span><span className="lbl">to your first score</span></div>
            <div className="stat-card stat-3"><span className="big">8</span><span className="lbl">AI engines tracked continuously</span></div>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section>
        <div className="wrap">
          <div className="explain-head">
            <span className="eyebrow" style={{justifyContent:'center', display:'flex', marginBottom:14}}><span className="dot"></span>Simple, transparent pricing</span>
            <h2>$49/mo — everything you need</h2>
            <p style={{fontSize:15, color:'var(--ink-faint)', marginTop:14, lineHeight:1.6}}>An agency specializing in AI visibility typically charges $100+/mo and assumes you already have in-house expertise. UseWok replaces all of that — for less than half the cost.</p>
          </div>
          <div style={{maxWidth:440, margin:'0 auto'}}>
            <div className="card3" style={{background:'linear-gradient(165deg, var(--orange-pale) 0%, var(--cream-2) 100%)', border:'1px solid var(--orange)', minHeight:'auto'}}>
              <div>
                <h4 style={{fontSize:24}}>UseWok — $49/mo</h4>
                <p style={{marginTop:14}}>Full AI visibility score, action plan, guided fix instructions, competitor benchmarking, and tracking on all 8 AI engines. For startups, agencies and local businesses that want to win AI recommendations.</p>
              </div>
              <div style={{marginTop:24, display:'flex', gap:8}}>
                <button className="btn btn-dark" onClick={() => setShowAnalyze(true)}>Start analyzing →</button>
                <button className="btn btn-outline" onClick={goPricing}>See full plan</button>
              </div>
            </div>
          </div>
          <div style={{textAlign:'center', marginTop:32}}>
            <button className="btn btn-dark" onClick={goPricing}>Compare all plans →</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="wrap">
          <div className="faq-wrap">
            <h2>Frequently asked questions</h2>
            <details open>
              <summary>What is UseWok?</summary>
              <p>UseWok is an AI visibility platform that shows where and how your brand appears in AI engines like ChatGPT, Perplexity, Google AI Overviews, Claude and Gemini. Unlike most AI visibility tools, UseWok goes further and shows you how to act on your data to appear in future AI responses.</p>
            </details>
            <details>
              <summary>Which AI engines can I track with UseWok?</summary>
              <p>UseWok tracks the major AI engines: ChatGPT, Perplexity, Google AI Overviews, Google AI mode, Claude, Microsoft Copilot and Gemini.</p>
            </details>
            <details>
              <summary>How often does UseWok track prompts and refresh data?</summary>
              <p>UseWok tracks prompts every 24 hours to catch changes in AI responses as they happen. Our clients see results in as little as 7 days, and UseWok's daily tracking gives you fast feedback loops to act on.</p>
            </details>
            <details>
              <summary>How do I know if AI recommends my product?</summary>
              <p>UseWok runs prompts to discover and show you whether your brand is mentioned in AI responses, including how you compare to your competitors.</p>
            </details>
            <details>
              <summary>How does UseWok track brand mentions in AI responses?</summary>
              <p>UseWok mimics real user behavior by running prompts that people type to discover your category and product.</p>
            </details>
            <details>
              <summary>How is AEO different from SEO?</summary>
              <p>SEO optimizes for clicks from search results. AEO optimizes for mentions and recommendations inside AI responses, often without a click.</p>
            </details>
            <details>
              <summary>How long to see AEO results?</summary>
              <p>We've seen AEO results in as little as 7 days with our clients. Unlike SEO which often takes months, AI visibility can be influenced much faster with UseWok.</p>
            </details>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="wrap">
          <div className="finalcta">
            <div className="cta-card">
              <h3 className="serif">So, what are we analyzing?</h3>
              <button className="btn btn-dark" onClick={() => setShowAnalyze(true)}>Start analyzing →</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-top">
            <div className="foot-brand">
              <div className="brand" onClick={goRegister}><div className="mark"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3L21 20H3L12 3Z" fill="#FBF8F2"/></svg></div><span>UseWok</span></div>
              <p>UseWok is the platform that measures and improves your visibility on AI engines — ChatGPT, Claude, Gemini and many more.</p>
              <div className="foot-social">
                <a href="https://x.com/usewok" target="_blank" rel="noopener noreferrer">𝕏</a>
                <a href="https://linkedin.com/company/usewok" target="_blank" rel="noopener noreferrer">in</a>
                <a href="https://instagram.com/usewok" target="_blank" rel="noopener noreferrer">◎</a>
              </div>
            </div>
            <div className="foot-col">
              <h5>Product</h5>
              <button onClick={() => scrollTo(featuresRef)}>Features</button>
              <button onClick={() => scrollTo(stackRef)}>Integrations</button>
              <button onClick={goPricing}>Pricing</button>
              <button onClick={goBlog}>What's new</button>
            </div>
            <div className="foot-col">
              <h5>Resources</h5>
              <button onClick={goBlog}>Documentation</button>
              <button onClick={goBlog}>Community</button>
              <button onClick={goBlog}>Blog</button>
            </div>
            <div className="foot-col">
              <h5>Company</h5>
              <button onClick={() => navigate('/about')}>About</button>
              <button onClick={() => navigate('/contact')}>Contact</button>
            </div>
            <div className="foot-col">
              <h5>Legal</h5>
              <button onClick={() => navigate('/privacy')}>Privacy</button>
              <button onClick={() => navigate('/terms')}>Terms</button>
              <button onClick={() => navigate('/legal')}>Legal</button>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 UseWok. All rights reserved.</span>
            <span className="fr"><span className="flag" style={{width:14, height:11, borderRadius:2, background:'linear-gradient(90deg,#002395 33%,#fff 33%,#fff 66%,#ED2939 66%)', display:'inline-block'}}></span>Made in France</span>
          </div>
        </div>
      </footer>

      {showAnalyze && <AnalyzeLeadModal onClose={() => setShowAnalyze(false)} />}
    </div>
  );
}