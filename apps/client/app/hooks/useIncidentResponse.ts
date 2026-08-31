import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

import { CURRENT_USER_ID } from "../lib/user";
import type { ActivityEvent, Incident } from "../data/incidents";

type IncidentDetail = Incident & { activity: ActivityEvent[] };

/** Shape returned by the IncidentDetails route action. */
export type ResponseResult =
  | { ok: true; intent: string }
  | { ok: false; error: string };

/**
 * Drives the operator response forms on the incident detail route. Incident data
 * itself is server-owned (the route loader revalidates after each submit); this
 * only tracks the in-flight submission and the local message draft, clearing the
 * draft once a posted message has landed.
 */
export function useIncidentResponse(incident: IncidentDetail) {
  const fetcher = useFetcher<ResponseResult>();
  const [message, setMessage] = useState("");

  const sending = fetcher.state !== "idle";
  const pendingIntent = fetcher.formData?.get("intent") ?? null;
  const mine = incident.assignee === CURRENT_USER_ID;
  const isResolved = incident.status === "resolved";
  const error =
    fetcher.data && fetcher.data.ok === false ? fetcher.data.error : undefined;

  // Clear the message box once a posted message has landed.
  const seenData = useRef(fetcher.data);
  useEffect(() => {
    if (fetcher.state !== "idle" || fetcher.data === seenData.current) return;
    seenData.current = fetcher.data;
    if (fetcher.data?.ok && fetcher.data.intent === "message") setMessage("");
  }, [fetcher.state, fetcher.data]);

  return {
    fetcher,
    message,
    setMessage,
    sending,
    pendingIntent,
    mine,
    isResolved,
    error,
  };
}
