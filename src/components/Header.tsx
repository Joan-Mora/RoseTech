import { useEffect, useMemo, useRef, useState } from "react";
import { COMPANY } from "../content";
import BrochureDownload from "./BrochureDownload";
import { useI18n } from "../i18n/I18nProvider";
import { forceUnlockBody, lockBody, unlockBody } from "../lib/bodyLock";
import { useTheme } from "../theme/ThemeProvider";
import { LanguageSwitcher, ThemeToggle } from "./SiteControls";

const NAV_HREFS = [
  ["home", "#inicio"],
  ["about", "#quienes-somos"],
  ["services", "#servicios"],
  ["software", "#software"],
  ["products", "#productos"],
  ["why", "#por-que"],
  ["team", "#equipo"],
  ["coverage", "#cobertura"],
  ["contact", "#contacto"],
] as const;

/** Matches CSS hamburger breakpoint: `@media (max-width: 1279px)`. */
const DESKTOP_NAV_MQ = "(min-width: 1280px)";

function isDesktopNav() {
  return window.matchMedia(DESKTOP_NAV_MQ).matches;
}

function navOffsetPx() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--nav-h").trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 76;
}

export default function Header() {
  const { m } = useI18n();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#inicio");
  const ignoreSpyUntil = useRef(0);
  const mark = theme === "light" ? "./brand/logo-mark-red.png" : "./brand/logo-mark.png";

  const items = useMemo(
    () => NAV_HREFS.map(([key, href]) => ({ href, label: m.nav[key] })),
    [m],
  );

  useEffect(() => {
    const ids = items.map((n) => n.href.slice(1));

    const syncFromScroll = () => {
      if (performance.now() < ignoreSpyUntil.current) return;
      const probe = navOffsetPx() + 16;
      let current = `#${ids[0]}`;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= probe) current = `#${id}`;
      }
      setActive((prev) => (prev === current ? prev : current));
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        syncFromScroll();
      });
    };

    const onHash = () => {
      const hash = window.location.hash;
      if (hash && ids.includes(hash.slice(1))) {
        ignoreSpyUntil.current = performance.now() + 700;
        setActive(hash);
      }
    };

    syncFromScroll();
    onHash();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onHash);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const closeIfDesktop = () => {
      if (!isDesktopNav()) return;
      setOpen(false);
      forceUnlockBody();
    };

    closeIfDesktop();
    const mq = window.matchMedia(DESKTOP_NAV_MQ);
    mq.addEventListener("change", closeIfDesktop);
    window.addEventListener("resize", closeIfDesktop);
    return () => {
      mq.removeEventListener("change", closeIfDesktop);
      window.removeEventListener("resize", closeIfDesktop);
    };
  }, []);

  useEffect(() => {
    if (!open || isDesktopNav()) return;
    lockBody();
    return () => unlockBody();
  }, [open]);

  const goTo = (href: string) => (e: { preventDefault: () => void }) => {
    e.preventDefault();
    ignoreSpyUntil.current = performance.now() + 700;
    setActive(href);
    setOpen(false);
    const el = document.getElementById(href.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", href);
    }
  };

  const BrandLink = () => (
    <a className="brand" href="#inicio" onClick={goTo("#inicio")}>
      <img src={mark} alt={m.hero.logoAlt} width={48} height={58} />
      <span>
        <strong>ROSE S.A.S.</strong>
        <small>{COMPANY.city}</small>
      </span>
    </a>
  );

  return (
    <>
      <header className={`nav${open ? " open" : ""}`}>
        <div className="nav-inner">
          <BrandLink />

          <nav className="nav-desktop" aria-label={m.a11y.mainNav}>
            <ul className="nav-links">
              {items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={active === item.href ? "active" : undefined}
                    onClick={goTo(item.href)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-cta">
            <div className="nav-tools nav-desktop-action">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <BrochureDownload className="btn btn-ghost nav-desktop-action">{m.nav.brochure}</BrochureDownload>
            <a className="btn btn-primary nav-desktop-action" href="#contacto" onClick={goTo("#contacto")}>
              {m.nav.contactCta}
            </a>
            <button
              className="menu-btn"
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? m.a11y.closeMenu : m.a11y.openMenu}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="menu-lines" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="nav-drawer" id="mobile-nav" hidden={!open} role="dialog" aria-modal={open || undefined}>
        <div className="nav-drawer-head">
          <BrandLink />
          <button className="menu-btn drawer-close" type="button" aria-label={m.a11y.closeMenu} onClick={() => setOpen(false)}>
            <span className="menu-lines" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
        <div className="nav-drawer-body">
          <nav aria-label={m.a11y.mobileNav}>
            <ul className="drawer-links">
              {items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={active === item.href ? "active" : undefined}
                    onClick={goTo(item.href)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="drawer-tools">
            <ThemeToggle />
            <LanguageSwitcher variant="stack" />
          </div>
          <div className="drawer-actions">
            <a className="btn btn-primary" href="#contacto" onClick={goTo("#contacto")}>
              {m.nav.contactCta}
            </a>
            <BrochureDownload className="btn btn-ghost" onNavigate={() => setOpen(false)}>
              {m.nav.brochureLong}
            </BrochureDownload>
          </div>
        </div>
      </div>
    </>
  );
}
