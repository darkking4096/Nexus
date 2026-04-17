/** @type {import('tailwindcss').Config} */
import designTokens from '../../outputs/wireframes/story-7.5-onboarding/design-tokens.json' assert { type: 'json' };

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: designTokens.color.primary.value,
        'primary-dark': designTokens.color.primary_dark.value,
        'primary-light': designTokens.color.primary_light.value,
        success: designTokens.color.success.value,
        error: designTokens.color.error.value,
        warning: designTokens.color.warning.value,
        info: designTokens.color.info.value,
        text: {
          primary: designTokens.color.text.primary.value,
          secondary: designTokens.color.text.secondary.value,
          disabled: designTokens.color.text.disabled.value,
        },
        background: {
          primary: designTokens.color.background.primary.value,
          secondary: designTokens.color.background.secondary.value,
          dark: designTokens.color.background.dark.value,
        },
        border: designTokens.color.border.value,
      },
      spacing: {
        xs: designTokens.spacing.xs.value,
        sm: designTokens.spacing.sm.value,
        md: designTokens.spacing.md.value,
        lg: designTokens.spacing.lg.value,
        xl: designTokens.spacing.xl.value,
        '2xl': designTokens.spacing['2xl'].value,
        '3xl': designTokens.spacing['3xl'].value,
      },
      fontSize: {
        xs: [designTokens.typography.scale.xs.size.value, { lineHeight: designTokens.typography.scale.xs.lineHeight.value }],
        sm: [designTokens.typography.scale.sm.size.value, { lineHeight: designTokens.typography.scale.sm.lineHeight.value }],
        base: [designTokens.typography.scale.base.size.value, { lineHeight: designTokens.typography.scale.base.lineHeight.value }],
        lg: [designTokens.typography.scale.lg.size.value, { lineHeight: designTokens.typography.scale.lg.lineHeight.value }],
        xl: [designTokens.typography.scale.xl.size.value, { lineHeight: designTokens.typography.scale.xl.lineHeight.value }],
        '2xl': [designTokens.typography.scale['2xl'].size.value, { lineHeight: designTokens.typography.scale['2xl'].lineHeight.value }],
        '3xl': [designTokens.typography.scale['3xl'].size.value, { lineHeight: designTokens.typography.scale['3xl'].lineHeight.value }],
      },
      fontWeight: {
        regular: designTokens.typography.weight.regular.value,
        medium: designTokens.typography.weight.medium.value,
        semibold: designTokens.typography.weight.semibold.value,
        bold: designTokens.typography.weight.bold.value,
      },
      borderRadius: {
        sm: designTokens.border.radius.sm.value,
        md: designTokens.border.radius.md.value,
        lg: designTokens.border.radius.lg.value,
        xl: designTokens.border.radius.xl.value,
        '2xl': designTokens.border.radius['2xl'].value,
        full: designTokens.border.radius.full.value,
      },
      boxShadow: {
        sm: designTokens.shadow.sm.value,
        md: designTokens.shadow.md.value,
        lg: designTokens.shadow.lg.value,
        xl: designTokens.shadow.xl.value,
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
