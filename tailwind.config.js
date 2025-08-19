/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    "./content/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#bde3ff',
          300: '#91d1ff',
          400: '#5ab8ff',
          500: '#279aff',
          600: '#1579e6',
          700: '#115fb8',
          800: '#124f90',
          900: '#143f6e',
        },
        ink: '#0b1020',
      },
      boxShadow: {
        glow: '0 0 40px rgba(39, 154, 255, 0.35)',
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '36px 36px',
      },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
      },
      fontFamily: {
        display: ['ui-sans-serif','system-ui','Inter','Helvetica','Arial'],
        body: ['ui-sans-serif','system-ui','Inter','Helvetica','Arial'],
      }
    },
  },
  plugins: [require('@tailwindcss/typography'),
    
  ],
};