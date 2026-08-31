/**
 * Builds the Express app: middleware, the `/api` router tree, and JSON error
 * handling. Kept separate from `index.ts` so it can be imported by tests
 * without opening a port.
 */
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { ApiError } from "./lib/http.js";
import { api, endpointCatalog } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      name: "operations-dashboard-server",
      status: "ok",
      websocket: "/ws",
      endpoints: endpointCatalog,
    });
  });

  app.use("/api", api);

  // Unmatched route.
  app.use((req, res) => {
    res.status(404).json({ error: "Not found", path: req.originalUrl });
  });

  // Central error handler. ApiError (and body-parser errors, which carry a
  // `status`) become `{ error }` with that status; anything else is a 500.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const carried =
      typeof (err as { status?: number; statusCode?: number })?.status ===
      "number"
        ? (err as { status: number }).status
        : typeof (err as { statusCode?: number })?.statusCode === "number"
          ? (err as { statusCode: number }).statusCode
          : undefined;

    const status = err instanceof ApiError ? err.status : (carried ?? 500);

    if (status >= 500) {
      console.error(err);
    }
    res.status(status).json({
      error:
        status >= 500
          ? "Internal server error"
          : ((err as Error).message ?? "Request failed"),
    });
  });

  return app;
}
