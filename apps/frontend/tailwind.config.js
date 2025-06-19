/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'in': 'in 0.2s ease-out',
      },
      keyframes: {
        'in': {
          '0%': { 
            opacity: '0',
            transform: 'translate(-50%, -100%) translateY(-16px) scale(0.95)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translate(-50%, -100%) translateY(-16px) scale(1)'
          },
        },
      },
    },
  },
  plugins: [],
}