import { createRouter } from '@tanstack/react-router'
import DefaultCatchBoundary from 'packages/client/src/ui/DefaultCatchBoundary'
import NotFound from 'packages/client/src/ui/NotFound'

import { queryClient } from './provider/QueryClientProvider'
import { routeTree } from './routeTree.gen'

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: () => <NotFound />,
  })

  return router
}
