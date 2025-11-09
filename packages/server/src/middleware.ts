import { verifyAuthToken } from './crypto'

export async function authMiddleware(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }
  const token = authHeader.slice('Bearer '.length)
  const valid = await verifyAuthToken(token)
  if (!valid) {
    return new Response('Unauthorized', { status: 401 })
  }
  return null // proceed
}
