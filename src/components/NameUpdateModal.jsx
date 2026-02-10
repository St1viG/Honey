import { useState, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export function NameUpdateModal({
  isOpen,
  duplicateNameItems,
  onSubmit,
  onSkip,
}) {
  const { t } = useLanguage();
  const [nameInputs, setNameInputs] = useState({});

  useEffect(() => {
    if (isOpen) {
      setNameInputs({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (rowIdx, value) => {
    setNameInputs((prev) => ({ ...prev, [rowIdx]: value }));
  };

  const handleSubmit = () => {
    onSubmit(nameInputs);
    setNameInputs({});
  };

  const handleSkipAll = () => {
    onSkip();
    setNameInputs({});
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-wide">
        <div className="modal-header">
          <h3>{t.duplicateNames}</h3>
          <p className="modal-subtitle">
            {duplicateNameItems.length} {t.itemsHaveDuplicateNames}
          </p>
        </div>

        <div className="modal-body">
          <table className="barcode-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t.itemCode}</th>
                <th>{t.itemName}</th>
                <th>{t.dbItemCode}</th>
                <th>{t.newName}</th>
              </tr>
            </thead>
            <tbody>
              {duplicateNameItems.map((item) => (
                <tr key={item.rowIdx}>
                  <td className="row-num">{item.rowIdx + 1}</td>
                  <td>{item.sifra}</td>
                  <td className="naziv-cell">{item.naziv}</td>
                  <td>{item.dbSifra}</td>
                  <td>
                    <input
                      type="text"
                      placeholder={t.enterNewName}
                      value={nameInputs[item.rowIdx] || ""}
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
            {t.applyNames}
          </button>
          <button onClick={handleSkipAll} className="secondary">
            {t.skipAll}
          </button>
        </div>
      </div>
    </div>
  );
}
