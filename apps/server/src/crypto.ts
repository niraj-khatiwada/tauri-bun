import { randomUUID } from 'node:crypto'

import { sendToRust } from './rust-ipc'

export const verificationStore = new Map<string, (v: boolean) => void>()

export function verifyAuthToken(authToken: string) {
  return new Promise<boolean>((resolve) => {
    const id = randomUUID()
    verificationStore.set(id, resolve)
    sendToRust(`[verify-token] ${JSON.stringify({ id, token: authToken })}`)
  })
}
