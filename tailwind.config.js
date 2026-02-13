
module.exports = {
  theme: {
    extend: {
      animation: {
        'breathing': 'breathing 3s ease-in-out infinite',
      },
      keyframes: {
        breathing: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 30px rgba(239, 68, 68, 0.7)' },
        },
      },
    },
  },
  plugins: [],
}
