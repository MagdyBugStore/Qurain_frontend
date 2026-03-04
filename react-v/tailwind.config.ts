import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#e3a582',
        'primary-dark': '#a75525',
        'background-light': '#f5f2f0',
        'background-dark': '#15120e',
        'text-main': '#111312',
        'text-muted': '#778880',
      },
      fontFamily: {
        display: ['Noto Sans Arabic', 'Lexend', 'sans-serif'],
        body: ['Noto Sans Arabic', 'Lexend', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
}
export default config
