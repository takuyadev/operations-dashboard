import { useEffect, useMemo, useState } from "react";

import { useIncidentStream } from "./useIncidentStream";
import type { ActivityEvent, Incident } from "../data/incidents";

/** Rows revealed per step as the unresolved queue is scrolled. */
const SCROLL_STEP = 12;

interface UseDashboardDataParams {
  /** Incidents fetched on the server for the first paint. */
  initialIncidents: Incident[];
  /** Activity feed fetched on the server for the first paint. */
  initialActivity: ActivityEvent[];
  /** WebSocket endpoint for the live incident feed. */
  wsUrl: string;
}

/**
 * Everything the dashboard route needs: the live incident stream folded into the
 * unresolved queue, the current high-priority alert, and an infinite-scroll
 * window over the queue driven by an IntersectionObserver on a sentinel node.
 */
export function useDashboardData({
  initialIncidents,
  initialActivity,
  wsUrl,
}: UseDashboardDataParams) {
  const { incidents, activity, status, lastCreatedId } = useIncidentStream(
    wsUrl,
    initialIncidents,
    initialActivity,
  );

  const unresolved = useMemo(
    () => incidents.filter((incident) => incident.status !== "resolved"),
    [incidents],
  );
  const alertIncident = useMemo(
    () =>
      incidents.find(
        (incident) =>
          incident.priority === "high" && incident.status === "unresolved",
      ),
    [incidents],
  );

  // Infinite scroll: reveal SCROLL_STEP more rows each time the sentinel below
  // the table enters the viewport. The node is held in state (via the returned
  // ref callback) so the observer effect re-subscribes exactly when it mounts /
  // unmounts, keeping setup and teardown one-to-one.
  const [visibleCount, setVisibleCount] = useState(SCROLL_STEP);
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => count + SCROLL_STEP);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel]);

  return {
    status,
    activity,
    alertIncident,
    lastCreatedId,
    /** The slice of the unresolved queue currently revealed. */
    shown: unresolved.slice(0, visibleCount),
    unresolvedCount: unresolved.length,
    hasMore: visibleCount < unresolved.length,
    /** ref callback for the sentinel element below the table. */
    sentinelRef: setSentinel,
  };
}
