import { useCallback, useState } from "react";
import { useRouteLoaderData } from "react-router";

import { applyTheme, DEFAULT_THEME, isTheme, type Theme } from "../lib/theme";

interface UseTheme {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

/**
 * Read/write the active colour theme. Seeds from the root loader (which read the
 * cookie), so server and client agree — no hydration mismatch, correct on first
 * paint.
 */
export function useTheme(): UseTheme {
  const rootData = useRouteLoaderData("root") as
    | { theme?: Theme }
    | undefined;
  const initial = isTheme(rootData?.theme) ? rootData.theme : DEFAULT_THEME;

  const [theme, setThemeState] = useState<Theme>(initial);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, setTheme, toggle };
}
