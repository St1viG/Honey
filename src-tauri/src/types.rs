use indexmap::IndexMap;
use serde::{Serialize, Deserialize};
pub type Row = IndexMap<String, String>;
use std::sync::Mutex;

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RemovedBarcode {
    pub row_idx: usize,
    pub sifra: String,
    pub naziv: String,
    pub original_barcode: String,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PriceUpdateItem {
    pub row_idx: usize,
    pub sifra: String,
    pub naziv: String,
    pub ukupna_cena: f64,
    pub cena_mp: f64,
    pub percentage: f64,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct Table {
    pub headers: Vec<String>,
    pub rows: Vec<Row>,
}

impl Table{
    pub fn format_redovna_cena_4dec(&mut self){
        for row in &mut self.rows{
            if let Some(val) = row.get_mut("Ukupna cena") {
                if let Ok(n) = val.parse::<f64>() {
                    let excel_rounded = (n * 10000.0).round() / 10000.0;
                    *val = format!("{:.4}", excel_rounded);
                }
            }


            // row["Ukupna cena"] = row["Ukupna cena"].parse::<f64>().map(|n| format!("{:.4}", n)).unwrap();
        }
    }

    pub fn format_kol_i_mp_cena_2dec(&mut self){
        for row in &mut self.rows{
            if let Some(val) = row.get_mut("Količina") {
                if let Ok(n) = val.parse::<f64>() {
                    let excel_rounded = (n * 100.0).round() / 100.0;
                    *val = format!("{:.2}", excel_rounded);
                }
            }
            if let Some(val) = row.get_mut("Cena MP") {
                if let Ok(n) = val.parse::<f64>() {
                    let excel_rounded = (n * 100.0).round() / 100.0;
                    *val = format!("{:.2}", excel_rounded);
                }
            }


            // row["Količina"] = row["Količina"].parse::<f64>().map(|n| { format!("{:.2}", n)}).unwrap();
            // row["Cena MP"] = row["Cena MP"].parse::<f64>().map(|n| { format!("{:.2}", n)}).unwrap();
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

    pub fn remove_duplicate_barcodes(&mut self) -> Vec<RemovedBarcode> {
        let mut removed = Vec::new();
        for (idx, row) in self.rows.iter_mut().enumerate() {
            if let Some(barcode) = row.get("Bar kod") {
                if barcode.contains(',') {
                    removed.push(RemovedBarcode {
                        row_idx: idx,
                        sifra: row.get("Šifra artikla").cloned().unwrap_or_default(),
                        naziv: row.get("Naziv artikla").cloned().unwrap_or_default(),
                        original_barcode: barcode.clone(),
                    });
                    row.insert("Bar kod".to_string(), "".to_string());
                }
            }
        }
        removed
    }

    pub fn find_price_updates(&self, threshold: f64) -> Vec<PriceUpdateItem> {
        let mut items = Vec::new();
        for (idx, row) in self.rows.iter().enumerate() {
            let ukupna_cena = row.get("Ukupna cena")
                .and_then(|v| v.replace(',', ".").parse::<f64>().ok())
                .unwrap_or(0.0);
            let cena_mp = row.get("Cena MP")
                .and_then(|v| v.replace(',', ".").parse::<f64>().ok())
                .unwrap_or(0.0);

            if cena_mp > 0.0 {
                let percentage = (ukupna_cena / cena_mp) * 100.0;
                let percentage_rounded = (percentage * 100.0).round() / 100.0;

                if percentage_rounded > threshold {
                    items.push(PriceUpdateItem {
                        row_idx: idx,
                        sifra: row.get("Šifra artikla").cloned().unwrap_or_default(),
                        naziv: row.get("Naziv artikla").cloned().unwrap_or_default(),
                        ukupna_cena,
                        cena_mp,
                        percentage: percentage_rounded,
                    });
                }
            }
        }
        items
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

    pub fn compare_cells(self, table: &Table) -> Vec<CellAddress>{
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

pub fn table_to_str(transformed: &Table) -> Result<String, String> {
    let table = transformed.clone();
    let mut output: String = String::new();
    for row in &table.rows{
        let line = format!(
            "{},{},kom,PDVOS,{},{},{},{},{}", 
            row.get("Šifra artikla").map_or("", |v| v), 
            row.get("Naziv artikla").map_or("", |v| v),
            row.get("Bar kod").map_or("", |v| v),
            row.get("Količina").map_or("", |v| v),
            row.get("Ukupna cena").map_or("", |v| v),
            row.get("Ukupna cena").map_or("", |v| v),
            row.get("Cena MP").map_or("", |v| v)
        );
        output.push_str(&line);
        output.push_str("\n");
    }
    Ok(output)
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