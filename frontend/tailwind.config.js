export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        surface: '#1E293B',
        accent: '#3B82F6',
        sky: '#0EA5E9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 4px 24px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}

