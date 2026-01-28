import { useState } from "react";
import { OperationsTab } from "./OperationsTab";
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
  onShowSifrarnik,
  operations,
  onOperationsChange,
  defaultOperations,
  onDefaultOperationsChange,
  priceThreshold,
  onPriceThresholdChange,
  onSaveSettings,
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("operations");

  const tabs = [
    { id: "operations", label: t.operations },
    { id: "settings", label: t.settings },
  ];

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
            operations={operations}
            onOperationsChange={onOperationsChange}
            priceThreshold={priceThreshold}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            sifrarnik={sifrarnik}
            sifrarnikName={sifrarnikName}
            sifrarnikTimestamp={sifrarnikTimestamp}
            onShowSifrarnik={onShowSifrarnik}
            defaultOperations={defaultOperations}
            onDefaultOperationsChange={onDefaultOperationsChange}
            priceThreshold={priceThreshold}
            onPriceThresholdChange={onPriceThresholdChange}
            onSaveSettings={onSaveSettings}
          />
        )}
      </div>
    </div>
  );
}
