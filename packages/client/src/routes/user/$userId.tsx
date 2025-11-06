import { queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { getUserServerFn } from '~/server/functions/user'

export const getUserQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['user', userId],
    queryFn: () => getUserServerFn({ data: { id: +userId } }),
    staleTime: Infinity,
  })

export const Route = createFileRoute('/user/$userId')({
  beforeLoad: ({ params }) => {
    const { success } = z.coerce.number().safeParse(params.userId)
    if (!success) {
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: async ({ context, params: { userId } }) => {
    await context.queryClient.ensureQueryData(getUserQueryOptions(userId))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { userId } = Route.useParams()
  const { data: user } = useQuery(getUserQueryOptions(userId))

  return <h1 className="text-white font-3xl">Hello {user?.name ?? ''}</h1>
}
