import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();
  const goHome = () => navigate('/');
  const goLogin = () => navigate('/login');
  const goRegister = () => navigate('/register');
  const goContact = () => navigate('/contact');

  return (
    <div className="uw-about">
      <style>{`
        :root{
          --cream:#FBF8F2; --cream-2:#F3EEE3; --ink:#15130F; --ink-soft:#4A453B;
          --ink-faint:rgba(21,19,15,0.55); --orange:#FF5A1F; --orange-deep:#C43E14;
          --line:rgba(21,19,15,0.10); --line-strong:rgba(21,19,15,0.14);
        }
        .uw-about *{box-sizing:border-box;}
        .uw-about{ font-family:'Inter',sans-serif; background:var(--cream); color:var(--ink); -webkit-font-smoothing:antialiased; min-height:100vh; }
        .uw-about .wrap{ max-width:760px; margin:0 auto; padding:0 24px; }
        .uw-about nav{
          position:sticky; top:0; z-index:20; background:rgba(251,248,242,0.82);
          backdrop-filter:blur(14px); border-bottom:1px solid var(--line);
        }
        .uw-about nav .wrap{ display:flex; align-items:center; justify-content:space-between; height:68px; }
        .uw-about .brand{ display:flex; align-items:center; gap:9px; cursor:pointer; }
        .uw-about .brand .mark{ width:26px; height:26px; border-radius:7px; background:var(--orange); display:flex; align-items:center; justify-content:center; }
        .uw-about .brand .mark svg{ width:13px; height:13px; }
        .uw-about .brand span{ font-weight:700; font-size:15.5px; }
        .uw-about .navright{ display:flex; align-items:center; gap:16px; }
        .uw-about .nav-login{ font-size:14px; font-weight:500; color:var(--ink-soft); background:none; border:none; cursor:pointer; font-family:inherit; }
        .uw-about .nav-login:hover{ color:var(--ink); }
        .uw-about .btn{
          display:inline-flex; align-items:center; gap:8px; height:42px; padding:0 20px;
          border-radius:100px; font-size:13.5px; font-weight:600; border:none; cursor:pointer;
          font-family:inherit; transition:transform .15s ease, background .15s ease;
        }
        .uw-about .btn:active{ transform:scale(0.97); }
        .uw-about .btn-dark{ background:var(--ink); color:var(--cream); }
        .uw-about .btn-dark:hover{ background:var(--orange-deep); }
        .uw-about .btn-outline{ background:transparent; color:var(--ink); border:1px solid var(--line-strong); }
        .uw-about .btn-outline:hover{ border-color:var(--ink); }
        .uw-about .hero{ padding:72px 0 40px; }
        .uw-about .eyebrow{
          display:inline-flex; align-items:center; gap:7px; font-size:11.5px; font-weight:700;
          letter-spacing:0.05em; text-transform:uppercase; color:var(--orange-deep); margin-bottom:18px;
        }
        .uw-about .eyebrow .dot{ width:6px; height:6px; border-radius:50%; background:var(--orange); }
        .uw-about h1{ font-size:40px; line-height:1.1; letter-spacing:-0.03em; font-weight:800; margin:0 0 20px; }
        .uw-about .serif{ font-family:'Fraunces', serif; font-weight:500; font-style:italic; color:var(--orange-deep); }
        .uw-about .lead{ font-size:17px; color:var(--ink-soft); line-height:1.65; margin:0 0 28px; }
        .uw-about .body p{ font-size:15.5px; color:var(--ink-soft); line-height:1.75; margin:0 0 20px; }
        .uw-about .body p strong{ color:var(--ink); font-weight:600; }
        .uw-about .values{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; margin:40px 0; }
        .uw-about .value{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:22px; }
        .uw-about .value .ic{ font-size:22px; margin-bottom:10px; }
        .uw-about .value h3{ font-size:15px; font-weight:700; margin:0 0 6px; }
        .uw-about .value p{ font-size:13px; color:var(--ink-faint); line-height:1.55; margin:0; }
        .uw-about .cta-band{
          margin:48px 0 0; padding:40px; border-radius:20px; text-align:center;
          background:linear-gradient(155deg,#FFF3E9 0%,#FFE0C7 100%);
        }
        .uw-about .cta-band h2{ font-size:24px; font-weight:800; letter-spacing:-0.02em; margin:0 0 8px; }
        .uw-about .cta-band p{ font-size:14px; color:var(--ink-soft); margin:0 0 20px; }
        .uw-about footer{ padding:56px 0 40px; }
        .uw-about .foot-bottom{ display:flex; justify-content:space-between; padding-top:26px; border-top:1px solid var(--line); font-size:12.5px; color:var(--ink-faint); }
        .uw-about .foot-links{ display:flex; gap:18px; }
        .uw-about .foot-links button{ background:none; border:none; cursor:pointer; font-family:inherit; font-size:12.5px; color:var(--ink-faint); padding:0; }
        .uw-about .foot-links button:hover{ color:var(--ink); }
        @media (max-width:640px){
          .uw-about h1{ font-size:30px; }
          .uw-about .hero{ padding:48px 0 32px; }
          .uw-about .values{ grid-template-columns:1fr; }
          .uw-about .cta-band{ padding:28px 20px; }
          .uw-about .nav-login{ display:none; }
        }
      `}</style>

      <nav>
        <div className="wrap">
          <div className="brand" onClick={goHome}>
            <div className="mark"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3L21 20H3L12 3Z" fill="#FBF8F2"/></svg></div>
            <span>UseWok</span>
          </div>
          <div className="navright">
            <button className="nav-login" onClick={goLogin}>Log in</button>
            <button className="btn btn-dark" onClick={goRegister}>Get started</button>
          </div>
        </div>
      </nav>

      <div className="wrap">
        <section className="hero">
          <span className="eyebrow"><span className="dot"></span>About UseWok</span>
          <h1>We make brands <span className="serif">visible</span> in the age of AI.</h1>
          <p className="lead">UseWok is an AI visibility platform built to help brands understand and improve how they appear in AI-generated answers.</p>
        </section>

        <section className="body">
          <p>As consumers increasingly turn to tools like <strong>ChatGPT, Claude, Gemini and Perplexity</strong> to discover products and services, being cited by these engines has become essential. UseWok scans your domain across eight major AI engines, measures your share of voice against competitors, and surfaces the specific queries where you are invisible — then turns that data into a clear, prioritized action plan you can act on this week.</p>
          <p>UseWok is designed for <strong>marketing teams, growth leads, agency strategists and business owners</strong> who need to understand their AI presence without becoming AI experts themselves. Whether you run a single website or manage multiple brands, the platform gives you a concrete path from diagnosis to measurable improvement — no guesswork, no jargon.</p>
          <p>UseWok is <strong>designed, built and hosted in France</strong> by a small team obsessed with making AI visibility accessible, actionable and transparent. We believe every brand deserves to know what AI says about it — and to do something about it.</p>
        </section>

        <div className="values">
          <div className="value">
            <div className="ic">🔍</div>
            <h3>Clarity</h3>
            <p>See exactly where and how AI engines mention your brand — and where they don't.</p>
          </div>
          <div className="value">
            <div className="ic">⚡</div>
            <h3>Action</h3>
            <p>Every insight comes with a prioritized, step-by-step plan tailored to your site.</p>
          </div>
          <div className="value">
            <div className="ic">🇫🇷</div>
            <h3>Trust</h3>
            <p>Built and hosted in France, with reliable data and transparent methodology.</p>
          </div>
        </div>

        <div className="cta-band">
          <h2>Ready to see your AI visibility?</h2>
          <p>Get your first score in 30 seconds — no credit card required.</p>
          <button className="btn btn-dark" onClick={goRegister}>Start analyzing →</button>
        </div>
      </div>

      <footer>
        <div className="wrap">
          <div className="foot-bottom">
            <span>© 2026 UseWok. All rights reserved.</span>
            <div className="foot-links">
              <button onClick={goContact}>Contact</button>
              <button onClick={() => navigate('/privacy')}>Privacy</button>
              <button onClick={() => navigate('/terms')}>Terms</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}