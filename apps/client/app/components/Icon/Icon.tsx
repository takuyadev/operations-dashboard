/**
 * Inline SVG icon set. Kept small and local — no icon dependency.
 * All glyphs are drawn on a 24×24 grid with a 2px stroke so they read at the
 * large sizes this UI uses.
 */

export type IconName =
  | "dashboard"
  | "history"
  | "user"
  | "chevron-left"
  | "chevron-right"
  | "arrow-left"
  | "close"
  | "check"
  | "alert"
  | "dispatch"
  | "search"
  | "sun"
  | "moon";

interface IconProps {
  name: IconName;
  /** Pixel size of the square glyph. Defaults to 24. */
  size?: number;
  className?: string;
}

const PATHS: Record<IconName, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="10" rx="1" />
      <rect x="3" y="17" width="8" height="4" rx="1" />
      <rect x="13" y="3" width="8" height="4" rx="1" />
      <rect x="13" y="11" width="8" height="10" rx="1" />
    </>
  ),
  history: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5V20l-4-2.5L12 20l-4-2.5L4 20z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </>
  ),
  "chevron-left": <path d="M15 5l-7 7 7 7" />,
  "chevron-right": <path d="M9 5l7 7-7 7" />,
  "arrow-left": (
    <>
      <path d="M20 12H4" />
      <path d="M10 6l-6 6 6 6" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  check: <path d="M4 12.5l5 5L20 6.5" />,
  alert: (
    <>
      <path d="M12 3.5 1.8 20.2a1 1 0 0 0 .87 1.5h18.66a1 1 0 0 0 .87-1.5z" />
      <path d="M12 9v5" />
      <path d="M12 17.5v.5" />
    </>
  ),
  dispatch: (
    <>
      <path d="M2 7h11v8H2z" />
      <path d="M13 10h4l4 3v2h-8z" />
      <circle cx="6.5" cy="17" r="1.8" />
      <circle cx="17" cy="17" r="1.8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 13.5A8 8 0 1 1 10.5 4a6.3 6.3 0 0 0 9.5 9.5z" />,
};

export function Icon({ name, size = 24, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
