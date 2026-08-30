import type { Route } from "./+types/Incidents";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Incidents" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Incidents() {
  return <div>Incidents</div>;
}
