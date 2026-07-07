// Modern footer — Base44 layout style, white bg, clear columns
import { useNavigate } from 'react-router-dom';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

export default function LandingFooter({ logoUrl, footerLinks, disclaimer }) {
  const navigate = useNavigate();

  const cols = [
    {
      title: 'PRODUCT',
      links: [
        { label: 'Features', url: '/fonctionnalites' },
        { label: 'Pricing', url: '/pricing' },
        ...(footerLinks || []).filter(l => l.label !== 'Features' && l.label !== 'Pricing' && l.label !== 'Terms of Use' && l.label !== 'Support'),
      ],
    },
    {
      title: 'LEGAL',
      links: [
        { label: 'Terms of Use', url: '#' },
        { label: 'Privacy Policy', url: '#' },
        ...(footerLinks || []).filter(l => l.label === 'Support'),
      ],
    },
  ];

  return (
    <footer style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.07)', position: 'relative', zIndex: 10 }}>
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand col */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <img src={logoUrl} alt="Stensor" className="w-7 h-7 object-contain" />
              <span className="font-black text-base tracking-tight" style={{ color: FG }}>Stensor</span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(10,10,10,0.52)', maxWidth: '260px' }}>
              Your personal AI financial coach. Build wealth, invest smarter, and reach freedom — in minutes.
            </p>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(10,10,10,0.35)' }}>
                {col.title}
              </p>
              <div className="space-y-3">
                {col.links.map(l => (
                  <a key={l.label} href={l.url}
                    className="block text-sm font-medium transition-colors hover:opacity-70"
                    style={{ color: FG }}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8"
          style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          <p className="text-xs" style={{ color: 'rgba(10,10,10,0.35)' }}>© 2026 Stensor Inc. All rights reserved.</p>
          <p className="text-xs" style={{ color: 'rgba(10,10,10,0.28)' }}>{disclaimer || 'AI responses may contain inaccuracies.'}</p>
        </div>
      </div>
    </footer>
  );
}