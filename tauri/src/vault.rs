use argon2::Argon2;
use iota_stronghold::SnapshotPath;
use rand::RngCore;
use std::{fs, io::Write, path::PathBuf};
use tauri::{AppHandle, Manager};
use tauri_plugin_fs::FsExt;
use tauri_plugin_stronghold::stronghold::Stronghold;

pub fn init_vault(app_handle: &tauri::AppHandle, password: &str) -> Result<Stronghold, String> {
    let scope = app_handle.fs_scope();
    let mut app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|err| err.to_string())?;
    scope
        .allow_directory(&app_data_dir, true)
        .map_err(|err| err.to_string())?;

    // app_data_dir returns {app_data_dir}/{bundleId}. Weird!
    if !app_data_dir.is_dir() {
        app_data_dir = match app_data_dir.parent() {
            Some(dir) => PathBuf::from(dir),
            None => return Err(String::from("App data directory not found.")),
        }
    };

    let salt_path = app_data_dir.join("salt.txt");

    if !salt_path.exists() {
        let mut salt = [0u8; 32];
        rand::rng().fill_bytes(&mut salt);
        let mut file = fs::File::create(&salt_path).map_err(|err| err.to_string())?;
        file.write_all(&salt).map_err(|err| err.to_string())?;
    }

    let salt = fs::read(&salt_path).map_err(|e| e.to_string())?;
    let mut derived_key = [0u8; 32];
    Argon2::default()
        .hash_password_into(password.as_bytes(), &salt, &mut derived_key)
        .map_err(|e| e.to_string())?;

    let vault_path = app_data_dir.join("vault.stronghold");
    Ok(Stronghold::new(vault_path, derived_key.to_vec()).map_err(|err| err.to_string())?)
}

pub fn get_or_generate_app_secret(
    app_handle: &AppHandle,
    stronghold: &mut Stronghold,
) -> Result<Vec<u8>, String> {
    let secret_key_name = "app_secret";
    if let Ok(existing) = stronghold.store().get(secret_key_name.as_bytes()) {
        if let Some(key) = existing {
            return Ok(key);
        }
    }
    let scope = app_handle.fs_scope();
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|err| err.to_string())?;
    scope
        .allow_directory(&app_data_dir, true)
        .map_err(|err| err.to_string())?;

    let mut secret = vec![0u8; 32];
    rand::rng().fill_bytes(&mut secret);

    if let Err(err) =
        stronghold
            .store()
            .insert(secret_key_name.as_bytes().to_vec(), secret.clone(), None)
    {
        return Err(err.to_string());
    }

    let vault_path = app_data_dir.join("vault.stronghold");

    println!(">> {:?}", vault_path);

    // if let Some(parent_dir) = vault_path.parent() {
    //     std::fs::create_dir_all(parent_dir).map_err(|e| e.to_string())?;
    // }

    stronghold
        .commit(&SnapshotPath::from_path(&vault_path))
        .map_err(|err| err.to_string())?;
    Ok(secret)
}
