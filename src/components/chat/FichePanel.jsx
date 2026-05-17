import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, LayoutTemplate, Settings, Globe, Copy, AlertTriangle, Trash2, LayoutDashboard, Share2, ExternalLink, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

// --- ENTERPRISE DASHBOARD COMPONENT ---
const AppDashboard = ({ settings = {}, onUpdateSettings, onClone, onDelete, onUnpublish }) => {
  const [title, setTitle] = useState(settings.title || 'AI-Powered Interface');
  const [description, setDescription] = useState(settings.description || 'A highly optimized interactive experience built with Wok.');

  const handleSave = () => {
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, title, description });
    }
  };

  return (
    <div className="absolute inset-0 bg-[#F9FAFB] overflow-y-auto font-sans text-slate-900 border-t border-l border-[#E5E5E5] flex">
      {/* Sidebar */}
      <div className="w-[240px] bg-white border-r border-[#E5E5E5] hidden md:flex flex-col py-6 px-4">
        <p className="text-[14px] font-bold text-slate-900 mb-6 px-3">Dashboard</p>
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-[13px] font-semibold">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-[13px] font-medium transition-colors">
            <Settings className="w-4 h-4" /> Advanced Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12 max-w-4xl">
        
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

        {/* SEO Meta Alert */}
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
              onChange={(e) => onUpdateSettings && onUpdateSettings({...settings, isPublic: e.target.value === 'public'})}
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
                  onClick={() => onUpdateSettings && onUpdateSettings({...settings, showBadge: !settings.showBadge})} 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showBadge ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${settings.showBadge ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
            </div>
          </div>
        </div>

        {/* Clone Section */}
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
    </div>
  );
};

export default function FichePanel({ content = null, appearance, onError, onSuccess, isPublic = false, viewMode, setViewMode, appSettings = {}, onUpdateSettings, onClone, onDelete, onUnpublish }) {
  const [isCompiling, setIsCompiling] = useState(true);
  const [compiledCode, setCompiledCode] = useState({ html: '', css: '', js: '', rawComponent: '' });

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
          // ERROR INJECTION REMOVED. FAIL SILENTLY TO PREVENT UGLY RED SCREENS.
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
              if (this.state.hasError) {
                return null; // SILENT FAIL
              }
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
    // pt-[56px] pushes the content below the absolute WorkspaceHeader to prevent click collisions
    <div className="w-full h-full relative font-sans flex flex-col pt-[56px]">
      
      {/* THE GREY STRUCTURAL BAR */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F9FAFB] border-b border-[#E5E5E5] shrink-0 z-20 shadow-sm relative rounded-tl-xl border-l">
        <div className="flex items-center p-1 bg-white border border-[#E5E5E5] rounded-lg shadow-sm">
          <button 
            onClick={() => setViewMode && setViewMode('preview')} 
            className={`px-5 py-1.5 text-[12px] font-bold rounded-md transition-colors ${viewMode === 'preview' ? 'bg-[#0080ff] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            App Interface
          </button>
          <button 
            onClick={() => setViewMode && setViewMode('dashboard')} 
            className={`px-5 py-1.5 text-[12px] font-bold rounded-md transition-colors ${viewMode === 'dashboard' ? 'bg-[#0080ff] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full">
        {hasComponent ? (
          viewMode === 'preview' ? (
            <>
              <AnimatePresence>
                {isCompiling && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md border-l border-[#E5E5E5]"
                  >
                    <div className="p-4 bg-white rounded-2xl shadow-2xl flex flex-col items-center border border-slate-100">
                       <Loader2 className="w-6 h-6 text-[#0080ff] animate-spin mb-2" />
                       <span className="text-[11px] font-bold text-[#0080ff] uppercase tracking-widest">Building</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <iframe
                title="Wok Live Preview"
                srcDoc={srcDoc}
                className="w-full h-full border-none absolute inset-0 z-0 bg-transparent border-l border-[#E5E5E5]"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </>
          ) : (
            <AppDashboard 
               settings={appSettings} 
               onUpdateSettings={onUpdateSettings} 
               onClone={onClone}
               onDelete={onDelete}
               onUnpublish={onUnpublish}
            />
          )
        ) : (
          <div className="flex items-center justify-center h-full w-full opacity-30 border-l border-t border-[#E5E5E5] rounded-tl-xl bg-white/50">
             <LayoutTemplate className="w-16 h-16 text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
}