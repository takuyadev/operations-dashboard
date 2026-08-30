import { cx } from "@utilities/cx";
import type { StreamStatus } from "../../hooks/useIncidentStream";
import styles from "./LiveBadge.module.css";

const LABEL: Record<StreamStatus, string> = {
  connecting: "Connecting…",
  open: "Live",
  closed: "Reconnecting…",
};

/** Small status pill for the WebSocket incident feed. Green dot when connected. */
export function LiveBadge({ status }: { status: StreamStatus }) {
  return (
    <span
      className={cx(styles.badge, status === "open" && styles.on)}
      aria-live="polite"
    >
      <span className={styles.dot} />
      {LABEL[status]}
    </span>
  );
}
