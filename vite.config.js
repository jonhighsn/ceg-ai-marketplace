import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/ceg-ai-marketplace/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/ceg-ai-marketplace/',
      },
    },
    setupFiles: './src/test/setup.js',
  },
})
