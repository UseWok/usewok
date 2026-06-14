/**
 * MorePanel — "More" tab in the chat header
 * Shows: Build Logs (live animated) + Code Editor (editable, plan-gated)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code2, Lock, CheckCircle2, FileCode, AlertCircle } from 'lucide-react';
import { getPlanFeatures } from '@/lib/plans-config';

// ── Build log simulator — reads from localStorage wok_log_* ──
function useBuildLogs(isLoading) {
  const [logs, setLogs] = useState([]);
  const intervalRef = useRef(null);

  // Animated loading log messages
  const LOADING_MSGS = [
    { type: 'info', text: 'Initializing build pipeline…' },
    { type: 'info', text: 'Validating user request…' },
    { type: 'info', text: 'Fetching project context…' },
    { type: 'info', text: 'Routing to AI orchestrator…' },
    { type: 'info', text: 'Generating component architecture…' },
    { type: 'info', text: 'Applying style system (Tailwind + shadcn/ui)…' },
    { type: 'info', text: 'Validating imports…' },
    { type: 'info', text: 'Formatting code…' },
    { type: 'info', text: 'Compiling React component…' },
    { type: 'info', text: 'Injecting runtime sandbox…' },
  ];

  useEffect(() => {
    if (isLoading) {
      setLogs([]);
      let idx = 0;
      intervalRef.current = setInterval(() => {
        if (idx < LOADING_MSGS.length) {
          setLogs(prev => [...prev, { ...LOADING_MSGS[idx], id: Date.now() + idx, ts: new Date().toLocaleTimeString() }]);
          idx++;
        } else {
          clearInterval(intervalRef.current);
        }
      }, 700);
    } else {
      clearInterval(intervalRef.current);
      if (logs.length > 0) {
        setLogs(prev => [...prev, { type: 'success', text: 'Build complete ✓', id: Date.now(), ts: new Date().toLocaleTimeString() }]);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isLoading]);

  return logs;
}

// ── Code editor with plan gate ──
function CodeEditor({ code, onUpdateContent, canEdit }) {
  const [editedCode, setEditedCode] = useState(code || '');
  const [savedCode, setSavedCode] = useState(code || '');
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const LINE_H = 20;

  useEffect(() => {
    setEditedCode(code || '');
    setSavedCode(code || '');
  }, [code]);

  const hasChanges = editedCode !== savedCode;

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSave = () => {
    setSavedCode(editedCode);
    if (onUpdateContent) onUpdateContent(editedCode);
  };

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
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (hasChanges && canEdit) handleSave();
    }
  };

  const lines = editedCode.split('\n');

  const getLineColor = (line) => {
    const t = line.trim();
    if (t.startsWith('import ')) return '#60A5FA';
    if (/^(export|function|const|let|var|class)\s/.test(t)) return '#34D399';
    if (t.startsWith('return') || t === 'return (') return '#FBBF24';
    if (t.startsWith('//') || t.startsWith('/*') || t.startsWith('*')) return '#6B7280';
    return null;
  };

  if (!code) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#555' }}>
        <Code2 style={{ width: 36, height: 36, opacity: 0.3 }} />
        <p style={{ fontSize: 13, color: '#555', margin: 0 }}>No code yet — generate a build first.</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#1A1A1A', borderBottom: '1px solid #2A2A2A', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileCode style={{ width: 13, height: 13, color: '#555' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#888', fontFamily: 'monospace' }}>App.jsx</span>
          {hasChanges && canEdit && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F97316', display: 'inline-block' }} />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!canEdit && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#F97316', fontFamily: 'Inter, sans-serif' }}>
              <Lock style={{ width: 10, height: 10 }} /> Starter+ pour éditer
            </span>
          )}
          <span style={{ fontSize: 11, color: '#444', fontFamily: 'monospace' }}>{lines.length} lignes</span>
        </div>
      </div>

      {/* Editor body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', fontFamily: '"Fira Code", "JetBrains Mono", Menlo, monospace', fontSize: 12, background: '#0F0F0F' }}>
        {/* Line numbers */}
        <div ref={lineNumbersRef} style={{ overflow: 'hidden', flexShrink: 0, background: '#1A1A1A', borderRight: '1px solid #2A2A2A', userSelect: 'none' }}>
          <div style={{ padding: '12px 0' }}>
            {lines.map((line, i) => {
              const color = getLineColor(line);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10, paddingLeft: 8, height: LINE_H, minWidth: 48 }}>
                  {color && <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, marginRight: 6, flexShrink: 0 }} />}
                  <span style={{ fontSize: 11, color: '#3A3A3A', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Textarea */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <textarea
            ref={textareaRef}
            value={editedCode}
            onChange={e => { if (canEdit) setEditedCode(e.target.value); }}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={!canEdit}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              background: 'transparent', color: '#E2E8F0',
              resize: 'none', outline: 'none', border: 'none',
              padding: '12px 14px', overflowY: 'auto',
              fontSize: 12, lineHeight: `${LINE_H}px`,
              fontFamily: '"Fira Code", "JetBrains Mono", Menlo, monospace',
              caretColor: '#F95738',
              cursor: canEdit ? 'text' : 'default',
              boxSizing: 'border-box',
            }}
            spellCheck={false}
          />
          {/* Paywall overlay for read-only */}
          {!canEdit && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 0%, rgba(15,15,15,0.97) 60%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: 32, pointerEvents: 'none',
            }}>
              <div style={{ pointerEvents: 'all', textAlign: 'center' }}>
                <Lock style={{ width: 20, height: 20, color: '#F97316', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 4px', fontFamily: 'Inter, sans-serif' }}>Édition de code réservée aux abonnés</p>
                <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px', fontFamily: 'Inter, sans-serif' }}>Passez à Starter ou supérieur pour modifier le code directement.</p>
                <a href="/pricing" style={{
                  display: 'inline-block', padding: '8px 20px', background: 'linear-gradient(90deg,#F95738,#F97316)',
                  color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: 999, textDecoration: 'none', fontFamily: 'Inter, sans-serif',
                }}>Voir les offres →</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save bar */}
      <AnimatePresence>
        {hasChanges && canEdit && (
          <motion.div
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid #2A2A2A', background: '#1A1A1A' }}>
            <span style={{ fontSize: 11, color: '#888', fontFamily: 'Inter, sans-serif' }}>Modifications non sauvegardées · ⌘S</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEditedCode(savedCode)} style={{ padding: '5px 12px', background: '#2A2A2A', border: 'none', borderRadius: 7, fontSize: 12, color: '#888', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Annuler</button>
              <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', background: '#2563EB', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                <CheckCircle2 style={{ width: 13, height: 13 }} /> Sauvegarder
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Log line component ──
function LogLine({ log, index }) {
  const colors = { info: '#6B7280', success: '#22C55E', warn: '#F59E0B', error: '#EF4444' };
  const color = colors[log.type] || colors.info;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, delay: 0 }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '5px 14px', fontFamily: 'monospace', fontSize: 12 }}
    >
      <span style={{ color: '#333', flexShrink: 0, fontSize: 11, paddingTop: 1 }}>{log.ts}</span>
      {log.type === 'success' ? (
        <CheckCircle2 style={{ width: 12, height: 12, color: '#22C55E', flexShrink: 0, marginTop: 1 }} />
      ) : log.type === 'error' ? (
        <AlertCircle style={{ width: 12, height: 12, color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
      ) : (
        <span style={{ width: 12, height: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block' }} />
        </span>
      )}
      <span style={{ color, lineHeight: '20px' }}>{log.text}</span>
    </motion.div>
  );
}

// ── Main export ──
export default function MorePanel({ ficheContent, onUpdateContent, user, isLoading }) {
  const [tab, setTab] = useState('logs');
  const logs = useBuildLogs(isLoading);
  const logsEndRef = useRef(null);
  const planFeatures = getPlanFeatures(user);
  const canEdit = !!(planFeatures?.file_upload); // Starter+ has file_upload → can edit code

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const TABS = [
    { id: 'logs', icon: Terminal, label: 'Logs' },
    { id: 'code', icon: Code2, label: 'Code' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#111', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '8px 10px', borderBottom: '1px solid #1E1E1E', flexShrink: 0 }}>
        {TABS.map(({ id, icon: TabIcon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', border: 'none', borderRadius: 7, cursor: 'pointer',
              background: tab === id ? '#1E1E1E' : 'transparent',
              color: tab === id ? '#fff' : '#555',
              fontSize: 12, fontWeight: tab === id ? 600 : 400,
              fontFamily: 'Inter, sans-serif', transition: 'all 120ms',
            }}
            onMouseEnter={e => { if (tab !== id) e.currentTarget.style.color = '#888'; }}
            onMouseLeave={e => { if (tab !== id) e.currentTarget.style.color = '#555'; }}
          >
            <TabIcon style={{ width: 13, height: 13 }} />
            {label}
            {id === 'code' && !canEdit && (
              <Lock style={{ width: 10, height: 10, color: '#F97316', marginLeft: 2 }} />
            )}
          </button>
        ))}
        {/* Live indicator */}
        {isLoading && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E', animation: 'pulse 1s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: '#22C55E', fontFamily: 'Inter, sans-serif' }}>Building…</span>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 'logs' ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {logs.length === 0 && !isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, opacity: 0.4 }}>
                <Terminal style={{ width: 28, height: 28, color: '#555' }} />
                <p style={{ fontSize: 12, color: '#555', margin: 0, fontFamily: 'Inter, sans-serif' }}>Les logs apparaîtront lors du prochain build.</p>
              </div>
            )}
            {logs.map((log, i) => <LogLine key={log.id} log={log} index={i} />)}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#F95738', animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
                <style>{`@keyframes dot{0%,80%,100%{opacity:0.2;transform:scale(0.8)}40%{opacity:1;transform:scale(1)}}`}</style>
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        ) : (
          <CodeEditor code={ficheContent} onUpdateContent={onUpdateContent} canEdit={canEdit} />
        )}
      </div>
    </div>
  );
}