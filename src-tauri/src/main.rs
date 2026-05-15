#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod engine;
mod parser;

use commands::CalcState;
use std::sync::Mutex;

fn main() {
    tauri::Builder::default()
        .manage(CalcState {
            history: Mutex::new(Vec::new()),
        })
        .invoke_handler(tauri::generate_handler![
            commands::calculate,
            commands::scientific_fn,
            commands::add_history,
            commands::get_history,
            commands::clear_history,
            commands::get_constant,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
