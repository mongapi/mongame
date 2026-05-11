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
  // --- AÑADE ESTO ---
  server: {
    host: true,       // Para que Docker lo exponga
    watch: {
      usePolling: true, // <--- LA CLAVE: Obliga a mirar cambios
    }
  }
  // ------------------
})
