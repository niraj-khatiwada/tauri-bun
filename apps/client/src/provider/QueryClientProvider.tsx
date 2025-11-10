import {
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      gcTime: 1e4 * 60,
      retry: 3,
    },
    mutations: {
      retry: 0,
    },
  },
})

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  )
}
