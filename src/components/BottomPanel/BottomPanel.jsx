import { useState } from "react";
import { OperationsTab } from "./OperationsTab";
import { BarcodePanel } from "./BarcodePanel";
import { SettingsTab } from "./SettingsTab";
import { useLanguage } from "../../i18n/LanguageContext";

export function BottomPanel({
  invoice,
  invoiceFilename,
  sifrarnik,
  sifrarnikName,
  sifrarnikTimestamp,
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
  operations,
  onOperationsChange,
  defaultOperations,
  onDefaultOperationsChange,
  priceThreshold,
  onPriceThresholdChange,
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("operations");

  const tabs = [
    { id: "operations", label: t.operations },
    { id: "settings", label: t.settings },
  ];

  if (showBarcodePanel) {
    tabs.splice(1, 0, {
      id: "barcodes",
      label: `${t.barcodes} (${missingBarcodes?.length || 0})`,
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
            invoiceFilename={invoiceFilename}
            sifrarnik={sifrarnik}
            onPreviewUpdate={onPreviewUpdate}
            onLogMessage={onLogMessage}
            logs={logs}
            columnMappings={columnMappings}
            operations={operations}
            onOperationsChange={onOperationsChange}
            priceThreshold={priceThreshold}
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
            sifrarnikName={sifrarnikName}
            sifrarnikTimestamp={sifrarnikTimestamp}
            columnMappings={columnMappings}
            onMappingsChange={onMappingsChange}
            onShowSifrarnik={onShowSifrarnik}
            defaultOperations={defaultOperations}
            onDefaultOperationsChange={onDefaultOperationsChange}
            priceThreshold={priceThreshold}
            onPriceThresholdChange={onPriceThresholdChange}
          />
        )}
      </div>
    </div>
  );
}
