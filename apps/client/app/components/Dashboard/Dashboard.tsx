import { useMemo, useState } from "react";

import { AppShell } from "@components/AppShell/AppShell";
import { PageHeader } from "@components/PageHeader/PageHeader";
import { Panel } from "@components/Panel/Panel";
import { Pagination } from "@components/Pagination/Pagination";
import { IncidentTable } from "@components/IncidentTable/IncidentTable";
import { ActivityFeed } from "@components/ActivityFeed/ActivityFeed";
import { AlertBanner } from "@components/AlertBanner/AlertBanner";
import { LiveBadge } from "@components/LiveBadge/LiveBadge";
import { useIncidentStream } from "../../hooks/useIncidentStream";
import { DASHBOARD_ACTIVITY, type Incident } from "../../data/incidents";
import styles from "./Dashboard.module.css";

const PAGE_SIZE = 8;

function page<T>(items: T[], current: number): T[] {
  const start = (current - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
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

  const unresolved = useMemo(
    () => incidents.filter((i) => i.status !== "resolved"),
    [incidents],
  );
  const alertIncident = useMemo(
    () =>
      incidents.find((i) => i.priority === "high" && i.status === "unresolved"),
    [incidents],
  );

  const [queuePage, setQueuePage] = useState(1);
  const totalPages = pageCount(unresolved.length);
  const current = Math.min(queuePage, totalPages);

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
          <Panel
            title="Unresolved incidents"
            flush
            action={
              <Pagination
                page={current}
                totalPages={totalPages}
                onChange={setQueuePage}
                label="unresolved incidents"
              />
            }
          >
            <IncidentTable
              caption="Unresolved incidents"
              incidents={page(unresolved, current)}
              highlightId={lastCreatedId}
              emptyMessage="No unresolved incidents."
            />
          </Panel>
        </div>

        <aside className={styles.aside}>
          <Panel title="Latest activity" flush>
            <ActivityFeed events={DASHBOARD_ACTIVITY} />
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}
