pub mod command;
pub mod domain;
pub mod server;
pub mod vault;
use domain::AppState;
use parking_lot::Mutex;
use std::sync::Arc;
use tauri::{Manager, RunEvent};
use zeroize::Zeroize;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let mut stronghold = vault::init_vault(app.handle(), "PASSWORD")
                .expect("Stronghold initialization failed");

            let mut app_secret_key_bytes =
                vault::get_or_generate_app_secret(app.handle(), &mut stronghold)
                    .expect("Unable to get app secret key");
            let app_secret_key = app_secret_key_bytes.clone();

            app_secret_key_bytes.zeroize();

            let app_state = AppState {
                app_secret_key: app_secret_key,
                server: Arc::new(Mutex::new(None)),
                stronghold: Arc::new(Mutex::new(Some(stronghold))),
            };
            println!("{:?}", hex::encode(&app_state.app_secret_key));
            app.manage(app_state);

            #[cfg(not(debug_assertions))] // Only start server in production
            if let Err(err) = server::start_server(app.handle()) {
                println!("[sidecar] Failed to start the server: {}", err);
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            #[cfg(not(debug_assertions))]
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

// 34817a52c1f1e74b4d37cdea31545612d11275f4edc5a385ff86b8d4468d2ebe
