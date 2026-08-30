import { Form, Link, useNavigation } from "react-router";

import type { Route } from "./+types/Simulate";
import { AppShell } from "@components/AppShell/AppShell";
import { PageHeader } from "@components/PageHeader/PageHeader";
import { Panel } from "@components/Panel/Panel";
import { Button } from "@components/Button/Button";
import { createSimulatedIncident } from "../lib/api.server";
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

export async function action() {
  const incident = await createSimulatedIncident();
  return { incident };
}

export default function Simulate({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";
  const created = actionData?.incident;

  return (
    <AppShell>
      <PageHeader title="Simulate an incident" />

      <Panel eyebrow="Proof of concept" title="Emit a new incident">
        <div className={styles.wrap}>
          <p className={styles.lede}>
            Pressing the button posts a new incident to the API. The server
            writes it to Postgres and broadcasts it over the WebSocket, so it
            appears on every open{" "}
            <Link className={styles.link} to="/incidents">
              History
            </Link>{" "}
            page within a second — no refresh.
          </p>

          <Form method="post">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon="alert"
              disabled={busy}
            >
              {busy ? "Creating incident…" : "Create incident"}
            </Button>
          </Form>

          {created ? (
            <p className={styles.result} role="status">
              Created <strong>{formatIncidentId(created.id)}</strong> ·{" "}
              {PRIORITY_LABEL[created.priority]} priority — {created.summary}.
              Broadcast to all connected clients.
            </p>
          ) : null}
        </div>
      </Panel>
    </AppShell>
  );
}
