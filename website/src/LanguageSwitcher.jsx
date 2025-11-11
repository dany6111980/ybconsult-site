// website/src/LanguageSwitcher.jsx
import React from "react";

const langs = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "es", label: "ES" },
];

export default function LanguageSwitcher({ className = "" }) {
  // infer current lang from the first path segment
  const seg = (typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "") || "";
  const active = ["fr", "de", "es"].includes(seg) ? seg : "en";

  const go = (code) => {
    const rest = (typeof window !== "undefined" ? window.location.pathname.split("/").slice(2).join("/") : "") || "";
    const base = code === "en" ? "" : `/${code}`;
    const path = `/${rest}`.replace(/^\/+$/, "/");
    window.location.pathname = `${base}${path}`;
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => go(l.code)}
          className={`px-2.5 py-1 text-xs rounded-md border transition
            ${active === l.code
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"}`}
          aria-current={active === l.code ? "page" : undefined}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
