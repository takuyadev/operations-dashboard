import { useEffect, useState } from "react";

import type { ActivityEvent, Incident } from "../data/incidents";

/** Cap on the client-side activity feed so it does not grow without bound. */
const ACTIVITY_LIMIT = 20;

/** Stable default so callers that omit `initialActivity` don't pass a fresh
 *  `[]` every render (which would re-fire the re-sync effect in a loop). */
const NO_ACTIVITY: ActivityEvent[] = [];

export type StreamStatus = "connecting" | "open" | "closed";

interface StreamMessage {
  type:
    | "connected"
    | "incident:created"
    | "incident:updated"
    | "incident:deleted"
    | "activity:created";
  data: unknown;
}

interface IncidentStream {
  /** Server list, kept live: created incidents prepend, updates patch, deletes drop. */
  incidents: Incident[];
  /** Cross-incident activity feed, newest first: `activity:created` events prepend. */
  activity: ActivityEvent[];
  status: StreamStatus;
  /** id of the incident that most recently arrived over the socket (for row highlighting). */
  lastCreatedId: number | null;
}

/**
 * Subscribe to the API's WebSocket feed (apps/server, `/ws`) and fold its
 * events into a live copy of the incident list. Seeded with the server-rendered
 * list so the first paint has data; reconnects automatically if the socket drops.
 */
export function useIncidentStream(
  wsUrl: string,
  initialIncidents: Incident[],
  initialActivity: ActivityEvent[] = NO_ACTIVITY,
): IncidentStream {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [activity, setActivity] = useState(initialActivity);
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [lastCreatedId, setLastCreatedId] = useState<number | null>(null);

  // Re-sync when the server hands us a fresh list (navigation / revalidation).
  useEffect(() => {
    setIncidents(initialIncidents);
  }, [initialIncidents]);

  useEffect(() => {
    setActivity(initialActivity);
  }, [initialActivity]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let socket: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const open = () => {
      setStatus("connecting");
      socket = new WebSocket(wsUrl);

      socket.onopen = () => setStatus("open");

      socket.onclose = () => {
        setStatus("closed");
        if (!disposed) retry = setTimeout(open, 2000);
      };

      socket.onmessage = (event) => {
        let message: StreamMessage;
        try {
          message = JSON.parse(event.data as string);
        } catch {
          return;
        }

        if (message.type === "incident:created") {
          const created = message.data as Incident;
          setIncidents((prev) =>
            prev.some((incident) => incident.id === created.id)
              ? prev
              : [created, ...prev],
          );
          setLastCreatedId(created.id);
        } else if (message.type === "incident:updated") {
          const updated = message.data as Incident;
          setIncidents((prev) =>
            prev.map((incident) =>
              incident.id === updated.id
                ? { ...incident, ...updated }
                : incident,
            ),
          );
        } else if (message.type === "incident:deleted") {
          const { id } = message.data as { id: number };
          setIncidents((prev) => prev.filter((incident) => incident.id !== id));
        } else if (message.type === "activity:created") {
          const created = message.data as ActivityEvent;
          setActivity((prev) =>
            prev.some((event) => event.id === created.id)
              ? prev
              : [created, ...prev].slice(0, ACTIVITY_LIMIT),
          );
        }
      };
    };

    open();

    return () => {
      disposed = true;
      clearTimeout(retry);
      socket?.close();
    };
  }, [wsUrl]);

  return { incidents, activity, status, lastCreatedId };
}
