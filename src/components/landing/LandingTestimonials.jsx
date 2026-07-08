import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
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

export function LinkedinIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
    </svg>
  );
}

export function TrustpilotIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z" />
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
        const hasLinks = q.linkedin_url || q.trustpilot_url;
        return (
          <div className="test-card" key={i} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="stars">{stars}</div>
            <p>"{q.text}"</p>
            <div className="test-who" style={{ marginTop: 'auto' }}>
              {hasPhoto ? (
                <img src={q.avatar_url} alt={q.author_name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div className="av" style={{ background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>{initials(q.author_name)}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>{q.author_name}</b>
                <span>{q.author_role}</span>
              </div>
              {hasLinks && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {q.linkedin_url && (
                    <a href={q.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, color: 'rgba(21,19,15,0.4)', transition: 'color 150ms' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#0A66C2'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(21,19,15,0.4)'}>
                      <LinkedinIcon size={15} />
                    </a>
                  )}
                  {q.trustpilot_url && (
                    <a href={q.trustpilot_url} target="_blank" rel="noopener noreferrer" title="Trustpilot"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, color: 'rgba(21,19,15,0.4)', transition: 'color 150ms' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#00B67A'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(21,19,15,0.4)'}>
                      <TrustpilotIcon size={15} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}