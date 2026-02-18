const { TEXT_COLOR, BACKGROUND_COLOR, SKY_ACCENT } = require('./constants');

module.exports = {
  theme: {
    extend: {
      colors: {
        alabaster: BACKGROUND_COLOR,
        charcoal: TEXT_COLOR,
        'charcoal-darker': '#1c1a19',
        'emerald-accent': '#34D399',
        terracotta: '#E2725B',
        'sky-accent': SKY_ACCENT,
        'light-gray': '#EAEAEB',
        'medium-gray': '#8A8A8E',
        'charcoal-border': '',#4A4A4A
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'breathing': 'breathing 3s ease-in-out infinite',
      },
      keyframes: {
        breathing: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(52, 211, 153, 0.4)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 30px rgba(52, 211, 153, 0.7)' },
        },
      },
    },
  },
  plugins: [],
}
