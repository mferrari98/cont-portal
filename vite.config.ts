import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor dependencies
          vendor: ['react', 'react-dom'],
          // Separate UI components library
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-separator', '@radix-ui/react-slot'],
          // Separate Excel processing library (larger dependency)
          excel: ['xlsx'],
          // Separate React Hook Form related
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
    // Increase chunk size warning limit from 500KB to 1MB since we have heavy Excel library
    chunkSizeWarningLimit: 1000,
  },
})
