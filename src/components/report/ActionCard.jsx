import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import StatusPicker from './StatusPicker';
import { BORDER, CORAL, GREEN, INK, INK2, ORANGE_DEEP, ORANGE_SOFT, CREAM_DEEP, F } from '@/lib/report-constants';

function ActionCard({ item, index, urgency, urgencyColor, onClick, status, onStatusChange, saving, isFree }) {
  const urgencyBg = urgency === 'Urgent' ? CORAL : urgency === 'Cette semaine' ? ORANGE_SOFT : CREAM_DEEP;
  const urgencyFg = urgency === 'Urgent' ? '#fff' : urgency === 'Cette semaine' ? ORANGE_DEEP : INK2;
  const isDone = status === 'done';

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * index }}
      className="lrs-card lrs-action"
      style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8, opacity: isDone ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 500, color: urgencyFg, background: urgencyBg, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>{urgency}</span>
          {isDone && <CheckCircle2 size={12} color={GREEN} />}
          <span style={{ fontSize: 13, fontWeight: 500, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.action_title || item.text || item.label}</span>
        </div>
        <div style={{ fontSize: 12, color: INK2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.impact || item.desc || item.gap || ''}
        </div>
      </div>
      {!isFree && status !== undefined && onStatusChange ? (
        <div style={{ flexShrink: 0, opacity: saving ? 0.5 : 1 }}>
          <StatusPicker value={status} onChange={onStatusChange} />
        </div>
      ) : null}
      <button onClick={onClick} className="lrs-launch"
        style={{ background: 'none', border: 'none', color: CORAL, fontSize: 12, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, fontFamily: F, flexShrink: 0 }}>
        Lancer<ArrowRight size={12} />
      </button>
    </motion.div>
  );
}

export default memo(ActionCard);