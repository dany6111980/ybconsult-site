
// ⬅️ this line fixes the broken styles
import "./index.css";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import Site from "./Site.jsx";

/** Lightweight i18n provider (same as before) */
const I18nContext = createContext({ t: (k) => k, lang: "en" });
export const useI18n = () => useContext(I18nContext);

function pickInitialLang() {
  const saved = localStorage.getItem("yb-lang");
  if (saved) return saved;
  const nav = navigator.language || navigator.userLanguage || "en";
  return (nav.split("-")[0] || "en").toLowerCase();
}

async function fetchJson(url) {
  try {
    const res = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function loadTranslations(lang) {
  const candidates = [
    `/i18n/${lang}.json`,
    `/${lang}.json`,
    `/locales/${lang}.json`,
  ];
  for (const url of candidates) {
    const data = await fetchJson(url);
    if (data) return data;
  }
  if (lang !== "en") {
    const fallback = await fetchJson(`/i18n/en.json`) || await fetchJson(`/en.json`);
    if (fallback) return fallback;
  }
  return {};
}

function makeTranslator(dict) {
  return function t(key) {
    try {
      return key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), dict) ?? key;
    } catch {
      return key;
    }
  };
}

function I18nProvider({ children }) {
  const [lang, setLang] = useState(pickInitialLang());
  const [dict, setDict] = useState({});

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await loadTranslations(lang);
      if (!alive) return;
      setDict(data || {});
      document.documentElement.setAttribute("lang", lang);
      window.__YB_LANG__ = lang;
    })();
    return () => { alive = false; };
  }, [lang]);

  const value = useMemo(() => ({ t: makeTranslator(dict), lang, setLang }), [dict, lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <Site />
    </I18nProvider>
  </React.StrictMode>
);
