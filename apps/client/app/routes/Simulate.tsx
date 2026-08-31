import { Form, Link, useNavigation } from "react-router";

import type { Route } from "./+types/Simulate";
import { AppShell } from "@components/AppShell/AppShell";
import { PageHeader } from "@components/PageHeader/PageHeader";
import { Panel } from "@components/Panel/Panel";
import { Button } from "@components/Button/Button";
import {
  createAssignedIncident,
  createSimulatedIncident,
} from "../lib/api.server";
import { CURRENT_USER } from "../lib/user";
import { formatIncidentId, PRIORITY_LABEL } from "../data/incidents";
import styles from "./Simulate.module.css";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Simulate · Road Operations" },
    {
      name: "description",
      content:
        "Proof-of-concept trigger: create a road incident and push it live to every open History page.",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const assigned = form.get("intent") === "assigned";
  const incident = assigned
    ? await createAssignedIncident()
    : await createSimulatedIncident();
  return { incident, assigned };
}

export default function Simulate({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";
  const pendingIntent = navigation.formData?.get("intent");
  const created = actionData?.incident;

  return (
    <AppShell>
      <PageHeader title="Simulate an incident" />

      <Panel title="Emit a new incident">
        <div className={styles.wrap}>
          <p className={styles.lede}>
            Each button posts a new incident to the API. The server writes it to
            Postgres and broadcasts it over the WebSocket, so it appears on every
            open{" "}
            <Link className={styles.link} to="/incidents">
              History
            </Link>{" "}
            page within a second — no refresh.{" "}
            <strong>Assign one to me</strong> pre-assigns the incident to the
            current operator ({CURRENT_USER.name}), so it also lands in the
            Dashboard&rsquo;s <em>Assigned to you</em> queue.
          </p>

          <Form method="post" className={styles.buttons}>
            <Button
              type="submit"
              name="intent"
              value="unassigned"
              variant="primary"
              size="lg"
              icon="alert"
              disabled={busy}
            >
              {busy && pendingIntent === "unassigned"
                ? "Creating incident…"
                : "Create incident"}
            </Button>
            <Button
              type="submit"
              name="intent"
              value="assigned"
              variant="ghost"
              size="lg"
              icon="user"
              disabled={busy}
            >
              {busy && pendingIntent === "assigned"
                ? "Assigning…"
                : "Assign one to me"}
            </Button>
          </Form>

          {created ? (
            <p className={styles.result} role="status">
              Created <strong>{formatIncidentId(created.id)}</strong> ·{" "}
              {PRIORITY_LABEL[created.priority]} priority — {created.summary}.
              {actionData?.assigned
                ? ` Assigned to ${CURRENT_USER.name} — open the Dashboard to see it in your queue.`
                : " Broadcast to all connected clients."}
            </p>
          ) : null}
        </div>
      </Panel>
    </AppShell>
  );
}
