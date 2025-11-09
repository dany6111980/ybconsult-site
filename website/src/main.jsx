// src/main.jsx
import React, { useMemo, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Site from "./Site.jsx";

const LANGS = ["en", "fr", "de", "es"];

function getLangFromPath() {
  const seg = (window.location.pathname || "/").split("/").filter(Boolean)[0];
  return LANGS.includes(seg) ? seg : "en";
}

function App() {
  const [lang, setLang] = useState(getLangFromPath());

  // Keep URL and state in sync
  useEffect(() => {
    const onPop = () => setLang(getLangFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigateLang = (next) => {
    if (next === "en") {
      window.history.pushState({}, "", "/");
    } else {
      window.history.pushState({}, "", `/${next}`);
    }
    setLang(next);
    try { window.plausible && window.plausible("LangChange", { props: { lang: next } }); } catch {}
  };

  return <Site lang={lang} onLangChange={navigateLang} />;
}

createRoot(document.getElementById("root")).render(<App />);

