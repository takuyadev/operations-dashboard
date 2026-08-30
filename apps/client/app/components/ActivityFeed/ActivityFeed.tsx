import { cx } from "@utilities/cx";
import type { ActivityEvent, ActivityKind } from "../../data/incidents";
import styles from "./ActivityFeed.module.css";

interface ActivityFeedProps {
  events: ActivityEvent[];
  emptyMessage?: string;
}

const KIND_META: Record<ActivityKind, { label: string; className: string }> = {
  "alert-high": { label: "High alert", className: "alertHigh" },
  "alert-low": { label: "Low alert", className: "alertLow" },
  assign: { label: "Assigned", className: "assign" },
  dispatch: { label: "Dispatched", className: "dispatch" },
  resolve: { label: "Resolved", className: "resolve" },
  message: { label: "Message", className: "note" },
};

export function ActivityFeed({
  events,
  emptyMessage = "No activity yet.",
}: ActivityFeedProps) {
  if (events.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <ul className={styles.feed}>
      {events.map((event) => {
        const meta = KIND_META[event.kind];
        return (
          <li key={event.id} className={cx(styles.item, styles[meta.className])}>
            <div className={styles.topline}>
              <span className={styles.kind}>
                <span className={styles.kindDot} />
                {meta.label}
              </span>
              <span className={styles.time}>{event.time}</span>
            </div>
            <p className={styles.message}>{event.message}</p>
          </li>
        );
      })}
    </ul>
  );
}
