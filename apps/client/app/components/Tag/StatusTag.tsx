import { cx } from "@utilities/cx";
import { Icon, type IconName } from "@components/Icon/Icon";
import { STATUS_LABEL, type IncidentStatus } from "../../data/incidents";
import styles from "./Tag.module.css";

interface StatusTagProps {
  status: IncidentStatus;
  size?: "md" | "lg";
}

const STATUS_ICON: Record<IncidentStatus, IconName> = {
  unresolved: "close",
  dispatched: "dispatch",
  resolved: "check",
};

export function StatusTag({ status, size = "md" }: StatusTagProps) {
  return (
    <span className={cx(styles.tag, styles[status], size === "lg" && styles.lg)}>
      <Icon name={STATUS_ICON[status]} size={16} className={styles.icon} />
      <span className={styles.text}>{STATUS_LABEL[status]}</span>
    </span>
  );
}
