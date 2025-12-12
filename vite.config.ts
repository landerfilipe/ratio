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
    }),
  ],
  // === CODE SPLITTING: Vendor Chunking para Performance ===
  // Separa bibliotecas pesadas em chunks independentes para melhor cache
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - raramente muda
          'vendor-react': ['react', 'react-dom'],
          // Firebase - carregado apenas quando necessário para auth
          'vendor-firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
          ],
          // Recharts - PESADO, só carrega na view Statistics
          'vendor-recharts': ['recharts'],
          // Ícones - tree-shaking já otimiza, mas separar melhora cache
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    // Aumenta limite de warning para chunks grandes (Recharts é ~300KB)
    chunkSizeWarningLimit: 600,
  },
});
