use std::{fs::File};
use std::io::Write;

use calamine::*;
use unicode_normalization::UnicodeNormalization;
use crate::types::{Table,Row};


pub fn read_exel(path: &str)-> Result<Table, String>{
    let mut workbook: Xls<_> = open_workbook(path)
        .map_err(|e| format!("Failed to open: {}", e))?;

    let range = workbook.worksheet_range(&workbook.sheet_names().to_vec()[0])
        .map_err(|e| format!("Failed to get first sheet: {}", e))?;

    let mut rows_iter = range.rows();

    let headers: Vec<String> = rows_iter
        .next()
        .ok_or("Empty sheet")?
        .iter()
        .map(|c| cell_to_string(c))
        .collect();


    let rows: Vec<Row> = rows_iter
        .map(|row| {
            headers.iter()
                .zip(row.iter())
                .map(|(h, c)| (h.clone(), cell_to_string(c)))
                .collect()
        })
        .collect();

    Ok(Table { headers, rows })
}

fn cell_to_string(cell: &Data) -> String {
    let raw = match cell {
        Data::Empty => return String::new(),
        Data::String(s) => s.clone(),
        Data::Int(i) => return i.to_string(),
        Data::Float(f) => {
            return if (f.round() - f).abs() < 0.0001 {
                format!("{}", f.round() as i64)
            } else {
                format!("{}", f)
            }
        },
        Data::Bool(b) => return b.to_string(),
        Data::DateTime(dt) => return format!("{}", dt),
        Data::Error(e) => return format!("{:?}", e),
        Data::DateTimeIso(s) => s.clone(),
        Data::DurationIso(s) => s.clone(),
    };
    raw.nfc().collect::<String>().trim_end().to_owned()
}


pub fn export_file(content: String, path: &str) -> Result<(), String>{
    let mut file = File::create(path).map_err(|e| e.to_string())?;
    let _ = writeln!(file, "{}", content);
    Ok(())
}