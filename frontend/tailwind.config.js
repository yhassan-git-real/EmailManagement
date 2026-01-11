/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme base colors
        dark: {
          900: '#0a0f1a',  // Deepest background
          800: '#0f1520',  // Main background
          700: '#141928',  // Surface
          600: '#1a1f2e',  // Surface elevated
          500: '#1e2538',  // Card backgrounds
          400: '#252d42',  // Hover states
          300: '#2a3548',  // Borders
          200: '#374151',  // Muted elements
          100: '#4b5563',  // Subtle text
        },
        // Primary accent - Indigo to Violet gradient
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Secondary accent - Cyan
        secondary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Accent gradient colors
        accent: {
          violet: '#8b5cf6',
          purple: '#a855f7',
          fuchsia: '#d946ef',
        },
        // Status colors
        success: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
        // Text colors for dark theme
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.9rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '-0.01em' }],
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-out forwards',
        'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
        'fadeInDown': 'fadeInDown 0.5s ease-out forwards',
        'slideInRight': 'slideInRight 0.5s ease-out forwards',
        'slideInLeft': 'slideInLeft 0.5s ease-out forwards',
        'scaleIn': 'scaleIn 0.3s ease-out forwards',
        'number': 'number 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        number: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.2), 0 0 20px rgba(99, 102, 241, 0.1)' },
          '100%': { boxShadow: '0 0 10px rgba(99, 102, 241, 0.4), 0 0 40px rgba(99, 102, 241, 0.2)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dark-gradient': 'linear-gradient(135deg, #0a0f1a 0%, #1a1f2e 50%, #0f1520 100%)',
        'dark-gradient-subtle': 'linear-gradient(180deg, #0f1520 0%, #141928 100%)',
        'accent-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'accent-gradient-hover': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(30,37,56,0.8) 0%, rgba(20,25,40,0.9) 100%)',
        'glow-gradient': 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        'glow-sm': '0 0 15px rgba(99, 102, 241, 0.3)',
        'glow-md': '0 0 25px rgba(99, 102, 241, 0.4)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.5)',
        'glow-accent': '0 0 20px rgba(139, 92, 246, 0.4)',
        'dark-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
