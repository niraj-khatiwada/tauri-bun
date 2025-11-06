use tauri::App;
use tauri_plugin_shell::ShellExt;

// #[cfg(not(debug_assertions))]
fn init_server(app: &mut App) {
    let shell = app.shell();

    let sidecar = shell
        .sidecar("bun-tanstack")
        .expect("unable to run sidecar");
    let (mut rx, _child) = sidecar.spawn().expect("unable to swpawn the sidecar");

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            println!("Sidecar event: {:?}", event);
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // #[cfg(not(debug_assertions))]
            init_server(app);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
