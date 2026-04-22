import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: { port: 5174 },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/database'],
          'vue-vendor': ['vue', 'pinia'],
          'date': ['date-fns', 'date-fns-tz']
        }
      }
    }
  }
})
