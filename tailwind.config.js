/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Adobe Spectrum-derived neutral scale (dark theme).
        spectrum: {
          900: '#161616', // canvas void
          800: '#1D1D1D', // app chrome
          700: '#232323', // panels
          600: '#2C2C2C', // elevated surfaces
          500: '#333333', // hover
          400: '#3A3A3A', // borders
          300: '#4A4A4A', // strong borders
          200: '#707070', // disabled text
          100: '#B3B3B3', // secondary text
          50:  '#EAEAEA', // primary text
        },
        // Spectrum blue — the single accent.
        accent: {
          DEFAULT: '#1473E6',
          hover: '#0D66D0',
          down: '#095ABA',
          subtle: '#2680EB',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"Source Code Pro"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        // Spectrum elevation
        panel: '0 1px 4px rgba(0,0,0,0.35)',
        float: '0 4px 16px rgba(0,0,0,0.45)',
        modal: '0 8px 32px rgba(0,0,0,0.55)',
      },
    },
  },
  plugins: [],
}
