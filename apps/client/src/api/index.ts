// These APIs can be called by Bun server.
// A common use case is to get some data from Rust backend since Bun server cannot communicate with Rust backend, only the client can.

import { core } from '@tauri-apps/api'

import { API } from '~/types/api'

export const api: API = {
  async askRust() {
    return await core.invoke<Promise<string>>('my_custom_command')
  },
}
