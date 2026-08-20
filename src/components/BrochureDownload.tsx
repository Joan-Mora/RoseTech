import { useEffect, useId, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { COMPANY } from "../content";
import { useI18n } from "../i18n/I18nProvider";

type Props = {
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
};

export default function BrochureDownload({ className, children, onNavigate }: Props) {
  const { locale, m } = useI18n();
  const [open, setOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    // Pin header + lock overflow without body position:fixed (that shifts sticky
    // nav and leaves a dark strip above the light header).
    const html = document.documentElement;
    const body = document.body;
    const navH =
      Number.parseFloat(getComputedStyle(html).getPropertyValue("--nav-h")) || 76;
    const scrollY = window.scrollY;
    const needsSpacer = scrollY < 2;

    html.classList.add("modal-open");
    body.classList.add("modal-open");
    if (needsSpacer) body.style.paddingTop = `${navH}px`;

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.classList.remove("modal-open");
      body.classList.remove("modal-open");
      body.style.removeProperty("padding-top");
    };
  }, [open]);

  const close = () => setOpen(false);

  const download = () => {
    const a = document.createElement("a");
    a.href = COMPANY.brochure;
    a.download = "";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();
    if (locale === "es") return;
    e.preventDefault();
    setOpen(true);
  };

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="modal-backdrop"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
              <h3 id={titleId}>{m.brochureGate.title}</h3>
              <p>{m.brochureGate.body}</p>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={close}>
                  {m.brochureGate.cancel}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    download();
                    close();
                  }}
                >
                  {m.brochureGate.confirm}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <a className={className} href={COMPANY.brochure} download={locale === "es" ? true : undefined} onClick={onClick}>
        {children}
      </a>
      {modal}
    </>
  );
}
