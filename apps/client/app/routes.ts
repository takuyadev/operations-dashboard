import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/Home.tsx"),
  route("simulate", "routes/Simulate.tsx"),
  route("incidents", "routes/incidents/Incidents.tsx"),
  route("incidents/:id", "routes/incidents/IncidentDetails.tsx"),
] satisfies RouteConfig;
