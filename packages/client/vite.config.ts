import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import packageJSON from './package.json'

const host = process.env.TAURI_DEV_HOST

const config = defineConfig(({ mode }) => ({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    TanStackRouterVite({
      routeFileIgnorePattern: '(^[A-Z].*)',
    }),
    tailwindcss(),
    viteReact(),
  ],
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // See `src/router.tsx` file to assign these defined values to window.
  define: {
    __appVersion: JSON.stringify(packageJSON.version),
    __envMode: JSON.stringify(mode),
  },
}))

export default config
