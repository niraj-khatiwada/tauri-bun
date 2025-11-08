pub mod commands;
pub mod crypto;
pub mod domain;
pub mod server;
use commands::get_auth_token;
use domain::AppState;
use parking_lot::Mutex;
use std::sync::Arc;
use tauri::{Manager, RunEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            let sk = crypto::generate_secret_hex();

            let app_state = AppState {
                app_secret_key: sk,
                server: Arc::new(Mutex::new(None)),
            };
            app.manage(app_state);

            // #[cfg(not(debug_assertions))]
            if let Err(err) = server::start_server(app.handle()) {
                println!("[sidecar] Failed to start the server: {}", err);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_auth_token])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            // #[cfg(not(debug_assertions))]
            match event {
                RunEvent::ExitRequested { .. } | RunEvent::Exit => {
                    if let Err(e) = server::shutdown_server(app_handle) {
                        println!("[sidecar] Failed to shut down server on exit: {}", e);
                    }
                }
                _ => {}
            }
        });
}
