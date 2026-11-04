import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Host allowlist for the Base44 preview proxy.
 * The sandbox forwards `Host: <port>-<sandbox id>.<sandbox domain>`; the sandbox id
 * rotates, so we allow the whole parent domain (Vite supports a leading-dot entry).
 */
const sandboxDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN
const allowedHosts = ['localhost', '127.0.0.1']
if (sandboxDomain) allowedHosts.push(`.${sandboxDomain}`)

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts,
    proxy: {
      '/api': { target: 'http://api:4000', changeOrigin: true },
      '/uploads': { target: 'http://api:4000', changeOrigin: true },
    },
  },
})
