import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

const F = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK2 = '#6B6660';
const BORDER = 'rgba(21,19,15,0.10)';
const CORAL = '#FF5A1F';

const EMPTY = { author_name: '', author_role: '', rating: 5, text: '', avatar_url: '', visible: true, order: 0 };

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => base44.entities.Testimonial.list('order').then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

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

  const toggleVisible = async (t) => {
    await base44.entities.Testimonial.update(t.id, { visible: !t.visible });
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
      <p style={{ fontSize: 13, color: INK2, margin: '0 0 24px' }}>Gérez les avis affichés sur la landing page et le funnel d'analyse.</p>

      <form onSubmit={handleCreate} style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <input required placeholder="Nom" value={form.author_name} onChange={set('author_name')} style={inp} />
        <input placeholder="Rôle / entreprise" value={form.author_role} onChange={set('author_role')} style={inp} />
        <input type="number" min="1" max="5" placeholder="Note (1-5)" value={form.rating} onChange={set('rating')} style={inp} />
        <input placeholder="Photo (URL, optionnel)" value={form.avatar_url} onChange={set('avatar_url')} style={inp} />
        <textarea required placeholder="Texte de l'avis" value={form.text} onChange={set('text')} rows={2} style={{ ...inp, gridColumn: '1 / -1', resize: 'none' }} />
        <input type="number" placeholder="Ordre d'affichage" value={form.order} onChange={set('order')} style={inp} />
        <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: INK, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
          <Plus size={13} /> {saving ? 'Ajout…' : 'Ajouter l\'avis'}
        </button>
      </form>

      {loading ? (
        <p style={{ fontSize: 13, color: INK2 }}>Chargement…</p>
      ) : items.length === 0 ? (
        <p style={{ fontSize: 13, color: INK2 }}>Aucun avis pour l'instant.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', opacity: t.visible ? 1 : 0.5 }}>
              <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={11} fill={i < t.rating ? CORAL : 'none'} color={i < t.rating ? CORAL : 'rgba(21,19,15,0.2)'} />
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0 }}>{t.author_name} <span style={{ fontWeight: 400, color: INK2 }}>{t.author_role ? `— ${t.author_role}` : ''}</span></p>
                <p style={{ fontSize: 12, color: INK2, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.text}</p>
              </div>
              <button onClick={() => toggleVisible(t)} title={t.visible ? 'Masquer' : 'Afficher'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK2 }}>
                {t.visible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button onClick={() => remove(t)} title="Supprimer" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}