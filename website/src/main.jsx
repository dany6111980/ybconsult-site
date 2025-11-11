// website/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "fr", "de", "es"],
    backend: {
      loadPath: "/{{lng}}.json", // served from /public
    },
    detection: {
      // allow /fr, /de, /es path prefixes
      order: ["path", "querystring", "localStorage", "navigator"],
      lookupFromPathIndex: 0,
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export const useI18n = () => {
  const { t, i18n } = require("react-i18next").useTranslation();
  return { t, i18n };
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
