use crate::{
    crypto,
    domain::{AppState, ServerConfig},
};

#[tauri::command]
pub fn get_server_config(app_state: tauri::State<AppState>) -> Result<ServerConfig, String> {
    let secret_key = &app_state.app_secret_key;
    let token = crypto::generate_token(secret_key, ""); // pass custom payload if you like

    let server_config = ServerConfig {
        auth_token: token,
        server_port: app_state.server_port,
    };
    Ok(server_config)
}
