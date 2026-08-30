import type { Server } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { onEvent, type ServerEvent } from "./events.js";

/**
 * Attach a WebSocket server at `/ws`. Every ServerEvent published by the REST
 * routes is broadcast to all open clients as JSON. Clients may send the string
 * "ping" to keep the connection warm; the server replies "pong".
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
      if (raw.toString() === "ping") socket.send("pong");
    });
  });

  const broadcast = (event: ServerEvent) => {
    const payload = JSON.stringify(event);
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    }
  };

  onEvent(broadcast);

  return wss;
}
