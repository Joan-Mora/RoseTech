import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, isLocale, LOCALE_META, type Locale } from "./locales";
import esMsg from "./locales/es.json";
import enMsg from "./locales/en.json";
import frMsg from "./locales/fr.json";
import zhMsg from "./locales/zh-CN.json";
import ptMsg from "./locales/pt-BR.json";
import deMsg from "./locales/de.json";
import jaMsg from "./locales/ja.json";
import itMsg from "./locales/it.json";
import koMsg from "./locales/ko.json";

export type Messages = typeof esMsg;

const catalog: Record<Locale, Messages> = {
  es: esMsg,
  en: enMsg as Messages,
  fr: frMsg as Messages,
  "zh-CN": zhMsg as Messages,
  "pt-BR": ptMsg as Messages,
  de: deMsg as Messages,
  ja: jaMsg as Messages,
  it: itMsg as Messages,
  ko: koMsg as Messages,
};

const STORAGE = "rose-locale";

type Ctx = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  m: Messages;
  interpolate: (template: string, vars: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

function readStored(): Locale | null {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (isLocale(raw)) return raw;
  } catch {
    /* ignore */
  }
  return null;
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStored() ?? DEFAULT_LOCALE);

  useEffect(() => {
    document.documentElement.lang = LOCALE_META[locale].htmlLang;
    document.title = catalog[locale].meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", catalog[locale].meta.description);
    try {
      localStorage.setItem(STORAGE, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale: setLocaleState,
      m: catalog[locale],
      interpolate,
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
