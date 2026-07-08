import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Check, TrendingUp } from 'lucide-react';
import AuthorityTaskDrawer from './AuthorityTaskDrawer';

const INK = '#15130F';
const INK3 = 'rgba(21,19,15,0.5)';
const BORDER = 'rgba(21,19,15,0.09)';
const WHITE = '#FFFFFF';
const CORAL = '#FF5A1F';
const GREEN = '#3FA66B';
const ORANGE_DEEP = '#C43E14';
const ORANGE_PALE = '#FFE7D6';
const CREAM = '#F3EEE3';
const F = 'Inter, system-ui, sans-serif';

function parseJSON(s, fb) { try { return JSON.parse(s || '') || fb; } catch { return fb; } }

// Diminishing returns — same formula as backend
function computeGain(base, currentScore) {
  const gain = base * (1 - currentScore / 100);
  return Math.min(gain, 99 - currentScore);
}

export default function AuthorityTasksCard({ siteUrl, score, onScoreUpdate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [liveScore, setLiveScore] = useState(score || 0);

  useEffect(() => { setLiveScore(score || 0); }, [score]);

  const load = async () => {
    if (!siteUrl) { setLoading(false); return; }
    try {
      const u = await base44.auth.me();
      if (!u) return;
      const list = await base44.entities.ActionTask.filter(
        { user_id: u.id, site_url: siteUrl },
        '-created_date', 50
      );
      // Only authority tasks (those with a platform_key)
      setTasks(list.filter((t) => t.platform_key));
    } catch {}
    setLoading(false);
  };
  useEffect(() => { load(); }, [siteUrl]);

  const handleVerified = (newScore, granted) => {
    setLiveScore(newScore);
    if (onScoreUpdate) onScoreUpdate(newScore);
    load();
  };

  const ordered = tasks.sort((a, b) => (a.action_index || 0) - (b.action_index || 0));
  const doneCount = ordered.filter((t) => t.status === 'done').length;

  return (
    <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '22px 24px', fontFamily: F }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.03em' }}>AI Authority Missions</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: doneCount === 3 ? GREEN : ORANGE_DEEP }}>
          {doneCount}/3 completed
        </span>
      </div>

      <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 16px', lineHeight: 1.5 }}>
        Create your profiles on these reference platforms. Each verified profile increases your AI score — the higher your score, the less each mission grants (diminishing returns).
      </p>

      {/* Tasks */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 62, borderRadius: 12, background: 'linear-gradient(90deg,#F3EEE3 25%,#E8E4DC 50%,#F3EEE3 75%)', backgroundSize: '600px 100%', animation: 'atcShimmer 1.5s infinite' }} />
          ))}
          <style>{`@keyframes atcShimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}`}</style>
        </div>
      ) : ordered.length === 0 ? (
        <p style={{ fontSize: 12.5, color: INK3, margin: 0, lineHeight: 1.6 }}>
          Run a site analysis to unlock your authority missions.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ordered.map((t) => {
            const instr = parseJSON(t.instructions_json, {});
            const isDone = t.status === 'done';
            const gain = computeGain(t.points_base || 0, liveScore);
            return (
              <button key={t.id} onClick={() => setSelected(t)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, border: `1px solid ${BORDER}`, background: isDone ? '#F0FAF4' : WHITE, cursor: 'pointer', textAlign: 'left', fontFamily: F, transition: 'border-color .15s ease' }}
                onMouseEnter={(e) => { if (!isDone) e.currentTarget.style.borderColor = INK; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = BORDER; }}>
                {instr.favicon && <img src={instr.favicon} width={32} height={32} style={{ borderRadius: 8, flexShrink: 0 }} alt="" />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, lineHeight: 1.3 }}>{t.action_title}</div>
                  <div style={{ fontSize: 11.5, color: INK3, marginTop: 2 }}>{instr.platform_label}</div>
                </div>
                {isDone ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 100, background: GREEN, color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    <Check size={11} /> +{t.points_granted || 0}
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 100, background: ORANGE_PALE, color: ORANGE_DEEP, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    <TrendingUp size={11} /> +{Math.round(gain * 10) / 10}
                  </span>
                )}
                <ArrowRight size={14} color={INK3} style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <AuthorityTaskDrawer
          task={selected}
          currentScore={liveScore}
          onClose={() => setSelected(null)}
          onVerified={handleVerified}
        />
      )}
    </div>
  );
}