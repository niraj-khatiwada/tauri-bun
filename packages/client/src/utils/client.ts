import { treaty } from '@elysiajs/eden'
import { fetch as tauriFetch } from '@tauri-apps/plugin-http'

import { getAuthToken } from './tauri-commands'
import type { App } from '../../../server/index'

let authToken: string | null = null

// fetch('http://localhost:3000', {
//   method: 'GET',
//   headers: {
//     Authorization: 'Hello',
//   },
// })
//   .then()
//   .then()

export const client = treaty<App>('http://localhost:3000', {
  onRequest: async (_, op) => {
    if (!authToken) {
      console.log('Server token not found. Generating one...')
      authToken = await getAuthToken()
      console.log('Server auth token generated', authToken)
    }
    return {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  },
})
