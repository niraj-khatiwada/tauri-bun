# Tauri + Bun

Read the [blogpost](https://codeforreal.com/blogs/using-bun-or-deno-as-a-web-server-in-tauri/?utm_source=github.com) for the complete implementation details.

This repo shows you how to setup a cross-platform desktop app using Tauri but
with Bun as a web server. The web server is fully secured and is only accessible
by the Tauri webview via token authentication that can be verified via Rust
only. Accessing the webserver outside of the Rust and the Tauri webview will be
blocked completely.
<br />

##### A Tauri + Deno version is available [here](https://github.com/niraj-khatiwada/tauri-deno).

<img src="/assets/hero.png" style="object-fit: contain;" />
<img src="/assets/process_diagram.png" style="object-fit: contain;" />

### Development

Install [Bun](https://bun.sh/). The project uses Bun workspace and everything
runs using Bun.

- Run the client server:

```
cd ./apps/client
bun dev
```

- Run the web server:

```
cd ./apps/server
bun dev
```

- Run the Tauri server:

```
bun tauri:dev
```

### Production

In production, the Bun web server is compiled as a standalone binary and this
binary is embedded as a sidecar in Tauri.

```
bun tauri:build
```
