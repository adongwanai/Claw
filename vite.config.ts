import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // Required for Electron: all asset URLs must be relative because the renderer
  // loads via file:// in production. vite-plugin-electron-renderer sets this
  // automatically, but we declare it explicitly so the intent is clear and the
  // build remains correct even if plugin order ever changes.
  base: './',
  plugins: [
    react(),
    electron([
      {
        // Main process entry file
        entry: 'electron/main/index.ts',
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: 'dist-electron/main',
            rollupOptions: {
              // Keep only Electron itself external. Runtime dependencies used by
              // the main process are bundled into dist-electron so packaging
              // does not need to traverse the workspace node_modules tree.
              // bufferutil and utf-8-validate are optional native addons for ws;
              // ws falls back to pure-JS implementations when they are absent.
              external: ['electron', 'bufferutil', 'utf-8-validate'],
            },
          },
        },
      },
      {
        // Preload scripts entry file
        entry: 'electron/preload/index.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@electron': resolve(__dirname, 'electron'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress expected dynamic import warnings for store circular dependency lazy-loading
        if (warning.message && warning.message.includes('dynamic import will not move module into another chunk')) {
          return;
        }
        warn(warning);
      },
    },
  },
});
