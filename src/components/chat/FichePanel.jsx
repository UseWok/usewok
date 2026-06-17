import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Settings, Copy, AlertTriangle, Trash2, LayoutDashboard, Share2, ExternalLink, Sparkles, Code2, FileCode, CheckCircle2, Pencil, Lock, Download, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import VisualEditorToolbar from './VisualEditorToolbar';
import { getPlanFeatures } from '@/lib/plans-config';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

// ─────────────────────────────────────────────
// CODE EDITOR PANEL (DARK THEME - #0F0F0F)
// ─────────────────────────────────────────────
const CodeEditorPanel = ({ code, onUpdateContent, user }) => {
  const planFeatures = getPlanFeatures(user);
  const canEdit = !!(planFeatures?.code_editor);

  const [editedCode, setEditedCode] = useState(code || '');
  const [savedCode, setSavedCode] = useState(code || '');
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const LINE_H = 22; // px — must match textarea line-height

  // Sync when parent content changes (e.g. after AI generation)
  useEffect(() => {
    setEditedCode(code || '');
    setSavedCode(code || '');
  }, [code]);

  const hasChanges = canEdit && editedCode !== savedCode;

  const handleChange = (e) => { if (canEdit) setEditedCode(e.target.value); };

  const handleScroll = useCallback(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleSave = () => {
    if (!canEdit) return;
    setSavedCode(editedCode);
    if (onUpdateContent) onUpdateContent(editedCode);
    toast.success('Code saved — preview updated.');
  };

  const handleCancel = () => setEditedCode(savedCode);

  // Tab key inserts spaces instead of moving focus
  const handleKeyDown = (e) => {
    if (!canEdit) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = e.target;
      const newValue = value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
      setEditedCode(newValue);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = selectionStart + 2;
          textareaRef.current.selectionEnd = selectionStart + 2;
        }
      });
    }
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (hasChanges) handleSave();
    }
  };

  const lines = editedCode.split('\n');

  // Per-line syntax indicators
  const getLineIndicator = (line) => {
    const t = line.trim();
    if (t.startsWith('import ')) return 'blue';
    if (/^(export\s+)?(default\s+)?(function|const|let|var|class)\s/.test(t)) return 'emerald';
    if (t.startsWith('return') || t === 'return (') return 'amber';
    if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) return 'slate';
    return null;
  };

  const indicatorColor = {
    blue: '#60A5FA',
    emerald: '#34D399',
    amber: '#FBBF24',
    slate: '#94A3B8',
  };

  const isEmpty = !code;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#1C1C1C] rounded-xl border border-[#2A2A2A]">

      {/* ── Editor top bar ── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-[#1A1A1A] border-b border-[#2A2A2A] rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[12px] font-semibold text-slate-300 font-mono">App.jsx</span>
            {hasChanges && (
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" title="Unsaved changes" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-[#2A2A2A] border border-[#3A3A3A] px-2 py-0.5 rounded font-mono">
            JSX · React 18
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {lines.length} lines
          </span>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="shrink-0 flex items-center gap-4 px-4 py-1.5 bg-[#0F0F0F] border-b border-[#2A2A2A]">
        {[
          { color: '#60A5FA', label: 'import' },
          { color: '#34D399', label: 'declaration' },
          { color: '#FBBF24', label: 'return' },
          { color: '#94A3B8', label: 'comment' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-slate-500 font-mono">{label}</span>
          </div>
        ))}
        {canEdit ? (
          <span className="ml-auto text-[10px] text-slate-500 font-mono">⌘S / Ctrl+S to save</span>
        ) : (
          <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: '#F97316' }}>
            <Lock style={{ width: 10, height: 10 }} />
            Read-only — Starter+ to edit
          </span>
        )}
      </div>

      {/* ── Editor body ── */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center text-slate-500 select-none">
          <Code2 className="w-14 h-14 stroke-1" />
          <p className="text-[14px] font-medium text-slate-400">No code yet</p>
          <p className="text-[12px]">Send a message in the chat to generate your app.</p>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden font-mono bg-[#0F0F0F]">

          {/* Line numbers gutter */}
          <div
            ref={lineNumbersRef}
            className="overflow-hidden select-none shrink-0 bg-[#1A1A1A] border-r border-[#2A2A2A]"
            style={{ lineHeight: `${LINE_H}px` }}
          >
            <div className="py-4 px-0">
              {lines.map((line, i) => {
                const indicator = getLineIndicator(line);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-end pr-3 pl-2"
                    style={{ height: LINE_H, minWidth: 56 }}
                  >
                    {indicator && (
                      <span
                        className="w-1.5 h-1.5 rounded-full mr-2 shrink-0"
                        style={{ backgroundColor: indicatorColor[indicator] }}
                      />
                    )}
                    <span
                      className="text-right text-[11px] tabular-nums"
                      style={{ color: '#555', minWidth: 24 }}
                    >
                      {i + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Code textarea */}
          <textarea
            ref={textareaRef}
            value={editedCode}
            onChange={handleChange}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={!canEdit}
            className="flex-1 bg-[#0F0F0F] text-[#E2E8F0] resize-none outline-none overflow-auto py-4 px-4 text-[13px] leading-none"
            style={{
              lineHeight: `${LINE_H}px`,
              caretColor: canEdit ? '#0055FF' : 'transparent',
              tabSize: 2,
              fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", Menlo, monospace',
              userSelect: 'text',
              cursor: canEdit ? 'text' : 'default',
            }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      )}

      {/* ── Save / Cancel bar — animates in when changes exist ── */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 56, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 56, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-[#2A2A2A] bg-[#1A1A1A] rounded-b-xl"
            style={{ boxShadow: '0 -4px 24px rgba(0,0,0,0.4)' }}
          >
            <span className="text-[12px] text-slate-400 font-medium">
              Unsaved changes
            </span>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 text-[13px] font-semibold text-slate-300 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-1.5 text-[13px] font-bold text-white bg-[#0055FF] hover:bg-[#0044CC] rounded-lg transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// ─────────────────────────────────────────────
// EXPORT ZIP MODAL
// ─────────────────────────────────────────────
const ExportZipModal = ({ open, onClose, onConfirm, canExport }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.16 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 16, padding: 28, width: 360, boxShadow: '0 24px 64px rgba(0,0,0,0.7)', fontFamily: 'Inter, sans-serif' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: canExport ? '#1C2A1A' : '#2A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {canExport ? <Archive style={{ width: 20, height: 20, color: '#22C55E' }} /> : <Lock style={{ width: 20, height: 20, color: '#F97316' }} />}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Exporter en ZIP</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{canExport ? 'Télécharger le code source complet' : 'Fonctionnalité payante'}</div>
          </div>
        </div>

        {canExport ? (
          <>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 20 }}>
              L'export inclut <strong style={{ color: '#ccc' }}>index.html</strong>, <strong style={{ color: '#ccc' }}>app.jsx</strong> et un <strong style={{ color: '#ccc' }}>README.md</strong>. L'app est autonome — elle s'ouvre directement dans un navigateur sans serveur.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px 0', background: '#2A2A2A', border: 'none', borderRadius: 8, color: '#aaa', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => { onConfirm(); onClose(); }} style={{ flex: 1, padding: '10px 0', background: '#22C55E', border: 'none', borderRadius: 8, color: '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Download style={{ width: 14, height: 14 }} /> Télécharger
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: '#2A1A0A', border: '1px solid #3A2A1A', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: '#F97316', fontWeight: 600, marginBottom: 6 }}>Plan Starter ou supérieur requis</p>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
                L'export ZIP est disponible à partir du plan <strong style={{ color: '#ccc' }}>Starter</strong> (€11.50/mois). Passez à niveau pour télécharger votre code source complet.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px 0', background: '#2A2A2A', border: 'none', borderRadius: 8, color: '#aaa', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Fermer</button>
              <button onClick={() => { onClose(); window.location.href = '/pricing'; }} style={{ flex: 1, padding: '10px 0', background: 'linear-gradient(100deg, #FAF0E8 0%, #FBD5B0 45%, #F97240 100%)', border: 'none', borderRadius: 8, color: '#C45000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Voir les plans →
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};


// ─────────────────────────────────────────────
// ADVANCED SETTINGS PANEL (placeholder)
// ─────────────────────────────────────────────
const AdvancedSettingsPanel = ({ settings = {}, onUpdateSettings }) => (
  <div className="flex-1 overflow-y-auto p-8 md:p-12">
    <h2 className="text-[22px] font-bold text-slate-900 mb-2">Advanced Settings</h2>
    <p className="text-[14px] text-slate-500 mb-8">Fine-grained configuration for your application.</p>

    <div className="space-y-6 max-w-2xl">
      {/* Custom domain placeholder */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-[15px] font-bold text-slate-900 mb-1">Custom Domain</h3>
        <p className="text-[13px] text-slate-500 mb-4">Connect your own domain to this application.</p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="yourdomain.com"
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-blue-500 bg-slate-50"
          />
          <button className="px-4 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded-lg hover:bg-slate-800 transition-colors">
            Connect
          </button>
        </div>
      </div>

      {/* Analytics placeholder */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-[15px] font-bold text-slate-900 mb-1">Analytics Integration</h3>
        <p className="text-[13px] text-slate-500 mb-4">Add your tracking ID to monitor usage.</p>
        <input
          type="text"
          placeholder="G-XXXXXXXXXX or UA-XXXXXXXX"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] outline-none focus:border-blue-500 bg-slate-50"
        />
      </div>

      {/* Password protection placeholder */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-[15px] font-bold text-slate-900 mb-1">Password Protection</h3>
        <p className="text-[13px] text-slate-500 mb-4">Restrict access to this app with a password.</p>
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <span className="text-[13px] font-semibold text-slate-700">Enable Password Gate</span>
          <button
            onClick={() => onUpdateSettings && onUpdateSettings({ ...settings, passwordProtected: !settings.passwordProtected })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.passwordProtected ? 'bg-[#0055FF]' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${settings.passwordProtected ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  </div>
);


// ─────────────────────────────────────────────
// OVERVIEW PANEL (extracted from original AppDashboard)
// ─────────────────────────────────────────────
const OverviewPanel = ({ settings, onUpdateSettings, onClone, onDelete, onUnpublish }) => {
  const [title, setTitle] = useState(settings.title || 'AI-Powered Interface');
  const [description, setDescription] = useState(settings.description || 'A highly optimized interactive experience built with Wok.');

  // Sync if settings change from outside
  useEffect(() => {
    setTitle(settings.title || 'AI-Powered Interface');
    setDescription(settings.description || 'A highly optimized interactive experience built with Wok.');
  }, [settings.title, settings.description]);

  const handleSave = () => {
    if (onUpdateSettings) onUpdateSettings({ ...settings, title, description });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 md:p-12 max-w-4xl">

      {/* Header Block */}
      <div className="flex gap-6 items-start mb-10">
        <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center shadow-lg border border-slate-200 flex-shrink-0">
          <img src={LOGO_URL} alt="Logo" className="w-12 h-12 invert" />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 py-1 w-full transition-all"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
            rows={3}
            className="text-[14px] text-slate-600 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 w-full resize-none leading-relaxed transition-all"
          />
          <div className="flex items-center gap-3 mt-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-slate-50 transition-colors">
              <ExternalLink className="w-4 h-4" /> Open App
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-slate-50 transition-colors">
              <Share2 className="w-4 h-4" /> Share (Earn Credits)
            </button>
          </div>
        </div>
      </div>

      {/* SEO Alert */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 flex items-start gap-3 shadow-sm">
        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-[13px] text-blue-800 leading-relaxed">
          <strong>SEO Optimization:</strong> The more precise and keyword-rich the metadata (title and description) of this application, the easier it will be to find and index by search engines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Visibility */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-[15px] font-bold text-slate-900 mb-1">App Visibility</h3>
          <p className="text-[13px] text-slate-500 mb-5">Control who can access your application.</p>
          <select
            value={settings.isPublic ? 'public' : 'private'}
            onChange={(e) => onUpdateSettings && onUpdateSettings({ ...settings, isPublic: e.target.value === 'public' })}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-blue-500 appearance-none bg-slate-50 transition-colors"
          >
            <option value="public">🌐 Public (Accessible via URL)</option>
            <option value="private">🔒 Private (Workspace only)</option>
          </select>
        </div>

        {/* Badge Control */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-[15px] font-bold text-slate-900 mb-1">White Label</h3>
          <p className="text-[13px] text-slate-500 mb-5">Show or hide the "Built with WOK" badge.</p>
          <div className="flex items-center justify-between mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[13px] font-semibold text-slate-700">Platform Badge</span>
            <button
              onClick={() => onUpdateSettings && onUpdateSettings({ ...settings, showBadge: !settings.showBadge })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showBadge ? 'bg-[#0055FF]' : 'bg-slate-300'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${settings.showBadge ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Clone */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-12 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-slate-900 mb-1">Clone Interface</h3>
          <p className="text-[13px] text-slate-500">Duplicates the code into a new session with a new URL.</p>
        </div>
        <button onClick={onClone} className="px-5 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded-lg shadow-sm hover:bg-slate-800 flex items-center gap-2 transition-colors">
          <Copy className="w-4 h-4" /> Clone
        </button>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 bg-red-50/50 p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-[15px] font-bold text-red-700">Danger Zone</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <button onClick={onUnpublish} className="flex-1 px-4 py-2.5 bg-white border border-red-200 text-red-600 text-[13px] font-bold rounded-lg hover:bg-red-50 transition-colors">
            Unpublish Page
          </button>
          <button onClick={onDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-[13px] font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 shadow-sm transition-colors">
            <Trash2 className="w-4 h-4" /> Delete Permanently
          </button>
        </div>
      </div>

    </div>
  );
};


// ─────────────────────────────────────────────
// ENTERPRISE DASHBOARD COMPONENT (Retained for completeness, visually bypassed when in code mode)
// ─────────────────────────────────────────────
const AppDashboard = ({
  settings = {},
  onUpdateSettings,
  onClone,
  onDelete,
  onUnpublish,
  dashboardTab = 'overview',
  setDashboardTab,
  content,
  onUpdateContent,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'code',     label: 'Code',     icon: Code2 },
    { id: 'advanced', label: 'Advanced Settings', icon: Settings },
  ];

  return (
    <div className="absolute inset-0 bg-[#F9FAFB] overflow-hidden font-sans text-slate-900 border-t border-l border-[#E5E5E5] flex">

      {/* ── Sidebar ── */}
      <div className="w-[240px] bg-white border-r border-[#E5E5E5] hidden md:flex flex-col py-6 px-4 shrink-0">
        <p className="text-[14px] font-bold text-slate-900 mb-6 px-3">Dashboard</p>
        <div className="space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setDashboardTab && setDashboardTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                dashboardTab === id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 font-medium'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {dashboardTab === 'overview' && (
          <OverviewPanel
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onClone={onClone}
            onDelete={onDelete}
            onUnpublish={onUnpublish}
          />
        )}
        {dashboardTab === 'code' && (
          <CodeEditorPanel code={content} onUpdateContent={onUpdateContent} />
        )}
        {dashboardTab === 'advanced' && (
          <AdvancedSettingsPanel settings={settings} onUpdateSettings={onUpdateSettings} />
        )}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// FICHE PANEL (main export)
// ─────────────────────────────────────────────
export default function FichePanel({
  content = null,
  iframeRefreshKey = 0,
  appearance,
  onError,
  onSuccess,
  isPublic = false,
  viewMode,
  setViewMode,
  appSettings = {},
  onUpdateSettings,
  onClone,
  onDelete,
  onUnpublish,
  onUpdateContent,
  user,
}) {
  const planFeatures = getPlanFeatures(user);
  const canExportZip = !!(planFeatures?.zip_export);

  const [isCompiling, setIsCompiling] = useState(true);
  const [compiledCode, setCompiledCode] = useState({ html: '', css: '', js: '', rawComponent: '' });
  const [showExportModal, setShowExportModal] = useState(false);

  // Sub-tab within dashboard ('overview' | 'code' | 'advanced')
  const [dashboardTab, setDashboardTab] = useState('overview');

  // ── Visual editor state ──
  const [visualEditMode, setVisualEditMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const iframeRef = useRef(null);

  // ── Preview toolbar state ──
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for export trigger from ChatHeader's ··· menu
  useEffect(() => {
    const handler = () => setShowExportModal(true);
    window.addEventListener('wok_export_zip', handler);
    return () => window.removeEventListener('wok_export_zip', handler);
  }, []);

  const handleExportZip = async () => {
    setShowOptionsMenu(false);
    if (!content) { toast.error('No code to export.'); return; }
    toast.info('Preparing ZIP export…');
    try {
      // Build a self-contained HTML file with the app embedded
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WOK App Export</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@18.2.0",
      "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
      "lucide-react": "https://esm.sh/lucide-react@0.263.0?deps=react@18.2.0",
      "framer-motion": "https://esm.sh/framer-motion@10.16.4?deps=react@18.2.0,react-dom@18.2.0",
      "recharts": "https://esm.sh/recharts@2.10.3?deps=react@18.2.0,react-dom@18.2.0"
    }
  }
  </script>
  <style>html,body,#root{margin:0;padding:0;width:100%;height:100%;-webkit-font-smoothing:antialiased;}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module" data-presets="react">
    import { createRoot } from 'react-dom/client';
    ${compiledCode.js}
    try {
      const root = createRoot(document.getElementById('root'));
      root.render(<App />);
    } catch(e) { console.error(e); }
  </script>
</body>
</html>`;

      const readmeContent = `# WOK App Export

This is a self-contained export of your WOK-generated app.

## How to run

Simply open \`index.html\` in your browser — no server needed.

The app uses CDN-hosted dependencies (React, Tailwind, Lucide, etc.) so an internet connection is required.

## Files
- \`index.html\` — The complete app
- \`app.jsx\` — The raw React source code

Generated by WOK · ${new Date().toLocaleDateString()}
`;

      // Create ZIP using JSZip-like approach with raw deflate
      // We'll use a simple approach: create a Blob with the files
      const encoder = new TextEncoder();
      const htmlBytes = encoder.encode(htmlContent);
      const rawBytes = encoder.encode(content || '');
      const readmeBytes = encoder.encode(readmeContent);

      // Build a minimal ZIP file manually
      const files = [
        { name: 'index.html', data: htmlBytes },
        { name: 'app.jsx', data: rawBytes },
        { name: 'README.md', data: readmeBytes },
      ];

      const zip = buildZip(files);
      const blob = new Blob([zip], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wok-app-export.zip';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('ZIP downloaded!');
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    }
  };

  // Minimal ZIP builder (no compression — store only)
  const buildZip = (files) => {
    const encoder = new TextEncoder();
    const records = [];
    const centralDir = [];
    let offset = 0;

    for (const file of files) {
      const nameBytes = encoder.encode(file.name);
      const data = file.data;
      const crc = crc32(data);
      const localHeader = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(localHeader.buffer);
      view.setUint32(0, 0x04034b50, true); // signature
      view.setUint16(4, 20, true);          // version needed
      view.setUint16(6, 0, true);           // flags
      view.setUint16(8, 0, true);           // no compression
      view.setUint16(10, 0, true);          // mod time
      view.setUint16(12, 0, true);          // mod date
      view.setUint32(14, crc, true);        // CRC-32
      view.setUint32(18, data.length, true);// compressed size
      view.setUint32(22, data.length, true);// uncompressed size
      view.setUint16(26, nameBytes.length, true);
      view.setUint16(28, 0, true);          // extra length
      localHeader.set(nameBytes, 30);

      const cdEntry = new Uint8Array(46 + nameBytes.length);
      const cdView = new DataView(cdEntry.buffer);
      cdView.setUint32(0, 0x02014b50, true);
      cdView.setUint16(4, 20, true);
      cdView.setUint16(6, 20, true);
      cdView.setUint16(8, 0, true);
      cdView.setUint16(10, 0, true);
      cdView.setUint16(12, 0, true);
      cdView.setUint16(14, 0, true);
      cdView.setUint32(16, crc, true);
      cdView.setUint32(20, data.length, true);
      cdView.setUint32(24, data.length, true);
      cdView.setUint16(28, nameBytes.length, true);
      cdView.setUint16(30, 0, true);
      cdView.setUint16(32, 0, true);
      cdView.setUint16(34, 0, true);
      cdView.setUint16(36, 0, true);
      cdView.setUint32(38, 0, true);
      cdView.setUint32(42, offset, true);
      cdEntry.set(nameBytes, 46);

      records.push(localHeader, data);
      centralDir.push(cdEntry);
      offset += localHeader.length + data.length;
    }

    const cdSize = centralDir.reduce((s, b) => s + b.length, 0);
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true);
    eocdView.setUint16(4, 0, true);
    eocdView.setUint16(6, 0, true);
    eocdView.setUint16(8, files.length, true);
    eocdView.setUint16(10, files.length, true);
    eocdView.setUint32(12, cdSize, true);
    eocdView.setUint32(16, offset, true);
    eocdView.setUint16(20, 0, true);

    const all = [...records, ...centralDir, eocd];
    const total = all.reduce((s, b) => s + b.length, 0);
    const result = new Uint8Array(total);
    let pos = 0;
    for (const b of all) { result.set(b, pos); pos += b.length; }
    return result;
  };

  const crc32 = (data) => {
    let crc = 0xFFFFFFFF;
    const table = crc32Table();
    for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  };

  const crc32Table = () => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  };

  useEffect(() => {
    setIsCompiling(true);

    if (content) {
      const btCode = String.fromCharCode(96);
      const btPattern = new RegExp(`${btCode}{3}(?:jsx|javascript|react)?\\n?`, 'gi');
      let componentLogic = content.replace(btPattern, '').replace(new RegExp(`${btCode}{3}`, 'g'), '');

      componentLogic = componentLogic.replace(/export\s+default\s+function/g, 'function');
      componentLogic = componentLogic.replace(/export\s+default\s+class/g, 'class');
      componentLogic = componentLogic.replace(/export\s+default\s+[a-zA-Z0-9_]+;?/g, '');
      componentLogic = componentLogic.replace(/export\s+(const|let|var|function|class)/g, '$1');

      setCompiledCode({ html: '', css: '', js: componentLogic, rawComponent: content });
    } else {
      setCompiledCode({ html: '', css: '', js: '', rawComponent: '' });
    }

    const timer = setTimeout(() => setIsCompiling(false), 800);
    return () => clearTimeout(timer);
  }, [content]);

  // Inject code into iframe via postMessage once it's ready (avoids template-string escaping issues)
  useEffect(() => {
    if (!compiledCode.js || !iframeRef.current) return;
    const iframe = iframeRef.current;
    const onLoad = () => {
      try {
        iframe.contentWindow.postMessage({ type: 'WOK_INJECT_CODE', code: compiledCode.js }, '*');
      } catch (e) {}
    };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [compiledCode.js, iframeRefreshKey]);

  // ── Error accumulator: collect all errors within 2s window, send as one batch ──
  const pendingErrorsRef = useRef([]);
  const errorTimerRef = useRef(null);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'WOK_RUNTIME_ERROR') {
        // Accumulate errors — debounce 2s to collect all simultaneous errors
        const msg = e.data.message || 'Unknown error';
        if (!pendingErrorsRef.current.includes(msg)) {
          pendingErrorsRef.current.push(msg);
        }
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = setTimeout(() => {
          if (pendingErrorsRef.current.length > 0 && onError) {
            const combined = pendingErrorsRef.current.join('\n\n---\n\n');
            onError(combined);
            pendingErrorsRef.current = [];
          }
        }, 1500);
      } else if (e.data?.type === 'WOK_RUNTIME_SUCCESS') {
        // Clear pending errors on success
        clearTimeout(errorTimerRef.current);
        pendingErrorsRef.current = [];
        if (onSuccess) onSuccess();
      } else if (e.data?.type === 'WOK_ELEMENT_SELECTED') {
        if (visualEditMode) setSelectedElement(e.data.element);
      } else if (e.data?.type === 'WOK_ELEMENT_DESELECTED') {
        setSelectedElement(null);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(errorTimerRef.current);
    };
  }, [onError, onSuccess, visualEditMode]);

  // ── Notify iframe when visual edit mode changes ──
  useEffect(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'WOK_VISUAL_MODE', active: visualEditMode }, '*');
    } catch {}
  }, [visualEditMode]);

  const hasComponent = compiledCode.html || compiledCode.css || compiledCode.js;

  // Badge: always show unless plan has white_label feature
  const shouldShowBadge = appSettings?.showBadge !== false;

  const watermarkHTML = shouldShowBadge ? `
    <div id="wok-badge" style="position:fixed;bottom:14px;right:14px;z-index:99999;display:flex;align-items:center;gap:0;background:#000;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.35);overflow:hidden;font-family:Inter,system-ui,sans-serif;">
      <a href="https://wok.so" target="_blank" style="display:flex;align-items:center;padding:6px 10px;text-decoration:none;">
        <img src="https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png" alt="WOK" style="height:16px;width:auto;object-fit:contain;mix-blend-mode:screen;display:block;" />
      </a>
      <button onclick="document.getElementById('wok-badge').remove()" style="display:flex;align-items:center;justify-content:center;width:24px;height:100%;min-height:28px;background:transparent;border:none;border-left:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.35);cursor:pointer;padding:0;">
        <svg width="8" height="8" viewBox="0 0 9 9" fill="none"><path d="M1 1L8 8M8 1L1 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>` : '';

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        <!-- Preconnect to CDN for faster resolution -->
        <link rel="preconnect" href="https://esm.sh" crossorigin>
        <link rel="preconnect" href="https://unpkg.com" crossorigin>

        <!-- Expose React globally so Babel-transformed code can reference it -->
        <script type="module">
          import React from 'https://esm.sh/react@18.2.0';
          window.React = React;
        </script>

        <!-- Load Babel with a timeout fallback -->
        <script>
          window.__babelLoadTimeout = setTimeout(function() {
            if (typeof Babel === 'undefined') {
              try { window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: 'Babel CDN failed to load (network timeout). Please refresh.' }, '*'); } catch(e) {}
            }
          }, 12000);
        </script>
        <script src="https://unpkg.com/@babel/standalone@7.23.5/babel.min.js" onload="clearTimeout(window.__babelLoadTimeout)"></script>

        <script type="importmap">
        {
          "imports": {
            "react": "https://esm.sh/react@18.2.0",
            "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
            "lucide-react": "https://esm.sh/lucide-react@0.263.0?deps=react@18.2.0",
            "framer-motion": "https://esm.sh/framer-motion@10.16.4?deps=react@18.2.0,react-dom@18.2.0",
            "recharts": "https://esm.sh/recharts@2.10.3?deps=react@18.2.0,react-dom@18.2.0"
          }
        }
        </script>
        
        <style>
          html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #ffffff; -webkit-font-smoothing: antialiased; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        ${watermarkHTML}
        
        <script>
          // ── Safe postMessage helper — never throws if parent is unready ──
          function _wokPost(msg) {
            try { window.parent.postMessage(msg, '*'); } catch(e) {}
          }
          // Expose globally for Babel-transformed code
          window._wokPost = _wokPost;

          // Capture window.onerror — deferred so environment is ready
          window.addEventListener('load', function() {
            window.onerror = function(message, source, lineno, colno, error) {
              var msg = error ? (error.message || message) : message;
              // Ignore cross-origin "Script error." noise with no useful info
              if (msg === 'Script error.' || msg === 'Script Error') return true;
              _wokPost({ type: 'WOK_RUNTIME_ERROR', message: String(msg) });
              return true;
            };
            window.addEventListener('unhandledrejection', function(e) {
              var msg = e.reason ? (e.reason.message || String(e.reason)) : 'Unhandled promise rejection';
              _wokPost({ type: 'WOK_RUNTIME_ERROR', message: msg });
            });
          });

          // ── Visual Editor selection listener ──
          var _wokEditMode = false;
          var _wokSelected = null;

          window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'WOK_VISUAL_MODE') {
              _wokEditMode = e.data.active;
              if (!_wokEditMode && _wokSelected) {
                _wokSelected.style.outline = '';
                _wokSelected = null;
              }
            }
            if (e.data && e.data.type === 'WOK_UPDATE_CONTENT' && _wokSelected) {
              _wokSelected.textContent = e.data.text;
            }
            if (e.data && e.data.type === 'WOK_UPDATE_STYLE' && _wokSelected) {
              var p = e.data.prop;
              var v = e.data.val;
              if (p === 'opacity') _wokSelected.style.opacity = v;
              if (p === 'align') _wokSelected.style.textAlign = v;
              if (p === 'size') {
                var sizeMap = { xs:'12px', sm:'14px', base:'16px', lg:'18px', xl:'20px', '2xl':'24px', '3xl':'30px' };
                _wokSelected.style.fontSize = sizeMap[v] || v;
              }
              if (p === 'weight') _wokSelected.style.fontWeight = v;
              if (p === 'decoration') _wokSelected.style.textDecoration = v;
            }
            if (e.data && e.data.type === 'WOK_DELETE_ELEMENT' && _wokSelected) {
              _wokSelected.remove();
              _wokSelected = null;
            }
          });

          document.addEventListener('click', function(e) {
            if (!_wokEditMode) return;
            e.preventDefault();
            e.stopPropagation();
            if (_wokSelected) _wokSelected.style.outline = '';
            _wokSelected = e.target;
            _wokSelected.style.outline = '2px solid #F95738';
            _wokSelected.style.outlineOffset = '2px';
            var tag = e.target.tagName.toLowerCase();
            var text = e.target.innerText ? e.target.innerText.slice(0, 200) : '';
            var textTags = ['h1','h2','h3','h4','h5','h6','p','span','a','li','label','button'];
            _wokPost({
              type: 'WOK_ELEMENT_SELECTED',
              element: { tag: tag, text: text, isTextNode: textTags.includes(tag) }
            });
          }, true);
        </script>

        <script>
          // Receive code via postMessage and execute via Babel (avoids template-string escaping)
          window.addEventListener('message', function(e) {
            if (!e.data || e.data.type !== 'WOK_INJECT_CODE') return;
            var code = e.data.code;
            if (!code) return;

            if (typeof Babel === 'undefined') {
              _wokPost({ type: 'WOK_RUNTIME_ERROR', message: 'Babel not loaded yet. Please refresh.' });
              return;
            }

            try {
              var transformed = Babel.transform(code, { presets: ['react'], plugins: [] }).code;

              // Wrap in async module loader for ESM imports
              var moduleCode = [
                'import { createRoot } from "react-dom/client";',
                transformed,
                '',
                'class ErrorBoundary extends React.Component {',
                '  constructor(p) { super(p); this.state = { err: false }; }',
                '  static getDerivedStateFromError() { return { err: true }; }',
                '  componentDidCatch(e) { _wokPost({ type: "WOK_RUNTIME_ERROR", message: e.message || e.toString() }); }',
                '  render() { return this.state.err ? null : this.props.children; }',
                '}',
                '',
                'if (typeof App !== "undefined") {',
                '  const root = createRoot(document.getElementById("root"));',
                '  root.render(React.createElement(ErrorBoundary, null, React.createElement(App)));',
                '  _wokPost({ type: "WOK_RUNTIME_SUCCESS" });',
                '} else {',
                '  _wokPost({ type: "WOK_RUNTIME_ERROR", message: "Component must be named App." });',
                '}',
              ].join('\n');

              var blob = new Blob([moduleCode], { type: 'application/javascript' });
              var url = URL.createObjectURL(blob);
              var script = document.createElement('script');
              script.type = 'module';
              script.src = url;
              script.onerror = function(err) {
                _wokPost({ type: 'WOK_RUNTIME_ERROR', message: 'Module load error. Check your imports.' });
                URL.revokeObjectURL(url);
              };
              script.onload = function() { URL.revokeObjectURL(url); };
              document.head.appendChild(script);
            } catch(err) {
              _wokPost({ type: 'WOK_RUNTIME_ERROR', message: err.message });
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <div className="w-full h-full relative font-sans overflow-hidden">
      <AnimatePresence>
        {showExportModal && (
          <ExportZipModal
            open={showExportModal}
            onClose={() => setShowExportModal(false)}
            onConfirm={handleExportZip}
            canExport={canExportZip}
          />
        )}
      </AnimatePresence>
      {hasComponent ? (
        viewMode === 'preview' ? (
          <div className="w-full h-full relative bg-white overflow-hidden">
            {/* ── Preview Toolbar — top right: Export ZIP + Edit ── */}

            {/* Orange glowing top line + blur overlay during compile — keeps UI visible */}
            <AnimatePresence>
              {isCompiling && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', inset: 0, zIndex: 10, backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', pointerEvents: 'none' }}
                >
                  {/* Glowing orange line strictly at top edge */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: 'linear-gradient(90deg, transparent 0%, #F95738 20%, #FF8C42 50%, #F95738 80%, transparent 100%)',
                    boxShadow: '0 0 8px 2px rgba(249,87,56,0.7), 0 0 20px 4px rgba(249,87,56,0.35)',
                    borderRadius: 0,
                  }} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Preview Toolbar: Visual Edit only (Export is in top dark bar via ···) ── */}
            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* Visual Edit toggle */}
                <button
                  onClick={() => { setVisualEditMode(v => !v); if (visualEditMode) setSelectedElement(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: visualEditMode ? '#fff' : 'rgba(20,20,20,0.85)',
                    color: visualEditMode ? '#000' : '#ccc',
                    fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)',
                    transition: 'background 150ms, color 150ms',
                  }}>
                  <Pencil style={{ width: 12, height: 12 }} />
                  {visualEditMode ? 'Done' : 'Edit'}
                </button>
              </div>

              {/* ── Toolbar shown when element is selected ── */}
              <AnimatePresence>
                {visualEditMode && selectedElement && (
                  <VisualEditorToolbar
                    selectedElement={selectedElement}
                    onAIEdit={(prompt) => {
                      // Send AI edit request back to parent via message
                      toast.info('AI edit coming soon for individual elements.');
                    }}
                    onContentChange={(val) => {
                      try { iframeRef.current?.contentWindow?.postMessage({ type: 'WOK_UPDATE_CONTENT', text: val }, '*'); } catch {}
                    }}
                    onStyleChange={(prop, val) => {
                      try { iframeRef.current?.contentWindow?.postMessage({ type: 'WOK_UPDATE_STYLE', prop, val }, '*'); } catch {}
                    }}
                    onDelete={() => {
                      try { iframeRef.current?.contentWindow?.postMessage({ type: 'WOK_DELETE_ELEMENT' }, '*'); } catch {}
                      setSelectedElement(null);
                    }}
                    onClose={() => {
                      setVisualEditMode(false);
                      setSelectedElement(null);
                      // Trigger version save
                      if (onUpdateContent && content) onUpdateContent(content);
                      toast.success('Visual edits saved as a new version.');
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            <motion.iframe
              ref={iframeRef}
              key={iframeRefreshKey}
              title="Wok Live Preview"
              srcDoc={srcDoc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeIn' }}
              className="w-full h-full border-none absolute inset-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              style={{ cursor: visualEditMode ? 'crosshair' : 'default' }}
            />

            {/* Visual edit mode border indicator */}
            {visualEditMode && (
              <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(249,87,56,0.5)', borderRadius: 0, pointerEvents: 'none', zIndex: 15 }} />
            )}
          </div>

        ) : viewMode === 'code' ? (
          <CodeEditorPanel code={content} onUpdateContent={onUpdateContent} user={user} />
        ) : (
          <AppDashboard
            settings={appSettings}
            onUpdateSettings={onUpdateSettings}
            onClone={onClone}
            onDelete={onDelete}
            onUnpublish={onUnpublish}
            dashboardTab={dashboardTab}
            setDashboardTab={setDashboardTab}
            content={content}
            onUpdateContent={onUpdateContent}
          />
        )
      ) : (
        /* Empty state */
        <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: '#EFEFEF' }}>
          <img
            src="https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png"
            alt="Wok"
            style={{ width: 40, height: 40, objectFit: 'contain', opacity: 0.2 }}
          />
          <p className="text-sm text-zinc-400 text-center">Your interface will appear here</p>
        </div>
      )}
    </div>
  );
}