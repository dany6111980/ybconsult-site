import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// i18n core
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

/**
 * Small helper hook that LanguageSwitcher.jsx imports.
 * It exposes the active language, a changeLanguage() helper, and t().
 */
export function useI18n() {
  const [lng, setLng] = React.useState(
    (i18next.language || "en").slice(0, 2)
  );

  React.useEffect(() => {
    const onChange = () => setLng((i18next.language || "en").slice(0, 2));
    i18next.on("languageChanged", onChange);
    return () => i18next.off("languageChanged", onChange);
  }, []);

  return {
    i18n: i18next,
    t: i18next.t.bind(i18next),
    lng,
    changeLanguage: (code) => i18next.changeLanguage(code),
  };
}

/**
 * Safe dynamic import helper.
 * If a plugin isn't available (local/prod), we simply continue without it.
 */
async function safeImport(mod) {
  try {
    const m = await import(mod);
    return m?.default ?? m;
  } catch {
    return null;
  }
}

async function bootstrap() {
  const isBrowser = typeof window !== "undefined";

  // Optional plugins (don’t crash if missing)
  const LanguageDetector = isBrowser
    ? await safeImport("i18next-browser-languagedetector")
    : null;
  const HttpBackend = isBrowser ? await safeImport("i18next-http-backend") : null;

  i18next.use(initReactI18next);
  if (LanguageDetector) i18next.use(LanguageDetector);
  if (HttpBackend) i18next.use(HttpBackend);

  // If backend isn’t available, keep the app alive with empty inline resources.
  const fallbackResources = {
    en: { translation: {} },
    fr: { translation: {} },
    de: { translation: {} },
    es: { translation: {} },
  };

  await i18next.init({
    fallbackLng: ["en"],
    supportedLngs: ["en", "fr", "de", "es"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    debug: false,

    // Fetch JSON from /public when backend is present
    backend: { loadPath: "/{{lng}}.json" },
    resources: HttpBackend ? undefined : fallbackResources,

    // Prefer URL path (/fr, /de, /es), then browser/cookies/localStorage
    detection: {
      order: ["path", "navigator", "cookie", "localStorage", "htmlTag"],
      caches: ["localStorage", "cookie"],
    },

    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,

    // Avoid Suspense requirement in react-i18next
    react: { useSuspense: false },
  });

  // Mount only after i18n is ready (prevents white screen)
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
}

bootstrap();
