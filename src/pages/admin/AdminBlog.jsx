import { useState, useEffect, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Eye, EyeOff, Save, ExternalLink, Upload, FileText, Clock, Tag, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Design tokens — dark confortable, pas fatiguant ──────────────────────────
const BG      = '#111110';
const SURFACE = '#1A1918';
const CARD    = '#201F1E';
const BORDER  = 'rgba(255,255,255,0.07)';
const TEXT    = '#E8E6E1';
const TEXT2   = '#8A8580';
const TEXT3   = '#5A5650';
const CORAL   = '#FF5A1F';
const GREEN   = '#22C55E';
const F       = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';

const generateSlug = (title) =>
  title.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    .replace(/-+/g, '-').replace(/(^-|-$)/g, '');

const EMPTY = { title: '', slug: '', summary: '', content: '', cover_image: '', category: '', published: false, reading_time: 5 };

// ── Petit badge statut ────────────────────────────────────────────────────────
function StatusBadge({ published }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: published ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
      color: published ? GREEN : TEXT3,
      letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: published ? GREEN : TEXT3 }} />
      {published ? 'Publié' : 'Brouillon'}
    </span>
  );
}

// ── Carte article dans la liste gauche ────────────────────────────────────────
function ArticleRow({ post, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', background: selected ? CARD : 'transparent',
      border: `1px solid ${selected ? 'rgba(255,255,255,0.12)' : 'transparent'}`,
      borderRadius: 10, padding: '10px 12px', cursor: 'pointer', fontFamily: F,
      transition: 'all 120ms', display: 'flex', flexDirection: 'column', gap: 6,
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}>
      {post.cover_image && (
        <div style={{ width: '100%', height: 80, borderRadius: 7, overflow: 'hidden', marginBottom: 2 }}>
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      {!post.cover_image && (
        <div style={{ width: '100%', height: 50, borderRadius: 7, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
          <FileText size={16} color={TEXT3} />
        </div>
      )}
      <p style={{ fontSize: 12.5, fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.3,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {post.title || <span style={{ color: TEXT3 }}>Sans titre</span>}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <StatusBadge published={post.published} />
        {post.reading_time && (
          <span style={{ fontSize: 10, color: TEXT3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={9} /> {post.reading_time} min
          </span>
        )}
      </div>
    </button>
  );
}

// ── Champ label ───────────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return <p style={{ fontSize: 10.5, fontWeight: 700, color: TEXT3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 7px' }}>{children}</p>;
}

// ── Input sombre ──────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', padding: '9px 13px', fontSize: 13, border: `1px solid ${BORDER}`,
  background: 'rgba(255,255,255,0.04)', color: TEXT, borderRadius: 9, outline: 'none',
  fontFamily: F, boxSizing: 'border-box', transition: 'border-color 150ms',
};

export default function AdminBlog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const quillRef = useRef(null);
  const imageFileRef = useRef(null);

  const loadPosts = () => base44.entities.BlogPost.list('-created_date', 200).then(setPosts).catch(() => {});

  useEffect(() => { loadPosts(); }, []);

  const selectPost = (post) => {
    setSelectedId(post.id);
    setForm({ title: post.title || '', slug: post.slug || '', summary: post.summary || '', content: post.content || '', cover_image: post.cover_image || '', category: post.category || '', published: post.published || false, reading_time: post.reading_time || 5 });
    setIsNew(false); setSaved(false); setConfirmDelete(false);
  };

  const newPost = () => { setSelectedId(null); setForm(EMPTY); setIsNew(true); setSaved(false); setConfirmDelete(false); };

  const handleTitleChange = (val) => {
    setForm(f => ({ ...f, title: val, ...(isNew || !f.slug ? { slug: generateSlug(val) } : {}) }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); return file_url; }
    catch { return null; }
    finally { setUploading(false); }
  };

  const imageHandler = useCallback(() => { imageFileRef.current?.click(); }, []);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await handleImageUpload(file); if (!url) return;
    const quill = quillRef.current?.getEditor();
    if (quill) { const r = quill.getSelection(true); quill.insertEmbed(r.index, 'image', url, 'user'); quill.setSelection(r.index + 1, 0, 'user'); }
    e.target.value = '';
  };

  const handlePaste = useCallback(async (e) => {
    const item = Array.from(e.clipboardData?.items || []).find(i => i.type.startsWith('image/'));
    if (!item) return; e.preventDefault();
    const file = item.getAsFile(); if (!file) return;
    const url = await handleImageUpload(file); if (!url) return;
    const quill = quillRef.current?.getEditor();
    if (quill) { const r = quill.getSelection(true); quill.insertEmbed(r.index, 'image', url, 'user'); quill.setSelection(r.index + 1, 0, 'user'); }
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: { image: imageHandler },
    },
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      const wordCount = (form.content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
      const data = { ...form, reading_time: Math.max(1, Math.ceil(wordCount / 200)) };
      if (isNew) { const created = await base44.entities.BlogPost.create(data); setSelectedId(created.id); setIsNew(false); }
      else await base44.entities.BlogPost.update(selectedId, data);
      await loadPosts(); setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    await base44.entities.BlogPost.delete(selectedId).catch(() => {});
    await loadPosts(); newPost(); setDeleting(false);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = await handleImageUpload(file);
    if (url) setForm(f => ({ ...f, cover_image: url }));
    e.target.value = '';
  };

  const totalPosts = posts.length;
  const published = posts.filter(p => p.published).length;
  const drafts = totalPosts - published;

  return (
    <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: F, color: TEXT, overflow: 'hidden' }}>
      <input ref={imageFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFileChange} />

      {/* ══ LEFT PANEL ══════════════════════════════════════════════════ */}
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${BORDER}`, flexShrink: 0, background: SURFACE }}>

        {/* Header */}
        <div style={{ padding: '18px 16px 12px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-0.02em' }}>Blog</p>
              <p style={{ fontSize: 11, color: TEXT3, margin: '2px 0 0' }}>Gestion des articles</p>
            </div>
            <button onClick={newPost} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.10)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              <Plus size={14} color={TEXT} />
            </button>
          </div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {[['Total', totalPosts, TEXT], ['Publiés', published, GREEN], ['Brouillons', drafts, TEXT2]].map(([l, v, c]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: c, margin: 0, letterSpacing: '-0.03em' }}>{v}</p>
                <p style={{ fontSize: 9.5, color: TEXT3, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* New article CTA */}
        <div style={{ padding: '12px 12px 6px' }}>
          <button onClick={newPost} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 0', border: `1px dashed rgba(255,255,255,0.12)`, borderRadius: 9,
            background: !selectedId ? 'rgba(255,90,31,0.08)' : 'transparent',
            color: !selectedId ? CORAL : TEXT3, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F,
            transition: 'all 120ms',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,90,31,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}>
            <Plus size={12} /> Nouvel article
          </button>
        </div>

        {/* Article list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 12px' }}>
              <FileText size={28} color={TEXT3} style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontSize: 12, color: TEXT3, margin: 0 }}>Aucun article</p>
            </div>
          )}
          {posts.map(post => (
            <ArticleRow key={post.id} post={post} selected={selectedId === post.id} onClick={() => selectPost(post)} />
          ))}
        </div>
      </div>

      {/* ══ RIGHT EDITOR ════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: `1px solid ${BORDER}`, background: SURFACE, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Toggle publié */}
            <button onClick={() => setForm(f => ({ ...f, published: !f.published }))}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: `1px solid ${form.published ? 'rgba(34,197,94,0.25)' : BORDER}`, borderRadius: 8, background: form.published ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 150ms' }}>
              <div style={{ width: 28, height: 14, borderRadius: 999, background: form.published ? GREEN : 'rgba(255,255,255,0.12)', position: 'relative', transition: 'background 200ms' }}>
                <div style={{ position: 'absolute', top: 2, left: form.published ? 16 : 2, width: 10, height: 10, borderRadius: '50%', background: '#fff', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: form.published ? GREEN : TEXT2 }}>
                {form.published ? 'Publié' : 'Brouillon'}
              </span>
            </button>

            {!isNew && form.slug && (
              <a href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: TEXT2, textDecoration: 'none', padding: '6px 10px', border: `1px solid ${BORDER}`, borderRadius: 8, background: 'rgba(255,255,255,0.03)', transition: 'all 120ms' }}
                onMouseEnter={e => { e.currentTarget.style.color = TEXT; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = TEXT2; e.currentTarget.style.borderColor = BORDER; }}>
                <ExternalLink size={11} /> Prévisualiser
              </a>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isNew && !confirmDelete && (
              <button onClick={() => setConfirmDelete(true)}
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${BORDER}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', transition: 'all 120ms' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = BORDER; }}>
                <Trash2 size={13} color="#EF4444" />
              </button>
            )}
            {confirmDelete && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(239,68,68,0.12)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)' }}>
                <span style={{ fontSize: 12, color: '#EF4444' }}>Supprimer ?</span>
                <button onClick={handleDelete} disabled={deleting} style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 5, padding: '2px 7px', cursor: 'pointer', fontFamily: F }}>
                  {deleting ? '…' : 'Oui'}
                </button>
                <button onClick={() => setConfirmDelete(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: TEXT3, display: 'flex', padding: 2 }}>
                  <X size={11} />
                </button>
              </div>
            )}
            <button onClick={handleSave} disabled={saving || !form.title.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px',
                background: saved ? 'rgba(34,197,94,0.15)' : CORAL,
                border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
                borderRadius: 9, fontSize: 13, fontWeight: 700, color: saved ? GREEN : '#fff',
                cursor: (saving || !form.title.trim()) ? 'not-allowed' : 'pointer',
                opacity: !form.title.trim() ? 0.4 : 1, fontFamily: F, transition: 'all 200ms',
              }}>
              {saved ? <CheckCircle size={13} /> : <Save size={13} />}
              {saving ? 'Sauvegarde…' : saved ? 'Sauvegardé' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 48px', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Titre */}
          <input
            value={form.title} onChange={e => handleTitleChange(e.target.value)}
            placeholder="Titre de l'article…"
            style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: TEXT, border: 'none', background: 'transparent', outline: 'none', fontFamily: F, width: '100%', marginBottom: 10, lineHeight: 1.15 }}
          />

          {/* Slug */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, color: TEXT3 }}>usewok.app/blog/</span>
            <input value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
              placeholder="mon-article"
              style={{ fontSize: 11.5, color: '#3B82F6', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'monospace', minWidth: 120 }} />
          </div>

          {/* Row: Summary + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 14, marginBottom: 20 }}>
            <div>
              <FieldLabel>Résumé (SEO)</FieldLabel>
              <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                placeholder="Description affichée dans Google et en intro d'article (160 car. recommandés)…"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
              <p style={{ fontSize: 10, color: TEXT3, margin: '4px 0 0', textAlign: 'right' }}>{form.summary.length} car.</p>
            </div>
            <div>
              <FieldLabel>Catégorie</FieldLabel>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="ex : Stratégie IA"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
                onBlur={e => e.target.style.borderColor = BORDER} />
            </div>
          </div>

          {/* Cover image */}
          <div style={{ marginBottom: 24 }}>
            <FieldLabel>Image de couverture</FieldLabel>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                placeholder="https://… ou uploader une image"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.18)'}
                onBlur={e => e.target.style.borderColor = BORDER} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: `1px solid ${BORDER}`, borderRadius: 9, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: TEXT2, background: 'rgba(255,255,255,0.04)', whiteSpace: 'nowrap', transition: 'all 120ms' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                <Upload size={12} /> {uploading ? 'Upload…' : 'Uploader'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
              </label>
            </div>
            {form.cover_image && (
              <div style={{ marginTop: 10, borderRadius: 10, overflow: 'hidden', height: 140, position: 'relative' }}>
                <img src={form.cover_image} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setForm(f => ({ ...f, cover_image: '' }))}
                  style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={11} color="#fff" />
                </button>
              </div>
            )}
          </div>

          {/* Éditeur */}
          <div style={{ marginBottom: 0 }}>
            <FieldLabel>Contenu</FieldLabel>
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }} onPaste={handlePaste}>
              <ReactQuill
                ref={quillRef}
                value={form.content}
                onChange={val => setForm(f => ({ ...f, content: val }))}
                modules={modules}
                theme="snow"
                placeholder="Rédigez votre article ici… Collez des images directement ou utilisez le bouton image."
                style={{ minHeight: 400 }}
              />
            </div>
            {uploading && (
              <p style={{ fontSize: 11, color: '#3B82F6', marginTop: 6 }}>⏳ Upload en cours…</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .ql-toolbar.ql-snow { background: #fff; border: none !important; border-bottom: 1px solid #E8E8E8 !important; font-family: ${F}; }
        .ql-container.ql-snow { border: none !important; font-family: ${F}; }
        .ql-editor { min-height: 400px; line-height: 1.85; font-size: 15px; color: #1A1A1A; }
        .ql-editor.ql-blank::before { color: #ccc; font-style: normal; }
        .ql-editor img { max-width: 100%; border-radius: 10px; margin: 12px 0; }
      `}</style>
    </div>
  );
}