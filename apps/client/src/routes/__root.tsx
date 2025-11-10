import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { QueryClientProvider } from '~/provider/QueryClientProvider'

export const Route = createRootRoute({
  component: RootComponent,
})

const isDev = import.meta.env.DEV

function RootComponent() {
  return (
    <>
      <QueryClientProvider>
        <Outlet />
      </QueryClientProvider>
      {isDev ? <TanStackRouterDevtools position="bottom-right" /> : null}
    </>
  )
}
