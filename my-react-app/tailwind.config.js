import tailwindcssRtl from 'tailwindcss-rtl'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#c8922a',
        'primary-dark': '#a0711a',
        'primary-light': '#f0c060',
        background: {
          light: '#faf7f2',
          dark: '#1a170d',
        },
        text: {
          main: '#1a1208',
          secondary: '#8a8060',
        },
      },
      fontFamily: {
        body: ['Noto Sans Arabic', 'Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [tailwindcssRtl],
  darkMode: 'class',
}
