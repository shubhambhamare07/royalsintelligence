/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070C18',
          900: '#0B132B',
          800: '#14213D',
          700: '#1D2D50',
          600: '#2A3F6D',
          500: '#3D558B',
          400: '#5C74AB',
          300: '#8FA1CA',
          200: '#C2CEE7',
          100: '#E6EBF5',
          50: '#F4F6FA',
        },
        pink: {
          DEFAULT: '#E6007E',
          hover: '#CC0070',
          active: '#B30062',
          light: '#FF3399',
          subtle: '#FFF0F6',
          border: '#FFD6E7',
        },
        gold: {
          DEFAULT: '#C6A15B',
          light: '#DFBF7A',
          subtle: '#FAF5EA',
          border: '#EEDCB4',
        },
        tier: {
          elite: '#14213D',
          proven: '#0077B6',
          promising: '#00B4D8',
          developing: '#90E0EF',
          fringe: '#94A3B8',
        },
        pressure: {
          normal: '#10B981',
          elevated: '#3B82F6',
          high: '#F59E0B',
          extreme: '#EF4444',
        },
      },
      fontFamily: {
        sans: [
          '"SF Pro Display"',
          '"SF Pro Text"',
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(20, 33, 61, 0.08), 0 8px 10px -6px rgba(20, 33, 61, 0.04)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'drawer': '-10px 0 30px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}

