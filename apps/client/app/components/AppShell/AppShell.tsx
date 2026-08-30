import type { ReactNode } from "react";
import { NavLink } from "react-router";

import { cx } from "@utilities/cx";
import { Icon } from "@components/Icon/Icon";
import { ThemeToggle } from "@components/ThemeToggle/ThemeToggle";
import styles from "./AppShell.module.css";

interface AppShellProps {
  children: ReactNode;
}

const NAV = [
  { to: "/", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/incidents", label: "History", icon: "history", end: false },
  { to: "/simulate", label: "Simulate", icon: "alert", end: true },
] as const;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.rail}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>RD</span>
          <span className={styles.brandName}>Road Operations</span>
        </div>

        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cx(styles.navItem, isActive && styles.navItemActive)
              }
            >
              <Icon name={item.icon} size={24} className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.spacer} />

        <div className={styles.footer}>
          <ThemeToggle className={styles.themeToggle} />
          <div className={styles.user}>
            <Icon name="user" size={28} />
            <span className={styles.userName}>
              <strong>Operator</strong>
              <span>Shift C</span>
            </span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
