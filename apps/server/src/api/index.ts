import { rpc as serverRpc } from '..'
import type { API } from '../types/api'

export const api: API = {
  add: async (a: number, b: number) => a + b,
  addWithCallback: async (
    a: number,
    b: number,
    callback?: (result: number) => void,
  ) => {
    callback?.(a + b)
  },
  tasks: {
    async task1() {
      const clientApi = serverRpc.getAPI()
      const result = await clientApi.askRust()
      return `Bun got this message from Rust: "${result}"`
    },
  },
}
