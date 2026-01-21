import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Header } from "./components/Header";
import { TableView } from "./components/TableView";
import { BottomPanel } from "./components/BottomPanel/BottomPanel";
import "./App.css";

function App() {
  // Table state
  const [invoice, setInvoice] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sifrarnik, setSifrarnik] = useState(null);
  const [changedCells, setChangedCells] = useState([]);

  // Barcode panel state
  const [missingBarcodes, setMissingBarcodes] = useState([]);
  const [showBarcodePanel, setShowBarcodePanel] = useState(false);

  // Settings state
  const [columnMappings, setColumnMappings] = useState({});

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

  // Load persisted sifrarnik and mappings on startup
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const storedSifrarnik = await invoke("get_stored_sifrarnik");
        if (storedSifrarnik) {
          setSifrarnik(storedSifrarnik);
          addLog("Loaded stored sifrarnik");
        }
      } catch (e) {
        console.log("No stored sifrarnik found");
      }

      try {
        const storedMappings = await invoke("load_column_mappings");
        if (storedMappings) {
          setColumnMappings(storedMappings);
        }
      } catch (e) {
        console.log("No stored mappings found");
      }
    };

    loadPersistedData();
  }, []);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleInvoiceLoad = (table) => {
    setInvoice(table);
    setPreview(null);
    setChangedCells([]);
    setMissingBarcodes([]);
    setShowBarcodePanel(false);
    addLog(
      `Loaded invoice: ${table.rows.length} rows, ${table.headers.length} columns`,
    );
  };

  const handleSifrarnikLoad = (table) => {
    setSifrarnik(table);
    addLog(`Loaded sifrarnik: ${table.rows.length} items`);
  };

  const handlePreviewUpdate = (table, changed, missing) => {
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
      />

      <main className="main-content">
        <div className="split-pane">
          <div className="pane left-pane">
            <div className="pane-tabs">
              <button
                className={`pane-tab ${leftPaneTab === "invoice" ? "active" : ""}`}
                onClick={() => setLeftPaneTab("invoice")}
              >
                Invoice
              </button>
              {sifrarnik && (
                <button
                  className={`pane-tab ${leftPaneTab === "sifrarnik" ? "active" : ""}`}
                  onClick={() => setLeftPaneTab("sifrarnik")}
                >
                  Sifrarnik
                </button>
              )}
            </div>
            {leftPaneTab === "invoice" ? (
              <TableView
                table={invoice}
                zoom={invoiceZoom}
                onZoomIn={() => setInvoiceZoom((z) => Math.min(z + 20, 200))}
                onZoomOut={() => setInvoiceZoom((z) => Math.max(z - 20, 40))}
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
                Preview
              </button>
              <button
                className={`pane-tab ${rightPaneTab === "export" ? "active" : ""}`}
                onClick={() => setRightPaneTab("export")}
              >
                Export (.dat)
              </button>
            </div>
            {rightPaneTab === "preview" ? (
              <TableView
                table={preview}
                highlightCells={changedCells}
                zoom={previewZoom}
                onZoomIn={() => setPreviewZoom((z) => Math.min(z + 20, 200))}
                onZoomOut={() => setPreviewZoom((z) => Math.max(z - 20, 40))}
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
        sifrarnik={sifrarnik}
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
      />
    </div>
  );
}

export default App;
