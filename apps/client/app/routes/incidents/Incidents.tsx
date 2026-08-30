import type { Route } from "./+types/Incidents";
import Issues from "@components/Issues/Issues";
import { listIncidents, PUBLIC_WS_URL } from "../../lib/api.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "History · Road Operations" },
    {
      name: "description",
      content: "Searchable, filterable history of every logged road incident.",
    },
  ];
}

export async function loader() {
  const incidents = await listIncidents();
  return { incidents, wsUrl: PUBLIC_WS_URL };
}

export default function Incidents({ loaderData }: Route.ComponentProps) {
  return (
    <Issues
      initialIncidents={loaderData.incidents}
      wsUrl={loaderData.wsUrl}
    />
  );
}
