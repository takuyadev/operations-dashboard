import { EventEmitter } from "node:events";

/** A message pushed to every connected WebSocket client. */
export interface ServerEvent {
  type:
    | "incident:created"
    | "incident:updated"
    | "incident:deleted"
    | "activity:created";
  data: unknown;
}

// Services publish here; the realtime layer (src/realtime/ws.ts) subscribes and fans out.
const bus = new EventEmitter();

/**
 * Broadcast a domain event to all WebSocket clients.
 *
 * @example
 * publish({ type: "incident:created", data: incident });
 */
export function publish(event: ServerEvent): void {
  bus.emit("event", event);
}

/** Subscribe to every published event. Returns an unsubscribe function. */
export function onEvent(listener: (event: ServerEvent) => void): () => void {
  bus.on("event", listener);
  return () => bus.off("event", listener);
}
