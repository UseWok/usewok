import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Clock, Tag } from 'lucide-react';

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
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center" style={{ paddingTop: 20 }}>
      <div className="flex items-center justify-between w-full px-6 py-3"
        style={{ maxWidth: 900, background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', transition: 'all 0.3s', borderRadius: 999, border: '1px solid rgba(0,0,0,0.07)', boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.04)' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <img src={LOGO} alt="Stensor" className="w-7 h-7 object-contain" />
          <span className="text-sm font-black tracking-tight" style={{ color: FG }}>Stensor</span>
        </button>
        <button onClick={() => navigate('/blog')}
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
        </button>
        {isAuth
          ? <button onClick={() => navigate('/app')} className="text-xs font-black px-4 py-2 rounded-lg" style={{ background: FG, color: 'white' }}>Go to app →</button>
          : <button onClick={() => base44.auth.redirectToLogin('/app')} className="text-xs font-black px-4 py-2.5 rounded-lg border-2 border-black hover:bg-black hover:text-white transition-all" style={{ color: FG }}>Sign in</button>
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
        // Dynamic SEO
        document.title = `${p.title} — Stensor Blog`;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
        metaDesc.setAttribute('content', p.summary || p.title);
        // OG tags
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
        ogTitle.setAttribute('content', p.title);
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
        ogDesc.setAttribute('content', p.summary || '');
        if (p.cover_image) {
          let ogImg = document.querySelector('meta[property="og:image"]');
          if (!ogImg) { ogImg = document.createElement('meta'); ogImg.setAttribute('property', 'og:image'); document.head.appendChild(ogImg); }
          ogImg.setAttribute('content', p.cover_image);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    return () => {
      document.title = 'Stensor';
    };
  }, [slug]);

  if (loading) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-inter px-6 text-center">
      <BlogNavbar />
      <p className="text-5xl mb-6">🔍</p>
      <h1 className="font-black text-2xl mb-3" style={{ color: FG }}>Article not found</h1>
      <p className="text-gray-400 mb-8 text-sm">This article may have been removed or is not yet published.</p>
      <button onClick={() => navigate('/blog')} className="text-sm font-black px-6 py-3 rounded-lg flex items-center gap-2" style={{ background: FG, color: 'white' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </button>
    </div>
  );

  return (
    <div className="min-h-screen font-inter bg-white">
      <BlogNavbar />

      {/* Cover image */}
      {post.cover_image && (
        <div className="w-full overflow-hidden" style={{ height: 'clamp(280px, 45vw, 520px)', marginTop: 0 }}>
          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(255,255,255,0.8))' }} />
        </div>
      )}

      {/* Article */}
      <div className="max-w-2xl mx-auto px-6" style={{ paddingTop: post.cover_image ? '3rem' : '8rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Meta */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button onClick={() => navigate('/blog')}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Blog
            </button>
            <span className="text-gray-200">·</span>
            {post.category && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(221,255,0,0.2)', color: '#6b7c00' }}>
                <Tag className="w-2.5 h-2.5" /> {post.category}
              </span>
            )}
            {post.reading_time && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" /> {post.reading_time} min read
              </span>
            )}
            <span className="text-xs text-gray-300 ml-auto">
              {new Date(post.created_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-black tracking-tighter mb-4 leading-[1.0]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: FG }}>
            {post.title}
          </h1>
          {post.summary && (
            <p className="text-lg text-gray-400 mb-12 leading-relaxed" style={{ fontFamily: 'var(--font-open)' }}>
              {post.summary}
            </p>
          )}
          <div className="w-12 h-1 mb-12 rounded-full" style={{ background: YELLOW }} />

          {/* Content */}
          <div style={{ paddingBottom: '6rem' }}>
            <div
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
              className="blog-render"
            />
          </div>
          <style>{`
            .blog-render { font-size: 17px; line-height: 1.85; color: #1a1a1a; font-family: var(--font-open); }
            .blog-render p { margin: 0 0 1.2em; }
            .blog-render strong, .blog-render b { font-weight: 700; color: #0A0A0A; }
            .blog-render h1 { font-size: 1.9rem; font-weight: 800; margin: 1.5em 0 0.5em; color: #0A0A0A; }
            .blog-render h2 { font-size: 1.4rem; font-weight: 700; margin: 1.4em 0 0.4em; color: #0A0A0A; }
            .blog-render h3 { font-size: 1.15rem; font-weight: 700; margin: 1.2em 0 0.3em; color: #0A0A0A; }
            .blog-render ul { list-style: disc; padding-left: 1.4em; margin: 0.5em 0 1em; }
            .blog-render ol { list-style: decimal; padding-left: 1.4em; margin: 0.5em 0 1em; }
            .blog-render li { margin: 0.3em 0; }
            .blog-render blockquote { border-left: 3px solid #DDFF00; padding-left: 1em; margin: 1em 0; color: #555; font-style: italic; }
            .blog-render img { max-width: 100%; border-radius: 12px; margin: 1em 0; }
            .blog-render a { color: #2563eb; text-decoration: underline; }
            .blog-render br { display: block; content: ''; margin: 0.5em 0; }
          `}</style>
        </motion.div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-black/5 py-16 px-6 text-center">
        <p className="font-black text-xl mb-2" style={{ color: FG }}>Ready to build real wealth?</p>
        <p className="text-sm text-gray-400 mb-6">No sacrifices. Just clarity.</p>
        <button onClick={() => base44.auth.redirectToLogin('/app')}
          className="inline-flex items-center gap-2 px-8 py-4 font-black text-sm rounded-xl hover:opacity-90 transition-opacity"
          style={{ background: FG, color: 'white' }}>
          Start free with Stensor <ArrowLeft className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
}