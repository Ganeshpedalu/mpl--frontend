import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repository configuration - hardcoded for GitHub Pages
// Change this if your repository name is different
const REPO_NAME = 'mpl--frontend';

// Base path: use repository name for production, '/' for development
// Check for environment variable first, then use mode
const getBasePath = () => {
  // If VITE_BASE_PATH is set, use it
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH;
  }
  // For production builds, use repo name
  return `/${REPO_NAME}/`;
};

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Use base path for build command, '/' for dev server
  const base = command === 'build' ? getBasePath() : '/';
  
  console.log(`🔧 Vite Config: command=${command}, mode=${mode}, base=${base}`);
  
  return {
    plugins: [react()],
    base: base,
    
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
  };
});
