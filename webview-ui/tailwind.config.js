/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cream-bg': '#f6f2ec',
        'panel-bg': '#fcf9f5',
        'pixel-pink': '#ff2a85',
        'pixel-orange': '#ff6347',
        'pixel-cyan': '#00d2ff',
        'pixel-mint': '#5be8b5',
        'pixel-purple': '#9353d3'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Chakra Petch"', '"Space Grotesk"', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif']
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
