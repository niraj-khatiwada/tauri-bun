# Tauri + Bun

Read the [blogpost](https://codeforreal.com/blogs/using-bun-or-deno-as-a-web-server-in-tauri/?utm_source=github.com) for the complete implementation details.

> [!NOTE]
> Please switch to [main](https://github.com/niraj-khatiwada/tauri-bun/tree/main) branch to view the old setup.
> 
This repo shows you how to setup a cross-platform desktop app using Tauri but
with Bun. We create a bi-directional RPC between Bun server and our Tauri client using [kkrpc](https://docs.kkrpc.kunkun.sh/). This setup requires almost zero extra code in Rust backend aside from Tauri Sidecar configuration.
<br />

##### A Tauri + Deno version is available [here](https://github.com/niraj-khatiwada/tauri-deno).

<img src="/assets/hero.png" style="object-fit: contain;" />
<img src="/assets/process_diagram.png" style="object-fit: contain;" />

### Development

Install [Bun](https://bun.sh/). The project uses Bun workspace and everything
runs using Bun.

- Install packages:
```
bun install
```

- Run the client server:

```
bun run --filter client dev
```

- Run the web server: The web server is only needed during development mode. It's not used on the release build of the app.

```
bun run --filter server dev
```

- Run the Tauri server:

Tauri depends on the compiled Bun server binary; run this at least once before starting the dev server:
```
bun run --filter server compile
```
```
bun tauri:dev
```

### Production

In production, the Bun web server is compiled as a standalone binary and this
binary is embedded as a sidecar in Tauri automatically.

```
bun tauri:build
```
