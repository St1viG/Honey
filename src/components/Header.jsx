import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { useLanguage } from "../i18n/LanguageContext";

// Extract filename without extension from path
const getFilenameWithoutExt = (path) => {
  if (!path) return null;
  const filename = path.split(/[/\\]/).pop(); // Handle both / and \
  return filename.replace(/\.[^.]+$/, ""); // Remove extension
};

export function Header({ onInvoiceLoad, onSifrarnikLoad, sifrarnikLoaded, sifrarnikName, sifrarnikTimestamp }) {
  const { t } = useLanguage();

  // Format timestamp for display
  const formatTimestamp = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `${t.today} ${t.at} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return t.yesterday;
    } else if (diffDays < 7) {
      return `${diffDays} ${t.daysAgo}`;
    } else {
      return date.toLocaleDateString();
    }
  };
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
          const filename = getFilenameWithoutExt(file);
          onInvoiceLoad(table, filename);
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
        const filename = getFilenameWithoutExt(file);
        onSifrarnikLoad(table, filename);
      } catch (e) {
        console.error("Failed to load sifrarnik:", e);
      }
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>{t.appTitle}</h1>
      </div>
      <div className="header-right">
        <button onClick={handleLoadInvoice}>{t.loadInvoice}</button>
        <button onClick={handleLoadDatabase}>
          {sifrarnikLoaded ? t.replaceDatabase : t.loadDatabase}
        </button>
        {sifrarnikLoaded && (
          <span
            className="status-badge"
            title={`${sifrarnikName || t.database}\n${t.loaded}: ${sifrarnikTimestamp ? formatTimestamp(sifrarnikTimestamp) : t.unknown}`}
          >
            {t.databaseLoaded}
          </span>
        )}
      </div>
    </header>
  );
}
