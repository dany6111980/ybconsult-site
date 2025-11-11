import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// i18n core
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

// --- Crash-proof dynamic plugin loading (works in Vite/Netlify) ---
async function safeImport(mod) {
  try {
    const m = await import(mod);
    return m?.default ?? m;
  } catch (e) {
    // Silently continue if optional plugin not installed/available
    return null;
  }
}

async function bootstrap() {
  const isBrowser = typeof window !== "undefined";

  const LanguageDetector = isBrowser
    ? await safeImport("i18next-browser-languagedetector")
    : null;

  const HttpBackend = isBrowser
    ? await safeImport("i18next-http-backend")
    : null;

  i18next.use(initReactI18next);
  if (LanguageDetector) i18next.use(LanguageDetector);
  if (HttpBackend) i18next.use(HttpBackend);

  // If no HttpBackend, fall back to inline resources (keeps app alive).
  const noBackendResources = {
    en: { translation: {} },
    fr: { translation: {} },
    de: { translation: {} },
    es: { translation: {} },
  };

  await i18next.init({
    fallbackLng: "en",
    supportedLngs: ["en", "fr", "de", "es"],
    debug: false,

    // Backend fetch (served from /public at site root)
    backend: {
      loadPath: "/{{lng}}.json",
    },

    // If backend missing, app still renders with empty resources
    resources: HttpBackend ? undefined : noBackendResources,

    detection: {
      // Prefer path (/fr, /de, /es) then browser/cookie
      order: ["path", "navigator", "cookie", "localStorage", "htmlTag"],
      caches: ["localStorage", "cookie"],
    },

    interpolation: { escapeValue: false },
    // Don’t throw if a key is missing
    returnNull: false,
    returnEmptyString: false,
  });

  // Mount React only when i18n is ready (prevents white flash / crashes)
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
}

bootstrap();
