import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Trash2, Plus, Eye, EyeOff, Check, Pencil, X, RefreshCw, Linkedin } from 'lucide-react';
import { AVATAR_GRADIENTS } from '@/lib/user-color';
import { TrustpilotIcon } from '@/components/landing/LandingTestimonials';

const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK2 = '#6B6660';
const BORDER = 'rgba(21,19,15,0.10)';
const CORAL = '#FF5A1F';

const EMPTY = { author_name: '', author_role: '', rating: 5, text: '', avatar_url: '', avatar_color: 'sunset', linkedin_url: '', trustpilot_url: '', visible: true, order: 0 };

const DEFAULT_TESTIMONIALS = [
  { author_name: 'Sofiane B.', author_role: 'Post at Stensor', rating: 5, text: "franchement j'étais sceptique au début, mais j'ai suivi le plan sans rien comprendre à l'IA, et en genre 10 jours mon score avait déjà bougé, ChatGPT me cite maintenant sur des recherches locales", avatar_color: 'mint', linkedin_url: '', trustpilot_url: '', visible: true, order: 0 },
  { author_name: 'Amel K.', author_role: 'Founder of Dh-hd', rating: 5, text: "super simple à utiliser, j'ai pas d'équipe marketing donc ça tombait bien, résultat visible en à peine 2 semaines sans prise de tête", avatar_color: 'violet', linkedin_url: '', trustpilot_url: '', visible: true, order: 1 },
  { author_name: 'Moussa D.', author_role: 'Founder of Varileo', rating: 5, text: "je m'attendais à un truc compliqué mais non, j'ai juste coché les étapes une par une, ma visibilité sur les IA a clairement augmenté en quelques semaines", avatar_color: 'ink', linkedin_url: '', trustpilot_url: '', visible: true, order: 2 },
];

