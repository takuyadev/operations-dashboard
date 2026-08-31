import { useNavigate, Link } from "react-router";

import { cx } from "@utilities/cx";
import { PriorityTag } from "@components/Tag/PriorityTag";
import { StatusChip } from "@components/Tag/StatusChip";
import { formatIncidentId, type Incident } from "../../data/incidents";
import { CURRENT_USER_ID } from "../../lib/user";
import styles from "./IncidentTable.module.css";

interface IncidentTableProps {
  incidents: Incident[];
  /** Shown when there are no rows. */
  emptyMessage?: string;
  /** Accessible caption for the table. */
  caption: string;
  /** Row to briefly flag as newly arrived (e.g. pushed over the live feed). */
  highlightId?: number | null;
  /** Show the status column (icon marker). Hidden on the Dashboard. */
  showStatus?: boolean;
}

/**
 * Shared incident list. Columns: assignee (current operator's name in the brand
 * colour), priority, status (icon marker; optional), incident, id.
 */
export function IncidentTable({
  incidents,
  emptyMessage = "No incidents to show.",
  caption,
  highlightId = null,
  showStatus = true,
}: IncidentTableProps) {
  const navigate = useNavigate();

  if (incidents.length === 0) {
    return <p className={styles.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th className={styles.colLead} scope="col">
              Assignee
            </th>
            <th className={styles.colPriority} scope="col">
              Priority
            </th>
            {showStatus && (
              <th className={styles.colStatus} scope="col">
                Status
              </th>
            )}
            <th scope="col">Incident</th>
            <th className={styles.colId} scope="col">
              ID
            </th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => {
            const href = `/incidents/${incident.id}`;
            const mine = incident.assignee === CURRENT_USER_ID;
            return (
              <tr
                key={incident.id}
                className={cx(
                  styles.row,
                  incident.id === highlightId && styles.rowNew,
                )}
                onClick={() => navigate(href)}
              >
                <td className={cx(styles.cell, styles.cellLead)}>
                  <span
                    className={cx(
                      styles.assignee,
                      !incident.assignee && styles.assigneeNone,
                      mine && styles.assigneeMine,
                    )}
                  >
                    {incident.assignee ?? "Unassigned"}
                  </span>
                </td>
                <td className={styles.cell}>
                  <PriorityTag priority={incident.priority} />
                </td>
                {showStatus && (
                  <td className={styles.cell}>
                    <StatusChip status={incident.status} />
                  </td>
                )}
                <td className={cx(styles.cell, styles.incidentCell)}>
                  <div className={styles.incidentRow}>
                    <span className={styles.incidentText}>
                      <Link
                        to={href}
                        className={styles.summary}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {incident.summary}
                      </Link>
                      <span className={styles.location}>
                        {incident.location}
                      </span>
                    </span>
                  </div>
                </td>
                <td className={cx(styles.cell, styles.id)}>
                  {formatIncidentId(incident.id)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
