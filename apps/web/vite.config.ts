import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(import.meta.dirname, '../../')
  const env = loadEnv(mode, envDir, '')
  const proxy = {
    '/api': {
      target: env.VITE_APP_API_URL || 'http://localhost:3000',
      changeOrigin: true,
      secure: false,
    },
  }

  return {
    plugins: [react()],
    envDir,
    server: { proxy },
    preview: { proxy },
    resolve: {
      tsconfigPaths: true,
    },
  }
})
