import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, LayoutTemplate, Settings, ExternalLink, Copy, AlertTriangle, Trash2, LayoutDashboard, Share2, Sparkles, Globe, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const LOGO_URL = 'https://media.base44.com/images/public/69cfdd998908694203adf837/10d8a48da_image.png';

// --- ENTERPRISE DASHBOARD COMPONENT ---
const AppDashboard = ({ settings = {}, onUpdateSettings, onClone, onDelete, onUnpublish, customSlug, onUpdateSlug }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [title, setTitle] = useState(settings.title || 'AI-Powered Interface');
  const [description, setDescription] = useState(settings.description || 'A highly optimized interactive experience built with Wok.');
  
  // App Icon Upload State
  const [appIcon, setAppIcon] = useState(settings.appIcon || null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const iconInputRef = useRef(null);

  // Domains Edit State
  const [tempSlug, setTempSlug] = useState(customSlug);
  const [isEditingDomain, setIsEditingDomain] = useState(false);

  // Danger Zone Confirmation States
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setIsEditingDomain(false);
    setTempSlug(customSlug);
  }, [activeTab, customSlug]);

  const handleSave = () => {
    if (onUpdateSettings) {
      onUpdateSettings({ ...settings, title, description, appIcon });
    }
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAppIcon(file_url);
      if (onUpdateSettings) {
        onUpdateSettings({ ...settings, title, description, appIcon: file_url });
      }
    } catch (err) {
      console.error("Icon upload failed");
    }
    setUploadingIcon(false);
  };

  const handleOpenApp = () => {
    window.open(`https://wok.base44.app/p/${customSlug}`, '_blank');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://wok.base44.app/p/${customSlug}`);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="absolute inset-0 bg-[#F9FAFB] overflow-y-auto font-sans text-slate-900 border-t border-slate-200 flex flex-col md:flex-row">
      {/* Sidebar - Mobile horizontal, Desktop vertical */}
      <div className="w-full md:w-[240px] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-row md:flex-col py-4 md:py-6 px-4 gap-2 overflow-x-auto shrink-0 mt-[56px] md:mt-0">
        <p className="text-[14px] font-bold text-slate-900 mb-2 md:mb-6 px-3 hidden md:block">Dashboard</p>
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <LayoutDashboard className="w-4 h-4" /> Overview
        </button>
        <button 
          onClick={() => setActiveTab('domains')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap ${activeTab === 'domains' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Globe className="w-4 h-4" /> Domains
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Settings className="w-4 h-4" /> Advanced Settings
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-12 w-full max-w-4xl mx-auto md:mt-[56px]">
        
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header Block with App Icon Uploader */}
            <div className="flex flex-col sm:flex-row gap-6 items-start mb-10">
              <div 
                onClick={() => iconInputRef.current?.click()}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 hover:bg-slate-200 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-slate-200 flex-shrink-0 cursor-pointer overflow-hidden relative transition-colors group"
                title="Upload App Icon"
              >
                 {uploadingIcon ? (
                   <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                 ) : appIcon ? (
                   <img src={appIcon} alt="App Icon" className="w-full h-full object-cover" />
                 ) : (
                   <Upload className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
                 )}
                 {appIcon && !uploadingIcon && (
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                   </div>
                 )}
                 <input type="file" accept="image/*" ref={iconInputRef} onChange={handleIconUpload} className="hidden" />
              </div>
              
              <div className="flex-1 flex flex-col gap-3 w-full">
                 <input 
                   type="text" 
                   value={title} 
                   onChange={(e) => setTitle(e.target.value)} 
                   onBlur={handleSave}
                   className="text-2xl sm:text-3xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 py-1 w-full transition-all"
                 />
                 <textarea 
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   onBlur={handleSave}
                   rows={3}
                   className="text-[13px] sm:text-[14px] text-slate-600 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 w-full resize-none leading-relaxed transition-all"
                 />
                 <div className="flex flex-wrap items-center gap-3 mt-2">
                    <button onClick={handleOpenApp} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-slate-50 transition-colors">
                       <ExternalLink className="w-4 h-4" /> Open App
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-slate-50 transition-colors">
                       <Share2 className="w-4 h-4" /> Share
                    </button>
                 </div>
              </div>
            </div>

            {/* SEO Meta Alert */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 flex items-start gap-3 shadow-sm">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] sm:text-[13px] text-blue-800 leading-relaxed">
                <strong>SEO Optimization:</strong> The more precise and keyword-rich the metadata (title and description) of this application, the easier it will be to find and index by search engines.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'domains' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <h2 className="text-2xl font-bold text-slate-900 mb-6">Domain Management</h2>
             
             {/* Built-in Subdomain */}
             <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-6">
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-3 gap-3">
                   <div>
                      <h3 className="text-[15px] font-bold text-slate-900 mb-1">Wok Subdomain</h3>
                      <p className="text-[13px] text-slate-500">Your app is currently published on the following sub-domain.</p>
                   </div>
                   
                   {/* Dynamic Action Buttons */}
                   {isEditingDomain ? (
                     <div className="flex gap-2">
                       <button 
                         onClick={() => { setIsEditingDomain(false); setTempSlug(customSlug); }} 
                         className="px-4 py-1.5 border border-slate-200 rounded-md text-[12px] font-bold text-slate-600 hover:bg-slate-50"
                       >
                         Cancel
                       </button>
                       <button 
                         onClick={() => { onUpdateSlug && onUpdateSlug(tempSlug); setIsEditingDomain(false); }} 
                         className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-[12px] font-bold hover:bg-blue-700 shadow-sm"
                       >
                         Save
                       </button>
                     </div>
                   ) : (
                     <div className="flex gap-2">
                       <button 
                         onClick={handleShare} 
                         className="px-4 py-1.5 border border-slate-200 rounded-md text-[12px] font-bold text-slate-600 hover:bg-slate-50"
                       >
                         Copy
                       </button>
                       <button 
                         onClick={() => setIsEditingDomain(true)} 
                         className="px-4 py-1.5 bg-slate-900 text-white rounded-md text-[12px] font-bold hover:bg-slate-800 shadow-sm"
                       >
                         Edit
                       </button>
                     </div>
                   )}
                </div>
                
                {/* Responsive Input Wrapper (Transition-none for instant snap) */}
                <div className={`flex items-center w-full border ${isEditingDomain ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'} rounded-lg overflow-hidden transition-none`}>
                  {!isEditingDomain && (
                    <div className="bg-slate-50 px-3 py-2.5 border-r border-slate-200 text-[13px] text-slate-500 font-mono select-none hidden sm:block transition-none">
                      https://wok.base44.app/p/
                    </div>
                  )}
                  <input 
                    type="text" 
                    maxLength={30}
                    disabled={!isEditingDomain}
                    value={tempSlug} 
                    onChange={(e) => setTempSlug(e.target.value)} 
                    className="flex-1 px-3 py-2.5 text-[13px] font-mono outline-none bg-white text-slate-900 disabled:text-slate-500 transition-none w-full" 
                  />
                </div>
             </div>

             {/* Custom Domain Placeholder */}
             <div className="bg-slate-50/50 border border-dashed border-slate-300 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                <Globe className="w-10 h-10 text-slate-400 mb-3" />
                <h3 className="text-[15px] font-bold text-slate-900 mb-2">Custom Domains</h3>
                <p className="text-[13px] text-slate-500 max-w-md leading-relaxed">
                  Connecting or purchasing custom top-level domains (like .com or .io) directly through the application is currently under development. Coming soon.
                </p>
             </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
               <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1">Clone Interface</h3>
                  <p className="text-[13px] text-slate-500">Duplicates the code into a new session with a new URL.</p>
               </div>
               <button onClick={onClone} className="px-5 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded-lg shadow-sm hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
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
                 
                 {confirmUnpublish ? (
                   <div className="flex-1 flex gap-2">
                     <button onClick={() => setConfirmUnpublish(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-[13px] font-bold rounded-lg hover:bg-slate-50 transition-colors">
                       Cancel
                     </button>
                     <button onClick={() => { onUnpublish && onUnpublish(); setConfirmUnpublish(false); }} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-[13px] font-bold rounded-lg hover:bg-red-700 shadow-sm transition-colors">
                       Confirm Unpublish
                     </button>
                   </div>
                 ) : (
                   <button onClick={() => setConfirmUnpublish(true)} className="flex-1 px-4 py-2.5 bg-white border border-red-200 text-red-600 text-[13px] font-bold rounded-lg hover:bg-red-50 transition-colors">
                     Unpublish Page
                   </button>
                 )}

                 {confirmDelete ? (
                   <div className="flex-1 flex gap-2">
                     <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-[13px] font-bold rounded-lg hover:bg-slate-50 transition-colors">
                       Cancel
                     </button>
                     <button onClick={() => { onDelete && onDelete(); setConfirmDelete(false); }} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-[13px] font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 shadow-sm transition-colors">
                       <Trash2 className="w-4 h-4" /> Confirm Delete
                     </button>
                   </div>
                 ) : (
                   <button onClick={() => setConfirmDelete(true)} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-[13px] font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 shadow-sm transition-colors">
                     <Trash2 className="w-4 h-4" /> Delete Permanently
                   </button>
                 )}

               </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default function FichePanel({ content = null, onError, onSuccess, isPublic = false, viewMode, appSettings = {}, onUpdateSettings, onClone, onDelete, onUnpublish, customSlug, onUpdateSlug }) {
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

  // STRICT WATERMARK ENFORCEMENT: Never show inside the builder preview. Only show on live public pages if enabled.
  const isPreviewMode = viewMode === 'preview';
  const shouldShowBadge = !isPreviewMode && (appSettings?.showBadge !== false);
  
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
    <div className="w-full h-full relative font-sans flex flex-col pt-[56px]">
      <div className="flex-1 relative w-full h-full">
        {hasComponent ? (
          <>
            <div className={`absolute inset-0 w-full h-full ${viewMode === 'preview' ? 'block' : 'hidden'}`}>
              <AnimatePresence>
                {isCompiling && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md border-t border-slate-200"
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
                className="w-full h-full border-none absolute inset-0 z-0 bg-transparent border-t border-slate-200"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
            
            <div className={`absolute inset-0 w-full h-full ${viewMode === 'dashboard' ? 'block' : 'hidden'}`}>
              <AppDashboard 
                 settings={appSettings} 
                 onUpdateSettings={onUpdateSettings} 
                 onClone={onClone}
                 onDelete={onDelete}
                 onUnpublish={onUnpublish}
                 customSlug={customSlug}
                 onUpdateSlug={onUpdateSlug}
              />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full w-full opacity-30 border-t border-slate-200 bg-white/50">
             <LayoutTemplate className="w-16 h-16 text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
}