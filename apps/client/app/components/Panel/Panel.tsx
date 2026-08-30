import type { ReactNode } from "react";

import { cx } from "@utilities/cx";
import styles from "./Panel.module.css";

interface PanelProps {
  /** Main panel heading, e.g. "Assigned to you". */
  title?: ReactNode;
  /** Small tracked label above the title, e.g. "QUEUE". */
  eyebrow?: string;
  /** Right-aligned control in the header — typically <Pagination>. */
  action?: ReactNode;
  /** Remove body padding, e.g. when the body is a full-bleed table. */
  flush?: boolean;
  children: ReactNode;
  className?: string;
  /** Accessible label when the panel has no visible title. */
  "aria-label"?: string;
}

export function Panel({
  title,
  eyebrow,
  action,
  flush = false,
  children,
  className,
  "aria-label": ariaLabel,
}: PanelProps) {
  const hasHeader = Boolean(title || eyebrow || action);

  return (
    <section className={cx(styles.panel, className)} aria-label={ariaLabel}>
      {hasHeader ? (
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            {eyebrow ? (
              <span className={cx("label", styles.eyebrow)}>{eyebrow}</span>
            ) : null}
            {title ? <h2 className={styles.heading}>{title}</h2> : null}
          </div>
          {action ? <div className={styles.action}>{action}</div> : null}
        </header>
      ) : null}
      <div className={cx(styles.body, flush && styles.bodyFlush)}>{children}</div>
    </section>
  );
}
