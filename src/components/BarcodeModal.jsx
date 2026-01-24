import { useState, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export function BarcodeModal({
  isOpen,
  emptyBarcodeItems,
  onSubmit,
  onSkip,
  onClose,
  previousBarcodes,
  invoiceFilename,
  onUsePrevious,
}) {
  const { t } = useLanguage();
  const [barcodeInputs, setBarcodeInputs] = useState({});
  const [showPreviousPrompt, setShowPreviousPrompt] = useState(false);

  // Check if we have previous barcodes for this invoice
  useEffect(() => {
    if (isOpen && previousBarcodes && Object.keys(previousBarcodes).length > 0) {
      setShowPreviousPrompt(true);
    } else {
      setShowPreviousPrompt(false);
      setBarcodeInputs({});
    }
  }, [isOpen, previousBarcodes]);

  if (!isOpen) return null;

  const handleInputChange = (rowIdx, value) => {
    setBarcodeInputs((prev) => ({ ...prev, [rowIdx]: value }));
  };

  const handleSubmit = () => {
    onSubmit(barcodeInputs);
    setBarcodeInputs({});
  };

  const handleSkipAll = () => {
    onSkip();
    setBarcodeInputs({});
  };

  const handleUsePrevious = () => {
    onUsePrevious(previousBarcodes);
    setShowPreviousPrompt(false);
  };

  const handleEnterNew = () => {
    setShowPreviousPrompt(false);
    setBarcodeInputs({});
  };

  // Prompt to use previous barcodes
  if (showPreviousPrompt) {
    return (
      <div className="modal-overlay">
        <div className="modal-content modal-prompt">
          <h3>{t.previousBarcodesFound}</h3>
          <p>{t.previousBarcodesDesc}</p>
          <div className="modal-actions">
            <button onClick={handleUsePrevious} className="primary">
              {t.usePrevious}
            </button>
            <button onClick={handleEnterNew} className="secondary">
              {t.enterNew}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{t.missingBarcodes}</h3>
          <p className="modal-subtitle">
            {emptyBarcodeItems.length} {t.itemsNeedBarcodes}
          </p>
        </div>

        <div className="modal-body">
          <table className="barcode-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t.itemCode}</th>
                <th>{t.itemName}</th>
                <th>{t.barcode}</th>
              </tr>
            </thead>
            <tbody>
              {emptyBarcodeItems.map((item) => (
                <tr key={item.rowIdx}>
                  <td className="row-num">{item.rowIdx + 1}</td>
                  <td>{item.sifra}</td>
                  <td className="naziv-cell">{item.naziv}</td>
                  <td>
                    <input
                      type="text"
                      placeholder={t.enterBarcode}
                      value={barcodeInputs[item.rowIdx] || ""}
                      onChange={(e) => handleInputChange(item.rowIdx, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="modal-footer">
          <button onClick={handleSubmit} className="primary">
            {t.applyBarcodes}
          </button>
          <button onClick={handleSkipAll} className="secondary">
            {t.skipAll}
          </button>
        </div>
      </div>
    </div>
  );
}
