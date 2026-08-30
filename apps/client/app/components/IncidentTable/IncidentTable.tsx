import { useNavigate, Link } from "react-router";

import { cx } from "@utilities/cx";
import { PriorityTag } from "@components/Tag/PriorityTag";
import { StatusTag } from "@components/Tag/StatusTag";
import { formatIncidentId, type Incident } from "../../data/incidents";
import styles from "./IncidentTable.module.css";

interface IncidentTableProps {
  incidents: Incident[];
  /** Shown when there are no rows. */
  emptyMessage?: string;
  /** Accessible caption for the table. */
  caption: string;
}

export function IncidentTable({
  incidents,
  emptyMessage = "No incidents to show.",
  caption,
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
            <th className={styles.colStatus} scope="col">
              Status
            </th>
            <th className={styles.colPriority} scope="col">
              Priority
            </th>
            <th scope="col">Incident</th>
            <th className={styles.colId} scope="col">
              ID
            </th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => {
            const href = `/incidents/${incident.id}`;
            return (
              <tr
                key={incident.id}
                className={styles.row}
                onClick={() => navigate(href)}
              >
                <td className={cx(styles.cell, styles.cellStatus)}>
                  <StatusTag status={incident.status} />
                </td>
                <td className={styles.cell}>
                  <PriorityTag priority={incident.priority} />
                </td>
                <td className={cx(styles.cell, styles.incidentCell)}>
                  <Link
                    to={href}
                    className={styles.summary}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {incident.summary}
                  </Link>
                  <span className={styles.location}>{incident.location}</span>
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
