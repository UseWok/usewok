/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        be:    ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        open:  ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
      },

      /* ── Border radius ── */
      borderRadius: {
        none:    '0px',
        sm:      '6px',
        DEFAULT: '8px',
        md:      '10px',
        lg:      '12px',
        xl:      '14px',
        '2xl':   '18px',
        '3xl':   '24px',
        full:    '9999px',
      },

      /* ── Color tokens ── */
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT:    'hsl(var(--primary))',    /* #F95738 coral */
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',  /* #7B4FE0 violet */
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',     /* #E8184A rose-red */
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border:  'hsl(var(--border))',
        input:   'hsl(var(--input))',
        ring:    'hsl(var(--ring))',
        support: {
          DEFAULT:    'hsl(var(--support))',    /* #3B8BEB blue */
          foreground: 'hsl(var(--support-foreground))',
        },
        sidebar: {
          DEFAULT:              'hsl(var(--sidebar-background))',
          foreground:           'hsl(var(--sidebar-foreground))',
          primary:              'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent:               'hsl(var(--sidebar-accent))',
          'accent-foreground':  'hsl(var(--sidebar-accent-foreground))',
          border:               'hsl(var(--sidebar-border))',
          ring:                 'hsl(var(--sidebar-ring))',
        },
        /* Named palette shortcuts */
        coral:   '#F95738',
        rose:    '#E8184A',
        violet:  '#7B4FE0',
        blue:    '#3B8BEB',
        cream:   '#F5F0E8',
        dark:    '#1A1A1A',
      },

      /* ── Shadows — crisp, no colored glows ── */
      boxShadow: {
        sm:      '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        DEFAULT: '0 2px 6px rgba(0,0,0,0.06)',
        md:      '0 4px 12px rgba(0,0,0,0.08)',
        lg:      '0 8px 24px rgba(0,0,0,0.10)',
        xl:      '0 16px 40px rgba(0,0,0,0.12)',
        none:    'none',
      },

      /* ── Keyframes ── */
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition:  '600px 0' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        shimmer:          'shimmer 1.6s ease-out infinite',
        'slide-in':       'slide-in 150ms ease-out both',
        'fade-in':        'fade-in 150ms ease-out both',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
