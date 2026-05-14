import { motion } from 'framer-motion';

export default function AssistantMessage({ content, isGenerating }) {
  if (isGenerating) {
    return (
      <div className="flex justify-start w-full mb-6 font-sans">
        <div className="flex items-center gap-1.5 h-6">
          <motion.div className="w-2 h-2 bg-black rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} />
          <motion.div className="w-2 h-2 bg-black rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
          <motion.div className="w-2 h-2 bg-black rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} />
        </div>
      </div>
    );
  }

  const renderFormattedContent = (text) => {
    if (!text) return null;
    let safeText = typeof text === 'string' ? text : JSON.stringify(text);
    return safeText.split(/(\*\*.*?\*\*)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-[#0d0d0d]">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex justify-start w-full mb-6 font-sans">
      <div className="text-[#0d0d0d] text-[15px] leading-relaxed w-full max-w-[95%] whitespace-pre-wrap">
        {renderFormattedContent(content)}
      </div>
    </div>
  );
}