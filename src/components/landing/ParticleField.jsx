import { useEffect, useRef } from 'react';

// Subtle dark-mode aurora scintillation — ultra-refined particles that drift and react to cursor
export default function ParticleField({ count = 80 }) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener('mousemove', onMove);

    // Aurora color palette — violet, indigo, teal, silver
    const COLORS = [
      'rgba(120,100,255,',
      'rgba(90,90,240,',
      'rgba(60,140,255,',
      'rgba(180,160,255,',
      'rgba(100,220,200,',
      'rgba(220,210,255,',
    ];

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * 1200,
      y: Math.random() * 800,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: 0.5 + Math.random() * 1.5,
      a: 0.1 + Math.random() * 0.35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.004 + Math.random() * 0.008,
    }));

    let t = 0;
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t += 1;

      particles.forEach(p => {
        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        // Mouse repulsion — gentle
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const force = (80 - dist) / 80 * 0.4;
          p.vx += (dx / dist) * force * 0.03;
          p.vy += (dy / dist) * force * 0.03;
        }

        // Speed cap
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0.6) { p.vx *= 0.92; p.vy *= 0.92; }

        // Twinkle
        p.twinklePhase += p.twinkleSpeed;
        const twinkle = 0.6 + 0.4 * Math.sin(p.twinklePhase);
        const alpha = p.a * twinkle;

        // Draw — soft glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grd.addColorStop(0, `${p.color}${alpha.toFixed(2)})`);
        grd.addColorStop(1, `${p.color}0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Hard core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${(alpha * 1.5).toFixed(2)})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'all', zIndex: 0,
      }}
    />
  );
}