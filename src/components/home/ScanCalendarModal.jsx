import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { X, ChevronLeft, ChevronRight, Zap, Clock, Calendar } from 'lucide-react';
import { getWokFeatures } from '@/lib/wok-plans';

const F = '"Wix Madefor Text", "Wix Madefor Display", system-ui, sans-serif';
const INK = '#1A1814';
const INK2 = '#857E6E';
const INK3 = '#A8A49F';
const BORDER = 'rgba(21,19,15,0.12)';
const WHITE = '#FFFFFF';
const BG = '#F7F5F0';
const CORAL = '#FF5A1F';
const CORAL_SOFT = 'rgba(255,90,31,0.08)';
const DARK = '#15130F';
const GREEN = '#22A87A';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAY_LABELS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const MIN_YEAR = 2026;
const MAX_YEAR = 2030;

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getDomain(url) { return (url || '').replace(/https?:\/\//, '').split('/')[0]; }

export default function ScanCalendarModal({ open, onClose, userId, siteUrl, user }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [scans, setScans] = useState([]);
  const [scanInProgress, setScanInProgress] = useState(false);
  const [loading, setLoading] = useState(true);

  const features = user ? getWokFeatures(user) : getWokFeatures(null);
  const planLabel = user?.role === 'admin' ? 'Elite' : (user?.subscription_plan || 'Free');
  const planName = planLabel.charAt(0).toUpperCase() + planLabel.slice(1);

  useEffect(() => {
    if (!open || !userId || !siteUrl) return;
    (async () => {
      setLoading(true);
      try {
        const [scanList, profiles] = await Promise.all([
          base44.entities.ScanRecord.filter({ user_id: userId, site_url: siteUrl }).catch(() => []),
          base44.entities.BusinessProfile.filter({ site_url: siteUrl }).catch(() => []),
        ]);
        setScans(scanList || []);
        const prof = (profiles || []).find(p => p.created_by_id === userId);
        setScanInProgress(!!prof?.scan_in_progress);
      } catch {}
      setLoading(false);
    })();
  }, [open, userId, siteUrl]);

  // Build a map of day-string -> events for the current viewing month
  const dayEvents = useMemo(() => {
    const map = {};
    const addEvent = (d, event) => {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(event);
    };

    // 1) Past scans from real history
    scans.forEach(s => {
      const d = new Date(s.created_date);
      addEvent(d, {
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: 'past',
        label: `Scan ${s.scan_type || ''}`.trim(),
      });
    });

    // 2) In-progress (today)
    if (scanInProgress) {
      addEvent(today, { time: 'En cours', type: 'in_progress', label: 'Scan en cours' });
    }

    // 3) Future scheduled scans based on plan
    const lastOfMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const hour = features.auto_scan_hour ?? 6;
    const isAuto = features.auto_scan;

    for (let day = 1; day <= lastOfMonth; day++) {
      const d = new Date(viewYear, viewMonth, day, hour, 0, 0);
      // Only future dates, within bounds
      if (d > today && d.getFullYear() <= MAX_YEAR) {
        if (isAuto) {
          // Daily auto-scan
          addEvent(d, { time: `${String(hour).padStart(2, '0')}:00`, type: 'scheduled', label: 'Scan auto' });
        } else {
          // Free plan: 1 scan on 1st of month only
          if (day === 1) {
            addEvent(d, { time: '09:00', type: 'scheduled', label: 'Scan mensuel' });
          }
        }
      }
    }

    return map;
  }, [scans, scanInProgress, viewYear, viewMonth, features]);

  if (!open) return null;

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  // Monday = 0 ... Sunday = 6
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const totalDays = lastDay.getDate();
  const cells = [];
  // Leading blanks
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  // Trailing blanks to fill the last row
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 5, background: CORAL, color: WHITE, fontSize: 9.5, fontWeight: 700, fontFamily: F }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: WHITE, animation: 'calpulse 1s ease-in-out infinite' }} />
          {ev.time}
        </div>
      );
    }
    if (ev.type === 'past') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 5, background: 'rgba(34,168,122,0.12)', color: '#1A8B5E', fontSize: 9.5, fontWeight: 600, fontFamily: F }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#22A87A' }} />
          {ev.time}
        </div>
      );
    }
    // scheduled
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 5, background: 'transparent', border: `1px solid ${BORDER}`, color: INK2, fontSize: 9.5, fontWeight: 500, fontFamily: F }}>
          <Clock size={8} color={INK3} />
          {ev.time}
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      {/* Voile */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(21,19,15,0.55)', backdropFilter: 'blur(4px)' }} />

      {/* Fenêtre */}
      <div style={{ position: 'relative', width: 'calc(100vw - 32px)', maxWidth: 880, maxHeight: 'calc(100vh - 64px)', background: WHITE, borderRadius: 18, boxShadow: '0 24px 80px rgba(0,0,0,0.24)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <Calendar size={17} color={CORAL} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Calendrier des analyses</h2>
            </div>
            <p style={{ fontSize: 12.5, color: INK2, margin: 0 }}>
              {getDomain(siteUrl)} · Plan {planName}
              {features.auto_scan ? ` · Scan auto ${String(features.auto_scan_hour ?? 6).padStart(2,'0')}:00` : ' · 1 scan/mois'}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={16} color={INK2} />
          </button>
        </div>

        {/* Navigation mois/année */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '14px 24px 10px' }}>
          <button onClick={prevMonth} disabled={!canGoBack} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, width: 32, height: 32, background: WHITE, cursor: canGoBack ? 'pointer' : 'default', opacity: canGoBack ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={16} color={INK2} />
          </button>
          <div style={{ minWidth: 180, textAlign: 'center' }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: INK, letterSpacing: '-0.01em' }}>{MONTHS[viewMonth]} {viewYear}</span>
          </div>
          <button onClick={nextMonth} disabled={!canGoForward} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, width: 32, height: 32, background: WHITE, cursor: canGoForward ? 'pointer' : 'default', opacity: canGoForward ? 1 : 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={16} color={INK2} />
          </button>
        </div>

        {/* Légende */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px 12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: INK3 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: CORAL }} /> En cours
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: INK3 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22A87A' }} /> Analyse passée
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: INK3 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', border: `1.5px solid ${BORDER}`, background: 'transparent' }} /> Planifié
          </div>
        </div>

        {/* Grille calendrier */}
        <div style={{ overflowY: 'auto', padding: '4px 24px 24px' }}>
          {/* En-têtes jours */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: INK3, padding: '6px 0' }}>{d}</div>
            ))}
          </div>
          {/* Cellules */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((dayNum, i) => {
              if (dayNum === null) return <div key={i} style={{ minHeight: 72, borderRadius: 8, background: 'transparent' }} />;
              const cellDate = new Date(viewYear, viewMonth, dayNum);
              const key = `${viewYear}-${viewMonth}-${dayNum}`;
              const events = dayEvents[key] || [];
              const isToday = sameDay(cellDate, today);
              const isPast = cellDate < today && !isToday;

              return (
                <div key={i} style={{
                  minHeight: 72,
                  borderRadius: 8,
                  padding: '5px 6px',
                  background: isToday ? CORAL_SOFT : 'rgba(21,19,15,0.015)',
                  border: `1px solid ${isToday ? 'rgba(255,90,31,0.25)' : 'rgba(21,19,15,0.05)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}>
                  <span style={{
                    fontSize: 11.5,
                    fontWeight: isToday ? 800 : 600,
                    color: isToday ? CORAL : (isPast ? INK3 : INK),
                    textAlign: 'left',
                  }}>{dayNum}</span>
                  {events.slice(0, 3).map((ev, j) => <EventChip key={j} ev={ev} />)}
                  {events.length > 3 && <span style={{ fontSize: 9, color: INK3, fontWeight: 600 }}>+{events.length - 3}</span>}
                </div>
              );
            })}
          </div>

          {/* Note read-only */}
          <p style={{ fontSize: 11, color: INK3, textAlign: 'center', margin: '16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <Zap size={11} color={CORAL} />
            Calendrier en lecture seule — les analyses sont planifiées selon ton plan {planName}.
          </p>
        </div>

        <style>{`@keyframes calpulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    </div>
  );
}