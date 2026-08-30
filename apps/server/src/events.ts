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

// Routes publish here; the WebSocket layer (src/ws.ts) subscribes and fans out.
const bus = new EventEmitter();

export function publish(event: ServerEvent): void {
  bus.emit("event", event);
}

export function onEvent(listener: (event: ServerEvent) => void): () => void {
  bus.on("event", listener);
  return () => bus.off("event", listener);
}
