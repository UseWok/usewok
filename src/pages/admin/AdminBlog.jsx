import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Eye, EyeOff, Save, ArrowLeft, Image, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FG = '#0A0A0A';
const YELLOW = '#DDFF00';

const generateSlug = (title) =>
  title.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

const EMPTY_POST = { title: '', slug: '', summary: '', content: '', cover_image: '', category: '', published: false, reading_time: 5 };

export default function AdminBlog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_POST);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const quillRef = useRef(null);
  const imageFileRef = useRef(null);

  const loadPosts = () => {
    base44.entities.BlogPost.list('-created_date', 100).then(setPosts).catch(() => {});
  };

  useEffect(() => { loadPosts(); }, []);

  const selectPost = (post) => {
    setSelectedId(post.id);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      summary: post.summary || '',
      content: post.content || '',
      cover_image: post.cover_image || '',
      category: post.category || '',
      published: post.published || false,
      reading_time: post.reading_time || 5,
    });
    setIsNew(false);
    setSaved(false);
  };

  const newPost = () => {
    setSelectedId(null);
    setForm(EMPTY_POST);
    setIsNew(true);
    setSaved(false);
  };

  const handleTitleChange = (val) => {
    setForm(f => ({ ...f, title: val, ...(isNew || !f.slug ? { slug: generateSlug(val) } : {}) }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } catch { return null; }
    finally { setUploading(false); }
  };

  // Custom quill image handler — opens file picker
  const imageHandler = useCallback(() => {
    imageFileRef.current?.click();
  }, []);

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await handleImageUpload(file);
    if (!url) return;
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'image', url, 'user');
      quill.setSelection(range.index + 1, 0, 'user');
    }
    e.target.value = '';
  };

  // Handle paste for images
  const handlePaste = useCallback(async (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    const url = await handleImageUpload(file);
    if (!url) return;
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'image', url, 'user');
      quill.setSelection(range.index + 1, 0, 'user');
    }
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ size: ['small', false, 'large', 'huge'] }],
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
      // Estimate reading time from content
      const wordCount = (form.content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      const data = { ...form, reading_time: readingTime };
      if (isNew) {
        const created = await base44.entities.BlogPost.create(data);
        setSelectedId(created.id);
        setIsNew(false);
      } else {
        await base44.entities.BlogPost.update(selectedId, data);
      }
      loadPosts();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedId || !window.confirm('Delete this article permanently?')) return;
    setDeleting(true);
    await base44.entities.BlogPost.delete(selectedId).catch(() => {});
    loadPosts();
    newPost();
    setDeleting(false);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await handleImageUpload(file);
    if (url) setForm(f => ({ ...f, cover_image: url }));
    e.target.value = '';
  };

  return (
    <div className="flex h-screen font-inter bg-white overflow-hidden">
      {/* Hidden file inputs */}
      <input ref={imageFileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />

      {/* LEFT PANEL — Post List */}
      <div className="flex flex-col flex-shrink-0 border-r border-black/8 overflow-hidden" style={{ width: 280 }}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-black/8">
          <div>
            <button onClick={() => navigate('/admin/products')} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-black mb-1">
              <ArrowLeft className="w-3 h-3" /> Admin
            </button>
            <p className="text-sm font-black" style={{ color: FG }}>Blog</p>
          </div>
          <button onClick={newPost}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
            title="New article">
            <Plus className="w-4 h-4" style={{ color: FG }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <button onClick={newPost}
            className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-black/4 transition-colors ${!selectedId ? 'bg-yuzu/30' : ''}`}>
            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400">+ New article</span>
          </button>
          {posts.map(post => (
            <button key={post.id} onClick={() => selectPost(post)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-black/4 transition-colors ${selectedId === post.id ? 'bg-black/5' : ''}`}>
              <div className="flex-shrink-0 mt-0.5">
                {post.published
                  ? <Eye className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
                  : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black truncate" style={{ color: FG }}>{post.title || 'Untitled'}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">/{post.slug}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-black/8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="sr-only" />
                <div className={`w-8 h-4 rounded-full transition-colors ${form.published ? 'bg-green-500' : 'bg-gray-200'}`} />
                <div className={`absolute w-3 h-3 bg-white rounded-full shadow transition-transform ${form.published ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </label>
              <span className="text-xs font-semibold" style={{ color: form.published ? '#16a34a' : '#999' }}>
                {form.published ? 'Published' : 'Draft'}
              </span>
            </div>
            {!isNew && (
              <a href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                <Eye className="w-3 h-3" /> Preview
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button onClick={handleDelete} disabled={deleting}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            )}
            <button onClick={handleSave} disabled={saving || !form.title.trim()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all hover:opacity-90"
              style={{ background: saved ? '#16a34a' : FG, color: saved ? 'white' : 'white' }}>
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Title */}
          <input
            value={form.title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Article title..."
            className="w-full font-black tracking-tight border-none outline-none bg-transparent placeholder-gray-200 mb-1"
            style={{ fontSize: '2rem', color: FG }}
          />
          {/* Slug */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-gray-300">stensor.base44.app/blog/</span>
            <input
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
              className="text-xs font-mono text-blue-500 border-none outline-none bg-transparent flex-1"
              placeholder="article-slug"
            />
          </div>

          {/* Row: Summary + Category + Cover */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Summary (SEO)</label>
              <textarea
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                placeholder="160-char description shown in Google results..."
                maxLength={999999}
                rows={2}
                className="w-full text-sm border border-black/10 rounded-lg px-3 py-2.5 outline-none focus:border-black/30 resize-none"
                style={{ fontFamily: 'var(--font-open)' }}
              />
              <p className="text-[10px] text-gray-300 text-right mt-1">{form.summary.length}/999999</p>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Category</label>
              <input
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Investing"
                className="w-full text-sm border border-black/10 rounded-lg px-3 py-2.5 outline-none focus:border-black/30"
              />
            </div>
          </div>

          {/* Cover image */}
          <div className="mb-6">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Cover Image</label>
            <div className="flex items-center gap-3">
              <input
                value={form.cover_image}
                onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                placeholder="https://... or upload below"
                className="flex-1 text-sm border border-black/10 rounded-lg px-3 py-2.5 outline-none focus:border-black/30"
              />
              <label className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-black rounded-lg cursor-pointer hover:bg-black/5 transition-colors border border-black/10"
                style={{ color: FG }}>
                <Image className="w-3.5 h-3.5" />
                {uploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
              </label>
            </div>
            {form.cover_image && (
              <img src={form.cover_image} alt="cover" className="mt-3 h-28 w-full object-cover rounded-xl" />
            )}
          </div>

          {/* Rich Text Editor */}
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Content</label>
          <div className="border border-black/10 rounded-xl overflow-hidden" onPaste={handlePaste}>
            <ReactQuill
              ref={quillRef}
              value={form.content}
              onChange={val => setForm(f => ({ ...f, content: val }))}
              modules={modules}
              theme="snow"
              placeholder="Write your article here... Paste images directly or use the toolbar image button."
              style={{ minHeight: '400px' }}
            />
          </div>
          {uploading && (
            <p className="text-xs text-blue-500 mt-2 animate-pulse">⏳ Uploading image...</p>
          )}
        </div>
      </div>

      <style>{`
        .ql-container { font-size: 15px; font-family: var(--font-open); }
        .ql-editor { min-height: 400px; line-height: 1.85; }
        .ql-toolbar { border-bottom: 1px solid rgba(0,0,0,0.08) !important; border-top: none !important; border-left: none !important; border-right: none !important; }
        .ql-container.ql-snow { border: none !important; }
      `}</style>
    </div>
  );
}