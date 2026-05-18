import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.glb'],
  server: {
    host: true,       // Para que Docker exponga el servicio
    watch: {
      usePolling: true, // Crucial para que detecte cambios en discos exFAT/Windows
    }
  }
})
