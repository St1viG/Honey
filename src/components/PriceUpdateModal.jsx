import { useState, useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export function PriceUpdateModal({
  isOpen,
  priceUpdateItems,
  onSubmit,
  onSkip,
}) {
  const { t } = useLanguage();
  const [priceInputs, setPriceInputs] = useState({});

  useEffect(() => {
    if (isOpen) {
      setPriceInputs({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (rowIdx, value) => {
    setPriceInputs((prev) => ({ ...prev, [rowIdx]: value }));
  };

  const handleSubmit = () => {
    onSubmit(priceInputs);
    setPriceInputs({});
  };

  const handleSkipAll = () => {
    onSkip();
    setPriceInputs({});
  };

  // Calculate the new percentage based on user input
  const getNewPercentage = (item, newCenaMp) => {
    const parsed = parseFloat(newCenaMp);
    if (!parsed || parsed <= 0) return null;
    return ((item.ukupnaCena / parsed) * 100).toFixed(2);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-wide">
        <div className="modal-header">
          <h3>{t.priceUpdates || "Price Updates"}</h3>
          <p className="modal-subtitle">
            {priceUpdateItems.length} {t.itemsNeedPriceUpdate || "items above threshold"}
          </p>
        </div>

        <div className="modal-body">
          <table className="price-update-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t.itemCode || "Code"}</th>
                <th>{t.itemName || "Name"}</th>
                <th>{t.ukupnaCena || "Ukupna Cena"}</th>
                <th>{t.currentCenaMp || "Current Cena MP"}</th>
                <th>{t.currentPercentage || "Current %"}</th>
                <th>{t.newCenaMp || "New Cena MP"}</th>
                <th>{t.newPercentage || "New %"}</th>
              </tr>
            </thead>
            <tbody>
              {priceUpdateItems.map((item) => {
                const newValue = priceInputs[item.rowIdx] || "";
                const newPercentage = getNewPercentage(item, newValue);
                return (
                  <tr key={item.rowIdx}>
                    <td className="row-num">{item.rowIdx + 1}</td>
                    <td>{item.sifra}</td>
                    <td className="naziv-cell">{item.naziv}</td>
                    <td className="number-cell">{item.ukupnaCena.toFixed(4)}</td>
                    <td className="number-cell">{item.cenaMp.toFixed(2)}</td>
                    <td className="number-cell percentage-high">{item.percentage.toFixed(2)}%</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={t.enterNewPrice || "Enter new price..."}
                        value={newValue}
                        onChange={(e) => handleInputChange(item.rowIdx, e.target.value)}
                      />
                    </td>
                    <td className="number-cell">
                      {newPercentage ? (
                        <span className={parseFloat(newPercentage) <= 67 ? "percentage-ok" : "percentage-high"}>
                          {newPercentage}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="modal-footer">
          <button onClick={handleSubmit} className="primary">
            {t.applyPrices || "Apply Prices"}
          </button>
          <button onClick={handleSkipAll} className="secondary">
            {t.skipAll}
          </button>
        </div>
      </div>
    </div>
  );
}
