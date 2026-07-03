import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const INK = '#15130F';
const INK_FAINT = 'rgba(21,19,15,0.55)';

export default function TrustpilotStrip({ compact = false }) {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    base44.entities.Testimonial.filter({ visible: true }).then(list => {
      setTestimonials((list || []).sort((a, b) => (a.order || 0) - (b.order || 0)));
    }).catch(() => {});
  }, []);

  if (testimonials.length === 0) return null;
  const avg = (testimonials.reduce((s, t) => s + (t.rating || 5), 0) / testimonials.length).toFixed(1);

  return (
    <div style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: compact ? 10 : 14 }}>
        <div style={{ display: 'flex', gap: 1 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={13} fill={i < Math.round(avg) ? '#00B67A' : 'none'} color={i < Math.round(avg) ? '#00B67A' : 'rgba(21,19,15,0.2)'} />
          ))}
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{avg}/5</span>
        <span style={{ fontSize: 11.5, color: INK_FAINT }}>· {testimonials.length} avis vérifiés</span>
      </div>
      {!compact && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(testimonials.length, 3)}, 1fr)`, gap: 10 }}>
          {testimonials.slice(0, 3).map((t, i) => (
            <div key={t.id || i} style={{ background: '#fff', border: '1px solid rgba(21,19,15,0.10)', borderRadius: 12, padding: 12 }}>
              <div style={{ display: 'flex', gap: 1, marginBottom: 6 }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={10} fill={j < (t.rating || 5) ? '#00B67A' : 'none'} color={j < (t.rating || 5) ? '#00B67A' : 'rgba(21,19,15,0.2)'} />
                ))}
              </div>
              <p style={{ fontSize: 11.5, color: '#4A453B', lineHeight: 1.5, margin: '0 0 8px' }}>"{t.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt="" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F0EFEB' }} />
                )}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: INK }}>{t.author_name}</div>
                  {t.author_role && <div style={{ fontSize: 10, color: INK_FAINT }}>{t.author_role}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}