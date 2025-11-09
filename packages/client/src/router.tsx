import { createRouter, RouterProvider } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import './styles.css'

import { routeTree } from './routeTree.gen'
import { getServerConfig } from './utils/tauri-commands'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// See vite-env.d.ts to set type
if (typeof window !== 'undefined') {
  // See `vite.config.ts` for all defined values.
  window.__appVersion = __appVersion
  window.__envMode = __envMode

  if (import.meta.env.PROD) {
    // Get local server config
    const serverConfig = await getServerConfig()

    if (!serverConfig) {
      throw new Error("Couldn't get server config via Tauri IPC.")
    }

    window.__serverConfig = {
      authToken: serverConfig.authToken,
      serverPort: serverConfig.serverPort,
    }
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<RouterProvider router={router} />)
}
