import type { ReactNode } from "react";

import { cx } from "@utilities/cx";
import type { Priority } from "../../data/incidents";
import styles from "./StatBlock.module.css";

interface StatBlockProps {
  title: string;
  children: ReactNode;
}

export function StatBlock({ title, children }: StatBlockProps) {
  return (
    <div className={styles.block}>
      <h3 className={styles.title}>{title}</h3>
      {children}
    </div>
  );
}

export interface BreakdownRow {
  tone: Priority;
  count: number;
  label: string;
}

export function StatBreakdown({ rows }: { rows: BreakdownRow[] }) {
  return (
    <ul className={styles.rows}>
      {rows.map((row) => (
        <li key={row.label} className={styles.row}>
          <span className={cx(styles.dot, styles[row.tone])} />
          <span className={styles.count}>{row.count}</span>
          <span className={styles.rowLabel}>{row.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function StatFigure({
  value,
  unit,
}: {
  value: number | string;
  unit: string;
}) {
  return (
    <p className={styles.figure}>
      <span className={styles.figureValue}>{value}</span>
      <span className={styles.figureUnit}>{unit}</span>
    </p>
  );
}
