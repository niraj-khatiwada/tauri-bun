import { BunIo, RPCChannel } from 'kkrpc'

import { api as serverApi } from './api'
import { type API as ServerApi } from './types/api'
import { type API as ClientApi } from '../../client/src/types/api'

const stdio = new BunIo(Bun.stdin.stream())
export const rpc = new RPCChannel<ServerApi, ClientApi>(stdio, {
  expose: serverApi,
})

// biome-ignore lint/suspicious/noConsole: <>
console.log(`Bun server is running.`)
