import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { onEvent, type ServerEvent } from "../lib/events.js";

/**
 * Attach a WebSocket server at `/ws`. Every {@link ServerEvent} published by a
 * service is broadcast to all open clients as JSON. Clients may send the string
 * `"ping"` to keep the connection warm; the server replies `"pong"`.
 *
 * @example
 * // browser
 * const ws = new WebSocket("ws://localhost:4000/ws");
 * ws.onmessage = (e) => {
 *   const { type, data } = JSON.parse(e.data);
 *   if (type === "incident:created") addToList(data);
 * };
 */
export function attachWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket) => {
    socket.send(
      JSON.stringify({
        type: "connected",
        data: { message: "operations-dashboard realtime feed" },
      }),
    );

    socket.on("message", (raw) => {
      if (raw.toString() === "ping") {
        socket.send("pong");
      }
    });
  });

  const broadcast = (event: ServerEvent) => {
    const payload = JSON.stringify(event);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  };

  onEvent(broadcast);

  return wss;
}
