/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2F4238',
          'primary-hover': '#3E584B',
          accent: '#A77D5A',
          bg: '#F4F1EA',
          surface: '#FFFCF7',
          secondary: '#E7DED2',
          ink: '#282720',
          muted: '#706B62',
          border: '#E3DACE',
          white: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
};
