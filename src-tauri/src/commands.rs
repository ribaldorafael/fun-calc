/// Tauri command handlers — thin wrappers around engine + parser.

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

use crate::engine;
use crate::parser;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub expression: String,
    pub result: String,
}

pub struct CalcState {
    pub history: Mutex<Vec<HistoryEntry>>,
}

#[tauri::command]
pub fn calculate(expression: &str) -> Result<String, String> {
    let result = parser::eval_expression(expression)?;
    Ok(engine::format_number(result))
}

#[tauri::command]
pub fn scientific_fn(func: &str, value: f64) -> Result<String, String> {
    let result = engine::scientific_fn(func, value)?;
    Ok(engine::format_number(result))
}

#[tauri::command]
pub fn add_history(expression: String, result: String, state: State<CalcState>) {
    let mut history = state.history.lock().unwrap();
    history.push(HistoryEntry { expression, result });
    if history.len() > 50 {
        history.remove(0);
    }
}

#[tauri::command]
pub fn get_history(state: State<CalcState>) -> Vec<HistoryEntry> {
    state.history.lock().unwrap().clone()
}

#[tauri::command]
pub fn clear_history(state: State<CalcState>) {
    state.history.lock().unwrap().clear();
}

#[tauri::command]
pub fn get_constant(name: &str) -> Result<String, String> {
    let val = engine::get_constant(name)?;
    Ok(engine::format_number(val))
}
