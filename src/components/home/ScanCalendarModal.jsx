import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { X, ChevronLeft, ChevronRight, Zap, Clock, CalendarDays, Loader2, TrendingUp, Eye, MessageSquare, Target } from 'lucide-react';
import { getWokFeatures } from '@/lib/wok-plans';
import { getActiveDomain } from '@/lib/active-domain';
import { getCachedProfiles } from '@/lib/data-cache';

const F = '"Wix Madefor Text", "Wix Madefor Display", system-ui, sans-serif';
const INK = '#1A1814';
const INK2 = '#857E6E';
const INK3 = '#A8A49F';
const BORDER = 'rgba(21,19,15,0.12)';
const WHITE = '#FFFFFF';
const BG = '#F7F5F0';
const CORAL = '#FF5A1F';
const CORAL_SOFT = 'rgba(255,90,31,0.06)';
const GREEN = '#22A87A';
const GREEN_SOFT = 'rgba(34,168,122,0.08)';
const VIOLET = '#7B4FE0';

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAY_LABELS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

const SCAN_LABELS = {
  lite: 'Analyse rapide',
  full: 'Analyse complète',
};

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getDomain(url) { return (url || '').replace(/https?:\/\//, '').split('/')[0]; }

/**
 * Calcule le nombre de scans planifiés par mois selon le plan.
 * Universel — fonctionne pour tous les abonnements.
 */
function getScansPerMonth(features) {
  if (features.scans_per_period === -1) return 30;        // Elite: illimité → 1/jour
  if (features.scan_period === 'day') return 30;            // Pro: 1/jour → 30/mois
  return features.scans_per_period || 1;                    // Starter/Free: N/mois
}

/**
 * Génère les dates des scans planifiés pour un mois donné.
 * Distribue les scans uniformément, peu importe l'abonnement.
 */
function generateScheduledScans(features, viewYear, viewMonth, today, subEndDate) {
  const scans = [];
  const lastOfMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const hour = features.auto_scan_hour ?? 6;
  const isAuto = features.auto_scan;
  const scansPerMonth = getScansPerMonth(features);

  if (!isAuto) {
    // Free: 1 scan le 1er du mois à 09:00
    for (let day = 1; day <= lastOfMonth; day++) {
      const d = new Date(viewYear, viewMonth, day, 9, 0, 0);
      if (d > today && day === 1 && d <= subEndDate) {
        scans.push({ date: d, time: '09:00', label: 'Scan mensuel', type: 'scheduled' });
      }
    }
    return scans;
  }

  if (scansPerMonth >= 30) {
    // 1 scan/jour à l'heure auto
    for (let day = 1; day <= lastOfMonth; day++) {
      const d = new Date(viewYear, viewMonth, day, hour, 0, 0);
      if (d > today && d <= subEndDate) {
        scans.push({ date: d, time: `${String(hour).padStart(2, '0')}:00`, label: 'Scan auto', type: 'scheduled' });
      }
    }
  } else {
    // Distribuer N scans sur le mois, un tous les `interval` jours
    const interval = Math.max(1, Math.round(30 / scansPerMonth));
    for (let day = 1; day <= lastOfMonth; day += interval) {
      const d = new Date(viewYear, viewMonth, day, hour, 0, 0);
      if (d > today && d <= subEndDate) {
        scans.push({ date: d, time: `${String(hour).padStart(2, '0')}:00`, label: 'Scan auto', type: 'scheduled' });
      }
    }
  }

  return scans;
}

export default function ScanCalendarModal({ open, onClose, userId, siteUrl, user }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [scans, setScans] = useState([]);
  const [scanInProgress, setScanInProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState(null);

  const features = user ? getWokFeatures(user) : getWokFeatures(null);
  const planLabel = user?.role === 'admin' ? 'Elite' : (user?.subscription_plan || 'Free');
  const planName = planLabel.charAt(0).toUpperCase() + planLabel.slice(1);
  const scansPerMonth = getScansPerMonth(features);

  // Date de fin d'abonnement: cap à 12 mois max depuis aujourd'hui
  const subEndDate = useMemo(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 12);
    return d;
  }, []);

  const maxViewDate = subEndDate;
  const canGoForward = (y, m) => {
    if (y < maxViewDate.getFullYear()) return true;
    if (y === maxViewDate.getFullYear() && m < maxViewDate.getMonth()) return true;
    return false;
  };

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

  // Map jour → événements
  const dayEvents = useMemo(() => {
    const map = {};
    const addEvent = (d, event) => {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(event);
    };

    // 1) Scans passés (historique réel)
    scans.forEach(s => {
      const d = new Date(s.created_date);
      addEvent(d, {
        time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        type: 'past',
        label: SCAN_LABELS[s.scan_type] || 'Analyse',
        score: s.score_overall,
        scoreAI: s.score_ai_visibility,
        scoreClarity: s.score_message_clarity,
        scoreCommercial: s.score_commercial_signal,
        lrs: s.lrs_score,
        scanType: s.scan_type,
        raw: s,
      });
    });

    // 2) Scan en cours (aujourd'hui)
    if (scanInProgress) {
      addEvent(today, { time: 'En cours', type: 'in_progress', label: 'Analyse en cours' });
    }

    // 3) Scans planifiés (calcul universel)
    const scheduled = generateScheduledScans(features, viewYear, viewMonth, today, subEndDate);
    scheduled.forEach(s => addEvent(s.date, s));

    // Trier les événements par heure dans chaque jour
    for (const key in map) {
      map[key].sort((a, b) => {
        if (a.type === 'in_progress') return -1;
        if (b.type === 'in_progress') return 1;
        return (a.time || '').localeCompare(b.time || '');
      });
    }

    return map;
  }, [scans, scanInProgress, viewYear, viewMonth, features, subEndDate]);

  if (!open) return null;

  // Grille calendrier
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;
  const totalDays = lastDay.getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const canGoBack = viewYear > 2026 || (viewYear === 2026 && viewMonth > 0);
  const canGoFwd = canGoForward(viewYear, viewMonth);

  const prevMonth = () => {
    if (!canGoBack) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (!canGoFwd) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(21,19,15,0.55)', backdropFilter: 'blur(4px)' }} />

      <div style={{ position: 'relative', width: 'calc(100vw - 32px)', maxWidth: 860, maxHeight: 'calc(100vh - 48px)', background: WHITE, borderRadius: 18, boxShadow: '0 24px 80px rgba(0,0,0,0.24)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 14px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={18} color={CORAL} />
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Calendrier des analyses</h2>
              <p style={{ fontSize: 12, color: INK2, margin: '1px 0 0' }}>
                {getDomain(siteUrl)} · Plan {planName} · {scansPerMonth >= 30 ? '1 scan/jour' : `${scansPerMonth} scans/mois`}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={15} color={INK2} />
          </button>
        </div>

        {/* ── Navigation mois ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '12px 22px 8px', flexShrink: 0 }}>
          <button onClick={prevMonth} disabled={!canGoBack} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, width: 30, height: 30, background: WHITE, cursor: canGoBack ? 'pointer' : 'default', opacity: canGoBack ? 1 : 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={15} color={INK2} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 800, color: INK, minWidth: 160, textAlign: 'center', letterSpacing: '-0.01em' }}>{MONTHS[viewMonth]} {viewYear}</span>
          <button onClick={nextMonth} disabled={!canGoFwd} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, width: 30, height: 30, background: WHITE, cursor: canGoFwd ? 'pointer' : 'default', opacity: canGoFwd ? 1 : 0.25, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={15} color={INK2} />
          </button>
        </div>

        {/* ── Légende ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 22px 10px', flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: INK3 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: CORAL }} /> En cours
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: INK3 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN }} /> Analyse passée (cliquable)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: INK3 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', border: `1.5px solid ${BORDER}`, background: 'transparent' }} /> Planifié
          </div>
        </div>

        {/* ── Grille ── */}
        <div style={{ overflowY: 'auto', padding: '4px 22px 22px', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
              <Loader2 size={22} color={INK3} className="animate-spin" />
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
                  if (dayNum === null) return <div key={i} style={{ minHeight: 82, borderRadius: 8, background: 'transparent' }} />;
                  const cellDate = new Date(viewYear, viewMonth, dayNum);
                  const key = `${viewYear}-${viewMonth}-${dayNum}`;
                  const events = dayEvents[key] || [];
                  const isToday = sameDay(cellDate, today);
                  const isPast = cellDate < today && !isToday;

                  return (
                    <div key={i} style={{
                      minHeight: 82,
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
                      {events.slice(0, 3).map((ev, j) => {
                        if (ev.type === 'in_progress') {
                          return (
                            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 5px', borderRadius: 5, background: CORAL, color: WHITE, fontSize: 8.5, fontWeight: 700, fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                              <span style={{ width: 4, height: 4, borderRadius: '50%', background: WHITE, animation: 'calpulse 1s ease-in-out infinite', flexShrink: 0 }} />
                              {ev.label}
                            </div>
                          );
                        }
                        if (ev.type === 'past') {
                          return (
                            <button key={j} onClick={() => setSelectedScan(ev)} title="Voir le détail"
                              style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 5px', borderRadius: 5, background: GREEN_SOFT, color: '#1A8B5E', fontSize: 8.5, fontWeight: 600, fontFamily: F, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <span style={{ width: 4, height: 4, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />
                              {ev.time} · {ev.score || 0}
                            </button>
                          );
                        }
                        return (
                          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 5px', borderRadius: 5, background: 'transparent', border: `1px solid ${BORDER}`, color: INK2, fontSize: 8.5, fontWeight: 500, fontFamily: F, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <Clock size={8} color={INK3} style={{ flexShrink: 0 }} />
                            {ev.time}
                          </div>
                        );
                      })}
                      {events.length > 3 && <span style={{ fontSize: 8, color: INK3, fontWeight: 600, paddingLeft: 5 }}>+{events.length - 3}</span>}
                    </div>
                  );
                })}
              </div>

              <p style={{ fontSize: 10.5, color: INK3, textAlign: 'center', margin: '14px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <Zap size={10} color={CORAL} />
                Les analyses sont planifiées selon ton plan {planName}. Clique sur une analyse passée pour voir le détail.
              </p>
            </>
          )}
        </div>

        {/* ── Popup détail scan ── */}
        {selectedScan && (
          <>
            <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.01)' }} onClick={() => setSelectedScan(null)} />
            <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', zIndex: 101, width: 'calc(100% - 44px)', maxWidth: 400, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.18)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.01em' }}>{selectedScan.label}</h3>
                  <p style={{ fontSize: 11.5, color: INK2, margin: '2px 0 0' }}>{selectedScan.time}</p>
                </div>
                <button onClick={() => setSelectedScan(null)} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={14} color={INK2} />
                </button>
              </div>

              {/* Score global */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: BG, borderRadius: 10, marginBottom: 12 }}>
                <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
                  <svg width={52} height={52} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={26} cy={26} r={22} fill="none" stroke="rgba(21,19,15,0.08)" strokeWidth={4} />
                    <circle cx={26} cy={26} r={22} fill="none" stroke={CORAL} strokeWidth={4} strokeDasharray={2 * Math.PI * 22} strokeDashoffset={2 * Math.PI * 22 * (1 - (selectedScan.score || 0) / 100)} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: INK }}>{selectedScan.score || 0}</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: INK, margin: 0 }}>Score global</p>
                  <p style={{ fontSize: 11, color: INK2, margin: '2px 0 0' }}>{selectedScan.lrs ? `LRS: ${selectedScan.lrs}` : 'Sur 100 points'}</p>
                </div>
              </div>

              {/* Sous-scores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <ScoreMini icon={Eye} label="Visibilité IA" value={selectedScan.scoreAI} />
                <ScoreMini icon={MessageSquare} label="Clarté" value={selectedScan.scoreClarity} />
                <ScoreMini icon={Target} label="Signaux" value={selectedScan.scoreCommercial} />
              </div>
            </div>
          </>
        )}

        <style>{`@keyframes calpulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    </div>
  );
}

function ScoreMini({ icon: Icon, label, value }) {
  const v = Math.round(value || 0);
  const color = v >= 70 ? GREEN : v >= 40 ? CORAL : '#E8184A';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 6px', background: BG, borderRadius: 8 }}>
      <Icon size={14} color={INK3} />
      <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: F }}>{v}</span>
      <span style={{ fontSize: 9.5, color: INK2, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
    </div>
  );
}