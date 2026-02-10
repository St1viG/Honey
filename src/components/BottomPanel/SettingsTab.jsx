import { useLanguage } from "../../i18n/LanguageContext";

export function SettingsTab({
  sifrarnik,
  sifrarnikName,
  sifrarnikTimestamp,
  onShowSifrarnik,
  defaultOperations,
  onDefaultOperationsChange,
  priceThreshold,
  onPriceThresholdChange,
  onSaveSettings,
}) {
  const { t, language, changeLanguage, theme, changeTheme } = useLanguage();

  const formatTimestamp = (isoString) => {
    if (!isoString) return t.unknown;
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const operationsList = [
    { key: "updateNames", labelKey: "updateNames" },
    { key: "formatPrice4Dec", labelKey: "formatPrice4Dec" },
    { key: "formatColAndMpPrice2Dec", labelKey: "formatColAndMpPrice2Dec" },
    { key: "removeDuplicateBarcodes", labelKey: "removeDuplicateBarcodes" },
    { key: "autoUpdateBarKod", labelKey: "autoUpdateBarKod" },
    { key: "detectDuplicateNames", labelKey: "detectDuplicateNames" },
    { key: "swapCommasToDots", labelKey: "swapCommasToDots" },
    { key: "autoUpdatePrice", labelKey: "autoUpdatePrice" },
  ];

  const handleDefaultOperationChange = (key) => {
    onDefaultOperationsChange((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveDefaults = () => {
    onSaveSettings();
  };

  const handleThresholdChange = (value) => {
    const num = parseInt(value) || 0;
    const clamped = Math.max(0, Math.min(100, num));
    onPriceThresholdChange(clamped);
  };

  const handleSaveThreshold = () => {
    onSaveSettings();
  };

  return (
    <div className="settings-tab">
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
        <h3>{t.theme}</h3>
        <p className="settings-description">{t.themeDesc}</p>
        <div className="language-selector">
          <button
            className={`lang-btn ${theme === "dark" ? "active" : ""}`}
            onClick={() => changeTheme("dark")}
          >
            {t.dark}
          </button>
          <button
            className={`lang-btn ${theme === "light" ? "active" : ""}`}
            onClick={() => changeTheme("light")}
          >
            {t.light}
          </button>
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
