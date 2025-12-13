import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Ratio - Evolução Calculada',
        short_name: 'Ratio',
        description: 'Gerencie seus estudos com estatísticas avançadas.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'fullscreen',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      // Workbox config for better caching
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  // === AGGRESSIVE CODE SPLITTING ===
  build: {
    rollupOptions: {
      output: {
        // Function-based chunking for granular control
        manualChunks: (id: string) => {
          // Firebase - split into smaller chunks
          if (id.includes('firebase/auth')) {
            return 'vendor-firebase-auth';
          }
          if (id.includes('firebase/firestore')) {
            return 'vendor-firebase-db';
          }
          if (id.includes('firebase/app') || id.includes('@firebase/app')) {
            return 'vendor-firebase-core';
          }
          
          // Recharts - only loaded when Statistics view accessed
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-recharts';
          }
          
          // React core - cached aggressively
          if (id.includes('node_modules/react-dom')) {
            return 'vendor-react-dom';
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          
          // Icons - tree-shaken but still separate
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
        },
      },
    },
    // Target modern browsers for smaller output
    target: 'es2020',
    // Increase limit for recharts
    chunkSizeWarningLimit: 600,
    // Better minification
    minify: 'esbuild',
    // CSS code splitting
    cssCodeSplit: true,
    // Source maps only in dev
    sourcemap: false,
  },
  // Optimize dependencies - fix es-toolkit module resolution
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'recharts',
      'es-toolkit',
      'es-toolkit/compat',
    ],
  },
});
