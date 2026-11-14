import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0a0e1a',
        surface: '#0d1326',
        card: '#111827',
        'neon-blue': '#00d4ff',
        'neon-blue-secondary': '#0080ff',
        gold: '#ffd700',
        'gold-dark': '#ffaa00',
        rank: {
          E: '#6b7280',
          D: '#22c55e',
          C: '#3b82f6',
          B: '#a855f7',
          A: '#f97316',
          S: '#ffd700',
        },
      },
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        chakra: ['Chakra Petch', 'sans-serif'],
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,212,255,0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(0,212,255,0.8)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-40px)', opacity: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float-up': 'float-up 1s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        typewriter: 'typewriter 2s steps(40) forwards',
      },
      boxShadow: {
        holo: '0 0 20px rgba(0,212,255,0.4)',
        gold: '0 0 20px rgba(255,215,0,0.4)',
      },
    },
  },
  plugins: [],
}

export default config
