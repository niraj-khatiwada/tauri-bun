use crate::{crypto, domain::AppState};
use serde_json::Value;
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

pub fn send_to_server(app_handle: &AppHandle, msg: &str) -> Result<(), String> {
    let app_state = match app_handle.try_state::<AppState>() {
        None => {
            return Err(String::from("Server is not available."));
        }
        Some(app_state) => app_state,
    };
    let mut server_lock = app_state.server.lock();
    if let Some(ref mut server) = *server_lock {
        let msg_line = format!("{msg}\n");
        server
            .write(msg_line.as_bytes())
            .map_err(|err| err.to_string())?
    }
    Err(String::from("Server is not running."))
}

pub fn start_server(app_handle: &AppHandle, server_port: u16) -> Result<(), String> {
    println!("[sidecar] Starting server...");
    if let Some(app_state) = app_handle.try_state::<AppState>() {
        if app_state.server.lock().is_some() {
            println!("[sidecar] Server is already running.");
            return Ok(());
        }
    }

    let shell = app_handle.shell();
    let mut sidecar = shell
        .sidecar("tauri-bun-sidecar")
        .map_err(|err| err.to_string())?;

    sidecar = sidecar.env("TZ", "UTC");
    sidecar = sidecar.env("NODE_ENV", "production");
    sidecar = sidecar.env("PORT", server_port.to_string());

    let (mut rx, child) = sidecar.spawn().map_err(|err| err.to_string())?;

    if let Some(app_state) = app_handle.try_state::<AppState>() {
        let mut server_lock = app_state.server.lock();
        *server_lock = Some(child);
    }

    let app_handle_clone = app_handle.clone();
    let app_handle_clone2 = app_handle.clone();

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(data) => {
                    if let Ok(text) = String::from_utf8(data) {
                        let line = text.trim();
                        #[cfg(debug_assertions)]
                        println!("[sidecar] Server stdin {}", line);

                        // Verify server auth token request
                        if line.starts_with("[verify-token]") {
                            let json_str = line
                                .strip_prefix("[verify-token]")
                                .expect("[sidecar] Invalid prefix")
                                .trim();
                            if let Ok(payload) = serde_json::from_str::<Value>(json_str) {
                                let id = payload.get("id").and_then(|v| v.as_str());
                                let token = payload.get("token").and_then(|v| v.as_str());

                                match (id, token) {
                                    (Some(id), Some(token)) => {
                                        if let Some(app_state) =
                                            app_handle_clone2.try_state::<AppState>()
                                        {
                                            let claims = crypto::verify_token(
                                                &app_state.app_secret_key,
                                                token,
                                            );
                                            let response_json = serde_json::json!({
                                                "id": id,
                                                "valid": &claims.is_ok()
                                            });
                                            let response_str = format!(
                                                "[verify-token-response] {}",
                                                serde_json::to_string(&response_json).unwrap()
                                            );

                                            send_to_server(&app_handle_clone2, &response_str).ok();
                                        }
                                    }
                                    _ => eprintln!(
                                        "[sidecar] Token verification is missing id or token field."
                                    ),
                                }
                            }
                        }
                    }
                }
                CommandEvent::Stderr(data) =>
                {
                    #[cfg(debug_assertions)]
                    if let Ok(text) = String::from_utf8(data) {
                        eprintln!("[sidecar] Server stderr {}", text.trim());
                    }
                }
                CommandEvent::Terminated(code) => {
                    println!(
                        "[sidecar] Server terminated unexpectedly with code {:?}",
                        code
                    );

                    // Restart the server when it terminates unexpectedly
                    if let Some(app_state) = app_handle_clone.try_state::<AppState>() {
                        let mut server_lock = app_state.server.lock();
                        *server_lock = None;
                    }

                    let app_handle_clone = app_handle_clone.clone();

                    tauri::async_runtime::spawn(async move {
                        println!("[sidecar] Restarting server...");
                        tokio::time::sleep(Duration::from_secs(3)).await;
                        if let Err(e) = start_server(&app_handle_clone, server_port) {
                            eprintln!("[sidecar] Failed to restart the server: {}", e);
                        }
                    });
                }
                _ => {}
            }
        }
    });
    Ok(())
}

pub fn shutdown_server(app_handle: &AppHandle) -> Result<(), String> {
    println!("[sidecar] Shutting down server...");
    if let Some(app_state) = app_handle.try_state::<AppState>() {
        let mut server_lock = app_state.server.lock();
        if server_lock.is_none() {
            println!("[sidecar] Server is not running. Shutdown not needed.");
            return Ok(());
        }
        if let Some(mut server) = server_lock.take() {
            server.write("SIDECAR SHUTDOWN\n".as_bytes()).ok();
            match server.kill() {
                Ok(_) => {
                    println!("[sidecar] Server terminated successfully.");
                    return Ok(());
                }
                Err(err) => {
                    println!("[sidecar] Failed to terminate server.");
                    return Err(err.to_string());
                }
            }
        };
    }
    Ok(())
}
