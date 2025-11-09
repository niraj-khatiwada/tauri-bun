use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri_plugin_shell::process::CommandChild;

pub struct AppState {
    pub app_secret_key: String,
    pub server: Arc<Mutex<Option<CommandChild>>>,
    pub server_port: u16,
}

impl Drop for AppState {
    fn drop(&mut self) {
        if let Some(child) = self.server.lock().take() {
            if let Err(e) = child.kill() {
                eprintln!("[sidecar] Failed to kill server on drop: {}", e);
            } else {
                println!("[sidecar] Server killed on AppState drop.");
            }
        }
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerConfig {
    pub auth_token: String,
    pub server_port: u16,
}
