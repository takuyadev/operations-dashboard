/**
 * Theme handling for the Mimamori token layer.
 *
 * The token layer is dark-first (a bare `:root` carries the dark tokens and
 * `[data-theme="light"]` overrides them, tokens/colors.css), but this app
 * defaults to light: <html> always gets an explicit `data-theme`, so the
 * default just decides which value that is. A toggle sets `data-theme` on
 * <html> and remembers the choice.
 *
 * The choice is stored in a cookie (not localStorage) so the server can render
 * the correct `data-theme` on the first response — no flash of the wrong theme,
 * and no hydration mismatch on <html>.
 */

export type Theme = "light" | "dark";

/** Used when no theme cookie is set. */
export const DEFAULT_THEME: Theme = "light";

export const THEME_COOKIE = "ops-theme";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** Pull the theme out of a raw `Cookie:` header (server) or `document.cookie` (client). */
export function parseThemeCookie(cookieHeader: string | null | undefined): Theme {
  const match = cookieHeader?.match(
    new RegExp(`(?:^|;\\s*)${THEME_COOKIE}=([^;]+)`),
  );
  return isTheme(match?.[1]) ? (match![1] as Theme) : DEFAULT_THEME;
}

/** Read the theme the page is currently rendered in. */
export function readDocumentTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const attr = document.documentElement.getAttribute("data-theme");
  return isTheme(attr) ? attr : DEFAULT_THEME;
}

/** Apply a theme on the client: update <html> and persist the cookie for next load. */
export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=${ONE_YEAR};samesite=lax`;
}
