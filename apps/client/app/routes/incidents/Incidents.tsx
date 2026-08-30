import type { Route } from "./+types/Incidents";
import Issues from "@components/Issues/Issues";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "History · Road Operations" },
    {
      name: "description",
      content: "Searchable, filterable history of every logged road incident.",
    },
  ];
}

export default function Incidents() {
  return <Issues />;
}
