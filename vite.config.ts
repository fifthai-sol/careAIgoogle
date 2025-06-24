/// <reference types="node" />

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Import 'cwd' directly to resolve types if global 'process' is problematic
// Correction: process.cwd() is a global function, no specific import needed for it.

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files based on mode (development, production)
  // This will load .env, .env.production, .env.development
  // Make sure you have GEMINI_API_KEY in your .env file or your build environment.
  const env = loadEnv(mode, process.cwd(), ''); // Use process.cwd() directly

  return {
    plugins: [react()],
    // Changed base path to './' for more robust relative path resolution.
    // This helps if the app is deployed in a subfolder or at the root.
    // For GitHub Pages, ensure your repository settings and deployment process
    // correctly place the agent-console as a subfolder if using this base.
    // If deploying to a specific subpath like '/my-repo/', explicitly set base: '/my-repo/'.
    base: './',
    define: {
      // This makes process.env.API_KEY available in your client-side code.
      // It will be replaced with the value of GEMINI_API_KEY from your build environment or .env file.
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      outDir: 'dist',
       rollupOptions: {
        // Optional: configure specific rollup options if needed
      }
    },
    server: {
      // Optional: configure dev server options if needed
      port: 3000,
    },
  };
});