import { authMiddleware } from './middleware'
import { intiRustIpc } from './rust-ipc'

intiRustIpc()

const isProd = process.env.NODE_ENV === 'production'

function handleCors(_: Request, res: Response) {
  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Allow-Headers', '*')
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}

const server = Bun.serve({
  port: process.env['PORT'] ?? 3000,
  hostname: 'localhost',
  async fetch(req: Request) {
    if (req.method === 'OPTIONS') {
      return handleCors(req, new Response(null, { status: 204 }))
    }

    if (isProd) {
      const authResp = await authMiddleware(req)
      if (authResp) return handleCors(req, authResp)
    }

    const url = new URL(req.url)
    if (url.pathname === '/') {
      return handleCors(
        req,
        new Response(JSON.stringify({ data: 'Hello from Bun!' })),
      )
    }
    if (url.pathname === '/ping') {
      return handleCors(req, new Response(JSON.stringify({ data: 'pong' })))
    }

    return handleCors(req, new Response('Not Found', { status: 404 }))
  },
})

// biome-ignore lint/suspicious/noConsole: <>
console.log(`Bun server running at ${server.url}`)
