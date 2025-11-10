import { ClientOptions, fetch } from '@tauri-apps/plugin-http'

export async function fetcher<T>(
  url: string,
  options?: RequestInit & ClientOptions,
): Promise<T> {
  const PORT = window.__serverConfig?.serverPort ?? 3000 // In dev set the appropriate port. In prod, it is handled automatically.
  const res = await fetch(`http://localhost:${PORT}${url}`, {
    ...(options ?? {}),
    headers: {
      Authorization: `Bearer ${window.__serverConfig?.authToken}`, // Not required for dev
      ...(options?.headers ?? {}),
    },
  })
  return await res.json()
}
