import { useEffect, useId, useState, type MouseEvent, type ReactNode } from "react";
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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

  return (
    <>
      <a className={className} href={COMPANY.brochure} download={locale === "es" ? true : undefined} onClick={onClick}>
        {children}
      </a>
      {open ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
            <h3 id={titleId}>{m.brochureGate.title}</h3>
            <p>{m.brochureGate.body}</p>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                {m.brochureGate.cancel}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  download();
                  setOpen(false);
                }}
              >
                {m.brochureGate.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
