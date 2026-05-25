/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)'],
        be:    ['var(--font-be)'],
        open:  ['var(--font-open)'],
      },

      /* ── Border radius — premium rounded scale ── */
      borderRadius: {
        none:  '0px',
        sm:    '6px',
        DEFAULT: '8px',
        md:    '10px',
        lg:    '12px',
        xl:    '14px',
        '2xl': '18px',
        '3xl': '24px',
        full:  '9999px',
      },

      /* ── Color tokens ── */
      colors: {
        /* Brand */
        indigo:  '#6366F1',
        amber:   '#F59E0B',
        'zinc-900': '#18181b',
        'zinc-950': '#09090b',

        /* Semantic tokens → CSS vars */
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
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
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
      },

      /* ── Shadows — soft indigo glow system ── */
      boxShadow: {
        sm:     '0 1px 3px rgba(0,0,0,0.3)',
        DEFAULT:'0 2px 8px rgba(0,0,0,0.4)',
        md:     '0 4px 20px rgba(0,0,0,0.5)',
        lg:     '0 8px 40px rgba(0,0,0,0.6)',
        xl:     '0 20px 60px rgba(0,0,0,0.7)',
        indigo: '0 0 40px rgba(99,102,241,0.08)',
        'indigo-md': '0 0 60px rgba(99,102,241,0.14)',
        'indigo-ring': '0 0 0 1px rgba(99,102,241,0.25)',
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
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
