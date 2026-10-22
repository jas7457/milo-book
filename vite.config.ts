import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves the site from https://jas7457.github.io/milo-book/
  base: command === 'build' ? '/milo-book/' : '/',
  build: {
    // one ~530 kB (gzip) bundle: three.js + all the art, which is fine for this book
    chunkSizeWarningLimit: 2500,
  },
}))
