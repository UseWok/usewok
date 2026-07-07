import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Clock, ArrowUpRight } from 'lucide-react';

const F      = '"Anthropic Sans", "Anthropic Sans Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const BG     = '#F8F7F4';
const INK    = '#1A1A1A';
const INK2   = '#6B6660';
const INK3   = '#A8A49F';
const CORAL  = '#FF5A1F';
const BORDER = 'rgba(21,19,15,0.10)';
const DARK   = '#15130F';

const fmtDate = (d, long = false) =>
  new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: long ? 'long' : 'short', year: 'numeric' });

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
        width: '100%', maxWidth: 1000,
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
          <a href="/tarifs" style={{ fontSize: 13, color: INK2, textDecoration: 'none', padding: '6px 12px', borderRadius: 999, transition: 'background 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(21,19,15,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Pricing</a>
          <span style={{ fontSize: 13, fontWeight: 700, color: CORAL, padding: '6px 12px', borderRadius: 999, background: `${CORAL}12` }}>Blog</span>
          {isAuth
            ? <button onClick={() => navigate('/app')} style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: INK, border: 'none', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', fontFamily: F }}>Open app →</button>
            : <button onClick={() => base44.auth.redirectToLogin('/app')} style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: CORAL, border: 'none', borderRadius: 999, padding: '8px 18px', cursor: 'pointer', fontFamily: F }}>Get started free →</button>
          }
        </div>
      </div>
    </header>
  );
}

// Featured article — full width, large dark format
function FeaturedCard({ post }) {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/blog/${post.slug}`)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        cursor: 'pointer', background: DARK, borderRadius: 20, overflow: 'hidden',
        display: 'grid', gridTemplateColumns: post.cover_image ? '1fr 1fr' : '1fr',
        minHeight: 380,
        boxShadow: hov ? '0 24px 60px rgba(0,0,0,0.22)' : '0 8px 32px rgba(0,0,0,0.12)',
        transform: hov ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 280ms cubic-bezier(0.16,1,0.3,1)',
      }}>
      {post.cover_image && (
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          <img src={post.cover_image} alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.04)' : 'scale(1)', transition: 'transform 600ms cubic-bezier(0.16,1,0.3,1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(21,19,15,0.5) 100%)' }} />
        </div>
      )}
      <div style={{ padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          {post.category && (
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: CORAL, background: `${CORAL}20`, padding: '4px 11px', borderRadius: 999 }}>
              {post.category}
            </span>
          )}
          <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Featured</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)', fontWeight: 800, color: '#fff', margin: '0 0 16px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
          {post.title}
        </h2>
        {post.summary && (
          <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.50)', lineHeight: 1.75, margin: '0 0 32px', maxWidth: 420 }}>
            {post.summary}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)' }}>
            {fmtDate(post.created_date, true)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: CORAL, fontSize: 13, fontWeight: 700 }}>
            Read <ArrowUpRight size={15} />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// Standard card — cream/white background, dark on hover
function PostCard({ post, index }) {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/blog/${post.slug}`)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        cursor: 'pointer', background: hov ? DARK : '#fff',
        border: `1px solid ${hov ? 'transparent' : BORDER}`,
        borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hov ? '0 20px 48px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 260ms cubic-bezier(0.16,1,0.3,1)',
      }}>
      {post.cover_image && (
        <div style={{ height: 200, overflow: 'hidden' }}>
          <img src={post.cover_image} alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.06)' : 'scale(1)', transition: 'transform 500ms cubic-bezier(0.16,1,0.3,1)' }} />
        </div>
      )}
      <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          {post.category && (
            <span style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: CORAL }}>
              {post.category}
            </span>
          )}
          {post.reading_time && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: hov ? 'rgba(255,255,255,0.35)' : INK3, transition: 'color 200ms' }}>
              <Clock size={10} /> {post.reading_time} min
            </span>
          )}
        </div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: hov ? '#fff' : INK, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.35, transition: 'color 200ms' }}>
          {post.title}
        </h2>
        {post.summary && (
          <p style={{
            fontSize: 13, color: hov ? 'rgba(255,255,255,0.45)' : INK2, lineHeight: 1.65, margin: '0 0 18px', flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            transition: 'color 200ms',
          }}>
            {post.summary}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: `1px solid ${hov ? 'rgba(255,255,255,0.08)' : BORDER}`, marginTop: 'auto', transition: 'border-color 200ms' }}>
          <span style={{ fontSize: 11, color: hov ? 'rgba(255,255,255,0.25)' : INK3, transition: 'color 200ms' }}>
            {fmtDate(post.created_date)}
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: CORAL, display: 'flex', alignItems: 'center', gap: 3 }}>
            Read <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ height: 200, background: 'rgba(21,19,15,0.04)' }} />
      <div style={{ padding: '22px 24px' }}>
        <div style={{ height: 10, borderRadius: 5, background: 'rgba(21,19,15,0.05)', marginBottom: 12, width: '30%' }} />
        <div style={{ height: 20, borderRadius: 5, background: 'rgba(21,19,15,0.07)', marginBottom: 8 }} />
        <div style={{ height: 13, borderRadius: 5, background: 'rgba(21,19,15,0.04)', width: '80%' }} />
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Blog — UseWok · AI Visibility';
    base44.entities.BlogPost.filter({ published: true }, '-created_date', 50)
      .then(setPosts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div style={{ fontFamily: F, background: BG, minHeight: '100vh' }}>
      <Navbar />

      {/* ── Dark hero, in line with the landing ── */}
      <div style={{ background: DARK, paddingTop: 90 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '72px 32px 80px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${CORAL}18`, border: `1px solid ${CORAL}35`, borderRadius: 999, padding: '5px 14px', marginBottom: 28 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: CORAL, display: 'inline-block', animation: 'blink 1.8s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: CORAL, letterSpacing: '0.08em', textTransform: 'uppercase' }}>The UseWok Blog</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1.0, margin: '0 0 20px' }}>
            Everything about<br />
            <span style={{ color: CORAL }}>AI visibility</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ fontSize: 16, color: 'rgba(255,255,255,0.42)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
            Tips, strategies and studies to help you show up in ChatGPT, Gemini and the other AI engines.
          </motion.p>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 100px' }}>

        {/* Featured article — pulled up onto the dark/light boundary */}
        <div style={{ marginTop: -48, marginBottom: 32 }}>
          {loading ? (
            <div style={{ height: 380, background: DARK, borderRadius: 20, opacity: 0.5 }} />
          ) : featured ? (
            <FeaturedCard post={featured} />
          ) : null}
        </div>

        {/* Article grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : rest.length === 0 && !featured ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontSize: 44, marginBottom: 16 }}>✍️</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: INK, marginBottom: 8, letterSpacing: '-0.03em' }}>Coming soon</p>
            <p style={{ fontSize: 14, color: INK3 }}>Articles about AI visibility are on their way.</p>
          </div>
        ) : rest.length > 0 ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>All articles</p>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {rest.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
            </div>
          </>
        ) : null}
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: '#0D0C0A', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontFamily: F }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="UseWok" style={{ width: 24, height: 'auto' }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>UseWok</span>
        </a>
        <div style={{ display: 'flex', gap: 18 }}>
          {[['Home', '/'], ['Pricing', '/tarifs'], ['Terms', '/terms'], ['Privacy', '/privacy']].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', margin: 0 }}>© 2026 UseWok</p>
      </footer>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}