
use crate::types::{Table, AppState, CellAddress, table_to_str};
use crate::exel::read_exel;
use tauri::State;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MissingBarcode {
    pub row_idx: usize,
    pub sifra: String,
    pub naziv: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Operations {
    pub update_names: bool,
    pub format_price_4_dec: bool,
    pub remove_duplicate_barcodes: bool,
    pub swap_commas_to_dots: bool,
    pub auto_update_bar_kod: bool,
    pub format_col_and_mp_price_2_dec: bool,
    pub auto_update_price: bool,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OperationResult {
    pub table: Table,
    pub changed_cells: Vec<CellAddress>,
    pub missing_barcodes: Vec<MissingBarcode>,
    pub logs: usize,
    pub export_str: String
}  




#[tauri::command]                                                                                                                                                               
pub fn load_invoice(path: String, state: State<AppState>) -> Result<Table, String> {                                                                                            
    let table: Table = read_exel(&path)?;                                                                                                                                       
    *state.invoice.lock().unwrap() = Some(table.clone());                                                                                                                       
    Ok(table)                                                                                                                               
}

#[tauri::command]
pub fn load_database(path: String, state: State<AppState>) -> Result<Table,String>{
    let table: Table = read_exel(&path)?;
    *state.database.lock().unwrap() = Some(table.clone());
    Ok(table)
}


#[tauri::command]
pub fn apply_operations(table: Table,operations: Operations,mappings: HashMap<String, String>,state: State<AppState>,) -> Result<OperationResult, String> {
    let mut transformed = table.clone();
    if operations.update_names {
        let database = state.database.lock().unwrap();                                                                                                                       
        if let Some(ref db) = *database {                                                                                                                                    
            transformed = transformed.update_names(db);                                                                                                                      
        } 
    } 
    if operations.format_col_and_mp_price_2_dec {transformed.format_kol_i_mp_cena_2dec();}
    if operations.format_price_4_dec {transformed.format_redovna_cena_4dec();}
    if operations.remove_duplicate_barcodes {transformed.remove_duplicate_barcodes();}
    if operations.swap_commas_to_dots {transformed.swap_all_commas_to_dots();}
    if operations.auto_update_bar_kod{

    }else{

    }   
    let changed_cells = transformed.clone().compareCells(&table);       
    let output_str = table_to_str(&transformed).unwrap();  
    *state.transformed.lock().unwrap() = Some(transformed.clone());                                                                                                          
    Ok(OperationResult { table: transformed, changed_cells: changed_cells.to_vec(), missing_barcodes: vec![] , logs: changed_cells.len(), export_str: output_str})
  }                                                                                                                         


#[tauri::command]
pub fn export_file(path: &str, state: State<AppState>){
    let transformed = state.transformed.lock().unwrap();
    if let Some(ref data) = *transformed{
        let _ = fs::write(path, table_to_str(&data).unwrap());
    }
}