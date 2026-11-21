/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FFFFFF',
          surface: '#F8F6F2',
          ink: '#171717',
          muted: '#777777',
          accent: '#B89B72',
          border: '#EAEAEA',
        },
      },
    },
  },
  plugins: [],
};
