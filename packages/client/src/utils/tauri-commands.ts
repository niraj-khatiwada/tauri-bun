import { invoke } from '@tauri-apps/api/core'

export async function getServerConfig() {
  return await invoke<{
    authToken: string
    serverPort: number
  }>('get_server_config')
}
