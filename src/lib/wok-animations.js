// ═══════════════════════════════════════════════════════════════
// WOK Animation System — Scroll-linked animations & entrance choreography
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';

// ══ Scroll-linked animation hook with IntersectionObserver ══
export function useScrollAnimation(options = {}) {
  const {
    threshold = [0, 0.3, 0.7, 1.0],
    rootMargin = '0px',
    reverseOnScrollUp = true,
    animationStrength = 1,
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('down');
  const elementRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const currentScrollY = window.scrollY;
          const direction = currentScrollY > lastScrollY.current ? 'down' : 'up';
          lastScrollY.current = currentScrollY;
          setScrollDirection(direction);

          if (entry.isIntersecting) {
            setIsVisible(true);
          } else if (reverseOnScrollUp && scrollDirection === 'up') {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, reverseOnScrollUp, scrollDirection]);

  const animationStyle = {
    transform: isVisible
      ? 'translateY(0) scale(1)'
      : `translateY(${32 * animationStrength}px) scale(${1 - 0.02 * animationStrength})`,
    opacity: isVisible ? 1 : 0,
    transition: `all ${600 * animationStrength}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };

  return { elementRef, isVisible, animationStyle, scrollDirection };
}

// ══ Staggered entrance animation hook ══
export function useStaggeredAnimation(items, delay = 80) {
  const [visibleItems, setVisibleItems] = useState(new Set());

  useEffect(() => {
    const timers = [];
    items.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems((prev) => new Set([...prev, index]));
      }, index * delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [items, delay]);

  const getAnimationStyle = (index) => ({
    opacity: visibleItems.has(index) ? 1 : 0,
    transform: visibleItems.has(index) ? 'translateY(0)' : 'translateY(24px)',
    transition: `all 500ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 80}ms`,
  });

  return { visibleItems, getAnimationStyle };
}

// ══ Count-up animation for numbers ══
export function useCountUp(targetValue, duration = 800, startOnVisible = true) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(!startOnVisible);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !startOnVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const endValue = typeof targetValue === 'number' ? targetValue : 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setCount(Math.floor(eased * endValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, targetValue, duration]);

  return { count, elementRef };
}

// ══ CSS Animation Classes (for Tailwind) ══
export const animationClasses = {
  fadeInUp: 'animate-[wok-fade-in-up_600ms_ease-out_both]',
  fadeInUpDelay1: 'animate-[wok-fade-in-up_600ms_ease-out_80ms_both]',
  fadeInUpDelay2: 'animate-[wok-fade-in-up_600ms_ease-out_160ms_both]',
  fadeInUpDelay3: 'animate-[wok-fade-in-up_600ms_ease-out_240ms_both]',
  countUp: 'animate-[wok-count-up_800ms_ease-out_both]',
  shimmer: 'animate-[wok-shimmer_1.6s_ease-out_infinite]',
};

// ══ Micro-interaction helpers ══
export const microInteractions = {
  // Hover lift effect
  hoverLift: {
    base: 'transition-all duration-300 ease-out',
    hover: 'hover:-translate-y-1 hover:shadow-lg',
  },

  // Cursor-following glow
  cursorGlow: `
    relative overflow-hidden
    before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
    before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700
  `,

  // Click scale effect
  clickScale: 'active:scale-95 transition-transform duration-150',

  // Pulse indicator
  pulse: 'animate-[wok-pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]',
};

// ══ Layout rotation patterns (for variety) ══
export const layoutPatterns = [
  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  'flex flex-col gap-8 max-w-3xl',
  'grid grid-cols-1 lg:grid-cols-3 gap-8',
  'flex flex-col gap-6 relative',
  'grid grid-cols-2 md:grid-cols-4 gap-4',
];

export function getRandomLayout() {
  return layoutPatterns[Math.floor(Math.random() * layoutPatterns.length)];
}