import { createRouter, RouterProvider } from '@tanstack/react-router'
import { Command } from '@tauri-apps/plugin-shell'
import { RPCChannel, TauriShellStdio } from 'kkrpc/browser'
import ReactDOM from 'react-dom/client'
import './styles.css'

import { api as clientApi } from './api'
import { routeTree } from './routeTree.gen'
import { type API as ClientApi } from './types/api'
import { type API as ServerApi } from '../../server/src/types/api'

export type RouterContext = {
  serverApi: ServerApi
}

//  Start the server
const cmd = Command.sidecar('bin/tauri-bun-sidecar') // See `BINARY_NAME` variable in `apps/server/scripts/compile.ts` to get the sidecar name
const process = await cmd.spawn()
const stdio = new TauriShellStdio(cmd.stdout, process)
const channel = new RPCChannel<ClientApi, ServerApi>(stdio, {
  expose: clientApi,
})
const serverApi = channel.getAPI()

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: { serverApi } as RouterContext,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// See `vite.config.ts` for all defined values.
window.__appVersion = __appVersion
window.__envMode = __envMode

const rootElement = document.getElementById('app')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<RouterProvider router={router} />)
}
