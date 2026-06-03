import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { loadDiscussionsFromCloud } from '@/lib/chat-storage';
import { getLocalDiscussions } from '@/lib/chat-storage';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function BuildCard({ build, index }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  // Try to get a preview iframe from rawContent stored in localStorage
  const rawContent = (() => {
    try { return localStorage.getItem(`fiche_${build.id}`) || null; } catch { return null; }
  })();

  const hasPreview = !!rawContent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col gap-3 cursor-pointer group"
      onClick={() => navigate(`/chat?conversationId=${build.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Preview thumbnail */}
      <div
        className="relative rounded-xl overflow-hidden border border-[#E8E8E6] bg-[#F7F7F5]"
        style={{
          aspectRatio: '16/10',
          boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'box-shadow 220ms ease, transform 220ms ease',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        {hasPreview ? (
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script><style>body{margin:0;overflow:hidden;pointer-events:none;transform-origin:top left;transform:scale(0.35);width:285%;height:285%;}</style></head><body>${rawContent.replace(/```(?:jsx|javascript|react)?\n?/g, '').replace(/```$/g, '')}</body></html>`}
            className="w-full h-full border-0 pointer-events-none"
            title={build.title}
            sandbox="allow-scripts"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#EBEBEA] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 9h6M9 12h6M9 15h4"/>
              </svg>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
          style={{ opacity: hovered ? 1 : 0, background: 'rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-md text-[12px] font-semibold text-[#1A1A1A]">
            Open <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="px-0.5">
        <p className="text-[13px] font-semibold text-[#1A1A1A] truncate leading-snug">
          {build.title || 'Untitled build'}
        </p>
        <p className="text-[11px] text-[#999999] flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3" />
          {timeAgo(build.date || build.updatedAt)}
        </p>
      </div>
    </motion.div>
  );
}

export default function BuildsGallery() {
  const navigate = useNavigate();
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from cloud first, fallback to local
    loadDiscussionsFromCloud().then(cloudBuilds => {
      if (cloudBuilds.length > 0) {
        setBuilds(cloudBuilds.slice(0, 6));
      } else {
        const ws = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
        const wsId = ws.find(w => w.current)?.id || 'default';
        setBuilds((getLocalDiscussions(wsId) || []).slice(0, 6));
      }
    }).catch(() => {
      const ws = JSON.parse(localStorage.getItem('wok_workspaces') || '[{"id":"default"}]');
      const wsId = ws.find(w => w.current)?.id || 'default';
      setBuilds((getLocalDiscussions(wsId) || []).slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  if (loading || builds.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 pb-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[13px] font-semibold text-[#1A1A1A] tracking-tight">My builds</h2>
        <button
          onClick={() => navigate('/discussions')}
          className="text-[12px] text-[#999999] hover:text-[#1A1A1A] transition-colors flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {builds.map((build, i) => (
          <BuildCard key={build.id} build={build} index={i} />
        ))}
      </div>
    </div>
  );
}