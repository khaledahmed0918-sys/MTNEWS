
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_ADMIN_USER': JSON.stringify(env.VITE_ADMIN_USER || 'ASWAYZ3297'),
        'process.env.VITE_ADMIN_PASS': JSON.stringify(env.VITE_ADMIN_PASS || 'mTcAs7293'),
        'process.env.VITE_AUTH_CODE': JSON.stringify(env.VITE_AUTH_CODE || '03829'),
      },
      resolve: {
        alias: {
          '@': path.resolve('.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-core': ['react', 'react-dom'],
                    'vendor-utils': ['framer-motion', 'lucide-react', 'firebase/app', 'firebase/database'],
                    'vendor-maps': ['leaflet', 'react-leaflet'],
                }
            }
        }
      }
    };
});