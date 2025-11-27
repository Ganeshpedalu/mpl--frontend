import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Get repository name from environment or use default
// For GitHub Pages: repository name (e.g., 'mpl-season-2-frontend')
// For custom domain: use '/'
const REPO_NAME = process.env.VITE_REPO_NAME || 'mpl-season-2-frontend';
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
