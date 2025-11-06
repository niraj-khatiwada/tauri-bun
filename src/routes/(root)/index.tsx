import { createFileRoute } from '@tanstack/react-router'

import Logo from '../logo.svg'

export const Route = createFileRoute('/(root)/')({
  component: App,
})

function App() {
  return (
    <div className="h-screen w-screen flex items-center justify-center flex-col">
      <img src={Logo} alt="logo" width={200} />
      <h1 className="text-white text-3xl font-bold">Tauri + Bun + TanStack</h1>
    </div>
  )
}
