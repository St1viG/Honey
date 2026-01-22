use std::{fs::File, path::Path};
use std::io::Write;

use calamine::*;
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
    match cell {
        Data::Empty => String::new(),
        Data::String(s) => s.clone(),
        Data::Int(i) => i.to_string(),
        Data::Float(f) => {
            if (f.round() - f).abs() < 0.0001 {
                format!("{}", f.round() as i64)
            } else {
                format!("{}", f)
            }
        },
        Data::Bool(b) => b.to_string(),
        Data::DateTime(dt) => format!("{}", dt),
        Data::Error(e) => format!("{:?}", e),
        Data::DateTimeIso(s) => s.clone(),
        Data::DurationIso(s) => s.clone(),
    }
}


pub fn export_file(content: String, path: &str) -> Result<(), String>{
    let mut file = File::create(path).map_err(|e| e.to_string())?;
    writeln!(file, "{}", content);
    Ok(())
}