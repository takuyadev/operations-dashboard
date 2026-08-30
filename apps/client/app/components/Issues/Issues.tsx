import { useMemo, useState } from "react";

import { AppShell } from "@components/AppShell/AppShell";
import { PageHeader } from "@components/PageHeader/PageHeader";
import { Panel } from "@components/Panel/Panel";
import { Pagination } from "@components/Pagination/Pagination";
import { IncidentTable } from "@components/IncidentTable/IncidentTable";
import { SearchField } from "@components/SearchField/SearchField";
import {
  FilterPanel,
  EMPTY_FILTERS,
  type IncidentFilters,
} from "@components/FilterPanel/FilterPanel";
import { LiveBadge } from "@components/LiveBadge/LiveBadge";
import { useIncidentStream } from "../../hooks/useIncidentStream";
import type { Incident } from "../../data/incidents";
import styles from "./Issues.module.css";

const PAGE_SIZE = 8;

interface IssuesProps {
  /** Incidents fetched on the server for the first paint. */
  initialIncidents: Incident[];
  /** WebSocket endpoint for the live incident feed. */
  wsUrl: string;
}

export default function Issues({ initialIncidents, wsUrl }: IssuesProps) {
  const { incidents, status, lastCreatedId } = useIncidentStream(
    wsUrl,
    initialIncidents,
  );

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<IncidentFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const results = useMemo(() => {
    const trimmed = query.trim();
    return incidents.filter((incident) => {
      if (trimmed && !String(incident.id).includes(trimmed)) return false;
      if (
        filters.priorities.length > 0 &&
        !filters.priorities.includes(incident.priority)
      ) {
        return false;
      }
      const year = Number(incident.reportedAt.slice(0, 4));
      if (filters.yearFrom && year < Number(filters.yearFrom)) return false;
      if (filters.yearTo && year > Number(filters.yearTo)) return false;
      return true;
    });
  }, [query, filters, incidents]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const resetPaging = () => setPage(1);

  return (
    <AppShell>
      <PageHeader title="History" meta={<LiveBadge status={status} />} />

      <div className={styles.layout}>
        <Panel aria-label="Incident history" flush>
          <div className={styles.toolbar}>
            <div className={styles.search}>
              <SearchField
                label="Search history by incident ID"
                placeholder="Search by incident ID"
                value={query}
                onChange={(value) => {
                  setQuery(value);
                  resetPaging();
                }}
              />
            </div>
            <Pagination
              page={current}
              totalPages={totalPages}
              onChange={setPage}
              label="history"
            />
          </div>
          <p className={styles.count}>
            {results.length} {results.length === 1 ? "incident" : "incidents"}
          </p>
          <IncidentTable
            caption="Incident history"
            incidents={shown}
            highlightId={lastCreatedId}
            emptyMessage="No incidents match your search and filters."
          />
        </Panel>

        <Panel eyebrow="Refine" title="Filter">
          <FilterPanel
            onApply={(next) => {
              setFilters(next);
              resetPaging();
            }}
            onClear={() => {
              setFilters(EMPTY_FILTERS);
              resetPaging();
            }}
          />
        </Panel>
      </div>
    </AppShell>
  );
}
