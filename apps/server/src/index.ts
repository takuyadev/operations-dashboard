/**
 * Entrypoint: create the app, attach the WebSocket feed, listen, and shut down
 * cleanly. All routing lives in `routes/`; all realtime lives in `realtime/`.
 */
import "dotenv/config";
import http from "node:http";

import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";
import { attachWebSocket } from "./realtime/ws.js";

const PORT = Number(process.env.PORT ?? 4000);

const server = http.createServer(createApp());
attachWebSocket(server);

server.listen(PORT, () => {
  console.log(`[server] http  http://localhost:${PORT}`);
  console.log(`[server] ws    ws://localhost:${PORT}/ws`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
