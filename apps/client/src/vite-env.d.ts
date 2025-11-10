/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

type ServerConfig = {
  authToken: string
  serverPort: number
}
declare global {
  interface Window {
    __appVersion: string
    __envMode: string
    __serverConfig: ServerConfig
    __localServerAuthToken: string
  }

  declare const __appVersion: string
  declare const __envMode: string
  declare const __serverConfig: ServerConfig
}

export {}
