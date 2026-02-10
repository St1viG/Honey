import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Header } from "./components/Header";
import { TableView } from "./components/TableView";
import { BottomPanel } from "./components/BottomPanel/BottomPanel";
import { BarcodeModal } from "./components/BarcodeModal";
import { NameUpdateModal } from "./components/NameUpdateModal";
import { PriceUpdateModal } from "./components/PriceUpdateModal";
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

  // Barcode modal state
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [emptyBarcodeItems, setEmptyBarcodeItems] = useState([]);
  const [cachedBarcodes, setCachedBarcodes] = useState({});
  const [pendingResult, setPendingResult] = useState(null);

  // Duplicate name modal state
  const [showNameModal, setShowNameModal] = useState(false);
  const [duplicateNameItems, setDuplicateNameItems] = useState([]);

  // Price update modal state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceUpdateItems, setPriceUpdateItems] = useState([]);

  // Operations state
  const [operations, setOperations] = useState({
    updateNames: false,
    formatPrice4Dec: false,
    removeDuplicateBarcodes: false,
    swapCommasToDots: false,
    autoUpdateBarKod: false,
    formatColAndMpPrice2Dec: false,
    autoUpdatePrice: false,
    detectDuplicateNames: false,
  });

  // Default operations
  const [defaultOperations, setDefaultOperations] = useState({
    updateNames: false,
    formatPrice4Dec: false,
    removeDuplicateBarcodes: false,
    swapCommasToDots: false,
    autoUpdateBarKod: false,
    formatColAndMpPrice2Dec: false,
    autoUpdatePrice: false,
    detectDuplicateNames: false,
  });

  // Price threshold setting
  const [priceThreshold, setPriceThreshold] = useState(67);

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

  // Load persisted sifrarnik and settings on startup
  useEffect(() => {
    const loadPersistedData = async () => {
      // Load sifrarnik from backend
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

      // Load settings from backend
      try {
        const stored = await invoke("load_settings");
        if (stored) {
          const settings = JSON.parse(stored);
          if (settings.defaultOperations) {
            setDefaultOperations(settings.defaultOperations);
            setOperations(settings.defaultOperations);
          }
          if (settings.priceThreshold !== undefined) {
            setPriceThreshold(settings.priceThreshold);
          }
        }
      } catch (e) {
        console.log("No stored settings found:", e);
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
    setEmptyBarcodeItems([]);
    setShowBarcodeModal(false);
    addLog(
      `Loaded invoice: ${filename} (${table.rows.length} rows, ${table.headers.length} columns)`,
    );
  };

  const handleSifrarnikLoad = async (table, filename) => {
    const timestamp = new Date().toISOString();
    setSifrarnik(table);
    setSifrarnikName(filename);
    setSifrarnikTimestamp(timestamp);

    try {
      await invoke("save_sifrarnik", { data: JSON.stringify({ table, name: filename, timestamp }) });
      addLog(`Loaded and cached database: ${filename} (${table.rows.length} items)`);
    } catch (e) {
      addLog(`Loaded database: ${table.rows.length} items (cache failed: ${e})`);
    }
  };

  // Called when operations complete - may trigger barcode, name, or price modal
  const handlePreviewUpdate = (table, changed, emptyItems, nameItems, priceItems, exportStr, autoUpdateBarcodes) => {
    // If auto-update is enabled and there are empty items, try to fetch from sifrarnik
    if (autoUpdateBarcodes && emptyItems && emptyItems.length > 0 && sifrarnik) {
      // Static column names for sifrarnik
      const barcodeColumn = "barkod";
      const sifraColumn = "sifra";

      let fetchedCount = 0;
      const updatedTable = { ...table, rows: [...table.rows] };

      emptyItems.forEach((item) => {
        const sifrarnikRow = sifrarnik.rows.find(
          (r) => r[sifraColumn] === item.sifra
        );
        if (sifrarnikRow && sifrarnikRow[barcodeColumn]) {
          updatedTable.rows[item.rowIdx] = {
            ...updatedTable.rows[item.rowIdx],
            "Bar kod": sifrarnikRow[barcodeColumn],
          };
          fetchedCount++;
        }
      });

      if (fetchedCount === emptyItems.length) {
        addLog(`${t.autoFetchSuccess}: ${fetchedCount} items`);
        table = updatedTable;
        emptyItems = [];
      } else if (fetchedCount > 0) {
        addLog(`${t.autoFetchPartial}: ${fetchedCount}/${emptyItems.length}`);
        table = updatedTable;
        emptyItems = emptyItems.filter((item) => {
          const row = updatedTable.rows[item.rowIdx];
          return !row["Bar kod"] || row["Bar kod"].trim() === "";
        });
      }
    }

    // Store items for the modal chain
    setDuplicateNameItems(nameItems || []);
    setPriceUpdateItems(priceItems || []);

    // Modal chain: barcodes → duplicate names → prices
    if (emptyItems && emptyItems.length > 0 && !autoUpdateBarcodes) {
      setEmptyBarcodeItems(emptyItems);
      setPendingResult({ table, changed, exportStr });
      setShowBarcodeModal(true);
      return;
    }

    if (nameItems && nameItems.length > 0) {
      setPendingResult({ table, changed, exportStr });
      setShowNameModal(true);
      return;
    }

    if (priceItems && priceItems.length > 0) {
      setPendingResult({ table, changed, exportStr });
      setShowPriceModal(true);
      return;
    }

    // Normal flow
    setExportText(exportStr);
    setPreview(table);
    setChangedCells(changed || []);
  };

  const handleBarcodeModalSubmit = (barcodeInputs) => {
    if (!pendingResult) return;

    const { table, changed, exportStr } = pendingResult;
    const updatedTable = { ...table, rows: [...table.rows] };
    const newChangedCells = [...(changed || [])];
    let updatedCount = 0;

    Object.entries(barcodeInputs).forEach(([rowIdx, barcode]) => {
      if (barcode && barcode.trim()) {
        updatedTable.rows[parseInt(rowIdx)] = {
          ...updatedTable.rows[parseInt(rowIdx)],
          "Bar kod": barcode.trim(),
        };
        // Add to changed cells for highlighting
        newChangedCells.push({ row: parseInt(rowIdx), col: "Bar kod" });
        updatedCount++;
      }
    });

    if (invoiceFilename && updatedCount > 0) {
      setCachedBarcodes((prev) => ({
        ...prev,
        [invoiceFilename]: { ...prev[invoiceFilename], ...barcodeInputs },
      }));
    }

    addLog(`Applied ${updatedCount} barcodes manually`);
    setShowBarcodeModal(false);

    // Chain: next check duplicate names, then prices
    if (duplicateNameItems && duplicateNameItems.length > 0) {
      setPendingResult({ table: updatedTable, changed: newChangedCells, exportStr });
      setShowNameModal(true);
    } else if (priceUpdateItems && priceUpdateItems.length > 0) {
      setPendingResult({ table: updatedTable, changed: newChangedCells, exportStr });
      setShowPriceModal(true);
    } else {
      setPreview(updatedTable);
      setChangedCells(newChangedCells);
      setExportText(exportStr);
      setPendingResult(null);
    }
  };

  const handleUsePreviousBarcodes = (previousBarcodes) => {
    handleBarcodeModalSubmit(previousBarcodes);
  };

  const handleBarcodeModalSkip = () => {
    if (!pendingResult) return;

    const { table, changed, exportStr } = pendingResult;
    addLog("Skipped barcode entry");
    setShowBarcodeModal(false);

    // Chain: next check duplicate names, then prices
    if (duplicateNameItems && duplicateNameItems.length > 0) {
      setShowNameModal(true);
    } else if (priceUpdateItems && priceUpdateItems.length > 0) {
      setShowPriceModal(true);
    } else {
      setPreview(table);
      setChangedCells(changed || []);
      setExportText(exportStr);
      setPendingResult(null);
    }
  };

  // Name update modal handlers
  const handleNameModalSubmit = (nameInputs) => {
    if (!pendingResult) return;

    const { table, changed, exportStr } = pendingResult;
    const updatedTable = { ...table, rows: [...table.rows] };
    const newChangedCells = [...(changed || [])];
    let updatedCount = 0;

    Object.entries(nameInputs).forEach(([rowIdx, newName]) => {
      if (newName && newName.trim()) {
        updatedTable.rows[parseInt(rowIdx)] = {
          ...updatedTable.rows[parseInt(rowIdx)],
          "Naziv artikla": newName.trim(),
        };
        newChangedCells.push({ row: parseInt(rowIdx), col: "Naziv artikla" });
        updatedCount++;
      }
    });

    addLog(`Applied ${updatedCount} name updates`);
    setShowNameModal(false);
    setDuplicateNameItems([]);

    // Chain: next check prices
    if (priceUpdateItems && priceUpdateItems.length > 0) {
      setPendingResult({ table: updatedTable, changed: newChangedCells, exportStr });
      setShowPriceModal(true);
    } else {
      setPreview(updatedTable);
      setChangedCells(newChangedCells);
      setExportText(exportStr);
      setPendingResult(null);
    }
  };

  const handleNameModalSkip = () => {
    if (!pendingResult) return;

    addLog("Skipped name updates");
    setShowNameModal(false);
    setDuplicateNameItems([]);

    // Chain: next check prices
    if (priceUpdateItems && priceUpdateItems.length > 0) {
      setShowPriceModal(true);
    } else {
      const { table, changed, exportStr } = pendingResult;
      setPreview(table);
      setChangedCells(changed || []);
      setExportText(exportStr);
      setPendingResult(null);
    }
  };

  // Price update modal handlers
  const handlePriceModalSubmit = (priceInputs) => {
    if (!pendingResult) return;

    const { table, changed, exportStr } = pendingResult;
    const updatedTable = { ...table, rows: [...table.rows] };
    const newChangedCells = [...(changed || [])];
    let updatedCount = 0;

    Object.entries(priceInputs).forEach(([rowIdx, newPrice]) => {
      const parsed = parseFloat(newPrice);
      if (parsed && parsed > 0) {
        updatedTable.rows[parseInt(rowIdx)] = {
          ...updatedTable.rows[parseInt(rowIdx)],
          "Cena MP": parsed.toFixed(2),
        };
        // Add to changed cells for highlighting
        newChangedCells.push({ row: parseInt(rowIdx), col: "Cena MP" });
        updatedCount++;
      }
    });

    addLog(`Applied ${updatedCount} price updates manually`);
    setPreview(updatedTable);
    setChangedCells(newChangedCells);
    setExportText(exportStr);
    setShowPriceModal(false);
    setPendingResult(null);
    setPriceUpdateItems([]);
  };

  const handlePriceModalSkip = () => {
    if (pendingResult) {
      const { table, changed, exportStr } = pendingResult;
      setPreview(table);
      setChangedCells(changed || []);
      setExportText(exportStr);
    }
    addLog("Skipped price updates");
    setShowPriceModal(false);
    setPendingResult(null);
    setPriceUpdateItems([]);
  };

  const saveSettings = async () => {
    try {
      const settings = {
        defaultOperations,
        priceThreshold,
      };
      await invoke("save_settings", { data: JSON.stringify(settings) });
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
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
        onShowSifrarnik={() => setLeftPaneTab("sifrarnik")}
        operations={operations}
        onOperationsChange={setOperations}
        defaultOperations={defaultOperations}
        onDefaultOperationsChange={setDefaultOperations}
        priceThreshold={priceThreshold}
        onPriceThresholdChange={setPriceThreshold}
        onSaveSettings={saveSettings}
      />

      <BarcodeModal
        isOpen={showBarcodeModal}
        emptyBarcodeItems={emptyBarcodeItems}
        onSubmit={handleBarcodeModalSubmit}
        onSkip={handleBarcodeModalSkip}
        onClose={() => setShowBarcodeModal(false)}
        previousBarcodes={invoiceFilename ? cachedBarcodes[invoiceFilename] : null}
        invoiceFilename={invoiceFilename}
        onUsePrevious={handleUsePreviousBarcodes}
      />

      <NameUpdateModal
        isOpen={showNameModal}
        duplicateNameItems={duplicateNameItems}
        onSubmit={handleNameModalSubmit}
        onSkip={handleNameModalSkip}
      />

      <PriceUpdateModal
        isOpen={showPriceModal}
        priceUpdateItems={priceUpdateItems}
        onSubmit={handlePriceModalSubmit}
        onSkip={handlePriceModalSkip}
      />
    </div>
  );
}

export default App;
