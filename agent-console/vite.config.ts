
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Serve from root of agent-console
  server: {
    port: 3001, // Attempt to run on a different port than the main app
    strictPort: false, // If 3001 is taken, Vite will find another
  },
  build: {
    outDir: 'dist',
  }
});