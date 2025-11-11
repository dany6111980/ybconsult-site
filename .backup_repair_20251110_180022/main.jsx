// main.jsx
import React, { useEffect, useState, Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

/**
 * Lightweight i18n bootstrap:
 *  - Reads language code from window.__LOCALE__ (set in index.html)
 *  - Loads /i18n/<lang>.json
 *  - Provides simple t(key) helper via React context
 */

const I18nContext = React.createContext({
  lang: "en",
  t: (key) => key,
});

function I18nProvider({ children }) {
  const [lang, setLang] = useState(window.__LOCALE__ || "en");
  const [dict, setDict] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = `/i18n/${lang}.json`;
    fetch(path)
      .then((res) => res.json())
      .then((data) => {
        setDict(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("⚠️ Failed to load language:", lang, err);
        setLoading(false);
      });
  }, [lang]);

  const t = (key) => {
    return key.split(".").reduce((o, k) => (o && o[k] ? o[k] : null), dict) || key;
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Optional helper hook for your components
export function useI18n() {
  return React.useContext(I18nContext);
}

// Render the app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </Suspense>
  </React.StrictMode>
);
