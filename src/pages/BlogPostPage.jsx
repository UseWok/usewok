import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Clock, Tag, ArrowRight } from 'lucide-react';

const F      = '"Anthropic Sans", "Anthropic Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const BG     = '#F8F7F4';
const INK    = '#1A1A1A';
const INK2   = '#6B6660';
const INK3   = '#A8A49F';
const CORAL  = '#FF5A1F';
const CARD   = '#FFFFFF';
const BORDER = 'rgba(21,19,15,0.10)';

function Navbar({ showBack = false }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    base44.auth.isAuthenticated().then(setIsAuth).catch(() => {});
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', justifyContent: 'center', padding: '14px 20px',
      fontFamily: F,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 900,
        padding: '10px 18px',
        background: scrolled ? 'rgba(248,247,244,0.97)' : 'rgba(248,247,244,0.85)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${BORDER}`,
        borderRadius: 999,
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.07)' : 'none',
        transition: 'all 0.3s',
      }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="UseWok" style={{ width: 28, height: 'auto' }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: INK, letterSpacing: '-0.02em' }}>UseWok</span>
        </button>
        <button onClick={() => navigate('/blog')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: INK2, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F }}
          onMouseEnter={e => e.currentTarget.style.color = INK}
          onMouseLeave={e => e.currentTarget.style.color = INK2}>
          <ArrowLeft size={13} /> Retour au blog
        </button>
        {isAuth
          ? <button onClick={() => navigate('/app')} style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: INK, border: 'none', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', fontFamily: F }}>Ouvrir l'app →</button>
          : <button onClick={() => base44.auth.redirectToLogin('/app')} style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: CORAL, border: 'none', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', fontFamily: F }}>Démarrer gratuitement →</button>
        }
      </div>
    </header>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    base44.entities.BlogPost.filter({ slug })
      .then(results => {
        if (results.length === 0 || !results[0].published) { setNotFound(true); return; }
        const p = results[0];
        setPost(p);
        document.title = `${p.title} — UseWok Blog`;
        let md = document.querySelector('meta[name="description"]');
        if (!md) { md = document.createElement('meta'); md.name = 'description'; document.head.appendChild(md); }
        md.setAttribute('content', p.summary || p.title);
        ['og:title', 'og:description', 'og:image'].forEach(prop => {
          let el = document.querySelector(`meta[property="${prop}"]`);
          if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
          if (prop === 'og:title') el.setAttribute('content', p.title);
          if (prop === 'og:description') el.setAttribute('content', p.summary || '');
          if (prop === 'og:image' && p.cover_image) el.setAttribute('content', p.cover_image);
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    return () => { document.title = 'UseWok · Visibilité IA'; };
  }, [slug]);

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(21,19,15,0.10)', borderTopColor: CORAL, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: F, padding: 24, textAlign: 'center' }}>
      <Navbar />
      <p style={{ fontSize: 48, marginBottom: 16 }}>🔍</p>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: INK, margin: '0 0 8px', letterSpacing: '-0.03em' }}>Article introuvable</h1>
      <p style={{ fontSize: 14, color: INK3, marginBottom: 28 }}>Cet article n'existe pas ou n'est pas encore publié.</p>
      <button onClick={() => navigate('/blog')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: INK, color: '#fff', border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
        <ArrowLeft size={14} /> Retour au blog
      </button>
    </div>
  );

  return (
    <div style={{ fontFamily: F, background: BG, minHeight: '100vh' }}>
      <Navbar />

      {/* Cover */}
      {post.cover_image && (
        <div style={{ width: '100%', overflow: 'hidden', height: 'clamp(240px, 40vw, 480px)', marginTop: 0, position: 'relative' }}>
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(248,247,244,0.95) 100%)' }} />
        </div>
      )}

      {/* Article */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: `${post.cover_image ? '2rem' : '8rem'} 24px 6rem` }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

          {/* Breadcrumb + meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/blog')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: INK3, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: F }}
              onMouseEnter={e => e.currentTarget.style.color = INK}
              onMouseLeave={e => e.currentTarget.style.color = INK3}>
              <ArrowLeft size={12} /> Blog
            </button>
            <span style={{ color: BORDER }}>·</span>
            {post.category && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: CORAL, background: `${CORAL}12`, padding: '3px 10px', borderRadius: 999 }}>
                <Tag size={9} /> {post.category}
              </span>
            )}
            {post.reading_time && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: INK3 }}>
                <Clock size={11} /> {post.reading_time} min
              </span>
            )}
            <span style={{ fontSize: 11.5, color: INK3, marginLeft: 'auto' }}>
              {new Date(post.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)', fontWeight: 800, color: INK, letterSpacing: '-0.04em', lineHeight: 1.08, margin: '0 0 16px' }}>
            {post.title}
          </h1>
          {post.summary && (
            <p style={{ fontSize: 16, color: INK2, lineHeight: 1.75, margin: '0 0 36px' }}>
              {post.summary}
            </p>
          )}

          {/* Divider */}
          <div style={{ width: 40, height: 3, background: CORAL, borderRadius: 999, marginBottom: 36 }} />

          {/* Content */}
          <div dangerouslySetInnerHTML={{ __html: post.content || '' }} className="blog-content" />

          <style>{`
            .blog-content { font-size: 16.5px; line-height: 1.85; color: #2D2A26; }
            .blog-content p { margin: 0 0 1.3em; }
            .blog-content strong, .blog-content b { font-weight: 700; color: ${INK}; }
            .blog-content h1 { font-size: 1.85rem; font-weight: 800; margin: 2em 0 0.6em; color: ${INK}; letter-spacing: -0.03em; }
            .blog-content h2 { font-size: 1.4rem; font-weight: 700; margin: 1.8em 0 0.5em; color: ${INK}; letter-spacing: -0.02em; }
            .blog-content h3 { font-size: 1.15rem; font-weight: 700; margin: 1.4em 0 0.4em; color: ${INK}; }
            .blog-content ul { list-style: none; padding: 0; margin: 0.5em 0 1.2em; }
            .blog-content ul li { padding-left: 1.4em; position: relative; margin: 0.4em 0; }
            .blog-content ul li::before { content: ''; position: absolute; left: 0; top: 0.65em; width: 6px; height: 6px; border-radius: 50%; background: ${CORAL}; }
            .blog-content ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0 1.2em; }
            .blog-content li { margin: 0.35em 0; }
            .blog-content blockquote { border-left: 3px solid ${CORAL}; padding: 12px 20px; margin: 1.5em 0; color: ${INK2}; font-style: italic; background: rgba(255,90,31,0.04); border-radius: 0 10px 10px 0; }
            .blog-content img { max-width: 100%; border-radius: 14px; margin: 1.5em 0; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .blog-content a { color: ${CORAL}; text-decoration: underline; text-underline-offset: 3px; }
            .blog-content a:hover { opacity: 0.75; }
            .blog-content code { background: rgba(21,19,15,0.06); border-radius: 5px; padding: 2px 7px; font-size: 0.88em; font-family: 'Monaco', 'Menlo', monospace; color: ${INK}; }
            .blog-content pre { background: ${INK}; border-radius: 12px; padding: 20px; margin: 1.5em 0; overflow-x: auto; }
            .blog-content pre code { background: none; color: #e8e8e0; padding: 0; font-size: 0.86em; }
            .blog-content hr { border: none; border-top: 1px solid ${BORDER}; margin: 2.5em 0; }
          `}</style>
        </motion.div>
      </div>

      {/* CTA Footer */}
      <div style={{ background: INK, padding: '56px 24px', textAlign: 'center', fontFamily: F }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>UseWok</p>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.4rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: '0 0 12px', lineHeight: 1.1 }}>
          Vérifiez votre visibilité IA<br />
          <span style={{ color: CORAL }}>en 2 minutes, gratuit.</span>
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Sans carte bancaire · 8 moteurs IA analysés</p>
        <button onClick={() => base44.auth.redirectToLogin('/app')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: CORAL, color: '#fff', border: 'none', borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
          Démarrer l'analyse <ArrowRight size={15} />
        </button>
      </div>

      {/* Footer */}
      <footer style={{ background: '#0D0C0A', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontFamily: F }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="UseWok" style={{ width: 24, height: 'auto' }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>UseWok</span>
        </a>
        <div style={{ display: 'flex', gap: 18 }}>
          {[['Accueil', '/'], ['Blog', '/blog'], ['Tarifs', '/tarifs'], ['CGU', '/terms']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', margin: 0 }}>© 2026 UseWok</p>
      </footer>
    </div>
  );
}