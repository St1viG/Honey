export const translations = {
  en: {
    // Header
    appTitle: "Petric Automation",
    loadInvoice: "Load Invoice",
    loadDatabase: "Load Database",
    replaceDatabase: "Replace Database",
    databaseLoaded: "Database loaded",

    // Tabs
    invoice: "Invoice",
    database: "Database",
    preview: "Preview",
    exportDat: "Export (.dat)",
    operations: "Operations",
    barcodes: "Barcodes",
    settings: "Settings",

    // Table view
    noData: "No data",
    noInvoiceLoaded: "No invoice loaded",
    noDatabaseLoaded: "No database loaded",
    find: "Find...",

    // Operations
    operationsTitle: "Operations",
    updateNames: "Update names from Database",
    formatPrice4Dec: "Format prices to 4 decimals",
    formatColAndMpPrice2Dec: "Format quantity and MP price to 2 decimals",
    removeDuplicateBarcodes: "Remove duplicate barcodes",
    autoUpdateBarKod: "Auto-update barcodes (opens panel for missing)",
    swapCommasToDots: "Swap commas to dots",
    autoUpdatePrice: "Auto-update prices with >67%",
    apply: "Apply",
    processing: "Processing...",
    saveAs: "Save As...",
    needsDatabase: "needs database",

    // Log
    log: "Log",
    noOperationsYet: "No operations performed yet",

    // Barcodes panel
    barcodesTitle: "Missing Barcodes",
    barcodesDescription: "Enter barcodes for items that couldn't be matched automatically.",
    itemCode: "Item Code",
    itemName: "Item Name",
    barcode: "Barcode",
    actions: "Actions",
    save: "Save",
    skip: "Skip",
    skipAll: "Skip All",

    // Barcode modal
    missingBarcodes: "Missing Barcodes",
    itemsNeedBarcodes: "items need barcodes",
    enterBarcode: "Enter barcode...",
    applyBarcodes: "Apply Barcodes",
    previousBarcodesFound: "Previous Barcodes Found",
    previousBarcodesDesc: "You've entered barcodes for this invoice before. Would you like to use the previous values or enter new ones?",
    usePrevious: "Use Previous",
    enterNew: "Enter New",
    noBarcodeColumn: "No barcode column found in database. Please configure column mappings in Settings.",
    autoFetchSuccess: "Auto-fetched barcodes from database",
    autoFetchPartial: "Some barcodes couldn't be found in database",

    // Settings
    columnMappings: "Column Mappings",
    columnMappingsDesc: "Connect database columns to invoice columns. This tells the app which columns correspond to each other.",
    loadDatabaseFirst: "Load a database first to configure mappings.",
    field: "Field",
    databaseColumn: "Database Column",
    invoiceColumn: "Invoice Column",
    select: "-- Select --",
    saveMappings: "Save Mappings",
    saving: "Saving...",

    // Settings - Database info
    databaseInfo: "Database",
    file: "File",
    loaded: "Loaded",
    items: "Items",
    unknown: "Unknown",
    viewDatabase: "View Database",
    noDatabaseLoadedMsg: "No database loaded. Load one using the button in the header.",

    // Settings - Default operations
    defaultOperations: "Default Operations",
    defaultOperationsDesc: "Select which operations should be checked by default when the app starts.",
    saveDefaults: "Save Defaults",

    // Settings - Price threshold
    priceThreshold: "Price Update Threshold",
    priceThresholdDesc: "Minimum percentage difference required to auto-update prices.",

    // Settings - Language
    language: "Language",
    languageDesc: "Select your preferred language.",

    // Field labels
    sifraId: "Sifra (ID)",
    nazivName: "Naziv (Name)",
    barKodBarcode: "Bar Kod (Barcode)",
    cijenaPrice: "Cijena (Price)",
    jmUnit: "JM (Unit)",

    // Price update modal
    priceUpdates: "Price Updates",
    itemsNeedPriceUpdate: "items above threshold",
    ukupnaCena: "Ukupna Cena",
    currentCenaMp: "Current Cena MP",
    currentPercentage: "Current %",
    newCenaMp: "New Cena MP",
    newPercentage: "New %",
    enterNewPrice: "Enter new price...",
    applyPrices: "Apply Prices",

    // Misc
    rows: "rows",
    columns: "columns",
    today: "today",
    yesterday: "yesterday",
    daysAgo: "days ago",
    at: "at",
  },

  sr: {
    // Header
    appTitle: "Petric Automatizacija",
    loadInvoice: "Učitaj fakturu",
    loadDatabase: "Učitaj šifarnik",
    replaceDatabase: "Zameni šifarnik",
    databaseLoaded: "Šifarnik učitan",

    // Tabs
    invoice: "Faktura",
    database: "Šifarnik",
    preview: "Pregled",
    exportDat: "Izvoz (.dat)",
    operations: "Operacije",
    barcodes: "Bar kodovi",
    settings: "Podešavanja",

    // Table view
    noData: "Nema podataka",
    noInvoiceLoaded: "Faktura nije učitana",
    noDatabaseLoaded: "Šifarnik nije učitan",
    find: "Pretraži...",

    // Operations
    operationsTitle: "Operacije",
    updateNames: "Ažuriraj nazive iz šifarnika",
    formatPrice4Dec: "Formatiraj cene na 4 decimale",
    formatColAndMpPrice2Dec: "Formatiraj količinu i MP cenu na 2 decimale",
    removeDuplicateBarcodes: "Ukloni duple bar kodove",
    autoUpdateBarKod: "Auto-ažuriraj bar kodove (otvara panel za nedostajuće)",
    swapCommasToDots: "Zameni zareze tačkama",
    autoUpdatePrice: "Auto-ažuriraj cene sa >67%",
    apply: "Primeni",
    processing: "Obrada...",
    saveAs: "Sačuvaj kao...",
    needsDatabase: "potreban šifarnik",

    // Log
    log: "Dnevnik",
    noOperationsYet: "Još nema izvršenih operacija",

    // Barcodes panel
    barcodesTitle: "Nedostajući bar kodovi",
    barcodesDescription: "Unesite bar kodove za artikle koji nisu automatski pronađeni.",
    itemCode: "Šifra artikla",
    itemName: "Naziv artikla",
    barcode: "Bar kod",
    actions: "Akcije",
    save: "Sačuvaj",
    skip: "Preskoči",
    skipAll: "Preskoči sve",

    // Barcode modal
    missingBarcodes: "Nedostajući bar kodovi",
    itemsNeedBarcodes: "artikala treba bar kodove",
    enterBarcode: "Unesite bar kod...",
    applyBarcodes: "Primeni bar kodove",
    previousBarcodesFound: "Pronađeni prethodni bar kodovi",
    previousBarcodesDesc: "Već ste uneli bar kodove za ovu fakturu. Da li želite da koristite prethodne vrednosti ili da unesete nove?",
    usePrevious: "Koristi prethodne",
    enterNew: "Unesi nove",
    noBarcodeColumn: "Kolona bar koda nije pronađena u šifarniku. Molimo konfigurišite mapiranje kolona u Podešavanjima.",
    autoFetchSuccess: "Bar kodovi automatski preuzeti iz šifarnika",
    autoFetchPartial: "Neki bar kodovi nisu pronađeni u šifarniku",

    // Settings
    columnMappings: "Mapiranje kolona",
    columnMappingsDesc: "Povežite kolone šifarnika sa kolonama fakture. Ovo govori aplikaciji koje kolone odgovaraju jedna drugoj.",
    loadDatabaseFirst: "Prvo učitajte šifarnik da biste konfigurisali mapiranje.",
    field: "Polje",
    databaseColumn: "Kolona šifarnika",
    invoiceColumn: "Kolona fakture",
    select: "-- Izaberi --",
    saveMappings: "Sačuvaj mapiranje",
    saving: "Čuvanje...",

    // Settings - Database info
    databaseInfo: "Šifarnik",
    file: "Fajl",
    loaded: "Učitano",
    items: "Stavki",
    unknown: "Nepoznato",
    viewDatabase: "Prikaži šifarnik",
    noDatabaseLoadedMsg: "Šifarnik nije učitan. Učitajte ga pomoću dugmeta u zaglavlju.",

    // Settings - Default operations
    defaultOperations: "Podrazumevane operacije",
    defaultOperationsDesc: "Izaberite koje operacije treba da budu označene po podrazumevanom kada se aplikacija pokrene.",
    saveDefaults: "Sačuvaj podrazumevano",

    // Settings - Price threshold
    priceThreshold: "Prag za ažuriranje cena",
    priceThresholdDesc: "Minimalna procentualna razlika potrebna za automatsko ažuriranje cena.",

    // Settings - Language
    language: "Jezik",
    languageDesc: "Izaberite željeni jezik.",

    // Field labels
    sifraId: "Šifra (ID)",
    nazivName: "Naziv (Ime)",
    barKodBarcode: "Bar kod",
    cijenaPrice: "Cijena (Cena)",
    jmUnit: "JM (Jedinica mere)",

    // Price update modal
    priceUpdates: "Ažuriranje cena",
    itemsNeedPriceUpdate: "artikala iznad praga",
    ukupnaCena: "Ukupna Cena",
    currentCenaMp: "Trenutna Cena MP",
    currentPercentage: "Trenutni %",
    newCenaMp: "Nova Cena MP",
    newPercentage: "Novi %",
    enterNewPrice: "Unesite novu cenu...",
    applyPrices: "Primeni cene",

    // Misc
    rows: "redova",
    columns: "kolona",
    today: "danas",
    yesterday: "juče",
    daysAgo: "dana ranije",
    at: "u",
  },
};
