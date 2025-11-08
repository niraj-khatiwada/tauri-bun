use crate::{crypto, domain::AppState};

#[tauri::command]
pub fn get_auth_token(app_state: tauri::State<AppState>) -> Result<String, String> {
    let secret_key = &app_state.app_secret_key;
    let token = crypto::generate_token(secret_key, ""); // pass custom payload if you like
    Ok(token)
}
