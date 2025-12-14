import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { QueryClientProvider } from '~/provider/QueryClientProvider'
import { RouterContext } from '~/router'

export const Route = createRootRouteWithContext<RouterContext>()({
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
