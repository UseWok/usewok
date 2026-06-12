import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Globe, Lock, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { syncToCloud } from '@/lib/chat-storage';

export default function PublishAppModal({
  open, onClose,
  appUrl, isPublished, setIsPublished,
  customSlug, appSettings, onUpdateSettings,
  ficheContent,
}) {
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublic, setIsPublic] = useState(isPublished || appSettings?.isPublic || false);

  useEffect(() => {
    setIsPublic(isPublished || appSettings?.isPublic || false);
  }, [isPublished, appSettings?.isPublic, open]);

  const shareUrl = `${window.location.origin}/p/${customSlug || ''}`;
  const [liveUrl, setLiveUrl] = useState(() => isPublic ? shareUrl : '');

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  const handlePublish = async () => {
    console.log('[PublishAppModal] ficheContent:', ficheContent?.length, 'customSlug:', customSlug);
    
    if (!ficheContent || ficheContent.trim() === '') {
      toast.error('No content to publish. Generate the app first.');
      return;
    }

    setIsPublishing(true);
    try {
      const convId = customSlug;
      console.log('[PublishAppModal] Publishing convId:', convId);
      
      // 1. Check for existing record
      const existing = await base44.entities.Conversation.filter({ conv_id: convId });
      console.log('[PublishAppModal] Existing record:', existing?.length);

      let record;
      if (existing && existing.length > 0) {
        // 2. Update with is_public AND raw_content
        console.log('[PublishAppModal] Updating record:', existing[0].id);
        record = await base44.entities.Conversation.update(existing[0].id, {
          is_public: true,
          raw_content: ficheContent,
        });
      } else {
        // 3. Create if not exists
        console.log('[PublishAppModal] Creating new record');
        record = await base44.entities.Conversation.create({
          conv_id: convId,
          title: appSettings?.title || 'My App',
          raw_content: ficheContent,
          is_public: true,
        });
      }

      // 4. Wait and verify the save was real
      await new Promise(r => setTimeout(r, 800));
      const verify = await base44.entities.Conversation.filter({ conv_id: convId });
      console.log('[PublishAppModal] Verification:', { found: verify?.length, is_public: verify?.[0]?.is_public, has_content: !!verify?.[0]?.raw_content });
      
      if (!verify?.[0]?.is_public || !verify?.[0]?.raw_content) {
        throw new Error('Data not persisted correctly to database');
      }

      setIsPublic(true);
      setIsPublished(true);
      setLiveUrl(shareUrl);
      if (onUpdateSettings) await onUpdateSettings({ ...(appSettings || {}), isPublic: true });
      toast.success('✓ App is live: ' + shareUrl);
    } catch (err) {
      console.error('Publish error:', err);
      toast.error(`Publish failed: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setIsPublishing(true);
    try {
      const newSettings = { ...(appSettings || {}), isPublic: false };
      setIsPublic(false);
      if (onUpdateSettings) await onUpdateSettings(newSettings);
      if (customSlug) {
        const results = await base44.entities.Conversation.filter({ conv_id: customSlug }).catch(() => []);
        if (results.length > 0) {
          await base44.entities.Conversation.update(results[0].id, { is_public: false });
        }
      }
      setIsPublished(false);
      toast.success('App unpublished.');
    } catch {}
    setIsPublishing(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-[99998]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', top: 52, right: 12,
              width: 380,
              background: '#141414',
              border: '1px solid #2A2A2A',
              borderRadius: 16,
              overflow: 'hidden',
              zIndex: 99999,
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 14px', borderBottom: '1px solid #1E1E1E' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: isPublic ? 'rgba(34,197,94,0.15)' : '#1A1A1A', border: `1px solid ${isPublic ? 'rgba(34,197,94,0.3)' : '#2A2A2A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isPublic
                    ? <Globe style={{ width: 13, height: 13, color: '#22C55E' }} />
                    : <Lock style={{ width: 13, height: 13, color: '#555' }} />
                  }
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', display: 'block', lineHeight: 1.2 }}>
                    {isPublic ? 'Published' : 'Publish App'}
                  </span>
                  <span style={{ fontSize: 11, color: '#555', lineHeight: 1.2 }}>
                    {isPublic ? 'Anyone with the link can view' : 'Share your app with anyone'}
                  </span>
                </div>
              </div>
              <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', transition: 'color 120ms' }}
                onMouseEnter={e => e.currentTarget.style.color = '#888'}
                onMouseLeave={e => e.currentTarget.style.color = '#444'}>
                <X style={{ width: 13, height: 13 }} />
              </button>
            </div>

            {/* Live URL row */}
            <div style={{ padding: '16px 18px' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Share link
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0D0D0D', border: `1px solid ${isPublic ? '#2A2A2A' : '#1E1E1E'}`, borderRadius: 9, padding: '9px 10px' }}>
                <LinkIcon style={{ width: 12, height: 12, color: isPublic ? '#555' : '#333', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: liveUrl ? '#888' : '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'ui-monospace, monospace' }}>
                  {liveUrl || 'Publish to generate a live link'}
                </span>
                {liveUrl && (
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => { navigator.clipboard.writeText(liveUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      style={{ width: 26, height: 26, borderRadius: 6, background: copied ? 'rgba(34,197,94,0.15)' : '#1A1A1A', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : '#2A2A2A'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: copied ? '#22C55E' : '#888', transition: 'all 120ms' }}>
                      {copied ? <Check style={{ width: 11, height: 11 }} /> : <Copy style={{ width: 11, height: 11 }} />}
                    </button>
                    <button onClick={() => window.open(liveUrl, '_blank')}
                      style={{ width: 26, height: 26, borderRadius: 6, background: '#1A1A1A', border: '1px solid #2A2A2A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', transition: 'color 120ms' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#888'}>
                      <ExternalLink style={{ width: 11, height: 11 }} />
                    </button>
                  </div>
                )}
              </div>
              {isPublic && (
                <p style={{ fontSize: 11, color: '#3A3A3A', marginTop: 8, lineHeight: 1.5 }}>
                  This link renders your app in full-screen, without the editor. Shareable with anyone.
                </p>
              )}
            </div>

            {/* Separator */}
            <div style={{ height: 1, background: '#1A1A1A', margin: '0 18px' }} />

            {/* Publish / Unpublish CTA */}
            <div style={{ padding: '16px 18px 18px' }}>
              {!isPublic ? (
                <button onClick={handlePublish} disabled={isPublishing}
                  style={{ width: '100%', padding: '11px 0', borderRadius: 9, background: '#fff', color: '#000', border: 'none', cursor: isPublishing ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, opacity: isPublishing ? 0.7 : 1, transition: 'opacity 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <Globe style={{ width: 14, height: 14 }} />
                  {isPublishing ? 'Publishing…' : 'Publish — Make it live'}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 9 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600 }}>Live — Your app is publicly accessible</span>
                  </div>
                  <button onClick={handleUnpublish} disabled={isPublishing}
                    style={{ width: '100%', padding: '9px 0', borderRadius: 9, background: 'transparent', color: '#555', border: '1px solid #2A2A2A', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'color 120ms, border-color 120ms' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#444'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#2A2A2A'; }}>
                    {isPublishing ? 'Updating…' : 'Unpublish'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}