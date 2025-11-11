
// main.jsx
import React, { useEffect, useState, Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

function detectLangFromPath() {
  const m = (location.pathname || "/").match(/^\/(fr|de|es)(\/|$)/i);
  return (m?.[1] || "en").toLowerCase();
}

const I18nContext = React.createContext({ lang: "en", t: (k) => k, setLang: () => {} });

function I18nProvider({ children }) {
  const [lang, setLang] = useState(detectLangFromPath());
  const [dict, setDict] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/${lang}.json`, { cache: "no-cache" })
      .then((res) => res.json())
      .then((data) => { setDict(data); setLoading(false); })
      .catch((err) => { console.warn("i18n load failed:", lang, err); setLoading(false); });
  }, [lang]);

  const t = (key) => key.split(".").reduce((o, k) => (o && o[k] != null ? o[k] : null), dict) ?? key;

  // keep language in window for a simple switcher
  useEffect(() => { window.__setLang = (l) => setLang(l); }, []);

  if (loading) {
    return <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#9ca3af"}}>Loading…</div>;
  }

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}
export function useI18n(){ return React.useContext(I18nContext); }

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={<div style={{ padding: 20 }}>Loading…</div>}>
      <I18nProvider><App /></I18nProvider>
    </Suspense>
  </React.StrictMode>
);
