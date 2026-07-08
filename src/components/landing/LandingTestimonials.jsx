import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Linkedin } from 'lucide-react';
import { AVATAR_GRADIENTS } from '@/lib/user-color';

const FALLBACK = [
  { author_name: 'Camille Aubert', author_role: 'Marketing Lead', rating: 5, text: "A clear tool to understand where we're cited by AI, and where we're not yet.", avatar_color: 'sunset', linkedin_url: '', trustpilot_url: '' },
  { author_name: 'Julien Roze', author_role: 'Growth Lead', rating: 5, text: "The perfect starting point to prioritize our AI visibility actions without spending weeks on it.", avatar_color: 'ocean', linkedin_url: '', trustpilot_url: '' },
  { author_name: 'Sarah Nizan', author_role: 'Strategy & Ops', rating: 5, text: "We finally have a view of our share of voice against competitors on ChatGPT and Claude.", avatar_color: 'mint', linkedin_url: '', trustpilot_url: '' },
];

function initials(name) {
  const p = (name || '').trim().split(/[\s\-\.]+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return (name || '??').slice(0, 2).toUpperCase();
}

function getGradient(colorId) {
  const found = AVATAR_GRADIENTS.find(c => c.id === colorId);
  return (found || AVATAR_GRADIENTS[0]).value;
}

export function TrustpilotIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z" fill="#00B67A" />
    </svg>
  );
}

export default function LandingTestimonials() {
  const [quotes, setQuotes] = useState(FALLBACK);

  useEffect(() => {
    base44.entities.Testimonial.filter({ visible: true }, 'order', 6)
      .then(items => { if (items && items.length > 0) setQuotes(items); })
      .catch(() => {});
  }, []);

  return (
    <div className="test-grid">
      {quotes.map((q, i) => {
        const grad = getGradient(q.avatar_color);
        const hasPhoto = !!q.avatar_url;
        const rating = q.rating || 5;
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        return (
          <div className="test-card" key={i}>
            <div className="stars">{stars}</div>
            <p>"{q.text}"</p>
            <div className="test-who">
              {hasPhoto ? (
                <img src={q.avatar_url} alt={q.author_name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div className="av" style={{ background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>{initials(q.author_name)}</div>
              )}
              <div style={{ flex: 1 }}>
                <b>{q.author_name}</b>
                <span>{q.author_role}</span>
              </div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                {q.linkedin_url && (
                  <a href={q.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: 'rgba(21,19,15,0.06)', color: '#0A66C2' }}>
                    <Linkedin size={13} />
                  </a>
                )}
                {q.trustpilot_url && (
                  <a href={q.trustpilot_url} target="_blank" rel="noopener noreferrer" title="Trustpilot"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: 'rgba(21,19,15,0.06)' }}>
                    <TrustpilotIcon size={13} />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}