import { createFileRoute, Link } from '@tanstack/react-router'

import Logo from '../../logo.svg'

export const Route = createFileRoute('/(root)/')({
  component: App,
})

function App() {
  return (
    <>
      <div className="h-screen w-screen flex items-center justify-center flex-col">
        <img src={Logo} alt="logo" width={200} />
        <h1 className="text-white text-3xl font-bold">
          Tauri + Bun + TanStack
        </h1>
        <div>
          <Link to="/dashboard" className="text-blue-500 block my-2">
            Go to Dashboard
          </Link>
          <Link
            to="/user/$userId"
            params={{ userId: '1' }}
            className="text-blue-500 block my-2"
          >
            Go to User 1
          </Link>
        </div>
      </div>
    </>
  )
}
