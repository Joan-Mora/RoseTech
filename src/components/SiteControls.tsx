import { useEffect, useId, useRef, useState } from "react";
import { LOCALES, LOCALE_META } from "../i18n/locales";
import { useI18n } from "../i18n/I18nProvider";
import { useTheme } from "../theme/ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { m } = useI18n();
  const toLight = theme === "dark";
  return (
    <button
      type="button"
      className={`icon-btn ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={toLight ? m.a11y.themeToLight : m.a11y.themeToDark}
      title={toLight ? m.a11y.themeToLight : m.a11y.themeToDark}
    >
      {toLight ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 4.2a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.2a1 1 0 0 1 1-1Zm0 11.3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.8-4.5H18a1 1 0 1 1 0-2h1.8a1 1 0 1 1 0 2ZM6 12a1 1 0 0 1-1 1H3.2a1 1 0 1 1 0-2H5a1 1 0 0 1 1 1Zm11.4 5.5-.9-.9a1 1 0 1 1 1.4-1.4l.9.9a1 1 0 1 1-1.4 1.4ZM7.5 7.5a1 1 0 0 1-1.4 0l-.9-.9A1 1 0 0 1 6.6 5.2l.9.9a1 1 0 0 1 0 1.4Zm9.9-2.3.9.9a1 1 0 1 1-1.4 1.4l-.9-.9a1 1 0 0 1 1.4-1.4ZM6.6 16.2l.9.9a1 1 0 1 1-1.4 1.4l-.9-.9a1 1 0 1 1 1.4-1.4ZM12 17a1 1 0 0 1 1 1v1.8a1 1 0 1 1-2 0V18a1 1 0 0 1 1-1Z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M14.6 3.2a1 1 0 0 1 1.2 1.3A8 8 0 1 0 19.5 16a1 1 0 0 1 1.6.9 10 10 0 1 1-8.3-14.2 1 1 0 0 1 1.8.5Z"
          />
        </svg>
      )}
    </button>
  );
}

export function LanguageSwitcher({ variant = "compact" }: { variant?: "compact" | "stack" }) {
  const { locale, setLocale, m } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = LOCALE_META[locale];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className={`lang-switch ${variant}`} ref={root}>
      <button
        type="button"
        className="icon-btn lang-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={m.a11y.language}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flag" aria-hidden="true">
          {current.flag}
        </span>
        {variant === "stack" ? <span>{current.native}</span> : null}
      </button>
      {open ? (
        <ul id={listId} className="lang-menu" role="listbox" aria-label={m.a11y.language}>
          {LOCALES.map((code) => (
            <li key={code}>
              <button
                type="button"
                role="option"
                aria-selected={code === locale}
                className={code === locale ? "is-on" : undefined}
                onClick={() => {
                  setLocale(code);
                  setOpen(false);
                }}
              >
                <span className="flag" aria-hidden="true">
                  {LOCALE_META[code].flag}
                </span>
                <span>{LOCALE_META[code].native}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
