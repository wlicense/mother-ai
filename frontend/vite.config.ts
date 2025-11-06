import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3347,
    proxy: {
      '/api': {
        target: 'http://localhost:8572',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // MUI関連を別チャンクに分割
          'mui': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],
          // Monaco Editorを別チャンクに分割
          'monaco': ['@monaco-editor/react'],
          // Reactコアライブラリを別チャンクに分割
          'react-vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          // React Queryを別チャンクに分割
          'tanstack': ['@tanstack/react-query'],
          // その他のライブラリ
          'vendor': ['axios', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
