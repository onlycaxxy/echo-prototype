import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: './',
  base: '/',
  build: {
    outDir: 'dist',
  },
  plugins: [vue()]
})

