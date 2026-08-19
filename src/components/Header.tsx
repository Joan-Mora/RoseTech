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
    document.body.classList.toggle("nav-lock", open);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("nav-lock");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className={`nav${open ? " open" : ""}`}>
        <div className="nav-inner">
          <a className="brand" href="#inicio" onClick={() => setOpen(false)}>
            <img src={mark} alt={m.hero.logoAlt} width={48} height={58} />
            <span>
              <strong>ROSE S.A.S.</strong>
              <small>{COMPANY.city}</small>
            </span>
          </a>

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

      <div className="nav-drawer" id="mobile-nav" hidden={!open}>
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
          <LanguageSwitcher variant="stack" />
          <ThemeToggle />
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
    </>
  );
}
