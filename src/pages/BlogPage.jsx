import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Clock } from 'lucide-react';

const CORAL = '#F95738';
const BG = '#111111';

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
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'center', padding: '14px 20px',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', maxWidth: 980, padding: '10px 20px',
        background: scrolled ? 'rgba(17,17,17,0.97)' : 'rgba(17,17,17,0.75)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 999,
        transition: 'background 0.3s',
      }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 30, height: 'auto', mixBlendMode: 'screen' }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>WOK</span>
        </button>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="/tarifs" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }} className="hidden md:block">Pricing</a>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', borderBottom: `1px solid ${CORAL}`, paddingBottom: 2 }} className="hidden md:block">Blog</span>
          {isAuth
            ? <button onClick={() => navigate('/app')} style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: CORAL, border: 'none', borderRadius: 999, padding: '9px 20px', cursor: 'pointer' }}>Open app →</button>
            : <button onClick={() => base44.auth.redirectToLogin('/app')} style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: CORAL, border: 'none', borderRadius: 999, padding: '9px 20px', cursor: 'pointer' }}>Start free →</button>
          }
        </div>
      </div>
    </motion.header>
  );
}

function PostCard({ post, index }) {
  const navigate = useNavigate();
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/blog/${post.slug}`)}
      style={{
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        overflow: 'hidden',
        transition: 'border-color 200ms, transform 200ms',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,87,56,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {post.cover_image && (
        <div style={{ height: 200, overflow: 'hidden' }}>
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 400ms' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>
      )}
      <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          {post.category && (
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: CORAL }}>
              {post.category}
            </span>
          )}
          {post.reading_time && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              <Clock style={{ width: 11, height: 11 }} />
              {post.reading_time} min
            </span>
          )}
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          {post.title}
        </h2>
        {post.summary && (
          <p style={{
            fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, margin: '0 0 20px', flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.summary}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            {new Date(post.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: CORAL, display: 'flex', alignItems: 'center', gap: 4 }}>
            Read <ArrowRight style={{ width: 12, height: 12 }} />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Blog — WOK';
    base44.entities.BlogPost.filter({ published: true }, '-created_date', 50)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: BG, minHeight: '100vh' }}>
      <Navbar />

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: `radial-gradient(ellipse, rgba(249,87,56,0.09) 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: '160px 24px 72px' }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 20 }}>
            The WOK Blog
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', lineHeight: 0.95, margin: '0 0 20px' }}
          >
            Build better.<br /><span style={{ color: CORAL }}>Ship faster.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontSize: 15, color: 'rgba(255,255,255,0.32)', maxWidth: 400, margin: '0 auto' }}>
            Tips, stories, and inspiration for creators building with WOK.
          </motion.p>
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px 100px' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: 180, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ padding: '28px' }}>
                  <div style={{ height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 12, width: '40%' }} />
                  <div style={{ height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.08)', marginBottom: 8 }} />
                  <div style={{ height: 14, borderRadius: 6, background: 'rgba(255,255,255,0.05)', width: '70%' }} />
                </div>
              </div>
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontSize: 36, marginBottom: 16 }}>✍️</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Nothing here yet</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>Great content is coming soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
          </div>
        )}
      </div>

      <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style={{ width: 26, height: 'auto', mixBlendMode: 'screen' }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>WOK</span>
        </a>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Home', '/'], ['Pricing', '/tarifs'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.22)'}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.12)', margin: 0 }}>© 2026 WOK</p>
      </footer>
    </div>
  );
}