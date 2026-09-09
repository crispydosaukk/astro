/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Vedic Warm Ivory Palette
        ivory: '#F8F3EA',
        terracotta: {
          DEFAULT: '#713B32',
          light: '#8E4C41',
          dark: '#552B24',
        },
        plum: {
          DEFAULT: '#352433',
          light: '#4A3347',
          dark: '#241822',
        },
        copper: {
          DEFAULT: '#B88A44',
          light: '#D8B66A',
          dark: '#966F33',
        },
        gold: {
          DEFAULT: '#B88A44',
          light: '#D8B66A',
          dark: '#966F33',
        },
        champagne: '#D8B66A',
        highlight: '#D8B66A',
        espresso: '#292522',
        cream: '#FFFDFC',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        sm: 'calc(var(--radius) - 0.25rem)',
        lg: 'calc(var(--radius) + 0.25rem)',
        xl: 'calc(var(--radius) + 0.5rem)',
        '2xl': 'calc(var(--radius) + 1rem)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        md: ['14px', { lineHeight: '20px' }],
      },
      boxShadow: {
        card: '0 1px 3px rgba(41, 37, 34, 0.06), 0 1px 2px rgba(41, 37, 34, 0.04)',
        'card-hover': '0 4px 12px rgba(41, 37, 34, 0.08), 0 2px 4px rgba(41, 37, 34, 0.05)',
        modal: '0 20px 60px rgba(41, 37, 34, 0.15), 0 8px 24px rgba(41, 37, 34, 0.1)',
        'input-focus': '0 0 0 3px rgba(113, 59, 50, 0.1)',
        primary: '0 2px 8px rgba(113, 59, 50, 0.3)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bulkBarSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'fade-in': 'fadeIn 200ms ease forwards',
        'slide-up': 'slideUp 200ms ease forwards',
        'slide-in-right': 'slideInRight 250ms ease forwards',
        'bulk-bar-up': 'bulkBarSlideUp 200ms ease forwards',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};