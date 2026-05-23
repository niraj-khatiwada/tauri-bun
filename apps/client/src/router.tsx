import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Command } from "@tauri-apps/plugin-shell";
import { RPCChannel, TauriShellStdio } from "kkrpc/browser";
import { ElysiaWebSocketClientIO } from "kkrpc";

import ReactDOM from "react-dom/client";
import "./styles.css";

import { api as clientApi } from "./api";
import { routeTree } from "./routeTree.gen";
import { type API as ClientApi } from "./types/api";
import { type API as ServerApi } from "../../server/src/types/api";

export type RouterContext = {
  serverApi: ServerApi;
};

// DEV: In development, we use kkrpc via a websocket. Any changes to the server is hot-reloaded instantly.
// PROD: In production, we connect the server via Tauri Sidecar. The backend server will be bundled for production and connected via cmd interface.
let cmd: Command<any>;
let serverApi: ServerApi;
if (import.meta.env.PROD) {
  cmd = Command.sidecar("bin/tauri-bun-sidecar"); // See `BINARY_NAME` variable in `apps/server/scripts/compile.ts` to get the sidecar name
  const process = await cmd.spawn();
  const stdio = new TauriShellStdio(cmd.stdout, process);
  const channel = new RPCChannel<ClientApi, ServerApi>(stdio, {
    expose: clientApi,
  });
  serverApi = channel.getAPI();
} else {
  const clientIO = new ElysiaWebSocketClientIO(
    `ws://localhost:${import.meta.env["VITE_SERVER_PORT"] ?? "3002"}`,
  );
  const channel = new RPCChannel<ClientApi, ServerApi>(clientIO, {
    expose: clientApi,
  });
  serverApi = channel.getAPI();
}

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: { serverApi } as RouterContext,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// See `vite.config.ts` for all defined values.
window.__appVersion = __appVersion;
window.__envMode = __envMode;

const rootElement = document.getElementById("app")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
