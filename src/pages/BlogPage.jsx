import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Clock, ChevronRight } from 'lucide-react';

const F     = '"Anthropic Sans", "Anthropic Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const BG    = '#F8F7F4';
const INK   = '#1A1A1A';
const INK2  = '#6B6660';
const INK3  = '#A8A49F';
const CORAL = '#FF5A1F';
const CARD  = '#FFFFFF';
const BORDER = 'rgba(21,19,15,0.10)';

function Navbar() {
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
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <a href="/tarifs" style={{ fontSize: 13, color: INK2, textDecoration: 'none', padding: '6px 12px', borderRadius: 999 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(21,19,15,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Tarifs</a>
          <span style={{ fontSize: 13, fontWeight: 700, color: CORAL, padding: '6px 12px', borderRadius: 999, background: `${CORAL}12` }}>Blog</span>
          {isAuth
            ? <button onClick={() => navigate('/app')} style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: INK, border: 'none', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', fontFamily: F }}>Ouvrir l'app →</button>
            : <button onClick={() => base44.auth.redirectToLogin('/app')} style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: CORAL, border: 'none', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', fontFamily: F }}>Démarrer gratuitement →</button>
          }
        </div>
      </div>
    </header>
  );
}

function FeaturedCard({ post }) {
  const navigate = useNavigate();
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/blog/${post.slug}`)}
      style={{
        cursor: 'pointer', background: CARD,
        border: `1px solid ${BORDER}`, borderRadius: 20, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: post.cover_image ? '1fr 1fr' : '1fr',
        transition: 'box-shadow 200ms, transform 200ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      {post.cover_image && (
        <div style={{ overflow: 'hidden', minHeight: 320 }}>
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 500ms' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
        </div>
      )}
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          {post.category && (
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: CORAL, background: `${CORAL}12`, padding: '4px 10px', borderRadius: 999 }}>
              {post.category}
            </span>
          )}
          {post.reading_time && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: INK3 }}>
              <Clock size={11} /> {post.reading_time} min
            </span>
          )}
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          {post.title}
        </h2>
        {post.summary && (
          <p style={{ fontSize: 14, color: INK2, lineHeight: 1.7, margin: '0 0 28px' }}>
            {post.summary}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11.5, color: INK3 }}>
            {new Date(post.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: CORAL, display: 'flex', alignItems: 'center', gap: 5 }}>
            Lire l'article <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function PostCard({ post, index }) {
  const navigate = useNavigate();
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/blog/${post.slug}`)}
      style={{
        cursor: 'pointer', background: CARD,
        border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 200ms, transform 200ms',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
      {post.cover_image && (
        <div style={{ height: 180, overflow: 'hidden' }}>
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
        </div>
      )}
      <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          {post.category && (
            <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: CORAL }}>
              {post.category}
            </span>
          )}
          {post.reading_time && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: INK3 }}>
              <Clock size={10} /> {post.reading_time} min
            </span>
          )}
        </div>
        <h2 style={{ fontSize: 15.5, fontWeight: 700, color: INK, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.35 }}>
          {post.title}
        </h2>
        {post.summary && (
          <p style={{
            fontSize: 12.5, color: INK2, lineHeight: 1.65, margin: '0 0 16px', flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.summary}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: `1px solid ${BORDER}`, marginTop: 'auto' }}>
          <span style={{ fontSize: 11, color: INK3 }}>
            {new Date(post.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: CORAL, display: 'flex', alignItems: 'center', gap: 3 }}>
            Lire <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ height: 180, background: 'rgba(21,19,15,0.04)' }} />
      <div style={{ padding: 22 }}>
        <div style={{ height: 10, borderRadius: 5, background: 'rgba(21,19,15,0.06)', marginBottom: 12, width: '35%' }} />
        <div style={{ height: 18, borderRadius: 5, background: 'rgba(21,19,15,0.07)', marginBottom: 8 }} />
        <div style={{ height: 13, borderRadius: 5, background: 'rgba(21,19,15,0.05)', width: '75%' }} />
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Blog — UseWok · Visibilité IA';
    base44.entities.BlogPost.filter({ published: true }, '-created_date', 50)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div style={{ fontFamily: F, background: BG, minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '120px 24px 48px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${CORAL}12`, border: `1px solid ${CORAL}30`, borderRadius: 999, padding: '5px 14px', marginBottom: 22 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL, display: 'inline-block' }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: CORAL, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Le Blog UseWok</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 800, color: INK, letterSpacing: '-0.04em', lineHeight: 1.05, margin: '0 0 16px' }}>
          Visibilité IA :<br /><span style={{ color: CORAL }}>conseils, stratégies, études.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ fontSize: 15, color: INK2, maxWidth: 420, margin: '0 auto' }}>
          Tout ce qu'il faut savoir pour apparaître dans les réponses de ChatGPT, Gemini et les autres IA.
        </motion.p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 100px' }}>
        {loading ? (
          <div>
            <div style={{ height: 320, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, marginBottom: 24 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>✍️</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: INK, marginBottom: 8 }}>Bientôt disponible</p>
            <p style={{ fontSize: 14, color: INK3 }}>Des articles sur la visibilité IA arrivent très vite.</p>
          </div>
        ) : (
          <div>
            {featured && (
              <div style={{ marginBottom: 24 }}>
                <FeaturedCard post={featured} />
              </div>
            )}
            {rest.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                {rest.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: '#F0EDE6', borderTop: `1px solid ${BORDER}`, padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, fontFamily: F }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="UseWok" style={{ width: 26, height: 'auto' }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>UseWok</span>
        </a>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Accueil', '/'], ['Tarifs', '/tarifs'], ['CGU', '/terms'], ['Confidentialité', '/privacy']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: INK3, textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = INK}
              onMouseLeave={e => e.currentTarget.style.color = INK3}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize: 11, color: INK3, margin: 0 }}>© 2026 UseWok</p>
      </footer>
    </div>
  );
}