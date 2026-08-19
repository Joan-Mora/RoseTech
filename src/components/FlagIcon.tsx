import type { ReactNode } from "react";
import type { Locale } from "../i18n/locales";

/** SVG flags so Windows (which does not render emoji flags) still shows a real flag. */
export default function FlagIcon({ locale }: { locale: Locale }) {
  return (
    <span className="flag-icon" aria-hidden="true">
      {FLAGS[locale]}
    </span>
  );
}

const FLAGS: Record<Locale, ReactNode> = {
  es: (
    <svg viewBox="0 0 60 40" focusable="false">
      <rect width="60" height="40" fill="#AA151B" />
      <rect y="10" width="60" height="20" fill="#F1BF00" />
    </svg>
  ),
  en: (
    <svg viewBox="0 0 60 40" focusable="false">
      <rect width="60" height="40" fill="#012169" />
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth="8" />
      <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth="4" />
      <path d="M30 0 V40 M0 20 H60" stroke="#fff" strokeWidth="13" />
      <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth="7" />
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 60 40" focusable="false">
      <rect width="20" height="40" fill="#002395" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#ED2939" />
    </svg>
  ),
  "zh-CN": (
    <svg viewBox="0 0 60 40" focusable="false">
      <rect width="60" height="40" fill="#DE2910" />
      <polygon fill="#FFDE00" points="10,7 11.9,12.6 17.8,12.6 13,16.1 14.9,21.8 10,18.2 5.1,21.8 7,16.1 2.2,12.6 8.1,12.6" />
      <polygon fill="#FFDE00" points="22,6.5 23,9.4 26.1,9.4 23.6,11.2 24.6,14.1 22,12.3 19.4,14.1 20.4,11.2 17.9,9.4 21,9.4" />
      <polygon fill="#FFDE00" points="26.5,12 27.5,14.9 30.6,14.9 28.1,16.7 29.1,19.6 26.5,17.8 23.9,19.6 24.9,16.7 22.4,14.9 25.5,14.9" />
      <polygon fill="#FFDE00" points="26.5,20.5 27.5,23.4 30.6,23.4 28.1,25.2 29.1,28.1 26.5,26.3 23.9,28.1 24.9,25.2 22.4,23.4 25.5,23.4" />
      <polygon fill="#FFDE00" points="21.8,25.2 22.8,28.1 25.9,28.1 23.4,29.9 24.4,32.8 21.8,31 19.2,32.8 20.2,29.9 17.7,28.1 20.8,28.1" />
    </svg>
  ),
  "pt-BR": (
    <svg viewBox="0 0 60 40" focusable="false">
      <rect width="60" height="40" fill="#009B3A" />
      <polygon fill="#FEDD00" points="30,5 55,20 30,35 5,20" />
      <circle cx="30" cy="20" r="7.5" fill="#002776" />
    </svg>
  ),
  de: (
    <svg viewBox="0 0 60 40" focusable="false">
      <rect width="60" height="13.4" fill="#000" />
      <rect y="13.3" width="60" height="13.4" fill="#DD0000" />
      <rect y="26.6" width="60" height="13.4" fill="#FFCE00" />
    </svg>
  ),
  ja: (
    <svg viewBox="0 0 60 40" focusable="false">
      <rect width="60" height="40" fill="#fff" />
      <circle cx="30" cy="20" r="9" fill="#BC002D" />
    </svg>
  ),
  it: (
    <svg viewBox="0 0 60 40" focusable="false">
      <rect width="20" height="40" fill="#009246" />
      <rect x="20" width="20" height="40" fill="#fff" />
      <rect x="40" width="20" height="40" fill="#CE2B37" />
    </svg>
  ),
  ko: (
    <svg viewBox="0 0 60 40" focusable="false">
      <rect width="60" height="40" fill="#fff" />
      <circle cx="30" cy="20" r="8" fill="#C60C30" />
      <path d="M22 20 a8 8 0 0 0 16 0 a4 4 0 0 1 -8 0 a4 4 0 0 0 -8 0" fill="#003478" />
    </svg>
  ),
};
