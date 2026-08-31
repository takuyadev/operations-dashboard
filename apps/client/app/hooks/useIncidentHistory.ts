import { useMemo, useState } from "react";

import {
  EMPTY_FILTERS,
  type IncidentFilters,
} from "@components/FilterPanel/FilterPanel";
import { useIncidentStream } from "./useIncidentStream";
import type { Incident } from "../data/incidents";

const PAGE_SIZE = 8;

interface UseIncidentHistoryParams {
  /** Incidents fetched on the server for the first paint. */
  initialIncidents: Incident[];
  /** WebSocket endpoint for the live incident feed. */
  wsUrl: string;
}

/**
 * State for the history route: the live incident list narrowed by an ID search
 * and the filter panel, then paged. Any change to the query or filters resets
 * to the first page.
 */
export function useIncidentHistory({
  initialIncidents,
  wsUrl,
}: UseIncidentHistoryParams) {
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

  const search = (value: string) => {
    setQuery(value);
    setPage(1);
  };
  const applyFilters = (next: IncidentFilters) => {
    setFilters(next);
    setPage(1);
  };
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  return {
    status,
    lastCreatedId,
    query,
    search,
    applyFilters,
    clearFilters,
    page: current,
    totalPages,
    setPage,
    shown,
    resultCount: results.length,
  };
}
