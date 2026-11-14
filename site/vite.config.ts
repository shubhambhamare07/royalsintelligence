import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    host: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge', 'canvas-confetti'],
          'vendor-echarts': ['echarts', 'echarts-for-react'],
          'vendor-utils': ['zod', 'fuse.js'],
        },
      },
    },
  },
});

