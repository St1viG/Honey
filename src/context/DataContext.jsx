import { createContext, useContext, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useLog } from "./LogContext";

const DataContext = createContext();

export function DataProvider({ children }) {
  const { addLog } = useLog();

  // Invoice state
  const [invoice, setInvoice] = useState(null);
  const [invoiceFilename, setInvoiceFilename] = useState(null);

  // Preview state
  const [preview, setPreview] = useState(null);
  const [changedCells, setChangedCells] = useState([]);
  const [exportText, setExportText] = useState("");

  // Sifrarnik (database) state
  const [sifrarnik, setSifrarnik] = useState(null);
  const [sifrarnikName, setSifrarnikName] = useState(null);
  const [sifrarnikTimestamp, setSifrarnikTimestamp] = useState(null);

  // Load persisted sifrarnik on mount
  useEffect(() => {
    const loadSifrarnik = async () => {
      try {
        const stored = await invoke("load_sifrarnik");
        if (stored) {
          const { table, name, timestamp } = JSON.parse(stored);
          setSifrarnik(table);
          setSifrarnikName(name);
          setSifrarnikTimestamp(timestamp);
          await invoke("set_database", { table });
          addLog("Loaded cached database");
        }
      } catch (e) {
        console.log("No stored sifrarnik found or failed to restore:", e);
      }
    };

    loadSifrarnik();
  }, []);

  const handleInvoiceLoad = (table, filename) => {
    setInvoice(table);
    setInvoiceFilename(filename);
    setPreview(null);
    setChangedCells([]);
    setExportText("");
    addLog(
      `Loaded invoice: ${filename} (${table.rows.length} rows, ${table.headers.length} columns)`
    );
  };

  const handleSifrarnikLoad = async (table, filename) => {
    const timestamp = new Date().toISOString();
    setSifrarnik(table);
    setSifrarnikName(filename);
    setSifrarnikTimestamp(timestamp);

    try {
      await invoke("save_sifrarnik", {
        data: JSON.stringify({ table, name: filename, timestamp }),
      });
      addLog(`Loaded and cached database: ${filename} (${table.rows.length} items)`);
    } catch (e) {
      addLog(`Loaded database: ${table.rows.length} items (cache failed: ${e})`);
    }
  };

  const updatePreview = (table, changed, exportStr) => {
    setPreview(table);
    setChangedCells(changed || []);
    setExportText(exportStr || "");
  };

  return (
    <DataContext.Provider
      value={{
        // Invoice
        invoice,
        invoiceFilename,
        handleInvoiceLoad,
        // Preview
        preview,
        setPreview,
        changedCells,
        setChangedCells,
        exportText,
        setExportText,
        updatePreview,
        // Sifrarnik
        sifrarnik,
        sifrarnikName,
        sifrarnikTimestamp,
        handleSifrarnikLoad,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
