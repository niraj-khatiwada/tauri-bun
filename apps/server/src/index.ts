import {
  BunIo,
  RPCChannel,
  type IoInterface,
  ElysiaWebSocketServerIO,
} from "kkrpc";

import { api as serverApi } from "./api";
import { type API as ServerApi } from "./types/api";
import { type API as ClientApi } from "../../client/src/types/api";

let rpc: RPCChannel<ServerApi, ClientApi, IoInterface>;

// DEV: In development, we use kkrpc via a websocket. Any changes to the server is hot-reloaded instantly.
// PROD: In production, we connect the server via Tauri Sidecar. The backend server will be bundled for production and connected via cmd interface.
if (process.env.NODE_ENV === "production") {
  const stdio = new BunIo(Bun.stdin.stream());
  rpc = new RPCChannel<ServerApi, ClientApi>(stdio, {
    expose: serverApi,
  });
} else {
  const server = Bun.serve({
    port: Number(process.env.PORT ?? 3002),
    fetch(req, server) {
      const upgraded = server.upgrade(req);
      if (upgraded) return;
      return new Response("Upgrade failed", { status: 500 });
    },
    websocket: {
      open(ws) {
        const serverIO = new ElysiaWebSocketServerIO(ws);

        rpc = new RPCChannel(serverIO, {
          expose: serverApi,
        });
      },
      message(ws, message) {
        ElysiaWebSocketServerIO.feedMessage(ws, message);
      },
    },
  });
  // biome-ignore lint/suspicious/noConsole: <>
  console.log(`Bun server is running at ${server.url}`);
}

export { rpc };
