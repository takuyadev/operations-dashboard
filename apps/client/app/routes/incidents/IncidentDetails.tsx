import type { Route } from "./+types/IncidentDetails";
import IssuesDetails from "@components/IssuesDetails/IssuesDetails";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Incident #${params.id} · Road Operations` },
    { name: "description", content: `Assessment and response for incident #${params.id}.` },
  ];
}

export default function IncidentDetails({ params }: Route.ComponentProps) {
  return <IssuesDetails id={params.id} />;
}
