import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { fetch } from '@tauri-apps/plugin-http'

import { getAuthToken } from '~/utils/tauri-commands'
import Logo from '../../logo.svg'

export const Route = createFileRoute('/(root)/')({
  component: App,
})

function App() {
  const { data } = useQuery({
    queryKey: ['/'],
    queryFn: async () => {
      const authToken = await getAuthToken()
      const res = await fetch('http://localhost:3000', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      return await res.json()
    },
  })

  return (
    <>
      <div className="h-screen w-screen flex items-center justify-center flex-col">
        <img src={Logo} alt="logo" width={200} />
        <h1 className="text-white text-3xl font-bold">Tauri + Bun</h1>
        <div>
          <Link to="/dashboard" className="text-blue-500 block my-2">
            Go to Dashboard
          </Link>
        </div>
        <p className="text-white">{data?.data ?? ''}</p>
      </div>
    </>
  )
}
