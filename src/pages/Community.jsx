import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, ExternalLink, Users, ArrowLeft } from 'lucide-react';
import { getPageModes } from '@/lib/page-modes';
import { base44 } from '@/api/base44Client';
import UnderConstruction from '@/components/UnderConstruction';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function Community() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [discordUrl, setDiscordUrl] = useState('');

  useEffect(() => {
    getPageModes().then(m => setMode(m.community || 'live'));
    base44.entities.AppSettings.filter({ key: 'community_urls' }).then(results => {
      if (results.length > 0) { try { const u = JSON.parse(results[0].value); setDiscordUrl(u.discord || ''); } catch {} }
    }).catch(() => {});
  }, []);

  if (mode === null) return null;

  if (mode === 'construction') {
    return (
      <UnderConstruction
        title="Communauté en construction"
        subtitle="L'espace communautaire Stensor est en cours de développement."
      />
    );
  }

  return (
    <div className="min-h-screen font-be" style={{ background: '#fafafa' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/app')}
            className="w-9 h-9 flex items-center justify-center"
            style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#888' }} />
          </button>
          <div>
            <h1 className="text-xl font-black" style={{ color: FG }}>Communauté</h1>
            <p className="text-xs" style={{ color: '#aaa' }}>Rejoignez la communauté Stensor</p>
          </div>
        </div>

        <div className="grid gap-4">
          {discordUrl && (
            <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              onClick={() => window.open(discordUrl, '_blank')}
              className="w-full flex items-center gap-4 p-5 text-left transition-all"
              style={{ background: '#5865F2', borderRadius: '14px' }}>
              <div className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}>
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-black text-white text-base">Discord Stensor</p>
                <p className="text-xs text-white/55 mt-0.5">Rejoignez la discussion en temps réel</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40" />
            </motion.button>
          )}

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-5 text-center"
            style={{ background: 'white', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)' }}>
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4"
              style={{ background: YUZU, borderRadius: '12px' }}>
              <Users className="w-6 h-6" style={{ color: FG }} />
            </div>
            <p className="font-black text-base mb-2" style={{ color: FG }}>Forum à venir</p>
            <p className="text-sm" style={{ color: '#999' }}>Un espace d'échange dédié à la communauté Stensor arrive très prochainement.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}