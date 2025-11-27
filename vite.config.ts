import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repository configuration - hardcoded for GitHub Pages
// Change this if your repository name is different
const REPO_NAME = 'mpl--frontend';
// Base path: use repository name for production, '/' for development
// Vite automatically detects production mode during build
const BASE_PATH = process.env.NODE_ENV === 'production' ? `/${REPO_NAME}/` : '/';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: BASE_PATH,
  
  // Build optimizations
  build: {
    // Enable minification (esbuild is faster and built-in)
    minify: 'esbuild',
    // Remove console.log in production
    esbuild: {
      drop: ['console', 'debugger'],
    },
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps only in development
    sourcemap: false,
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
