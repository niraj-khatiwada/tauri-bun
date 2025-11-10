import { ClientOptions, fetch } from '@tauri-apps/plugin-http'

export async function fetcher<T>(
  url: string,
  options?: RequestInit & ClientOptions,
): Promise<T> {
  const PORT =
    window.__serverConfig?.serverPort ??
    import.meta.env.VITE_SERVER_PORT ??
    3000
  const res = await fetch(`http://localhost:${PORT}${url}`, {
    ...(options ?? {}),
    headers: {
      Authorization: `Bearer ${window.__serverConfig?.authToken}`, // Not required for dev
      ...(options?.headers ?? {}),
    },
  })
  return await res.json()
}
