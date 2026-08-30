import type { Route } from "./+types/Home";
import Dashboard from "@components/Dashboard/Dashboard";

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

export default function Home() {
  return <Dashboard />;
}
