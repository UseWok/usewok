/**
 * Admin > Paramètres des abonnements
 * Permet de modifier toutes les valeurs numériques et règles des plans.
 * Les modifications écrasent immédiatement les valeurs par défaut de wok-plans.js.
 * Stocké dans AppSettings { key: 'plan_limits' }.
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { WOK_PLAN_FEATURES_DEFAULT, invalidatePlanSettings } from '@/lib/wok-plans';
import { Save, RefreshCw, Info, Clock, Cpu, Globe, MessageSquare, BarChart2 } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK2 = '#6B6660';
const INK3 = '#A8A49F';
const BORDER = '#E8E8E8';
const SURFACE = '#F8F7F4';
const WHITE = '#FFFFFF';
const CORAL = '#F95738';

const PLAN_COLORS = { free: '#9CA3AF', starter: '#3B8BEB', pro: '#F95738' };
const PLAN_LABELS = { free: 'Gratuit', starter: 'Starter', pro: 'Pro' };

// Définition des champs éditables par section
const SECTIONS = [
  {
    id: 'scans',
    label: 'Scans & Analyse',
    icon: RefreshCw,
    fields: [
      { key: 'scans_per_period', label: 'Scans autorisés par période', type: 'number', unit: 'scans', help: 'Quota de scans manuels sur la période définie (month ou day)' },
      { key: 'scan_period', label: 'Période du quota', type: 'select', options: ['month', 'day', 'week'], help: 'Unité de temps pour le quota de scans' },
      { key: 'auto_scan', label: 'Scan automatique activé', type: 'bool', help: 'Active le scan planifié automatique pour ce plan' },
      { key: 'auto_scan_hour', label: 'Heure du scan auto (Paris)', type: 'number', unit: 'h', min: 0, max: 23, help: 'Heure locale Paris (Europe/Paris) du scan planifié. 6 = 6h00 du matin' },
    ],
  },
  {
    id: 'engines',
    label: 'Moteurs IA',
    icon: Cpu,
    fields: [
      { key: 'engines_count', label: 'Nombre de moteurs actifs', type: 'number', unit: 'moteurs', help: 'Nombre de moteurs IA testés simultanément (max 8)' },
    ],
  },
  {
    id: 'sites',
    label: 'Sites surveillés',
    icon: Globe,
    fields: [
      { key: 'max_sites', label: 'Sites max simultanés', type: 'number', unit: 'sites', help: 'Nombre de domaines que l\'utilisateur peut surveiller en parallèle' },
    ],
  },
  {
    id: 'history',
    label: 'Historique',
    icon: BarChart2,
    fields: [
      { key: 'history_days', label: 'Jours d\'historique conservés', type: 'number', unit: 'jours', help: 'Fenêtre de rétention des données d\'analyse (graphiques, évolution)' },
    ],
  },
  {
    id: 'chatbot',
    label: 'Chatbot IA',
    icon: MessageSquare,
    fields: [
      { key: 'chatbot_messages', label: 'Messages chatbot par mois', type: 'number', unit: 'msgs', help: 'Quota mensuel de messages IA. Les conversations sont persistées en cloud (UserFixCache + sessions)' },
    ],
  },
  {
    id: 'features',
    label: 'Fonctionnalités',
    icon: Info,
    fields: [
      { key: 'fix_instructions', label: 'Guides de correction', type: 'bool', help: 'Génère des instructions étape par étape pour chaque problème (cloud persisté)' },
      { key: 'see_competitors', label: 'Analyse concurrents', type: 'bool', help: 'Comparaison avec les concurrents du même secteur' },
      { key: 'pdf_export', label: 'Export PDF', type: 'bool', help: 'Téléchargement du rapport complet en PDF' },
      { key: 'white_label', label: 'White-label (sans logo WOK)', type: 'bool', help: 'Rapport et chatbot sans branding UseWok' },
      { key: 'audit_access', label: 'Audit SEO technique', type: 'bool', help: 'Accès au module d\'audit crawlabilité, performance, pages' },
      { key: 'integrations', label: 'Intégrations GSC & Analytics', type: 'bool', help: 'Google Search Console, Google Analytics, connexion OAuth' },
    ],
  },
];

function FieldEditor({ value, field, onChange }) {
  if (field.type === 'bool') {
    return (
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0,
          background: value ? CORAL : '#D1D5DB', position: 'relative', transition: 'background 200ms',
        }}>
        <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: WHITE, transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    );
  }
  if (field.type === 'select') {
    return (
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{ padding: '5px 10px', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 12, color: INK, background: WHITE, outline: 'none', fontFamily: F }}>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        type="number"
        value={value ?? ''}
        min={field.min ?? 0}
        max={field.max ?? 9999}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: 72, padding: '5px 8px', border: `1px solid ${BORDER}`, borderRadius: 7, fontSize: 12, color: INK, outline: 'none', textAlign: 'right', fontFamily: F }}
      />
      {field.unit && <span style={{ fontSize: 11, color: INK3 }}>{field.unit}</span>}
    </div>
  );
}

export default function AdminPlanSettingsPage() {
  // Overrides locaux en mémoire (fusionnés avec défauts)
  const [overrides, setOverrides] = useState({ free: {}, starter: {}, pro: {} });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AppSettings.filter({ key: 'plan_limits' })
      .then(results => {
        if (results.length > 0) {
          try { setOverrides(JSON.parse(results[0].value)); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Valeur effective = override Admin si défini, sinon valeur par défaut
  const getVal = (planId, key) => {
    if (overrides[planId]?.[key] !== undefined) return overrides[planId][key];
    return WOK_PLAN_FEATURES_DEFAULT[planId]?.[key];
  };

  const isOverridden = (planId, key) => overrides[planId]?.[key] !== undefined;

  const setVal = (planId, key, val) => {
    setOverrides(prev => ({
      ...prev,
      [planId]: { ...(prev[planId] || {}), [key]: val },
    }));
  };

  const resetField = (planId, key) => {
    setOverrides(prev => {
      const next = { ...prev, [planId]: { ...(prev[planId] || {}) } };
      delete next[planId][key];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const existing = await base44.entities.AppSettings.filter({ key: 'plan_limits' });
      const payload = { key: 'plan_limits', value: JSON.stringify(overrides), description: 'Overrides Admin des limites par plan — écrase wok-plans.js immédiatement' };
      if (existing.length > 0) {
        await base44.entities.AppSettings.update(existing[0].id, { value: payload.value });
      } else {
        await base44.entities.AppSettings.create(payload);
      }
      invalidatePlanSettings(); // Invalider le cache en mémoire
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { alert('Erreur lors de la sauvegarde : ' + e.message); }
    setSaving(false);
  };

  const resetAll = async () => {
    if (!confirm('Réinitialiser tous les overrides Admin aux valeurs par défaut ?')) return;
    setOverrides({ free: {}, starter: {}, pro: {} });
    const existing = await base44.entities.AppSettings.filter({ key: 'plan_limits' }).catch(() => []);
    if (existing.length > 0) await base44.entities.AppSettings.update(existing[0].id, { value: JSON.stringify({ free: {}, starter: {}, pro: {} }) }).catch(() => {});
    invalidatePlanSettings();
  };

  if (loading) return (
    <div style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 10, fontFamily: F }}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: CORAL, animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ fontSize: 13, color: INK2 }}>Chargement des paramètres…</span>
    </div>
  );

  return (
    <div style={{ padding: 32, fontFamily: F, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Paramètres des abonnements</h1>
          <p style={{ fontSize: 12.5, color: INK2, margin: 0, lineHeight: 1.6, maxWidth: 520 }}>
            Toutes les valeurs ci-dessous sont les <strong>règles actives</strong> appliquées à chaque plan.
            Un override Admin écrase <strong>immédiatement</strong> la valeur par défaut du code.
            Les champs en <span style={{ color: CORAL, fontWeight: 700 }}>orange</span> ont été modifiés par rapport au défaut.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={resetAll}
            style={{ padding: '8px 14px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 12, color: INK2, cursor: 'pointer', fontFamily: F }}>
            Réinitialiser tout
          </button>
          <button onClick={save} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: saved ? '#10B981' : CORAL, color: WHITE, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F, opacity: saving ? 0.7 : 1, transition: 'background 300ms' }}>
            <Save size={13} /> {saved ? 'Enregistré ✓' : saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ padding: '12px 16px', background: '#FFF8F0', border: '1px solid #FFE0CC', borderRadius: 10, marginBottom: 24, display: 'flex', gap: 10 }}>
        <Clock size={14} color={CORAL} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: '#7C3A10', margin: 0, lineHeight: 1.65 }}>
          <strong>Scans automatiques :</strong> Starter et Pro ont un scan planifié automatique à <strong>6h heure de Paris</strong> (Europe/Paris = 5h UTC).
          Pro = 1 scan quotidien. Starter = 3 scans/semaine (lun, mer, ven).
          L'heure ci-dessous est l'heure locale Paris — la conversion UTC est automatique.
        </p>
      </div>

      {/* Sections */}
      {SECTIONS.map(section => {
        const Icon = section.icon;
        return (
          <div key={section.id} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
              <Icon size={14} color={CORAL} />
              <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{section.label}</span>
            </div>

            {/* Fields */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <th style={{ textAlign: 'left', padding: '10px 18px', fontSize: 11, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', width: '35%' }}>Paramètre</th>
                    {['free', 'starter', 'pro'].map(planId => (
                      <th key={planId} style={{ textAlign: 'center', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: PLAN_COLORS[planId], textTransform: 'uppercase', letterSpacing: '0.07em', minWidth: 120 }}>
                        {PLAN_LABELS[planId]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.fields.map((field, fi) => (
                    <tr key={field.key} style={{ borderBottom: fi < section.fields.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 2 }}>{field.label}</div>
                        <div style={{ fontSize: 11, color: INK3, lineHeight: 1.5 }}>{field.help}</div>
                      </td>
                      {['free', 'starter', 'pro'].map(planId => {
                        const val = getVal(planId, field.key);
                        const overridden = isOverridden(planId, field.key);
                        const defaultVal = WOK_PLAN_FEATURES_DEFAULT[planId]?.[field.key];
                        return (
                          <td key={planId} style={{ padding: '14px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {overridden && (
                                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL, flexShrink: 0 }} title="Valeur modifiée par Admin" />
                                )}
                                <div style={{ border: overridden ? `1px solid ${CORAL}40` : 'none', borderRadius: 8, padding: overridden ? '2px 6px' : 0, background: overridden ? '#FFF8F0' : 'transparent' }}>
                                  <FieldEditor value={val} field={field} onChange={v => setVal(planId, field.key, v)} />
                                </div>
                              </div>
                              {overridden && (
                                <button onClick={() => resetField(planId, field.key)}
                                  style={{ fontSize: 10, color: INK3, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: F, textDecoration: 'underline' }}>
                                  défaut : {String(defaultVal)}
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}