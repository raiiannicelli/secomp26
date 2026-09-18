import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './frontend/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#fcd535',
          active: '#f0b90b',
          disabled: '#3a3a1f',
        },
        ink: '#181a20',
        body: '#eaecef',
        muted: {
          DEFAULT: '#707a8a',
          strong: '#929aa5',
        },
        hairline: {
          dark: '#2b3139',
          light: '#eaecef',
        },
        canvas: {
          dark: '#0b0e11',
          light: '#ffffff',
        },
        surface: {
          card: '#1e2329',
          elevated: '#2b3139',
        },
        trading: {
          up: '#0ecb81',
          down: '#f6465d',
        },
        accent: {
          turquoise: '#2dbdb6',
          purple: '#8a3ffc',
        },
      },
      fontFamily: {
        sans: ['BinanceNova', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['BinancePlex', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        md: '6px',
        xl: '12px',
      },
    },
  },
  plugins: [],
} satisfies Config;
