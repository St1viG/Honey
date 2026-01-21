pub mod types;                                                                                                                                  
pub mod exel; 
pub mod commands;

use crate::commands::*;
use crate::types::{Table, AppState};
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::new())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![load_invoice, load_database, apply_operations])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
