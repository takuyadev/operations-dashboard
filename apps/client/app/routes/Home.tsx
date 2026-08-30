import type { Route } from "./+types/Home";
import Dashboard from "@components/Dashboard/Dashboard";
import { listIncidents, PUBLIC_WS_URL } from "../lib/api.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard · Road Operations" },
    {
      name: "description",
      content:
        "Live road-incident monitoring: unresolved reports, your queue, and latest activity.",
    },
  ];
}

export async function loader() {
  const incidents = await listIncidents();
  return { incidents, wsUrl: PUBLIC_WS_URL };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <Dashboard
      initialIncidents={loaderData.incidents}
      wsUrl={loaderData.wsUrl}
    />
  );
}
