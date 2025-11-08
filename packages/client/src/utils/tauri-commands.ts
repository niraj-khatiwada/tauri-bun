import { invoke } from '@tauri-apps/api/core'

export async function getAuthToken() {
  return await invoke<string>('get_auth_token')
}
