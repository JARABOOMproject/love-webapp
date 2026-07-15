import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // base = '/' ตอน dev, '/<repo>/' ตอน build บน GitHub Pages (ตั้งผ่าน VITE_BASE)
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: { host: true },
})
