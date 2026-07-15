/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        blush: 'var(--blush)',
        rose: 'var(--rose)',
        cherry: 'var(--cherry)',
        wine: 'var(--wine)',
        gold: 'var(--gold)',
      },
      fontFamily: {
        display: ['Mitr', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        hand: ['Sriracha', 'Charmonman', 'cursive'],
      },
      borderRadius: {
        card: '20px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(214,46,79,.12)',
        pop: '0 16px 48px rgba(214,46,79,.22)',
      },
      maxWidth: {
        app: '430px',
      },
    },
  },
  plugins: [],
}
