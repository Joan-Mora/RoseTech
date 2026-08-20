import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const STORAGE = "rose-theme";

type Ctx = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);

function readStored(): Theme | null {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    /* private / blocked storage */
  }
  return null;
}

function systemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function preferTheme(): Theme {
  return readStored() ?? systemTheme();
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(theme === "light" ? "theme-light" : "theme-dark");

  /* setProperty is more reliable than style.colorScheme on some Chromium forks (Samsung Internet). */
  try {
    root.style.setProperty("color-scheme", theme);
  } catch {
    /* ignore */
  }
  try {
    (root.style as CSSStyleDeclaration & { colorScheme?: string }).colorScheme = theme;
  } catch {
    /* ignore */
  }

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute("content", theme === "light" ? "#f3eee6" : "#0a0a0a");

  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  if (colorSchemeMeta) colorSchemeMeta.setAttribute("content", theme);
}

function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE, theme);
  } catch {
    /* ignore */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => preferTheme());

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    persistTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      persistTheme(next);
      return next;
    });
  }, []);

  /* Sync DOM before paint so CSS variables / color-scheme match React state. */
  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    persistTheme(theme);
  }, [theme]);

  /* Follow system preference only when the user has no stored choice. */
  useEffect(() => {
    let mq: MediaQueryList;
    try {
      mq = window.matchMedia("(prefers-color-scheme: light)");
    } catch {
      return;
    }

    const onChange = () => {
      if (readStored()) return;
      const next: Theme = mq.matches ? "light" : "dark";
      applyTheme(next);
      setThemeState(next);
    };

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
