import { useState } from "react";
import { OperationsTab } from "./OperationsTab";
import { BarcodePanel } from "./BarcodePanel";
import { SettingsTab } from "./SettingsTab";

export function BottomPanel({
  invoice,
  sifrarnik,
  onPreviewUpdate,
  onLogMessage,
  logs,
  missingBarcodes,
  onBarcodeUpdate,
  onBarcodeSkip,
  showBarcodePanel,
  columnMappings,
  onMappingsChange,
  onShowSifrarnik,
}) {
  const [activeTab, setActiveTab] = useState("operations");

  const tabs = [
    { id: "operations", label: "Operations" },
    { id: "settings", label: "Settings" },
  ];

  if (showBarcodePanel) {
    tabs.splice(1, 0, {
      id: "barcodes",
      label: `Barcodes (${missingBarcodes?.length || 0})`,
    });
  }

  return (
    <div className="bottom-panel">
      <div className="panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="panel-content">
        {activeTab === "operations" && (
          <OperationsTab
            invoice={invoice}
            sifrarnik={sifrarnik}
            onPreviewUpdate={onPreviewUpdate}
            onLogMessage={onLogMessage}
            logs={logs}
            columnMappings={columnMappings}
          />
        )}
        {activeTab === "barcodes" && showBarcodePanel && (
          <BarcodePanel
            missingBarcodes={missingBarcodes}
            onBarcodeUpdate={onBarcodeUpdate}
            onBarcodeSkip={onBarcodeSkip}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            invoice={invoice}
            sifrarnik={sifrarnik}
            columnMappings={columnMappings}
            onMappingsChange={onMappingsChange}
            onShowSifrarnik={onShowSifrarnik}
          />
        )}
      </div>
    </div>
  );
}
