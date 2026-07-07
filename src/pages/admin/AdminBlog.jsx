import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Save, ExternalLink, Upload, FileText, Clock, CheckCircle, X } from 'lucide-react';
import HtmlPreviewField from '@/components/blog/HtmlPreviewField';

// ── Design tokens — light, aligned with the landing page ──────────────────────
const BG      = '#F8F7F4';
const SURFACE = '#FFFFFF';
const INK     = '#1A1A1A';
const INK2    = '#6B6660';
const INK3    = '#A8A49F';
const BORDER  = 'rgba(21,19,15,0.10)';
const CORAL   = '#FF5A1F';
const GREEN   = '#1E9E5A';
const F        = '"Anthropic Sans", "Anthropic Sans Variable", Inter, system-ui, sans-serif';

const generateSlug = (title) =>
  title.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    .replace(/-+/g, '-').replace(/(^-|-$)/g, '');

const EMPTY = { title: '', slug: '', summary: '', content: '', cover_image: '', category: '', published: false, reading_time: 5 };

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ published }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      background: published ? 'rgba(30,158,90,0.10)' : 'rgba(21,19,15,0.05)',
      color: published ? GREEN : INK3,
      letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: published ? GREEN : INK3 }} />
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

// ── Article row in left list ──────────────────────────────────────────────────
function ArticleRow({ post, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', background: selected ? BG : 'transparent',
      border: `1px solid ${selected ? BORDER : 'transparent'}`,
      borderRadius: 12, padding: '10px 12px', cursor: 'pointer', fontFamily: F,
      transition: 'all 120ms', display: 'flex', flexDirection: 'column', gap: 6,
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(21,19,15,0.03)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}>
      {post.cover_image ? (
        <div style={{ width: '100%', height: 80, borderRadius: 8, overflow: 'hidden', marginBottom: 2 }}>
          <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div style={{ width: '100%', height: 50, borderRadius: 8, background: 'rgba(21,19,15,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
          <FileText size={16} color={INK3} />
        </div>
      )}
      <p style={{ fontSize: 12.5, fontWeight: 600, color: INK, margin: 0, lineHeight: 1.3,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {post.title || <span style={{ color: INK3 }}>Untitled</span>}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <StatusBadge published={post.published} />
        {post.reading_time && (
          <span style={{ fontSize: 10, color: INK3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={9} /> {post.reading_time} min
          </span>
        )}
      </div>
    </button>
  );
}

function FieldLabel({ children }) {
  return <p style={{ fontSize: 10.5, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 7px' }}>{children}</p>;
}

const inputStyle = {
  width: '100%', padding: '9px 13px', fontSize: 13, border: `1px solid ${BORDER}`,
  background: SURFACE, color: INK, borderRadius: 10, outline: 'none',
  fontFamily: F, boxSizing: 'border-box', transition: 'border-color 150ms',
};

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadPosts = () => base44.entities.BlogPost.list('-created_date', 200).then(setPosts).catch(() => {});

  useEffect(() => { loadPosts(); }, []);

  const selectPost = (post) => {
    setSelectedId(post.id);
    setForm({ title: post.title || '', slug: post.slug || '', summary: post.summary || '', content: post.content || '', cover_image: post.cover_image || '', category: post.category || '', published: post.published || false, reading_time: post.reading_time || 5 });
    setIsNew(false); setSaved(false); setConfirmDelete(false);
  };

  const newPost = () => { setSelectedId(null); setForm(EMPTY); setIsNew(true); setSaved(false); setConfirmDelete(false); };

  const handleTitleChange = (val) => {
    setForm(f => ({ ...f, title: val }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try { const { file_url } = await base44.integrations.Core.UploadFile({ file }); return file_url; }
    catch { return null; }
    finally { setUploading(false); }
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
    <div style={{ display: 'flex', height: '100vh', background: BG, fontFamily: F, color: INK, overflow: 'hidden' }}>

      {/* ══ LEFT PANEL ══════════════════════════════════════════════════ */}
      <div style={{ width: 280, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${BORDER}`, flexShrink: 0, background: SURFACE }}>

        {/* Header */}
        <div style={{ padding: '18px 16px 12px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>Blog</p>
              <p style={{ fontSize: 11, color: INK3, margin: '2px 0 0' }}>Manage articles</p>
            </div>
            <button onClick={newPost} style={{ width: 32, height: 32, borderRadius: 9, border: `1px solid ${BORDER}`, background: BG, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(21,19,15,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = BG}>
              <Plus size={14} color={INK} />
            </button>
          </div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {[['Total', totalPosts, INK], ['Live', published, GREEN], ['Drafts', drafts, INK2]].map(([l, v, c]) => (
              <div key={l} style={{ background: BG, borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: c, margin: 0, letterSpacing: '-0.03em' }}>{v}</p>
                <p style={{ fontSize: 9.5, color: INK3, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* New article CTA */}
        <div style={{ padding: '12px 12px 6px' }}>
          <button onClick={newPost} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 0', border: `1px dashed rgba(21,19,15,0.15)`, borderRadius: 10,
            background: !selectedId ? 'rgba(255,90,31,0.07)' : 'transparent',
            color: !selectedId ? CORAL : INK3, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: F,
            transition: 'all 120ms',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,90,31,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(21,19,15,0.15)'}>
            <Plus size={12} /> New article
          </button>
        </div>

        {/* Article list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 12px' }}>
              <FileText size={28} color={INK3} style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontSize: 12, color: INK3, margin: 0 }}>No articles yet</p>
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
            {/* Published toggle */}
            <button onClick={() => setForm(f => ({ ...f, published: !f.published }))}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: `1px solid ${form.published ? 'rgba(30,158,90,0.25)' : BORDER}`, borderRadius: 999, background: form.published ? 'rgba(30,158,90,0.07)' : BG, cursor: 'pointer', transition: 'all 150ms' }}>
              <div style={{ width: 28, height: 14, borderRadius: 999, background: form.published ? GREEN : 'rgba(21,19,15,0.15)', position: 'relative', transition: 'background 200ms' }}>
                <div style={{ position: 'absolute', top: 2, left: form.published ? 16 : 2, width: 10, height: 10, borderRadius: '50%', background: '#fff', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: form.published ? GREEN : INK2 }}>
                {form.published ? 'Published' : 'Draft'}
              </span>
            </button>

            {!isNew && form.slug && (
              <a href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: INK2, textDecoration: 'none', padding: '6px 12px', border: `1px solid ${BORDER}`, borderRadius: 999, background: BG, transition: 'all 120ms' }}
                onMouseEnter={e => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = 'rgba(21,19,15,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = INK2; e.currentTarget.style.borderColor = BORDER; }}>
                <ExternalLink size={11} /> Preview live
              </a>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isNew && !confirmDelete && (
              <button onClick={() => setConfirmDelete(true)}
                style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${BORDER}`, borderRadius: 9, background: 'transparent', cursor: 'pointer', transition: 'all 120ms' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = BORDER; }}>
                <Trash2 size={13} color="#EF4444" />
              </button>
            )}
            {confirmDelete && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(239,68,68,0.08)', borderRadius: 9, border: '1px solid rgba(239,68,68,0.3)' }}>
                <span style={{ fontSize: 12, color: '#EF4444' }}>Delete?</span>
                <button onClick={handleDelete} disabled={deleting} style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: 6, padding: '2px 7px', cursor: 'pointer', fontFamily: F }}>
                  {deleting ? '…' : 'Yes'}
                </button>
                <button onClick={() => setConfirmDelete(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: INK3, display: 'flex', padding: 2 }}>
                  <X size={11} />
                </button>
              </div>
            )}
            <button onClick={handleSave} disabled={saving || !form.title.trim()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
                background: saved ? 'rgba(30,158,90,0.12)' : CORAL,
                border: saved ? '1px solid rgba(30,158,90,0.3)' : 'none',
                borderRadius: 999, fontSize: 13, fontWeight: 700, color: saved ? GREEN : '#fff',
                cursor: (saving || !form.title.trim()) ? 'not-allowed' : 'pointer',
                opacity: !form.title.trim() ? 0.4 : 1, fontFamily: F, transition: 'all 200ms',
              }}>
              {saved ? <CheckCircle size={13} /> : <Save size={13} />}
              {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 48px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ maxWidth: 820, width: '100%', margin: '0 auto' }}>

            {/* Title */}
            <input
              value={form.title} onChange={e => handleTitleChange(e.target.value)}
              placeholder="Article title…"
              style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color: INK, border: 'none', background: 'transparent', outline: 'none', fontFamily: F, width: '100%', marginBottom: 10, lineHeight: 1.15 }}
            />

            {/* Slug */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11.5, color: INK3 }}>usewok.app/blog/</span>
              <input value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                placeholder="my-article"
                style={{ fontSize: 11.5, color: CORAL, border: 'none', background: 'transparent', outline: 'none', fontFamily: 'monospace', minWidth: 120 }} />
              <button type="button" onClick={() => form.title && setForm(f => ({ ...f, slug: generateSlug(form.title) }))}
                style={{ fontSize: 10, fontWeight: 600, color: INK3, background: BG, border: `1px solid ${BORDER}`, borderRadius: 999, padding: '3px 10px', cursor: 'pointer', fontFamily: F, transition: 'all 120ms' }}
                onMouseEnter={e => { e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = 'rgba(21,19,15,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = INK3; e.currentTarget.style.borderColor = BORDER; }}>
                Generate from title
              </button>
            </div>

            {/* Row: Summary + Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 14, marginBottom: 20 }}>
              <div>
                <FieldLabel>Summary (SEO)</FieldLabel>
                <textarea value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                  placeholder="Shown in Google and as the article intro (≈160 chars recommended)…"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(21,19,15,0.2)'}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />
                <p style={{ fontSize: 10, color: INK3, margin: '4px 0 0', textAlign: 'right' }}>{form.summary.length} chars</p>
              </div>
              <div>
                <FieldLabel>Category</FieldLabel>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. AI Strategy"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(21,19,15,0.2)'}
                  onBlur={e => e.target.style.borderColor = BORDER} />
              </div>
            </div>

            {/* Cover image */}
            <div style={{ marginBottom: 24 }}>
              <FieldLabel>Cover image</FieldLabel>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                  placeholder="https://… or upload an image"
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={e => e.target.style.borderColor = 'rgba(21,19,15,0.2)'}
                  onBlur={e => e.target.style.borderColor = BORDER} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', border: `1px solid ${BORDER}`, borderRadius: 10, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: INK2, background: BG, whiteSpace: 'nowrap', transition: 'all 120ms' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(21,19,15,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                  <Upload size={12} /> {uploading ? 'Uploading…' : 'Upload'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
                </label>
              </div>
              {form.cover_image && (
                <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', height: 140, position: 'relative' }}>
                  <img src={form.cover_image} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setForm(f => ({ ...f, cover_image: '' }))}
                    style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={11} color="#fff" />
                  </button>
                </div>
              )}
            </div>

            {/* Content — HTML with live rendered preview */}
            <div style={{ marginBottom: 0 }}>
              <FieldLabel>Content</FieldLabel>
              <HtmlPreviewField value={form.content} onChange={val => setForm(f => ({ ...f, content: val }))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}