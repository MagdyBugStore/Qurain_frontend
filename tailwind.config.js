import tailwindcssRtl from 'tailwindcss-rtl'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f4c430',
          hover: '#e0b320',
        },
        'background-light': '#f7f8fa',
        'background-dark': '#15120e',
        'surface-dark': '#1a1713',
        'border-dark': '#2a2520',
        'text-main': '#111312',
        'text-muted': '#778880',
        text: {
          dark: '#333333',
          light: '#777777',
          muted: '#9ca3af',
        },
        bg: {
          main: '#f7f8fa',
          card: '#ffffff',
        },
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        display: ['Cairo', 'Manrope', 'sans-serif'],
        body: ['Cairo', 'Manrope', 'sans-serif'],
        sans: ['Cairo', 'Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
    },
  },
  plugins: [tailwindcssRtl],
}
