import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
    exclude: [
      'node_modules/',
      'dist/',
      '.claude/',
      'tests/e2e/',
      '**/*.config.js'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '.claude/'
      ],
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
