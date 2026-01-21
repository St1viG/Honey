// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use petricautomation_lib::types::Table;



fn main() {
    // let original: Table = petricautomation_lib::exel::read_exel("../public/F-100958.xls").unwrap();
    // let mut database: Table = petricautomation_lib::exel::read_exel("../public/sifarnik copy.xls").unwrap();

    // database.headers.clear();
    // database.headers.push("Šifra artikla".to_string());
    // database.headers.push("Naziv artikla".to_string());
    // let transformed = original.clone().update_names(&database);

    // println!("{:?}, {:?}", transformed.headers, database.headers);


    // Table::cmp_tables(&original,&transformed);

    // println!("{:?}", transformed.rows[0]);
    //test formatiranja redovne cene na 4 decimale
    // for i in 0..10{
    //     println!("{}", transformed.rows[i].get("Ukupna cena").unwrap());
    // }

    // transformed.format_redovna_cena_4dec();

    // for i in 0..10{
    //     println!("{}", transformed.rows[i].get("Ukupna cena").unwrap());
    // }
    

    // petricautomation_lib::exel::read-exel("../public/F-100955 - Copy.xls").unwrap(); 
    // petricautomation_lib::exel::read-exel("../public/F-100958.xls").unwrap(); 
    petricautomation_lib::run();
}
