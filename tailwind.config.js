module.exports = {
  theme: {
    extend: {
      colors: {
        brand-green: '#00684A',
        'brand-orange': '#FF5A00',
        brand-background: '#F9F7F4',
        charcoal: '#333333',
        charcoal-darker: '#1c1a19',
        terracotta: '#E2725B',
        light-gray: '#EAEAEB',
        medium-gray: '#8A8A8E',
        charcoal-border: '#4A4A4A',
        alabaster: '#EDEADE',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        dm: ['DM Sans', 'sans-serif'],
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
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}
