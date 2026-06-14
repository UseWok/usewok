import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkspaceSettings() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [name, setName] = useState("User's WOK");
  const [handle, setHandle] = useState('user-wok');
  const [creditLimit, setCreditLimit] = useState('');
  const [saving, setSaving] = useState(false);

  const MAX_NAME = 50;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    // Persist workspace name to localStorage
    const workspaces = JSON.parse(localStorage.getItem('wok_workspaces') || '[]');
    const updated = workspaces.map(w => w.current ? { ...w, name } : w);
    localStorage.setItem('wok_workspaces', JSON.stringify(updated));
    setSaving(false);
    toast.success('Workspace settings saved');
  };

  const Field = ({ label, description, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 28, borderBottom: '1px solid #F2F2F2', marginBottom: 28 }}>
      <label style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{label}</label>
      {children}
      {description && <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.5 }}>{description}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #EBEBEB', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#666', fontSize: 14, transition: 'background 120ms' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} /> Back
        </button>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
        {/* Page title */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111', margin: '0 0 8px' }}>Workspace settings</h1>
          <p style={{ fontSize: 15, color: '#888', margin: 0 }}>Workspaces allow you to collaborate on projects in real time.</p>
        </div>

        {/* Avatar */}
        <Field label="Avatar" description="Set an avatar for your workspace.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: avatarUrl ? 'transparent' : '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff', overflow: 'hidden', border: '2px solid #F0F0F0', flexShrink: 0 }}>
              {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name.charAt(0).toUpperCase()}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              <button
                onClick={() => fileRef.current?.click()}
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, color: '#333', background: '#fff', border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, transition: 'background 120ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                <Upload style={{ width: 14, height: 14 }} /> Upload image
              </button>
              <p style={{ fontSize: 11.5, color: '#AAAAAA', marginTop: 6 }}>PNG, JPG, GIF up to 2MB</p>
            </div>
          </div>
        </Field>

        {/* Name */}
        <Field label="Name" description="Your full workspace name, as visible to others.">
          <div style={{ position: 'relative' }}>
            <input
              value={name}
              onChange={e => setName(e.target.value.slice(0, MAX_NAME))}
              maxLength={MAX_NAME}
              style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid #E0E0E0', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', color: '#111', background: '#fff', transition: 'border-color 150ms' }}
              onFocus={e => e.target.style.borderColor = '#2563EB'}
              onBlur={e => e.target.style.borderColor = '#E0E0E0'}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: name.length > MAX_NAME * 0.8 ? '#F59E0B' : '#CCCCCC' }}>
              {name.length} / {MAX_NAME}
            </span>
          </div>
        </Field>

        {/* Handle */}
        <Field label="Workspace handle" description="Set a handle for the workspace profile page.">
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E0E0', borderRadius: 8, overflow: 'hidden', background: '#fff', transition: 'border-color 150ms' }}
            onFocusCapture={e => e.currentTarget.style.borderColor = '#2563EB'}
            onBlurCapture={e => e.currentTarget.style.borderColor = '#E0E0E0'}
          >
            <span style={{ padding: '10px 12px', fontSize: 14, color: '#AAAAAA', background: '#F8F8F8', borderRight: '1px solid #E0E0E0', whiteSpace: 'nowrap' }}>@</span>
            <input
              value={handle}
              onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              style={{ flex: 1, padding: '10px 12px', fontSize: 14, border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', color: '#111', background: 'transparent' }}
            />
          </div>
        </Field>

        {/* Credit limit */}
        <Field label="Default monthly member credit limit" description="The default monthly credit limit for members of this workspace. Leave empty to use no limit.">
          <input
            type="number"
            value={creditLimit}
            onChange={e => setCreditLimit(e.target.value)}
            placeholder="No limit"
            style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid #E0E0E0', borderRadius: 8, outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', color: '#111', background: '#fff', transition: 'border-color 150ms' }}
            onFocus={e => e.target.style.borderColor = '#2563EB'}
            onBlur={e => e.target.style.borderColor = '#E0E0E0'}
          />
        </Field>

        {/* Save button */}
        <div style={{ marginBottom: 48 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#111', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'background 120ms, opacity 120ms' }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#333'; }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#111'; }}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>

        {/* Danger zone */}
        <div style={{ border: '1px solid #FCA5A5', borderRadius: 12, padding: '24px', background: '#FFF5F5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <AlertTriangle style={{ width: 18, height: 18, color: '#EF4444' }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#EF4444', margin: 0 }}>Danger zone</h2>
          </div>

          {/* Leave workspace */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, paddingBottom: 20, borderBottom: '1px solid #FCA5A5', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>Leave workspace</div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5, maxWidth: 380 }}>
                You cannot leave as you are the only owner. Please transfer ownership first.
              </div>
            </div>
            <button disabled style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, color: '#AAAAAA', background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'not-allowed', flexShrink: 0, opacity: 0.6 }}>
              Leave
            </button>
          </div>

          {/* Delete workspace */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>Delete workspace</div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5, maxWidth: 380 }}>
                Permanently delete this workspace and all projects in it. Members lose access immediately.
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure? This cannot be undone.')) {
                  toast.error('Workspace deleted');
                }
              }}
              style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, color: '#fff', background: '#EF4444', border: 'none', borderRadius: 8, cursor: 'pointer', flexShrink: 0, transition: 'background 120ms' }}
              onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
              onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}