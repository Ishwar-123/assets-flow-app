/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind utility classes
        'bg-app':           'var(--bg-app)',
        'bg-surface':       'var(--bg-surface)',
        'bg-surface-2':     'var(--bg-surface-2)',
        'bg-surface-3':     'var(--bg-surface-3)',
        'bg-sidebar':       'var(--bg-sidebar)',
        'bg-sidebar-item':  'var(--bg-sidebar-item)',
        'bg-sidebar-active':'var(--bg-sidebar-active)',
        'text-primary':     'var(--text-primary)',
        'text-secondary':   'var(--text-secondary)',
        'text-muted':       'var(--text-muted)',
        'text-sidebar':     'var(--text-sidebar)',
        'color-primary':    'var(--color-primary)',
        'color-accent':     'var(--color-accent)',
        'border-default':   'var(--border-default)',
        'color-success':    'var(--color-success)',
        'color-warning':    'var(--color-warning)',
        'color-error':      'var(--color-error)',
        'color-info':       'var(--color-info)',
        // Keep legacy brand/accent for backward compatibility during migration
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          cyan:   '#06b6d4',
          rose:   '#f43f5e',
          teal:   '#14b8a6',
          amber:  '#f59e0b',
          emerald: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs':   ['11px', '16px'],
        'sm':   ['12px', '18px'],
        'base': ['13px', '20px'],
        'md':   ['14px', '22px'],
        'lg':   ['16px', '24px'],
        'xl':   ['18px', '28px'],
        '2xl':  ['22px', '32px'],
        '3xl':  ['28px', '38px'],
      },
      borderRadius: {
        'sm': '0px', 'md': '0px', 'lg': '0px', 'xl': '0px', '2xl': '0px', '3xl': '0px', 'full': '0px', DEFAULT: '0px'
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      }
    }
  },
  plugins: []
}
