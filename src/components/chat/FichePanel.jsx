import React, { useEffect, useState, useRef } from 'react';
import { Loader2, LayoutTemplate, Settings, ExternalLink, Copy, AlertTriangle, Trash2, LayoutDashboard, Share2, Globe, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const AppDashboard = ({ settings = {}, onUpdateSettings, onClone, onDelete, onUnpublish, customSlug, onUpdateSlug }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [title, setTitle] = useState(settings.title || 'Project #103');
  const [description, setDescription] = useState(settings.description || 'A highly optimized interactive experience built with Wok.');
  
  const [appIcon, setAppIcon] = useState(settings.appIcon || null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const iconInputRef = useRef(null);

  const [tempSlug, setTempSlug] = useState(customSlug);
  const [isEditingDomain, setIsEditingDomain] = useState(false);

  useEffect(() => {
    setIsEditingDomain(false);
    setTempSlug(customSlug);
  }, [activeTab, customSlug]);

  const handleSave = () => {
    if (onUpdateSettings) onUpdateSettings({ ...settings, title, description, appIcon });
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAppIcon(file_url);
      if (onUpdateSettings) onUpdateSettings({ ...settings, title, description, appIcon: file_url });
    } catch (err) {}
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
    <div className="absolute inset-0 bg-[#F9FAFB] overflow-y-auto font-sans text-slate-900 border-t border-slate-200 flex flex-col md:flex-row transition-none">
      <div className="w-full md:w-[240px] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-row md:flex-col py-4 md:py-6 px-4 gap-2 overflow-x-auto shrink-0 mt-[56px] md:mt-0 transition-none">
        <p className="text-[14px] font-bold text-slate-900 mb-2 md:mb-6 px-3 hidden md:block">Dashboard</p>
        <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-none whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-50 text-[#0062FF]' : 'text-slate-500 hover:bg-slate-50'}`}>
          <LayoutDashboard className="w-4 h-4" /> Overview
        </button>
        <button onClick={() => setActiveTab('domains')} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-none whitespace-nowrap ${activeTab === 'domains' ? 'bg-blue-50 text-[#0062FF]' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Globe className="w-4 h-4" /> Domains
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-semibold transition-none whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-50 text-[#0062FF]' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Settings className="w-4 h-4" /> Advanced Settings
        </button>
      </div>

      <div className="flex-1 p-6 md:p-12 w-full max-w-4xl mx-auto md:mt-[56px] transition-none">
        {activeTab === 'overview' && (
          <div className="transition-none">
            <div className="flex flex-col sm:flex-row gap-6 items-start mb-10 transition-none">
              <div 
                onClick={() => iconInputRef.current?.click()}
                className="w-24 h-24 bg-slate-100 hover:bg-slate-200 rounded-3xl flex items-center justify-center border border-slate-200 flex-shrink-0 cursor-pointer overflow-hidden relative group transition-none"
              >
                 {uploadingIcon ? (
                   <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                 ) : appIcon ? (
                   <img src={appIcon} alt="App Icon" className="w-full h-full object-cover transition-none" />
                 ) : (
                   <div className="w-10 h-10 bg-slate-300 rounded-lg flex items-center justify-center transition-none">
                     <LayoutTemplate className="w-5 h-5 text-white" />
                   </div>
                 )}
                 <input type="file" accept="image/*" ref={iconInputRef} onChange={handleIconUpload} className="hidden" />
              </div>
              
              <div className="flex-1 flex flex-col gap-3 w-full transition-none">
                 <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleSave} className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-[#0062FF]/20 rounded-md px-2 py-1 w-full transition-none" />
                 <textarea value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleSave} rows={3} className="text-[14px] text-slate-600 bg-transparent border-none outline-none focus:ring-2 focus:ring-[#0062FF]/20 rounded-md px-2 w-full resize-none leading-relaxed transition-none" />
                 <div className="flex flex-wrap items-center gap-3 mt-2 transition-none">
                    <button onClick={handleOpenApp} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-slate-50 transition-none">
                       <ExternalLink className="w-4 h-4" /> Open App
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-[13px] font-bold shadow-sm hover:bg-slate-50 transition-none">
                       <Share2 className="w-4 h-4" /> Share
                    </button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'domains' && (
          <div className="transition-none">
             <h2 className="text-2xl font-bold text-black mb-6">Domain Management</h2>
             <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-6 transition-none">
                <div className="flex justify-between items-end mb-3 gap-3 transition-none">
                   <div>
                      <h3 className="text-[15px] font-bold text-black mb-1">Wok Subdomain</h3>
                      <p className="text-[13px] text-slate-500">Your app is currently published on the following sub-domain.</p>
                   </div>
                   {isEditingDomain ? (
                     <div className="flex gap-2 transition-none">
                       <button onClick={() => { setIsEditingDomain(false); setTempSlug(customSlug); }} className="px-4 py-1.5 border border-slate-200 rounded-md text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-none">Cancel</button>
                       <button onClick={() => { onUpdateSlug && onUpdateSlug(tempSlug); setIsEditingDomain(false); }} className="px-4 py-1.5 bg-[#0062FF] text-white rounded-md text-[12px] font-bold hover:bg-[#0052CC] transition-none shadow-sm">Save</button>
                     </div>
                   ) : (
                     <button onClick={() => setIsEditingDomain(true)} className="px-4 py-1.5 bg-slate-900 text-white rounded-md text-[12px] font-bold hover:bg-slate-800 transition-none shadow-sm">Edit</button>
                   )}
                </div>
                <div className={`flex items-center w-full border ${isEditingDomain ? 'border-[#0062FF] ring-2 ring-[#0062FF]/20' : 'border-slate-200'} rounded-lg overflow-hidden transition-none`}>
                  {!isEditingDomain && <div className="bg-slate-50 px-3 py-2.5 border-r border-slate-200 text-[13px] text-slate-500 font-mono select-none hidden sm:block transition-none">https://wok.base44.app/p/</div>}
                  <input type="text" maxLength={30} disabled={!isEditingDomain} value={tempSlug} onChange={(e) => setTempSlug(e.target.value)} className="flex-1 px-3 py-2.5 text-[13px] font-mono outline-none bg-white text-black disabled:text-slate-500 w-full transition-none" />
                </div>
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="transition-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 transition-none">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm transition-none">
                <h3 className="text-[15px] font-bold text-slate-900 mb-1">App Visibility</h3>
                <p className="text-[13px] text-slate-500 mb-5">Control who can access your application.</p>
                <select 
                  value={settings.isPublic ? 'public' : 'private'} 
                  onChange={(e) => onUpdateSettings && onUpdateSettings({...settings, isPublic: e.target.value === 'public'})}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#0062FF] appearance-none bg-slate-50 transition-none"
                >
                  <option value="public">🌐 Public (Accessible via URL)</option>
                  <option value="private">🔒 Private (Workspace only)</option>
                </select>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm transition-none">
                <h3 className="text-[15px] font-bold text-slate-900 mb-1">White Label</h3>
                <p className="text-[13px] text-slate-500 mb-5">Show or hide the "Built with WOK" badge.</p>
                <div className="flex items-center justify-between mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100 transition-none">
                   <span className="text-[13px] font-semibold text-slate-700">Platform Badge</span>
                   <button 
                      onClick={() => onUpdateSettings && onUpdateSettings({...settings, showBadge: !settings.showBadge})} 
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-none ${settings.showBadge ? 'bg-[#0062FF]' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-none ${settings.showBadge ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-none">
               <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1">Clone Interface</h3>
                  <p className="text-[13px] text-slate-500">Duplicates the code into a new session with a new URL.</p>
               </div>
               <button onClick={onClone} className="px-5 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded-lg shadow-sm hover:bg-slate-800 flex items-center justify-center gap-2 transition-none whitespace-nowrap">
                 <Copy className="w-4 h-4" /> Clone
               </button>
            </div>

            <div className="border border-red-200 bg-red-50/50 p-6 rounded-2xl transition-none">
               <div className="flex items-center gap-2 mb-4 transition-none">
                 <AlertTriangle className="w-5 h-5 text-red-500" />
                 <h3 className="text-[15px] font-bold text-red-700">Danger Zone</h3>
               </div>
               <div className="flex flex-col md:flex-row gap-4 transition-none">
                 
                 {confirmUnpublish ? (
                   <div className="flex-1 flex gap-2 transition-none">
                     <button onClick={() => setConfirmUnpublish(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-[13px] font-bold rounded-lg hover:bg-slate-50 transition-none">
                       Cancel
                     </button>
                     <button onClick={() => { onUnpublish && onUnpublish(); setConfirmUnpublish(false); }} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-[13px] font-bold rounded-lg hover:bg-red-700 shadow-sm transition-none">
                       Confirm Unpublish
                     </button>
                   </div>
                 ) : (
                   <button onClick={() => setConfirmUnpublish(true)} className="flex-1 px-4 py-2.5 bg-white border border-red-200 text-red-600 text-[13px] font-bold rounded-lg hover:bg-red-50 transition-none">
                     Unpublish Page
                   </button>
                 )}

                 {confirmDelete ? (
                   <div className="flex-1 flex gap-2 transition-none">
                     <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-[13px] font-bold rounded-lg hover:bg-slate-50 transition-none">
                       Cancel
                     </button>
                     <button onClick={() => { onDelete && onDelete(); setConfirmDelete(false); }} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-[13px] font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 shadow-sm transition-none">
                       <Trash2 className="w-4 h-4" /> Confirm Delete
                     </button>
                   </div>
                 ) : (
                   <button onClick={() => setConfirmDelete(true)} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-[13px] font-bold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 shadow-sm transition-none">
                     <Trash2 className="w-4 h-4" /> Delete Permanently
                   </button>
                 )}

               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default function FichePanel({ content = null, onError, onSuccess, viewMode, setViewMode, appSettings = {}, onUpdateSettings, onClone, onDelete, onUnpublish, customSlug, onUpdateSlug }) {
  const [compiledCode, setCompiledCode] = useState({ html: '', css: '', js: '', rawComponent: '' });

  useEffect(() => {
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
  }, [content]);

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'WOK_RUNTIME_ERROR') if (onError) onError(e.data.message);
      else if (e.data?.type === 'WOK_RUNTIME_SUCCESS') if (onSuccess) onSuccess();
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onError, onSuccess]);

  const hasComponent = compiledCode.html || compiledCode.css || compiledCode.js;

  // STRICT WATERMARK RULE: NEVER render the watermark inside the builder preview. 
  const watermarkHTML = '';

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
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
        <style>html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; background-color: transparent; -webkit-font-smoothing: antialiased; }</style>
      </head>
      <body>
        <div id="root"></div>
        ${watermarkHTML}
        
        <script>
          window.onerror = function(message) { window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: message }, '*'); return true; };
        </script>

        <script type="text/babel" data-type="module" data-presets="react">
          import { createRoot } from 'react-dom/client';
          ${compiledCode.js}
          class ErrorBoundary extends React.Component {
            constructor(props) { super(props); this.state = { hasError: false }; }
            static getDerivedStateFromError(error) { return { hasError: true }; }
            componentDidCatch(error) { window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: error.toString() }, '*'); }
            render() { return this.state.hasError ? null : this.props.children; }
          }
          try {
            const root = createRoot(document.getElementById('root'));
            root.render(<ErrorBoundary><App /></ErrorBoundary>);
            window.parent.postMessage({ type: 'WOK_RUNTIME_SUCCESS' }, '*');
          } catch(err) { window.parent.postMessage({ type: 'WOK_RUNTIME_ERROR', message: err.message }, '*'); }
        </script>
      </body>
    </html>
  `;

  return (
    <div className="w-full h-full relative font-sans flex flex-col pt-[56px] transition-none">
      <div className="flex-1 relative w-full h-full transition-none">
        {hasComponent ? (
          <>
            <div className={`absolute inset-0 w-full h-full transition-none ${viewMode === 'preview' ? 'block' : 'hidden'}`}>
              <iframe title="Wok Live Preview" srcDoc={srcDoc} className="w-full h-full border-none absolute inset-0 z-0 bg-transparent border-t border-slate-200 transition-none" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
            </div>
            <div className={`absolute inset-0 w-full h-full transition-none ${viewMode === 'dashboard' ? 'block' : 'hidden'}`}>
              <AppDashboard settings={appSettings} onUpdateSettings={onUpdateSettings} onClone={onClone} onDelete={onDelete} onUnpublish={onUnpublish} customSlug={customSlug} onUpdateSlug={onUpdateSlug} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full w-full opacity-30 border-t border-slate-200 bg-white/50 transition-none">
             <LayoutTemplate className="w-16 h-16 text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
}