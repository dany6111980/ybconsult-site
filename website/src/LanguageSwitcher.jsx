// website/src/LanguageSwitcher.jsx
import { useI18n } from "./main.jsx";

const SUPPORTED = ["en", "fr", "de", "es"];

export default function LanguageSwitcher() {
  const { i18n } = useI18n();

  const setLang = (lng) => {
    if (!SUPPORTED.includes(lng)) return;

    // change i18n language
    i18n.changeLanguage(lng);

    // path prefix logic: keep EN at root (/), others prefixed (e.g., /fr)
    const parts = window.location.pathname.split("/").filter(Boolean);
    const first = parts[0];

    const hasPrefix = SUPPORTED.includes(first);
    if (lng === "en") {
      // remove prefix if present
      const rest = hasPrefix ? parts.slice(1).join("/") : parts.join("/");
      const newPath = "/" + rest;
      window.history.replaceState(null, "", newPath);
    } else {
      // add/replace prefix
      const rest = hasPrefix ? parts.slice(1).join("/") : parts.join("/");
      const newPath = `/${lng}${rest ? "/" + rest : ""}`;
      window.history.replaceState(null, "", newPath);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {SUPPORTED.map((lng) => (
        <button
          key={lng}
          onClick={() => setLang(lng)}
          className={`px-2 py-1 text-xs rounded-lg border ${
            i18n.language === lng ? "bg-slate-900 text-white" : "bg-white"
          }`}
          aria-label={`Switch language to ${lng}`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
