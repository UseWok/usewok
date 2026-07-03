import { useEffect, useState } from 'react';

export default function AnimatedScore({ value, size = 17, color = '#F7F2E9' }) {
  const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 0;
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    let start = null;
    const dur = 1200;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisp(Math.round(ease * safeValue));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [safeValue]);
  return <span style={{ fontSize: size, fontWeight: 500, color, lineHeight: 1 }}>{disp}</span>;
}