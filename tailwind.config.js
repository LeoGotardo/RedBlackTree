/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        secondary: '#4edea3',
        'on-secondary': '#003824',
        primary: '#adc6ff',
        'primary-container': '#4d8eff',
        tertiary: '#ffb2b7',
        error: '#ffb4ab',
        surface: '#10131a',
        'surface-container-low': '#191b23',
        'surface-container-highest': '#32353c',
        'on-surface': '#e1e2ec',
      },
    },
  },
  plugins: [],
}

