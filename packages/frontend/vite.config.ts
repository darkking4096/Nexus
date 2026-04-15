import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { bundleAnalyzerPlugin } from './vite-plugin-bundle-analyzer'

export default defineConfig({
  plugins: [react(), bundleAnalyzerPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    // Optimize bundle size with code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting: separate vendor libraries
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-utils': ['axios'],
        },
      },
    },
    // Minification optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    // CSS optimization
    cssCodeSplit: true,
    // Source maps only in development
    sourcemap: false,
    // Report compressed size
    reportCompressedSize: true,
    // Chunk size warning threshold
    chunkSizeWarningLimit: 500,
  },
  // Environment-specific configuration
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
})
