import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Header } from "./components/Header";
import { TableView } from "./components/TableView";
import { BottomPanel } from "./components/BottomPanel/BottomPanel";
import { useLanguage } from "./i18n/LanguageContext";
import "./App.css";

function App() {
  const { t } = useLanguage();

  // Table state
  const [invoice, setInvoice] = useState(null);
  const [invoiceFilename, setInvoiceFilename] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sifrarnik, setSifrarnik] = useState(null);
  const [sifrarnikName, setSifrarnikName] = useState(null);
  const [sifrarnikTimestamp, setSifrarnikTimestamp] = useState(null);
  const [changedCells, setChangedCells] = useState([]);

  // Barcode panel state
  const [missingBarcodes, setMissingBarcodes] = useState([]);
  const [showBarcodePanel, setShowBarcodePanel] = useState(false);

  // Settings state
  const [columnMappings, setColumnMappings] = useState({});

  // Operations state (lifted up to preserve across tab switches)
  const [operations, setOperations] = useState({
    updateNames: false,
    formatPrice4Dec: false,
    removeDuplicateBarcodes: false,
    swapCommasToDots: false,
    autoUpdateBarKod: false,
    formatColAndMpPrice2Dec: false,
    autoUpdatePrice: false,
  });

  // Default operations (which checkboxes are checked on app mount)
  const [defaultOperations, setDefaultOperations] = useState({
    updateNames: false,
    formatPrice4Dec: false,
    removeDuplicateBarcodes: false,
    swapCommasToDots: false,
    autoUpdateBarKod: false,
    formatColAndMpPrice2Dec: false,
    autoUpdatePrice: false,
  });

  // Log state
  const [logs, setLogs] = useState([]);

  // Zoom state
  const [invoiceZoom, setInvoiceZoom] = useState(100);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [sifrarnikZoom, setSifrarnikZoom] = useState(100);

  // Left pane tab state
  const [leftPaneTab, setLeftPaneTab] = useState("invoice");

  // Right pane tab state
  const [rightPaneTab, setRightPaneTab] = useState("preview");
  const [exportText, setExportText] = useState("");

  // Synced scroll state
  const [syncScroll, setSyncScroll] = useState(false);
  const invoiceRef = useRef(null);
  const previewRef = useRef(null);

  // Track cmd/ctrl key for synced scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        setSyncScroll(true);
      }
    };
    const handleKeyUp = (e) => {
      if (!e.metaKey && !e.ctrlKey) {
        setSyncScroll(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleInvoiceScroll = (top, left) => {
    if (previewRef.current) {
      previewRef.current.scrollTo(top, left);
    }
  };

  const handlePreviewScroll = (top, left) => {
    if (invoiceRef.current) {
      invoiceRef.current.scrollTo(top, left);
    }
  };

  // Load persisted sifrarnik and mappings on startup
  useEffect(() => {
    const loadPersistedData = async () => {
      // Load sifrarnik from localStorage
      try {
        const stored = localStorage.getItem("sifrarnik");
        if (stored) {
          const { table, name, timestamp } = JSON.parse(stored);
          setSifrarnik(table);
          setSifrarnikName(name);
          setSifrarnikTimestamp(timestamp);
          // Load cached table into Rust backend state
          await invoke("set_database", { table });
          addLog("Loaded cached sifrarnik");
        }
      } catch (e) {
        console.log("No stored sifrarnik found or failed to restore:", e);
      }

      // Load column mappings from localStorage
      try {
        const storedMappings = localStorage.getItem("columnMappings");
        if (storedMappings) {
          setColumnMappings(JSON.parse(storedMappings));
        }
      } catch (e) {
        console.log("No stored mappings found");
      }

      // Load default operations from localStorage and apply them
      try {
        const storedDefaults = localStorage.getItem("defaultOperations");
        if (storedDefaults) {
          const defaults = JSON.parse(storedDefaults);
          setDefaultOperations(defaults);
          setOperations(defaults); // Apply defaults on mount
        }
      } catch (e) {
        console.log("No stored default operations found");
      }
    };

    loadPersistedData();
  }, []);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleInvoiceLoad = (table, filename) => {
    setInvoice(table);
    setInvoiceFilename(filename);
    setPreview(null);
    setChangedCells([]);
    setMissingBarcodes([]);
    setShowBarcodePanel(false);
    addLog(
      `Loaded invoice: ${filename} (${table.rows.length} rows, ${table.headers.length} columns)`,
    );
  };

  const handleSifrarnikLoad = (table, filename) => {
    const timestamp = new Date().toISOString();
    setSifrarnik(table);
    setSifrarnikName(filename);
    setSifrarnikTimestamp(timestamp);

    // Persist to localStorage
    try {
      localStorage.setItem("sifrarnik", JSON.stringify({ table, name: filename, timestamp }));
      addLog(`Loaded and cached sifrarnik: ${filename} (${table.rows.length} items)`);
    } catch (e) {
      addLog(`Loaded sifrarnik: ${table.rows.length} items (cache failed: ${e})`);
    }
  };

  const handlePreviewUpdate = (table, changed, missing, exportStr) => {
    setExportText(exportStr);
    setPreview(table);
    setChangedCells(changed || []);

    if (missing && missing.length > 0) {
      setMissingBarcodes(missing);
      setShowBarcodePanel(true);
      addLog(`Found ${missing.length} items with missing barcodes`);
    } else {
      setShowBarcodePanel(false);
    }
  };

  const handleBarcodeUpdate = async (rowIdx, barcode) => {
    try {
      const result = await invoke("update_barcode", {
        rowIdx,
        barcode,
      });
      setPreview(result.table);
      setMissingBarcodes((prev) =>
        prev.filter((item) => item.rowIdx !== rowIdx),
      );
      addLog(`Updated barcode for row ${rowIdx + 1}`);

      if (missingBarcodes.length <= 1) {
        setShowBarcodePanel(false);
      }
    } catch (e) {
      addLog(`Failed to update barcode: ${e}`);
    }
  };

  const handleBarcodeSkip = (rowIdx) => {
    setMissingBarcodes((prev) => prev.filter((item) => item.rowIdx !== rowIdx));
    addLog(`Skipped barcode for row ${rowIdx + 1}`);

    if (missingBarcodes.length <= 1) {
      setShowBarcodePanel(false);
    }
  };

  const handleMappingsChange = (newMappings) => {
    setColumnMappings(newMappings);
  };

  return (
    <div className="app">
      <Header
        onInvoiceLoad={handleInvoiceLoad}
        onSifrarnikLoad={handleSifrarnikLoad}
        sifrarnikLoaded={!!sifrarnik}
        sifrarnikName={sifrarnikName}
        sifrarnikTimestamp={sifrarnikTimestamp}
      />

      <main className="main-content">
        <div className="split-pane">
          <div className="pane left-pane">
            <div className="pane-tabs">
              <button
                className={`pane-tab ${leftPaneTab === "invoice" ? "active" : ""}`}
                onClick={() => setLeftPaneTab("invoice")}
              >
                {t.invoice}
              </button>
              {sifrarnik && (
                <button
                  className={`pane-tab ${leftPaneTab === "sifrarnik" ? "active" : ""}`}
                  onClick={() => setLeftPaneTab("sifrarnik")}
                >
                  {t.database}
                </button>
              )}
            </div>
            {leftPaneTab === "invoice" ? (
              <TableView
                ref={invoiceRef}
                table={invoice}
                zoom={invoiceZoom}
                onZoomIn={() => setInvoiceZoom((z) => Math.min(z + 20, 200))}
                onZoomOut={() => setInvoiceZoom((z) => Math.max(z - 20, 40))}
                syncScrollEnabled={syncScroll}
                onSyncScroll={handleInvoiceScroll}
              />
            ) : (
              <TableView
                table={sifrarnik}
                zoom={sifrarnikZoom}
                onZoomIn={() => setSifrarnikZoom((z) => Math.min(z + 20, 200))}
                onZoomOut={() => setSifrarnikZoom((z) => Math.max(z - 20, 40))}
              />
            )}
          </div>
          <div className="pane-divider" />
          <div className="pane right-pane">
            <div className="pane-tabs">
              <button
                className={`pane-tab ${rightPaneTab === "preview" ? "active" : ""}`}
                onClick={() => setRightPaneTab("preview")}
              >
                {t.preview}
              </button>
              <button
                className={`pane-tab ${rightPaneTab === "export" ? "active" : ""}`}
                onClick={() => setRightPaneTab("export")}
              >
                {t.exportDat}
              </button>
            </div>
            {rightPaneTab === "preview" ? (
              <TableView
                ref={previewRef}
                table={preview}
                originalTable={invoice}
                highlightCells={changedCells}
                zoom={previewZoom}
                onZoomIn={() => setPreviewZoom((z) => Math.min(z + 20, 200))}
                onZoomOut={() => setPreviewZoom((z) => Math.max(z - 20, 40))}
                syncScrollEnabled={syncScroll}
                onSyncScroll={handlePreviewScroll}
              />
            ) : (
              <div className="export-preview">
                {exportText ? (
                  <pre className="export-text">{exportText}</pre>
                ) : (
                  <p className="export-empty">
                    No export preview generated yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomPanel
        invoice={invoice}
        invoiceFilename={invoiceFilename}
        sifrarnik={sifrarnik}
        sifrarnikName={sifrarnikName}
        sifrarnikTimestamp={sifrarnikTimestamp}
        onPreviewUpdate={handlePreviewUpdate}
        onLogMessage={addLog}
        logs={logs}
        missingBarcodes={missingBarcodes}
        onBarcodeUpdate={handleBarcodeUpdate}
        onBarcodeSkip={handleBarcodeSkip}
        showBarcodePanel={showBarcodePanel}
        columnMappings={columnMappings}
        onMappingsChange={handleMappingsChange}
        onShowSifrarnik={() => setLeftPaneTab("sifrarnik")}
        operations={operations}
        onOperationsChange={setOperations}
        defaultOperations={defaultOperations}
        onDefaultOperationsChange={setDefaultOperations}
      />
    </div>
  );
}

export default App;
