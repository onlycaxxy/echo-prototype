// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.', // 告訴 Vite 從當前目錄開始找 index.html
  build: {
    outDir: 'dist' // 打包輸出到 dist 資料夾
  }
})


