import type { ReactNode } from "react";

type IconProps = { className?: string; title?: string };

function wrap(title: string | undefined, children: ReactNode, className?: string) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function IconPin({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
    </>,
    className,
  );
}

export function IconPhone({ className, title }: IconProps) {
  return wrap(
    title,
    <path
      d="M7.2 3.8h2.3l1.2 3-1.6 1.1a12.5 12.5 0 0 0 5 5l1.1-1.6 3 1.2v2.3c0 .7-.5 1.3-1.2 1.4A16.6 16.6 0 0 1 3.8 6c.1-.7.7-1.2 1.4-1.2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
    className,
  );
}

export function IconMail({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4.2 7.2 7.8 6.2 7.8-6.2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </>,
    className,
  );
}

export function IconShop({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <path
        d="M4 9.2 5.3 5.4A2 2 0 0 1 7.2 4h9.6a2 2 0 0 1 1.9 1.4L20 9.2V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V9.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M4 9.2h16M9 20.5V13h6v7.5" stroke="currentColor" strokeWidth="1.8" />
    </>,
    className,
  );
}

export function IconClock({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8.2V12l3 2.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>,
    className,
  );
}
