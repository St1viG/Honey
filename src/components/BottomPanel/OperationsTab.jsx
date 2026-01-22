import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

export function OperationsTab({
  invoice,
  sifrarnik,
  onPreviewUpdate,
  onLogMessage,
  logs,
  columnMappings,
}) {
  const [operations, setOperations] = useState({
    updateNames: false,
    formatPrice4Dec: false,
    removeDuplicateBarcodes: false,
    swapCommasToDots: false,
    autoUpdateBarKod: false,
    formatColAndMpPrice2Dec: false,
    autoUpdatePrice: false,
  });

  const [processing, setProcessing] = useState(false);

  const handleCheckboxChange = (key) => {
    setOperations((prev) => ({ ...prev, [key]: !prev[key] }));
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
        mappings: columnMappings,
      });

      onPreviewUpdate(
        result.table,
        result.changedCells,
        result.missingBarcodes,
        result.exportStr,
      );

      // Log results
      // if (result.logs) {
      //   result.logs.forEach((log) => onLogMessage(log));
      // }
      onLogMessage("Updated " + result.logs + " cells");
    } catch (e) {
      onLogMessage(`Error: ${e}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    const path = await save({
      filters: [{ name: "Data File", extensions: ["dat"] }],
      defaultPath: "output.dat",
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
    {
      key: "updateNames",
      label: "Update names from Sifrarnik",
      requiresSifrarnik: true,
    },
    {
      key: "formatPrice4Dec",
      label: "Format prices to 4 decimals",
      requiresSifrarnik: false,
    },
    {
      key: "formatColAndMpPrice2Dec",
      label: "Format quantity and MP price to 2 decimals",
      requiresSifrarnik: false,
    },
    {
      key: "removeDuplicateBarcodes",
      label: "Remove duplicate barcodes",
      requiresSifrarnik: false,
    },
    {
      key: "autoUpdateBarKod",
      label: "Auto-update barcodes (opens panel for missing)",
      requiresSifrarnik: true,
    },
    {
      key: "swapCommasToDots",
      label: "Swap commas to dots",
      requiresSifrarnik: false,
    },
    {
      key: "autoUpdatePrice",
      label: "Auto-update prices with >67%",
      requiresSifrarnik: false,
    },
  ];

  return (
    <div className="operations-tab">
      <div className="operations-section">
        <h3>Operations</h3>
        <div className="operations-list">
          {operationsList.map((op) => (
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
              <span>{op.label}</span>
              {op.requiresSifrarnik && !sifrarnik && (
                <span className="requires-badge">needs sifrarnik</span>
              )}
            </label>
          ))}
        </div>
        <div className="operations-actions">
          <button onClick={handleApply} disabled={processing || !invoice}>
            {processing ? "Processing..." : "Apply"}
          </button>
          <button onClick={handleSave} disabled={!invoice}>
            Save As...
          </button>
        </div>
      </div>

      <div className="log-section">
        <h3>Log</h3>
        <div className="log-output">
          {logs.length === 0 ? (
            <p className="log-empty">No operations performed yet</p>
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
