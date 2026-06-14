import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { base44 } from '@/api/base44Client';

// Orange logo (specific brand logo, no default)
const ORANGE_LOGO_URL = 'https://media.base44.com/images/public/6a1ef6c99350f042dbba5496/08d712033_image.png';

function WokBadge() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 99999,
      display: 'flex', alignItems: 'center', gap: 0,
      background: '#000000', borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <a
        href="https://wok.so"
        style={{
          display: 'flex', alignItems: 'center',
          padding: '6px 10px',
          textDecoration: 'none',
        }}
      >
        <img
          src={ORANGE_LOGO_URL}
          alt="WOK"
          style={{ height: 16, width: 'auto', objectFit: 'contain', mixBlendMode: 'screen', display: 'block' }}
        />
      </a>
      <button
        onClick={() => setVisible(false)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 24, height: '100%', minHeight: 28,
          background: 'transparent', border: 'none',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
          padding: 0,
        }}
      >
        <svg width="8" height="8" viewBox="0 0 9 9" fill="none">
          <path d="M1 1L8 8M8 1L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

export function PublicLiveEngine({ content }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  let js = '';
  let css = '';

  if (content && typeof content === 'string' && content.trim().length > 0) {
    const bt = '```';
    const jsMatch = content.match(/```(?:jsx?|javascript|react)\n([\s\S]*?)```/i);
    const cssMatch = content.match(/```css\n([\s\S]*?)```/i);

    if (jsMatch) js = jsMatch[1];
    if (cssMatch) css = cssMatch[1];

    // If no fence matched, use raw content directly
    if (!js || js.trim().length === 0) {
      js = content.trim();
    }
    
    // Validate that we have actual code
    if (!js || js.trim().length < 10) {
      console.error('[PublicLiveEngine] Code content too short or empty');
      setError('Invalid code content');
    }

    if (js) {
      // Clean up 'as' aliases in destructuring (e.g., "Tooltip as RechartsTooltip" -> "Tooltip")
      const cleanImportList = (list) => list.replace(/\s+as\s+\w+/g, '');
      
      js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"];?/g, (match, list) => 'const { ' + cleanImportList(list) + ' } = window.lucideReact;');
      js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]recharts['"];?/g, (match, list) => 'const { ' + cleanImportList(list) + ' } = window.Recharts;');
      js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]framer-motion['"];?/g, (match, list) => 'const { ' + cleanImportList(list) + ' } = window.Motion;');
      js = js.replace(/import\s+React.*?from\s+['"]react['"];?/g, '');
      js = js.replace(/import\s+\{\s*([^}]+)\s*\}\s*from\s*['"]react['"];?/g, 'const { $1 } = React;');
      js = js.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
      // Stub @/components/ui/* shadcn elements used in generated code
      // These are no-ops since generated code uses Tailwind + inline styles primarily
      // Track default export name before stripping it
      var defaultExportMatch = js.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
      if (!defaultExportMatch) defaultExportMatch = js.match(/export\s+default\s+([A-Za-z0-9_]+)\s*;/);
      var defaultExportName = defaultExportMatch ? defaultExportMatch[1] : null;

      js = js.replace(/export\s+default\s+function\s+([A-Za-z0-9_]+)/g, 'function $1');
      js = js.replace(/export\s+default\s+[A-Za-z0-9_]+;?\n?/g, '');
      js = js.replace(/export\s+(const|let|var|function)/g, '$1');

      // Re-expose as App if it had a different name
      if (defaultExportName && defaultExportName !== 'App') {
        js += '\nvar App = ' + defaultExportName + ';';
      }
    }
  }

  const usesRecharts = js.includes('Recharts') || js.includes('recharts');

   const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Barlow+Condensed:ital,wght@1,900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    // Configure Tailwind with the same design tokens as the main app
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            inter: ['Inter', 'system-ui', 'sans-serif'],
            sans: ['Inter', 'system-ui', 'sans-serif'],
          },
          colors: {
            primary: { DEFAULT: 'hsl(12,94%,59%)', foreground: '#fff' },
            secondary: { DEFAULT: 'hsl(262,71%,60%)', foreground: '#fff' },
            accent: { DEFAULT: 'hsl(345,82%,51%)', foreground: '#fff' },
            background: 'hsl(36,33%,93%)',
            foreground: 'hsl(0,0%,10%)',
            muted: { DEFAULT: 'hsl(36,20%,88%)', foreground: 'hsl(0,0%,53%)' },
            border: 'hsl(36,15%,83%)',
            coral: '#F95738',
            rose: '#E8184A',
            violet: '#7B4FE0',
            blue: '#3B8BEB',
            cream: '#F5F0E8',
            dark: '#1A1A1A',
          },
          borderRadius: {
            sm: '6px', DEFAULT: '8px', md: '10px', lg: '12px',
            xl: '14px', '2xl': '18px', '3xl': '24px',
          },
        }
      }
    };
  <\/script>
  <script src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.23.10/babel.min.js"><\/script>
  ${usesRecharts ? `<script src="https://cdn.jsdelivr.net/npm/prop-types@15.8.1/prop-types.min.js"><\/script>
   <script src="https://cdn.jsdelivr.net/npm/recharts@2.1.9/umd/Recharts.min.js"><\/script>` : ''}
  <script>
    // Lucide stub — proxy that returns a valid React component for any icon name
    window.lucideReact = new Proxy({}, {
      get: function(_, name) {
        if (typeof name !== 'string' || name === 'then') return undefined;
        return function(props) {
          var p = props || {};
          return React.createElement('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: p.size || 24, height: p.size || 24,
            viewBox: '0 0 24 24', fill: 'none',
            stroke: p.color || 'currentColor',
            strokeWidth: p.strokeWidth || 2,
            strokeLinecap: 'round', strokeLinejoin: 'round',
            className: p.className || '', style: p.style
          }, React.createElement('circle', { cx: 12, cy: 12, r: 9 }));
        };
      }
    });
    window.lucide = window.lucideReact;

    // ── Framer-motion functional stub ──
    // Converts initial/animate/transition props into real CSS transitions via useEffect
    (function() {
      var noop = function() {};
      var motionVal = function(v) {
        var _v = v, _cbs = [];
        return { get: function(){ return _v; }, set: function(n){ _v=n; _cbs.forEach(function(c){c(n);}); }, onChange: function(cb){ _cbs.push(cb); return function(){ _cbs = _cbs.filter(function(c){return c!==cb;}); }; } };
      };

      // Convert framer animate object to CSS transition string
      function buildTransition(transition) {
        if (!transition) return 'all 0.3s ease';
        var dur = (transition.duration != null ? transition.duration : 0.3) + 's';
        var ease = transition.ease
          ? (Array.isArray(transition.ease) ? 'cubic-bezier(' + transition.ease.join(',') + ')' : transition.ease)
          : (transition.type === 'spring' ? 'cubic-bezier(0.34,1.56,0.64,1)' : 'ease');
        var delay = transition.delay ? transition.delay + 's' : '0s';
        return 'all ' + dur + ' ' + ease + ' ' + delay;
      }

      // Merge framer style object into element.style
      function applyStyles(el, styleObj) {
        if (!el || !styleObj) return;
        Object.keys(styleObj).forEach(function(k) {
          try { el.style[k] = styleObj[k]; } catch(e) {}
        });
      }

      // Create a motion component for a given HTML tag
      function createMotionComponent(tag) {
        return React.forwardRef(function MotionEl(props, ref) {
          var elRef = React.useRef(null);
          var combinedRef = ref || elRef;

          var initial = props.initial;
          var animate = props.animate;
          var transition = props.transition;
          var whileHover = props.whileHover;
          var whileTap = props.whileTap;

          // Apply initial styles synchronously before paint
          var initialStyle = (initial && typeof initial === 'object') ? initial : {};
          var animateStyle = (animate && typeof animate === 'object') ? animate : {};

          React.useLayoutEffect(function() {
            var el = (typeof combinedRef === 'object' && combinedRef) ? combinedRef.current : null;
            if (!el) return;
            // Set initial state immediately (no transition)
            el.style.transition = 'none';
            applyStyles(el, initialStyle);
            // Trigger animate on next frame so CSS transition fires
            var raf = requestAnimationFrame(function() {
              el.style.transition = buildTransition(transition);
              applyStyles(el, animateStyle);
            });
            return function() { cancelAnimationFrame(raf); };
          }, []);

          // Re-animate when animate prop changes
          React.useEffect(function() {
            var el = (typeof combinedRef === 'object' && combinedRef) ? combinedRef.current : null;
            if (!el || !animate || typeof animate !== 'object') return;
            el.style.transition = buildTransition(transition);
            applyStyles(el, animate);
          }, [JSON.stringify(animate)]);

          // Build clean props (strip framer-only ones)
          var clean = {};
          var SKIP = {initial:1,animate:1,exit:1,transition:1,variants:1,whileHover:1,whileTap:1,whileFocus:1,whileInView:1,whileDrag:1,drag:1,layout:1,layoutId:1,onAnimationStart:1,onAnimationComplete:1,onUpdate:1};
          Object.keys(props).forEach(function(k){ if (!SKIP[k]) clean[k] = props[k]; });

          // Merge initial style so element starts at initial state before JS runs
          if (Object.keys(initialStyle).length > 0) {
            clean.style = Object.assign({}, initialStyle, clean.style || {});
          }

          // Wire hover/tap
          if (whileHover) {
            var origEnter = clean.onMouseEnter;
            var origLeave = clean.onMouseLeave;
            clean.onMouseEnter = function(e) {
              var el = e.currentTarget;
              el.style.transition = buildTransition(transition);
              applyStyles(el, whileHover);
              if (origEnter) origEnter(e);
            };
            clean.onMouseLeave = function(e) {
              var el = e.currentTarget;
              el.style.transition = buildTransition(transition);
              applyStyles(el, animateStyle);
              if (origLeave) origLeave(e);
            };
          }
          if (whileTap) {
            var origDown = clean.onMouseDown;
            var origUp = clean.onMouseUp;
            clean.onMouseDown = function(e) {
              var el = e.currentTarget;
              el.style.transition = 'all 0.1s ease';
              applyStyles(el, whileTap);
              if (origDown) origDown(e);
            };
            clean.onMouseUp = function(e) {
              var el = e.currentTarget;
              el.style.transition = buildTransition(transition);
              applyStyles(el, animateStyle);
              if (origUp) origUp(e);
            };
          }

          clean.ref = combinedRef;
          return React.createElement(tag, clean);
        });
      }

      // ── Resolve variant name to style object ──
      function resolveVariant(variants, name, props) {
        if (!variants || !name || typeof name !== 'string') return null;
        var v = variants[name];
        if (typeof v === 'function') v = v(props || {});
        return (v && typeof v === 'object') ? v : null;
      }

      // ── Enhanced motion component: handles whileInView, variants, string initial/animate ──
      function createMotionComponent2(tag) {
        return React.forwardRef(function MotionEl(props, ref) {
          var elRef = React.useRef(null);
          var combinedRef = ref || elRef;
          var inViewRef = React.useRef(false);

          var variants = props.variants;
          var initialProp = props.initial;
          var animateProp = props.animate;
          var whileInViewProp = props.whileInView;
          var viewportProp = props.viewport || {};
          var transition = props.transition;
          var whileHover = props.whileHover;
          var whileTap = props.whileTap;

          // Resolve initial style
          var initialStyle = {};
          if (initialProp && typeof initialProp === 'object') initialStyle = initialProp;
          else if (typeof initialProp === 'string' && variants) initialStyle = resolveVariant(variants, initialProp, props) || {};

          // Resolve animate style
          var animateStyle = {};
          if (animateProp && typeof animateProp === 'object') animateStyle = animateProp;
          else if (typeof animateProp === 'string' && variants) animateStyle = resolveVariant(variants, animateProp, props) || {};

          // Resolve whileInView style
          var inViewStyle = {};
          if (whileInViewProp && typeof whileInViewProp === 'object') inViewStyle = whileInViewProp;
          else if (typeof whileInViewProp === 'string' && variants) inViewStyle = resolveVariant(variants, whileInViewProp, props) || {};

          // If whileInView is set, target style is inViewStyle; otherwise animateStyle
          var targetStyle = (whileInViewProp != null) ? inViewStyle : animateStyle;

          React.useLayoutEffect(function() {
            var el = (typeof combinedRef === 'object' && combinedRef) ? combinedRef.current : null;
            if (!el) return;
            el.style.transition = 'none';
            applyStyles(el, initialStyle);
            // If no whileInView, animate immediately
            if (whileInViewProp == null) {
              var raf = requestAnimationFrame(function() {
                el.style.transition = buildTransition(transition);
                applyStyles(el, targetStyle);
              });
              return function() { cancelAnimationFrame(raf); };
            }
          }, []);

          // IntersectionObserver for whileInView
          React.useEffect(function() {
            if (whileInViewProp == null) return;
            var el = (typeof combinedRef === 'object' && combinedRef) ? combinedRef.current : null;
            if (!el) return;
            var once = viewportProp.once !== false; // default true
            var observer = new IntersectionObserver(function(entries) {
              entries.forEach(function(entry) {
                if (entry.isIntersecting && !inViewRef.current) {
                  inViewRef.current = true;
                  el.style.transition = buildTransition(transition);
                  applyStyles(el, inViewStyle);
                  if (once) observer.unobserve(el);
                } else if (!entry.isIntersecting && !once) {
                  inViewRef.current = false;
                  el.style.transition = buildTransition(transition);
                  applyStyles(el, initialStyle);
                }
              });
            }, { threshold: 0.1, rootMargin: viewportProp.margin || '0px' });
            observer.observe(el);
            return function() { observer.unobserve(el); };
          }, []);

          // Re-animate when animate prop changes (string variant changes)
          React.useEffect(function() {
            if (whileInViewProp != null) return; // managed by observer
            var el = (typeof combinedRef === 'object' && combinedRef) ? combinedRef.current : null;
            if (!el) return;
            var resolved = {};
            if (animateProp && typeof animateProp === 'object') resolved = animateProp;
            else if (typeof animateProp === 'string' && variants) resolved = resolveVariant(variants, animateProp, props) || {};
            if (Object.keys(resolved).length > 0) {
              el.style.transition = buildTransition(transition);
              applyStyles(el, resolved);
            }
          }, [JSON.stringify(animateProp)]);

          // Build clean props
          var clean = {};
          var SKIP = {initial:1,animate:1,exit:1,transition:1,variants:1,whileHover:1,whileTap:1,whileFocus:1,whileInView:1,whileDrag:1,drag:1,layout:1,layoutId:1,viewport:1,onAnimationStart:1,onAnimationComplete:1,onUpdate:1};
          Object.keys(props).forEach(function(k){ if (!SKIP[k]) clean[k] = props[k]; });

          // Start at initial style
          if (Object.keys(initialStyle).length > 0) {
            clean.style = Object.assign({}, initialStyle, clean.style || {});
          }

          if (whileHover) {
            var origEnter = clean.onMouseEnter, origLeave = clean.onMouseLeave;
            var resolvedHover = (typeof whileHover === 'object') ? whileHover : (resolveVariant(variants, whileHover, props) || {});
            clean.onMouseEnter = function(e) {
              e.currentTarget.style.transition = buildTransition(transition);
              applyStyles(e.currentTarget, resolvedHover);
              if (origEnter) origEnter(e);
            };
            clean.onMouseLeave = function(e) {
              e.currentTarget.style.transition = buildTransition(transition);
              applyStyles(e.currentTarget, targetStyle);
              if (origLeave) origLeave(e);
            };
          }
          if (whileTap) {
            var origDown = clean.onMouseDown, origUp = clean.onMouseUp;
            var resolvedTap = (typeof whileTap === 'object') ? whileTap : (resolveVariant(variants, whileTap, props) || {});
            clean.onMouseDown = function(e) {
              e.currentTarget.style.transition = 'all 0.1s ease';
              applyStyles(e.currentTarget, resolvedTap);
              if (origDown) origDown(e);
            };
            clean.onMouseUp = function(e) {
              e.currentTarget.style.transition = buildTransition(transition);
              applyStyles(e.currentTarget, targetStyle);
              if (origUp) origUp(e);
            };
          }

          clean.ref = combinedRef;
          return React.createElement(tag, clean);
        });
      }

      var _cache2 = {};
      function getMotion2(tag) {
        if (!_cache2[tag]) _cache2[tag] = createMotionComponent2(tag);
        return _cache2[tag];
      }
      var motionProxy2 = new Proxy({}, {
        get: function(_, tag) {
          if (typeof tag !== 'string' || tag === 'then') return undefined;
          return getMotion2(tag);
        }
      });

      window.Motion = {
        motion: motionProxy2,
        m: motionProxy2,
        AnimatePresence: function(props) {
          // Render children directly — exit animations handled via CSS transitions on motion elements
          var children = props ? props.children : null;
          if (!children) return null;
          var arr = Array.isArray(children) ? children.filter(Boolean) : [children];
          if (arr.length === 0) return null;
          if (arr.length === 1) return arr[0];
          return React.createElement(React.Fragment, null, arr);
        },
        useAnimation: function() {
          var _s = {};
          return { start: function(s){ _s = s; }, stop: noop, set: noop };
        },
        useAnimate: function() { return [React.useRef(null), noop]; },
        useInView: function(ref, opts) {
          var inView = React.useState(false);
          React.useEffect(function() {
            var el = ref && ref.current;
            if (!el) { inView[1](true); return; }
            var obs = new IntersectionObserver(function(entries) {
              entries.forEach(function(e) { if (e.isIntersecting) { inView[1](true); if (opts && opts.once !== false) obs.unobserve(el); } });
            }, { threshold: 0.1 });
            obs.observe(el);
            return function() { obs.unobserve(el); };
          }, []);
          return inView[0];
        },
        useMotionValue: motionVal,
        useSpring: motionVal,
        useTransform: function(v, i, o) { return motionVal(Array.isArray(o) ? o[0] : 0); },
        useScroll: function() { return { scrollY: motionVal(0), scrollX: motionVal(0), scrollYProgress: motionVal(0) }; },
        useCycle: function() { var args = Array.prototype.slice.call(arguments); var idx=0; var setter=function(){ idx=(idx+1)%args.length; }; return [args[0], setter]; },
        useReducedMotion: function() { return false; },
        animate: noop,
      };
    })();
  <\/script>
  <style>
    :root {
      --font-inter: 'Inter', system-ui, sans-serif;
      --background: 36 33% 93%;
      --foreground: 0 0% 10%;
      --card: 36 33% 97%;
      --card-foreground: 0 0% 10%;
      --popover: 0 0% 100%;
      --popover-foreground: 0 0% 10%;
      --primary: 12 94% 59%;
      --primary-foreground: 0 0% 100%;
      --secondary: 262 71% 60%;
      --secondary-foreground: 0 0% 100%;
      --muted: 36 20% 88%;
      --muted-foreground: 0 0% 53%;
      --accent: 345 82% 51%;
      --accent-foreground: 0 0% 100%;
      --destructive: 345 82% 51%;
      --destructive-foreground: 0 0% 100%;
      --border: 36 15% 83%;
      --input: 36 15% 83%;
      --ring: 12 94% 59%;
      --radius: 0.75rem;
      --sidebar-background: 0 0% 10%;
      --sidebar-foreground: 0 0% 90%;
      --sidebar-primary: 12 94% 59%;
      --sidebar-primary-foreground: 0 0% 100%;
      --sidebar-accent: 0 0% 16%;
      --sidebar-accent-foreground: 0 0% 95%;
      --sidebar-border: 0 0% 20%;
      --sidebar-ring: 12 94% 59%;
      --support: 213 80% 57%;
      --support-foreground: 0 0% 100%;
    }
    * { box-sizing: border-box; scrollbar-width: none; -ms-overflow-style: none; }
    *::-webkit-scrollbar { display: none; }
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    h1,h2,h3,h4,h5,h6 { font-weight: 700; letter-spacing: -0.02em; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
    @keyframes bounce { 0%,100% { transform:translateY(-25%); animation-timing-function:cubic-bezier(.8,0,1,1); } 50% { transform:translateY(0); animation-timing-function:cubic-bezier(0,0,.2,1); } }
    @keyframes ping { 75%,100% { transform:scale(2); opacity:0; } }
    @keyframes fade-in { from { opacity:0; } to { opacity:1; } }
    @keyframes slide-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    ${css}
  </style>
</head>
<body>
  <div id="root" style="width:100%;height:100%"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext, Component, forwardRef, Fragment, Children, cloneElement } = React;
    const { motion, AnimatePresence, useAnimation, useAnimate, useInView, useMotionValue, useSpring, useTransform, useScroll, useCycle, useReducedMotion, m } = window.Motion;
    const Recharts = window.Recharts || {};
    // Stub for common utilities used in generated code
    const cn = (...args) => args.filter(Boolean).join(' ');
    const clsx = cn;
    // date-fns stubs
    const format = (d, fmt) => { try { return new Date(d).toLocaleDateString(); } catch { return ''; } };
    const formatDate = format;
    const parseISO = (s) => new Date(s);
    const addDays = (d, n) => { var r = new Date(d); r.setDate(r.getDate()+n); return r; };
    const subDays = (d, n) => addDays(d, -n);
    const isValid = (d) => d instanceof Date && !isNaN(d);
    // Expose ALL Recharts components as individual variables in scope
    const { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
      RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
      ScatterChart, Scatter, ComposedChart,
      XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer,
      RadialBarChart, RadialBar, Treemap, FunnelChart, Funnel,
      Tooltip: RechartsTooltip, Tooltip: RechartTooltip,
      Reference, ReferenceLine, ReferenceArea,
    } = Recharts;

    class ErrorBoundary extends Component {
      constructor(p) { super(p); this.state = { err: null }; }
      static getDerivedStateFromError(e) { return { err: e }; }
      render() {
        if (this.state.err) return React.createElement('div', {
          style: { color:'#991b1b', padding:24, fontFamily:'monospace', fontSize:13,
            background:'#fee2e2', borderLeft:'4px solid #f87171', margin:20, borderRadius:4 }
        }, React.createElement('strong', null, 'Error: '), this.state.err.message);
        return this.props.children;
      }
    }

    try {
      ${js.replace(/<\/script>/gi, '<\\/script>')}
      var rootComponent = typeof App !== 'undefined' ? App
        : typeof default_export !== 'undefined' ? default_export
        : null;
      if (rootComponent) {
        ReactDOM.createRoot(document.getElementById('root')).render(
          React.createElement(ErrorBoundary, null, React.createElement(rootComponent))
        );
      } else {
        document.getElementById('root').innerHTML =
          '<div style="padding:40px;font-family:system-ui;color:#666;text-align:center"><p style="font-size:15px">No App component found.<br/>Make sure your code exports a default <strong>App</strong> function.</p></div>';
      }
    } catch(e) {
      document.getElementById('root').innerHTML =
        '<div style="color:#991b1b;padding:24px;font-family:monospace;font-size:13px;background:#fee2e2;border-left:4px solid #f87171;margin:20px;border-radius:4px"><strong>Runtime Error:</strong><br/>' + e.message + '<br/><br/><pre style="white-space:pre-wrap;font-size:11px;color:#7f1d1d">' + (e.stack || '') + '</pre></div>';
    }
  <\/script>
