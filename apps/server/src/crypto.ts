import { randomUUID } from 'crypto'

import { sendToRust } from './rust-ipc'

export const verificationStore = new Map<string, (v: boolean) => void>()

export async function verifyAuthToken(authToken: string) {
  return new Promise<boolean>((resolve) => {
    const id = randomUUID()
    verificationStore.set(id, resolve)
    sendToRust(`[verify-token] ${JSON.stringify({ id, token: authToken })}`)
  })
}
