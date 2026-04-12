import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Lock } from 'lucide-react';
import { ALL_MODES, FG, YUZU } from '@/lib/chat-constants';

const popUp = {
  initial: { opacity: 0, y: 6, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.97 },
  transition: { duration: 0.1 },
};

export default function ChatAtMenu({ open, atMenuRef, agents, filteredAgents, filteredModes, currentAgent, currentMode, userPlan, onSelectAgent, onSelectMode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={atMenuRef}
          {...popUp}
          className="absolute left-4 right-4 bottom-full mb-2 overflow-hidden shadow-xl z-50 bg-white rounded-sm border border-border"
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">@ Agents & Modes</p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => onSelectAgent(agent)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs transition-colors hover:bg-muted"
              >
                <Bot className="w-3.5 h-3.5 flex-shrink-0" style={{ color: currentAgent === agent.id ? FG : '#bbb' }} />
                <span className="font-medium" style={{ color: FG }}>{agent.label}</span>
                {currentAgent === agent.id && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-sm" style={{ background: YUZU, color: FG }}>actif</span>
                )}
              </button>
            ))}
            {ALL_MODES.map(m => {
              const Icon = m.icon;
              const isAllowed = userPlan?.allowed_modes?.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMode(m)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  style={{ opacity: isAllowed ? 1 : 0.5 }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isAllowed ? FG : '#ddd' }} />
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: isAllowed ? '#333' : '#ccc' }}>{m.label}</p>
                    <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                  </div>
                  {!isAllowed && <Lock className="w-3 h-3 flex-shrink-0 text-muted-foreground" />}
                  {currentMode?.id === m.id && (
                    <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-sm" style={{ background: YUZU, color: FG }}>actif</span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}