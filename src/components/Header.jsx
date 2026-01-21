import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

export function Header({ onInvoiceLoad, onSifrarnikLoad, sifrarnikLoaded }) {
  const handleLoadInvoice = async () => {
    try {
      console.log("Opening file dialog...");
      const file = await open({
        multiple: false,
        filters: [{ name: "Excel", extensions: ["xls", "xlsx"] }],
      });
      console.log("Selected file:", file);
      if (file) {
        try {
          const table = await invoke("load_invoice", { path: file });
          onInvoiceLoad(table);
        } catch (e) {
          console.error("Failed to load invoice:", e);
        }
      }
    } catch (e) {
      console.error("Failed to open file dialog:", e);
    }
  };

  const handleLoadDatabase = async () => {
    const file = await open({
      multiple: false,
      filters: [{ name: "Excel", extensions: ["xls", "xlsx"] }],
    });
    if (file) {
      try {
        const table = await invoke("load_database", { path: file });
        onSifrarnikLoad(table);
      } catch (e) {
        console.error("Failed to load sifrarnik:", e);
      }
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Petric Automation</h1>
      </div>
      <div className="header-right">
        <button onClick={handleLoadInvoice}>Load Invoice</button>
        <button onClick={handleLoadDatabase}>
          {sifrarnikLoaded ? "Replace Sifrarnik" : "Load Sifrarnik"}
        </button>
        {sifrarnikLoaded && (
          <span className="status-badge">Sifrarnik loaded</span>
        )}
      </div>
    </header>
  );
}
