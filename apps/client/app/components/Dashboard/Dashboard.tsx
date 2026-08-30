import { useMemo, useState } from "react";

import { AppShell } from "@components/AppShell/AppShell";
import { PageHeader } from "@components/PageHeader/PageHeader";
import { Panel } from "@components/Panel/Panel";
import { Pagination } from "@components/Pagination/Pagination";
import { IncidentTable } from "@components/IncidentTable/IncidentTable";
import { ActivityFeed } from "@components/ActivityFeed/ActivityFeed";
import { AlertBanner } from "@components/AlertBanner/AlertBanner";
import { LiveBadge } from "@components/LiveBadge/LiveBadge";
import {
  StatBlock,
  StatBreakdown,
  StatFigure,
} from "@components/StatBlock/StatBlock";
import { useIncidentStream } from "../../hooks/useIncidentStream";
import {
  DASHBOARD_ACTIVITY,
  INCIDENTS,
  type Incident,
  type Priority,
} from "../../data/incidents";
import styles from "./Dashboard.module.css";

const PAGE_SIZE = 4;

function page<T>(items: T[], current: number): T[] {
  const start = (current - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}

function unresolvedCounts(incidents: Incident[]): Record<Priority, number> {
  const counts: Record<Priority, number> = { high: 0, medium: 0, low: 0 };
  for (const incident of incidents) {
    if (incident.status !== "resolved") counts[incident.priority] += 1;
  }
  return counts;
}

interface DashboardProps {
  /** Incidents fetched on the server for the first paint. */
  initialIncidents: Incident[];
  /** WebSocket endpoint for the live incident feed. */
  wsUrl: string;
}

export default function Dashboard({ initialIncidents, wsUrl }: DashboardProps) {
  const { incidents, status, lastCreatedId } = useIncidentStream(
    wsUrl,
    initialIncidents,
  );

  // "Assigned to you" still runs on fixture data — not wired to the API yet.
  const assigned = useMemo(
    () => INCIDENTS.filter((i) => i.assignedToMe && i.status !== "resolved"),
    [],
  );

  const unresolved = useMemo(
    () => incidents.filter((i) => i.status !== "resolved"),
    [incidents],
  );
  const alertIncident = useMemo(
    () =>
      incidents.find((i) => i.priority === "high" && i.status === "unresolved"),
    [incidents],
  );
  const counts = useMemo(() => unresolvedCounts(incidents), [incidents]);

  const [assignedPage, setAssignedPage] = useState(1);
  const [unresolvedPage, setUnresolvedPage] = useState(1);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        meta={
          <>
            <LiveBadge status={status} />
            <span>Shift C</span>
            <span>02:14 JST</span>
          </>
        }
      />

      {alertIncident ? <AlertBanner incident={alertIncident} /> : null}

      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.stats}>
            <StatBlock title="Unresolved incidents">
              <StatBreakdown
                rows={[
                  {
                    tone: "high",
                    count: counts.high,
                    label: "high priority",
                  },
                  {
                    tone: "medium",
                    count: counts.medium,
                    label: "medium priority",
                  },
                  { tone: "low", count: counts.low, label: "low priority" },
                ]}
              />
            </StatBlock>
            <StatBlock title="Assigned to you">
              <StatFigure
                value={assigned.length}
                unit={
                  assigned.length === 1
                    ? "unresolved incident"
                    : "unresolved incidents"
                }
              />
            </StatBlock>
          </div>

          <Panel
            eyebrow="Queue"
            title="Assigned to you"
            flush
            action={
              <Pagination
                page={assignedPage}
                totalPages={pageCount(assigned.length)}
                onChange={setAssignedPage}
                label="assigned incidents"
              />
            }
          >
            <IncidentTable
              caption="Incidents assigned to you"
              incidents={page(assigned, assignedPage)}
              emptyMessage="Nothing is assigned to you right now."
            />
          </Panel>

          <Panel
            eyebrow="Queue"
            title="Unresolved reports"
            flush
            action={
              <Pagination
                page={unresolvedPage}
                totalPages={pageCount(unresolved.length)}
                onChange={setUnresolvedPage}
                label="unresolved reports"
              />
            }
          >
            <IncidentTable
              caption="All unresolved incident reports"
              incidents={page(unresolved, unresolvedPage)}
              highlightId={lastCreatedId}
              emptyMessage="No unresolved reports."
            />
          </Panel>
        </div>

        <aside className={styles.aside}>
          <Panel eyebrow="Live" title="Latest activity" flush>
            <ActivityFeed events={DASHBOARD_ACTIVITY} />
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}
