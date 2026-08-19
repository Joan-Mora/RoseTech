export const LOCALES = ["es", "en", "fr", "zh-CN", "pt-BR", "de", "ja", "it", "ko"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "es";

export const LOCALE_META: Record<
  Locale,
  { label: string; native: string; flag: string; htmlLang: string }
> = {
  es: { label: "Spanish", native: "Español", flag: "🇪🇸", htmlLang: "es" },
  en: { label: "English", native: "English", flag: "🇬🇧", htmlLang: "en" },
  fr: { label: "French", native: "Français", flag: "🇫🇷", htmlLang: "fr" },
  "zh-CN": { label: "Chinese", native: "简体中文", flag: "🇨🇳", htmlLang: "zh-CN" },
  "pt-BR": { label: "Portuguese", native: "Português", flag: "🇧🇷", htmlLang: "pt-BR" },
  de: { label: "German", native: "Deutsch", flag: "🇩🇪", htmlLang: "de" },
  ja: { label: "Japanese", native: "日本語", flag: "🇯🇵", htmlLang: "ja" },
  it: { label: "Italian", native: "Italiano", flag: "🇮🇹", htmlLang: "it" },
  ko: { label: "Korean", native: "한국어", flag: "🇰🇷", htmlLang: "ko" },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && (LOCALES as readonly string[]).includes(value));
}

export const TOPIC_IDS = [
  "diagnostico",
  "cotizacion",
  "myshop",
  "productos",
  "asesoria",
  "mantenimiento",
] as const;

export type TopicId = (typeof TOPIC_IDS)[number];

export function isTopicId(value: string): value is TopicId {
  return (TOPIC_IDS as readonly string[]).includes(value);
}
