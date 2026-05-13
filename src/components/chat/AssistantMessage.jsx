import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// On utilise UserMessageBubble et AssistantMessage dans ce même fichier pour simplifier l'architecture ChatGPT.
export function UserMessageBubble({ msg }) {
  return (
    <div className="flex justify-end w-full mb-6 font-sans">
      <div className="bg-[#F4F4F4] text-[#0d0d0d] text-[15px] leading-relaxed px-4 py-2.5 rounded-2xl max-w-[80%] whitespace-pre-wrap">
        {msg.content}
      </div>
    </div>
  );
}

export default function AssistantMessage({ content, isGenerating }) {
  // Animation simple style ChatGPT (cercle qui clignote)
  if (isGenerating) {
    return (
      <div className="flex justify-start w-full mb-6 font-sans">
        <div className="flex items-center gap-1.5 h-6">
          <motion.div className="w-2 h-2 bg-black rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0 }} />
          <motion.div className="w-2 h-2 bg-black rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} />
          <motion.div className="w-2 h-2 bg-black rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} />
        </div>
      </div>
    );
  }

  const renderFormattedContent = (text) => {
    if (!text) return null;
    let safeText = typeof text === 'string' ? text : JSON.stringify(text);
    return safeText.split(/(\*\*.*?\*\*)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={index} className="font-bold">{part.slice(2, -2)}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex justify-start w-full mb-6 font-sans">
      {/* Pas de bulle, directement sur le fond blanc */}
      <div className="text-[#0d0d0d] text-[15px] leading-relaxed w-full max-w-[95%] whitespace-pre-wrap">
        {renderFormattedContent(content)}
      </div>
    </div>
  );
}