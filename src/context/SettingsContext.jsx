import { createContext, useContext, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

const SettingsContext = createContext();

const defaultOperationsState = {
  updateNames: false,
  formatPrice4Dec: false,
  removeDuplicateBarcodes: false,
  swapCommasToDots: false,
  autoUpdateBarKod: false,
  formatColAndMpPrice2Dec: false,
  autoUpdatePrice: false,
};

export function SettingsProvider({ children }) {
  const [operations, setOperations] = useState(defaultOperationsState);
  const [defaultOperations, setDefaultOperations] = useState(defaultOperationsState);
  const [priceThreshold, setPriceThreshold] = useState(67);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await invoke("load_settings");
        if (stored) {
          const settings = JSON.parse(stored);
          if (settings.defaultOperations) {
            setDefaultOperations(settings.defaultOperations);
            setOperations(settings.defaultOperations);
          }
          if (settings.priceThreshold !== undefined) {
            setPriceThreshold(settings.priceThreshold);
          }
        }
      } catch (e) {
        console.log("No stored settings found:", e);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      const settings = {
        defaultOperations,
        priceThreshold,
      };
      await invoke("save_settings", { data: JSON.stringify(settings) });
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        operations,
        setOperations,
        defaultOperations,
        setDefaultOperations,
        priceThreshold,
        setPriceThreshold,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
