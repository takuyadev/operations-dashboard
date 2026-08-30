import { cx } from "@utilities/cx";
import { PRIORITY_LABEL, type Priority } from "../../data/incidents";
import styles from "./Tag.module.css";

interface PriorityTagProps {
  priority: Priority;
  size?: "md" | "lg";
}

export function PriorityTag({ priority, size = "md" }: PriorityTagProps) {
  return (
    <span
      className={cx(styles.tag, styles[priority], size === "lg" && styles.lg)}
    >
      <span className={styles.dot} />
      <span className={styles.text}>{PRIORITY_LABEL[priority]}</span>
    </span>
  );
}
