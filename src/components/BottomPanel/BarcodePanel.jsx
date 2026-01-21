import { useState } from "react";

export function BarcodePanel({
  missingBarcodes,
  onBarcodeUpdate,
  onBarcodeSkip,
}) {
  const [barcodeInputs, setBarcodeInputs] = useState({});

  if (!missingBarcodes || missingBarcodes.length === 0) {
    return (
      <div className="barcode-panel">
        <p>No missing barcodes to update</p>
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

  const handleUpdateAll = () => {
    Object.entries(barcodeInputs).forEach(([rowIdx, barcode]) => {
      if (barcode && barcode.trim()) {
        onBarcodeUpdate(parseInt(rowIdx), barcode.trim());
      }
    });
    setBarcodeInputs({});
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
        <h3>Missing Barcodes ({missingBarcodes.length} items)</h3>
        <div className="barcode-actions">
          <button onClick={handleUpdateAll}>Update All Filled</button>
          <button onClick={handleSkipAll} className="secondary">
            Skip All
          </button>
        </div>
      </div>

      <div className="barcode-list">
        <table>
          <thead>
            <tr>
              <th>Row</th>
              <th>Sifra</th>
              <th>Naziv</th>
              <th>New Barcode</th>
              <th>Actions</th>
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
                    placeholder="Enter barcode..."
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
                    Update
                  </button>
                  <button
                    onClick={() => handleSkip(item.rowIdx)}
                    className="secondary"
                  >
                    Skip
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
