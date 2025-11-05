#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let start_server = Command::new_sidecar("bun")
                .expect("failed to find Bun")
                .args(["run", "dist/server/index.js"])
                .spawn()
                .expect("failed to start TanStack backend");

            tauri::async_runtime::spawn(async move {
                let mut rx = start_server.rx;
                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line) = event {
                        println!("[TanStack] {line}");
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
