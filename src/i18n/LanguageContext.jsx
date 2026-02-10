import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

const LanguageContext = createContext();

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  return saved === "light" ? "light" : "dark";
}

function getInitialLanguage() {
  const saved = localStorage.getItem("language");
  return saved && translations[saved] ? saved : "en";
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme to DOM on mount and when it changes
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Save language when changed
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // Save theme when changed
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.dataset.theme = newTheme;
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, theme, changeTheme, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
