import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages sirve el sitio en /proyecto_ofertas/; en desarrollo queda en /
  base: command === 'build' ? '/proyecto_ofertas/' : '/',
  build: { chunkSizeWarningLimit: 1000 },
  test: { environment: 'node', passWithNoTests: true },
}))
