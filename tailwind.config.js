/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070a0e',
          900: '#0b1017',
          850: '#0f1722',
          800: '#141f2d',
          750: '#1a2839',
          700: '#203247',
          600: '#2c425c',
        },
        wind: {
          50: '#f0f7fa',
          100: '#ddedf4',
          200: '#bfe0eb',
          300: '#8ec9dc',
          400: '#55adc9',
          500: '#288fae',
          600: '#1f7491',
          700: '#17556f',
          800: '#17475c',
          900: '#173c4d',
          950: '#0b2633',
        },
        status: {
          critical: '#ef4444',
          major: '#f59e0b',
          minor: '#10b981',
          overdue: '#f43f5e',
          resolved: '#06b6d4',
          closed: '#64748b',
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Space Grotesk"', '"Sora"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
        'elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
