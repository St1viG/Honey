import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useLanguage } from "../../i18n/LanguageContext";

export function SettingsTab({
  invoice,
  sifrarnik,
  sifrarnikName,
  sifrarnikTimestamp,
  columnMappings,
  onMappingsChange,
  onShowSifrarnik,
  defaultOperations,
  onDefaultOperationsChange,
  priceThreshold,
  onPriceThresholdChange,
}) {
  const { t, language, changeLanguage } = useLanguage();
  const [saving, setSaving] = useState(false);

  const sifrarnikHeaders = sifrarnik?.headers || [];
  const invoiceHeaders = invoice?.headers || [];

  // Format timestamp for display
  const formatTimestamp = (isoString) => {
    if (!isoString) return t.unknown;
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  // Operations list for default settings
  const operationsList = [
    { key: "updateNames", labelKey: "updateNames" },
    { key: "formatPrice4Dec", labelKey: "formatPrice4Dec" },
    { key: "formatColAndMpPrice2Dec", labelKey: "formatColAndMpPrice2Dec" },
    { key: "removeDuplicateBarcodes", labelKey: "removeDuplicateBarcodes" },
    { key: "autoUpdateBarKod", labelKey: "autoUpdateBarKod" },
    { key: "swapCommasToDots", labelKey: "swapCommasToDots" },
    { key: "autoUpdatePrice", labelKey: "autoUpdatePrice" },
  ];

  // Required mappings
  const requiredMappings = [
    { key: "sifra", labelKey: "sifraId" },
    { key: "naziv", labelKey: "nazivName" },
    { key: "barKod", labelKey: "barKodBarcode" },
    { key: "cijena", labelKey: "cijenaPrice" },
    { key: "jm", labelKey: "jmUnit" },
  ];

  const handleMappingChange = (key, value) => {
    const newMappings = { ...columnMappings, [key]: value };
    onMappingsChange(newMappings);
  };

  const handleDefaultOperationChange = (key) => {
    onDefaultOperationsChange((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveDefaults = () => {
    try {
      localStorage.setItem("defaultOperations", JSON.stringify(defaultOperations));
    } catch (e) {
      console.error("Failed to save defaults:", e);
    }
  };

  const handleThresholdChange = (value) => {
    const num = parseInt(value) || 0;
    const clamped = Math.max(0, Math.min(100, num));
    onPriceThresholdChange(clamped);
  };

  const handleSaveThreshold = () => {
    try {
      localStorage.setItem("priceThreshold", priceThreshold.toString());
    } catch (e) {
      console.error("Failed to save threshold:", e);
    }
  };

  const handleSaveMappings = async () => {
    setSaving(true);
    try {
      await invoke("save_column_mappings", { mappings: columnMappings });
    } catch (e) {
      console.error("Failed to save mappings:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-tab">
      <div className="settings-section">
        <h3>{t.columnMappings}</h3>
        <p className="settings-description">{t.columnMappingsDesc}</p>

        {!sifrarnik && <p className="warning">{t.loadDatabaseFirst}</p>}

        {sifrarnik && (
          <>
            <div className="mappings-grid">
              <div className="mapping-header">
                <span>{t.field}</span>
                <span>{t.databaseColumn}</span>
                <span>{t.invoiceColumn}</span>
              </div>

              {requiredMappings.map((mapping) => (
                <div key={mapping.key} className="mapping-row">
                  <label>{t[mapping.labelKey]}</label>

                  <select
                    value={columnMappings[`sifrarnik_${mapping.key}`] || ""}
                    onChange={(e) =>
                      handleMappingChange(`sifrarnik_${mapping.key}`, e.target.value)
                    }
                  >
                    <option value="">{t.select}</option>
                    {sifrarnikHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>

                  <select
                    value={columnMappings[`invoice_${mapping.key}`] || ""}
                    onChange={(e) =>
                      handleMappingChange(`invoice_${mapping.key}`, e.target.value)
                    }
                    disabled={!invoice}
                  >
                    <option value="">{t.select}</option>
                    {invoiceHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="settings-actions">
              <button onClick={handleSaveMappings} disabled={saving}>
                {saving ? t.saving : t.saveMappings}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="settings-section">
        <h3>{t.databaseInfo}</h3>
        {sifrarnik ? (
          <div className="sifrarnik-info">
            <div className="sifrarnik-details">
              <p><strong>{t.file}:</strong> {sifrarnikName || t.unknown}</p>
              <p><strong>{t.loaded}:</strong> {formatTimestamp(sifrarnikTimestamp)}</p>
              <p><strong>{t.items}:</strong> {sifrarnik.rows.length} {t.rows}, {sifrarnik.headers.length} {t.columns}</p>
            </div>
            <button onClick={onShowSifrarnik}>{t.viewDatabase}</button>
          </div>
        ) : (
          <p>{t.noDatabaseLoadedMsg}</p>
        )}
      </div>

      <div className="settings-section">
        <h3>{t.defaultOperations}</h3>
        <p className="settings-description">{t.defaultOperationsDesc}</p>
        <div className="default-operations-list">
          {operationsList.map((op) => (
            <label key={op.key} className="operation-item">
              <input
                type="checkbox"
                checked={defaultOperations[op.key] || false}
                onChange={() => handleDefaultOperationChange(op.key)}
              />
              <span>{t[op.labelKey]}</span>
            </label>
          ))}
        </div>
        <div className="settings-actions">
          <button onClick={handleSaveDefaults}>{t.saveDefaults}</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>{t.priceThreshold}</h3>
        <p className="settings-description">{t.priceThresholdDesc}</p>
        <div className="threshold-input">
          <input
            type="number"
            min="0"
            max="100"
            value={priceThreshold}
            onChange={(e) => handleThresholdChange(e.target.value)}
          />
          <span>%</span>
          <button onClick={handleSaveThreshold}>{t.save}</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>{t.language}</h3>
        <p className="settings-description">{t.languageDesc}</p>
        <div className="language-selector">
          <button
            className={`lang-btn ${language === "en" ? "active" : ""}`}
            onClick={() => changeLanguage("en")}
          >
            English
          </button>
          <button
            className={`lang-btn ${language === "sr" ? "active" : ""}`}
            onClick={() => changeLanguage("sr")}
          >
            Srpski
          </button>
        </div>
      </div>
    </div>
  );
}
