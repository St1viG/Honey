use indexmap::IndexMap;
use serde::{Serialize, Deserialize};
pub type Row = IndexMap<String, String>;
use std::sync::Mutex;

#[derive(Clone, Serialize, Deserialize)]
pub struct Table {
    pub headers: Vec<String>,
    pub rows: Vec<Row>,
}

impl Table{
    pub fn format_redovna_cena_4dec(&mut self){
        for row in &mut self.rows{
            row["Ukupna cena"] = row["Ukupna cena"].parse::<f64>().map(|n| format!("{:.4}", n)).unwrap();
        }
    }

    pub fn update_price(){

    }

    pub fn update_names(mut self, database: &Table) -> Self {
        for row in &mut self.rows {
            if let Some(sifra) = row.get("Šifra artikla") {
                if let Some(correct_name) = database.get_find_value(sifra) {
                    row.insert("Naziv artikla".to_string(), correct_name);
                }
            }
        }
        self
    }

    pub fn get_find_value(&self, id: &str) -> Option<String> {
    self.rows
        .iter()
        .find(|row| row.get("sifra").map(|v: &String| v == id).unwrap_or(false))
        .and_then(|row| row.get("naziv").cloned())
    }

    pub fn remove_duplicate_barcodes(&mut self){
        for row in &mut self.rows{
            if row["Bar kod"].contains(','){
                row["Bar kod"] = "".to_string();
            }
        }
    }

    pub fn swap_all_commas_to_dots(&mut self){
        for row in self.rows.iter_mut() {
            for val in row.values_mut() {
                *val = val.replace(',', ".");
            }
        }
    }
    //Claude stuff
    pub fn cmp_tables(original: &Table, transformed: &Table){
        let mut cnt = 0;
        println!("\n=== Changes in 'Naziv artikla' column ===");
        for (i, (orig_row, trans_row)) in original.rows.iter().zip(transformed.rows.iter()).enumerate() {
            let orig_naziv = orig_row.get("Naziv artikla").map(|s| s.as_str()).unwrap_or("");
            let trans_naziv = trans_row.get("Naziv artikla").map(|s| s.as_str()).unwrap_or("");

            if orig_naziv != trans_naziv {
                let sifra = orig_row.get("Šifra artikla").map(|s| s.as_str()).unwrap_or("N/A");
                println!("Row {}: Šifra: {} | \"{}\" -> \"{}\"", i + 1, sifra, orig_naziv, trans_naziv);
                cnt+=1;
            }
        }
        println!("=== End of changes ===");
        println!("TOTAL OF {} CHANGES OF {} TOTAL", cnt, original.rows.len());
    }

    pub fn compareCells(self, table: &Table) -> Vec<CellAddress>{
        let mut changed: Vec<CellAddress> = Vec::new();
        for (row_no, row) in self.rows.iter().enumerate(){
            for (col, value) in row{
                if value != table.rows[row_no].get(col).unwrap(){
                    changed.push(CellAddress { row: (row_no), col: (col.to_string()) });
                }
            }
        }
        changed
    }

}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct CellAddress {
    pub row: usize,
    pub col: String,
}

pub struct PreviewResult {
    pub original: Table,
    pub transformed: Table,
    pub changed_cells: Vec<CellAddress>,
}


pub struct AppState {
    pub invoice: Mutex<Option<Table>>,
    pub transformed: Mutex<Option<Table>>,
    pub database: Mutex<Option<Table>>,
}


impl AppState {
    pub fn new() -> Self {
        Self {
            invoice: Mutex::new(None),
            transformed: Mutex::new(None),
            database: Mutex::new(None),
        }
    }
}


