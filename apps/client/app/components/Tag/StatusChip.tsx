import { cx } from "@utilities/cx";
import { Icon, type IconName } from "@components/Icon/Icon";
import { STATUS_LABEL, type IncidentStatus } from "../../data/incidents";
import styles from "./StatusChip.module.css";

const STATUS_ICON: Record<IncidentStatus, IconName> = {
  unresolved: "close",
  dispatched: "dispatch",
  resolved: "check",
};

/** Small icon-only status marker for list rows (resolved = green checkmark). */
export function StatusChip({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={cx(styles.chip, styles[status])}
      role="img"
      aria-label={STATUS_LABEL[status]}
      title={STATUS_LABEL[status]}
    >
      <Icon name={STATUS_ICON[status]} size={15} />
    </span>
  );
}
