use tauri::{App, Manager};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

// #[cfg(not(debug_assertions))]
fn init_server(app: &mut App) {
    let shell = app.shell();

    let resource_dir = app.path().resource_dir().unwrap();

    let mut sidecar = shell
        .sidecar("bun-tanstack")
        .expect("unable to run sidecar");

    sidecar = sidecar.env(
        "RESOURCE_DIR",
        format!("{}/_up_", resource_dir.to_string_lossy().to_string()), // _up_ = TanStack's `dist and `node_modules` are one level up from src-tauri
    );

    // Pass the resource directory to bun server instantiation cli
    let (mut rx, _child) = sidecar.spawn().expect("unable to swpawn the sidecar");

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(data) => {
                    if let Ok(text) = String::from_utf8(data) {
                        println!("[stdout]: {}", text.trim());
                    }
                }
                CommandEvent::Stderr(data) => {
                    if let Ok(text) = String::from_utf8(data) {
                        eprintln!("[stderr]: {}", text.trim());
                    }
                }
                CommandEvent::Terminated(code) => {
                    println!("[stdterm]:Sidecar exited with code {:?}", code);
                }
                _ => {}
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // #[cfg(not(debug_assertions))]
            init_server(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
