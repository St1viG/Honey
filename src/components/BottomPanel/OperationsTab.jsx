import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { useLanguage } from "../../i18n/LanguageContext";

export function OperationsTab({
  invoice,
  invoiceFilename,
  sifrarnik,
  onPreviewUpdate,
  onLogMessage,
  logs,
  operations,
  onOperationsChange,
  priceThreshold,
}) {
  const { t } = useLanguage();
  const [processing, setProcessing] = useState(false);

  const handleCheckboxChange = (key) => {
    onOperationsChange((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApply = async () => {
    if (!invoice) {
      onLogMessage("No invoice loaded");
      return;
    }

    setProcessing(true);
    try {
      const result = await invoke("apply_operations", {
        table: invoice,
        operations,
        priceThreshold,
      });

      // Use removedBarcodes from backend - items that had multiple barcodes (commas) removed
      const emptyBarcodeItems = operations.removeDuplicateBarcodes
        ? result.removedBarcodes.map((item) => ({
            rowIdx: item.rowIdx,
            sifra: item.sifra,
            naziv: item.naziv,
            originalBarcode: item.originalBarcode,
          }))
        : [];

      // Use priceUpdateItems from backend - items above price threshold
      const priceItems = operations.autoUpdatePrice
        ? result.priceUpdateItems.map((item) => ({
            rowIdx: item.rowIdx,
            sifra: item.sifra,
            naziv: item.naziv,
            ukupnaCena: item.ukupnaCena,
            cenaMp: item.cenaMp,
            percentage: item.percentage,
          }))
        : [];

      onPreviewUpdate(
        result.table,
        result.changedCells,
        emptyBarcodeItems,
        priceItems,
        result.exportStr,
        operations.autoUpdateBarKod,
      );

      onLogMessage("Updated " + result.logs + " cells");
    } catch (e) {
      onLogMessage(`Error: ${e}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    const defaultName = invoiceFilename ? `${invoiceFilename}.dat` : "output.dat";
    const path = await save({
      filters: [{ name: "Data File", extensions: ["dat"] }],
      defaultPath: defaultName,
    });

    if (path) {
      try {
        await invoke("export_file", { path });
        onLogMessage(`Saved to ${path}`);
      } catch (e) {
        onLogMessage(`Failed to save: ${e}`);
      }
    }
  };

  const operationsList = [
    { key: "updateNames", labelKey: "updateNames", requiresSifrarnik: true },
    { key: "formatPrice4Dec", labelKey: "formatPrice4Dec", requiresSifrarnik: false },
    { key: "formatColAndMpPrice2Dec", labelKey: "formatColAndMpPrice2Dec", requiresSifrarnik: false },
    { key: "removeDuplicateBarcodes", labelKey: "removeDuplicateBarcodes", requiresSifrarnik: false },
    { key: "autoUpdateBarKod", labelKey: "autoUpdateBarKod", requiresSifrarnik: true },
    { key: "swapCommasToDots", labelKey: "swapCommasToDots", requiresSifrarnik: false },
    { key: "autoUpdatePrice", labelKey: "autoUpdatePrice", requiresSifrarnik: false },
  ];

  return (
    <div className="operations-tab">
      <div className="operations-section">
        <h3>{t.operationsTitle}</h3>
        <div className="operations-list">
          {operationsList.map((op) => {
            const label = op.key === "autoUpdatePrice"
              ? `${t.autoUpdatePrice.replace(">67%", `>${priceThreshold}%`)}`
              : t[op.labelKey];
            return (
              <label
                key={op.key}
                className={`operation-item ${op.requiresSifrarnik && !sifrarnik ? "disabled" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={operations[op.key]}
                  onChange={() => handleCheckboxChange(op.key)}
                  disabled={op.requiresSifrarnik && !sifrarnik}
                />
                <span>{label}</span>
                {op.requiresSifrarnik && !sifrarnik && (
                  <span className="requires-badge">{t.needsDatabase}</span>
                )}
              </label>
            );
          })}
        </div>
        <div className="operations-actions">
          <button onClick={handleApply} disabled={processing || !invoice}>
            {processing ? t.processing : t.apply}
          </button>
          <button onClick={handleSave} disabled={!invoice}>
            {t.saveAs}
          </button>
        </div>
      </div>

      <div className="log-section">
        <h3>{t.log}</h3>
        <div className="log-output">
          {logs.length === 0 ? (
            <p className="log-empty">{t.noOperationsYet}</p>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="log-entry">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
