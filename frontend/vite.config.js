import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Read Frappe webserver port from common_site_config if available
let webserver_port = 8000
try {
  const siteConfig = JSON.parse(
    require('fs').readFileSync('../../../sites/common_site_config.json', 'utf8')
  )
  webserver_port = siteConfig.webserver_port || 8000
} catch (_) {}

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },

  server: {
    port: 8080,
    host: '0.0.0.0',
    proxy: {
      '^/(app|api|assets|files|private|proposal)': {
        target: `http://127.0.0.1:${webserver_port}`,
        changeOrigin: true,
        secure: false,
        ws: true,
        router(req) {
          const site_name = req.headers.host?.split(':')[0]
          return `http://${site_name}:${webserver_port}`
        },
      },
    },
  },

  build: {
    outDir: '../quotation_intelligence/public/proposal',
    emptyOutDir: true,
    manifest: true,
    target: 'es2015',
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Vite 8 (rolldown) requires manualChunks as a FUNCTION, not an object
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/'))   return 'vendor'
            if (id.includes('@dnd-kit'))                              return 'dndkit'
            if (id.includes('frappe-react-sdk'))                     return 'frappe'
            if (id.includes('lucide-react'))                         return 'lucide'
          }
        },
      },
    },
  },
})