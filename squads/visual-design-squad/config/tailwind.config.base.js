/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    colors: {
      // Brand Colors
      primary: '#2563EB',
      'primary-light': '#3B82F6',
      'primary-dark': '#1D4ED8',
      secondary: '#10B981',
      accent: '#F59E0B',

      // Status Colors
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      info: '#0EA5E9',

      // Neutral Colors
      surface: '#FFFFFF',
      'surface-secondary': '#F9FAFB',
      'surface-tertiary': '#F3F4F6',

      // Text Colors
      'text-primary': '#1F2937',
      'text-secondary': '#6B7280',
      'text-tertiary': '#9CA3AF',

      // Border Colors
      border: '#E5E7EB',
      'border-subtle': '#F3F4F6',

      // Grayscale
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },

      // Transparent
      transparent: 'transparent',
    },

    spacing: {
      0: '0',
      1: '8px',
      2: '16px',
      3: '24px',
      4: '32px',
      5: '40px',
      6: '48px',
      8: '64px',
      12: '96px',
      16: '128px',
    },

    fontSize: {
      // Caption
      xs: ['0.75rem', { lineHeight: '1.4' }],
      // Small
      sm: ['0.875rem', { lineHeight: '1.5' }],
      // Body
      base: ['1rem', { lineHeight: '1.6' }],
      // H3
      lg: ['1.125rem', { lineHeight: '1.5' }],
      // H2
      '2xl': ['1.5rem', { lineHeight: '1.4' }],
      // H1
      '3xl': ['2rem', { lineHeight: '1.3' }],
      '4xl': ['3.5rem', { lineHeight: '1.2' }],
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['Fira Code', 'monospace'],
    },

    borderRadius: {
      none: '0',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      '2xl': '16px',
      full: '9999px',
    },

    boxShadow: {
      none: 'none',
      sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
      md: '0 4px 12px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 30px rgba(0, 0, 0, 0.15)',
      xl: '0 20px 40px rgba(0, 0, 0, 0.2)',
      'elevation-1': '0 2px 4px rgba(0, 0, 0, 0.05)',
      'elevation-2': '0 4px 8px rgba(0, 0, 0, 0.08)',
      'elevation-3': '0 8px 16px rgba(0, 0, 0, 0.12)',
    },

    transitionDuration: {
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
    },

    transitionTimingFunction: {
      'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'ease-in': 'cubic-bezier(0.4, 0, 0.2, 1)',
      'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },

    screens: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },

    extend: {
      // Extend any default values here
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],

  // Important: Use CSS variables for all colors
  safelist: [
    // Add classes that should always be included (if not detected by Tailwind scanning)
  ],
}
