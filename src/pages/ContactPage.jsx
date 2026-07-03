import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function ContactPage() {
  const navigate = useNavigate();
  const goHome = () => navigate('/');
  const goLogin = () => navigate('/login');
  const goRegister = () => navigate('/register');
  const goAbout = () => navigate('/about');

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.message.trim()) { setError('Please fill in your email and message.'); return; }
    setSending(true);
    try {
      await base44.entities.ContactLead.create({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        status: 'new',
      });
      setSent(true);
      setForm({ first_name: '', last_name: '', email: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSending(false);
  };

  const inputStyle = {
    width: '100%', padding: '11px 13px', fontSize: 14, border: '1px solid #E8E8E6', borderRadius: 10,
    outline: 'none', fontFamily: 'Inter, sans-serif', color: '#15130F', background: '#fff', boxSizing: 'border-box',
    transition: 'border-color 150ms',
  };

  return (
    <div className="uw-contact">
      <style>{`
        :root{
          --cream:#FBF8F2; --cream-2:#F3EEE3; --ink:#15130F; --ink-soft:#4A453B;
          --ink-faint:rgba(21,19,15,0.55); --orange:#FF5A1F; --orange-deep:#C43E14;
          --line:rgba(21,19,15,0.10); --line-strong:rgba(21,19,15,0.14);
        }
        .uw-contact *{box-sizing:border-box;}
        .uw-contact{ font-family:'Inter',sans-serif; background:var(--cream); color:var(--ink); -webkit-font-smoothing:antialiased; min-height:100vh; }
        .uw-contact .wrap{ max-width:760px; margin:0 auto; padding:0 24px; }
        .uw-contact nav{
          position:sticky; top:0; z-index:20; background:rgba(251,248,242,0.82);
          backdrop-filter:blur(14px); border-bottom:1px solid var(--line);
        }
        .uw-contact nav .wrap{ display:flex; align-items:center; justify-content:space-between; height:68px; }
        .uw-contact .brand{ display:flex; align-items:center; gap:9px; cursor:pointer; }
        .uw-contact .brand .mark{ width:26px; height:26px; border-radius:7px; background:var(--orange); display:flex; align-items:center; justify-content:center; }
        .uw-contact .brand .mark svg{ width:13px; height:13px; }
        .uw-contact .brand span{ font-weight:700; font-size:15.5px; }
        .uw-contact .navright{ display:flex; align-items:center; gap:16px; }
        .uw-contact .nav-login{ font-size:14px; font-weight:500; color:var(--ink-soft); background:none; border:none; cursor:pointer; font-family:inherit; }
        .uw-contact .nav-login:hover{ color:var(--ink); }
        .uw-contact .btn{
          display:inline-flex; align-items:center; gap:8px; height:42px; padding:0 20px;
          border-radius:100px; font-size:13.5px; font-weight:600; border:none; cursor:pointer;
          font-family:inherit; transition:transform .15s ease, background .15s ease;
        }
        .uw-contact .btn:active{ transform:scale(0.97); }
        .uw-contact .btn-dark{ background:var(--ink); color:var(--cream); }
        .uw-contact .btn-dark:hover{ background:var(--orange-deep); }
        .uw-contact .hero{ padding:72px 0 36px; }
        .uw-contact .eyebrow{
          display:inline-flex; align-items:center; gap:7px; font-size:11.5px; font-weight:700;
          letter-spacing:0.05em; text-transform:uppercase; color:var(--orange-deep); margin-bottom:18px;
        }
        .uw-contact .eyebrow .dot{ width:6px; height:6px; border-radius:50%; background:var(--orange); }
        .uw-contact h1{ font-size:40px; line-height:1.1; letter-spacing:-0.03em; font-weight:800; margin:0 0 14px; }
        .uw-contact .serif{ font-family:'Fraunces', serif; font-weight:500; font-style:italic; color:var(--orange-deep); }
        .uw-contact .lead{ font-size:16px; color:var(--ink-soft); line-height:1.6; margin:0 0 36px; max-width:520px; }
        .uw-contact .grid{ display:grid; grid-template-columns:1.2fr 0.8fr; gap:24px; align-items:start; }
        .uw-contact .form-card{ background:#fff; border:1px solid var(--line); border-radius:16px; padding:24px; }
        .uw-contact .form-row{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
        .uw-contact label{ display:block; font-size:12px; font-weight:600; color:var(--ink-soft); margin-bottom:5px; }
        .uw-contact textarea{ resize:none; }
        .uw-contact .error{ font-size:12px; color:#EF4444; margin-bottom:10px; }
        .uw-contact .success{
          display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;
          padding:40px 20px; gap:10px;
        }
        .uw-contact .success .check{ width:44px; height:44px; border-radius:50%; background:rgba(16,185,129,0.10); display:flex; align-items:center; justify-content:center; }
        .uw-contact .side h3{ font-size:14px; font-weight:700; margin:0 0 14px; }
        .uw-contact .side-item{ display:flex; align-items:center; gap:10px; margin-bottom:14px; }
        .uw-contact .side-item .ic{ width:34px; height:34px; border-radius:9px; background:var(--cream-2); display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; }
        .uw-contact .side-item .t{ font-size:13px; font-weight:600; color:var(--ink); }
        .uw-contact .side-item .s{ font-size:12px; color:var(--ink-faint); }
        .uw-contact .side-item a{ color:var(--ink); text-decoration:none; }
        .uw-contact .side-item a:hover{ text-decoration:underline; }
        .uw-contact footer{ padding:56px 0 40px; }
        .uw-contact .foot-bottom{ display:flex; justify-content:space-between; padding-top:26px; border-top:1px solid var(--line); font-size:12.5px; color:var(--ink-faint); }
        .uw-contact .foot-links{ display:flex; gap:18px; }
        .uw-contact .foot-links button{ background:none; border:none; cursor:pointer; font-family:inherit; font-size:12.5px; color:var(--ink-faint); padding:0; }
        .uw-contact .foot-links button:hover{ color:var(--ink); }
        @media (max-width:640px){
          .uw-contact h1{ font-size:30px; }
          .uw-contact .hero{ padding:48px 0 28px; }
          .uw-contact .grid{ grid-template-columns:1fr; }
          .uw-contact .form-row{ grid-template-columns:1fr; }
          .uw-contact .nav-login{ display:none; }
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
          <span className="eyebrow"><span className="dot"></span>Contact</span>
          <h1>Let's <span className="serif">talk.</span></h1>
          <p className="lead">Questions, feedback or partnership ideas? We usually reply within one business day.</p>
        </section>

        <div className="grid">
          <div className="form-card">
            {sent ? (
              <div className="success">
                <div className="check">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Message sent!</p>
                <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: 0, lineHeight: 1.5 }}>Thanks for reaching out. We'll get back to you shortly.</p>
                <button onClick={() => setSent(false)} className="btn btn-dark" style={{ marginTop: 8 }}>Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div>
                    <label>First name</label>
                    <input value={form.first_name} onChange={handleChange('first_name')} placeholder="Jane" style={inputStyle} />
                  </div>
                  <div>
                    <label>Last name</label>
                    <input value={form.last_name} onChange={handleChange('last_name')} placeholder="Doe" style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Email *</label>
                  <input value={form.email} onChange={handleChange('email')} type="email" placeholder="jane@company.com" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label>Message *</label>
                  <textarea value={form.message} onChange={handleChange('message')} rows={5} placeholder="How can we help?" style={inputStyle} />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={sending}
                  style={{ width: '100%', padding: '12px 0', background: sending ? '#E8E8E6' : 'var(--ink)', color: sending ? '#999' : '#fff', border: 'none', borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {sending ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          <div className="side">
            <h3>Other ways to reach us</h3>
            <div className="side-item">
              <div className="ic">𝕏</div>
              <div>
                <div className="t"><a href="https://x.com/usewok" target="_blank" rel="noopener noreferrer">@usewok</a></div>
                <div className="s">Twitter / X</div>
              </div>
            </div>
            <div className="side-item">
              <div className="ic">in</div>
              <div>
                <div className="t"><a href="https://linkedin.com/company/usewok" target="_blank" rel="noopener noreferrer">UseWok</a></div>
                <div className="s">LinkedIn</div>
              </div>
            </div>
            <div className="side-item">
              <div className="ic">◎</div>
              <div>
                <div className="t"><a href="https://instagram.com/usewok" target="_blank" rel="noopener noreferrer">@usewok</a></div>
                <div className="s">Instagram</div>
              </div>
            </div>
            <div className="side-item">
              <div className="ic">💬</div>
              <div>
                <div className="t"><a href="https://discord.gg/wok" target="_blank" rel="noopener noreferrer">Discord</a></div>
                <div className="s">Community</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="wrap">
          <div className="foot-bottom">
            <span>© 2026 UseWok. All rights reserved.</span>
            <div className="foot-links">
              <button onClick={goAbout}>About</button>
              <button onClick={() => navigate('/privacy')}>Privacy</button>
              <button onClick={() => navigate('/terms')}>Terms</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}