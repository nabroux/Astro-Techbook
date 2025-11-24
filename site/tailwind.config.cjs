/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}',
    './public/**/*.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0b1221',
          800: '#0f182d',
          700: '#15213c',
          600: '#1e2c4d'
        },
        accent: {
          500: '#7dd3fc',
          600: '#38bdf8',
          700: '#0ea5e9'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['"Inter"', '"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        glow: '0 10px 50px rgba(14, 165, 233, 0.25)'
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
};
