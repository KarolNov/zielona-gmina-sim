// app.config.ts
import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  server: {
    preset: 'cloudflare-pages',
  },
  // Dodaj to, jeśli Vite ma problem z resolve'owaniem vinxi
  vite: {
    resolve: {
      conditions: ['import', 'default', 'browser'],
    }
  }
})