</body>
</html>`;

  return (
    <div style={{ width: '100%', height: '100vh', background: '#fff', position: 'relative' }}>
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', zIndex: 10 }}>
          <Loader2 style={{ width: 28, height: 28, color: '#ccc', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', zIndex: 20 }}>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 15, color: '#991b1b', fontWeight: 500, marginBottom: 20 }}>⚠️ {error}</p>
            <p style={{ fontSize: 13, color: '#666' }}>The app code is invalid or empty.</p>
          </div>
        </div>
      )}
      <iframe
        title="Wok App"
        srcDoc={srcDoc}
        onLoad={() => { setReady(true); setError(null); }}
        onError={() => { setError('iframe load error'); }}
        style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0 }}
        sandbox="allow-scripts allow-forms allow-popups"
      />
    </div>
  );
}

function useDynamicSEO(title, description) {
  useEffect(() => {
    if (!title) return;
    // Title
    document.title = `${title} — Built with WOK`;
    // Description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', description || `${title} — an app built with WOK AI.`);
    // OG tags
    const setOG = (prop, val) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
      el.setAttribute('content', val);
    };
    setOG('og:title', `${title} — Built with WOK`);
    setOG('og:description', description || `${title} — an app built with WOK AI.`);
    setOG('og:type', 'website');
    setOG('og:url', window.location.href);
    return () => { document.title = 'WOK'; };
  }, [title, description]);
}

export default function PublicFiche() {
  const { id } = useParams();
  const conversationId = id?.split('--')[0];

  const [content, setContent] = useState(null);
  const [appTitle, setAppTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useDynamicSEO(appTitle, appTitle ? `${appTitle} — an interactive app built with WOK AI.` : '');

  useEffect(() => {
    if (!conversationId) { setNotFound(true); setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      try {
        // Query without client-side is_public filter (RLS handles it)
        const results = await base44.entities.Conversation.filter({ conv_id: conversationId });

        if (!results || results.length === 0) {
          setNotFound(true);
          return;
        }

        const record = results[0];

        if (!record.is_public) {
          setNotFound(true);
          return;
        }

        if (record.title) setAppTitle(record.title);

        // Try direct content first, then fetch from URL if needed
        let content = record.raw_content;
        if (!content && record.raw_content_url) {
          try {
            const res = await fetch(record.raw_content_url);
            content = await res.text();
          } catch (e) {
            console.error('Failed to fetch content from URL:', e);
            setNotFound(true);
            return;
          }
        }

        if (!content) {
          setNotFound(true);
          return;
        }

        setContent(content);
      } catch (err) {
        console.error('Load error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [conversationId]);

  // Force white background on body for public page
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#fff';
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  // ── Real public link analytics: track visit with IP, platform, user-agent ──
  useEffect(() => {
    if (!conversationId || loading || notFound) return;
    const trackVisit = async () => {
      try {
        // Fetch real IP via ipify
        let ip = 'unknown';
        try {
          const r = await fetch('https://api.ipify.org?format=json');
          const d = await r.json();
          ip = d.ip || 'unknown';
        } catch {}

        const ua = navigator.userAgent || 'unknown';
        const platform = navigator.platform || navigator.userAgentData?.platform || 'unknown';
        const referrer = document.referrer || 'direct';
        const language = navigator.language || 'unknown';

        // Detect device type
        const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua);
        const device = isMobile ? 'mobile' : 'desktop';

        // Detect OS
        let os = 'Unknown';
        if (/Windows/.test(ua)) os = 'Windows';
        else if (/Mac OS X/.test(ua)) os = 'macOS';
        else if (/Linux/.test(ua)) os = 'Linux';
        else if (/Android/.test(ua)) os = 'Android';
        else if (/iPhone|iPad/.test(ua)) os = 'iOS';

        // Persist to AnalyticsEvent entity (track only on public links)
        const event = {
          conv_id: conversationId,
          event_type: 'public_visit',
          ip_address: ip,
          user_agent: ua.slice(0, 300),
          platform: platform,
          os,
          device,
          referrer: referrer.slice(0, 200),
          language,
          page_url: window.location.href,
          timestamp: new Date().toISOString(),
        };
        // Store in localStorage keyed by convId for the Analytics panel
        const key = `wok_analytics_${conversationId}`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(event);
        // Keep last 500 events per conv
        if (existing.length > 500) existing.splice(0, existing.length - 500);
        localStorage.setItem(key, JSON.stringify(existing));

        // Persist to AuditLog entity for server-side durability (not just localStorage)
        base44.entities.AuditLog.create({
          created_by_id: 'public_visitor',
          action: 'export', // closest semantic match for "view"
          resource_type: 'PublicFiche',
          resource_id: conversationId,
          status: 'success',
          metadata: JSON.stringify({ ip, device, os, referrer: referrer.slice(0, 100), ua: ua.slice(0, 150), language }),
        }).catch(() => {});

        // Also track via base44 analytics
        base44.analytics.track({
          eventName: 'public_link_visit',
          properties: { conv_id: conversationId, device, os, referrer: referrer.slice(0, 100), ip: ip.slice(0, 40) },
        });
      } catch {}
    };
    trackVisit();
  }, [conversationId, loading, notFound]);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <Loader2 style={{ width: 28, height: 28, color: '#ccc', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/functions/regeneratePublicApp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      });
      const result = await response.json();
      if (result.success) {
        // Reload page to fetch fresh content
        window.location.reload();
      }
    } catch (err) {
      console.error('Regeneration failed:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (notFound || !content) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ fontSize: 15, color: '#aaa', fontWeight: 500, marginBottom: 20 }}>
            {notFound ? 'This app is not available yet.' : 'Loading...'}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px', borderRadius: 8, background: '#666', color: '#fff',
                border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500
              }}
            >
              Refresh
            </button>
            {notFound && (
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                style={{
                  padding: '10px 20px', borderRadius: 8, background: '#111', color: '#fff',
                  border: 'none', cursor: isRegenerating ? 'not-allowed' : 'pointer',
                  fontSize: 13, fontWeight: 500, opacity: isRegenerating ? 0.6 : 1
                }}
              >
                {isRegenerating ? 'Generating...' : 'Generate Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#fff' }}>
      <PublicLiveEngine content={content} />
      <WokBadge />
    </div>
  );
}