import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- LIVE RENDER COMPILER ---
function LivePreviewEngine({ content, appearance }) {
  const [isCompiling, setIsCompiling] = useState(true);
  const [compiledCode, setCompiledCode] = useState({ html: '', css: '', js: '' });

  const isDark = appearance?.theme === 'midnight';
  const FG = isDark ? '#F3F4F6' : '#0A0A0A';
  const BORDER = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  // Parse HTML, CSS, and JS from the AI's markdown payload
  useEffect(() => {
    setIsCompiling(true);

    let html = '';
    let css = '';
    let js = '';

    if (content) {
      const htmlMatch = content.match(/
http://googleusercontent.com/immersive_entry_chip/0
http://googleusercontent.com/immersive_entry_chip/1