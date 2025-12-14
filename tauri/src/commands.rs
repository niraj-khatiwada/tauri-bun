#[tauri::command]
pub fn my_custom_command() -> String {
    "Hello Bun!".to_string()
}
