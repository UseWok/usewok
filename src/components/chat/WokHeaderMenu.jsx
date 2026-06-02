// Top-left "Wok" branded dropdown menu
import { useNavigate } from 'react-router-dom';
import { Home, CreditCard, Settings, Zap, BookOpen, LifeBuoy, ChevronRight } from 'lucide-react';

export default function WokHeaderMenu({ isOpen, setIsOpen, user, userPlan, setFullscreenModal }) {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'fixed', top: '4px', left: '4px', zIndex: 99999 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 hover:bg-zinc-100 rounded-lg transition-colors p-1.5">
        <span className="text-sm font-bold text-zinc-900">Wok</span>
        <svg className="w-3.5 h-3.5 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-zinc-200 overflow-hidden w-56 z-[100000]">
          <div className="p-2.5 space-y-1">
            <button onClick={() => { setIsOpen(false); navigate('/app'); }}
              className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#F7F7F8] rounded transition-colors text-left group">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2} />
                <span className="text-[13px] font-normal text-[#1A1A1A]">Home</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#999999] group-hover:text-[#666666] transition-colors" />
            </button>

            <div className="px-2 py-1.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2} />
                  <span className="text-[13px] font-normal text-[#1A1A1A]">Credits</span>
                </div>
                <span className="text-[11px] font-normal text-[#666666]">
                  {user?.credits_used || 0}/{userPlan?.credits_limit || user?.credits_limit || 10}
                </span>
              </div>
              <div className="h-1 bg-[#F0F0F0] rounded-full overflow-hidden ml-6">
                <div className="h-full bg-[#1A1A1A] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (user?.credits_used || 0) / (userPlan?.credits_limit || user?.credits_limit || 10) * 100)}%` }} />
              </div>
            </div>

            <div className="h-px bg-[#E5E5E5] my-1" />

            {[
              { icon: Settings, label: 'Settings', modal: 'settings' },
              { icon: Zap, label: 'Upgrade your plan', modal: 'pricing' },
              { icon: BookOpen, label: 'Documentation', modal: 'docs' },
              { icon: LifeBuoy, label: 'Support', modal: 'support' },
            ].map(({ icon: Icon, label, modal }) => (
              <button key={modal}
                onClick={() => { setIsOpen(false); setFullscreenModal(modal); }}
                className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-[#F7F7F8] rounded transition-colors text-left group">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#1A1A1A]" strokeWidth={2} />
                  <span className="text-[13px] font-normal text-[#1A1A1A]">{label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#999999] group-hover:text-[#666666] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}