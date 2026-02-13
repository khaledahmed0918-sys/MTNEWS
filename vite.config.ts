
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
      esbuild: {
        // Automatically remove console logs and debugger in production for smaller bundle
        drop: mode === 'production' ? ['console', 'debugger'] : [],
      },
      build: {
        target: 'es2020', // Modern target for smaller code
        outDir: 'dist',
        chunkSizeWarningLimit: 600, // Reasonable limit
        sourcemap: false, // Save build time and space
        rollupOptions: {
            output: {
                // Advanced chunk splitting to prevent large vendor files
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                            return 'vendor-react';
                        }
                        if (id.includes('framer-motion')) {
                            return 'vendor-animation';
                        }
                        if (id.includes('leaflet') || id.includes('react-leaflet')) {
                            return 'vendor-maps';
                        }
                        if (id.includes('firebase')) {
                            return 'vendor-firebase';
                        }
                        if (id.includes('lucide-react')) {
                            return 'vendor-icons';
                        }
                        // Group other small utilities
                        return 'vendor-utils';
                    }
                }
            }
        }
      }
    };
});
