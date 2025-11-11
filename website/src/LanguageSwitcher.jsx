import { useTranslation } from "react-i18next";

const SUPPORTED = ["en","fr","de","es"];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      {SUPPORTED.map(code => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={i18n.language?.startsWith(code) ? "active-lang" : "muted-lang"}
          aria-label={`Switch language to ${code.toUpperCase()}`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
