import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    define: {
      // Pass environment variables to the app
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'process.env.VITE_AUTH0_DOMAIN': JSON.stringify(env.VITE_AUTH0_DOMAIN),
      'process.env.VITE_AUTH0_CLIENT_ID': JSON.stringify(env.VITE_AUTH0_CLIENT_ID),
      'process.env.VITE_AUTH0_AUDIENCE': JSON.stringify(env.VITE_AUTH0_AUDIENCE)
    }
  }
})
