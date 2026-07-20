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
        ink: 'var(--ink)',
      },
      fontFamily: {
        display: ['Mitr', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'],
        hand: ['Sriracha', 'Charmonman', 'cursive'],
      },
      borderRadius: {
        card: '20px',
        xl2: '26px',
      },
      boxShadow: {
        card: 'var(--shadow-2)',
        pop: 'var(--shadow-3)',
        e1: 'var(--shadow-1)',
        e3: 'var(--shadow-3)',
        e4: 'var(--shadow-4)',
      },
      maxWidth: {
        app: '430px',
      },
    },
  },
  plugins: [],
}
