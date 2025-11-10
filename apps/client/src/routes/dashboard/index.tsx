import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <h1 className="text-white font-3xl">Hello "/dashboard/"!</h1>
}
