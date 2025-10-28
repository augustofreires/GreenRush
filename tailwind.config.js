/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#4a9d4e',
          'green-dark': '#2c5f2d',
          'green-light': '#e8f5e8',
        },
        accent: {
          lime: '#BAF67C',
          gray: '#446084',
        },
      },
    },
  },
  plugins: [],
}
