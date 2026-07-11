import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronRight, Zap, Clock, CalendarDays, Loader2 } from 'lucide-react';
import { getWokFeatures } from '@/lib/wok-plans';

const F = '"Wix Madefor Text", "Wix Madefor Display", system-ui, sans-serif';
const INK = '#1A1814';
const INK2 = '#857E6E';
const INK3 = '#A8A49F';
const BORDER = 'rgba(21,19,15,0.12)';
const WHITE = '#FFFFFF';
const CORAL = '#FF5A1F';
const CORAL_SOFT = 'rgba(255,90,31,0.06)';
const GREEN = '#22A87A';
const GREEN_SOFT = 'rgba(34,168,122,0.08)';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAY_LABELS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const MIN_YEAR = 2026;
const MAX_YEAR = 2030;

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getDomain(url) { return (url || '').replace(/https?:\/\//, '').split('/')[0]; }

const SCAN_LABELS = {
  lite: 'Analyse rapide',
  full: 'Analyse complète',
  auto: 'Scan automatique',
  monthly: 'Scan mensuel',
};

export default function ScanCalendarInline({ userId, siteUrl, user, scanInProgress }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const features = user ? getWokFeatures(user) : getWokFeatures(null);
  const planLabel = user?.role === 'admin' ? 'Elite' : (user?.subscription_plan || 'Free');
  const planName = planLabel.charAt(0).toUpperCase() + planLabel.slice(1);

  useEffect(() => {
    if (!userId || !siteUrl) return;
    (async () => {
      setLoading(true);
      try {
        const scanList = await base44.entities.ScanRecord.filter({ user_id: userId, site_url: siteUrl }).catch(() => []);
        setScans(scanList || []);
      } catch {}
      setLoading(false);
    })();
  }, [userId, siteUrl]);

  const dayEvents = useMemo(() => {
    const map = {};
    const addEvent = (d, event) => {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(event);
    };

    scans.forEach(s => {
      const d = new Date(s.created_date);
      addEvent(d, {
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: 'past',
        label: SCAN_LABELS[s.scan_type] || `Analyse ${s.scan_type || ''}`.trim() || 'Analyse',
        score: s.score_overall,
      });
    });

    if (scanInProgress) {
      addEvent(today, { time: 'En cours', type: 'in_progress', label: 'Analyse en cours' });
    }

    const lastOfMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const hour = features.auto_scan_hour ?? 6;
    const isAuto = features.auto_scan;

    for (let day = 1; day <= lastOfMonth; day++) {
      const d = new Date(viewYear, viewMonth, day, hour, 0, 0);
      if (d > today && d.getFullYear() <= MAX_YEAR) {
        if (isAuto) {
          addEvent(d, { time: `${String(hour).padStart(2, '0')}:00`, type: 'scheduled', label: 'Scan automatique' });
        } else {
          if (day === 1) {
            addEvent(d, { time: '09:00', type: 'scheduled', label: 'Scan mensuel' });
          }
        }
      }
    }

    return map;
  }, [scans, scanInProgress, viewYear, viewMonth, features]);

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const totalDays = lastDay.getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const canGoBack = viewYear > MIN_YEAR || (viewYear === MIN_YEAR && viewMonth > 0);
  const canGoForward = viewYear < MAX_YEAR || (viewYear === MAX_YEAR && viewMonth < 11);

  const prevMonth = () => {
    if (!canGoBack) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (!canGoForward) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const EventChip = ({ ev }) => {
    if (ev.type === 'in_progress') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 5, background: CORAL, color: WHITE, fontSize: 9, fontWeight: 700, fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: WHITE, animation: 'calpulse 1s ease-in-out infinite', flexShrink: 0 }} />
          {ev.label}
        </div>
      );
    }
    if (ev.type === 'past') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 5, background: GREEN_SOFT, color: '#1A8B5E', fontSize: 9, fontWeight: 600, fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />
          {ev.label}
          {ev.score ? ` · ${ev.score}` : ''}
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 5, background: 'transparent', border: `1px solid ${BORDER}`, color: INK2, fontSize: 9, fontWeight: 500, fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <Clock size={8} color={INK3} style={{ flexShrink: 0 }} />
        {ev.label}
      </div>
    );
  };

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 22px', fontFamily: F }}>
      {/* ── En-tête ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarDays size={17} color={CORAL} />
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.01em' }}>Calendrier des analyses</h3>
            <p style={{ fontSize: 11.5, color: INK3, margin: '1px 0 0' }}>{getDomain(siteUrl)} · Plan {planName}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={prevMonth} disabled={!canGoBack} style={{ border: `1px solid ${BORDER}`, borderRadius: 7, width: 28, height: 28, background: WHITE, cursor: canGoBack ? 'pointer' : 'default', opacity: canGoBack ? 1 : 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={15} color={INK2} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 800, color: INK, minWidth: 120, textAlign: 'center', letterSpacing: '-0.01em' }}>{MONTHS[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} disabled={!canGoForward} style={{ border: `1px solid ${BORDER}`, borderRadius: 7, width: 28, height: 28, background: WHITE, cursor: canGoForward ? 'pointer' : 'default', opacity: canGoForward ? 1 : 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={15} color={INK2} />
          </button>
        </div>
      </div>

      {/* ── Légende ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: INK3 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: CORAL }} /> En cours
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: INK3 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN }} /> Analyse passée
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: INK3 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', border: `1.5px solid ${BORDER}`, background: 'transparent' }} /> Planifié
        </div>
      </div>

      {/* ── Grille ── */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Loader2 size={20} color={INK3} className="animate-spin" />
        </div>
      ) : (
        <>
          {/* En-têtes jours */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: INK3, padding: '4px 0' }}>{d}</div>
            ))}
          </div>
          {/* Cellules */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((dayNum, i) => {
              if (dayNum === null) return <div key={i} style={{ minHeight: 78, borderRadius: 8, background: 'transparent' }} />;
              const cellDate = new Date(viewYear, viewMonth, dayNum);
              const key = `${viewYear}-${viewMonth}-${dayNum}`;
              const events = dayEvents[key] || [];
              const isToday = sameDay(cellDate, today);
              const isPast = cellDate < today && !isToday;

              return (
                <div key={i} style={{
                  minHeight: 78,
                  borderRadius: 8,
                  padding: '4px 5px',
                  background: isToday ? CORAL_SOFT : (events.length > 0 ? 'rgba(21,19,15,0.015)' : 'transparent'),
                  border: `1px solid ${isToday ? 'rgba(255,90,31,0.2)' : 'rgba(21,19,15,0.05)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: isToday ? 800 : 600,
                    color: isToday ? CORAL : (isPast ? INK3 : INK),
                    textAlign: 'left',
                    marginBottom: 1,
                  }}>{dayNum}</span>
                  {events.slice(0, 3).map((ev, j) => <EventChip key={j} ev={ev} />)}
                  {events.length > 3 && <span style={{ fontSize: 8.5, color: INK3, fontWeight: 600, paddingLeft: 6 }}>+{events.length - 3}</span>}
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 10.5, color: INK3, textAlign: 'center', margin: '14px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Zap size={10} color={CORAL} />
            Les analyses sont planifiées selon ton plan {planName}.
          </p>
        </>
      )}

      <style>{`@keyframes calpulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}