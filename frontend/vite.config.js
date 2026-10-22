import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/media': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/django-admin': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/static': { target: 'http://127.0.0.1:8000', changeOrigin: true },
    },
  },
  // Vercel'da '/' (standart). Django ostida (/app/) qurish uchun: VITE_BASE=/app/
  base: process.env.VITE_BASE || '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
