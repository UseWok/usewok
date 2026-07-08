import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Trash2, Plus, Eye, EyeOff, Check, Pencil, X } from 'lucide-react';
import { AVATAR_GRADIENTS } from '@/lib/user-color';

const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK2 = '#6B6660';
const BORDER = 'rgba(21,19,15,0.10)';
const CORAL = '#FF5A1F';
const BLUE = '#3B8BEB';

const EMPTY = { author_name: '', author_role: '', rating: 5, text: '', avatar_url: '', avatar_color: 'sunset', verified: false, visible: true, order: 0 };

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

function VerifiedBadge() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="10" fill={BLUE} />
      <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
        verified: editForm.verified,
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

  const toggleVerified = async (t) => {
    await base44.entities.Testimonial.update(t.id, { verified: !t.verified });
    load();
  };

  const remove = async (t) => {
    await base44.entities.Testimonial.delete(t.id);
    load();
  };

  const inp = { width: '100%', padding: '8px 11px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, fontFamily: F, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ padding: '28px 32px', fontFamily: F, maxWidth: 900 }}>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 4px' }}>Avis clients</h1>
      <p style={{ fontSize: 13, color: INK2, margin: '0 0 24px' }}>Gérez les avis affichés sur la landing page. Couleur d'avatar, badge certifié, ordre et visibilité.</p>

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={() => setForm(f => ({ ...f, verified: !f.verified }))}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: `1px solid ${form.verified ? BLUE : BORDER}`, borderRadius: 8, background: form.verified ? `${BLUE}15` : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: form.verified ? BLUE : INK2, fontFamily: F }}>
              {form.verified && <VerifiedBadge />} Certifié
            </button>
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
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: INK2, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Couleur avatar</p>
                      <AvatarPicker value={editForm.avatar_color || 'sunset'} onChange={(v) => setEditForm(f => ({ ...f, avatar_color: v }))} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" onClick={() => setEditForm(f => ({ ...f, verified: !f.verified }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: `1px solid ${editForm.verified ? BLUE : BORDER}`, borderRadius: 8, background: editForm.verified ? `${BLUE}15` : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: editForm.verified ? BLUE : INK2, fontFamily: F }}>
                        {editForm.verified && <VerifiedBadge />} Certifié
                      </button>
                      <button type="button" onClick={() => setEditForm(f => ({ ...f, visible: !f.visible }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: `1px solid ${editForm.visible ? BORDER : BORDER}`, borderRadius: 8, background: editForm.visible ? '#fff' : '#F5F5F3', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: editForm.visible ? INK : INK2, fontFamily: F }}>
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
                      <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {t.author_name}
                        {t.verified && <VerifiedBadge />}
                        <span style={{ fontWeight: 400, color: INK2 }}> — {t.author_role || '—'}</span>
                      </p>
                      <p style={{ fontSize: 12, color: INK2, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.text}</p>
                    </div>
                    <button onClick={() => startEdit(t)} title="Modifier" style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK2 }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => toggleVerified(t)} title={t.verified ? 'Retirer certification' : 'Certifier'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.verified ? BLUE : INK2, opacity: t.verified ? 1 : 0.4 }}>
                      <VerifiedBadge />
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