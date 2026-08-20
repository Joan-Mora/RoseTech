import type { ReactNode } from "react";

type IconProps = { className?: string; title?: string };

function wrap(title: string | undefined, children: ReactNode, className?: string, size = 20) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
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

export function IconCamera({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <path
        d="M4.5 8.5h2.2l1.2-2h8.2l1.2 2H19.5A1.5 1.5 0 0 1 21 10v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18v-8a1.5 1.5 0 0 1 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="14" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </>,
    className,
  );
}

export function IconWrench({ className, title }: IconProps) {
  return wrap(
    title,
    <path
      d="M14.7 6.3a4 4 0 0 0-5.6 5.6L3.5 17.5l3 3 5.6-5.6a4 4 0 0 0 5.6-5.6l-2.5 2.5-2.5-2.5 2.5-2.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
    className,
  );
}

export function IconClipboard({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <rect x="6" y="4.5" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 4.5h6V6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 11h6M9 14.5h6M9 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>,
    className,
  );
}

export function IconSearch({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15 15 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>,
    className,
  );
}

export function IconPen({ className, title }: IconProps) {
  return wrap(
    title,
    <path
      d="m4.5 16.2 9.8-9.8 3.3 3.3-9.8 9.8H4.5v-3.3Zm11.2-11.2 1.6-1.6a1.4 1.4 0 0 1 2 2l-1.6 1.6-2-2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
    className,
  );
}

export function IconCode({ className, title }: IconProps) {
  return wrap(
    title,
    <path
      d="m8 8-4 4 4 4M16 8l4 4-4 4M13.2 6l-2.4 12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    className,
  );
}

export function IconRocket({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <path
        d="M12 3c3.5 1.2 6 4.8 6 9.2 0 1.4-.3 2.6-.8 3.7L12 21l-5.2-5.1A9.4 9.4 0 0 1 6 12.2C6 7.8 8.5 4.2 12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.2 16.8 6 20.5M15.8 16.8 18 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>,
    className,
  );
}

export function IconDesktop({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <rect x="3.5" y="4.5" width="17" height="12" rx="1.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 20.5h8M12 16.5v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>,
    className,
  );
}

export function IconLaptop({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <path
        d="M5 6.5A1.5 1.5 0 0 1 6.5 5h11A1.5 1.5 0 0 1 19 6.5V14H5V6.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M3.5 17h17v1.2A1.3 1.3 0 0 1 19.2 19.5H4.8A1.3 1.3 0 0 1 3.5 18.2V17Z" stroke="currentColor" strokeWidth="1.8" />
    </>,
    className,
  );
}

export function IconTablet({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <rect x="6" y="3.5" width="12" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11 18.5h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>,
    className,
  );
}

export function IconSpeaker({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <path d="M4.5 9.5v5h3.2L12 18.5V5.5L7.7 9.5H4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M15.2 9.2a3.2 3.2 0 0 1 0 5.6M17.5 7a5.5 5.5 0 0 1 0 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>,
    className,
  );
}

export function IconCable({ className, title }: IconProps) {
  return wrap(
    title,
    <path
      d="M8 4.5v4.2a2 2 0 0 0 2 2h4a2 2 0 0 1 2 2V19.5M8 4.5H5.5M8 4.5h2.5M16 19.5h2.5M16 19.5h-2.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    className,
  );
}

export function IconShield({ className, title }: IconProps) {
  return wrap(
    title,
    <path
      d="M12 3.5 19 6.5v5.2c0 4.4-2.9 7.5-7 9.3-4.1-1.8-7-4.9-7-9.3V6.5L12 3.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
    className,
  );
}

export function IconChat({ className, title }: IconProps) {
  return wrap(
    title,
    <path
      d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8A1.5 1.5 0 0 1 19 16.5H10l-4.5 3v-3H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
    className,
  );
}

export function IconRefresh({ className, title }: IconProps) {
  return wrap(
    title,
    <path
      d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4.2h-4.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    className,
  );
}

export function IconBadge({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <circle cx="12" cy="10" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9.2 18.5 1.3-3.2h3l1.3 3.2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m10.2 10 1.3 1.3 2.5-2.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    className,
  );
}

export function IconUsers({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <circle cx="9" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16" cy="9.2" r="2.1" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.8 18.5c.4-2.8 2.6-4.5 5.2-4.5s4.8 1.7 5.2 4.5M14 14.5c1.9.2 3.5 1.4 4.2 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </>,
    className,
  );
}

export function IconLock({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" strokeWidth="1.8" />
    </>,
    className,
  );
}

export function IconBuilding({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <path d="M4.5 20.5h15M6.5 20.5V5.5h7v15M13.5 9.5h4v11" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 8.5h2M8.5 11.5h2M8.5 14.5h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>,
    className,
  );
}

export function IconHome({ className, title }: IconProps) {
  return wrap(
    title,
    <path
      d="m4 11 8-7 8 7v8.5a1 1 0 0 1-1 1h-5.2v-5H10.2v5H5a1 1 0 0 1-1-1V11Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
    className,
  );
}

export function IconSchool({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <path d="m3.5 10 8.5-4.5L20.5 10 12 14.5 3.5 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 12.2v4.3c1.6 1 3.2 1.5 5 1.5s3.4-.5 5-1.5v-4.3M20.5 10v6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>,
    className,
  );
}

export function IconStar({ className, title }: IconProps) {
  return wrap(
    title,
    <path
      d="m12 3.8 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9l5-.7L12 3.8Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
    className,
  );
}

export function IconBriefcase({ className, title }: IconProps) {
  return wrap(
    title,
    <>
      <rect x="3.5" y="8" width="17" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8M3.5 12.5h17" stroke="currentColor" strokeWidth="1.8" />
    </>,
    className,
  );
}

export function IconMap({ className, title }: IconProps) {
  return wrap(
    title,
    <path
      d="m3.5 7.5 5.5-2 6 2 5.5-2v11l-5.5 2-6-2-5.5 2v-11Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />,
    className,
  );
}
