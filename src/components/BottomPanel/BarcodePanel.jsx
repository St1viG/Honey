import { useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";

export function BarcodePanel({
  missingBarcodes,
  onBarcodeUpdate,
  onBarcodeSkip,
}) {
  const { t } = useLanguage();
  const [barcodeInputs, setBarcodeInputs] = useState({});

  if (!missingBarcodes || missingBarcodes.length === 0) {
    return (
      <div className="barcode-panel">
        <p>{t.noData}</p>
      </div>
    );
  }

  const handleInputChange = (rowIdx, value) => {
    setBarcodeInputs((prev) => ({ ...prev, [rowIdx]: value }));
  };

  const handleUpdate = (rowIdx) => {
    const barcode = barcodeInputs[rowIdx];
    if (barcode && barcode.trim()) {
      onBarcodeUpdate(rowIdx, barcode.trim());
      setBarcodeInputs((prev) => {
        const next = { ...prev };
        delete next[rowIdx];
        return next;
      });
    }
  };

  const handleSkip = (rowIdx) => {
    onBarcodeSkip(rowIdx);
    setBarcodeInputs((prev) => {
      const next = { ...prev };
      delete next[rowIdx];
      return next;
    });
  };

  const handleSkipAll = () => {
    missingBarcodes.forEach((item) => {
      onBarcodeSkip(item.rowIdx);
    });
    setBarcodeInputs({});
  };

  return (
    <div className="barcode-panel">
      <div className="barcode-header">
        <h3>{t.barcodesTitle} ({missingBarcodes.length})</h3>
        <div className="barcode-actions">
          <button onClick={handleSkipAll} className="secondary">
            {t.skipAll}
          </button>
        </div>
      </div>

      <div className="barcode-list">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>{t.itemCode}</th>
              <th>{t.itemName}</th>
              <th>{t.barcode}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {missingBarcodes.map((item) => (
              <tr key={item.rowIdx}>
                <td>{item.rowIdx + 1}</td>
                <td>{item.sifra}</td>
                <td className="naziv-cell">{item.naziv}</td>
                <td>
                  <input
                    type="text"
                    placeholder={t.barcode}
                    value={barcodeInputs[item.rowIdx] || ""}
                    onChange={(e) =>
                      handleInputChange(item.rowIdx, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdate(item.rowIdx);
                    }}
                  />
                </td>
                <td className="action-cell">
                  <button
                    onClick={() => handleUpdate(item.rowIdx)}
                    disabled={!barcodeInputs[item.rowIdx]?.trim()}
                  >
                    {t.save}
                  </button>
                  <button
                    onClick={() => handleSkip(item.rowIdx)}
                    className="secondary"
                  >
                    {t.skip}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
