import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export function SettingsTab({
  invoice,
  sifrarnik,
  columnMappings,
  onMappingsChange,
  onShowSifrarnik,
}) {
  const [saving, setSaving] = useState(false);

  const sifrarnikHeaders = sifrarnik?.headers || [];
  const invoiceHeaders = invoice?.headers || [];

  // Required mappings - these are the sifrarnik columns that need to map to invoice columns
  const requiredMappings = [
    { key: "sifra", label: "Sifra (ID)" },
    { key: "naziv", label: "Naziv (Name)" },
    { key: "barKod", label: "Bar Kod (Barcode)" },
    { key: "cijena", label: "Cijena (Price)" },
    { key: "jm", label: "JM (Unit)" },
  ];

  const handleMappingChange = (key, value) => {
    const newMappings = { ...columnMappings, [key]: value };
    onMappingsChange(newMappings);
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
        <h3>Column Mappings</h3>
        <p className="settings-description">
          Connect sifrarnik columns to invoice columns. This tells the app which columns correspond to each other.
        </p>

        {!sifrarnik && (
          <p className="warning">Load a sifrarnik first to configure mappings.</p>
        )}

        {sifrarnik && (
          <>
            <div className="mappings-grid">
              <div className="mapping-header">
                <span>Field</span>
                <span>Sifrarnik Column</span>
                <span>Invoice Column</span>
              </div>

              {requiredMappings.map((mapping) => (
                <div key={mapping.key} className="mapping-row">
                  <label>{mapping.label}</label>

                  <select
                    value={columnMappings[`sifrarnik_${mapping.key}`] || ""}
                    onChange={(e) =>
                      handleMappingChange(`sifrarnik_${mapping.key}`, e.target.value)
                    }
                  >
                    <option value="">-- Select --</option>
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
                    <option value="">-- Select --</option>
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
                {saving ? "Saving..." : "Save Mappings"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="settings-section">
        <h3>Sifrarnik</h3>
        {sifrarnik ? (
          <>
            <p>
              {sifrarnik.rows.length} items loaded, {sifrarnik.headers.length} columns
            </p>
            <button onClick={onShowSifrarnik}>View Sifrarnik</button>
          </>
        ) : (
          <p>No sifrarnik loaded. Load one using the button in the header.</p>
        )}
      </div>
    </div>
  );
}
