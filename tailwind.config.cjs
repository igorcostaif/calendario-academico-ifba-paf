/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ifba: {
          50: '#ebf7ef',
          100: '#d7efdf',
          500: '#1f8a3a',
          700: '#16662e'
        }
      }
    },
  },
  plugins: [],
}

