import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://bhagavad-gita3.p.rapidapi.com/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Add RapidAPI headers to the proxied request
            proxyReq.setHeader('x-rapidapi-host', 'bhagavad-gita3.p.rapidapi.com');
            proxyReq.setHeader('x-rapidapi-key', '4af41e915emshcd8cf0801c6079dp1b0ba6jsn3535b27141fd');
          });
        },
      },
    },
  },
})
