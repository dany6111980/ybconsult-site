import React from "react";
import { useI18n } from "./main.jsx";

const SUPPORTED = ["en", "fr", "de", "es"];

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const current = (lang || "en").toLowerCase();

  function change(code) {
    const c = code.toLowerCase();
    localStorage.setItem("yb-lang", c);
    setLang(c);            // update context now
    // Re-load to ensure fresh JSON & all sections reflect the change
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      {SUPPORTED.map((code) => {
        const active = current.startsWith(code);
        return (
          <button
            key={code}
            onClick={() => change(code)}
            aria-label={`Switch language to ${code.toUpperCase()}`}
            className={
              "px-2 py-1 rounded-md text-sm transition " +
              (active ? "bg-indigo-600 text-white" : "bg-transparent text-slate-500 hover:text-slate-800")
            }
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
