import readline from 'node:readline'

import { verificationStore } from './crypto'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

export function listenRustIPC() {
  rl.on('line', async (line) => {
    if (line.startsWith('[verify-token-response]')) {
      try {
        const responseStr = line.slice('[verify-token-response]'.length).trim()
        const response: { id: string; valid: boolean } = JSON.parse(responseStr)
        if (response.id) {
          const resolver = verificationStore.get(response.id)
          if (resolver) {
            resolver(response.valid ?? false)
            verificationStore.delete(response.id)
          }
        }
      } catch {}
    }

    if (line.startsWith('SIDECAR SHUTDOWN')) {
      // biome-ignore lint/suspicious/noConsole: <>
      console.log('[server] shutting down server')
      process.exit(0)
    }
  })
}

export function sendToRust(msg: string) {
  process.stdout.write(`${msg}\n`)
}
