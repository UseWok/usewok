import { useNavigate } from 'react-router-dom';
import { Hammer, Zap } from 'lucide-react';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function UnderConstruction({ title = "Bientôt disponible", subtitle = "Cette section est en cours de développement." }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center font-be">
      <div className="w-14 h-14 flex items-center justify-center mb-6"
        style={{ background: YUZU, borderRadius: '16px' }}>
        <Hammer className="w-7 h-7" style={{ color: FG }} />
      </div>
      <h2 className="text-2xl font-black mb-3" style={{ color: FG }}>{title}</h2>
      <p className="text-sm max-w-sm mb-8 leading-relaxed" style={{ color: '#888' }}>{subtitle}</p>
      <button onClick={() => navigate('/chat')}
        className="flex items-center gap-2 px-6 py-3.5 text-sm font-black transition-all hover:opacity-85"
        style={{ background: FG, color: 'white', borderRadius: '10px' }}>
        <Zap className="w-4 h-4" style={{ color: YUZU }} />
        Démarrer une conversation
      </button>
    </div>
  );
}