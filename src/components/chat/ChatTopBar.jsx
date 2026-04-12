import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserColor } from '@/lib/user-color';
import { FG, YUZU, LOGO_URL } from '@/lib/chat-constants';

export default function ChatTopBar({ user, mode, hasInternet, agentLabel, onUpgradeClick }) {
  const navigate = useNavigate();
  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="flex items-center px-4 h-14 flex-shrink-0 z-20 relative bg-white border-b border-border">
      <button
        onClick={() => navigate('/app')}
        className="w-8 h-8 rounded-sm flex items-center justify-center mr-3 flex-shrink-0 hover:bg-black/5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <img src={LOGO_URL} alt="Stensor" className="w-6 h-6 object-contain flex-shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold" style={{ color: FG }}>Stensor</p>
            <span className="text-[10px] px-1.5 py-0.5 font-bold rounded-sm" style={{ background: YUZU, color: FG }}>
              {mode.label}
            </span>
            {hasInternet && (
              <span className="text-[10px] px-1.5 py-0.5 font-semibold hidden sm:inline-block rounded-sm bg-muted text-muted-foreground">
                Internet
              </span>
            )}
          </div>
          <p className="text-[10px] hidden sm:block text-muted-foreground">{agentLabel || 'Global Agent'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onUpgradeClick}
          className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-sm transition-opacity hover:opacity-80"
          style={{ background: YUZU, color: FG }}
        >
          <TrendingUp className="w-3 h-3" /> Upgrade
        </button>
        <div
          className="w-8 h-8 rounded-sm flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
          style={{ background: getUserColor(user) }}
        >
          {userInitial}
        </div>
      </div>
    </div>
  );
}