import { useEffect, useMemo, useState } from "react";
import { COMPANY } from "../content";
import BrochureDownload from "./BrochureDownload";
import { useI18n } from "../i18n/I18nProvider";
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

let touchMoveGuard: ((e: TouchEvent) => void) | null = null;

function unlockBody() {
  const html = document.documentElement;
  const body = document.body;
  const lockedTop = body.style.top;

  html.classList.remove("nav-lock");
  body.classList.remove("nav-lock");
  html.style.removeProperty("overflow");
  body.style.removeProperty("overflow");
  body.style.removeProperty("position");
  body.style.removeProperty("top");
  body.style.removeProperty("left");
  body.style.removeProperty("right");
  body.style.removeProperty("width");
  body.style.removeProperty("padding-right");
  html.style.removeProperty("padding-right");

  if (touchMoveGuard) {
    document.removeEventListener("touchmove", touchMoveGuard);
    touchMoveGuard = null;
  }

  if (lockedTop) {
    const y = Math.abs(Number.parseInt(lockedTop, 10) || 0);
    window.scrollTo(0, y);
  }
}

function lockBody() {
  const html = document.documentElement;
  const body = document.body;
  const scrollY = window.scrollY;

  if (touchMoveGuard) {
    document.removeEventListener("touchmove", touchMoveGuard);
    touchMoveGuard = null;
  }

  html.classList.add("nav-lock");
  body.classList.add("nav-lock");
  body.style.top = `-${scrollY}px`;

  touchMoveGuard = (e: TouchEvent) => {
    const drawer = document.getElementById("mobile-nav");
    if (drawer?.contains(e.target as Node)) return;
    e.preventDefault();
  };
  document.addEventListener("touchmove", touchMoveGuard, { passive: false });
}

function isDesktopNav() {
  return window.matchMedia(DESKTOP_NAV_MQ).matches;
}

export default function Header() {
  const { m } = useI18n();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#inicio");
  const mark = theme === "light" ? "./brand/logo-mark-red.png" : "./brand/logo-mark.png";

  const items = useMemo(
    () => NAV_HREFS.map(([key, href]) => ({ href, label: m.nav[key] })),
    [m],
  );

  useEffect(() => {
    const ids = items.map((n) => n.href.slice(1));
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis?.target.id) setActive(`#${vis.target.id}`);
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: [0.1, 0.25, 0.5] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
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
      unlockBody();
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
    if (!open || isDesktopNav()) {
      unlockBody();
      return;
    }

    lockBody();
    return () => unlockBody();
  }, [open]);

  const BrandLink = () => (
    <a className="brand" href="#inicio" onClick={() => setOpen(false)}>
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
                  <a href={item.href} className={active === item.href ? "active" : undefined}>
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
            <a className="btn btn-primary nav-desktop-action" href="#contacto">
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
                    onClick={() => setOpen(false)}
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
            <a className="btn btn-primary" href="#contacto" onClick={() => setOpen(false)}>
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