function initials(name) {
  const p = (name || '').trim().split(/[\s\-\.]+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return (name || '??').slice(0, 2).toUpperCase();
}

function AvatarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {AVATAR_GRADIENTS.map(c => (
        <button key={c.id} type="button" onClick={() => onChange(c.id)} title={c.id}
          style={{
            width: 28, height: 28, borderRadius: 8, background: c.value, padding: 0, cursor: 'pointer',
            border: value === c.id ? '2px solid #111' : '2px solid transparent',
            boxShadow: value === c.id ? '0 0 0 2px #fff inset' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          {value === c.id && <Check size={12} color="#fff" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const load = () => base44.entities.Testimonial.list('order').then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setEdit = (k) => (e) => setEditForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Testimonial.create({ ...form, rating: Number(form.rating), order: Number(form.order) });
      setForm(EMPTY);
      await load();
    } catch {}
    setSaving(false);
  };

  const startEdit = (t) => {
    setEditId(t.id);
    setEditForm({ ...t });
  };

  const cancelEdit = () => { setEditId(null); setEditForm(null); };

  const saveEdit = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      await base44.entities.Testimonial.update(editId, {
        author_name: editForm.author_name,
        author_role: editForm.author_role,
        text: editForm.text,
        avatar_color: editForm.avatar_color,
        avatar_url: editForm.avatar_url,
        linkedin_url: editForm.linkedin_url,
        trustpilot_url: editForm.trustpilot_url,
        visible: editForm.visible,
        rating: Number(editForm.rating),
        order: Number(editForm.order),
      });
      cancelEdit();
      await load();
    } catch {}
    setSaving(false);
  };

  const toggleVisible = async (t) => {
    await base44.entities.Testimonial.update(t.id, { visible: !t.visible });
    load();
  };

  const remove = async (t) => {
    await base44.entities.Testimonial.delete(t.id);
    load();
  };

  const resetToDefaults = async () => {
    if (!confirm('Remplacer tous les avis par les 3 avis par défaut ?')) return;
    setSaving(true);
    try {
      for (const t of items) {
        await base44.entities.Testimonial.delete(t.id);
      }
      await base44.entities.Testimonial.bulkCreate(DEFAULT_TESTIMONIALS);
      await load();
    } catch {}
    setSaving(false);
  };

  const inp = { width: '100%', padding: '8px 11px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, fontFamily: F, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '28px 32px', fontFamily: F, maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 4px' }}>Avis clients</h1>
          <p style={{ fontSize: 13, color: INK2, margin: 0 }}>Gérez les avis affichés sur la landing page. Liens LinkedIn/Trustpilot, ordre et visibilité.</p>
        </div>
        <button onClick={resetToDefaults} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', color: INK, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F, whiteSpace: 'nowrap', opacity: saving ? 0.5 : 1 }}>
          <RefreshCw size={13} /> Réinitialiser
        </button>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 28 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: '0 0 12px' }}>Nouvel avis</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input required placeholder="Nom" value={form.author_name} onChange={set('author_name')} style={inp} />
          <input placeholder="Rôle / entreprise" value={form.author_role} onChange={set('author_role')} style={inp} />
          <input type="number" min="1" max="5" placeholder="Note (1-5)" value={form.rating} onChange={set('rating')} style={inp} />
          <input placeholder="Photo (URL, optionnel)" value={form.avatar_url} onChange={set('avatar_url')} style={inp} />
          <textarea required placeholder="Texte de l'avis" value={form.text} onChange={set('text')} rows={2} style={{ ...inp, gridColumn: '1 / -1', resize: 'none' }} />
          <input type="number" placeholder="Ordre d'affichage" value={form.order} onChange={set('order')} style={inp} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Linkedin size={15} color="#0A66C2" style={{ flexShrink: 0 }} />
            <input placeholder="Lien LinkedIn" value={form.linkedin_url} onChange={set('linkedin_url')} style={inp} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrustpilotIcon size={15} />
            <input placeholder="Lien Trustpilot" value={form.trustpilot_url} onChange={set('trustpilot_url')} style={inp} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: INK2, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Couleur avatar</p>
          <AvatarPicker value={form.avatar_color} onChange={(v) => setForm(f => ({ ...f, avatar_color: v }))} />
        </div>
        <button type="submit" disabled={saving} style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: INK, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
          <Plus size={13} /> {saving ? 'Ajout…' : 'Ajouter l\'avis'}
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p style={{ fontSize: 13, color: INK2 }}>Chargement…</p>
      ) : items.length === 0 ? (
        <p style={{ fontSize: 13, color: INK2 }}>Aucun avis pour l'instant.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(t => {
            const isEditing = editId === t.id;
            const grad = AVATAR_GRADIENTS.find(c => c.id === t.avatar_color)?.value || AVATAR_GRADIENTS[0].value;
            return (
              <div key={t.id} style={{ background: '#fff', border: `1px solid ${isEditing ? CORAL : BORDER}`, borderRadius: 10, padding: '12px 14px', opacity: t.visible ? 1 : 0.5 }}>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input placeholder="Nom" value={editForm.author_name || ''} onChange={setEdit('author_name')} style={inp} />
                      <input placeholder="Rôle" value={editForm.author_role || ''} onChange={setEdit('author_role')} style={inp} />
                      <input placeholder="Photo URL" value={editForm.avatar_url || ''} onChange={setEdit('avatar_url')} style={inp} />
                      <input type="number" placeholder="Ordre" value={editForm.order ?? 0} onChange={setEdit('order')} style={inp} />
                    </div>
                    <textarea placeholder="Texte" value={editForm.text || ''} onChange={setEdit('text')} rows={2} style={{ ...inp, resize: 'none' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Linkedin size={15} color="#0A66C2" style={{ flexShrink: 0 }} />
                        <input placeholder="Lien LinkedIn" value={editForm.linkedin_url || ''} onChange={setEdit('linkedin_url')} style={inp} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TrustpilotIcon size={15} />
                        <input placeholder="Lien Trustpilot" value={editForm.trustpilot_url || ''} onChange={setEdit('trustpilot_url')} style={inp} />
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: INK2, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Couleur avatar</p>
                      <AvatarPicker value={editForm.avatar_color || 'sunset'} onChange={(v) => setEditForm(f => ({ ...f, avatar_color: v }))} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" onClick={() => setEditForm(f => ({ ...f, visible: !f.visible }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, background: editForm.visible ? '#fff' : '#F5F5F3', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: editForm.visible ? INK : INK2, fontFamily: F }}>
                        {editForm.visible ? <Eye size={12} /> : <EyeOff size={12} />} {editForm.visible ? 'Visible' : 'Masqué'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={saveEdit} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', background: INK, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
                        <Check size={12} /> {saving ? 'Sauvegarde…' : 'Enregistrer'}
                      </button>
                      <button onClick={cancelEdit} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', background: '#fff', color: INK2, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
                        <X size={12} /> Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.author_name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials(t.author_name)}</div>
                    )}
                    <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} fill={i < t.rating ? CORAL : 'none'} color={i < t.rating ? CORAL : 'rgba(21,19,15,0.2)'} />
                      ))}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>
                        {t.author_name}
                        <span style={{ fontWeight: 400, color: INK2 }}> — {t.author_role || '—'}</span>
                      </p>
                      <p style={{ fontSize: 12, color: INK2, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.text}</p>
                    </div>
                    {t.linkedin_url && (
                      <a href={t.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'rgba(10,102,194,0.08)', color: '#0A66C2', flexShrink: 0 }}>
                        <Linkedin size={14} />
                      </a>
                    )}
                    {t.trustpilot_url && (
                      <a href={t.trustpilot_url} target="_blank" rel="noopener noreferrer" title="Trustpilot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 6, background: 'rgba(0,182,122,0.08)', flexShrink: 0 }}>
                        <TrustpilotIcon size={14} />
                      </a>
                    )}
                    <button onClick={() => startEdit(t)} title="Modifier" style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK2 }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => toggleVisible(t)} title={t.visible ? 'Masquer' : 'Afficher'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK2 }}>
                      {t.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button onClick={() => remove(t)} title="Supprimer" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}