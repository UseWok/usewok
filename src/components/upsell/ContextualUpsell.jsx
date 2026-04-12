import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Globe, FileText, Crown, ArrowRight } from 'lucide-react';

/**
 * Renders a contextual upsell card explaining WHY the user should upgrade
 * based on the feature they tried to access.
 *
 * Props:
 *   feature: 'internet' | 'files' | 'expert' | 'discussions' | 'generic'
 *   plan: required plan name (string)
 *   onDismiss: () => void
 */

const FEATURE_CONFIG = {
  internet: {
    icon: Globe,
    title: 'Real-time Web Search',
    why: 'Get answers based on live market data, today\'s news, and current rates — not outdated training data.',
    benefit: 'Available on Advanced+ plans',
    plan: 'Advanced',
  },
  files: {
    icon: FileText,
    title: 'File & Document Analysis',
    why: 'Upload your bank statements, payslips, or investment reports and let Stensor analyze them directly.',
    benefit: 'Available on Essential+ plans',
    plan: 'Essential',
  },
  expert: {
    icon: Crown,
    title: 'Expert Mode (Claude Opus)',
    why: 'The most powerful AI model for complex financial planning — estate strategy, tax optimization, portfolio construction.',
    benefit: 'Available on Expert+ plans',
    plan: 'Expert',
  },
  discussions: {
    icon: Lock,
    title: 'Unlimited Conversations',
    why: 'Your financial journey needs continuity. Pick up any conversation anytime, across all devices.',
    benefit: 'Available on Essential+ plans',
    plan: 'Essential',
  },
  generic: {
    icon: Lock,
    title: 'Premium Feature',
    why: 'This feature helps you get more out of Stensor with smarter, deeper financial coaching.',
    benefit: 'Available on paid plans',
    plan: 'Essential',
  },
};

export default function ContextualUpsell({ feature = 'generic', onDismiss }) {
  const navigate = useNavigate();
  const config = FEATURE_CONFIG[feature] || FEATURE_CONFIG.generic;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="w-full rounded-md overflow-hidden"
      style={{ border: '1px solid rgba(0,0,0,0.09)', background: 'white' }}
    >
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-9 h-9 flex items-center justify-center flex-shrink-0"
          style={{ background: '#DDFF00', borderRadius: '4px' }}>
          <Icon className="w-4 h-4" style={{ color: '#0A0A0A' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black" style={{ color: '#0A0A0A' }}>{config.title}</p>
          <p className="text-[11px]" style={{ color: '#aaa' }}>{config.benefit}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-[11px] font-medium px-2 py-1 hover:bg-black/5 transition-colors" style={{ color: '#bbb', borderRadius: '3px' }}>
            ✕
          </button>
        )}
      </div>

      <div className="px-4 pb-3">
        <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{config.why}</p>
      </div>

      <div className="px-4 pb-4 flex items-center gap-2">
        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-black transition-all hover:opacity-90"
          style={{ background: '#0A0A0A', color: 'white', borderRadius: '4px' }}
        >
          Upgrade to {config.plan} <ArrowRight className="w-3.5 h-3.5" />
        </button>
        {onDismiss && (
          <button onClick={onDismiss} className="text-xs font-medium px-3 py-2 hover:bg-black/5 transition-colors" style={{ color: '#888', borderRadius: '4px' }}>
            Maybe later
          </button>
        )}
      </div>
    </motion.div>
  );
}