/**
 * CODE QUALITY — ZERO ERROR TOLERANCE
 * Pre-flight checks and error prevention utilities
 */
import React from 'react';

// ── Console management (strip logs in production)
export const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) console.log(...args);
  },
  warn: (...args) => {
    if (import.meta.env.DEV) console.warn(...args);
  },
  error: (...args) => {
    if (import.meta.env.DEV) console.error(...args);
  }
};

// ── Safe localStorage wrapper
export const storage = {
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (err) {
      logger.warn('localStorage blocked:', err);
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      logger.warn('localStorage write failed:', err);
      return false;
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      logger.warn('localStorage remove failed:', err);
      return false;
    }
  }
};

// ── Safe DOM element getter with existence check
export const getElement = (selector, required = true) => {
  const element = document.querySelector(selector);
  if (!element && required) {
    logger.error(`Required element not found: ${selector}`);
  }
  return element;
};

// ── Safe async operation wrapper
export const safeAsync = async (operation, fallback = null, context = 'Operation') => {
  try {
    return await operation();
  } catch (err) {
    logger.error(`${context} failed:`, err.message);
    return fallback;
  }
};

// ── IntersectionObserver with fallback
export const observeVisibility = (element, callback, options = {}) => {
  if (!element) return () => {};
  
  if (!('IntersectionObserver' in window)) {
    // Fallback: trigger immediately
    callback({ isIntersecting: true, intersectionRatio: 1 });
    return () => {};
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => callback({
      isIntersecting: entry.isIntersecting,
      intersectionRatio: entry.intersectionRatio
    }));
  }, {
    threshold: options.threshold || 0,
    rootMargin: options.rootMargin || '0px'
  });
  
  observer.observe(element);
  return () => observer.disconnect();
};

// ── Canvas safe drawing context
export const getCanvasContext = (canvasRef) => {
  if (!canvasRef || !canvasRef.current) {
    logger.warn('Canvas reference not available');
    return null;
  }
  
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    logger.warn('Canvas 2D context not supported');
    return null;
  }
  
  return ctx;
};

// ── Responsive breakpoint checker
export const breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1280
};

export const getCurrentBreakpoint = () => {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < breakpoints.tablet) return 'mobile';
  if (width < breakpoints.desktop) return 'tablet';
  return 'desktop';
};

// ── CSS custom property validator
export const validateCSSVars = (requiredVars) => {
  if (typeof window === 'undefined') return true;
  
  const styles = getComputedStyle(document.documentElement);
  const missing = requiredVars.filter(v => !styles.getPropertyValue(v));
  
  if (missing.length > 0) {
    logger.warn('Missing CSS variables:', missing);
    return false;
  }
  
  return true;
};

// ── Event listener safe attachment
export const attachListener = (element, event, handler, options = {}) => {
  if (!element) {
    logger.warn(`Cannot attach ${event} listener: element not found`);
    return () => {};
  }
  
  element.addEventListener(event, handler, {
    capture: options.capture || false,
    passive: options.passive !== false,
    once: options.once || false
  });
  
  return () => element.removeEventListener(event, handler);
};

// ── Network request with timeout and fallback
export const fetchWithTimeout = async (url, options = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    logger.error(`Fetch failed (${url}):`, err.message);
    throw err;
  }
};

// ── Animation frame scheduler
export const scheduleFrame = (callback) => {
  if (typeof requestAnimationFrame === 'undefined') {
    return setTimeout(callback, 16);
  }
  return requestAnimationFrame(callback);
};

// ── Debounce with immediate option
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// ── Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ── Accessibility checker for interactive elements
export const checkAccessibility = (container) => {
  if (!container) return [];
  
  const issues = [];
  const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
  
  interactiveElements.forEach(el => {
    const hasAria = el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby');
    const hasVisibleLabel = el.textContent.trim().length > 0 || el.querySelector('img[alt]');
    
    if (!hasAria && !hasVisibleLabel) {
      issues.push({
        element: el.tagName,
        issue: 'Missing accessible label',
        selector: el.className ? `.${el.className.split(' ')[0]}` : ''
      });
    }
  });
  
  return issues;
};

// ── Pre-flight checklist runner
export const runPreflight = (config = {}) => {
  const checks = {
    variables: config.variables !== false,
    listeners: config.listeners !== false,
    async: config.async !== false,
    css: config.css !== false,
    responsive: config.responsive !== false,
    accessibility: config.accessibility !== false
  };
  
  const results = {
    passed: true,
    warnings: [],
    errors: []
  };
  
  // Check CSS variables
  if (checks.css && typeof window !== 'undefined') {
    const requiredVars = config.requiredCSSVars || [];
    if (!validateCSSVars(requiredVars)) {
      results.warnings.push('Some CSS variables may be missing');
    }
  }
  
  // Check responsive breakpoints
  if (checks.responsive && typeof window !== 'undefined') {
    const bp = getCurrentBreakpoint();
    logger.log(`Current breakpoint: ${bp}`);
  }
  
  // Check accessibility
  if (checks.accessibility && config.container) {
    const issues = checkAccessibility(config.container);
    if (issues.length > 0) {
      results.warnings.push(`${issues.length} accessibility issues found`);
    }
  }
  
  return results;
};

// ── Error boundary helper for React
export const createErrorBoundary = (fallbackComponent) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    
    componentDidCatch(error, errorInfo) {
      logger.error('Error caught by boundary:', error, errorInfo);
    }
    
    render() {
      if (this.state.hasError) {
        return fallbackComponent || React.createElement('div', { 
          className: 'error-fallback p-4 bg-red-50 text-red-900 rounded' 
        }, 'Something went wrong. Please refresh.');
      }
      return this.props.children;
    }
  };
};