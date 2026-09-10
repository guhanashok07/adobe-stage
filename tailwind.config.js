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
        // Sampled against Premiere Pro: panels sit close together in value and
        // are separated by dark gutters rather than visible borders.
        spectrum: {
          900: '#131313', // gutters between panels, canvas void
          800: '#1B1B1B', // app chrome, toolbars
          700: '#222222', // panel bodies
          600: '#2B2B2B', // panel headers, elevated controls
          500: '#333333', // hover
          400: '#3C3C3C', // hairlines
          300: '#4C4C4C', // strong borders, slider tracks
          200: '#6E6E6E', // disabled text
          100: '#9A9A9A', // secondary text, property labels
          50:  '#D5D5D5', // primary text
        },
        // Spectrum blue — the single accent.
        accent: {
          DEFAULT: '#1473E6',
          hover: '#0D66D0',
          down: '#095ABA',
          subtle: '#2680EB',
          // Adobe renders every editable number as scrubbable blue text.
          value: '#4A9BFF',
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
