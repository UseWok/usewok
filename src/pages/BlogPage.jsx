import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Clock, Tag } from 'lucide-react';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';
const LOGO = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

function BlogNavbar() {
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
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center" style={{ paddingTop: 20 }}>
        <div className="flex items-center justify-between w-full px-6 py-3"
          style={{ maxWidth: 900, background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', transition: 'all 0.3s', borderRadius: 999, border: '1px solid rgba(0,0,0,0.07)', boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)' }}>
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <img src={LOGO} alt="Stensor" className="w-7 h-7 object-contain" />
            <span className="text-sm font-black tracking-tight" style={{ color: FG }}>Stensor</span>
          </button>
          <div className="hidden md:flex items-center gap-6">
            <a href="/fonctionnalites" className="text-xs text-gray-400 hover:text-black transition-colors">Features</a>
            <a href="/tarifs" className="text-xs text-gray-400 hover:text-black transition-colors">Pricing</a>
            <span className="text-xs font-black text-black border-b border-black pb-0.5">Blog</span>
          </div>
          {isAuth
            ? <button onClick={() => navigate('/app')} className="text-xs font-black px-4 py-2 rounded-lg" style={{ background: FG, color: 'white' }}>Go to app →</button>
            : <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs font-black px-4 py-2.5 rounded-lg border-2 border-black hover:bg-black hover:text-white transition-all" style={{ color: FG }}>Sign in</button>
          }
        </div>
      </header>
      {/* Mobile */}
      <div className="fixed bottom-4 left-4 right-4 z-50 flex md:hidden items-center justify-between px-5 py-3.5 rounded-full"
        style={{ background: 'rgba(10,10,10,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <a href="/fonctionnalites" className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>Features</a>
        <span className="text-xs font-black text-white border-b border-white pb-0.5">Blog</span>
        {isAuth
          ? <button onClick={() => navigate('/app')} className="text-xs font-black px-3 py-1.5 rounded-full" style={{ background: YELLOW, color: FG }}>App →</button>
          : <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs font-black px-3 py-1.5 rounded-full" style={{ background: YELLOW, color: FG }}>Sign in</button>
        }
      </div>
    </>
  );
}

function PostCard({ post, index }) {
  const navigate = useNavigate();
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/blog/${post.slug}`)}
      className="group cursor-pointer flex flex-col overflow-hidden rounded-2xl border border-black/7 hover:border-black/15 hover:shadow-lg transition-all duration-300"
      style={{ background: 'white' }}
    >
      {post.cover_image && (
        <div className="overflow-hidden" style={{ height: 200 }}>
          <img src={post.cover_image} alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="flex flex-col flex-1 p-7">
        <div className="flex items-center gap-3 mb-4">
          {post.category && (
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(221,255,0,0.2)', color: '#6b7c00' }}>
              <Tag className="w-2.5 h-2.5" />
              {post.category}
            </span>
          )}
          {post.reading_time && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock className="w-3 h-3" />
              {post.reading_time} min read
            </span>
          )}
        </div>
        <h2 className="font-black text-lg leading-tight mb-3 group-hover:text-black transition-colors" style={{ color: FG }}>
          {post.title}
        </h2>
        {post.summary && (
          <p className="text-sm leading-relaxed text-gray-500 flex-1 mb-5" style={{ fontFamily: 'var(--font-open)' }}>
            {post.summary}
          </p>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-black/5">
          <span className="text-xs text-gray-300">
            {new Date(post.created_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-xs font-black flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: FG }}>
            Read <ArrowRight className="w-3 h-3" />
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
    document.title = 'Blog — Stensor';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Financial insights, wealth-building strategies, and real stories from the Stensor team.');
    base44.entities.BlogPost.filter({ published: true }, '-created_date', 50)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen font-inter bg-white pb-20 md:pb-0">
      <BlogNavbar />

      {/* Hero */}
      <div className="pt-36 pb-20 px-6 text-center" style={{ background: 'linear-gradient(to bottom, #fafaf8, white)' }}>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-[10px] font-black tracking-[0.35em] uppercase mb-6" style={{ color: 'rgba(0,0,0,0.2)' }}>
          The Stensor Blog
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
          className="font-black tracking-tighter mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: FG }}>
          Financial clarity,<br /><span style={{ color: YELLOW }}>without the sacrifice.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-base text-gray-400 max-w-md mx-auto" style={{ fontFamily: 'var(--font-open)' }}>
          Real insights on wealth, lifestyle, and the psychology of money.
        </motion.p>
      </div>

      {/* Posts grid */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-black/7 overflow-hidden">
                <div className="h-48 animate-pulse" style={{ background: 'rgba(0,0,0,0.04)' }} />
                <div className="p-7 space-y-3">
                  <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.06)', width: '40%' }} />
                  <div className="h-6 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.08)' }} />
                  <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(0,0,0,0.05)', width: '80%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-4xl mb-4">✍️</p>
            <p className="font-black text-xl mb-2" style={{ color: FG }}>No articles yet</p>
            <p className="text-sm text-gray-400">Check back soon — great content is coming.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}