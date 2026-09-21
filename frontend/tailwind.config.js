/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Base
        canvas: '#fafafa',
        surface: '#ffffff',
        surfaceHover: '#f5f5f5',
        surfacePressed: '#eeeeee',

        // Text
        ink: '#0f0f0f',
        inkSoft: '#333333',
        muted: '#737373',
        mutedSoft: '#a3a3a3',
        inverse: '#ffffff',

        // Border
        hairline: '#e5e5e5',
        hairlineStrong: '#d4d4d4',

        // Semantic - Income (Green)
        income: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },

        // Semantic - Expense (Red)
        expense: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },

        // Semantic - Credit (Teal)
        credit: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },

        // Semantic - Savings/Planning (Amber/Orange)
        savings: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },

        // Semantic - Transfers (Purple)
        transfer: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },

        // Accent - Primary Action (Deep Blue)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // Focus ring
        focus: '#3b82f6',

        // Brand (Clay-style feature accents)
        brand: {
          pink: '#ff4d8b',
          teal: '#1a3a3a',
          lavender: '#b8a4ed',
          peach: '#ffb084',
          ochre: '#e8b94a',
          mint: '#a4d4c5',
          coral: '#ff6b5a',
        },
      },
      fontSize: {
        'display-xl': ['64px', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['36px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['28px', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '600' }],
        'title-lg': ['22px', { lineHeight: '1.3', letterSpacing: '0', fontWeight: '600' }],
        'title-md': ['18px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'title-sm': ['16px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '500' }],
        'caption-uppercase': ['11px', { lineHeight: '1.4', letterSpacing: '0.08em', fontWeight: '600', textTransform: 'uppercase' }],
        'button': ['14px', { lineHeight: '1', letterSpacing: '0', fontWeight: '600' }],
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        'control': '12px',
        'feature': '24px',
        'pill': '9999px',
        'full': '9999px',
      },
      spacing: {
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 1px rgb(0 0 0 / 0.05)',
        'card': '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 2px 8px -2px rgb(0 0 0 / 0.05)',
        'cardHover': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 8px 24px -4px rgb(0 0 0 / 0.06)',
        'fab': '0 4px 16px -4px rgb(59 130 246 / 0.4), 0 8px 24px -4px rgb(59 130 246 / 0.2)',
        'modal': '0 8px 32px -8px rgb(0 0 0 / 0.12), 0 16px 48px -12px rgb(0 0 0 / 0.08)',
        'dropdown': '0 4px 16px -4px rgb(0 0 0 / 0.1), 0 8px 24px -4px rgb(0 0 0 / 0.06)',
      },
      transitionDuration: {
        'fast': '120ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      maxWidth: {
        'content': '1024px',
        'narrow': '768px',
      },
    },
  },
  plugins: [],
}