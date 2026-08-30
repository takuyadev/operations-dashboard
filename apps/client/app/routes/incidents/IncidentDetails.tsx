import type { Route } from "./+types/IncidentsDetails";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Incidents Details" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function IncidentsDetails() {
  return <div>Incidents Details</div>;
}
