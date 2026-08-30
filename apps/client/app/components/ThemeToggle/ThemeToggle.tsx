import { cx } from "@utilities/cx";
import { Icon } from "@components/Icon/Icon";
import { useTheme } from "../../hooks/useTheme";
import type { Theme } from "../../lib/theme";
import styles from "./ThemeToggle.module.css";

const OPTIONS: { value: Theme; label: string; icon: "sun" | "moon" }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
];

interface ThemeToggleProps {
  className?: string;
}

/** Segmented light/dark switch. Persists the choice and updates <html data-theme>. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cx(styles.group, className)}
      role="group"
      aria-label="Colour theme"
    >
      {OPTIONS.map((option) => {
        const active = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={cx(styles.option, active && styles.optionActive)}
            aria-pressed={active}
            onClick={() => setTheme(option.value)}
          >
            <Icon name={option.icon} size={18} className={styles.icon} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
