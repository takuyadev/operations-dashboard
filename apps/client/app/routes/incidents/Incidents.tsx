import type { Route } from "./+types/Incidents";
import { AppShell } from "@components/AppShell/AppShell";
import { PageHeader } from "@components/PageHeader/PageHeader";
import { Panel } from "@components/Panel/Panel";
import { Pagination } from "@components/Pagination/Pagination";
import { IncidentTable } from "@components/IncidentTable/IncidentTable";
import { SearchField } from "@components/SearchField/SearchField";
import { FilterPanel } from "@components/FilterPanel/FilterPanel";
import { LiveBadge } from "@components/LiveBadge/LiveBadge";
import { useIncidentHistory } from "../../hooks/useIncidentHistory";
import { listIncidents, PUBLIC_WS_URL } from "../../lib/api.server";
import styles from "./Incidents.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "History · Road Operations" },
    {
      name: "description",
      content: "Searchable, filterable history of every logged road incident.",
    },
  ];
}

export async function loader() {
  const incidents = await listIncidents();
  return { incidents, wsUrl: PUBLIC_WS_URL };
}

export default function Incidents({ loaderData }: Route.ComponentProps) {
  const {
    status,
    lastCreatedId,
    query,
    search,
    applyFilters,
    clearFilters,
    page,
    totalPages,
    setPage,
    shown,
    resultCount,
  } = useIncidentHistory({
    initialIncidents: loaderData.incidents,
    wsUrl: loaderData.wsUrl,
  });

  return (
    <AppShell>
      <PageHeader title="History" meta={<LiveBadge status={status} />} />

      <div className={styles.layout}>
        <Panel title="All incidents" flush>
          <div className={styles.toolbar}>
            <div className={styles.search}>
              <SearchField
                label="Search history by incident ID"
                placeholder="Search by incident ID"
                value={query}
                onChange={search}
              />
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              label="history"
            />
          </div>
          <p className={styles.count}>
            {resultCount} {resultCount === 1 ? "incident" : "incidents"}
          </p>
          <IncidentTable
            caption="Incident history"
            incidents={shown}
            highlightId={lastCreatedId}
            emptyMessage="No incidents match your search and filters."
          />
        </Panel>

        <Panel title="Filter">
          <FilterPanel onApply={applyFilters} onClear={clearFilters} />
        </Panel>
      </div>
    </AppShell>
  );
}
