import type { Route } from "./+types/Home";
import { AppShell } from "@components/AppShell/AppShell";
import { PageHeader } from "@components/PageHeader/PageHeader";
import { Panel } from "@components/Panel/Panel";
import { IncidentTable } from "@components/IncidentTable/IncidentTable";
import { ActivityFeed } from "@components/ActivityFeed/ActivityFeed";
import { AlertBanner } from "@components/AlertBanner/AlertBanner";
import { LiveBadge } from "@components/LiveBadge/LiveBadge";
import { useDashboardData } from "../hooks/useDashboardData";
import { listActivity, listIncidents, PUBLIC_WS_URL } from "../lib/api.server";
import styles from "./Home.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard · Road Operations" },
    {
      name: "description",
      content:
        "Live road-incident monitoring: the unresolved queue and latest activity.",
    },
  ];
}

export async function loader() {
  const [incidents, activity] = await Promise.all([
    listIncidents(),
    listActivity(),
  ]);
  return { incidents, activity, wsUrl: PUBLIC_WS_URL };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const {
    status,
    activity,
    alertIncident,
    lastCreatedId,
    shown,
    unresolvedCount,
    hasMore,
    sentinelRef,
  } = useDashboardData({
    initialIncidents: loaderData.incidents,
    initialActivity: loaderData.activity,
    wsUrl: loaderData.wsUrl,
  });

  return (
    <AppShell>
      <PageHeader title="Dashboard" meta={<LiveBadge status={status} />} />

      {alertIncident ? <AlertBanner incident={alertIncident} /> : null}

      <div className={styles.layout}>
        <div className={styles.main}>
          <Panel title="Unresolved incidents" flush>
            <IncidentTable
              caption="Unresolved incidents"
              incidents={shown}
              highlightId={lastCreatedId}
              emptyMessage="No unresolved incidents."
              showStatus={false}
            />
            {unresolvedCount > 0 ? (
              <p className={styles.queueFoot}>
                Showing {shown.length} of {unresolvedCount}
              </p>
            ) : null}
            {hasMore ? (
              <div
                ref={sentinelRef}
                className={styles.sentinel}
                aria-hidden="true"
              />
            ) : null}
          </Panel>
        </div>

        <aside className={styles.aside}>
          <Panel title="Latest activity" flush className={styles.activityPanel}>
            <ActivityFeed events={activity} />
          </Panel>
        </aside>
      </div>
    </AppShell>
  );
}
