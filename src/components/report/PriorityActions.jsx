import { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Zap, Lightbulb } from 'lucide-react';
import StatusPicker from './StatusPicker';
import { F, INK, INK2, INK3, BORDER, CORAL, GREEN, GREEN_SOFT, ORANGE_DEEP, ORANGE_SOFT, CREAM_DEEP, WHITE, CARD_DARK } from '@/lib/report-constants';

function PriorityCard({ item, index, status, onStatusChange, saving, isFree, onClick }) {
  const isDone = status === 'done';
  const priorityLabel = index === 0 ? 'Move #1' : index === 1 ? 'Move #2' : 'Move #3';
  const priorityColor = index === 0 ? CORAL : index === 1 ? ORANGE_DEEP : INK2;
  const priorityBg = index === 0 ? 'rgba(255,90,31,0.12)' : index === 1 ? ORANGE_SOFT : CREAM_DEEP;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index, duration: 0.35 }}
      className="lrs-card lrs-action"
      style={{
        padding: '16px 18px', marginBottom: 10, cursor: 'pointer',
        opacity: isDone ? 0.55 : 1, transition: 'opacity 0.2s',
        borderLeft: `3px solid ${priorityColor}`,
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Priority badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: priorityColor, background: priorityBg, padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {priorityLabel}
            </span>
            {isDone && <CheckCircle2 size={13} color={GREEN} />}
          </div>

          {/* The action — solution oriented */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 8 }}>
            <Zap size={14} color={CORAL} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: INK, lineHeight: 1.4 }}>
              {item.action_title || item.text || item.label}
            </div>
          </div>

          {/* Why it matters — simple explanation */}
          {item.impact || item.gap || item.desc ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, paddingLeft: 1 }}>
              <Lightbulb size={13} color={INK3} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 12.5, color: INK2, lineHeight: 1.5 }}>
                {item.impact || item.gap || item.desc}
              </div>
            </div>
          ) : null}
        </div>

        {/* Status picker + launch */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          {!isFree && status !== undefined && onStatusChange ? (
            <div style={{ opacity: saving ? 0.5 : 1 }} onClick={(e) => e.stopPropagation()}>
              <StatusPicker value={status} onChange={onStatusChange} />
            </div>
          ) : null}
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="lrs-launch"
            style={{
              background: 'none', border: 'none', color: CORAL, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, fontFamily: F,
            }}
          >
            Fix it<ArrowRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PriorityActions({ actions, tasks, onTaskStatus, onActionClick, savingTask, isFree, onUpgrade, doneCount, totalCount }) {
  // Take only top 3
  const top3 = actions.slice(0, 3);

  return (
    <div style={{ fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: INK2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Top 3 moves this week
        </div>
        {totalCount > 0 && (
          <span style={{ fontSize: 11, fontWeight: 600, color: GREEN, background: GREEN_SOFT, padding: '3px 9px', borderRadius: 999 }}>
            {doneCount}/{totalCount} done
          </span>
        )}
      </div>

      {isFree ? (
        <div style={{ position: 'relative' }}>
          <div style={{ filter: 'blur(3px)', pointerEvents: 'none', opacity: 0.4 }}>
            {top3.map((action, i) => (
              <PriorityCard key={action.key} item={action} index={i} onClick={() => {}} />
            ))}
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button onClick={onUpgrade}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 24px', background: CARD_DARK, color: WHITE, border: 'none', borderRadius: 12, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: F, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
              <Zap size={14} color={CORAL} /> Unlock my action plan
            </button>
          </div>
        </div>
      ) : (
        <>
          {top3.map((action, i) => {
            const taskStatus = action.planIndex !== undefined ? (tasks[action.planIndex]?.status || 'todo') : undefined;
            return (
              <PriorityCard
                key={action.key}
                item={action}
                index={i}
                status={taskStatus}
                onStatusChange={(s) => action.planIndex !== undefined && onTaskStatus(action.planIndex, s, action.item)}
                saving={action.planIndex !== undefined ? !!savingTask[action.planIndex] : false}
                isFree={false}
                onClick={() => onActionClick(action)}
              />
            );
          })}
          {actions.length > 3 && (
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <span style={{ fontSize: 12, color: INK3 }}>+{actions.length - 3} more moves in your full plan</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default memo(PriorityActions);