import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, LayoutTemplate, Settings, Copy, AlertTriangle, Trash2, LayoutDashboard, Share2, ExternalLink, Sparkles, Code2, FileCode, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

// ─────────────────────────────────────────────
// CODE EDITOR PANEL (DARK THEME - #0F0F0F)
// ─────────────────────────────────────────────
const CodeEditorPanel = ({ code, onUpdateContent }) => {
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

  const hasChanges = editedCode !== savedCode;

  const handleChange = (e) => setEditedCode(e.target.value);

  const handleScroll = useCallback(() => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleSave = () => {
    setSavedCode(editedCode);
    if (onUpdateContent) onUpdateContent(editedCode);
    toast.success('Code saved — preview updated.');
  };

  const handleCancel = () => setEditedCode(savedCode);

  // Tab key inserts spaces instead of moving focus
  const handleKeyDown = (e) => {
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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0F0F0F] rounded-xl border border-[#2A2A2A]">

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
        <span className="ml-auto text-[10px] text-slate-500 font-mono">⌘S / Ctrl+S to save</span>
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
            className="flex-1 bg-[#0F0F0F] text-[#E2E8F0] resize-none outline-none overflow-auto py-4 px-4 text-[13px] leading-none"
            style={{
              lineHeight: `${LINE_H}px`,
              caretColor: '#0055FF',
              tabSize: 2,
              fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", Menlo, monospace',
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
  onUpdateContent,   // ← NEW: called when user saves code edits
}) {
  const [isCompiling, setIsCompiling] = useState(true);
  const [compiledCode, setCompiledCode] = useState({ html: '', css: '', js: '', rawComponent: '' });

  // Sub-tab within dashboard ('overview' | 'code' | 'advanced')
  const [dashboardTab, setDashboardTab] = useState('overview');

  useEffect(() => {
    setIsCompiling(true);
    let html = ''; let css = ''; let js = ''; let rawComponent = '';

    if (content) {
      const btCode = String.fromCharCode(96);
      const btPattern = new RegExp(`${btCode}{3}(?:jsx|javascript|react)?\\n?`, 'gi');
      let componentLogic = content.replace(btPattern, '').replace(new RegExp(`${btCode}{3}`, 'g'), '');

      componentLogic = componentLogic.replace(/export\s+default\s+function/g, 'function');
      componentLogic = componentLogic.replace(/export\s+default\s+class/g, 'class');
      componentLogic = componentLogic.replace(/export\s+default\s+[a-zA-Z0-9_]+;?/g, '');
      componentLogic = componentLogic.replace(/export\s+(const|let|var|function|class)/g, '$1');

      setCompiledCode({ html, css, js: componentLogic, rawComponent: content });
    } else {
      setCompiledCode({ html: '', css: '', js: '', rawComponent: '' });
    }

    const timer = setTimeout(() => setIsCompiling(false), 800);
    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'WOK_RUNTIME_ERROR') {
        if (onError) onError(e.data.message);
      } else if (e.data?.type === 'WOK_RUNTIME_SUCCESS') {
        if (onSuccess) onSuccess();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onError, onSuccess]);

  const hasComponent = compiledCode.html || compiledCode.css || compiledCode.js;

  const shouldShowBadge = appSettings?.showBadge !== false;

  const watermarkHTML = shouldShowBadge ? `
    <div style="position: fixed; bottom: 16px; right: 16px; z-index: 99999; display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); padding: 6px 12px; border-radius: 9999px; border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-decoration: none; color: #000; font-family: system-ui, sans-serif; transition: transform 0.2s ease; cursor: pointer;" onclick="window.open('https://wok.com', '_blank')">
      <span style="font-size: 11px; font-weight: 600; letter-spacing: 0.5px; opacity: 0.5;">BUILT WITH</span>
      <span style="font-size: 13px; font-weight: 900; font-style: italic; letter-spacing: -0.5px;">WOK</span>
    </div>
  ` : '';

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:wght@300;400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
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
          html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; background-color: transparent; -webkit-font-smoothing: antialiased; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        ${watermarkHTML}
        
        <script>
          window.onerror = function(message) {
            window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: message }, '*');
            return true;
          };
        </script>

        <script type="text/babel" data-type="module" data-presets="react">
          import { createRoot } from 'react-dom/client';
          
          ${compiledCode.js}
          
          class ErrorBoundary extends React.Component {
            constructor(props) { super(props); this.state = { hasError: false, errorMessage: '' }; }
            static getDerivedStateFromError(error) { return { hasError: true, errorMessage: error.toString() }; }
            componentDidCatch(error) { window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: error.toString() }, '*'); }
            render() {
              if (this.state.hasError) return null;
              return this.props.children;
            }
          }

          try {
            if (typeof App !== 'undefined') {
              const root = createRoot(document.getElementById('root'));
              root.render(<ErrorBoundary><App /></ErrorBoundary>);
              window.parent.postMessage({ type: 'WOK_RUNTIME_SUCCESS' }, '*');
            } else {
              throw new Error("Component must be named 'App'.");
            }
          } catch(err) {
            window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: err.message }, '*');
          }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="w-full h-full relative font-sans flex flex-col">

      {/* ── Content area (Fills completely, floating effect created by outer wrapper padding) ── */}
      <div className="flex-1 relative w-full h-full overflow-hidden rounded-xl border border-[#2A2A2A] shadow-xl">
        {hasComponent ? (
          viewMode === 'preview' ? (
            <>
              <AnimatePresence>
                {isCompiling && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0F0F0F]/80 backdrop-blur-md"
                  >
                    <div className="p-4 bg-[#1A1A1A] rounded-2xl shadow-2xl flex flex-col items-center border border-[#2A2A2A]">
                      <Loader2 className="w-6 h-6 text-[#0055FF] animate-spin mb-2" />
                      <span className="text-[11px] font-bold text-[#0055FF] uppercase tracking-widest">Building</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="w-full h-full bg-white relative rounded-xl overflow-hidden">
                <iframe
                  title="Wok Live Preview"
                  srcDoc={srcDoc}
                  className="w-full h-full border-none absolute inset-0 z-0 bg-transparent"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </>
          ) : viewMode === 'code' ? (
            <CodeEditorPanel code={content} onUpdateContent={onUpdateContent} />
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
  <div className="w-full h-full bg-[#0F0F0F] flex items-center justify-center p-8">
    <div className="w-full max-w-4xl">
      {/* Header skeleton */}
      <div className="flex flex-col gap-3 mb-8">
        <div
          style={{
            width: '45%',
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
            backgroundSize: '600px 100%',
            animation: 'wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out 0ms both',
          }}
        />
        <div
          style={{
            width: '68%',
            height: 16,
            borderRadius: 6,
            opacity: 0.4,
            background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
            backgroundSize: '600px 100%',
            animation: 'wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out 60ms both',
          }}
        />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 96,
              borderRadius: 14,
              background: 'linear-gradient(90deg, #161616 25%, #1f1f1f 50%, #161616 75%)',
              backgroundSize: '600px 100%',
              animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${100 + i * 60}ms both`,
            }}
          />
        ))}
      </div>

      {/* Large chart skeleton */}
      <div
        style={{
          height: 220,
          borderRadius: 16,
          marginBottom: 32,
          background: 'linear-gradient(90deg, #141414 25%, #1d1d1d 50%, #141414 75%)',
          backgroundSize: '600px 100%',
          animation: 'wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out 280ms both',
        }}
      />

      {/* Text lines skeleton */}
      <div className="flex flex-col gap-3 mb-8">
        {[
          { w: '92%', d: 380 },
          { w: '78%', d: 420 },
          { w: '85%', d: 460 },
          { w: '58%', d: 500, op: 0.4 },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              width: row.w,
              height: 14,
              borderRadius: 6,
              opacity: row.op || 1,
              background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
              backgroundSize: '600px 100%',
              animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${row.d}ms both`,
            }}
          />
        ))}
      </div>

      {/* Bottom two-column skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              height: 140,
              borderRadius: 14,
              background: 'linear-gradient(90deg, #141414 25%, #1d1d1d 50%, #141414 75%)',
              backgroundSize: '600px 100%',
              animation: `wok-shimmer 1.6s ease-out infinite, wok-slide-in 200ms ease-out ${540 + i * 70}ms both`,
            }}
          />
        ))}
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}