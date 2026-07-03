import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { getActiveDomain } from '@/lib/active-domain';
import TrophyCard from '@/components/history/TrophyCard';
import ScoreHistoryChart from '@/components/history/ScoreHistoryChart';
import { computeAchievements } from '@/lib/achievements';

const F = 'Inter, system-ui, sans-serif';
const INK = '#15130F';
const BORDER = 'rgba(21,19,15,0.10)';

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [doneTasks, setDoneTasks] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!u) { setLoading(false); return; }
        setUser(u);
        const active = getActiveDomain();
        const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
        const matched = active ? profiles.find(p => p.site_url === active.url) || profiles[0] : profiles[0];
        setProfile(matched || null);
        const tasks = await base44.entities.ActionTask.filter({ user_id: u.id, status: 'done' }).catch(() => []);
        setDoneTasks(tasks);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(21,19,15,0.10)', borderTopColor: '#FF5A1F', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const trophies = computeAchievements({
    profile,
    doneTasksCount: doneTasks.length,
    accountCreatedDate: user?.created_date,
  });
  const unlockedCount = trophies.filter(t => t.unlocked).length;

  return (
    <div style={{ background: '#FAF9F6', minHeight: '100%', fontFamily: F, padding: '32px 24px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: INK, marginBottom: 4 }}>Historique & Récompenses</div>
          <p style={{ fontSize: 13.5, color: 'rgba(21,19,15,0.55)', margin: 0 }}>Votre progression, vos actions et vos trophées débloqués.</p>
        </div>

        {/* Score history */}
        <div style={{ marginBottom: 24 }}>
          <ScoreHistoryChart current={Math.round(profile?.score_overall || 0)} previous={Math.round(profile?.score_previous || 0)} />
        </div>

        {/* Trophies */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={16} color={INK} />
              <span style={{ fontSize: 13, fontWeight: 700, color: INK, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Trophées</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(21,19,15,0.5)' }}>{unlockedCount}/6 débloqués</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {trophies.map((t, i) => <TrophyCard key={t.id} trophy={t} index={i} />)}
          </div>
        </div>

        {/* Completed fixes */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CheckCircle2 size={16} color={INK} />
            <span style={{ fontSize: 13, fontWeight: 700, color: INK, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actions terminées ({doneTasks.length})</span>
          </div>
          <div style={{ background: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
            {doneTasks.length === 0 ? (
              <div style={{ padding: '28px 20px', textAlign: 'center', fontSize: 13, color: 'rgba(21,19,15,0.4)' }}>
                Aucune action terminée pour le moment.
              </div>
            ) : (
              doneTasks.map((t, i) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderBottom: i < doneTasks.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                  <CheckCircle2 size={15} color="#16A34A" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: INK, flex: 1 }}>{t.action_title}</span>
                  <span style={{ fontSize: 11.5, color: 'rgba(21,19,15,0.4)', flexShrink: 0 }}>
                    {t.updated_date ? new Date(t.updated_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}