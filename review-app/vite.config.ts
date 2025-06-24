import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Serve from root of review-app for standalone deployment
  server: {
    port: 3002, // Attempt to run on a different port
    strictPort: false, 
  },
  build: {
    outDir: 'dist',
  }
});