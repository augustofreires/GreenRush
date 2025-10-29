import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Otimizações de build
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove apenas logs específicos
      },
    },

    // Chunk splitting manual para otimizar cache
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - sempre vai ser usado
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],

          // Router - carrega só quando necessário
          'router': ['react-router-dom'],

          // Icons - pode ser grande
          'icons': ['react-icons'],

          // Charts - só carrega em páginas específicas
          'charts': ['recharts'],

          // Utils e stores
          'store': ['zustand'],
          'axios': ['axios'],
          'utils': ['idb', 'uuid'],
        },

        // Nomes de arquivo com hash para cache busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Aumenta o limite de warning de chunk size
    chunkSizeWarningLimit: 1000,

    // Sourcemaps apenas em dev
    sourcemap: false,
  },

  // Performance hints
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
})
